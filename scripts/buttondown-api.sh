#!/usr/bin/env bash
# scripts/buttondown-api.sh — Buttondown API wrapper functions.
#
# Usage (source, don't exec):
#   source "$(dirname "$0")/buttondown-api.sh"
#   BUTTONDOWN_API_KEY=$(bd_key) || exit 1
#   bd_list_emails | jq '.results[] | .subject'
#
# Key resolution priority:
#   1. $BUTTONDOWN_API_KEY env var  (simplest for local dev)
#   2. vault_get secret/projects/miketineo-com/buttondown_api_key  (VPS/CI)
#   3. Hard fail with loud error — no further fallback.
#
# All functions:
#   - write JSON (or empty) to stdout
#   - log errors/progress to stderr
#   - return non-zero on HTTP >= 400 or network failure
# The API key is never echoed by any function other than bd_key, and bd_key
# never writes it to stderr.

_BD_API_BASE="https://api.buttondown.email/v1"

# Require bash — BASH_SOURCE is bash-specific and we rely on it to locate
# lib/vault-get.sh relative to this file. If you see this error, invoke via
# `bash -c 'source scripts/buttondown-api.sh; ...'` or execute a wrapper
# script with `#!/usr/bin/env bash` rather than sourcing from zsh.
if [ -z "${BASH_SOURCE:-}" ]; then
    echo "buttondown-api.sh: must be sourced from bash, not zsh/sh" >&2
    return 1 2>/dev/null || exit 1
fi

_bd_self_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -f "${_bd_self_dir}/lib/vault-get.sh" ]; then
    echo "buttondown-api.sh: cannot find lib/vault-get.sh relative to ${_bd_self_dir}" >&2
    return 1 2>/dev/null || exit 1
fi
# shellcheck source=lib/vault-get.sh
. "${_bd_self_dir}/lib/vault-get.sh"

bd_key() {
    if [ -n "${BUTTONDOWN_API_KEY:-}" ]; then
        printf '%s' "$BUTTONDOWN_API_KEY"
        return 0
    fi
    local k
    k=$(vault_get secret/projects/miketineo-com/buttondown_api_key 2>/dev/null) || {
        echo "bd_key: no key available" >&2
        echo "  Set BUTTONDOWN_API_KEY env var, or configure VAULT_ADDR + VAULT_TOKEN." >&2
        echo "  Vault path: secret/projects/miketineo-com/buttondown_api_key" >&2
        return 1
    }
    if [ -z "$k" ]; then
        echo "bd_key: vault returned empty value" >&2
        return 2
    fi
    printf '%s' "$k"
}

# _bd_curl METHOD PATH [DATA_FILE]
# Wraps curl with auth, captures body and status, fails on >= 400.
# DATA_FILE (optional): read request body from this file.
_bd_curl() {
    local method="$1"
    local path="$2"
    local data_file="${3:-}"
    local key
    key=$(bd_key) || return 1

    local tmp
    tmp=$(mktemp) || return 2
    local status
    if [ -n "$data_file" ]; then
        status=$(curl -sS -o "$tmp" -w '%{http_code}' \
            -X "$method" \
            -H "Authorization: Token ${key}" \
            -H "Content-Type: application/json" \
            --data "@${data_file}" \
            "${_BD_API_BASE}${path}") || {
            echo "_bd_curl: network error on ${method} ${path}" >&2
            rm -f "$tmp"
            return 3
        }
    else
        status=$(curl -sS -o "$tmp" -w '%{http_code}' \
            -X "$method" \
            -H "Authorization: Token ${key}" \
            "${_BD_API_BASE}${path}") || {
            echo "_bd_curl: network error on ${method} ${path}" >&2
            rm -f "$tmp"
            return 3
        }
    fi

    if [ "$status" -ge 400 ]; then
        echo "_bd_curl: HTTP ${status} on ${method} ${path}" >&2
        cat "$tmp" >&2
        echo >&2
        rm -f "$tmp"
        return 4
    fi

    cat "$tmp"
    rm -f "$tmp"
}

bd_list_emails() {
    # Optional args: --status <state>, --page-size <n>
    local status_filter=""
    local page_size=100
    while [ $# -gt 0 ]; do
        case "$1" in
            --status) status_filter="$2"; shift 2 ;;
            --page-size) page_size="$2"; shift 2 ;;
            *) echo "bd_list_emails: unknown arg $1" >&2; return 2 ;;
        esac
    done
    local query="page_size=${page_size}&ordering=-publish_date"
    [ -n "$status_filter" ] && query="${query}&status=${status_filter}"
    _bd_curl GET "/emails?${query}"
}

bd_get_email() {
    local id="${1:-}"
    if [ -z "$id" ]; then
        echo "bd_get_email: email id required" >&2
        return 2
    fi
    _bd_curl GET "/emails/${id}"
}

bd_get_newsletter() {
    _bd_curl GET "/newsletters"
}

bd_list_subscribers() {
    local page_size="${1:-100}"
    _bd_curl GET "/subscribers?page_size=${page_size}"
}

# bd_create_draft --subject S --body-file F --external-id X [--metadata-json J]
# Creates an email in status=draft. Returns the created email JSON.
bd_create_draft() {
    local subject="" body_file="" external_id="" metadata_json=""
    while [ $# -gt 0 ]; do
        case "$1" in
            --subject) subject="$2"; shift 2 ;;
            --body-file) body_file="$2"; shift 2 ;;
            --external-id) external_id="$2"; shift 2 ;;
            --metadata-json) metadata_json="$2"; shift 2 ;;
            *) echo "bd_create_draft: unknown arg $1" >&2; return 2 ;;
        esac
    done
    if [ -z "$subject" ] || [ -z "$body_file" ] || [ -z "$external_id" ]; then
        echo "bd_create_draft: --subject, --body-file, --external-id required" >&2
        return 2
    fi
    if [ ! -f "$body_file" ]; then
        echo "bd_create_draft: body file not found: $body_file" >&2
        return 2
    fi

    local metadata
    if [ -n "$metadata_json" ]; then
        metadata=$(printf '%s' "$metadata_json" | jq '. + {external_id: $id}' --arg id "$external_id") \
            || { echo "bd_create_draft: metadata-json not valid JSON" >&2; return 2; }
    else
        metadata=$(jq -n '{external_id: $id}' --arg id "$external_id")
    fi

    local payload_file
    payload_file=$(mktemp)
    jq -n \
        --arg subject "$subject" \
        --rawfile body "$body_file" \
        --argjson metadata "$metadata" \
        '{subject: $subject, body: $body, status: "draft", email_type: "public", metadata: $metadata}' \
        > "$payload_file" || { rm -f "$payload_file"; return 3; }

    local response
    response=$(_bd_curl POST "/emails" "$payload_file") || {
        rm -f "$payload_file"
        return 4
    }
    rm -f "$payload_file"
    printf '%s' "$response"
}

bd_delete() {
    local id="${1:-}"
    if [ -z "$id" ]; then
        echo "bd_delete: email id required" >&2
        return 2
    fi
    _bd_curl DELETE "/emails/${id}"
}

# bd_get_by_external_id <external_id>
# Lists emails, filters client-side by metadata.external_id. Returns the first
# matching email JSON, or empty string if none found (exit 0 in both cases).
bd_get_by_external_id() {
    local external_id="${1:-}"
    if [ -z "$external_id" ]; then
        echo "bd_get_by_external_id: external_id required" >&2
        return 2
    fi
    local listing
    listing=$(bd_list_emails) || return $?
    printf '%s' "$listing" | jq --arg id "$external_id" \
        '[.results[] | select(.metadata.external_id == $id)] | .[0] // empty'
}
