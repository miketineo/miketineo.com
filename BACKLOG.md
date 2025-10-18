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
- [ ] **DRY up nav/footer across pages** (PR: feature/dry-templates)
  - Description: Extract navigation and footer into reusable templates/components
  - Impact: Eliminate ~285 lines of duplicated code
  - Approach: Created `src/` structure with components, build-pages.js script
  - Status: Implementation complete, testing in progress
  - PR Branch: feature/dry-templates

---

## Done

### #tech
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

**Last Updated:** 2025-01-18
