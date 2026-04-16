#!/usr/bin/env bash
#
# transcribe.sh — Transcribe audio files using mlx-whisper (local)
#
# Usage: scripts/transcribe.sh <audio_file>
# Output: writes transcript to stdout
# Moves processed file to inbox/voice/processed/ (if within inbox/)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INBOX_VOICE="$ROOT_DIR/inbox/voice"

# ── Validate arguments ─────────────────────────────────────────────────

if [[ $# -eq 0 ]]; then
  echo "Usage: scripts/transcribe.sh <audio_file>" >&2
  echo "  Transcribes an audio file and writes the transcript to stdout." >&2
  echo "  Supported formats: .m4a .mp3 .wav .ogg .webm" >&2
  exit 1
fi

audio_file="$1"

if [[ ! -f "$audio_file" ]]; then
  echo "ERROR: File not found: $audio_file" >&2
  exit 1
fi

# Resolve to absolute path
audio_file="$(cd "$(dirname "$audio_file")" && pwd)/$(basename "$audio_file")"

# ── Detect transcription backend ───────────────────────────────────────

transcript=""

if python3 -c "import mlx_whisper" 2>/dev/null; then
  # mlx-whisper writes a .txt file alongside the input audio file.
  # To avoid polluting the source directory, we copy the audio to a temp dir.
  tmpdir=$(mktemp -d /tmp/bear-transcribe.XXXXXX)
  trap 'rm -rf "$tmpdir"' EXIT

  cp "$audio_file" "$tmpdir/"
  tmp_audio="$tmpdir/$(basename "$audio_file")"

  echo "Transcribing with mlx-whisper..." >&2
  python3 -m mlx_whisper \
    --model mlx-community/whisper-large-v3-turbo \
    --output-format txt \
    --output_dir "$tmpdir" \
    "$tmp_audio" >&2

  # mlx_whisper names the output after the audio file stem
  local_stem="${tmp_audio%.*}"
  txt_file="${local_stem}.txt"

  if [[ ! -f "$txt_file" ]]; then
    echo "ERROR: Expected transcript file not found: $txt_file" >&2
    exit 1
  fi

  transcript=$(cat "$txt_file")

elif python3 -c "import whisper" 2>/dev/null; then
  tmpdir=$(mktemp -d /tmp/bear-transcribe.XXXXXX)
  trap 'rm -rf "$tmpdir"' EXIT

  echo "Transcribing with openai-whisper..." >&2
  whisper "$audio_file" \
    --model base \
    --output_format txt \
    --output_dir "$tmpdir" >&2

  local_stem="$(basename "${audio_file%.*}")"
  txt_file="$tmpdir/${local_stem}.txt"

  if [[ ! -f "$txt_file" ]]; then
    echo "ERROR: Expected transcript file not found: $txt_file" >&2
    exit 1
  fi

  transcript=$(cat "$txt_file")

else
  echo "ERROR: No speech-to-text tool found. Install one:" >&2
  echo "  pip install mlx-whisper   (recommended for Apple Silicon)" >&2
  echo "  pip install openai-whisper (works everywhere, slower)" >&2
  exit 1
fi

# ── Move processed file if it's in the inbox ───────────────────────────

# audio_file is already resolved to absolute path above
real_inbox="$(cd "$INBOX_VOICE" 2>/dev/null && pwd || echo "__no_inbox__")"

if [[ "$audio_file" == "$real_inbox/"* ]]; then
  mkdir -p "$INBOX_VOICE/processed"
  mv "$audio_file" "$INBOX_VOICE/processed/"
  echo "Moved to inbox/voice/processed/$(basename "$audio_file")" >&2
fi

# ── Output transcript ──────────────────────────────────────────────────

echo "$transcript"
