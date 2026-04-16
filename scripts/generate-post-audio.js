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
const DEFAULT_PIPER_MODEL = process.env.BLOG_PIPER_MODEL || 'en_US-lessac-medium';
const PIPER_SAMPLE_RATE = 22050;

/**
 * Determine the TTS backend to use.
 * Priority: BLOG_AUDIO_BACKEND env var > state.json config > 'polly' fallback.
 */
function getAudioBackend() {
  const envBackend = process.env.BLOG_AUDIO_BACKEND;
  if (envBackend) return envBackend;

  const stateFile = path.join(__dirname, '..', 'pipeline', 'state.json');
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    return state.config?.tts_backend || 'polly';
  } catch {
    return 'polly';
  }
}

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

  // Determine TTS backend
  let backend = getAudioBackend();
  console.log(`TTS backend: ${backend}`);

  // Validate backend-specific dependencies
  let awsPath = null;
  let piperPath = null;

  if (backend === 'piper') {
    piperPath = findExecutable('piper');
    if (!piperPath) {
      console.log('piper CLI not found. Install with: brew install piper');
      console.log('Falling back to polly backend.');
      backend = 'polly';
    }
  }

  if (backend === 'polly') {
    awsPath = findExecutable('aws');
    if (!awsPath) {
      console.log('aws CLI is required to call Polly. Skipping audio generation.');
      return;
    }
  }

  const ffmpegPath = findExecutable('ffmpeg');
  if (!ffmpegPath) {
    console.log('ffmpeg is required for audio processing. Skipping audio generation.');
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
        backend,
        engine: backend === 'polly' ? DEFAULT_ENGINE : 'piper',
        voice: backend === 'polly' ? post.audioVoice : DEFAULT_PIPER_MODEL,
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

      console.log(`- Synthesizing ${post.slug} (${backend})...`);

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-audio-'));

      try {
        if (backend === 'piper') {
          synthesizeWithPiper(narrationText, outputPath, {
            piperPath,
            ffmpegPath,
            model: DEFAULT_PIPER_MODEL,
            tempDir,
          });
        } else {
          // Polly: chunk and synthesize
          const chunks = chunkNarration(narrationText);
          const chunkPaths = [];

          for (let index = 0; index < chunks.length; index += 1) {
            const chunkPath = path.join(tempDir, `chunk-${String(index + 1).padStart(2, '0')}.mp3`);
            synthesizeWithPolly(chunks[index], chunkPath, {
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
        }

        const durationSeconds = ffprobePath ? getDurationSeconds(outputPath, ffprobePath) : null;
        manifest.posts[post.slug] = {
          title: post.title,
          audioTitle: post.audioTitle,
          url: `/blog/audio/${post.slug}.mp3`,
          durationSeconds,
          contentHash: settingsHash,
          backend,
          engine: backend === 'polly' ? DEFAULT_ENGINE : 'piper',
          voice: backend === 'polly' ? post.audioVoice : DEFAULT_PIPER_MODEL,
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

/**
 * Synthesize audio using AWS Polly (chunked).
 * This is the original synthesizeChunk logic, renamed for clarity.
 */
function synthesizeWithPolly(input, outputPath, options) {
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

/**
 * Synthesize audio using Piper TTS.
 * Piper handles long text natively, so no chunking is needed.
 * Pipes raw PCM output through ffmpeg to produce MP3.
 */
function synthesizeWithPiper(narrationText, outputPath, options) {
  const inputFile = path.join(options.tempDir, 'narration.txt');
  fs.writeFileSync(inputFile, narrationText, 'utf-8');

  // Piper outputs raw 16-bit signed PCM; pipe through ffmpeg to encode MP3
  try {
    execFileSync(options.ffmpegPath, [
      '-y',
      '-f', 's16le',
      '-ar', String(PIPER_SAMPLE_RATE),
      '-ac', '1',
      '-i', 'pipe:0',
      '-codec:a', 'libmp3lame',
      '-q:a', '2',
      outputPath,
    ], {
      input: execFileSync(options.piperPath, [
        '--model', options.model,
        '--output_raw',
      ], {
        input: fs.readFileSync(inputFile),
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 100 * 1024 * 1024, // 100 MB for long narrations
      }),
      stdio: ['pipe', 'ignore', 'pipe'],
      maxBuffer: 100 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    throw new Error(`Piper synthesis failed: ${stderr || error.message}`);
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
