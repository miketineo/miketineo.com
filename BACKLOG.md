# miketineo.com Backlog

Task tracking for website and content operations.

**Status Definitions:**
- **Pending**: Not started, waiting to be picked up
- **In Progress**: Currently being worked on
- **Done**: Completed
- **Rejected**: Decided not to pursue (with reason)

---

## Pending

### #tech - Technical/Infrastructure Tasks
-

### #content - Content Creation Tasks
-

### #growth - Marketing/Distribution Tasks
-

---

## In Progress

### #tech
-

### #content
-

### #growth
-

---

## Done

### #tech
- [x] **DRY up nav/footer across pages**
  - Completed: 2025-10-18
  - Result: Template-based build system, eliminated ~285 lines of duplicated code
  - PR: Merged to main
  - Files: src/ structure, build-pages.js, BUILD_README.md

- [x] **Launch blog system with markdown**
  - Completed: 2025-01-18
  - Result: Markdown-to-HTML build script, automated via GitHub Actions

- [x] **Integrate Buttondown newsletter**
  - Completed: 2025-01-18
  - Result: Custom form submitting to Buttondown, "Bear Essentials" branding

- [x] **Fix DNS for apex domain (miketineo.com)**
  - Completed: 2025-01-18
  - Result: New SSL certificate, CloudFront updated, Cloudflare DNS configured

### #content
- [x] **Complete content pipeline implementation**
  - Completed: 2025-10-18
  - Result: Full bi-weekly workflow with AI assistance
  - Deliverables:
    - Voice guidelines extracted from existing content
    - content-strategy-specialist agent for interviews
    - Enhanced copy-writer agent with brief integration
    - Content brief template
    - Newsletter template (Bear Essentials format)
    - Helper scripts (create-brief, new-post, archive)
    - Complete workflow documentation (CONTENT_WORKFLOW.md)
  - Files: content-pipeline/, .claude/agents/, scripts/, CONTENT_WORKFLOW.md

- [x] **Create first blog post**
  - Completed: 2025-01-15
  - Result: "Building Psychological Safety in Remote Teams" published

- [x] **Create content strategy specialist agent**
  - Completed: 2025-01-18
  - Result: Agent for conducting content interviews and creating briefs

- [x] **Setup content pipeline structure**
  - Completed: 2025-01-18
  - Result: Folders, external content tracking, agent integration

---

## Rejected

### #tech
- [x] **Add database to website**
  - Rejected: 2025-01-18
  - Reason: Unnecessary complexity. Markdown files serve as database. No dynamic data requirements.

- [x] **Use framework (Next.js/Nuxt/Astro)**
  - Rejected: 2025-01-18
  - Reason: Overkill for 6 pages. Static site is simpler, faster, cheaper. Current setup scales fine.

---

## Content Pipeline Tracker

Track bi-weekly blog posts and newsletter sends.

### Current Cycle (In Progress)

**Target Dates:**
- Interview: [Weekend date]
- Blog publish: [Thursday date]
- Newsletter send: [Tuesday date]

**Status:**
- [ ] Content interview completed
- [ ] Content brief created
- [ ] Blog draft written
- [ ] Blog draft reviewed
- [ ] Blog published
- [ ] Newsletter drafted
- [ ] Newsletter sent
- [ ] Content archived

**Topic:** [Topic name when decided]
**Brief:** [Link to content-pipeline/content-briefs/YYYY-MM-DD-slug.md]

---

### Published Content

#### 2025-01-15 - Building Psychological Safety in Remote Teams
- ✅ Blog: https://miketineo.com/blog/psychological-safety
- ✅ Newsletter: Sent [date if sent]
- 📊 Stats: [Open rate, CTR when available]
- Tags: leadership, remote-work, culture

---

### Upcoming Topics Queue

Ideas for future blog posts (in priority order):

1. [Topic idea 1]
2. [Topic idea 2]
3. [Topic idea 3]

---

## Future Ideas (Not Yet Planned)

Ideas that might become tasks later:

### Content
- Speaking page with embedded videos (when available)
- Case studies section for engineering projects
- Reading list / resource page

### Technical
- Dark mode improvements
- RSS feed for blog
- Search functionality (only if blog grows to 50+ posts)
- Comments system (Giscus or similar)

### Growth
- LinkedIn automation for cross-posting
- Analytics dashboard (if needed)
- Email sequence for new subscribers

---

## How to Use This File

**Adding Tasks:**
1. Choose category: #tech, #content, or #growth
2. Add to "Pending" section
3. Include: Description, Impact, Effort, Priority
4. Move to "In Progress" when starting
5. Move to "Done" when completed (with date)

**Rejecting Tasks:**
1. Move to "Rejected" section
2. Add date and clear reason
3. This prevents re-considering bad ideas

**Template for New Task:**
```markdown
- [ ] **Task Title**
  - Description: What needs to be done
  - Impact: Why this matters
  - Effort: Time estimate
  - Priority: High/Medium/Low
  - Notes: Any additional context
```

---

**Last Updated:** 2025-10-18
