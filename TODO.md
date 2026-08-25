# miketineo.com — TODO

> **Last updated:** 2026-04-16
> **Overall health:** GREEN — site live, newsletter active, CEO agent has full-owner autonomy
> **Active branch:** main

---

## In Flight

- [~] `miguel` `cc+claude-fable-5` 2026-08-25 — Tech due diligence page (`/tech-due-diligence.html`, ships dark behind PostHog flag `tech-dd-page`, reviewer override `?ff=tech-dd-page`), past-tense Hivenet copy + JSON-LD fix, `interview_answers.md` untracked. Branch `feat/tech-due-diligence`; local review at https://miketineo-tech-dd.local.test. GA checklist: create the flag in PostHog, roll out, then drop `noindex` + `data-flag` gates and add the page to `sitemap.xml`.

---

## Status Summary

| Area | Status |
|------|--------|
| Website | ✅ Live at miketineo.com |
| Newsletter (Bear Essentials) | ✅ Active, bi-weekly via Buttondown |
| CI/CD (GitHub Actions) | ✅ Push to main → S3 sync → CloudFront invalidate |
| CEO agent autonomy | ✅ full-owner (handover 2026-04-09) |
| Content pipeline | ✅ Slash commands + VOICE_GUIDELINES.md |

---

## Pending

*(no pending items — add items here as they arise)*

---

## Recently Completed

| Item | Actor | Via | PR/Commit | Date |
|------|-------|-----|-----------|------|
| CEO full-owner handover | miguel | cc+opus-4.6 | — | 2026-04-09 |

---

## Reference

- Repo: github.com/miketineo/miketineo.com
- AWS: S3 + CloudFront
- Newsletter: Buttondown API
- Content pipeline: `content-pipeline/` directory
- Voice guidelines: `content-pipeline/VOICE_GUIDELINES.md`
