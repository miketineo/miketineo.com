---
type: postmortem
buttondown_email_id: ba6f982c-823f-4d98-9c48-9fcdc886bb62
buttondown_status: errored
scheduled_for: 2025-10-28T09:00:00Z
errored_at: 2025-10-28T09:00:01Z
subject: "When the API Bill Hits €9,000"
archived: 2026-04-16
---

# Postmortem: Energy-Aware AI Infrastructure Newsletter — Errored Send

## What happened

This newsletter was drafted in the Buttondown web UI on 2025-10-23, scheduled
for 2025-10-28 09:00 UTC, and errored ~1 second after the scheduled send time.
Zero deliveries, zero recipients — the failure was pre-send (Buttondown never
attempted per-subscriber delivery).

The local archive (`content-pipeline/archive/2025-10-18-energy-aware-ai-infrastructure/`)
treated this as "done" because the archive step trusted the human to verify
Buttondown status, which didn't happen. The drift went undetected for 6 months.

## Root cause

**Sender-domain misalignment.** The Buttondown account had:
- `email_address` (From): `bearessentials@miketineo.com` (parent domain)
- `email_domain` (DKIM): `bearessentials.miketineo.com` (subdomain)

DKIM/SPF alignment requires the From address domain to match the verified
sending domain. The mismatch caused every scheduled send after Bear Essentials
Issue #1 (which went to 1 subscriber — the account owner — and may have
bypassed strict alignment) to error at send time.

Resolved on 2026-04-16 by changing the From address to
`newsletter@bearessentials.miketineo.com`.

The Buttondown API returns only `status: "errored"` with no structured error
reason. The specific error class is unconfirmed (Buttondown support ticket
recommended but not yet filed as of this writing).

## Names-policy violation

The body (`buttondown-errored-body.md`) contains a work-specific reference that
violates `content-pipeline/VOICE_GUIDELINES.md` (NAMES & ATTRIBUTION POLICY):

- **Line:** `P.S. Need GPU compute for self-hosting? Check compute.hivenet.com (use code MIGUEL70).`
- **Violation:** Work-brand URL (`compute.hivenet.com`) and a promotional code
  tied to a specific employer relationship.
- **Grep hit:** `Hivenet|compute\.hivenet` blocklist (content-newsletter.md:136)

This violation reached a scheduled Buttondown email but was never delivered to
subscribers — stopped only by the separate sender-domain bug. Had the sender
been correctly configured, 5 subscribers would have received work-fingerprint
content in a personal newsletter.

## What the upgraded pipeline prevents

1. **Reconcile preflight** (`scripts/newsletter/reconcile.sh`) checks Buttondown
   status on every `/content-newsletter` run. An "errored" email would be
   flagged immediately, not silently treated as sent.
2. **Names-audit gate runs on the rendered payload BEFORE `bd_create_draft`.**
   The `compute.hivenet.com` reference would be caught and blocked before the
   draft ever reaches Buttondown.
3. **`metadata.external_id`** dedup prevents accidental re-creation of drafts
   for the same blog post.
4. **Local archive is only created after Buttondown confirms `status: sent`.**
   No more "archive first, verify never."
