- remember to commit in this project as myself using `git commit -S ...` to sign the commit, if you want you can add claude as a honorary collaborator in all changes but to allow the repo to auto detect new commits for PR let's just author as me.

## Commit & push authorization (time-boxed)

**Authorization period:** 2026-04-19 → 2026-05-19 (1 month).

During this window, Claude Code is authorized to `git commit` and `git push` autonomously to `miketineo/miketineo.com` on the `main` branch (and feature branches).

**Conditions:**
- Every commit is GPG-signed (`git commit -S`) and authored as Miguel (so GitHub auto-detects the commit for PRs and the main branch auto-deploy workflow).
- `Co-Authored-By: Claude <noreply@anthropic.com>` trailer is fine as honorary attribution, but the primary author stays Miguel.
- Include `Actor: miguel` and `Via: cc+<model-id>` trailers per the monorepo TODO ledger protocol.
- No force-push; no history rewriting; no `--no-verify`.
- Content published via the bear pipeline still goes through the normal DRAFTED → AUDITED → APPROVED → SHIPPED gates — this authorization covers infra/code/config changes, not bypassing content review.

**After 2026-05-19:** this clause expires and the global no-commit policy from `~/.claude/CLAUDE.md` resumes unless extended.
- **Names & attribution policy for all Bear Essentials blog + newsletter content lives in `content-pipeline/VOICE_GUIDELINES.md`, first top-level section "NAMES & ATTRIBUTION POLICY".** That file is the canonical source of truth for which names may appear in generated content, the pre-publish grep audit, and the worked examples covering paraphrase / persona replacement / work-specific genericization. The `./scripts/bear` CLI enforces these rules automatically via `scripts/audit.sh` at the DRAFTED → AUDITED transition. When editing content outside the bear pipeline, apply the rules by hand.

## Bear Content Pipeline (Tool-Agnostic)

The content pipeline is managed by `./scripts/bear` — a tool-agnostic CLI that works with any AI coding assistant (Claude Code, Gemini CLI, Codex, etc.).

**Commands:**
- `./scripts/bear seed <text|audio_file>` — Drop a content seed (text or voice memo)
- `./scripts/bear process` — Advance the oldest seed one pipeline phase
- `./scripts/bear approve [--yes|--revise|--reject] [ID]` — Review and act on drafts
- `./scripts/bear status` — Show pipeline state

**State machine:** SEEDED → CHALLENGED → INTERVIEWED → DRAFTED → AUDITED → APPROVED → SHIPPED → ARCHIVED

**Key files:**
- `pipeline/state.json` — single source of truth for pipeline state
- `pipeline/prompts/` — AI prompt files (plain markdown, model-agnostic)
- `pipeline/adapters/` — per-CLI adapter scripts (claude.sh, gemini.sh, generic.sh)
- `scripts/audit.sh` — consolidated 4-grep names audit
- `scripts/transcribe.sh` — local Whisper-based voice memo transcription

**Design spec:** `docs/superpowers/specs/2026-04-16-bear-content-pipeline-redesign.md`