#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const SRC_DIR = path.join(__dirname, '..', 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const OUTPUT_DIR = path.join(__dirname, '..');

// Read component files
const navHTML = fs.readFileSync(path.join(COMPONENTS_DIR, 'nav.html'), 'utf-8');
const footerHTML = fs.readFileSync(path.join(COMPONENTS_DIR, 'footer.html'), 'utf-8');

// Page configuration
const pages = [
  {
    name: 'index',
    title: 'Miguel Tineo - Engineering Leadership',
    description: 'Engineering Leader | Cloud Innovator | Mentor | Speaker. Building teams that build the future.',
    activeNav: 'Home'
  },
  {
    name: 'about',
    title: 'About - Miguel Tineo',
    description: 'Learn about Miguel Tineo\'s journey in engineering leadership, from building distributed systems to mentoring teams.',
    activeNav: 'About'
  },
  {
    name: 'experience',
    title: 'Experience - Miguel Tineo',
    description: '10+ years of engineering leadership at Hivenet, Dutchie, and Zendesk. Building teams and systems at scale.',
    activeNav: 'Experience'
  },
  {
    name: 'speaking',
    title: 'Speaking - Miguel Tineo',
    description: 'Engineering leadership talks and workshops. Available for conferences, panels, and corporate events.',
    activeNav: 'Speaking'
  },
  {
    name: 'contact',
    title: 'Contact - Miguel Tineo',
    description: 'Get in touch with Miguel Tineo for speaking engagements, consulting, or just to say hello.',
    activeNav: 'Contact'
  }
];

// Generate full HTML page
function generatePage(pageConfig) {
  const pageContentPath = path.join(PAGES_DIR, `${pageConfig.name}.html`);

  if (!fs.existsSync(pageContentPath)) {
    console.log(`⚠️  Warning: ${pageContentPath} not found, skipping...`);
    return;
  }

  const pageContent = fs.readFileSync(pageContentPath, 'utf-8');

  // Update nav to set active class
  const navWithActive = navHTML.replace(
    new RegExp(`(<a href="[^"]*" class="nav-link)(">\\s*${pageConfig.activeNav}\\s*</a>)`, 'i'),
    `$1 active$2`
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${pageConfig.description}">
    <meta name="author" content="Miguel Tineo">

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://miketineo.com/${pageConfig.name === 'index' ? '' : pageConfig.name + '.html'}">
    <meta property="og:title" content="${pageConfig.title}">
    <meta property="og:description" content="${pageConfig.description}">
    <meta property="og:image" content="https://miketineo.com/assets/images/og-image.jpg">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageConfig.title}">
    <meta name="twitter:description" content="${pageConfig.description}">

    <title>${pageConfig.title}</title>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/components.css">

    <!-- Theme must load before page renders to prevent flash -->
    <script src="/js/theme.js"></script>

    <!-- Cookie Consent (must load BEFORE Mixpanel) -->
    <script src="/js/cookie-consent.js" defer></script>

    <!-- JSON-LD Structured Data (for homepage only) -->
    ${pageConfig.name === 'index' ? `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Miguel Tineo",
      "url": "https://miketineo.com",
      "jobTitle": "Software Engineering Manager",
      "worksFor": {
        "@type": "Organization",
        "name": "Hive"
      },
      "alumniOf": [
        {
          "@type": "Organization",
          "name": "Zendesk"
        },
        {
          "@type": "Organization",
          "name": "Dutchie"
        }
      ],
      "sameAs": [
        "https://www.linkedin.com/in/miketineo",
        "https://github.com/miketineo"
      ]
    }
    </script>` : ''}
</head>
<body>
    ${navWithActive}

    ${pageContent}

    ${footerHTML}

    <!-- Scripts -->
    <script src="/js/main.js" defer></script>

    ${pageConfig.name === 'index' ? `<!-- Three.js for WebGL Background (homepage only) -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
    <script src="/js/webgl-background.js" defer></script>` : ''}
</body>
</html>`;

  const outputPath = path.join(OUTPUT_DIR, `${pageConfig.name}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Generated: ${pageConfig.name}.html`);
}

// Main build process
function build() {
  console.log('🔨 Building pages...\n');

  pages.forEach(pageConfig => {
    try {
      generatePage(pageConfig);
    } catch (error) {
      console.error(`❌ Error building ${pageConfig.name}:`, error.message);
    }
  });

  console.log(`\n✨ Build complete! Generated ${pages.length} page(s).`);
}

// Run build
build();
