# Blog System Usage Guide

This blog uses a simple Markdown-to-HTML static site generator. Write in Markdown, commit to git, and deploy automatically.

## Quick Start: Writing a New Blog Post

### 1. Create a New Markdown File

Create a file in `blog/posts/` with this naming convention:
```
blog/posts/YYYY-MM-DD-url-slug.md
```

**Example:**
```
blog/posts/2025-01-29-effective-1on1s.md
```

### 2. Add Frontmatter

Every blog post must start with YAML frontmatter:

```markdown
---
title: "Your Blog Post Title"
date: 2025-01-29
excerpt: "A brief 1-2 sentence description that appears in listings and social media"
tags: ["leadership", "management", "1on1s"]
---

Your blog post content starts here...
```

**Required fields:**
- `title`: The post title (will appear in `<h1>`)
- `date`: Publication date in YYYY-MM-DD format
- `excerpt`: Short description (used in blog index and social media)
- `tags`: Array of topic tags (1-5 tags recommended)

### 3. Write Your Content in Markdown

Use standard Markdown syntax:

```markdown
## Heading 2
### Heading 3

Regular paragraph text with **bold** and *italic*.

- Bullet point 1
- Bullet point 2

1. Numbered list
2. Another item

[Link text](https://example.com)

> Blockquote for emphasis or quotes

`Inline code` for technical terms

` ` `javascript
// Code blocks for longer code samples
function example() {
  return "hello world";
}
` ` `
```

*(Remove spaces between backticks for actual code blocks)*

### 4. Build & Preview Locally

```bash
# Build the blog
npm run build:blog

# The script will:
# - Generate HTML for each post in blog/generated/
# - Update blog/index.html with post listings
# - Create blog/posts.json with metadata
```

Preview by opening `blog/index.html` in your browser or serving locally:
```bash
# Option 1: Simple Python server
python3 -m http.server 8000

# Option 2: npx serve
npx serve .

# Then visit http://localhost:8000/blog/
```

### 5. Deploy

Commit and push to `main` branch:

```bash
git add .
git commit -m "Add blog post: [Your Title]"
git push origin main
```

GitHub Actions will automatically:
1. Install Node.js dependencies
2. Build the blog
3. Sync to S3
4. Invalidate CloudFront cache

Your blog post will be live at:
```
https://miketineo.com/blog/generated/your-slug.html
```

## Audio Narrations (Optional)

Any post can ship with an AI-generated audio version. The generator synthesizes
one MP3 per opted-in post using Amazon Polly, caches results by content hash,
and the blog builder renders a native `<audio>` player at the top and bottom of
the post page. Everything stays static — there is no runtime backend.

### 1. Opt a post in

Add `audio: true` to the frontmatter:

```yaml
---
title: "Your Post"
date: 2026-04-09
excerpt: "…"
tags: ["…"]
audio: true
audioVoice: Matthew       # optional Polly voice ID, defaults to Matthew
audioTitle: "Listen to this article"  # optional
audioIntro: "A short intro read before the post body."  # optional
---
```

Polly neural voice suggestions: `Matthew`, `Stephen`, `Gregory` (male);
`Ruth`, `Joanna`, `Danielle` (female). See the full list with
`aws polly describe-voices --language-code en-US`.

### 2. Install the local dependencies

- AWS CLI v2 on your `PATH` (`brew install awscli`, verify with `aws --version`)
- `ffmpeg` and `ffprobe` on your `PATH` (`brew install ffmpeg` on macOS)
- An AWS profile with `polly:SynthesizeSpeech` permission — this repo uses
  `tineo-labs-deploy` (the same profile as the S3 deploy user)

### 3. Generate the audio

```bash
export AWS_PROFILE=tineo-labs-deploy
npm run build:audio
```

The script:

- reads every post in `blog/posts/` and filters to `audio: true`
- builds a narration script from the markdown (strips code blocks, unwraps
  formatting, and announces list items)
- splits long text into Polly-safe chunks (max 3000 chars per request)
- calls `aws polly synthesize-speech` and merges chunks with `ffmpeg`
- writes `blog/audio/<slug>.mp3` and a cache entry in
  `blog/audio/.audio-manifest.json`

Re-running with unchanged content is a no-op thanks to the content-hash cache.
To force a regeneration, delete the matching entry from the manifest (or the
`.mp3` file) and run `build:audio` again.

### 4. Rebuild the blog

```bash
npm run build:blog
# or do both at once:
npm run build
```

The generated HTML picks up the audio player automatically, and
`blog/posts.json` gains `hasAudio`, `audioUrl`, and `audioDurationSeconds`
fields for any posts with a matching manifest entry.

### Optional environment overrides

| Variable | Default | Purpose |
|---|---|---|
| `AWS_PROFILE` | `tineo-labs-deploy` | AWS CLI profile used for the Polly call |
| `BLOG_AUDIO_ENGINE` | `neural` | Polly engine (`standard`, `neural`, `long-form`, `generative`) |
| `BLOG_AUDIO_VOICE` | `Matthew` | Fallback voice ID when `audioVoice` is not set in frontmatter |

### Deploying audio

`blog/audio/` is tracked in git — commit the generated MP3s and manifest along
with the post so the S3 deploy picks them up. There is no CI secret and no
Polly call during deploy; everything the site needs is a byte-for-byte copy of
what you validated locally.

## Blog Post Template

Copy this template for new posts:

```markdown
---
title: "Your Compelling Title Here"
date: 2025-MM-DD
excerpt: "A concise summary that makes people want to read more. Keep it under 160 characters for SEO."
tags: ["tag1", "tag2", "tag3"]
---

## Introduction

Hook your readers with a compelling opening. Why should they care about this topic?

## Main Content

Break your post into clear sections with H2 headings.

### Subsections (H3)

Use H3 for subtopics within sections.

## Key Takeaways

Summarize the main points:

- Bullet point 1
- Bullet point 2
- Bullet point 3

## What's Next?

End with a call-to-action. What should readers do next?

---

*This post is part of a bi-weekly series on engineering leadership. [Subscribe to the newsletter](/blog/) to get the next post delivered to your inbox.*
```

## Best Practices

### Writing Tips

1. **Start with a strong hook**: First paragraph should grab attention
2. **Use concrete examples**: Real stories > abstract concepts
3. **Break up text**: Short paragraphs, bullet points, headers
4. **Include actionable takeaways**: Readers should leave with something to try
5. **End with engagement**: Question, call-to-action, or next steps

### SEO & Metadata

- **Title**: 50-60 characters ideal
- **Excerpt**: 120-160 characters (used for meta description)
- **Tags**: 2-5 relevant tags maximum
- **Headings**: Use H2 and H3 for structure (H1 is auto-generated from title)
- **Links**: Include internal links to your other pages/posts
- **Images**: *(Future enhancement - not yet implemented)*

### Publishing Schedule

**Bi-Weekly Cadence:**
- Week 1: Draft and edit
- Week 2: Publish and send newsletter

**Recommended publish days:**
- Tuesday, Wednesday, or Thursday
- Avoid Mondays (people catching up) and Fridays (winding down)
- Mid-week typically gets better engagement

### Content Ideas (Planned)

1. ✅ Building psychological safety in remote teams
2. ⏳ The engineering manager's guide to 1-on-1s
3. ⏳ Scaling microservices: lessons from the trenches
4. ⏳ Career development frameworks for engineers
5. ⏳ Cloud cost optimization strategies that actually work

## File Structure

```
blog/
├── index.html              # Blog listing page (auto-generated)
├── posts.json              # Metadata for all posts (auto-generated)
├── posts/                  # Your markdown files (version controlled)
│   ├── 2025-01-15-psychological-safety.md
│   ├── 2025-01-29-effective-1on1s.md
│   └── ...
└── generated/              # HTML output (auto-generated, git-ignored)
    ├── psychological-safety.html
    ├── effective-1on1s.html
    └── ...
```

## Troubleshooting

### Build fails locally

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run build with verbose output
node scripts/build-blog.js
```

### Blog post not appearing

1. Check frontmatter syntax (must be valid YAML)
2. Verify file is in `blog/posts/` directory
3. Ensure file extension is `.md`
4. Run `npm run build:blog` and check for errors

### Links not working

- Use absolute paths from root: `/blog/`, `/contact.html`
- Or use relative paths: `../contact.html`
- External links need full URL: `https://example.com`

### Markdown not rendering correctly

- Check for unclosed code blocks (` ` `)
- Verify list formatting (blank line before lists)
- Ensure headings have space after `#`: `## Heading` not `##Heading`

## Future Enhancements (Optional)

- [ ] RSS feed generation for newsletter automation
- [ ] Image upload and optimization
- [ ] Related posts suggestions
- [ ] Reading time estimation (already included!)
- [ ] Tag archive pages
- [ ] Search functionality
- [ ] Comments system (e.g., Disqus, Giscus)
- [ ] Social sharing buttons
- [ ] Table of contents for long posts

## Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)
- [Blog Writing Best Practices](https://www.grammarly.com/blog/how-to-write-a-blog-post/)
- [SEO for Blog Posts](https://backlinko.com/hub/seo/seo-copywriting)

## Questions?

The blog system is intentionally simple. If you need help or want to add features, check:
- `scripts/build-blog.js` - The blog builder script
- `NEWSLETTER_SETUP.md` - Newsletter integration guide
- `CLAUDE.md` - Project-specific instructions for Claude Code
