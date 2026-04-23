#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// ─── Illustration Library ────────────────────────────────────────────────────
// Inline SVG illustrations: ink-drawing style, ~80x80 viewBox, stroke-based.

function getIllustration(name) {
  const illustrations = {
    compass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="40" cy="40" r="28"/>
  <circle cx="40" cy="40" r="4"/>
  <!-- Cardinal marks -->
  <line x1="40" y1="12" x2="40" y2="18"/>
  <line x1="40" y1="62" x2="40" y2="68"/>
  <line x1="12" y1="40" x2="18" y2="40"/>
  <line x1="62" y1="40" x2="68" y2="40"/>
  <!-- N label -->
  <text x="37" y="10" font-size="7" stroke-width="1.2" fill="#1A1A1A" font-family="Georgia,serif">N</text>
  <!-- Needle north (dark) -->
  <polygon points="40,20 37,40 40,36 43,40" fill="#1A1A1A" stroke="none"/>
  <!-- Needle south (light) -->
  <polygon points="40,60 37,40 40,44 43,40" fill="none" stroke="#1A1A1A" stroke-width="2"/>
</svg>`,

    campfire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Logs -->
  <line x1="18" y1="58" x2="52" y2="50"/>
  <line x1="28" y1="58" x2="62" y2="50"/>
  <!-- Log ends -->
  <ellipse cx="18" cy="58" rx="4" ry="3" transform="rotate(-15 18 58)"/>
  <ellipse cx="62" cy="50" rx="4" ry="3" transform="rotate(-15 62 50)"/>
  <!-- Ground glow arc -->
  <path d="M22 60 Q40 66 58 60"/>
  <!-- Flames -->
  <path d="M40 50 C38 44 33 40 36 32 C37 36 41 34 40 28 C44 33 47 30 45 36 C48 33 50 36 48 42 C46 38 43 40 44 46 Z"/>
  <path d="M36 50 C34 46 30 44 32 38 C34 42 37 40 36 36 C39 40 40 38 38 44 Z" stroke-width="1.5"/>
</svg>`,

    binoculars: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Left barrel -->
  <rect x="10" y="32" width="22" height="28" rx="10"/>
  <circle cx="21" cy="52" r="7"/>
  <circle cx="21" cy="52" r="3"/>
  <!-- Right barrel -->
  <rect x="48" y="32" width="22" height="28" rx="10"/>
  <circle cx="59" cy="52" r="7"/>
  <circle cx="59" cy="52" r="3"/>
  <!-- Bridge -->
  <path d="M32 38 Q40 34 48 38"/>
  <!-- Eye cups top -->
  <rect x="12" y="28" width="18" height="8" rx="4"/>
  <rect x="50" y="28" width="18" height="8" rx="4"/>
  <!-- Strap hint -->
  <line x1="15" y1="28" x2="12" y2="22"/>
  <line x1="65" y1="28" x2="68" y2="22"/>
</svg>`,

    axe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Handle -->
  <line x1="55" y1="20" x2="25" y2="65"/>
  <!-- Head top edge -->
  <path d="M55 20 C62 14 68 20 64 30 L52 36 Z"/>
  <!-- Head back curve -->
  <path d="M55 20 L52 36"/>
  <!-- Grain on handle -->
  <line x1="48" y1="30" x2="44" y2="36"/>
  <line x1="42" y1="40" x2="38" y2="46"/>
  <line x1="36" y1="50" x2="32" y2="56"/>
</svg>`,

    map: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Map body with fold lines -->
  <path d="M12 18 L32 14 L48 18 L68 14 L68 62 L48 66 L32 62 L12 66 Z"/>
  <!-- Fold creases -->
  <line x1="32" y1="14" x2="32" y2="62"/>
  <line x1="48" y1="18" x2="48" y2="66"/>
  <line x1="12" y1="40" x2="68" y2="40"/>
  <!-- X mark -->
  <line x1="52" y1="28" x2="60" y2="36"/>
  <line x1="60" y1="28" x2="52" y2="36"/>
  <!-- Route line -->
  <path d="M20 52 Q24 46 30 50 Q36 54 40 48" stroke-width="1.5"/>
  <!-- Start dot -->
  <circle cx="20" cy="52" r="2" fill="#1A1A1A" stroke="none"/>
</svg>`,

    lantern: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Top cap -->
  <path d="M32 18 L48 18 L52 26 L28 26 Z"/>
  <!-- Handle arc -->
  <path d="M34 18 Q40 10 46 18"/>
  <!-- Body -->
  <rect x="26" y="26" width="28" height="34" rx="4"/>
  <!-- Glass panels (vertical lines) -->
  <line x1="34" y1="26" x2="34" y2="60"/>
  <line x1="40" y1="26" x2="40" y2="60"/>
  <line x1="46" y1="26" x2="46" y2="60"/>
  <!-- Base -->
  <path d="M24 60 L56 60 L54 68 L26 68 Z"/>
  <!-- Flame -->
  <path d="M40 44 C38 40 36 37 38 33 C39 36 41 35 40 31 C43 35 44 33 43 38 C45 35 46 38 44 42 C43 39 41 40 42 44 Z" stroke-width="1.5"/>
</svg>`,

    tent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Main tent body -->
  <path d="M8 62 L40 14 L72 62 Z"/>
  <!-- Inner door triangle -->
  <path d="M30 62 L40 38 L50 62 Z"/>
  <!-- Ridge line -->
  <line x1="40" y1="14" x2="40" y2="8"/>
  <!-- Stake left -->
  <line x1="8" y1="62" x2="4" y2="70"/>
  <!-- Stake right -->
  <line x1="72" y1="62" x2="76" y2="70"/>
  <!-- Guy line left -->
  <line x1="40" y1="8" x2="4" y2="70"/>
  <!-- Guy line right -->
  <line x1="40" y1="8" x2="76" y2="70"/>
  <!-- Ground line -->
  <line x1="4" y1="62" x2="76" y2="62"/>
</svg>`,

    'bear-paw': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Main pad -->
  <ellipse cx="40" cy="52" rx="18" ry="16"/>
  <!-- Toe pads -->
  <ellipse cx="24" cy="34" rx="6" ry="7" transform="rotate(-15 24 34)"/>
  <ellipse cx="34" cy="28" rx="6" ry="7"/>
  <ellipse cx="46" cy="28" rx="6" ry="7"/>
  <ellipse cx="56" cy="34" rx="6" ry="7" transform="rotate(15 56 34)"/>
  <!-- Claw marks -->
  <line x1="22" y1="27" x2="20" y2="20"/>
  <line x1="32" y1="21" x2="31" y2="14"/>
  <line x1="44" y1="21" x2="45" y2="14"/>
  <line x1="54" y1="27" x2="57" y2="20"/>
</svg>`,

    handshake: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="64" height="64" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Left arm -->
  <path d="M8 38 L22 38"/>
  <!-- Right arm -->
  <path d="M58 38 L72 38"/>
  <!-- Left hand fingers -->
  <path d="M22 38 L30 34 L38 38 L46 34"/>
  <!-- Right hand fingers -->
  <path d="M58 38 L50 34 L46 34"/>
  <!-- Clasp (the grip) -->
  <path d="M34 32 Q40 26 46 32"/>
  <path d="M32 40 Q40 46 48 40"/>
  <!-- Wrist cuffs -->
  <rect x="6" y="34" width="16" height="8" rx="2"/>
  <rect x="58" y="34" width="16" height="8" rx="2"/>
  <!-- Motion lines -->
  <line x1="36" y1="22" x2="38" y2="18"/>
  <line x1="40" y1="20" x2="40" y2="16"/>
  <line x1="44" y1="22" x2="42" y2="18"/>
</svg>`,
  };

  return illustrations[name] || illustrations['bear-paw'];
}

function selectIllustration(post) {
  if (post.illustration && post.illustration.trim()) {
    return post.illustration.trim();
  }
  console.warn(`  ⚠ No illustration set for "${post.title}" — add illustration: "name" to frontmatter. Using bear-paw fallback.`);
  return 'bear-paw';
}

// ─── Paths ───────────────────────────────────────────────────────────────────
// BLOG_DIR can be overridden via env var BEAR_BLOG_DIR (used by the preview
// command to build a draft into an isolated directory without touching the
// real blog/ dir that ships to production).

const BLOG_DIR = process.env.BEAR_BLOG_DIR
  ? path.resolve(process.env.BEAR_BLOG_DIR)
  : path.join(__dirname, '..', 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const GENERATED_DIR = path.join(BLOG_DIR, 'generated');
const AUDIO_DIR = path.join(BLOG_DIR, 'audio');
const AUDIO_MANIFEST = path.join(AUDIO_DIR, '.audio-manifest.json');
const POSTS_JSON = path.join(BLOG_DIR, 'posts.json');

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) {
  console.log('No posts directory found. Creating...');
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Read all markdown files from posts directory
function getMarkdownFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }
  return fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(POSTS_DIR, file));
}

// Parse markdown file and extract metadata
function parsePost(filePath, audioManifest) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  // Get filename for URL slug
  const filename = path.basename(filePath, '.md');
  // Remove date prefix if exists (e.g., "2025-01-15-title" -> "title")
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const audioEnabled = Boolean(data.audio);
  const audioMetadata = resolveAudioMetadata({
    slug,
    audioEnabled,
    audioTitle: data.audioTitle || 'Listen to this article',
    rawContent: content,
    audioManifest,
  });

  return {
    slug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString().split('T')[0],
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    subtitle: data.subtitle || '',
    category: data.category || '',
    illustration: data.illustration || '',
    audioEnabled,
    audio: audioMetadata,
    content: marked(content),
    rawContent: content,
  };
}

// Generate HTML page for a single post
function generatePostPage(post) {
  const readingTime = estimateReadTime(post.rawContent);
  const formattedDate = formatDate(post.date);

  // Auto-split title on " — " (em dash) if subtitle not already set in frontmatter
  let displayTitle = post.title;
  let displaySubtitle = post.subtitle;
  if (!displaySubtitle && post.title.includes(' \u2014 ')) {
    const parts = post.title.split(' \u2014 ');
    displayTitle = parts[0].trim();
    displaySubtitle = parts.slice(1).join(' \u2014 ').trim();
  }

  const illustrationName = selectIllustration(post);
  const illustrationSVG = getIllustration(illustrationName);

  const audioWidget = post.audio
    ? renderAudioWidget({ audio: post.audio })
    : '';
  const stickyAudioWidget = post.audio
    ? renderAudioSticky({ audio: post.audio, postTitle: displayTitle })
    : '';

  const tagsHTML = post.tags.length > 0
    ? `<div class="blog-post-tags">
          ${post.tags.map(tag => `<span class="blog-post-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>`
    : '';

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(post.excerpt)}">
    <meta name="author" content="Miguel Tineo">

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://miketineo.com/blog/${post.slug}.html">
    <meta property="og:title" content="${escapeHtml(post.title)}">
    <meta property="og:description" content="${escapeHtml(post.excerpt)}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(post.title)}">
    <meta name="twitter:description" content="${escapeHtml(post.excerpt)}">

    <title>${escapeHtml(post.title)} - Miguel Tineo</title>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/components.css">

    <!-- Theme must load before page renders to prevent flash -->
    <script src="/js/theme.js"></script>

    <!-- Cookie Consent & Analytics (PostHog) -->
    <script src="/js/cookie-consent.js" defer></script>

    <style>
        .blog-post {
            max-width: 1000px;
            margin: 0 auto;
            padding: var(--spacing-2xl) var(--spacing-lg);
        }
        .blog-post-back {
            margin-bottom: var(--spacing-xl);
        }

        /* ── Hero ── */
        .blog-post-hero {
            display: flex;
            gap: 64px;
            align-items: flex-start;
            margin-bottom: 64px;
        }
        .blog-post-hero-main {
            flex: 1;
            min-width: 0;
        }
        .blog-post-illustration {
            width: 120px;
            height: 120px;
            background: #FF8A5B;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 32px;
            flex-shrink: 0;
        }
        @media (prefers-color-scheme: dark) {
            .blog-post-illustration {
                background: #E56D42;
            }
        }
        [data-theme="dark"] .blog-post-illustration {
            background: #E56D42;
        }
        .blog-post-title {
            font-size: 39px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: var(--spacing-md);
            color: var(--color-text-primary);
        }
        .blog-post-subtitle {
            font-size: 25px;
            font-weight: 400;
            color: var(--color-text-secondary);
            margin-top: 8px;
            margin-bottom: var(--spacing-lg);
            line-height: 1.3;
        }
        .blog-post-tags {
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;
            margin-top: var(--spacing-md);
        }
        .blog-post-tag {
            padding: 4px 12px;
            background: var(--color-background-light);
            border-radius: 4px;
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
        }

        /* ── Sidebar ── */
        .blog-post-sidebar {
            width: 200px;
            flex-shrink: 0;
            position: sticky;
            top: 100px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .sidebar-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .sidebar-label {
            font-size: 13px;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .sidebar-value {
            font-size: 15px;
            font-weight: 600;
            color: var(--color-text-primary);
        }
        .sidebar-copy-link {
            font-size: 15px;
            font-weight: 600;
            color: var(--color-primary);
            cursor: pointer;
            text-decoration: none;
        }
        .sidebar-copy-link:hover {
            color: var(--color-primary-dark);
        }

        /* ── Content ── */
        .blog-post-content {
            max-width: 720px;
            font-size: var(--font-size-base);
            line-height: 1.8;
            color: var(--color-text-primary);
        }
        /* ── Hero audio card (minimal, New Yorker style) ── */
        .blog-audio-card {
            max-width: 720px;
            margin: 24px 0 32px;
            padding: 14px 0 16px;
            border-top: 1px solid var(--color-border);
            border-bottom: 1px solid var(--color-border);
        }
        .blog-audio-card-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin: 0 0 10px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-text-secondary);
        }
        .blog-audio-card-label {
            color: #E56D42;
        }
        [data-theme="dark"] .blog-audio-card-label {
            color: #FF9A6F;
        }
        .blog-audio-card-sep {
            opacity: 0.5;
        }
        .blog-audio-card-audio {
            width: 100%;
            max-width: 560px;
            height: 40px;
            accent-color: #FF8A5B;
            color-scheme: light;
        }
        [data-theme="dark"] .blog-audio-card-audio {
            color-scheme: dark;
        }

        /* ── Sticky mini bar ── */
        .blog-audio-sticky {
            position: fixed;
            left: 50%;
            bottom: 24px;
            z-index: 50;
            display: grid;
            grid-template-columns: 40px 1fr auto;
            align-items: center;
            gap: 12px;
            width: min(560px, calc(100vw - 32px));
            height: 56px;
            padding: 8px 12px 8px 8px;
            background: rgba(255, 249, 247, 0.92);
            border: 1px solid rgba(240, 232, 228, 0.9);
            border-radius: 999px;
            backdrop-filter: blur(18px) saturate(1.1);
            -webkit-backdrop-filter: blur(18px) saturate(1.1);
            box-shadow: 0 14px 40px rgba(31, 17, 10, 0.14), 0 2px 6px rgba(31, 17, 10, 0.06);
            opacity: 0;
            transform: translate(-50%, 16px);
            pointer-events: none;
            transition: opacity 300ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .blog-audio-sticky[data-state="visible"] {
            opacity: 1;
            transform: translate(-50%, 0);
            pointer-events: auto;
        }
        [data-theme="dark"] .blog-audio-sticky {
            background: rgba(22, 22, 22, 0.88);
            border-color: rgba(42, 42, 42, 0.9);
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35);
        }
        .blog-audio-sticky-toggle {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 999px;
            background: var(--color-primary);
            color: #FFFFFF;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 200ms ease;
            padding: 0;
        }
        .blog-audio-sticky-toggle:hover {
            background: #E56D42;
        }
        [data-theme="dark"] .blog-audio-sticky-toggle {
            color: #0F0F0F;
        }
        .blog-audio-sticky-toggle:focus-visible {
            outline: 2px solid #5BC8CC;
            outline-offset: 3px;
        }
        .blog-audio-sticky-icon {
            width: 20px;
            height: 20px;
        }
        .blog-audio-sticky-icon--pause {
            display: none;
        }
        .blog-audio-sticky-toggle[aria-pressed="true"] .blog-audio-sticky-icon--play {
            display: none;
        }
        .blog-audio-sticky-toggle[aria-pressed="true"] .blog-audio-sticky-icon--pause {
            display: block;
        }
        .blog-audio-sticky-body {
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .blog-audio-sticky-title {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--color-text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .blog-audio-sticky-time {
            margin: 0;
            font-size: 12px;
            color: var(--color-text-secondary);
            font-variant-numeric: tabular-nums;
        }
        .blog-audio-sticky-dismiss {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 999px;
            background: transparent;
            color: var(--color-text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 200ms ease;
            padding: 0;
        }
        .blog-audio-sticky-dismiss:hover {
            background: rgba(26, 26, 26, 0.06);
        }
        [data-theme="dark"] .blog-audio-sticky-dismiss:hover {
            background: rgba(245, 245, 245, 0.08);
        }
        .blog-audio-sticky-dismiss:focus-visible {
            outline: 2px solid #5BC8CC;
            outline-offset: 3px;
        }
        .blog-audio-sticky-dismiss svg {
            width: 14px;
            height: 14px;
        }
        @media (prefers-reduced-motion: reduce) {
            .blog-audio-sticky {
                transition: none;
            }
            .blog-audio-sticky[data-state="hidden"] {
                transform: translate(-50%, 0);
            }
        }
        .blog-post-content h2 {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            margin-top: var(--spacing-2xl);
            margin-bottom: var(--spacing-lg);
            color: var(--color-text-primary);
        }
        .blog-post-content h3 {
            font-size: var(--font-size-xl);
            font-weight: 700;
            margin-top: var(--spacing-xl);
            margin-bottom: var(--spacing-md);
            color: var(--color-text-primary);
        }
        .blog-post-content p {
            margin-bottom: var(--spacing-lg);
        }
        .blog-post-content ul, .blog-post-content ol {
            margin-bottom: var(--spacing-lg);
            padding-left: var(--spacing-xl);
        }
        .blog-post-content li {
            margin-bottom: var(--spacing-sm);
        }
        .blog-post-content code {
            background: var(--color-background-light);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }
        .blog-post-content pre {
            background: var(--color-background-light);
            padding: var(--spacing-lg);
            border-radius: 8px;
            overflow-x: auto;
            margin-bottom: var(--spacing-lg);
        }
        .blog-post-content pre code {
            background: none;
            padding: 0;
        }
        .blog-post-content blockquote {
            border-left: 4px solid var(--color-primary);
            padding-left: var(--spacing-lg);
            margin: var(--spacing-xl) 0;
            font-style: italic;
            color: var(--color-text-secondary);
        }
        .blog-post-content a {
            color: var(--color-primary);
            text-decoration: underline;
        }
        .blog-post-content a:hover {
            color: var(--color-primary-dark);
        }

        /* ── Tables ── */
        .blog-post-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 32px 0;
            font-size: 15px;
        }
        .blog-post-content thead th {
            text-align: left;
            padding: 12px 16px;
            font-weight: 700;
            border-bottom: 2px solid var(--color-text-primary);
        }
        .blog-post-content tbody td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--color-border);
            vertical-align: top;
        }
        .blog-post-content tbody td:first-child {
            font-weight: 600;
            white-space: nowrap;
        }
        .blog-post-content tbody tr:last-child td {
            border-bottom: none;
        }

        /* ── Footer ── */
        .blog-post-footer {
            max-width: 720px;
            margin-top: var(--spacing-2xl);
            padding-top: var(--spacing-2xl);
            border-top: 1px solid var(--color-border);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .blog-post-hero {
                flex-direction: column;
                gap: 32px;
            }
            .blog-post-sidebar {
                position: static;
                width: 100%;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 16px;
                padding-top: 24px;
                border-top: 1px solid var(--color-border);
            }
            .sidebar-item {
                flex: 1;
                min-width: 120px;
            }
            .blog-post-content {
                max-width: 100%;
            }
            .blog-post-footer {
                max-width: 100%;
            }
        }
        @media (max-width: 480px) {
            .blog-audio-card-audio {
                max-width: none;
            }
            .blog-audio-sticky {
                bottom: 16px;
                width: calc(100vw - 32px);
            }
            .blog-audio-sticky-title {
                display: none;
            }
            .blog-audio-sticky-body {
                align-items: center;
            }
            .blog-audio-sticky-time {
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
            <a href="/" class="nav-logo" aria-label="Miguel Tineo Home">Miguel Tineo</a>
            <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-menu">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/about.html" class="nav-link">About</a></li>
                <li><a href="/experience.html" class="nav-link">Experience</a></li>
                <li><a href="/speaking.html" class="nav-link">Speaking</a></li>
                <li><a href="/blog/" class="nav-link active">Blog</a></li>
                <li><a href="/contact.html" class="nav-link">Contact</a></li>
                <li>
                    <button class="theme-toggle" data-current-theme="auto" aria-label="Toggle theme">
                        <span class="theme-toggle-indicator">
                            <span class="theme-toggle-icon"></span>
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    </nav>

    <main>
        <article class="blog-post">
            <div class="blog-post-back">
                <a href="/blog/" class="btn btn-secondary">&larr; Back to Blog</a>
            </div>

            <div class="blog-post-hero">
                <div class="blog-post-hero-main">
                    <div class="blog-post-illustration">
                        ${illustrationSVG}
                    </div>
                    <h1 class="blog-post-title">${escapeHtml(displayTitle)}</h1>
                    ${displaySubtitle ? `<p class="blog-post-subtitle">${escapeHtml(displaySubtitle)}</p>` : ''}
                    ${tagsHTML}
                </div>
                <aside class="blog-post-sidebar">
                    ${post.category ? `<div class="sidebar-item">
                        <span class="sidebar-label">Category</span>
                        <span class="sidebar-value">${escapeHtml(post.category)}</span>
                    </div>` : ''}
                    <div class="sidebar-item">
                        <span class="sidebar-label">Date</span>
                        <span class="sidebar-value">${formattedDate}</span>
                    </div>
                    <div class="sidebar-item">
                        <span class="sidebar-label">Reading time</span>
                        <span class="sidebar-value">${readingTime} min</span>
                    </div>
                    <div class="sidebar-item">
                        <span class="sidebar-label">Share</span>
                        <a class="sidebar-copy-link" href="#" onclick="(function(el){navigator.clipboard.writeText(window.location.href).then(function(){var t=el.textContent;el.textContent='Copied!';setTimeout(function(){el.textContent=t;},2000);});})(this);return false;">Copy link</a>
                    </div>
                </aside>
            </div>

            ${audioWidget}

            <div class="blog-post-content">
                ${post.content}
            </div>

            <footer class="blog-post-footer">
                <div class="text-center">
                    <h3>Join Bear Essentials</h3>
                    <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">
                        Get bi-weekly insights on engineering leadership, AI agents, distributed systems, and sustainable tech.
                    </p>
                    <a href="/blog/" class="btn btn-primary">Subscribe</a>
                </div>
            </footer>
        </article>
        ${stickyAudioWidget}
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Miguel Tineo</h4>
                    <p style="color: var(--color-text-secondary); font-size: 14px;">
                        Engineering Leader focused on building teams and systems that scale.
                    </p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="/about.html">About</a></li>
                        <li><a href="/experience.html">Experience</a></li>
                        <li><a href="/speaking.html">Speaking</a></li>
                        <li><a href="/blog/">Blog</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <ul class="footer-links">
                        <li><a href="https://www.linkedin.com/in/miketineo" target="_blank" rel="noopener">LinkedIn</a></li>
                        <li><a href="https://github.com/miketineo" target="_blank" rel="noopener">GitHub</a></li>
                        <li><a href="mailto:miketineo@gmail.com">Email</a></li>
                        <li><a href="/contact.html">Contact Form</a></li>
                        <li><a href="#cookie-settings" id="cookie-settings-link">Cookie Settings</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Miguel Tineo. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/js/main.js" defer></script>
    <script>
      (function () {
        var card = document.querySelector('[data-audio-card]');
        if (!card) { return; }
        var audio = card.querySelector('[data-audio-element]');
        var sticky = document.querySelector('[data-audio-sticky]');
        if (!audio || !sticky) { return; }
        var toggle = sticky.querySelector('[data-audio-toggle]');
        var dismiss = sticky.querySelector('[data-audio-dismiss]');
        var currentEl = sticky.querySelector('[data-audio-current]');
        var durationEl = sticky.querySelector('[data-audio-duration]');
        var hasPlayed = false;
        var dismissed = false;
        var cardVisible = true;

        function formatTime(seconds) {
          if (!isFinite(seconds) || seconds < 0) { return '0:00'; }
          var m = Math.floor(seconds / 60);
          var s = Math.floor(seconds % 60);
          return m + ':' + (s < 10 ? '0' + s : s);
        }

        function updateStickyState() {
          if (dismissed || !hasPlayed || cardVisible) {
            sticky.setAttribute('data-state', 'hidden');
            sticky.setAttribute('aria-hidden', 'true');
          } else {
            sticky.setAttribute('data-state', 'visible');
            sticky.setAttribute('aria-hidden', 'false');
          }
        }

        audio.addEventListener('play', function () {
          hasPlayed = true;
          card.setAttribute('data-playing', 'true');
          toggle.setAttribute('aria-pressed', 'true');
          toggle.setAttribute('aria-label', 'Pause audio');
          updateStickyState();
        });
        audio.addEventListener('pause', function () {
          card.setAttribute('data-playing', 'false');
          toggle.setAttribute('aria-pressed', 'false');
          toggle.setAttribute('aria-label', 'Play audio');
        });
        audio.addEventListener('ended', function () {
          card.setAttribute('data-playing', 'false');
          toggle.setAttribute('aria-pressed', 'false');
          toggle.setAttribute('aria-label', 'Play audio');
        });
        audio.addEventListener('loadedmetadata', function () {
          if (durationEl) { durationEl.textContent = formatTime(audio.duration); }
        });
        audio.addEventListener('timeupdate', function () {
          if (currentEl) { currentEl.textContent = formatTime(audio.currentTime); }
        });

        toggle.addEventListener('click', function () {
          if (audio.paused) { audio.play(); } else { audio.pause(); }
        });
        dismiss.addEventListener('click', function () {
          dismissed = true;
          updateStickyState();
        });

        if ('IntersectionObserver' in window) {
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              cardVisible = entry.intersectionRatio >= 0.1;
              updateStickyState();
            });
          }, { threshold: [0, 0.1] });
          observer.observe(card);
        }
      })();
    </script>
</body>
</html>`;

  const outputPath = path.join(BLOG_DIR, `${post.slug}.html`);
  fs.writeFileSync(outputPath, template);
  console.log(`Generated: ${outputPath}`);
}

// Generate blog index page with post listings
function generateBlogIndex(posts) {
  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const postsHTML = sortedPosts.map(post => `
                    <article class="card">
                        <h3 class="card-title">${escapeHtml(post.title)}</h3>
                        <p class="card-meta">${formatDate(post.date)} &bull; ${estimateReadTime(post.rawContent)} min read</p>
                        ${post.tags.length > 0 ? `
                        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap; margin-bottom: var(--spacing-sm);">
                            ${post.tags.map(tag => `<span style="padding: 2px 8px; background: var(--color-background-light); border-radius: 4px; font-size: 12px;">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                        ` : ''}
                        <p class="card-description">
                            ${escapeHtml(post.excerpt)}
                        </p>
                        <a href="/blog/${post.slug}.html" class="btn btn-secondary" style="margin-top: var(--spacing-md);">Read More</a>
                    </article>
  `).join('');

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Engineering leadership insights, team building strategies, and distributed systems thinking from Miguel Tineo.">
    <title>Blog &amp; Newsletter - Miguel Tineo</title>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/components.css">

    <!-- Theme must load before page renders to prevent flash -->
    <script src="/js/theme.js"></script>

    <!-- Cookie Consent & Analytics (PostHog) -->
    <script src="/js/cookie-consent.js" defer></script>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
            <a href="/" class="nav-logo" aria-label="Miguel Tineo Home">Miguel Tineo</a>
            <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-menu">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/about.html" class="nav-link">About</a></li>
                <li><a href="/experience.html" class="nav-link">Experience</a></li>
                <li><a href="/speaking.html" class="nav-link">Speaking</a></li>
                <li><a href="/blog/" class="nav-link active">Blog</a></li>
                <li><a href="/contact.html" class="nav-link">Contact</a></li>
                <li>
                    <button class="theme-toggle" data-current-theme="auto" aria-label="Toggle theme">
                        <span class="theme-toggle-indicator">
                            <span class="theme-toggle-icon"></span>
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    </nav>

    <main>
        <!-- Page Header -->
        <section class="section section-lg">
            <div class="container container-narrow">
                <div class="page-header">
                    <h1 class="page-title">Leadership Insights</h1>
                    <p class="page-description">
                        ${posts.length > 0 ? 'Bi-weekly deep-dives on engineering leadership, culture, and systems thinking' : 'Monthly deep-dives on engineering leadership, culture, and systems thinking'}
                    </p>
                </div>
            </div>
        </section>

        <!-- Newsletter Signup -->
        <section class="section bg-light">
            <div class="container container-narrow">
                <div class="card text-center">
                    <h2 style="margin-bottom: var(--spacing-md);">Bear Essentials</h2>
                    <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg); max-width: 600px; margin-left: auto; margin-right: auto;">
                        Bi-weekly insights on engineering leadership, AI agents, distributed systems,
                        and sustainable tech. The essential wisdom for modern builders&mdash;distilled, thoughtful, no fluff.
                    </p>
                    <form class="newsletter-form" action="https://buttondown.email/api/emails/embed-subscribe/bearessentials" method="POST" target="popupwindow">
                        <input
                            type="email"
                            name="email"
                            class="form-input newsletter-input"
                            placeholder="your@email.com"
                            required
                            aria-label="Email address">
                        <button type="submit" class="btn btn-primary newsletter-btn">Subscribe</button>
                    </form>
                    <p style="font-size: 14px; color: var(--color-text-secondary); margin-top: var(--spacing-md); margin-bottom: 0;">
                        No spam. Unsubscribe anytime. GDPR compliant.
                    </p>
                </div>
            </div>
        </section>

        <!-- Blog Posts -->
        <section class="section">
            <div class="container">
                <h2 class="text-center" style="margin-bottom: var(--spacing-xl);">Recent Posts</h2>

                ${posts.length > 0 ? `
                <div class="grid grid-2">
                    ${postsHTML}
                </div>
                ` : `
                <div style="text-align: center; padding: var(--spacing-2xl) 0;">
                    <p style="font-size: var(--font-size-lg); color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">
                        Blog posts are coming soon! In the meantime, subscribe to the newsletter
                        to receive insights directly in your inbox.
                    </p>
                    <p style="color: var(--color-text-secondary);">
                        Upcoming topics include:
                    </p>
                    <ul style="list-style: none; padding: 0; max-width: 600px; margin: var(--spacing-lg) auto 0;">
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            &bull; Building psychological safety in remote teams
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            &bull; The engineering manager's guide to 1-on-1s
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            &bull; Scaling microservices: lessons from the trenches
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            &bull; Career development frameworks for engineers
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            &bull; Cloud cost optimization strategies that actually work
                        </li>
                    </ul>
                </div>
                `}
            </div>
        </section>

        <!-- Topics -->
        <section class="section bg-light">
            <div class="container">
                <h2 class="text-center" style="margin-bottom: var(--spacing-xl);">What I Write About</h2>
                <div class="grid grid-3">
                    <div class="card">
                        <h3 class="card-title">Engineering Leadership</h3>
                        <p class="card-description">
                            Team building, mentorship, career development, and creating high-performing
                            engineering organizations.
                        </p>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Distributed Systems</h3>
                        <p class="card-description">
                            Architecture patterns, scalability strategies, and lessons learned from
                            building systems that handle millions of requests.
                        </p>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Engineering Culture</h3>
                        <p class="card-description">
                            Remote work best practices, psychological safety, continuous learning,
                            and sustainable delivery.
                        </p>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Cloud Architecture</h3>
                        <p class="card-description">
                            AWS optimization, infrastructure as code, observability, and cost management
                            strategies for cloud-native applications.
                        </p>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Career Growth</h3>
                        <p class="card-description">
                            Navigating career transitions, from IC to management, building leadership
                            skills, and interview preparation.
                        </p>
                    </div>
                    <div class="card">
                        <h3 class="card-title">Systems Thinking</h3>
                        <p class="card-description">
                            Holistic approaches to problem-solving, understanding complex systems,
                            and making impactful technical decisions.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Connect -->
        <section class="section">
            <div class="container container-narrow text-center">
                <h2>Let's Continue the Conversation</h2>
                <p style="margin-bottom: var(--spacing-lg);">
                    Have questions or topics you'd like me to cover? Reach out directly or
                    connect with me on LinkedIn.
                </p>
                <div style="display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap;">
                    <a href="/contact.html" class="btn btn-primary">Send a Message</a>
                    <a href="https://www.linkedin.com/in/miketineo" class="btn btn-secondary" target="_blank" rel="noopener">Connect on LinkedIn</a>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Miguel Tineo</h4>
                    <p style="color: var(--color-text-secondary); font-size: 14px;">
                        Engineering Leader focused on building teams and systems that scale.
                    </p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="/about.html">About</a></li>
                        <li><a href="/experience.html">Experience</a></li>
                        <li><a href="/speaking.html">Speaking</a></li>
                        <li><a href="/blog/">Blog</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <ul class="footer-links">
                        <li><a href="https://www.linkedin.com/in/miketineo" target="_blank" rel="noopener">LinkedIn</a></li>
                        <li><a href="https://github.com/miketineo" target="_blank" rel="noopener">GitHub</a></li>
                        <li><a href="mailto:miketineo@gmail.com">Email</a></li>
                        <li><a href="/contact.html">Contact Form</a></li>
                        <li><a href="#cookie-settings" id="cookie-settings-link">Cookie Settings</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Miguel Tineo. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/js/main.js" defer></script>
</body>
</html>`;

  const outputPath = path.join(BLOG_DIR, 'index.html');
  fs.writeFileSync(outputPath, template);
  console.log(`Generated: ${outputPath}`);
}

// Helper functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function loadAudioManifest() {
  if (!fs.existsSync(AUDIO_MANIFEST)) {
    return { posts: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(AUDIO_MANIFEST, 'utf-8'));
  } catch (error) {
    console.warn(`Could not read audio manifest: ${error.message}`);
    return { posts: {} };
  }
}

function resolveAudioMetadata({ slug, audioEnabled, audioTitle, rawContent, audioManifest }) {
  if (!audioEnabled) {
    return null;
  }

  const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
  if (!fs.existsSync(audioPath)) {
    return null;
  }

  const manifestEntry = audioManifest.posts ? audioManifest.posts[slug] : null;
  const durationSeconds = manifestEntry && manifestEntry.durationSeconds ? manifestEntry.durationSeconds : null;
  const voice = manifestEntry && manifestEntry.voice ? manifestEntry.voice : null;
  const engine = manifestEntry && manifestEntry.engine ? manifestEntry.engine : null;

  return {
    title: audioTitle,
    url: `/blog/audio/${slug}.mp3`,
    durationSeconds,
    listenLabel: durationSeconds ? formatDuration(durationSeconds) : `~${estimateListenTime(rawContent)} min audio`,
    durationLabel: durationSeconds ? formatDurationBrief(durationSeconds) : `~${estimateListenTime(rawContent)} min`,
    voice,
    engine,
  };
}

function renderAudioWidget({ audio }) {
  const voiceLabel = audio.voice || 'Matthew';
  const durationLabel = audio.durationLabel || '';
  return `
            <figure class="blog-audio-card" data-audio-card data-playing="false" aria-label="Audio version of this post">
                <p class="blog-audio-card-meta">
                    <span class="blog-audio-card-label">Listen</span>
                    <span class="blog-audio-card-sep" aria-hidden="true">·</span>
                    <span>${escapeHtml(durationLabel)}</span>
                    <span class="blog-audio-card-sep" aria-hidden="true">·</span>
                    <span>Narrated by ${escapeHtml(voiceLabel)} (AI)</span>
                </p>
                <audio class="blog-audio-card-audio" controls preload="metadata" data-audio-element>
                    <source src="${audio.url}" type="audio/mpeg">
                    Your browser doesn't support embedded audio. <a href="${audio.url}">Download the MP3</a>.
                </audio>
            </figure>
  `;
}

function renderAudioSticky({ audio, postTitle }) {
  const totalLabel = audio.durationSeconds ? formatShortDuration(audio.durationSeconds) : '';
  return `
            <aside class="blog-audio-sticky" data-audio-sticky data-state="hidden" role="complementary" aria-label="Audio player" aria-hidden="true">
                <button type="button" class="blog-audio-sticky-toggle" data-audio-toggle aria-pressed="false" aria-label="Play audio">
                    <svg class="blog-audio-sticky-icon blog-audio-sticky-icon--play" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 3.5 L15.5 10 L5.5 16.5 Z" fill="currentColor"/></svg>
                    <svg class="blog-audio-sticky-icon blog-audio-sticky-icon--pause" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5 H8.5 V16.5 H6 Z M11.5 3.5 H14 V16.5 H11.5 Z" fill="currentColor"/></svg>
                </button>
                <div class="blog-audio-sticky-body">
                    <p class="blog-audio-sticky-title">${escapeHtml(postTitle)}</p>
                    <p class="blog-audio-sticky-time" aria-live="off">
                        <span data-audio-current>0:00</span><span class="blog-audio-sticky-time-sep" aria-hidden="true"> / </span><span data-audio-duration>${escapeHtml(totalLabel)}</span>
                    </p>
                </div>
                <button type="button" class="blog-audio-sticky-dismiss" data-audio-dismiss aria-label="Dismiss audio player">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" fill="none"/></svg>
                </button>
            </aside>
  `;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function formatShortDuration(durationSeconds) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.floor(durationSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDurationBrief(durationSeconds) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function estimateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function estimateListenTime(content) {
  const wordsPerMinute = 160;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function formatDuration(durationSeconds) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s audio`;
  }

  if (seconds === 0) {
    return `${minutes} min audio`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s audio`;
}

// Main build process
function build() {
  console.log('Building blog...\n');
  const audioManifest = loadAudioManifest();

  const markdownFiles = getMarkdownFiles();

  if (markdownFiles.length === 0) {
    console.log('No blog posts found in blog/posts/');
    console.log('Generating empty blog index...\n');
    generateBlogIndex([]);
    fs.writeFileSync(POSTS_JSON, JSON.stringify([], null, 2));
    console.log('\nBlog build complete! (0 posts)');
    return;
  }

  console.log(`Found ${markdownFiles.length} post(s):\n`);

  const posts = markdownFiles.map(file => {
    const post = parsePost(file, audioManifest);
    console.log(`- ${post.title} (${post.date})`);
    generatePostPage(post);
    return post;
  });

  // Check for duplicate illustrations
  const illustrationMap = {};
  for (const post of posts) {
    const ill = selectIllustration(post);
    if (illustrationMap[ill]) {
      console.warn(`  ⚠ Duplicate illustration "${ill}" used by "${illustrationMap[ill]}" and "${post.title}"`);
    }
    illustrationMap[ill] = post.title;
  }

  console.log('\nGenerating blog index...');
  generateBlogIndex(posts);

  console.log('Generating posts.json...');
  const postsMetadata = posts.map(({ content, rawContent, audio, ...metadata }) => ({
    ...metadata,
    hasAudio: Boolean(audio),
    audioUrl: audio ? audio.url : '',
    audioDurationSeconds: audio ? audio.durationSeconds : null,
  }));
  fs.writeFileSync(POSTS_JSON, JSON.stringify(postsMetadata, null, 2));

  console.log(`\nBlog build complete! Generated ${posts.length} post(s).`);
}

// Run build
build();
