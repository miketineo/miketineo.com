# Build System Documentation

This site uses a simple template-based build system to eliminate code duplication while maintaining static HTML output.

## Architecture

**Before (Duplication):**
- 5 HTML pages with repeated nav/footer (~285 lines duplicated)
- Changes required updating all files manually

**After (DRY with Templates):**
- Components: Reusable nav, footer in `src/components/`
- Content: Page-specific content in `src/pages/`
- Build: Script combines components + content → static HTML
- Output: Same static files, now generated from templates

## Directory Structure

```
miketineo.com/
├── src/                      # Source files (edit these)
│   ├── components/           # Reusable components
│   │   ├── nav.html          # Navigation
│   │   └── footer.html       # Footer
│   └── pages/                # Page-specific content
│       ├── index.html        # Homepage content
│       ├── about.html        # About page content
│       ├── experience.html   # Experience page content
│       ├── speaking.html     # Speaking page content
│       └── contact.html      # Contact page content
│
├── scripts/                  # Build scripts
│   ├── build-pages.js        # Builds main pages
│   └── build-blog.js         # Builds blog posts
│
├── blog/                     # Blog system
│   ├── posts/                # Markdown blog posts
│   └── generated/            # Generated blog HTML (gitignored)
│
├── *.html                    # Generated pages (output)
├── css/                      # Stylesheets
├── js/                       # JavaScript
└── assets/                   # Images, fonts, etc.
```

## Build System

### Scripts

**Build Everything:**
```bash
npm run build
```
Builds both pages and blog.

**Build Pages Only:**
```bash
npm run build:pages
```
Generates HTML pages from `src/` templates.

**Build Blog Only:**
```bash
npm run build:blog
```
Generates blog pages from markdown.

### How It Works

**`scripts/build-pages.js`:**
1. Reads components: `nav.html`, `footer.html`
2. Reads page content from `src/pages/*.html`
3. Combines: `<head>` + nav + content + footer
4. Sets active nav link based on page
5. Outputs: `index.html`, `about.html`, etc. to root

**Page Configuration:**
Each page has metadata (title, description, active nav) defined in `build-pages.js`.

**Example:**
```javascript
{
  name: 'about',
  title: 'About - Miguel Tineo',
  description: 'Learn about Miguel Tineo\'s journey...',
  activeNav: 'About'
}
```

## Workflow

### Editing Content

**To update page content:**
1. Edit files in `src/pages/*.html`
2. Run `npm run build:pages`
3. Test locally
4. Commit `src/pages/` changes
5. Push (GitHub Actions builds automatically)

**To update nav or footer:**
1. Edit `src/components/nav.html` or `footer.html`
2. Run `npm run build:pages`
3. All pages updated with new nav/footer

### Adding a New Page

1. Add page content to `src/pages/newpage.html`
2. Add configuration to `scripts/build-pages.js`:
   ```javascript
   {
     name: 'newpage',
     title: 'New Page - Miguel Tineo',
     description: 'Page description',
     activeNav: 'NewPage'
   }
   ```
3. Update nav in `src/components/nav.html` to include link
4. Run `npm run build:pages`
5. New page generated at `newpage.html`

### Blog Posts

Blog posts work the same as before:
1. Create markdown in `blog/posts/YYYY-MM-DD-title.md`
2. Run `npm run build:blog` (or `npm run build`)
3. Post generated in `blog/generated/`

## Deployment

**Local Development:**
```bash
npm run build          # Build pages + blog
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Production (Automatic):**
```bash
git add src/          # Add source changes
git commit -m "Update content"
git push origin main
# GitHub Actions:
#   1. Runs npm run build
#   2. Syncs to S3
#   3. Invalidates CloudFront
```

## Benefits

✅ **DRY**: Nav/footer defined once, used everywhere
✅ **Maintainable**: Change nav once → all pages update
✅ **Simple**: Still static HTML (no framework)
✅ **Fast**: Build takes <1 second
✅ **Version Control**: Source in git, build artifacts can be gitignored
✅ **Same Output**: Generated HTML identical to handwritten

## Migration Notes

**What Changed:**
- Added `src/` directory with components and page content
- Added `build-pages.js` script
- Updated GitHub Actions to run build before deploy

**What Stayed the Same:**
- Static HTML output (same files, same structure)
- CSS, JS, assets unchanged
- Blog system unchanged (already templated)
- Deployment process unchanged (S3 + CloudFront)
- No framework added (pure Node.js script)

## Troubleshooting

**Build fails:**
```bash
# Check for syntax errors in components
node scripts/build-pages.js

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Page looks broken:**
```bash
# Rebuild pages
npm run build:pages

# Check component files for errors
cat src/components/nav.html
cat src/components/footer.html
```

**Nav link not active:**
Check `activeNav` in page configuration matches link text in `nav.html`.

## Future Enhancements

Possible improvements (not yet implemented):

- [ ] Add CSS/JS minification to build
- [ ] Add HTML minification
- [ ] Generate sitemap automatically
- [ ] Add build caching for faster builds
- [ ] Support multiple layouts (if needed)

## Questions?

See `BACKLOG.md` for technical tasks or refer to the main `README.md` for project overview.
