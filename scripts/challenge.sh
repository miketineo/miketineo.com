#!/usr/bin/env bash
#
# challenge.sh — Run the anti-confirmation-bias challenge on a seed
#
# Usage:
#   ./scripts/challenge.sh <seed-id>
#
# Reads the seed file, sends it through the challenge prompt via the
# configured AI adapter, and writes the challenge report.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_FILE="$ROOT_DIR/pipeline/state.json"

# ── Validate arguments ────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <seed-id>" >&2
  exit 1
fi

SEED_ID="$1"

# ── Validate state ────────────────────────────────────────────────────
if [[ ! -f "$STATE_FILE" ]]; then
  echo "ERROR: state.json not found at $STATE_FILE" >&2
  exit 1
fi

# Look up seed file from state
SEED_REL=$(jq -r --arg id "$SEED_ID" '.seeds[] | select(.id == $id) | .file // empty' "$STATE_FILE")
if [[ -z "$SEED_REL" ]]; then
  echo "ERROR: seed '$SEED_ID' not found in state.json" >&2
  exit 1
fi

SEED_FILE="$ROOT_DIR/$SEED_REL"
if [[ ! -f "$SEED_FILE" ]]; then
  echo "ERROR: seed file not found: $SEED_FILE" >&2
  exit 1
fi

# ── Load AI adapter ──────────────────────────────────────────────────
ADAPTER=$(jq -r '.config.ai_cli' "$STATE_FILE")
ADAPTER_FILE="$ROOT_DIR/pipeline/adapters/${ADAPTER}.sh"

if [[ ! -f "$ADAPTER_FILE" ]]; then
  echo "ERROR: AI adapter not found: $ADAPTER_FILE" >&2
  exit 1
fi

# shellcheck source=../pipeline/adapters/claude.sh
source "$ADAPTER_FILE"

# ── Run challenge ────────────────────────────────────────────────────
PROMPT_FILE="$ROOT_DIR/pipeline/prompts/challenge.md"
OUTPUT_FILE="$ROOT_DIR/pipeline/challenges/${SEED_ID}.md"

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "ERROR: challenge prompt not found: $PROMPT_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "Running challenge on seed: $SEED_ID"
echo "  Seed file: $SEED_FILE"
echo "  Output: $OUTPUT_FILE"

ai_run "$PROMPT_FILE" "$OUTPUT_FILE" "$SEED_FILE"
