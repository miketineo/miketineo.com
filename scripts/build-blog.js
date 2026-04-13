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
  };

  return illustrations[name] || illustrations['bear-paw'];
}

const TAG_TO_ILLUSTRATION = {
  'leadership': 'campfire',
  'remote-work': 'tent',
  'culture': 'campfire',
  'ai': 'compass',
  'infrastructure': 'axe',
  'sustainability': 'lantern',
  'deployment': 'map',
  'devops': 'axe',
  'engineering-leadership': 'compass',
  'agentic-engineering': 'compass',
  'productivity': 'binoculars',
  'software-engineering': 'axe',
  'distributed-systems': 'map',
};

function selectIllustration(post) {
  if (post.illustration && post.illustration.trim()) {
    return post.illustration.trim();
  }
  for (const tag of (post.tags || [])) {
    const normalizedTag = tag.toLowerCase();
    if (TAG_TO_ILLUSTRATION[normalizedTag]) {
      return TAG_TO_ILLUSTRATION[normalizedTag];
    }
  }
  return 'bear-paw';
}

// ─── Paths ───────────────────────────────────────────────────────────────────

const BLOG_DIR = path.join(__dirname, '..', 'blog');
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
  const audioWidget = post.audio ? renderAudioWidget(post.audio) : '';
  const compactAudioWidget = post.audio ? renderCompactAudioWidget(post.audio) : '';

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

    <!-- Cookie Consent (must load BEFORE Mixpanel) -->
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
        .blog-audio-card,
        .blog-audio-card-compact {
            max-width: 720px;
            border: 1px solid var(--color-border);
            background: linear-gradient(135deg, rgba(255, 138, 91, 0.14), rgba(255, 245, 240, 0.85));
            border-radius: 18px;
            padding: 24px;
            margin-bottom: 32px;
        }
        [data-theme="dark"] .blog-audio-card,
        [data-theme="dark"] .blog-audio-card-compact {
            background: linear-gradient(135deg, rgba(229, 109, 66, 0.2), rgba(26, 26, 26, 0.9));
        }
        .blog-audio-card-title,
        .blog-audio-card-compact-title {
            margin: 0 0 8px;
            font-size: 22px;
            color: var(--color-text-primary);
        }
        .blog-audio-card-copy,
        .blog-audio-card-compact-copy {
            margin: 0 0 16px;
            color: var(--color-text-secondary);
        }
        .blog-audio-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 16px;
            font-size: 14px;
            color: var(--color-text-secondary);
        }
        .blog-audio-card audio,
        .blog-audio-card-compact audio {
            width: 100%;
        }
        .blog-audio-card-compact {
            margin-top: var(--spacing-2xl);
            margin-bottom: 0;
            padding: 20px 24px;
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

            ${compactAudioWidget}

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

    <!-- Cookie Consent (must load BEFORE Mixpanel) -->
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

  return {
    title: audioTitle,
    url: `/blog/audio/${slug}.mp3`,
    durationSeconds,
    listenLabel: durationSeconds ? formatDuration(durationSeconds) : `~${estimateListenTime(rawContent)} min audio`,
  };
}

function renderAudioWidget(audio) {
  return `
            <section class="blog-audio-card" aria-label="Listen to this article">
                <h2 class="blog-audio-card-title">${escapeHtml(audio.title)}</h2>
                <p class="blog-audio-card-copy">Prefer to listen? Play the narrated version while you walk, commute, or take notes.</p>
                <div class="blog-audio-meta">
                    <span>${escapeHtml(audio.listenLabel)}</span>
                    <span>Single voice narration</span>
                </div>
                <audio controls preload="none">
                    <source src="${audio.url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </section>
  `;
}

function renderCompactAudioWidget(audio) {
  return `
            <section class="blog-audio-card-compact" aria-label="Audio version">
                <h2 class="blog-audio-card-compact-title">Want the audio version again?</h2>
                <p class="blog-audio-card-compact-copy">Keep listening here or reopen the player whenever you want a slower pass through the article.</p>
                <audio controls preload="none">
                    <source src="${audio.url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </section>
  `;
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
