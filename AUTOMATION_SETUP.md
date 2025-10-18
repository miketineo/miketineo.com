# Ultra-Minimal Content Pipeline Automation Setup

**Last Updated:** 2025-10-18

This guide sets up Phase 1 automation: Slash commands + manual calendar reminders. No external services, no OAuth, no recurring costs.

---

## What You're Setting Up

**6 Slash Commands:**
- `/content-start` - Start content cycle (interview)
- `/content-status` - Check where you are
- `/content-draft` - Create blog post
- `/content-publish` - Publish blog
- `/content-newsletter` - Create newsletter
- `/content-archive` - Archive completed cycle

**3 Calendar Events:**
- Interview reminder (every 2 weeks)
- Publish reminder (1 week after interview)
- Newsletter reminder (1 week after publish)

**GitHub Actions:**
- Detects when blog posts are published
- Shows notification with next steps

**Total Setup Time:** 30 minutes
**Ongoing Cost:** $0/month
**Maintenance:** Zero

---

## Step 1: Verify Slash Commands (2 minutes)

The slash commands are already created in `.claude/commands/`.

**Test them:**

1. Open Claude Code in this directory
2. Type `/content-status`
3. You should see the pipeline status

If slash commands don't work:
- Make sure you're in the `miketineo.com/` directory
- Check `.claude/commands/` exists
- Restart Claude Code

---

## Step 2: Set Up Calendar Events (15 minutes)

You need 3 recurring calendar events. Set them once, they'll remind you forever.

### Event 1: Content Interview

**When to set:** Pick a Sunday that works for you (e.g., next Sunday)

**Calendar App:** Google Calendar, Apple Calendar, Outlook, whatever you use

**Event Details:**
```
Title: Bear Essentials - Content Interview
When: [Your chosen Sunday] at 2:00 PM
Recurrence: Every 2 weeks
Duration: 1 hour
Reminders:
  - 1 day before (Saturday 2pm)
  - 1 hour before (Sunday 1pm)
Description:
  1. Review content-pipeline/external-content.md
  2. Open Claude Code
  3. Run: /content-start
  4. Answer interview questions (30-60 min)
  5. Review brief when done
```

**Color:** Choose a distinct color so it stands out

### Event 2: Publish Blog Post

**When to set:** Thursday, 1 week after your interview Sunday

**Event Details:**
```
Title: Bear Essentials - Publish Blog
When: [Thursday, 1 week after interview] at 10:00 AM
Recurrence: Every 2 weeks
Duration: 45 minutes
Reminders:
  - Morning of (10am same day)
Description:
  1. Open Claude Code
  2. Run: /content-status (check if draft exists)
  3. If no draft: Run /content-draft first
  4. Run: /content-publish
  5. Follow git commands shown
  6. Verify live on miketineo.com/blog
```

**Color:** Same color as interview event

### Event 3: Send Newsletter

**When to set:** Tuesday, 1 week after your publish Thursday

**Event Details:**
```
Title: Bear Essentials - Newsletter
When: [Tuesday, 1 week after publish] at 10:00 AM
Recurrence: Every 2 weeks
Duration: 30 minutes
Reminders:
  - Morning of (10am same day)
Description:
  1. Open Claude Code
  2. Run: /content-newsletter
  3. Copy newsletter text
  4. Go to buttondown.email
  5. Paste and send (or schedule)
  6. Run: /content-archive [slug] after sending
```

**Color:** Same color as other events

### Calendar Visual

Your calendar should look like this:

```
Week 1:
  Sunday    [Content Interview]
  Monday
  Tuesday
  Wednesday
  Thursday  [Publish Blog]
  Friday
  Saturday

Week 2:
  Sunday
  Monday
  Tuesday   [Send Newsletter]
  Wednesday
  Thursday
  Friday
  Saturday

(Repeats every 2 weeks)
```

---

## Step 3: Test the Full Workflow (10 minutes)

Don't wait for your first real cycle. Test now.

### Test Run

**1. Check Status**
```
/content-status
```

Should show: "No active cycle"

**2. Start Cycle (Don't actually do interview)**
```
/content-start
```

This will:
- Create a placeholder brief
- Start interview

**Stop the interview** (just testing, don't complete it yet)

**3. Manually Create Test Files**

Create a test brief:
```bash
echo "# Test Brief" > content-pipeline/content-briefs/2025-10-18-test.md
```

Create a test draft:
```bash
cat > content-pipeline/drafts/2025-10-18-test.md << 'EOF'
---
title: "Test Post"
date: 2025-10-18
excerpt: "Testing the workflow"
tags: ["test"]
---

## Test Content

This is a test.
EOF
```

**4. Test Status Again**
```
/content-status
```

Should now show:
- ✅ Content brief
- ✅ Blog draft
- Next action: Run /content-publish

**5. Clean Up Test Files**
```bash
rm content-pipeline/content-briefs/2025-10-18-test.md
rm content-pipeline/drafts/2025-10-18-test.md
```

**6. Verify GitHub Actions**

The `.github/workflows/main.yml` file has been updated with blog post detection.

Next time you push a blog post, you'll see a notification in GitHub Actions.

---

## Step 4: Prepare for First Real Cycle (5 minutes)

### Review Content Sources

1. Open `content-pipeline/external-content.md`
2. Add any recent articles/podcasts/talks you found valuable
3. Tag them appropriately

Example:
```markdown
## Current Cycle

### Articles
- [ ] **"Team Topologies" by Manuel Pais**
  - Link: https://example.com
  - Key insight: Conway's Law in distributed teams
  - Potential use: Reference for team structure post
  - Tags: #leadership, #teams
```

### Think About First Topic

Before your first calendar reminder, think about:
- What challenged you recently?
- What did you learn that surprised you?
- What question do people keep asking you?
- What article made you think "I have something to add here"?

Write down 2-3 topic ideas to have ready.

---

## How to Use the System

### When Sunday Reminder Pops Up

1. **Review external sources** (5 min)
   - Open `content-pipeline/external-content.md`
   - Move relevant items to "Current Cycle"

2. **Open Claude Code**
   - Navigate to `miketineo.com/` directory

3. **Run `/content-start`**
   - Answer interview questions
   - Be specific (names, numbers, examples)
   - Share real stories
   - Don't hold back on details

4. **Review the brief**
   - Brief saved to `content-pipeline/content-briefs/`
   - Quick read to ensure accuracy
   - Request revisions if needed

**Time:** 30-60 minutes
**Done:** Don't think about it again until Thursday

### When Thursday Reminder Pops Up

1. **Open Claude Code**

2. **Check status:** `/content-status`
   - See if draft was created Monday
   - If not, run `/content-draft` now

3. **Review draft** (if created earlier)
   - Read through
   - Request revisions if needed

4. **Publish:** `/content-publish`
   - Review checklist
   - Confirm publish
   - Run git commands shown
   - Push to GitHub

5. **Verify live**
   - GitHub Actions runs (~2 min)
   - Visit https://miketineo.com/blog/
   - Click through to post
   - Test on mobile

**Time:** 30-45 minutes
**Done:** Post is live

### When Tuesday Reminder Pops Up (Next Week)

1. **Open Claude Code**

2. **Create newsletter:** `/content-newsletter`
   - Copy newsletter text shown

3. **Go to Buttondown**
   - Log in: https://buttondown.email
   - New email
   - Paste content
   - Send test to yourself

4. **Review test email**
   - Desktop and mobile
   - All links work
   - Looks good

5. **Send or Schedule**
   - Option A: Send now
   - Option B: Schedule for later today

6. **Archive:** `/content-archive [slug]`
   - Run after sending
   - Cleans up drafts
   - Marks cycle complete

**Time:** 20-30 minutes
**Done:** Cycle complete!

---

## Troubleshooting

### Problem: Calendar events not recurring

**Solution:**
- Make sure you set "Recurrence: Every 2 weeks"
- Not "Custom: Bi-weekly" (different in some apps)
- Check first 3-4 instances appear on calendar

### Problem: Slash commands not working

**Solution:**
```bash
# Check you're in right directory
pwd
# Should show: .../miketineo.com

# Check commands exist
ls .claude/commands/
# Should show: content-*.md files

# Try full path
cat .claude/commands/content-status.md
```

### Problem: Forgot which cycle week it is

**Solution:**
```
/content-status
```

Shows you exactly where you are and what to do next.

### Problem: Calendar conflicts

**Solution:**
- Events are flexible - run slash command when convenient
- Sunday interview can be Saturday or Monday
- Thursday publish can be Wed or Fri
- Tuesday newsletter can be Mon or Wed
- Just maintain ~1 week gaps

### Problem: Want to skip a cycle

**Solution:**
- Just don't run `/content-start`
- Calendar will still remind you in 2 weeks
- No penalty for skipping
- Resume whenever ready

---

## Optional: GitHub Notifications

If you want email notifications when blog posts publish:

1. Go to: https://github.com/miketineo/miketineo.com/settings/notifications
2. Enable "Actions" notifications
3. Choose email delivery

Now you'll get an email each time GitHub Actions runs.

---

## What Happens Automatically

**When you run slash commands:**
- Files are created with correct naming
- BACKLOG.md is updated
- Agents are launched with right context
- Next steps are shown clearly

**When you push blog post:**
- GitHub Actions detects new post
- Builds and deploys site
- Shows notification with URL
- Reminds about newsletter

**When calendar reminds you:**
- You open Claude Code
- You run one slash command
- You follow the steps shown
- You're done

---

## Phase 2 (Future)

If you later want MORE automation:

**Easy additions:**
1. Simple email reminders (cron + sendmail)
2. Auto-social posting (Buttondown → LinkedIn)
3. Stats tracking (Buttondown API)

**Heavier additions:**
1. n8n on Hive Compute (free, no GPU needed)
2. Full workflow orchestration
3. Auto-archiving

But start with Phase 1. Most users find it's perfect.

---

## Summary: What You Did

✅ **6 slash commands** - Ready to use
✅ **3 calendar events** - Set once, remind forever
✅ **GitHub Actions** - Auto-deploys and notifies
✅ **Zero recurring costs** - No subscriptions
✅ **Zero maintenance** - Nothing to update or monitor

**Time invested:** 30 minutes
**Time saved per cycle:** 2-3 hours
**Content quality:** Higher (AI assistance with your voice)
**Consistency:** Better (calendar never forgets)

---

## First Real Cycle Checklist

Before starting for real:

- [ ] All 6 slash commands tested
- [ ] 3 calendar events created and recurring
- [ ] external-content.md has some sources
- [ ] Thought about first topic idea
- [ ] Buttondown account set up and ready
- [ ] Understand the workflow (read CONTENT_WORKFLOW.md)

**Ready?**

Wait for your Sunday calendar reminder, then run:
```
/content-start
```

And you're off! 🚀

---

## Support

**Documentation:**
- Complete workflow: `CONTENT_WORKFLOW.md`
- Content strategy: Use content-strategy-specialist agent
- Writing help: Use copy-writer agent
- Task tracking: `BACKLOG.md`

**Common Commands:**
- Check status: `/content-status`
- See what's next: `/content-status`
- Stuck? : `/content-status` (it always knows)

**The system is designed to be self-explanatory. When in doubt, run `/content-status` and it will tell you exactly what to do next.**

Happy creating! ✍️
