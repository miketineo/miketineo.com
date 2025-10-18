# Content Workflow: Bear Essentials

**Purpose:** Document the complete bi-weekly content creation workflow for Miguel Tineo's blog and newsletter
**Last Updated:** 2025-10-18

---

## Table of Contents

1. [Overview](#overview)
2. [Bi-Weekly Timeline](#bi-weekly-timeline)
3. [Phase 1: Interview](#phase-1-interview-weekend)
4. [Phase 2: Draft Blog Post](#phase-2-draft-blog-post-monday-tuesday)
5. [Phase 3: Review & Revise](#phase-3-review--revise-wednesday)
6. [Phase 4: Publish Blog](#phase-4-publish-blog-thursday)
7. [Phase 5: Create Newsletter](#phase-5-create-newsletter-friday)
8. [Phase 6: Send Newsletter](#phase-6-send-newsletter-tuesday)
9. [File Organization](#file-organization)
10. [Helper Scripts](#helper-scripts)
11. [Troubleshooting](#troubleshooting)

---

## Overview

**Cadence:** Bi-weekly (one blog post + one newsletter every 2 weeks)

**Content Types:**
- **Blog Post:** 1200-1500 words, published on miketineo.com
- **Newsletter:** 150-200 words, sent via Buttondown to "Bear Essentials" subscribers

**AI Assistance:**
- **content-strategy-specialist agent:** Conducts interviews, creates content briefs
- **copy-writer agent:** Writes blog posts and newsletters from briefs

**Brand Promise:**
"The essential wisdom for modern builders—distilled, thoughtful, no fluff."

---

## Bi-Weekly Timeline

```
WEEK 1
├── Weekend    : Content interview (30-60 min)
├── Monday     : Review brief, start blog draft
├── Tuesday    : Complete blog draft
├── Wednesday  : Review & revise
└── Thursday   : Publish blog post

WEEK 2
├── Friday     : Create newsletter version
├── Monday     : [Buffer / work on next topic]
└── Tuesday    : Send newsletter
```

**Total time investment:** ~3-4 hours per cycle
- Interview: 30-60 min
- Review/revisions: 30-60 min
- Agent writing time: Automated
- Publishing/sending: 30 min

---

## Phase 1: Interview (Weekend)

**Goal:** Conduct content strategy interview and create comprehensive brief

**Duration:** 30-60 minutes

### Step 1: Prepare External Content

Before the interview, curate relevant sources:

1. Open `content-pipeline/external-content.md`
2. Review "To Read/Watch" section
3. Move relevant items to "Current Cycle" section
4. Add any new articles/podcasts/talks you've consumed

**Example:**
```markdown
## Current Cycle (Next Newsletter)

### Articles
- [x] **"Team Topologies" insights from Manuel Pais**
  - Link: https://example.com/article
  - Key insight: Conway's Law in practice
  - Potential use: Reference for post on team structure
  - Tags: #leadership, #teams
```

### Step 2: Run Content Strategy Interview

**In Claude Code:**

```
I want to write a blog post about [topic]. Can you use the content-strategy-specialist agent to interview me and create a content brief?
```

**The agent will:**
1. Ask 5-7 opening questions about the topic
2. Follow up with deeper questions about specific examples
3. Extract stories and frameworks
4. Reference external-content.md for sources
5. Create a comprehensive brief

**Your job:**
- Answer questions with specific examples
- Share concrete stories (with details: who, what, when, where)
- Provide metrics when available
- Be honest about failures and learnings

### Step 3: Review the Brief

The agent will save the brief to:
```
content-pipeline/content-briefs/YYYY-MM-DD-topic-slug.md
```

**Review checklist:**
- [ ] Story/hook is specific and compelling
- [ ] 3-5 key points are clear
- [ ] External sources are cited
- [ ] Practical takeaways are actionable
- [ ] Voice notes capture your authentic perspective

**If changes needed:**
Ask the agent to revise specific sections.

---

## Phase 2: Draft Blog Post (Monday-Tuesday)

**Goal:** Convert content brief into a 1200-1500 word blog post

**Duration:** Agent writes in minutes, you review/refine

### Step 1: Pass Brief to Copy-Writer

**In Claude Code:**

```
Please use the copy-writer agent to create a blog post from this content brief:
content-pipeline/content-briefs/YYYY-MM-DD-topic-slug.md
```

**The agent will:**
1. Read the content brief
2. Consult `content-pipeline/VOICE_GUIDELINES.md`
3. Write the blog post in your voice
4. Save to `content-pipeline/drafts/YYYY-MM-DD-topic-slug.md`

### Step 2: Review the Draft

**Read through the draft and check:**

- [ ] **Voice:** Does it sound like you?
- [ ] **Structure:** Clear sections with headers?
- [ ] **Specifics:** Concrete examples and metrics?
- [ ] **Actionable:** Clear next steps for readers?
- [ ] **Scannable:** Short paragraphs, bullets, formatting?

**Common revisions:**
- "Make the opening story more specific"
- "Add more detail to the second example"
- "Simplify the explanation in section 3"
- "Make the CTA more actionable"

### Step 3: Iterate

**For revisions:**

```
Can you revise the blog post draft? Changes:
1. Make the opening story include more dialogue
2. Add specific metrics to the second example
3. Break the third section into two subsections
```

**Save iterations:**
The agent will update the draft file with each revision.

---

## Phase 3: Review & Revise (Wednesday)

**Goal:** Final polish before publication

**Duration:** 30 minutes

### Step 1: Fresh Eyes Review

Read the latest draft with fresh perspective:

- Read it out loud (catches awkward phrasing)
- Check all links work
- Verify external sources are properly cited
- Confirm metrics and dates are accurate

### Step 2: Final Checks

**Voice & Tone:**
- [ ] Sounds like you (not generic or corporate)
- [ ] Active voice, strong verbs
- [ ] Personal pronouns (I, you)
- [ ] No jargon without explanation

**Content Quality:**
- [ ] Teaches something valuable
- [ ] Includes specific examples
- [ ] Backed by evidence/data
- [ ] Clear practical takeaways

**Format & Polish:**
- [ ] Spell check, grammar check
- [ ] Consistent header levels (## for sections, ### for subsections)
- [ ] Frontmatter is complete (title, date, excerpt, tags)
- [ ] Footer includes newsletter subscribe CTA

### Step 3: Finalize

Once satisfied, the draft is ready for publication.

---

## Phase 4: Publish Blog (Thursday)

**Goal:** Move blog post to production and deploy

**Duration:** 15 minutes

### Step 1: Move Draft to Blog Posts

**Option A: Using Helper Script**

```bash
# Create new blog post file
./scripts/new-blog-post.sh topic-slug \
  "Full Title Here" \
  "Brief excerpt for preview" \
  tag1,tag2,tag3

# Then copy content from draft to new post
```

**Option B: Manual**

```bash
cp content-pipeline/drafts/YYYY-MM-DD-topic-slug.md blog/posts/YYYY-MM-DD-topic-slug.md
```

### Step 2: Build and Test Locally

```bash
# Build blog
npm run build:blog

# Start local server
python3 -m http.server 8000

# Visit http://localhost:8000/blog/
# Verify:
# - Post appears in index
# - Individual post page works
# - Formatting looks correct
# - Links work
```

### Step 3: Deploy

```bash
# Commit and push
git add blog/posts/YYYY-MM-DD-topic-slug.md
git commit -S -m "Add blog post: [Title]"
git push origin main

# GitHub Actions will:
# 1. Build blog and pages
# 2. Sync to S3
# 3. Invalidate CloudFront cache
```

### Step 4: Verify Live

- Visit https://miketineo.com/blog/
- Check post appears
- Click through to individual post
- Test all links
- Verify on mobile

---

## Phase 5: Create Newsletter (Friday)

**Goal:** Create 150-200 word newsletter version

**Duration:** 20 minutes

### Step 1: Request Newsletter Version

**In Claude Code:**

```
Please use the copy-writer agent to create a Bear Essentials newsletter from this blog post:
blog/posts/YYYY-MM-DD-topic-slug.md

Use the content brief for context:
content-pipeline/content-briefs/YYYY-MM-DD-topic-slug.md
```

**The agent will:**
1. Read the full blog post
2. Consult the content brief for newsletter adaptation notes
3. Condense to 150-200 words
4. Save to `content-pipeline/drafts/newsletter-YYYY-MM-DD-topic-slug.md`

### Step 2: Review Newsletter

**Check:**
- [ ] **Length:** 150-200 words (strict)
- [ ] **Opening:** Grabs attention in 1-2 sentences
- [ ] **Core:** One clear insight (not multiple points)
- [ ] **Takeaway:** One actionable step
- [ ] **CTA:** Engaging (reply, share, discuss)
- [ ] **Link:** Includes link to full blog post
- [ ] **Signature:** "— Miguel" (em dash, not hyphen)

**Use template as reference:**
`content-pipeline/templates/newsletter-template.md`

### Step 3: Test Send

**In Buttondown:**

1. Log in to https://buttondown.email
2. Click "New email"
3. Copy newsletter content
4. Add subject line (under 50 characters)
5. **Send test email to yourself**
6. Review on desktop and mobile
7. Check all links work

**If revisions needed:**
Ask copy-writer agent to adjust, then re-test.

---

## Phase 6: Send Newsletter (Tuesday)

**Goal:** Send newsletter to subscribers

**Duration:** 10 minutes

### Why Tuesday?

- Blog published Thursday (Week 1)
- Newsletter sends Tuesday (Week 2)
- Gives readers time to discover blog organically first
- Tuesday has better open rates than Friday

### Step 1: Final Review

- Re-read newsletter one last time
- Verify blog post link is correct
- Check subject line is compelling

### Step 2: Send via Buttondown

**Options:**

**Option A: Send Immediately**
1. In Buttondown draft, click "Send now"
2. Confirm send to all subscribers

**Option B: Schedule Send**
1. Click "Schedule"
2. Choose Tuesday 9am (subscriber's timezone if available)
3. Confirm schedule

### Step 3: Monitor

**First hour after send:**
- Check for bounce reports
- Monitor replies
- Watch open rate (target: >30%)

**After 24 hours:**
- Check click-through rate (target: >10%)
- Note which topics get most engagement
- Read and respond to replies

### Step 4: Archive Content

Once newsletter is sent:

```bash
# Archive all related files
./scripts/archive-content.sh YYYY-MM-DD-topic-slug

# This moves to archive/:
# - content-briefs/YYYY-MM-DD-topic-slug.md → archive/YYYY-MM-DD-topic-slug/content-brief.md
# - drafts/YYYY-MM-DD-topic-slug.md → archive/YYYY-MM-DD-topic-slug/blog-draft.md
# - drafts/newsletter-YYYY-MM-DD-topic-slug.md → archive/YYYY-MM-DD-topic-slug/newsletter-draft.md
```

### Step 5: Update Tracking

Update `BACKLOG.md` or external-content.md:

```markdown
## Used in Published Content

### YYYY-MM-DD - [Post Title]
- ✅ Published: https://miketineo.com/blog/[slug]
- ✅ Newsletter sent: [Date]
- 📊 Stats: Open rate X%, CTR Y%
- Sources used:
  - [Source 1]
  - [Source 2]
```

---

## File Organization

```
miketineo.com/
├── content-pipeline/
│   ├── VOICE_GUIDELINES.md        # Miguel's voice & tone reference
│   ├── external-content.md        # Curated sources tracking
│   ├── content-briefs/            # Interview outputs
│   │   └── YYYY-MM-DD-topic.md
│   ├── drafts/                    # Work in progress
│   │   ├── YYYY-MM-DD-topic.md            (blog drafts)
│   │   └── newsletter-YYYY-MM-DD-topic.md (newsletter drafts)
│   ├── archive/                   # Published content
│   │   └── YYYY-MM-DD-topic/
│   │       ├── content-brief.md
│   │       ├── blog-draft.md
│   │       └── newsletter-draft.md
│   └── templates/
│       ├── content-brief-template.md
│       └── newsletter-template.md
│
├── blog/
│   ├── posts/                     # Published blog posts
│   │   └── YYYY-MM-DD-topic.md
│   └── generated/                 # Built HTML (gitignored)
│
├── .claude/agents/
│   ├── content-strategy-specialist.md
│   └── copy-writer.md
│
└── scripts/
    ├── create-content-brief.sh
    ├── new-blog-post.sh
    ├── archive-content.sh
    ├── build-blog.js
    └── build-pages.js
```

---

## Helper Scripts

### Create Content Brief

**Usage:**
```bash
./scripts/create-content-brief.sh topic-slug
```

**Example:**
```bash
./scripts/create-content-brief.sh incident-response-leadership

# Creates: content-pipeline/content-briefs/2025-10-20-incident-response-leadership.md
```

**When to use:**
- Before starting a content interview
- Generates file with today's date automatically
- Copies from template

---

### Create New Blog Post

**Usage:**
```bash
./scripts/new-blog-post.sh slug "Title" "Excerpt" tag1,tag2
```

**Example:**
```bash
./scripts/new-blog-post.sh psychological-safety \
  "Building Psychological Safety in Remote Teams" \
  "Learn practical strategies for creating trust in distributed teams" \
  leadership,remote-work,culture

# Creates: blog/posts/2025-10-20-psychological-safety.md
```

**When to use:**
- When moving draft to publication
- Automatically includes frontmatter template
- Generates file with today's date

---

### Archive Content

**Usage:**
```bash
./scripts/archive-content.sh YYYY-MM-DD-topic-slug
```

**Example:**
```bash
./scripts/archive-content.sh 2025-10-20-psychological-safety

# Moves to archive/2025-10-20-psychological-safety/:
# - content-brief.md
# - blog-draft.md
# - newsletter-draft.md
```

**When to use:**
- After newsletter is sent
- Cleans up drafts and briefs
- Preserves all content for reference

---

## Troubleshooting

### Problem: Agent's voice doesn't sound like me

**Solution:**
1. Review `content-pipeline/VOICE_GUIDELINES.md`
2. Add specific examples from the interview to the brief
3. Tell the agent: "Make this sound more like me. Use active voice, be more direct, add a specific metric to the example."
4. Reference a past post: "Match the tone of blog/posts/2025-01-15-psychological-safety.md"

---

### Problem: Blog post is too long (>1600 words)

**Solution:**
1. Identify which section can be cut or condensed
2. Ask: "Condense section 3 to focus only on the most important point"
3. Or: "This post is too long. Keep the opening story and first 2 key points, cut the rest. We can do a Part 2 later."
4. Better to publish 1200 words of solid content than 1600 words of diluted content

---

### Problem: Newsletter is too long (>200 words)

**Solution:**
1. Cut the middle, not the hook or CTA
2. Focus on ONE key insight, not multiple
3. Remove explanations (save for blog)
4. Ask: "Cut this to exactly 175 words. Keep the opening story and the actionable takeaway. Link to blog for details."

---

### Problem: Can't think of a topic

**Solution:**
1. Review recent work experiences:
   - "What challenged me this week?"
   - "What did I learn that surprised me?"
   - "What mistake did I or my team make?"
   - "What question do people keep asking me?"

2. Check external-content.md:
   - What articles resonated?
   - What do you agree/disagree with?
   - What can you add to the conversation?

3. Look at BACKLOG.md future ideas

4. Ask content-strategy-specialist agent:
   "I'm not sure what to write about. Can you ask me some questions to help surface a good topic?"

---

### Problem: Blog build fails

**Check:**
```bash
# Test build
npm run build:blog

# Common issues:
# - Missing frontmatter
# - Invalid YAML syntax
# - Unclosed markdown code blocks
# - Special characters in title/excerpt
```

**Fix frontmatter:**
```yaml
---
title: "Use quotes for titles with: colons"
date: 2025-10-20           # YYYY-MM-DD format
excerpt: "Keep under 160 characters"
tags: ["tag1", "tag2"]     # Array format, quoted
---
```

---

### Problem: Newsletter subscribers not receiving emails

**Check in Buttondown:**
1. Subscribers → Verify list is active
2. Email → Check sender domain is verified
3. Sent emails → Check delivery status
4. Test with your own email first

**Common issues:**
- Email in draft mode (not sent)
- Scheduled for wrong time/timezone
- Sender domain not verified
- Subscribers unsubscribed or bounced

---

### Problem: External sources not loading

**Check:**
1. `content-pipeline/external-content.md` has current sources
2. Links are not broken
3. Content is tagged correctly

**Add new source:**
```markdown
## Current Cycle

### Articles
- [ ] **"Article Title"**
  - Link: https://example.com
  - Source: Author Name
  - Key insight: What stood out
  - Potential use: Where to cite this
  - Tags: #leadership
```

---

## Quick Reference: Complete Cycle Checklist

### Week 1

- [ ] **Weekend:** Curate external sources
- [ ] **Weekend:** Run content-strategy-specialist interview (30-60 min)
- [ ] **Weekend:** Review and approve content brief
- [ ] **Monday:** Pass brief to copy-writer agent for blog draft
- [ ] **Monday:** Review blog draft, request revisions if needed
- [ ] **Tuesday:** Finalize blog post
- [ ] **Wednesday:** Fresh eyes review, final polish
- [ ] **Thursday:** Move to blog/posts/, build, test, deploy
- [ ] **Thursday:** Verify live on miketineo.com/blog/

### Week 2

- [ ] **Friday:** Request newsletter version from copy-writer
- [ ] **Friday:** Review newsletter, test send to yourself
- [ ] **Tuesday:** Final review of newsletter
- [ ] **Tuesday:** Send via Buttondown (or schedule)
- [ ] **Tuesday:** Monitor first hour (bounces, replies)
- [ ] **Tuesday:** Archive content with script
- [ ] **Tuesday:** Update BACKLOG.md with stats

---

## Tips for Success

1. **Batch external content curation:** Spend 15 min weekly adding to external-content.md
2. **Schedule interviews:** Block weekend time for consistency
3. **Trust the agents:** They're trained on your voice, let them draft
4. **Iterate quickly:** Better to revise 3x quickly than perfect on first try
5. **Track what works:** Note which topics get most engagement
6. **Build a backlog:** Keep list of future topic ideas
7. **Don't skip archiving:** Future you will thank present you
8. **Respond to replies:** Newsletter engagement builds community
9. **Review stats:** Learn from open rates, click rates, replies
10. **Have fun:** Share what you genuinely find interesting

---

## Resources

- **Voice Guidelines:** `content-pipeline/VOICE_GUIDELINES.md`
- **Newsletter Setup:** `NEWSLETTER_SETUP.md`
- **Build System:** `BUILD_README.md`
- **Task Tracking:** `BACKLOG.md`

---

**Questions or Issues?**

If this workflow isn't working:
1. Check troubleshooting section above
2. Review agent prompts in `.claude/agents/`
3. Update this document with improvements
4. Iterate and refine based on what works

The best workflow is the one you'll actually use. Adjust as needed.
