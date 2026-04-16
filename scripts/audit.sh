#!/usr/bin/env bash
#
# audit.sh — Consolidated 4-grep names & attribution audit
#
# Checks content files for policy violations defined in VOICE_GUIDELINES.md.
# Exit codes:
#   0  clean (no hits)
#   1  hard-block hits found (blocklist or fake-persona patterns)
#   2  review-needed hits found (proper-noun or attribution idioms, no hard blocks)
#
# Usage: scripts/audit.sh FILE [FILE...]

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: scripts/audit.sh FILE [FILE...]" >&2
  exit 1
fi

hard_block=0
review_needed=0

# ── 1. Blocklist — HARD BLOCK ──────────────────────────────────────────
blocklist_hits=$(grep -EnI "Hivenet|compute\.hivenet|hive\.net|Antimatter" "$@" 2>/dev/null || true)
if [[ -n "$blocklist_hits" ]]; then
  echo "=== [BLOCKLIST] HARD BLOCK ==="
  echo "$blocklist_hits" | sed 's/^/  /'
  echo
  hard_block=1
fi

# ── 2. Proper-noun surfaces — REVIEW ───────────────────────────────────
propernoun_hits=$(grep -EnI '\b[A-Z][a-z]+ [A-Z][a-z]+\b' "$@" 2>/dev/null || true)
if [[ -n "$propernoun_hits" ]]; then
  echo "=== [PROPER-NOUN] Review needed ==="
  echo "$propernoun_hits" | sed 's/^/  /'
  echo
  review_needed=1
fi

# ── 3. Attribution idioms — REVIEW ─────────────────────────────────────
attribution_hits=$(grep -EnI '\bsaid\b|according to|put it well|argues|wrote about|'"'"'s book|'"'"'s post|'"'"'s article|inspired by' "$@" 2>/dev/null || true)
if [[ -n "$attribution_hits" ]]; then
  echo "=== [ATTRIBUTION] Review needed ==="
  echo "$attribution_hits" | sed 's/^/  /'
  echo
  review_needed=1
fi

# ── 4. Fake-persona patterns — HARD BLOCK ──────────────────────────────
fakepersona_hits=$(grep -EnI '([Aa] developer named|[Aa]n engineer named|[Ll]et'"'"'s call (him|her|them)|[Ff]or example,? [A-Z][a-z]+ (the|our|a) )' "$@" 2>/dev/null || true)
if [[ -n "$fakepersona_hits" ]]; then
  echo "=== [FAKE-PERSONA] HARD BLOCK ==="
  echo "$fakepersona_hits" | sed 's/^/  /'
  echo
  hard_block=1
fi

# ── Summary & exit code ────────────────────────────────────────────────
if [[ $hard_block -eq 1 ]]; then
  echo "RESULT: HARD BLOCK — fix blocklist/fake-persona hits before publishing."
  exit 1
elif [[ $review_needed -eq 1 ]]; then
  echo "RESULT: REVIEW NEEDED — proper-noun or attribution hits require manual check."
  exit 2
else
  echo "RESULT: CLEAN — no audit hits."
  exit 0
fi
