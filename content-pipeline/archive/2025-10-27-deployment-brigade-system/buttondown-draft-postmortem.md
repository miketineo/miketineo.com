---
type: postmortem
buttondown_email_id: bd028d2b-612d-4e4d-9aaf-57510c14671d
buttondown_status: draft
created_at: 2025-11-27T19:00:35Z
last_modified: 2025-11-27T19:08:41Z
subject: "" # untitled
archived: 2026-04-16
---

# Postmortem: Deployment Brigade System Newsletter — Abandoned Draft

## What happened

This newsletter was drafted in the Buttondown web UI on 2025-11-27 but was
never given a subject line (`subject: ""`) and never sent or scheduled. The
draft sat untouched in Buttondown for ~5 months.

The local archive (`content-pipeline/archive/2025-10-27-deployment-brigade-system/`)
already contained `newsletter-draft.md`, `blog-draft.md`, `content-brief.md`,
and `temp-brief.md` — implying the pipeline assumed this cycle was complete.
The Buttondown draft was likely created manually as a second attempt after the
local draft was written, then abandoned.

## Names-policy violation

The original Buttondown draft body contained a fake-persona pattern that
violates `content-pipeline/VOICE_GUIDELINES.md` (NAMES & ATTRIBUTION POLICY,
"No fake example personas" rule):

- **Original text:** A person's first name was used as a role label for test-
  environment ownership (pattern: "[Name] owns test environment—not a committee").
- **Violation:** Fake persona name used where a role label should appear.
- **Sanitized in archive:** The `buttondown-draft-body.md` file in this
  directory replaces the name with "the test-env owner" per policy. The
  original phrasing is not preserved in any committed file.

## What the upgraded pipeline prevents

1. **Names-audit gate** now catches fake-persona patterns (grep #4 at
   `content-newsletter.md:147-149`) BEFORE any draft reaches Buttondown.
2. **Reconcile preflight** would flag an untitled, months-old draft and prompt
   for cleanup rather than letting it rot silently.
3. **The copy-writer agent** generates the newsletter body per
   VOICE_GUIDELINES.md, which bans fake personas — the manual web-UI drafting
   path that produced this violation is replaced by the agent + audit gate path.
