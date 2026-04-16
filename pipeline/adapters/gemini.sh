#!/usr/bin/env bash
#
# gemini.sh — AI CLI adapter for Gemini CLI
#
# Source this file to get the ai_run function.
# Usage:
#   source pipeline/adapters/gemini.sh
#   ai_run PROMPT_FILE OUTPUT_FILE [CONTEXT_FILE...]

# ── Preflight ───────────────────────────────────────────────────────────
if ! command -v gemini &>/dev/null; then
  echo "ERROR: 'gemini' not found on PATH. Install Gemini CLI first." >&2
  return 1 2>/dev/null || exit 1
fi

# ── ai_run ──────────────────────────────────────────────────────────────
# Sends a prompt to Gemini CLI with optional context files.
#
# Arguments:
#   $1  PROMPT_FILE   — file containing the prompt text
#   $2  OUTPUT_FILE   — file to write Gemini's response to
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

  # Call Gemini CLI and capture output
  local tmp_out
  tmp_out=$(mktemp)
  if echo "$full_prompt" | gemini > "$tmp_out" 2>&1; then
    mv "$tmp_out" "$output_file"
    echo "OK: response written to $output_file"
  else
    local rc=$?
    echo "ERROR: gemini CLI exited with code $rc" >&2
    cat "$tmp_out" >&2
    rm -f "$tmp_out"
    return $rc
  fi
}
