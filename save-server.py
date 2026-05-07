#!/usr/bin/env python3
"""
AIDLC Docs — Local Server
==========================
Serves the docs viewer, saves answers back to .md files, and optionally
watches the docs folder for changes — notifying the browser via SSE so the
navigation reloads automatically without a full page refresh.

USAGE
-----
  python aidlc-docs/_docs-viewer/save-server.py            # serve only
  python aidlc-docs/_docs-viewer/save-server.py --watch    # serve + live reload

Then open: http://localhost:8765
"""

import argparse
import json
import os
import queue
import re
import sys
import threading
import time
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingMixIn

# ─── CONFIG (same as generate-manifest.py) ──────────────────────────────────
PORT          = 8765
DOCS_ROOT     = ".."
EXCLUDE_DIRS  = {
    "_docs-viewer", ".git", ".github", "__pycache__",
    ".aidlc-rule-details", ".amazonq", ".kiro", "node_modules",
}
EXCLUDE_FILES = set()
WATCH_INTERVAL = 3   # seconds between filesystem polls
# ────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent.resolve()
# DOCS_DIR is resolved at runtime in main() — do not use this module-level value directly.
DOCS_DIR   = (SCRIPT_DIR / DOCS_ROOT).resolve()
MANIFEST   = SCRIPT_DIR / "manifest.js"

# SSE: list of queues, one per connected browser tab
_sse_clients: list[queue.Queue] = []
_sse_lock = threading.Lock()


# ─── SSE helpers ─────────────────────────────────────────────────────────────

def sse_push(event: str, data: str = ""):
    """Broadcast an SSE event to every connected client."""
    msg = f"event: {event}\ndata: {data}\n\n".encode()
    with _sse_lock:
        dead = []
        for q in _sse_clients:
            try:
                q.put_nowait(msg)
            except queue.Full:
                dead.append(q)
        for q in dead:
            _sse_clients.remove(q)


# ─── Manifest generator (inline copy, no import needed) ──────────────────────

def _extract_title(content: str, filename: str) -> str:
    m = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return re.sub(r"[-_]+", " ", Path(filename).stem).title()


def _detect_phase(rel: Path) -> str:
    parts = rel.parts
    if len(parts) == 1:
        return "overview"
    top = parts[0].lower()
    return top if top in ("inception", "construction", "operations") else "other"


def _scan(docs_dir: Path) -> list:
    files = []
    for root, dirs, filenames in os.walk(docs_dir):
        dirs[:] = sorted(
            d for d in dirs
            if d not in EXCLUDE_DIRS and not d.startswith(".") and not d.startswith("_")
        )
        rp = Path(root)
        for fn in sorted(filenames):
            if not fn.endswith(".md") or fn in EXCLUDE_FILES:
                continue
            full = rp / fn
            rel  = full.relative_to(docs_dir)
            if any(p in EXCLUDE_DIRS or p.startswith(".") or p.startswith("_")
                   for p in rel.parts[:-1]):
                continue
            try:
                content = full.read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            parts   = rel.parts
            phase   = _detect_phase(rel)
            section = parts[1] if len(parts) >= 3 else None
            files.append({
                "path":    str(rel).replace("\\", "/"),
                "title":   _extract_title(content, fn),
                "phase":   phase,
                "section": section,
                "content": content,
            })
    return files


def _project_name() -> str:
    state = DOCS_DIR / "aidlc-state.md"
    if state.exists():
        m = re.search(r"\*\*Workspace Root\*\*[^:\n]*:\s*(.+)", state.read_text(errors="replace"))
        if m:
            return Path(m.group(1).strip().replace("\\", "/")).name
    return ""


def build_manifest() -> int:
    project = _project_name()
    title   = "AIDLC Docs" + (f" · {project}" if project else "")
    files   = _scan(DOCS_DIR)
    payload = {
        "title":     title,
        "project":   project,
        "generated": datetime.now(timezone.utc).isoformat(),
        "files":     files,
    }
    MANIFEST.write_text(
        "// Auto-generated — do not edit manually.\n"
        "window.AIDLC_MANIFEST = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    return len(files)


def _snapshot() -> dict:
    snap = {}
    for root, dirs, files in os.walk(DOCS_DIR):
        dirs[:] = [
            d for d in dirs
            if d not in EXCLUDE_DIRS and not d.startswith(".") and not d.startswith("_")
        ]
        for fn in files:
            if fn.endswith(".md") and fn not in EXCLUDE_FILES:
                fp = Path(root) / fn
                try:
                    snap[str(fp)] = fp.stat().st_mtime
                except OSError:
                    pass
    return snap


def _watch_loop():
    """Background thread: poll for .md changes, rebuild manifest, push SSE."""
    last = {}
    while True:
        time.sleep(WATCH_INTERVAL)
        snap = _snapshot()
        if snap != last:
            count = build_manifest()
            ts    = datetime.now().strftime("%H:%M:%S")
            new   = len(snap) - len(last) if len(snap) > len(last) else 0
            label = f"+{new} novo(s)" if new > 0 else "modificado"
            print(f"[{ts}] manifest atualizado — {count} arquivos ({label})")
            sse_push("reload", json.dumps({"files": count, "ts": ts}))
            last = snap


# ─── HTTP Handler ─────────────────────────────────────────────────────────────

class Handler(SimpleHTTPRequestHandler):

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    # ── GET: SSE live-reload stream ───────────────────────────────────────
    def do_GET(self):
        if self.path.split("?")[0] == "/events":
            self.send_response(200)
            self.send_header("Content-Type",  "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection",    "keep-alive")
            self._cors()
            self.end_headers()

            q: queue.Queue = queue.Queue(maxsize=8)
            with _sse_lock:
                _sse_clients.append(q)

            try:
                while True:
                    try:
                        msg = q.get(timeout=20)
                        self.wfile.write(msg)
                        self.wfile.flush()
                    except queue.Empty:
                        # Heartbeat keeps the connection alive through proxies/browsers
                        self.wfile.write(b": heartbeat\n\n")
                        self.wfile.flush()
            except Exception:
                pass
            finally:
                with _sse_lock:
                    if q in _sse_clients:
                        _sse_clients.remove(q)
            return

        # Everything else: serve static files from _docs-viewer/
        super().do_GET()

    # ── POST /save ────────────────────────────────────────────────────────
    def do_POST(self):
        if self.path != "/save":
            self.send_error(404)
            return
        try:
            length  = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length))
            rel     = payload.get("path", "").strip()
            content = payload.get("content", "")

            if not rel:
                raise ValueError("Missing 'path' field")

            target = (DOCS_DIR / rel).resolve()
            if not str(target).startswith(str(DOCS_DIR)):
                self._json(403, {"ok": False, "error": "Path outside docs root"})
                return

            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
            self._json(200, {"ok": True})
            print(f"  saved  {rel}")

        except Exception as exc:
            self._json(500, {"ok": False, "error": str(exc)})
            print(f"  error  {exc}", file=sys.stderr)

    def _json(self, code: int, body: dict):
        data = json.dumps(body).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        pass


class ThreadingServer(ThreadingMixIn, HTTPServer):
    """Handle each request in its own thread (required for SSE + concurrent saves)."""
    daemon_threads = True

    def handle_error(self, request, client_address):
        exc_type, exc, _ = sys.exc_info()
        if isinstance(exc, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            return
        super().handle_error(request, client_address)


# ─── Folder picker ───────────────────────────────────────────────────────────

def _pick_folder_dialog(initial_dir: str = "") -> str | None:
    """Open a native folder-picker dialog using tkinter (if available)."""
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        folder = filedialog.askdirectory(
            title="Selecione a pasta root de docs",
            initialdir=initial_dir or os.getcwd(),
        )
        root.destroy()
        return folder or None
    except Exception as exc:
        print(f"⚠  Não foi possível abrir o seletor de pasta: {exc}", file=sys.stderr)
        return None


def _parse_args():
    parser = argparse.ArgumentParser(
        description="AIDLC Docs — Local Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "examples:\n"
            "  python save-server.py --watch                        # usa DOCS_ROOT do script\n"
            "  python save-server.py --docs-root /caminho --watch   # digita o caminho\n"
            "  python save-server.py --pick --watch                 # abre seletor de pasta\n"
        ),
    )
    parser.add_argument(
        "--docs-root", metavar="CAMINHO",
        help="Caminho para a pasta root de docs (absoluto ou relativo ao diretório do script)",
    )
    parser.add_argument(
        "--pick", action="store_true",
        help="Abre um seletor de pasta nativo para indicar a docs root",
    )
    parser.add_argument(
        "--watch", action="store_true",
        help="Observa alterações e regenera o manifest com live reload",
    )
    return parser.parse_args()


def _read_docs_root_from_manifest() -> Path | None:
    """Read docs_root recorded in manifest.js by generate-manifest.py, if present."""
    if not MANIFEST.exists():
        return None
    try:
        text = MANIFEST.read_text(encoding="utf-8", errors="replace")
        # manifest.js format: window.AIDLC_MANIFEST = { ... };
        m = re.search(r"window\.AIDLC_MANIFEST\s*=\s*(\{.*\})", text, re.DOTALL)
        if not m:
            return None
        data = json.loads(m.group(1))
        raw = data.get("docs_root", "")
        if raw:
            p = Path(raw)
            if p.exists():
                return p.resolve()
    except Exception:
        pass
    return None


def _resolve_docs_dir(args) -> Path:
    """Determine and return the resolved docs root Path.

    Priority:
      1. --pick  (interactive dialog)
      2. --docs-root  (explicit CLI arg)
      3. docs_root stored in manifest.js by generate-manifest.py
      4. DOCS_ROOT default from CONFIG block
    """
    default_dir = (SCRIPT_DIR / DOCS_ROOT).resolve()

    if args.pick:
        chosen = _pick_folder_dialog(initial_dir=str(default_dir))
        if not chosen:
            print("❌  Nenhuma pasta selecionada.", file=sys.stderr)
            sys.exit(1)
        return Path(chosen).resolve()

    if args.docs_root:
        candidate = Path(args.docs_root)
        if not candidate.is_absolute():
            candidate = SCRIPT_DIR / candidate
        return candidate.resolve()

    manifest_root = _read_docs_root_from_manifest()
    if manifest_root:
        return manifest_root

    return default_dir


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    global DOCS_DIR

    args     = _parse_args()
    DOCS_DIR = _resolve_docs_dir(args)

    if not DOCS_DIR.exists():
        print(f"❌  Pasta de docs não encontrada: {DOCS_DIR}", file=sys.stderr)
        sys.exit(1)

    os.chdir(SCRIPT_DIR)   # serve files from _docs-viewer/

    # Build manifest once on startup
    count = build_manifest()
    print(f"AIDLC Docs  →  http://localhost:{PORT}")
    print(f"Docs root   →  {DOCS_DIR}")
    print(f"Manifest    →  {count} arquivos indexados")
    if args.watch:
        t = threading.Thread(target=_watch_loop, daemon=True)
        t.start()
        print(f"Watch       →  ativo (poll a cada {WATCH_INTERVAL}s, live reload via SSE)")
    else:
        print("Watch       →  desativado  (use --watch para live reload)")
    print("Ctrl+C para parar.\n")

    server = ThreadingServer(("localhost", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nParado.")


if __name__ == "__main__":
    main()
