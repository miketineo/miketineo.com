#!/usr/bin/env bash
# scripts/newsletter/reconcile.sh — Reconcile local archive state with Buttondown reality.
#
# Run as preflight inside /content-newsletter to catch drift between what the
# local pipeline thinks happened and what Buttondown actually sent.
#
# Usage:
#   BUTTONDOWN_API_KEY=<key> scripts/newsletter/reconcile.sh [--dry-run]
#
# Output: human-readable report to stdout. Non-zero exit if blocking issues found.
# --dry-run: report only, no prompts or suggestions to modify anything.

set -uo pipefail

DRY_RUN=false
[ "${1:-}" = "--dry-run" ] && DRY_RUN=true

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SELF_DIR}/../.." && pwd)"
BLOG_DIR="${REPO_ROOT}/blog/posts"
ARCHIVE_DIR="${REPO_ROOT}/content-pipeline/archive"

# shellcheck source=../buttondown-api.sh
. "${REPO_ROOT}/scripts/buttondown-api.sh"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Extract title from blog post frontmatter
blog_title() {
    local file="$1"
    grep -m1 '^title:' "$file" | sed 's/^title: *//' | tr -d '"'
}

# Extract blog slug from filename (strip .md extension)
blog_slug() {
    local file="$1"
    basename "$file" .md
}

# Extract topic part of slug (strip date prefix YYYY-MM-DD-)
slug_topic() {
    local slug="$1"
    echo "$slug" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//'
}

# Check if a Buttondown email matches a blog post via:
# 1. metadata.external_id = "bear-essentials-<slug>"
# 2. Subject contains significant words from the title (fallback for legacy)
# Returns the email JSON if matched, empty otherwise.
match_email_for_post() {
    local slug="$1"
    local title="$2"
    local all_emails_json="$3"

    local expected_id="bear-essentials-${slug}"

    # Try external_id match first (new pipeline)
    local match
    match=$(printf '%s' "$all_emails_json" | jq --arg id "$expected_id" \
        '[.results[] | select(.metadata.external_id == $id)] | .[0] // empty')
    if [ -n "$match" ]; then
        printf '%s' "$match"
        return 0
    fi

    # Fallback: subject keyword match for legacy emails.
    # Extract significant words from the topic slug (skip common/short words).
    local topic
    topic=$(slug_topic "$slug")
    local keywords
    keywords=$(echo "$topic" | tr '-' '\n' | awk 'length >= 4' | head -5 | paste -sd'|' -)
    if [ -z "$keywords" ]; then
        return 1
    fi

    # Match against subject (case-insensitive). Require at least one keyword.
    match=$(printf '%s' "$all_emails_json" | jq --arg kw "$keywords" \
        '[.results[] | select(.subject != "" and (.subject | test($kw; "i")))] | .[0] // empty')
    if [ -n "$match" ]; then
        printf '%s' "$match"
        return 0
    fi

    # Fallback 2: body keyword match for emails with empty/missing subjects.
    # Use the LONGEST keyword only (most distinctive) to avoid false positives
    # from generic words like "system" matching unrelated email bodies.
    local distinctive_kw
    distinctive_kw=$(echo "$topic" | tr '-' '\n' | awk '{ print length, $0 }' | sort -rn | head -1 | cut -d' ' -f2-)
    if [ -z "$distinctive_kw" ]; then
        return 1
    fi
    match=$(printf '%s' "$all_emails_json" | jq --arg kw "$distinctive_kw" \
        '[.results[] | select(.body | test($kw; "i"))] | .[0] // empty')
    if [ -n "$match" ]; then
        printf '%s' "$match"
        return 0
    fi

    return 1
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

echo "===  Newsletter Reconciliation Report  ==="
echo "Date: $(date +%F)"
echo ""

# 1. Check sender-domain alignment
echo "--- Sender Domain ---"
newsletter_json=$(bd_get_newsletter) || { echo "FATAL: cannot reach Buttondown API"; exit 1; }
email_address=$(printf '%s' "$newsletter_json" | jq -r '.results[0].email_address')
email_domain=$(printf '%s' "$newsletter_json" | jq -r '.results[0].email_domain')
addr_domain="${email_address#*@}"
if [ "$addr_domain" = "$email_domain" ]; then
    echo "OK: ${email_address} aligns with sending domain ${email_domain}"
else
    echo "BLOCKED: From domain (${addr_domain}) != sending domain (${email_domain})"
    echo "         Fix in Buttondown Settings -> Email -> Sender."
    echo "         Recommended: set From to news@${email_domain}"
fi
echo ""

# 2. Fetch all Buttondown emails
echo "--- Buttondown Emails ---"
all_emails=$(bd_list_emails --page-size 100) || { echo "FATAL: bd_list_emails failed"; exit 1; }
bd_count=$(printf '%s' "$all_emails" | jq -r '.count')
echo "Found ${bd_count} emails in Buttondown"
echo ""

# 3. Check subscriber count
sub_json=$(bd_list_subscribers 100) || { echo "WARN: could not fetch subscribers"; }
if [ -n "${sub_json:-}" ]; then
    total_subs=$(printf '%s' "$sub_json" | jq -r '.count')
    active_subs=$(printf '%s' "$sub_json" | jq '[.results[] | select(.type == "regular")] | length')
    echo "Subscribers: ${total_subs} total, ${active_subs} active (regular)"
    if [ "$active_subs" -lt 1 ]; then
        echo "WARN: zero active subscribers — sends will have no recipients"
    fi
    echo ""
fi

# 4. Reconcile blog posts against Buttondown
echo "--- Blog Post Status ---"
echo ""

pending_posts=()
has_blocking=false

for post_file in "$BLOG_DIR"/*.md; do
    [ -f "$post_file" ] || continue
    slug=$(blog_slug "$post_file")
    title=$(blog_title "$post_file")
    topic=$(slug_topic "$slug")
    archive_path="${ARCHIVE_DIR}/${slug}"
    has_archive=false
    [ -d "$archive_path" ] && has_archive=true

    # Try to match with a Buttondown email
    bd_email=""
    bd_email=$(match_email_for_post "$slug" "$title" "$all_emails") || true

    if [ -n "$bd_email" ]; then
        bd_status=$(printf '%s' "$bd_email" | jq -r '.status')
        bd_subject=$(printf '%s' "$bd_email" | jq -r '.subject')
        bd_id=$(printf '%s' "$bd_email" | jq -r '.id')
        bd_date=$(printf '%s' "$bd_email" | jq -r '.publish_date // .creation_date')

        case "$bd_status" in
            sent)
                if $has_archive; then
                    echo "  SENT    ${slug}"
                    echo "          subject: ${bd_subject}"
                    echo "          archived locally"
                else
                    echo "  SENT    ${slug}"
                    echo "          subject: ${bd_subject}"
                    echo "          WARNING: no local archive — run reconcile to create one"
                fi
                ;;
            errored)
                echo "  ERRORED ${slug}"
                echo "          subject: ${bd_subject}"
                echo "          bd_id: ${bd_id}"
                if $has_archive && [ -f "${archive_path}/buttondown-errored-postmortem.md" ]; then
                    echo "          postmortem archived (acknowledged)"
                else
                    echo "          ACTION: archive body + write postmortem before cleanup"
                    has_blocking=true
                fi
                ;;
            draft)
                echo "  DRAFT   ${slug}"
                echo "          subject: ${bd_subject:-"(untitled)"}"
                echo "          bd_id: ${bd_id}"
                echo "          created: ${bd_date}"
                if $has_archive && [ -f "${archive_path}/buttondown-draft-postmortem.md" ]; then
                    echo "          postmortem archived"
                fi
                ;;
            scheduled|about_to_send)
                echo "  SCHED   ${slug}"
                echo "          subject: ${bd_subject}"
                echo "          scheduled for: $(printf '%s' "$bd_email" | jq -r '.publish_date')"
                ;;
            *)
                echo "  ???     ${slug} (status: ${bd_status})"
                ;;
        esac
    else
        # No matching Buttondown email
        if $has_archive; then
            echo "  DONE    ${slug}"
            echo "          archived locally (no Buttondown record — pre-pipeline or deleted)"
        else
            echo "  PENDING ${slug}"
            echo "          title: ${title}"
            echo "          no Buttondown email, no archive"
            pending_posts+=("$slug")
        fi
    fi
    echo ""
done

# 5. Check for orphaned Buttondown emails (no matching blog post)
echo "--- Orphaned Buttondown Emails ---"
orphan_count=0
bd_ids_seen=""
for post_file in "$BLOG_DIR"/*.md; do
    slug=$(blog_slug "$post_file")
    title=$(blog_title "$post_file")
    matched=$(match_email_for_post "$slug" "$title" "$all_emails") || true
    if [ -n "$matched" ]; then
        matched_id=$(printf '%s' "$matched" | jq -r '.id')
        bd_ids_seen="${bd_ids_seen}${matched_id}\n"
    fi
done

while IFS= read -r line; do
    [ -z "$line" ] && continue
    eid=$(printf '%s' "$line" | jq -r '.id')
    if ! printf '%b' "$bd_ids_seen" | grep -q "$eid"; then
        subj=$(printf '%s' "$line" | jq -r '.subject // "(untitled)"')
        stat=$(printf '%s' "$line" | jq -r '.status')
        echo "  ORPHAN  id=${eid}"
        echo "          subject: ${subj}"
        echo "          status: ${stat}"
        echo ""
        orphan_count=$((orphan_count + 1))
    fi
done < <(printf '%s' "$all_emails" | jq -c '.results[]')

if [ "$orphan_count" -eq 0 ]; then
    echo "  (none)"
fi
echo ""

# 6. Summary
echo "--- Summary ---"
echo "Blog posts: $(ls "$BLOG_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')"
echo "Buttondown emails: ${bd_count}"
echo "Pending newsletter: ${#pending_posts[@]}"
if [ ${#pending_posts[@]} -gt 0 ]; then
    echo "  Posts needing newsletter:"
    for p in "${pending_posts[@]}"; do
        echo "    - ${p}"
    done
fi
echo ""

if $has_blocking; then
    echo "STATUS: BLOCKING ISSUES — resolve errored/draft items before sending new newsletters"
    exit 2
fi

if [ ${#pending_posts[@]} -gt 0 ]; then
    echo "STATUS: READY — ${#pending_posts[@]} post(s) pending newsletter"
    exit 0
fi

echo "STATUS: ALL CLEAR — every blog post has a sent newsletter or archive"
exit 0
