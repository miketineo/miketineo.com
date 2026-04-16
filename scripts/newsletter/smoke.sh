#!/usr/bin/env bash
# scripts/newsletter/smoke.sh — Buttondown integration smoke test.
#
# Exits 0 on success, non-zero on any failure. Runs in < 10 seconds.
# Exercises every bd_* function the newsletter pipeline depends on, against
# Miguel's real Buttondown account, without sending anything to subscribers.
#
# Safe to run on demand — the only mutation is a throwaway draft that is
# created and deleted within the same run.
#
# Usage:
#   BUTTONDOWN_API_KEY=<key> scripts/newsletter/smoke.sh
#   scripts/newsletter/smoke.sh                   # if key is in env / vault

set -uo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SELF_DIR}/../.." && pwd)"
# shellcheck source=../buttondown-api.sh
. "${REPO_ROOT}/scripts/buttondown-api.sh"

fail() {
    echo "FAIL: $*" >&2
    exit 1
}

pass() {
    echo "  ok: $*"
}

echo "smoke: starting Buttondown API smoke test"
start_ts=$(date +%s)

# 1. Key resolution
echo "[1/6] bd_key"
key_len=$(bd_key | wc -c | tr -d ' ')
[ "$key_len" -gt 10 ] || fail "bd_key returned short/empty value"
pass "key resolved (${key_len} chars)"

# 2. Newsletter settings — sanity check account is reachable, detect
#    sender-domain misalignment as a visible warning (but not a failure —
#    drafts work without it).
echo "[2/6] bd_get_newsletter"
newsletter_json=$(bd_get_newsletter) || fail "bd_get_newsletter failed"
email_address=$(printf '%s' "$newsletter_json" | jq -r '.results[0].email_address')
email_domain=$(printf '%s' "$newsletter_json" | jq -r '.results[0].email_domain')
pass "from=${email_address} sending_domain=${email_domain}"
# Split email_address into local-part@domain-part and compare domain-part to
# the verified sending domain. Parsing beats grep because literal dots in a
# grep pattern are wildcards and silently mask mismatches.
addr_domain="${email_address#*@}"
if [ "$addr_domain" != "$email_domain" ]; then
    echo "  WARN: From address domain (${addr_domain}) != sending domain (${email_domain})." >&2
    echo "        Newsletters will error at send time. Fix in Settings -> Email -> Sender." >&2
    echo "        Recommended: set From to news@${email_domain}" >&2
fi

# 3. List emails
echo "[3/6] bd_list_emails"
listing=$(bd_list_emails --page-size 10) || fail "bd_list_emails failed"
count=$(printf '%s' "$listing" | jq -r '.count')
[ -n "$count" ] || fail "bd_list_emails returned no .count"
pass "listed ${count} emails"

# 4. Fetch a known email (the sent Bear Essentials #1)
echo "[4/6] bd_get_email (known id)"
known_id="24d8f8a9-6dc6-4e62-9bbf-5bd442b28771"
subject=$(bd_get_email "$known_id" | jq -r '.subject') || fail "bd_get_email failed"
[ -n "$subject" ] || fail "bd_get_email returned no subject"
pass "subject=${subject}"

# 5. Create + find-by-external-id + delete a throwaway draft
echo "[5/6] bd_create_draft + bd_get_by_external_id + bd_delete"
body_file=$(mktemp)
trap 'rm -f "$body_file"' EXIT
printf 'Smoke test draft created by scripts/newsletter/smoke.sh. Will be deleted.' > "$body_file"

ext_id="smoke-test-$(date +%s)-$$"
created=$(bd_create_draft \
    --subject "SMOKE TEST — $(date +%FT%T) — delete me" \
    --body-file "$body_file" \
    --external-id "$ext_id") || fail "bd_create_draft failed"
new_id=$(printf '%s' "$created" | jq -r '.id')
[ -n "$new_id" ] && [ "$new_id" != "null" ] || fail "created draft has no id"
pass "created draft id=${new_id}"

roundtrip_id=$(bd_get_by_external_id "$ext_id" | jq -r '.id // empty')
[ "$roundtrip_id" = "$new_id" ] || fail "external_id roundtrip mismatch: got '${roundtrip_id}' want '${new_id}'"
pass "external_id roundtrip ok"

bd_delete "$new_id" >/dev/null || fail "bd_delete failed for ${new_id}"
pass "deleted ${new_id}"

# 6. Verify delete took effect
echo "[6/6] verify deletion"
if bd_get_email "$new_id" >/dev/null 2>&1; then
    fail "deleted email ${new_id} is still fetchable"
fi
pass "confirmed ${new_id} is gone"

elapsed=$(( $(date +%s) - start_ts ))
echo "smoke: PASS in ${elapsed}s"
