#!/usr/bin/env bash
#
# generic.sh — AI CLI adapter for any stdin/stdout CLI
#
# Source this file to get the ai_run function.
# Requires the BEAR_AI_CMD environment variable to be set to the CLI command
# (e.g., "codex", "aider", "ollama run llama3", etc.).
#
# Usage:
#   export BEAR_AI_CMD="codex"
#   source pipeline/adapters/generic.sh
#   ai_run PROMPT_FILE OUTPUT_FILE [CONTEXT_FILE...]

# ── Preflight ───────────────────────────────────────────────────────────
if [[ -z "${BEAR_AI_CMD:-}" ]]; then
  echo "ERROR: BEAR_AI_CMD env var not set. Set it to your AI CLI command." >&2
  echo "  Example: export BEAR_AI_CMD=\"codex\"" >&2
  return 1 2>/dev/null || exit 1
fi

# Verify the base command is available (first word of BEAR_AI_CMD)
_bear_ai_bin="${BEAR_AI_CMD%% *}"
if ! command -v "$_bear_ai_bin" &>/dev/null; then
  echo "ERROR: '$_bear_ai_bin' not found on PATH." >&2
  return 1 2>/dev/null || exit 1
fi
unset _bear_ai_bin

# ── ai_run ──────────────────────────────────────────────────────────────
# Pipes a prompt to the command specified in BEAR_AI_CMD via stdin and
# captures stdout as the response.
#
# Arguments:
#   $1  PROMPT_FILE   — file containing the prompt text
#   $2  OUTPUT_FILE   — file to write the AI response to
#   $3+  CONTEXT_FILE — optional context files appended to the prompt
#
ai_run() {
  local prompt_file="$1"
  local output_file="$2"
  shift 2

  if [[ ! -f "$prompt_file" ]]; then
    echo "ERROR: prompt file not found: $prompt_file" >&2
    return 1
  fi

  # Build the full prompt: main prompt + context blocks
  local full_prompt
  full_prompt=$(cat "$prompt_file")

  for ctx_file in "$@"; do
    if [[ -f "$ctx_file" ]]; then
      full_prompt+=$'\n\n--- Context: '"$ctx_file"$' ---\n'
      full_prompt+=$(cat "$ctx_file")
    else
      echo "WARNING: context file not found, skipping: $ctx_file" >&2
    fi
  done

  # Pipe prompt to the generic AI command and capture output
  local tmp_out
  tmp_out=$(mktemp)
  # shellcheck disable=SC2086
  if echo "$full_prompt" | $BEAR_AI_CMD > "$tmp_out" 2>&1; then
    mv "$tmp_out" "$output_file"
    echo "OK: response written to $output_file"
  else
    local rc=$?
    echo "ERROR: $BEAR_AI_CMD exited with code $rc" >&2
    cat "$tmp_out" >&2
    rm -f "$tmp_out"
    return $rc
  fi
}
