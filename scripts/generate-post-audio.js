#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const AUDIO_DIR = path.join(BLOG_DIR, 'audio');
const MANIFEST_PATH = path.join(AUDIO_DIR, '.audio-manifest.json');
const DEFAULT_ENGINE = process.env.BLOG_AUDIO_ENGINE || 'neural';
const DEFAULT_VOICE = process.env.BLOG_AUDIO_VOICE || 'Matthew';
const DEFAULT_AWS_PROFILE = process.env.AWS_PROFILE || 'tineo-labs-deploy';
const MAX_INPUT_CHARS = 3000;

async function main() {
  console.log('Generating blog audio...\n');

  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts directory found. Skipping audio generation.');
    return;
  }

  const enabledPosts = getMarkdownFiles()
    .map(parsePost)
    .filter(post => post.audioEnabled);

  if (enabledPosts.length === 0) {
    console.log('No audio-enabled posts found. Skipping audio generation.');
    return;
  }

  const awsPath = findExecutable('aws');
  if (!awsPath) {
    console.log('aws CLI is required to call Polly. Skipping audio generation.');
    return;
  }

  const ffmpegPath = findExecutable('ffmpeg');
  if (!ffmpegPath) {
    console.log('ffmpeg is required to merge audio chunks. Skipping audio generation.');
    return;
  }

  ensureDirectory(AUDIO_DIR);

  const ffprobePath = findExecutable('ffprobe');
  const manifest = loadManifest();
  manifest.posts = manifest.posts || {};

  let generatedCount = 0;
  let skippedCount = 0;

  for (const post of enabledPosts) {
    try {
      const narrationText = buildNarrationScript(post);
      const settingsHash = hashContent(JSON.stringify({
        narrationText,
        engine: DEFAULT_ENGINE,
        voice: post.audioVoice,
      }));

      const outputPath = path.join(AUDIO_DIR, `${post.slug}.mp3`);
      const manifestEntry = manifest.posts[post.slug];
      const shouldSkip = manifestEntry
        && manifestEntry.contentHash === settingsHash
        && fs.existsSync(outputPath);

      if (shouldSkip) {
        console.log(`- Skipping ${post.slug}; audio is unchanged.`);
        skippedCount += 1;
        continue;
      }

      console.log(`- Synthesizing ${post.slug}...`);

      const chunks = chunkNarration(narrationText);
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-audio-'));
      const chunkPaths = [];

      try {
        for (let index = 0; index < chunks.length; index += 1) {
          const chunkPath = path.join(tempDir, `chunk-${String(index + 1).padStart(2, '0')}.mp3`);
          synthesizeChunk(chunks[index], chunkPath, {
            awsPath,
            awsProfile: DEFAULT_AWS_PROFILE,
            engine: DEFAULT_ENGINE,
            voice: post.audioVoice,
            tempDir,
            chunkIndex: index,
          });
          chunkPaths.push(chunkPath);
        }

        mergeChunkFiles(chunkPaths, outputPath, ffmpegPath);

        const durationSeconds = ffprobePath ? getDurationSeconds(outputPath, ffprobePath) : null;
        manifest.posts[post.slug] = {
          title: post.title,
          audioTitle: post.audioTitle,
          url: `/blog/audio/${post.slug}.mp3`,
          durationSeconds,
          contentHash: settingsHash,
          engine: DEFAULT_ENGINE,
          voice: post.audioVoice,
          generatedAt: new Date().toISOString(),
        };
        generatedCount += 1;
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`  Failed to generate audio for ${post.slug}: ${error.message}`);
    }
  }

  manifest.generatedAt = new Date().toISOString();
  saveManifest(manifest);

  console.log(`\nAudio generation complete. Generated ${generatedCount}, skipped ${skippedCount}.`);
}

function getMarkdownFiles() {
  return fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(POSTS_DIR, file));
}

function parsePost(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const filename = path.basename(filePath, '.md');
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');

  return {
    slug,
    title: data.title || 'Untitled',
    subtitle: data.subtitle || '',
    audioEnabled: Boolean(data.audio),
    audioTitle: data.audioTitle || 'Listen to this article',
    audioIntro: data.audioIntro || '',
    audioVoice: data.audioVoice || DEFAULT_VOICE,
    content,
  };
}

function buildNarrationScript(post) {
  const sections = [];

  if (post.audioIntro.trim()) {
    sections.push(cleanSpacing(post.audioIntro));
  }

  sections.push(cleanSpacing(post.title));

  if (post.subtitle.trim()) {
    sections.push(cleanSpacing(post.subtitle));
  }

  sections.push(renderMarkdownForSpeech(post.content));

  const narration = sections
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return narration.replace(/This post is part of[\s\S]*$/i, '').trim();
}

function renderMarkdownForSpeech(markdown) {
  const lines = markdown.split('\n');
  const output = [];
  let inCodeFence = false;
  let announcedCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      if (inCodeFence) {
        announcedCodeBlock = false;
      }
      continue;
    }

    if (inCodeFence) {
      if (!announcedCodeBlock) {
        output.push('Code example omitted in the audio version.');
        announcedCodeBlock = true;
      }
      continue;
    }

    if (!line || /^---+$/.test(line)) {
      output.push('');
      continue;
    }

    if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(line)) {
      continue;
    }

    if (/^\|.+\|$/.test(line)) {
      const cells = line
        .split('|')
        .map(cell => cleanInlineMarkdown(cell))
        .filter(Boolean);

      if (cells.length > 0) {
        output.push(cells.join('. '));
      }
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      output.push(cleanInlineMarkdown(line.replace(/^#{1,6}\s+/, '')));
      output.push('');
      continue;
    }

    if (/^>\s?/.test(line)) {
      output.push(cleanInlineMarkdown(line.replace(/^>\s?/, '')));
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      output.push(`Bullet: ${cleanInlineMarkdown(line.replace(/^[-*+]\s+/, ''))}`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      output.push(`Point ${match[1]}: ${cleanInlineMarkdown(match[2])}`);
      continue;
    }

    output.push(cleanInlineMarkdown(line));
  }

  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanInlineMarkdown(text) {
  return cleanSpacing(
    text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
      .replace(/(?<!_)_([^_]+)_(?!_)/g, '$1')
      .replace(/<br\s*\/?>/gi, ', ')
      .replace(/&amp;/g, 'and')
      .replace(/&lt;/g, 'less than')
      .replace(/&gt;/g, 'greater than')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  );
}

function cleanSpacing(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .trim();
}

function chunkNarration(text) {
  const paragraphs = text.split(/\n{2,}/).map(paragraph => paragraph.trim()).filter(Boolean);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const nextChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    if (nextChunk.length <= MAX_INPUT_CHARS) {
      currentChunk = nextChunk;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    const splitParagraphs = splitLongParagraph(paragraph);
    currentChunk = splitParagraphs.pop() || '';
    chunks.push(...splitParagraphs);
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitLongParagraph(paragraph) {
  if (paragraph.length <= MAX_INPUT_CHARS) {
    return [paragraph];
  }

  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const nextChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    if (nextChunk.length <= MAX_INPUT_CHARS) {
      currentChunk = nextChunk;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (sentence.length > MAX_INPUT_CHARS) {
      chunks.push(...splitVeryLongSentence(sentence));
      currentChunk = '';
    } else {
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitVeryLongSentence(sentence) {
  const words = sentence.split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    const nextChunk = currentChunk ? `${currentChunk} ${word}` : word;
    if (nextChunk.length <= MAX_INPUT_CHARS) {
      currentChunk = nextChunk;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }
    currentChunk = word;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function synthesizeChunk(input, outputPath, options) {
  const textFilePath = path.join(
    options.tempDir,
    `chunk-${String(options.chunkIndex + 1).padStart(2, '0')}.txt`,
  );
  fs.writeFileSync(textFilePath, input, 'utf-8');

  const args = [
    'polly', 'synthesize-speech',
    '--engine', options.engine,
    '--voice-id', options.voice,
    '--output-format', 'mp3',
    '--text-type', 'text',
    '--text', `file://${textFilePath}`,
    outputPath,
  ];

  try {
    execFileSync(options.awsPath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, AWS_PROFILE: options.awsProfile },
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    throw new Error(`Polly synthesize-speech failed: ${stderr || error.message}`);
  }
}

function mergeChunkFiles(chunkPaths, outputPath, ffmpegPath) {
  if (chunkPaths.length === 1) {
    fs.copyFileSync(chunkPaths[0], outputPath);
    return;
  }

  const concatList = chunkPaths
    .map(filePath => `file '${filePath.replace(/'/g, "'\\''")}'`)
    .join('\n');
  const tempListPath = path.join(path.dirname(chunkPaths[0]), 'concat.txt');
  fs.writeFileSync(tempListPath, concatList);

  execFileSync(ffmpegPath, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', tempListPath,
    '-c', 'copy',
    outputPath,
  ], {
    stdio: 'ignore',
  });
}

function getDurationSeconds(filePath, ffprobePath) {
  const output = execFileSync(ffprobePath, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], {
    encoding: 'utf-8',
  }).trim();

  const duration = Number.parseFloat(output);
  return Number.isFinite(duration) ? Math.round(duration) : null;
}

function findExecutable(name) {
  const locations = process.env.PATH.split(path.delimiter);
  for (const location of locations) {
    const fullPath = path.join(location, name);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function hashContent(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { posts: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch (error) {
    console.warn(`Could not read audio manifest: ${error.message}`);
    return { posts: {} };
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function ensureDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
