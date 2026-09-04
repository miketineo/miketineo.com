#!/usr/bin/env node

// Builds the root static pages from src/pages/*.html (page <main> content)
// wrapped with src/components/nav.html + footer.html and the shared <head>.
// Design system: PLEX (design-explorations/factories/plex/SYSTEM.md), adopted
// as the production design 2026-07-16. Styles live in /css/tokens.css +
// /css/plex.css; the only page JS is the nav disclosure (/js/nav.js) plus the
// GDPR cookie consent banner (/js/cookie-consent.js) and the shared PostHog
// loader (/js/posthog-config.js + /js/posthog-setup.js).

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

// Page configuration (titles/descriptions: factories/plex/COPY.md)
const pages = [
  {
    name: 'index',
    title: 'Miguel Tineo | Fractional CTO & Engineering Leader',
    description: 'Fractional CTO for founders and scale-ups. 10+ years leading engineering at Zendesk, Dutchie, and Hivenet: architecture, hiring, and delivery without the full-time salary.',
    activeNav: 'Home'
  },
  {
    name: 'fractional-cto',
    title: 'Fractional CTO for Startups & Scale-ups - Miguel Tineo',
    description: 'Part-time CTO for founders and scale-ups: technical strategy, architecture, hiring, and delivery leadership. Advisory or embedded, monthly rolling.',
    activeNav: 'Work With Me'
  },
  {
    name: 'about',
    title: 'About - Miguel Tineo',
    description: 'Miguel Tineo: Head of Engineering at Hivenet, fractional CTO, based in Cagliari, Italy. Ten years of building teams and distributed systems at Zendesk, Dutchie, and Hivenet.',
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
    description: 'Contact Miguel Tineo for fractional CTO engagements, speaking, or mentorship. Replies within 2-3 business days.',
    activeNav: 'Contact'
  }
];

// Mark the current page in both the desktop nav and the mobile panel:
// find each plain link whose label matches activeNav and add aria-current.
// The plex CSS keys the datum tick off [aria-current="page"].
function markActiveNav(nav, label) {
  const pattern = new RegExp(`<a href="([^"]*)">(\\s*${label}\\s*)</a>`, 'g');
  return nav.replace(pattern, `<a href="$1" aria-current="page">$2</a>`);
}

// Generate full HTML page
function generatePage(pageConfig) {
  const pageContentPath = path.join(PAGES_DIR, `${pageConfig.name}.html`);

  if (!fs.existsSync(pageContentPath)) {
    console.log(`Warning: ${pageContentPath} not found, skipping...`);
    return;
  }

  const pageContent = fs.readFileSync(pageContentPath, 'utf-8');
  const navWithActive = markActiveNav(navHTML, pageConfig.activeNav);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${pageConfig.description}">
    <meta name="author" content="Miguel Tineo">
    <link rel="canonical" href="https://miketineo.com/${pageConfig.name === 'index' ? '' : pageConfig.name + '.html'}">

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

    <!-- Fonts (PLEX: IBM Plex Sans + Serif) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:ital@0;1&display=swap" rel="stylesheet">

    <!-- Stylesheets (PLEX design system) -->
    <link rel="stylesheet" href="/css/tokens.css">
    <link rel="stylesheet" href="/css/plex.css">

    <!-- Cookie Consent & Analytics (PostHog) -->
    <script src="/js/posthog-config.js"></script>
    <script src="/js/posthog-setup.js" defer></script>
    <script src="/js/cookie-consent.js" defer></script>

    <!-- JSON-LD Structured Data (for homepage only) -->
    ${pageConfig.name === 'index' ? `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Miguel Tineo",
      "url": "https://miketineo.com",
      "jobTitle": "Head of Engineering",
      "worksFor": {
        "@type": "Organization",
        "name": "Hivenet"
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
    <script src="/js/nav.js" defer></script>
</body>
</html>`;

  const outputPath = path.join(OUTPUT_DIR, `${pageConfig.name}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`Generated: ${pageConfig.name}.html`);
}

// Main build process
function build() {
  console.log('Building pages...\n');

  pages.forEach(pageConfig => {
    try {
      generatePage(pageConfig);
    } catch (error) {
      console.error(`Error building ${pageConfig.name}:`, error.message);
    }
  });

  console.log(`\nBuild complete! Generated ${pages.length} page(s).`);
}

// Run build
build();
