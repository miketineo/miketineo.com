# miketineo.com — TODO

> **Last updated:** 2026-04-16
> **Overall health:** GREEN — site live, newsletter active, CEO agent has full-owner autonomy
> **Active branch:** main

---

## In Flight

- [ ] **Tech DD GA** — once flag `tech-dd-page` (id 281831, created disabled 2026-09-19) has been enabled and validated: drop `noindex` + the `data-flag` gates, add `/tech-due-diligence.html` to `sitemap.xml`. Enabling the flag is one toggle at https://eu.posthog.com/project/160291/feature_flags/281831. (2026-09-19)

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
| Tech DD page live (dark, noindex, flag-gated) + past-tense Hivenet fix + JSON-LD + interview_answers.md untracked | miguel | cc+claude-fable-5 | effaeda | 2026-09-19 |
| CEO full-owner handover | miguel | cc+opus-4.6 | — | 2026-04-09 |

---

## Reference

- Repo: github.com/miketineo/miketineo.com
- AWS: S3 + CloudFront
- Newsletter: Buttondown API
- Content pipeline: `content-pipeline/` directory
- Voice guidelines: `content-pipeline/VOICE_GUIDELINES.md`
