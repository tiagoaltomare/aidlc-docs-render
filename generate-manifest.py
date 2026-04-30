#!/usr/bin/env python3
"""
AIDLC Docs — Manifest Generator
=================================
Scans the parent aidlc-docs directory and generates manifest.js for the
docs viewer SPA. The manifest embeds all .md content as a JS variable so
index.html works with the file:// protocol (no server required).

USAGE
-----
  python generate-manifest.py           # generate once and exit
  python generate-manifest.py --watch   # watch for changes (polls every 3 s)

PORTABILITY
-----------
Edit the CONFIG block below to adapt this to any project.
"""

import os
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ─── CONFIG ─────────────────────────────────────────────────────────────────
# Path to the docs folder, relative to this script file.
DOCS_ROOT = ".."

# Title displayed in the site header.
# Leave empty ("") to auto-detect from aidlc-state.md.
SITE_TITLE = "AIDLC Docs"

# Directories to skip (relative directory names, not full paths).
EXCLUDE_DIRS = {
    "_docs-viewer",
    ".git",
    ".github",
    "__pycache__",
    ".aidlc-rule-details",
    ".amazonq",
    ".kiro",
    "node_modules",
}

# Individual filenames to exclude (basename only).
# audit.md can be very large; remove it from this set if you want it indexed.
EXCLUDE_FILES = set()

# Output filename written next to this script.
OUTPUT_FILE = "manifest.js"

# Seconds between filesystem polls in --watch mode.
WATCH_INTERVAL = 3
# ────────────────────────────────────────────────────────────────────────────


# ─── HELPERS ────────────────────────────────────────────────────────────────

def detect_project_name(docs_dir: Path) -> str:
    """Try to read the project/workspace name from aidlc-state.md."""
    state = docs_dir / "aidlc-state.md"
    if not state.exists():
        return ""
    try:
        content = state.read_text(encoding="utf-8", errors="replace")
        # Look for: **Workspace Root**: C:\Users\foo\projects\my-project
        m = re.search(r"\*\*Workspace Root\*\*[^:\n]*:\s*(.+)", content)
        if m:
            raw = m.group(1).strip()
            # Return just the last path component
            return Path(raw.replace("\\", "/")).name
    except Exception:
        pass
    return ""


def extract_title(content: str, filename: str) -> str:
    """Extract title from first H1 heading, or fall back to the filename stem."""
    m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    stem = Path(filename).stem
    return re.sub(r"[-_]+", " ", stem).title()


def detect_phase(rel_path: Path) -> str:
    """Map a relative path to its AIDLC phase name."""
    parts = rel_path.parts
    if len(parts) == 1:
        return "overview"
    top = parts[0].lower()
    if top in ("inception", "construction", "operations"):
        return top
    return "other"


def scan_files(docs_dir: Path) -> list:
    """Walk docs_dir and return a list of file descriptor dicts."""
    results = []

    for root, dirs, filenames in os.walk(docs_dir):
        # Sort and filter subdirectories in-place so os.walk respects them.
        dirs[:] = sorted(
            d for d in dirs
            if d not in EXCLUDE_DIRS
            and not d.startswith(".")
            and not d.startswith("_")
        )

        root_path = Path(root)
        for filename in sorted(filenames):
            if not filename.endswith(".md"):
                continue
            if filename in EXCLUDE_FILES:
                continue

            full_path = root_path / filename
            rel_path = full_path.relative_to(docs_dir)

            # Skip anything inside excluded/hidden/private dirs
            skip = False
            for part in rel_path.parts[:-1]:
                if part in EXCLUDE_DIRS or part.startswith(".") or part.startswith("_"):
                    skip = True
                    break
            if skip:
                continue

            try:
                content = full_path.read_text(encoding="utf-8", errors="replace")
            except Exception as exc:
                print(f"  ⚠  Could not read {rel_path}: {exc}", file=sys.stderr)
                continue

            parts = rel_path.parts
            phase = detect_phase(rel_path)
            # section = first subdirectory under the phase dir (or None for root files)
            section = parts[1] if len(parts) >= 3 else None

            results.append({
                "path":    str(rel_path).replace("\\", "/"),
                "title":   extract_title(content, filename),
                "phase":   phase,
                "section": section,
                "content": content,
            })

    return results


def build_and_write(docs_dir: Path, output_path: Path) -> int:
    """Generate manifest.js and return the number of files indexed."""
    project_name = detect_project_name(docs_dir)
    title = SITE_TITLE or "AIDLC Docs"
    if project_name:
        title = f"{title} · {project_name}"

    files = scan_files(docs_dir)

    manifest = {
        "title":     title,
        "project":   project_name,
        "generated": datetime.now(timezone.utc).isoformat(),
        "files":     files,
    }

    js = (
        "// Auto-generated by generate-manifest.py — do not edit manually.\n"
        "// Run: python _docs-viewer/generate-manifest.py\n"
        "window.AIDLC_MANIFEST = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n"
    )
    output_path.write_text(js, encoding="utf-8")
    return len(files)


def snapshot(docs_dir: Path) -> dict:
    """Return {filepath_str: mtime} for all tracked .md files."""
    snap = {}
    for root, dirs, files in os.walk(docs_dir):
        dirs[:] = [
            d for d in dirs
            if d not in EXCLUDE_DIRS
            and not d.startswith(".")
            and not d.startswith("_")
        ]
        for fname in files:
            if fname.endswith(".md") and fname not in EXCLUDE_FILES:
                fp = Path(root) / fname
                try:
                    snap[str(fp)] = fp.stat().st_mtime
                except OSError:
                    pass
    return snap


# ─── MAIN ───────────────────────────────────────────────────────────────────

def main():
    script_dir = Path(__file__).parent.resolve()
    docs_dir   = (script_dir / DOCS_ROOT).resolve()
    output     = script_dir / OUTPUT_FILE

    if not docs_dir.exists():
        print(f"❌  DOCS_ROOT not found: {docs_dir}", file=sys.stderr)
        sys.exit(1)

    if "--watch" in sys.argv:
        print(f"👀  Watching {docs_dir}")
        print(f"    Output  → {output}")
        print("    Press Ctrl+C to stop.\n")
        last_snap: dict = {}
        while True:
            try:
                snap = snapshot(docs_dir)
                if snap != last_snap:
                    count = build_and_write(docs_dir, output)
                    ts    = datetime.now().strftime("%H:%M:%S")
                    print(f"[{ts}] ✅  manifest.js updated — {count} files indexed")
                    last_snap = snap
                time.sleep(WATCH_INTERVAL)
            except KeyboardInterrupt:
                print("\n✋  Stopped.")
                break
    else:
        count = build_and_write(docs_dir, output)
        print(f"✅  manifest.js generated — {count} files indexed")
        print(f"    Output  → {output}")
        print(f"    Open    → aidlc-docs/_docs-viewer/index.html")


if __name__ == "__main__":
    main()
