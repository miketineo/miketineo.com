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

// Paths
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const GENERATED_DIR = path.join(BLOG_DIR, 'generated');
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
function parsePost(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  // Get filename for URL slug
  const filename = path.basename(filePath, '.md');
  // Remove date prefix if exists (e.g., "2025-01-15-title" -> "title")
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');

  return {
    slug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString().split('T')[0],
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    content: marked(content),
    rawContent: content,
  };
}

// Generate HTML page for a single post
function generatePostPage(post) {
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
            max-width: 800px;
            margin: 0 auto;
            padding: var(--spacing-2xl) var(--spacing-lg);
        }
        .blog-post-header {
            margin-bottom: var(--spacing-2xl);
        }
        .blog-post-title {
            font-size: var(--font-size-3xl);
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: var(--spacing-md);
            color: var(--color-text-primary);
        }
        .blog-post-meta {
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            margin-bottom: var(--spacing-lg);
        }
        .blog-post-tags {
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;
        }
        .blog-post-tag {
            padding: 4px 12px;
            background: var(--color-bg-secondary);
            border-radius: 4px;
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
        }
        .blog-post-content {
            font-size: var(--font-size-base);
            line-height: 1.8;
            color: var(--color-text-primary);
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
            background: var(--color-bg-secondary);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }
        .blog-post-content pre {
            background: var(--color-bg-secondary);
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
        .blog-post-back {
            margin-bottom: var(--spacing-xl);
        }
        .blog-post-footer {
            margin-top: var(--spacing-2xl);
            padding-top: var(--spacing-2xl);
            border-top: 1px solid var(--color-border);
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
                <a href="/blog/" class="btn btn-secondary">← Back to Blog</a>
            </div>

            <header class="blog-post-header">
                <h1 class="blog-post-title">${escapeHtml(post.title)}</h1>
                <div class="blog-post-meta">
                    <time datetime="${post.date}">${formatDate(post.date)}</time>
                    ${post.tags.length > 0 ? `<span>•</span>` : ''}
                </div>
                ${post.tags.length > 0 ? `
                <div class="blog-post-tags">
                    ${post.tags.map(tag => `<span class="blog-post-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                ` : ''}
            </header>

            <div class="blog-post-content">
                ${post.content}
            </div>

            <footer class="blog-post-footer">
                <div class="text-center">
                    <h3>Join Bear Essentials 🐻</h3>
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
                <p>&copy; 2025 Miguel Tineo. All rights reserved.</p>
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
                        <p class="card-meta">${formatDate(post.date)} • ${estimateReadTime(post.rawContent)} min read</p>
                        ${post.tags.length > 0 ? `
                        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap; margin-bottom: var(--spacing-sm);">
                            ${post.tags.map(tag => `<span style="padding: 2px 8px; background: var(--color-bg-secondary); border-radius: 4px; font-size: 12px;">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                        ` : ''}
                        <p class="card-description">
                            ${escapeHtml(post.excerpt)}
                        </p>
                        <a href="/blog/generated/${post.slug}.html" class="btn btn-secondary" style="margin-top: var(--spacing-md);">Read More</a>
                    </article>
  `).join('');

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Engineering leadership insights, team building strategies, and distributed systems thinking from Miguel Tineo.">
    <title>Blog & Newsletter - Miguel Tineo</title>

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
                    <h2 style="margin-bottom: var(--spacing-md);">Bear Essentials 🐻</h2>
                    <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg); max-width: 600px; margin-left: auto; margin-right: auto;">
                        Bi-weekly insights on engineering leadership, AI agents, distributed systems,
                        and sustainable tech. The essential wisdom for modern builders—distilled, thoughtful, no fluff.
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
                            • Building psychological safety in remote teams
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            • The engineering manager's guide to 1-on-1s
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            • Scaling microservices: lessons from the trenches
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            • Career development frameworks for engineers
                        </li>
                        <li style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
                            • Cloud cost optimization strategies that actually work
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
                <p>&copy; 2025 Miguel Tineo. All rights reserved.</p>
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

// Main build process
function build() {
  console.log('Building blog...\n');

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
    const post = parsePost(file);
    console.log(`- ${post.title} (${post.date})`);
    generatePostPage(post);
    return post;
  });

  console.log('\nGenerating blog index...');
  generateBlogIndex(posts);

  console.log('Generating posts.json...');
  const postsMetadata = posts.map(({ content, rawContent, ...metadata }) => metadata);
  fs.writeFileSync(POSTS_JSON, JSON.stringify(postsMetadata, null, 2));

  console.log(`\nBlog build complete! Generated ${posts.length} post(s).`);
}

// Run build
build();
