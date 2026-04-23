#!/usr/bin/env python3
"""
QA checker for a built Bear Essentials blog post.

Usage:
    bear-qa.py <built-post.html> [--preview-root <dir>]

Runs lightweight sanity checks for common layout / UI shenanigans:

  - Em-dashes in rendered HTML (voice rule; defense in depth)
  - <img> tags without explicit width/max-width constraint
  - Image src paths that 404 under preview-root
  - Very wide source images (flag if native width > 1000px and post doesn't
    cap display width with an explicit style)
  - Empty <code> or <pre> blocks (markdown escaping bugs)
  - Unresolved link targets (internal /blog/... links pointing nowhere)
  - "TODO" / "FIXME" / "XXX" leaks into rendered copy

Prints warnings to stderr. Exits 0 even on warnings (non-blocking); exits 1
only if the HTML can't be parsed at all.

Integrate via ./scripts/bear preview, which calls this after build.
"""

from __future__ import annotations

import argparse
import html
import re
import struct
import sys
from pathlib import Path


# ─────────────────────────────────────────────────────────────
# Minimal image size probe (no pillow/imagemagick dep)
# ─────────────────────────────────────────────────────────────

def probe_image_size(path: Path) -> tuple[int, int] | None:
    """Return (width, height) in pixels for GIF/PNG/JPEG, or None."""
    try:
        with path.open("rb") as f:
            head = f.read(24)
    except OSError:
        return None
    if len(head) < 10:
        return None

    # GIF: bytes 6-10 are width (LE) then height (LE)
    if head[:6] in (b"GIF87a", b"GIF89a"):
        w = struct.unpack("<H", head[6:8])[0]
        h = struct.unpack("<H", head[8:10])[0]
        return w, h

    # PNG: bytes 16-24 are width then height (BE) after IHDR marker
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        w, h = struct.unpack(">II", head[16:24])
        return w, h

    # JPEG: scan for SOF marker — rough but works for most JPEGs
    if head[:3] == b"\xff\xd8\xff":
        try:
            with path.open("rb") as f:
                f.read(2)
                while True:
                    b = f.read(1)
                    while b and b != b"\xff":
                        b = f.read(1)
                    if not b:
                        return None
                    b = f.read(1)
                    while b == b"\xff":
                        b = f.read(1)
                    marker = b[0] if b else 0
                    if 0xC0 <= marker <= 0xC3:
                        f.read(3)
                        h, w = struct.unpack(">HH", f.read(4))
                        return w, h
                    size_bytes = f.read(2)
                    if len(size_bytes) < 2:
                        return None
                    size = struct.unpack(">H", size_bytes)[0]
                    f.read(size - 2)
        except Exception:
            return None

    return None


# ─────────────────────────────────────────────────────────────
# Parsing helpers
# ─────────────────────────────────────────────────────────────

IMG_TAG = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
ATTR_PATTERN = re.compile(r'(\w[\w-]*)\s*=\s*"([^"]*)"|(\w[\w-]*)\s*=\s*\'([^\']*)\'', re.IGNORECASE)
STYLE_SIZE = re.compile(r"(?:^|;)\s*(?:max-width|width)\s*:", re.IGNORECASE)
LINK_TAG = re.compile(r'<a\b[^>]*\bhref=["\']([^"\']+)["\'][^>]*>', re.IGNORECASE)


def parse_attrs(tag: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for m in ATTR_PATTERN.finditer(tag):
        name = (m.group(1) or m.group(3) or "").lower()
        value = m.group(2) if m.group(2) is not None else (m.group(4) or "")
        if name:
            attrs[name] = html.unescape(value)
    return attrs


# ─────────────────────────────────────────────────────────────
# Check functions
# ─────────────────────────────────────────────────────────────

def check_em_dashes(body: str) -> list[str]:
    count = body.count("—")
    if count:
        return [f"{count} em-dash(es) in rendered HTML — voice rule violation"]
    return []


def check_todos(body: str) -> list[str]:
    warnings = []
    for word in ("TODO", "FIXME", "XXX"):
        if re.search(rf"\b{word}\b", body):
            warnings.append(f"'{word}' appears in rendered HTML")
    return warnings


def check_empty_codeblocks(body: str) -> list[str]:
    warnings = []
    if re.search(r"<code>\s*</code>", body):
        warnings.append("Empty <code> tag(s) — possible markdown-escaping bug")
    if re.search(r"<pre>\s*</pre>", body):
        warnings.append("Empty <pre> tag(s)")
    return warnings


def check_images(body: str, preview_root: Path | None) -> list[str]:
    warnings: list[str] = []
    LARGE_NATIVE_THRESHOLD = 1000  # px
    for tag in IMG_TAG.findall(body):
        attrs = parse_attrs(tag)
        src = attrs.get("src", "")
        if not src:
            warnings.append("Image tag without src attribute")
            continue

        has_width_attr = "width" in attrs
        has_style_width = bool(STYLE_SIZE.search(attrs.get("style", "")))
        if not (has_width_attr or has_style_width):
            warnings.append(
                f"Image <{src}> has no width/max-width constraint — "
                "will render at native size"
            )

        # Resolve to disk if we have preview_root and the src is a site path
        if preview_root and src.startswith("/"):
            local = preview_root / src.lstrip("/")
            if not local.exists():
                warnings.append(f"Image <{src}> does not resolve to a file in preview")
                continue

            size = probe_image_size(local)
            if size:
                w, h = size
                # Flag very wide natives when the post doesn't explicitly cap width
                if w > LARGE_NATIVE_THRESHOLD and not (has_width_attr or has_style_width):
                    warnings.append(
                        f"Image <{src}> native size is {w}×{h}px — set width or max-width "
                        f"to avoid blowing up the layout"
                    )
                # Flag very tall
                if h > 800:
                    warnings.append(
                        f"Image <{src}> native height is {h}px — confirm the post wants "
                        f"something that tall"
                    )
    return warnings


def check_internal_links(body: str, preview_root: Path | None) -> list[str]:
    if preview_root is None:
        return []
    warnings: list[str] = []
    for m in LINK_TAG.finditer(body):
        href = m.group(1)
        # Only check internal hrefs (start with /), skip anchors, mailto, external
        if not href.startswith("/"):
            continue
        if "#" in href:
            href = href.split("#", 1)[0]
        if not href:
            continue
        local = preview_root / href.lstrip("/")
        # Directory hrefs count as OK if dir exists (with or without index.html)
        if local.is_dir() and (local / "index.html").exists():
            continue
        if not local.exists():
            # Tolerate trailing-slash ambiguity
            if local.with_suffix(".html").exists():
                continue
            warnings.append(f"Internal link <{href}> does not resolve in preview")
    return warnings


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser(description="QA a built Bear blog post.")
    ap.add_argument("html_file", help="Path to built .html file")
    ap.add_argument(
        "--preview-root",
        default=None,
        help="Preview root dir for resolving /-absolute paths (typically preview/<slug>)",
    )
    args = ap.parse_args()

    html_path = Path(args.html_file)
    if not html_path.exists():
        print(f"ERROR: file not found: {html_path}", file=sys.stderr)
        return 1

    body = html_path.read_text(encoding="utf-8", errors="replace")
    preview_root = Path(args.preview_root).resolve() if args.preview_root else None

    all_warnings: list[str] = []
    all_warnings += check_em_dashes(body)
    all_warnings += check_todos(body)
    all_warnings += check_empty_codeblocks(body)
    all_warnings += check_images(body, preview_root)
    all_warnings += check_internal_links(body, preview_root)

    if not all_warnings:
        print("  QA: ✓ no warnings", file=sys.stderr)
        return 0

    print("  QA: ⚠ {} warning(s):".format(len(all_warnings)), file=sys.stderr)
    for w in all_warnings:
        print(f"    - {w}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
