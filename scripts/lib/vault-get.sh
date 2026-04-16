#!/usr/bin/env bash
# scripts/lib/vault-get.sh — HashiCorp Vault secret fetch helper.
#
# Usage (source, don't exec):
#   source "$(dirname "$0")/lib/vault-get.sh"
#   value=$(vault_get secret/projects/miketineo-com/buttondown_api_key) || exit 1
#
# Requires in env: VAULT_ADDR, VAULT_TOKEN. Canonical location for local use is
# clave-ctl/.env (not committed); on the VPS the tineo-labs CEO container
# injects both. If either is unset, vault_get fails with a loud error — no
# silent fallback.
#
# Values are never written to disk. No in-memory cache (bash 3.2 on macOS
# can't portably do associative arrays; adding a cache here is worth revisiting
# if reconcile.sh becomes hot and Miguel upgrades to bash 5).

vault_get() {
    local path="${1:-}"
    if [ -z "$path" ]; then
        echo "vault_get: path argument required" >&2
        return 2
    fi

    if [ -z "${VAULT_ADDR:-}" ]; then
        echo "vault_get: VAULT_ADDR not set" >&2
        return 10
    fi
    if [ -z "${VAULT_TOKEN:-}" ]; then
        echo "vault_get: VAULT_TOKEN not set" >&2
        return 11
    fi

    # KV v2 path rewrite: secret/foo/bar -> secret/data/foo/bar (leave alone
    # if caller already included /data/).
    local api_path
    if printf '%s' "$path" | grep -q '/data/'; then
        api_path="$path"
    else
        api_path="${path/\//\/data\/}"
    fi

    local body http_code
    body=$(curl -sS -w '\n%{http_code}' \
        -H "X-Vault-Token: ${VAULT_TOKEN}" \
        "${VAULT_ADDR}/v1/${api_path}" 2>&1) || {
        echo "vault_get: curl failed for ${api_path}" >&2
        return 12
    }
    http_code="${body##*$'\n'}"
    body="${body%$'\n'*}"

    if [ "$http_code" != "200" ]; then
        echo "vault_get: HTTP ${http_code} from vault for ${api_path}" >&2
        [ -n "$body" ] && echo "$body" >&2
        return 13
    fi

    local value
    value=$(printf '%s' "$body" | jq -r '.data.data.value // .data.value // empty') || {
        echo "vault_get: jq parse failed" >&2
        return 14
    }

    if [ -z "$value" ]; then
        echo "vault_get: secret at ${api_path} has no .data.data.value or .data.value field" >&2
        return 15
    fi

    printf '%s' "$value"
}
