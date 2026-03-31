# Runbook: miketineo.com Content Operations

**Owner:** Miguel Tineo | **Frequency:** Bi-weekly
**Last Updated:** 2026-03-17 | **Last Run:** 2025-11-03

---

## Purpose

End-to-end operational runbook for the "Bear Essentials" content cycle: content interview → blog post → newsletter → archive. Covers the current manual workflow AND identifies automation gaps to close with Cowork connectors.

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git access to `git@github.com:miketineo/miketineo.com.git`
- [ ] AWS credentials configured (S3 + CloudFront)
- [ ] Buttondown account access (buttondown.email)
- [ ] Claude Code with agents configured (`.claude/agents/`)

---

## Current Bi-Weekly Procedure

### Phase 1: Content Interview (Weekend, ~30-60 min)

**Trigger:** Start of new content cycle

```
# In Claude Code:
/content-start
```

**What happens:**
1. Agent checks pipeline status (briefs, drafts, pending newsletters)
2. Creates new brief file: `content-pipeline/content-briefs/YYYY-MM-DD-topic.md`
3. Launches `content-strategy-specialist` agent for 45-60 min interview
4. Agent asks 5-7 opening questions, deepens with story extraction
5. Outputs comprehensive content brief

**Pre-interview prep:**
- Update `content-pipeline/external-content.md` with recent reads/sources
- Have a topic in mind (or let the agent surface one from backlog)

**Expected result:** Brief file in `content-pipeline/content-briefs/`
**If it fails:** Manually create brief using `scripts/create-content-brief.sh`

---

### Phase 2: Blog Draft (Mon-Tue)

```
# In Claude Code:
/content-draft
```

**What happens:**
1. `copy-writer` agent reads the brief + voice guidelines
2. Produces 1200-1500 word blog draft
3. Saves to `content-pipeline/drafts/YYYY-MM-DD-topic.md`

**Expected result:** Draft with proper frontmatter (title, date, author, tags, description)
**If it fails:** Check that brief exists and voice guidelines are at `content-pipeline/VOICE_GUIDELINES.md`

---

### Phase 3: Review & Revise (Wednesday)

**Manual step** — Read the draft, request revisions from the copy-writer agent.

Checklist:
- [ ] Tone matches voice guidelines (70% warm / 30% formal)
- [ ] 1200-1500 word count
- [ ] Has: Hook → Context → Framework (3-5 strategies) → How to Measure → Takeaways → CTA
- [ ] Frontmatter complete (title, date, author, tags, description)
- [ ] No hallucinated stats or references

---

### Phase 4: Publish Blog (Thursday)

```
# In Claude Code:
/content-publish
```

**What happens:**
1. Moves draft to `blog/posts/YYYY-MM-DD-topic.md`
2. Runs `npm run build:blog` (generates HTML + updates blog index + posts.json)
3. Tests locally via HTTP server
4. Creates signed git commit (`git commit -S`)
5. Pushes to `main`

**Deployment (automatic):**
- GitHub Actions picks up push to `main`
- Builds site → syncs to S3 → invalidates CloudFront cache
- Auto-detects new blog post, creates GitHub summary

**Expected result:** Post live at `https://miketineo.com/blog/topic-slug.html`
**If it fails:** Check GitHub Actions run, verify AWS secrets, check build output

---

### Phase 5: Create Newsletter (Friday of Week 2)

```
# In Claude Code:
/content-newsletter
```

**What happens:**
1. Finds latest published blog post
2. `copy-writer` agent condenses to 150-200 words (strict)
3. Generates subject line suggestions
4. Saves to `content-pipeline/drafts/newsletter-YYYY-MM-DD-topic.md`

**Expected result:** Newsletter draft following Bear Essentials template
**If it fails:** Check `content-pipeline/templates/newsletter-template.md` for format reference

---

### Phase 6: Send Newsletter (Tuesday of Week 2)

**⚠️ MANUAL — No automation currently**

1. Open Buttondown dashboard
2. Create new email
3. Copy-paste newsletter content
4. Set subject line
5. Preview and send (or schedule for Tuesday 9am)

**Expected result:** Email sent to subscribers
**Target metrics:** >30% open rate, >10% CTR

---

### Phase 7: Archive

```
# In Claude Code:
/content-archive
```

**What happens:**
1. Runs `scripts/archive-content.sh`
2. Moves briefs + drafts to `content-pipeline/archive/YYYY-MM-DD-topic/`
3. Updates BACKLOG.md with stats

---

## Verification

After each full cycle:

- [ ] Blog post accessible at `https://miketineo.com/blog/topic-slug.html`
- [ ] Blog index page updated at `https://miketineo.com/blog/`
- [ ] `blog/posts.json` includes new post
- [ ] Newsletter sent and confirmed in Buttondown dashboard
- [ ] Content archived, pipeline clean for next cycle
- [ ] BACKLOG.md updated with published content entry

---

## Connector & Automation Gaps

### Current Cowork Connections
| Tool | Status | Used For |
|------|--------|----------|
| Slack | ✅ Connected | Team comms |
| Jira/Confluence | ✅ Connected | Project tracking |
| Google Drive | ✅ Connected | Doc access |
| Gmail | ✅ Connected | Email |
| Granola | ✅ Connected | Meeting transcripts |
| Filesystem | ✅ Connected | Local file ops |

### Missing Connectors Needed

#### 1. GitHub (CRITICAL)
**Why:** Currently can't create PRs, review code, or trigger releases from Cowork.
**Impact:** Publishing requires switching to terminal for git push, can't review article PRs in Cowork.
**MCP Registry Status:** ❌ Not available as remote connector
**Workaround Options:**
- Use `gh` CLI via Bash tool in Claude Code
- Build a custom MCP server wrapping `gh` CLI
- Use the Claude in Chrome browser tools to interact with GitHub UI

**Desired capabilities:**
- Create PR for blog post review before merging to main
- View GitHub Actions status after deploy
- Create releases / tags for content milestones

#### 2. Buttondown (CRITICAL)
**Why:** Newsletter send is fully manual (copy-paste into UI). This is the biggest friction point.
**Impact:** Every cycle requires leaving Cowork to manually compose in Buttondown.
**MCP Registry Status:** ❌ Not available
**Workaround Options:**
- Buttondown has a REST API — could build a custom MCP server
- Use Claude in Chrome to navigate Buttondown UI
- Use `curl` to hit Buttondown API directly from scripts

**Buttondown API endpoints needed:**
- `POST /v1/emails` — create/send email
- `GET /v1/subscribers` — check subscriber count
- `GET /v1/emails` — check sent emails / stats

#### 3. Scheduled Tasks / Periodic Interview Trigger (HIGH)
**Why:** The content interview should fire bi-weekly automatically (or at least remind you).
**Impact:** Currently relies on memory to kick off `/content-start`.
**Options:**
- Use the `/schedule` skill in Cowork to create a periodic reminder
- Calendar event (already documented in AUTOMATION_SETUP.md)
- GitHub Actions scheduled workflow to create an issue as reminder

---

## Recommended Next Steps

### Quick Wins (do now)
1. **Set up a scheduled task** via `/schedule` skill — bi-weekly reminder to run `/content-start`
2. **Use Claude in Chrome** for Buttondown sends until a proper MCP exists
3. **Add a PR step** to `/content-publish` — push to a branch, open PR via `gh pr create`, merge after review

### Medium Term
4. **Build Buttondown MCP server** — wrap their API for send/schedule/stats
5. **Add GitHub Actions workflow** for newsletter reminder (cron trigger → issue creation)
6. **Create `/content-send` command** that handles Buttondown API call directly

### Longer Term
7. **Full cycle automation** — one command that chains: draft → build → PR → review → merge → deploy → newsletter → archive
8. **Analytics integration** — pull Buttondown stats + Mixpanel blog views into a content dashboard
9. **RSS feed** — auto-generate from posts.json (already in future ideas)

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Build fails on `npm run build:blog` | Missing dependency or bad frontmatter | Run `npm install`, check post frontmatter YAML |
| GitHub Actions deploy fails | Expired AWS secrets | Rotate keys in repo Settings → Secrets |
| CloudFront still showing old content | Cache not invalidated | Check GH Actions logs, manually invalidate via AWS CLI |
| Blog post not in index | Post missing date prefix in filename | Rename to `YYYY-MM-DD-slug.md` format |
| Newsletter draft too long | Copy-writer didn't respect 150-200 limit | Re-run `/content-newsletter` with explicit word count reminder |
| Agent can't find brief | Wrong path or missing file | Check `content-pipeline/content-briefs/` for the file |

---

## Escalation

| Situation | Action |
|-----------|--------|
| AWS/CloudFront down | Check AWS status page, wait or use S3 direct URL |
| Buttondown API issues | Send manually via Buttondown UI |
| Build script broken | Check `scripts/build-blog.js`, run `node scripts/build-blog.js` with `--verbose` |
| Content pipeline corrupted | Reset from git: `git checkout main -- content-pipeline/` |

---

## History

| Date | Notes |
|------|-------|
| 2025-01-15 | First blog post published (Psychological Safety) |
| 2025-01-18 | Blog system, Buttondown, DNS all set up |
| 2025-10-18 | Content pipeline v2 launched (agents, commands, templates) |
| 2025-10-18 | Energy-Aware AI Infrastructure published + newsletter sent |
| 2025-11-03 | Deployment Brigade System published, newsletter drafted but not sent |
| 2026-03-17 | Runbook created, connector gaps documented |
