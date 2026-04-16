# Bear Content Pipeline: Inbox-Driven Redesign

**Date:** 2026-04-16
**Status:** Approved
**Author:** Miguel Tineo + Claude

## Context

The Bear Essentials content pipeline (6 slash commands, 2 Claude-specific agents, 7+ bash scripts) has produced 4 posts in 15 months with a 5-month dormancy gap. The root cause is activation energy: the workflow requires sustained attention across too many sequential steps. Simultaneously, miketineo.com is transitioning to be managed by TheAudacity.io operations, which means the pipeline must work across multiple AI CLI tools (Claude Code, Gemini CLI, Codex) rather than being locked to Claude Code's skill system.

**Goals:**
1. Reduce activation energy to "record a voice memo, approve the output"
2. Make the pipeline tool-agnostic (plain markdown prompts + standard scripts)
3. Add structural anti-confirmation-bias fact-checking
4. Produce blog + newsletter as a pair with one approval gate
5. Support async workflows for time-constrained authoring

## Architecture

### CLI Surface

Four commands via `./bear`:

| Command | Actor | Purpose |
|---------|-------|---------|
| `./bear seed <input>` | Human | Drop a voice memo, text idea, or URL |
| `./bear approve [--yes\|--revise\|--reject] <id>` | Human | Review and act on blog+newsletter pair |
| `./bear process` | Cron/human | Advance oldest ready seed one phase forward |
| `./bear status` | Anyone | Show all seeds and their pipeline phases |

### Directory Structure

```
inbox/                              # Seeds land here
  voice/                            # .m4a/.mp3/.wav voice memos
    processed/                      # Moved here after transcription
  text/                             # .txt/.md text seeds

pipeline/                           # New — pipeline machinery
  state.json                        # Single source of truth for all cycle state
  seeds/                            # Formatted seed files (from transcription or text)
  challenges/                       # Fact-check / counter-argument reports
  prompts/                          # Tool-agnostic AI prompt files (plain markdown)
    challenge.md                    # Anti-confirmation-bias protocol
    interview.md                    # Full brief generation (rich seeds)
    interview-qa.md                 # Question generation (thin seeds)
    draft.md                        # Blog + newsletter pair generation
    voice-guidelines.md             # Symlink to content-pipeline/VOICE_GUIDELINES.md
  adapters/                         # Per-CLI invocation scripts
    claude.sh
    gemini.sh
    codex.sh
    generic.sh

content-pipeline/                   # Existing — unchanged structure
  content-briefs/                   # Interview output (content briefs)
  drafts/                           # Now slug directories containing blog.md + newsletter.md
    YYYY-MM-DD-slug/
      blog.md
      newsletter.md
  templates/                        # Existing templates
  archive/                          # Existing archive
  VOICE_GUIDELINES.md               # Canonical — unchanged
  newsletter-ledger.jsonl           # Kept — written by bear ship phase

scripts/
  bear                              # CLI dispatcher (~150 lines bash)
  transcribe.sh                     # Whisper-based audio-to-text
  challenge.sh                      # Runs challenge protocol via AI adapter
  audit.sh                          # Consolidated 4-grep names audit
  buttondown-api.sh                 # Unchanged
  build-blog.js                     # Unchanged
  generate-post-audio.js            # Refactored: pluggable TTS (Polly or Piper)
  archive-content.sh                # Simplified
  newsletter/reconcile.sh           # Unchanged
  lib/vault-get.sh                  # Unchanged
```

### State Machine

Each seed progresses through phases:

```
SEEDED → CHALLENGED → INTERVIEWED → DRAFTED → AUDITED → APPROVED → SHIPPED → ARCHIVED
```

**Enforced transitions:**
- SEEDED → CHALLENGED: challenge.sh must run and produce a challenge report
- CHALLENGED → INTERVIEWED: interview prompt requires challenge report as input
- INTERVIEWED → DRAFTED: draft prompt requires content brief as input
- DRAFTED → AUDITED: automated 4-grep names audit (scripts/audit.sh)
- AUDITED → APPROVED: **human gate** — only `./bear approve --yes` crosses this
- APPROVED → SHIPPED: build, copy to blog/posts/, Buttondown draft, git commands
- SHIPPED → ARCHIVED: archive-content.sh moves working files to archive/

**Multiple seeds in flight:** state.json tracks an array of seeds. `./bear process` advances the oldest actionable seed. Seeds at AUDITED wait for human approval and don't block other seeds from progressing.

### State File Schema (pipeline/state.json)

```json
{
  "seeds": [
    {
      "id": "2026-04-16-agents-future",
      "phase": "drafted",
      "created": "2026-04-16T09:15:00Z",
      "updated": "2026-04-16T14:30:00Z",
      "source_type": "voice-memo",
      "interview_mode": "autonomous",
      "files": {
        "seed": "pipeline/seeds/2026-04-16-agents-future.md",
        "challenge": "pipeline/challenges/2026-04-16-agents-future.md",
        "brief": "content-pipeline/content-briefs/2026-04-16-agents-future.md",
        "blog_draft": "content-pipeline/drafts/2026-04-16-agents-future/blog.md",
        "newsletter_draft": "content-pipeline/drafts/2026-04-16-agents-future/newsletter.md"
      }
    }
  ],
  "published": [],
  "config": {
    "ai_cli": "claude",
    "transcription": "mlx-whisper",
    "tts_backend": "piper",
    "newsletter_service": "buttondown"
  }
}
```

## Components

### 1. Voice Memo Input & Transcription

**iPhone → repo path:**
1. Record in Voice Memos (or Apple Shortcut)
2. Shortcut saves to iCloud Drive folder synced to `inbox/voice/`
3. iCloud syncs to Mac

**scripts/transcribe.sh:**
- Finds `.m4a`/`.mp3`/`.wav` files in `inbox/voice/`
- Runs mlx-whisper (Apple Silicon native, local, no cloud)
- Outputs structured seed to `pipeline/seeds/`:

```markdown
---
id: 2026-04-16-morning-thought
type: voice-memo
source: inbox/voice/2026-04-16-morning-thought.m4a
transcribed: 2026-04-16T09:15:00Z
word_count: 287
---

[transcribed text here]
```

- Moves processed audio to `inbox/voice/processed/`
- Text seeds (`inbox/text/*.md`) are formatted into the same seed structure without transcription

**Slug generation:** `./bear seed` derives the ID as `YYYY-MM-DD-slug` where the slug comes from the first ~5 meaningful words of the seed text (or transcription), lowercased and kebab-cased. For example, "Most engineers will manage agents by 2027" becomes `2026-04-16-engineers-manage-agents`. If a collision exists, a numeric suffix is appended (`-2`, `-3`).

**Dependency:** mlx-whisper (`pip install mlx-whisper`). One-time setup on Apple Silicon Mac.

### 2. Anti-Confirmation-Bias Challenge Protocol

**pipeline/prompts/challenge.md** instructs the AI:

1. **Extract** every factual claim, prediction, and assertion from the seed
2. **Research** each claim using web search — find real data, studies, counter-examples
3. **Rate** each claim:
   - GROUNDED: supported by multiple credible sources
   - PLAUSIBLE: logical but limited evidence
   - SPECULATIVE: interesting but unsubstantiated
   - CONTRADICTED: evidence points the other way
4. **Counter-argue** each claim — present the strongest opposing position
5. **Timeline-check** time-bound predictions — find comparable historical transitions
6. **Reframe** SPECULATIVE/CONTRADICTED claims into honest alternatives

**Output:** `pipeline/challenges/YYYY-MM-DD-slug.md` with structured assessment per claim.

**Design principle:** The challenge runs before the author invests in a draft. Pushback is easier to accept when you haven't written 1,500 words yet.

**Hard rule:** The challenge report is a required input to the interview phase. The interview prompt reads the challenge and uses it to ask harder questions. An unchallenged seed cannot become a draft.

### 3. Adaptive Interview

The interview phase adapts based on seed quality:

**Seed quality detection:**
- Word count < 100 OR fewer than 3 distinct claims → **thin seed**
- Word count >= 100 AND 3+ distinct claims → **rich seed**

**Thin seed path (async Q&A):**
1. AI reads seed + challenge report
2. Generates 3-5 targeted questions saved to `pipeline/seeds/YYYY-MM-DD-slug-questions.md`
3. The file includes a `<!-- AWAITING_ANSWERS -->` marker at the top
4. User writes answers below each question (or drops another voice memo into inbox/)
5. User signals completion by running `./bear seed --answers <id>` (removes the marker)
6. Next `./bear process` picks up the answered questions and generates the full content brief

**Rich seed path (autonomous):**
1. AI reads seed + challenge report
2. Generates the full content brief directly
3. Brief includes how each challenged claim was handled (kept, reframed, or cut)

**Output:** `content-pipeline/content-briefs/YYYY-MM-DD-slug.md` using the existing brief template structure.

**Names gate:** The interview prompt enforces the Names & Attribution Policy. Any proper nouns in the seed are flagged in the brief's Names Allowlist section. The brief must explicitly list which names are approved and why.

### 4. Draft Generation (Blog + Newsletter Pair)

**pipeline/prompts/draft.md** instructs the AI to produce both artifacts in one pass:

1. Read the content brief
2. Read VOICE_GUIDELINES.md for tone and style
3. Generate blog post (1200-1500 words) with frontmatter:
   ```yaml
   ---
   title: "..."
   date: YYYY-MM-DD
   excerpt: "..."
   tags: [...]
   subtitle: "..."
   category: "..."
   illustration: "..."
   audio: true
   audioVoice: Matthew
   ---
   ```
4. Generate newsletter (150-200 words) following the newsletter template
5. Run self-audit (4-grep check) before finalizing
6. Save both to `content-pipeline/drafts/YYYY-MM-DD-slug/blog.md` and `newsletter.md`

**Key change from current:** Blog and newsletter are always produced together. No separate `/content-newsletter` step.

### 5. Names Audit (scripts/audit.sh)

Consolidation of the 4-grep audit currently copy-pasted in 3 slash commands into one standalone script:

```bash
#!/usr/bin/env bash
# scripts/audit.sh — Run the 4-grep names & attribution audit
# Usage: ./scripts/audit.sh <file1> [file2 ...]
# Exit 0: clean. Exit 1: hard-block hits. Exit 2: review-needed hits (no hard blocks).

hard_fail=0
review_needed=0

# 1. Blocklist — HARD BLOCK (any hit = fail)
if grep -EnI "Hivenet|compute\.hivenet|hive\.net|Antimatter" "$@"; then
  hard_fail=1
fi

# 2. Proper-noun surfaces — REVIEW NEEDED (surface to user, not a hard block)
if grep -EnI "\b[A-Z][a-z]+ [A-Z][a-z]+\b" "$@"; then
  review_needed=1
fi

# 3. Attribution idioms — REVIEW NEEDED
if grep -EnI "\bsaid\b|according to|put it well|argues|wrote about|'s book|'s post|'s article|inspired by" "$@"; then
  review_needed=1
fi

# 4. Fake-persona patterns — HARD BLOCK
if grep -EnI "(a developer named|an engineer named|let's call (him|her|them)|for example,? [A-Z][a-z]+ (the|our|a) )" "$@"; then
  hard_fail=1
fi

# Exit codes: 0=clean, 1=hard block, 2=review needed
[ "$hard_fail" -eq 1 ] && exit 1
[ "$review_needed" -eq 1 ] && exit 2
exit 0
```

Called by `./bear process` at the DRAFTED → AUDITED transition. Exit 1 (hard block) prevents advancement. Exit 2 (review needed) advances to AUDITED but flags items for the user to review during `./bear approve`. Also callable standalone for manual checks.

### 6. Approval & Ship

**`./bear approve`** without arguments shows all seeds in AUDITED state with summaries.

**`./bear approve --yes <id>`** triggers the ship phase:
1. Copy `blog.md` to `blog/posts/YYYY-MM-DD-slug.md`
2. Run `npm run build` (build:pages + build:audio + build:blog)
3. Run `newsletter/reconcile.sh --dry-run` (preflight)
4. Push newsletter to Buttondown as draft via `buttondown-api.sh`
5. Append entry to `newsletter-ledger.jsonl`
6. Display git commands for user to commit and push:
   ```bash
   git add blog/posts/YYYY-MM-DD-slug.md blog/audio/slug.mp3 blog/audio/.audio-manifest.json
   git commit -S -m "Add blog post: Title"
   git push origin main
   ```

**`./bear approve --revise <id>`** resets the seed to INTERVIEWED with a note, triggering a re-draft on next `./bear process`.

**`./bear approve --reject <id>`** moves the seed to a REJECTED state (kept in state.json history but no further processing).

### 7. Tool-Agnostic Adapter System

Each adapter in `pipeline/adapters/` implements one function:

```bash
# ai_run PROMPT_FILE OUTPUT_FILE CONTEXT_FILE [CONTEXT_FILE...]
ai_run() { ... }
```

**pipeline/adapters/claude.sh:**
```bash
ai_run() {
  local prompt="$1" output="$2"; shift 2
  local context_args=()
  for f in "$@"; do context_args+=(--context "$f"); done
  claude -p "$prompt" "${context_args[@]}" > "$output"
}
```

**pipeline/adapters/gemini.sh:**
```bash
ai_run() {
  local prompt="$1" output="$2"; shift 2
  gemini --prompt-file "$prompt" --files "$@" > "$output"
}
```

Selected via `BEAR_AI_CLI` env var or `pipeline/state.json` → `config.ai_cli`.

All prompts are plain markdown in `pipeline/prompts/`. The adapter handles invocation mechanics; the prompt handles intelligence.

### 8. Audio Generation (Pluggable TTS)

Refactor `scripts/generate-post-audio.js` to check `BLOG_AUDIO_BACKEND` env var (or `pipeline/state.json` → `config.tts_backend`):

- `polly` (existing): uses AWS Polly via `aws polly synthesize-speech` (requires AWS_PROFILE)
- `piper` (new default): uses Piper TTS locally (`piper --model en_US-lessac-medium --output_file out.mp3`)

The manifest/caching logic (content hash, skip-if-unchanged) stays identical. Only the `synthesizeChunk()` function branches on backend.

**Dependency for Piper:** `brew install piper` or download binary. One-time setup.

**Migration:** New posts default to Piper. Existing Polly-generated audio stays as-is (content hash prevents re-generation).

## Removals

| File | Reason |
|------|--------|
| `.claude/commands/content-start.md` | Replaced by `./bear seed` + process |
| `.claude/commands/content-draft.md` | Replaced by draft phase in process |
| `.claude/commands/content-publish.md` | Replaced by `./bear approve --yes` |
| `.claude/commands/content-newsletter.md` | Newsletter produced in draft phase |
| `.claude/commands/content-archive.md` | Archive is automatic after ship |
| `.claude/commands/content-status.md` | Replaced by `./bear status` |
| `.claude/agents/content-strategy-specialist.md` | Logic distilled into pipeline/prompts/interview.md |
| `scripts/create-content-brief.sh` | Brief creation is part of interview phase |
| BACKLOG.md content tracker section | Replaced by pipeline/state.json |

**Kept unchanged:** `buttondown-api.sh`, `build-blog.js`, `newsletter/reconcile.sh`, `archive-content.sh`, `lib/vault-get.sh`, `VOICE_GUIDELINES.md`, all templates, `newsletter-ledger.jsonl`.

## Verification Plan

### End-to-End Test: Voice Memo to Published Post

1. Record a 90-second voice memo on iPhone with a debatable claim
2. Place in `inbox/voice/`
3. Run `./bear process` — verify transcription produces a seed in `pipeline/seeds/`
4. Run `./bear process` — verify challenge report in `pipeline/challenges/` with honest ratings
5. Run `./bear process` — verify content brief generated with challenge data incorporated
6. Run `./bear process` — verify blog.md + newsletter.md pair in `content-pipeline/drafts/`
7. Run `./bear process` — verify 4-grep audit passes (or flags real issues)
8. Run `./bear approve` — verify summary display with challenge accountability
9. Run `./bear approve --yes <id>` — verify build runs, Buttondown draft created, git commands shown
10. Review `pipeline/state.json` — verify seed progressed through all phases

### Unit Tests

- `scripts/audit.sh` — test with known-good and known-bad files
- `scripts/transcribe.sh` — test with a sample .m4a file
- `pipeline/state.json` — test state transitions (no phase skipping)
- Adapter scripts — test each adapter with a simple prompt

### Tool-Agnosticism Test

- Run full cycle with Claude Code adapter
- Run full cycle with Gemini CLI adapter (once written)
- Verify identical output structure regardless of adapter

### Regression: Names Audit

- Draft a post that contains a coworker-overlap name
- Verify audit.sh catches it at DRAFTED → AUDITED
- Verify the pipeline blocks (does not proceed to APPROVED)
