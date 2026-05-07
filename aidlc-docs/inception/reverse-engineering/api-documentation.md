# API Documentation

## Local HTTP APIs

### Save Markdown

- **Method**: `POST`
- **Path**: `/save`
- **Purpose**: Persist edited markdown content back to the docs tree.
- **Request**: JSON body with `path` and `content`.
- **Response**: `{ "ok": true }` on success or an error payload.

### Live Reload Events

- **Method**: `GET`
- **Path**: `/events`
- **Purpose**: Stream server-sent events to refresh the viewer when docs change.
- **Request**: No body.
- **Response**: SSE stream with `reload` events and heartbeat comments.

### Static Assets

- **Method**: `GET`
- **Paths**: `/`, `/index.html`, `/manifest.js`, and local assets served from the viewer folder
- **Purpose**: Serve the viewer when running the optional local server.
- **Response**: Static files.

## Internal Runtime APIs

### Viewer Runtime Functions

- **`renderNav(files)`**: Builds phase, section, and document navigation from the manifest.
- **`renderDoc(file)`**: Converts markdown into rendered document content and applies rich behaviors.
- **`processAnswerMarkers(docBody, file)`**: Replaces standalone answer markers with editable textareas.
- **`rebuildMarkdown(originalContent, answers)`**: Reconstructs markdown with updated answer values.
- **`saveAnswers(file, docBody, btn)`**: Persists edits through the local save API or fallback download flow.
- **`connectLiveReload()`**: Subscribes to SSE updates and refreshes manifest-driven UI state.

### Generator Functions

- **`scan_files(docs_dir)`**: Reads markdown files and assembles manifest entries.
- **`build_and_write(docs_dir, output_path)`**: Writes the manifest JavaScript file.
- **`snapshot(docs_dir)`**: Captures file mtimes for watch-mode change detection.

### Save Server Functions

- **`build_manifest()`**: Rebuilds the manifest during local server operation.
- **`sse_push(event, data)`**: Broadcasts reload messages to connected browser tabs.
- **`_watch_loop()`**: Polls docs changes and triggers rebuild plus live reload.

## Data Models

### Manifest Root

- **Fields**:
  - `title`: UI title string.
  - `project`: inferred project name.
  - `generated`: ISO timestamp of manifest generation.
  - `files`: list of manifest file entries.

### Manifest File Entry

- **Fields**:
  - `path`: slash-normalized relative path.
  - `title`: derived H1 or filename-based title.
  - `phase`: `overview`, `inception`, `construction`, `operations`, or `other`.
  - `section`: first nested folder under the phase, when present.
  - `content`: raw markdown source.

### Save Payload

- **Fields**:
  - `path`: target markdown path under the docs root.
  - `content`: full replacement markdown content.

### Draft Storage Entry

- **Fields**:
  - array of textarea values stored under `localStorage["aidlc-ans-" + file.path]`.
