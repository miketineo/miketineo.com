#!/usr/bin/env python3
"""
Parse Bear's per-piece pipeline artifacts into data.json for the interview UI.

Usage:
    build-data.py <piece-id>                 (writes data.json in UI dir)
    build-data.py <piece-id> -               (writes JSON to stdout)

Reads (relative to project root):
    pipeline/state.json
    pipeline/seeds/<piece-id>.md
    pipeline/challenges/<piece-id>-questions.md     (preferred; the real interview)
    pipeline/challenges/<piece-id>.md               (fallback: the challenge report itself)
    content-pipeline/content-briefs/<piece-id>.md   (fallback: shows brief instead of Qs)

Writes:
    scripts/bear-interview-ui/data.json             (default destination)

Schema the UI consumes:
    {
      "piece":     {"id": str, "title": str, "phase": str},
      "seed":      str,
      "questions": [ {"id": str, "num": str, "title": str,
                      "question": str, "why": str, "existing": str} ],
      "fallback_html": str  # optional — shown when questions == []
    }
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# Locate project root (parent of scripts/)
# ─────────────────────────────────────────────────────────────

HERE = Path(__file__).resolve().parent          # scripts/bear-interview-ui/
ROOT = HERE.parent.parent                        # project root


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8") if p.exists() else ""


def strip_frontmatter(text: str) -> str:
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            return parts[2].lstrip()
    return text


def extract_title(seed: str, piece_id: str) -> str:
    body = strip_frontmatter(seed).strip()
    if not body:
        return piece_id
    first_para = body.split("\n\n", 1)[0].strip()
    words = first_para.split()
    title = " ".join(words[:14])
    if len(title) > 88:
        title = title[:85].rstrip() + "…"
    return title or piece_id


def phase_for(piece_id: str) -> str:
    state_path = ROOT / "pipeline" / "state.json"
    try:
        state = json.loads(read(state_path))
    except Exception:
        return "UNKNOWN"
    for s in state.get("seeds", []):
        if s.get("id") == piece_id:
            return s.get("phase", "UNKNOWN")
    return "UNKNOWN"


# ─────────────────────────────────────────────────────────────
# Interview-questions parser
# Expected format:
#
#   ## Question 1: <Title>
#   <question body>
#
#   **Why this matters:** <why body>
#
#   **Your answer:**
#   <existing answer (optional — preserved across re-opens)>
#
#   ---
# ─────────────────────────────────────────────────────────────

Q_HEADER = re.compile(r"^##\s+Question\s+(\d+)\s*:\s*(.+?)\s*$", re.MULTILINE)
WHY_SPLIT = re.compile(r"\*\*Why this matters:\*\*", re.IGNORECASE)
ANSWER_SPLIT = re.compile(r"\*\*Your answer:\*\*", re.IGNORECASE)


def slug(text: str, fallback: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or fallback


def strip_trailing_rule(text: str) -> str:
    return re.sub(r"\n+---\s*$", "", text).strip()


def parse_questions(md: str) -> list[dict]:
    if not md:
        return []
    headers = list(Q_HEADER.finditer(md))
    out: list[dict] = []
    for i, m in enumerate(headers):
        num = m.group(1).zfill(2)
        title = m.group(2).strip()
        body_start = m.end()
        body_end = headers[i + 1].start() if i + 1 < len(headers) else len(md)
        body = md[body_start:body_end]

        q_body, why_body, existing = body, "", ""
        if WHY_SPLIT.search(body):
            q_body, rest = WHY_SPLIT.split(body, maxsplit=1)
            if ANSWER_SPLIT.search(rest):
                why_body, existing = ANSWER_SPLIT.split(rest, maxsplit=1)
            else:
                why_body = rest

        out.append({
            "id": slug(title, f"q{num}"),
            "num": num,
            "title": title,
            "question": strip_trailing_rule(q_body),
            "why": strip_trailing_rule(why_body),
            "existing": strip_trailing_rule(existing),
        })
    return out


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

def build(piece_id: str) -> dict:
    seed_md = read(ROOT / "pipeline" / "seeds" / f"{piece_id}.md")
    seed = strip_frontmatter(seed_md).strip()
    title = extract_title(seed, piece_id)
    phase = phase_for(piece_id)

    questions_path = ROOT / "pipeline" / "challenges" / f"{piece_id}-questions.md"
    questions = parse_questions(read(questions_path))

    fallback_html = ""
    if not questions:
        brief = read(ROOT / "content-pipeline" / "content-briefs" / f"{piece_id}.md")
        if brief.strip():
            fallback_html = (
                "<p>No interview questions generated for this piece "
                "(Bear detected a rich seed and wrote a content brief instead). "
                "The brief below already captures the drafting direction:</p>"
                f"<pre class=\"fallback-brief\">{_escape(brief)}</pre>"
            )
        else:
            fallback_html = (
                "<p>No interview questions found for "
                f"<code>{_escape(piece_id)}</code>. "
                "Run <code>./scripts/bear process</code> until the piece reaches "
                "the INTERVIEWED phase.</p>"
            )

    return {
        "piece": {"id": piece_id, "title": title, "phase": phase},
        "seed": seed,
        "questions": questions,
        "fallback_html": fallback_html,
    }


def _escape(s: str) -> str:
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
    )


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2

    piece_id = argv[1]
    to_stdout = len(argv) > 2 and argv[2] == "-"

    data = build(piece_id)
    payload = json.dumps(data, indent=2, ensure_ascii=False)

    if to_stdout:
        print(payload)
    else:
        out = HERE / "data.json"
        out.write_text(payload + "\n", encoding="utf-8")
        print(f"Wrote {out.relative_to(ROOT)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
