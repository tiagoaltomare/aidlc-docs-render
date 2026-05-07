# Technology Stack

## Programming Languages

- `HTML` - application shell and document structure.
- `JavaScript` - client runtime logic in the viewer.
- `Python` - manifest generation, local save API, and live reload.
- `Markdown` - source content format rendered by the application.
- `JSON` - generated manifest payload format.

## Frameworks

- `marked` - Markdown parser.
- `highlight.js` - code syntax highlighting.
- `mermaid` - diagram rendering.

## Infrastructure

- Browser runtime with optional `file://` execution.
- Local Python HTTP server for save and live reload workflows.
- Local filesystem as content source and persistence target.

## Build Tools

- `python` - runs the generator and local server scripts.
- `npm package metadata` - currently only minimal package declaration, no actual frontend build pipeline yet.

## Testing Tools

- No automated test framework is currently configured.
- Manual browser verification is implied by the current workflow.
