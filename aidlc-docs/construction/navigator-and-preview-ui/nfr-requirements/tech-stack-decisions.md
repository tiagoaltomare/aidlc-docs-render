# Tech Stack Decisions

## Primary Language Decisions

- **Navigator Host and Preview Logic**: TypeScript
  - **Rationale**: Aligns with the extension host, shared typed contracts, and existing test strategy.
- **Webview UI**: React with TypeScript
  - **Rationale**: Matches the approved frontend direction and supports shared component structure across panel, side view, and preview surfaces.

## Runtime Architecture Decisions

- **Navigator Execution Model**: React webview hosts backed by the extension-host runtime
  - **Rationale**: Preserves a clear trust boundary between workspace access and UI behavior.
- **Preview Execution Model**: Host-built preview models rendered in a dedicated preview surface
  - **Rationale**: Keeps document identity validation and capability checks outside untrusted UI code.

## Rendering Decisions

- **Markdown Rendering Direction**: Use a renderer that can operate within a CSP-compatible VS Code webview model
  - **Rationale**: The extension must preserve current markdown behavior without depending on the original standalone page structure.
- **Code Highlighting Direction**: Preserve language-aware highlighting through a packaging-compatible library path
  - **Rationale**: Supports the current viewer expectations while remaining bundle-friendly.
- **Mermaid Rendering Direction**: Support Mermaid through a controlled capability layer with graceful fallback when unavailable
  - **Rationale**: Meets functional requirements without allowing diagram failures to break the full preview.

## State and Contract Decisions

- **Navigator Data Source**: Consume the runtime document index and discovery state produced by the host
  - **Rationale**: Avoids duplicating grouping or discovery logic inside the webview.
- **Open Request Contract**: Use typed host/webview messages carrying relative-path identity, open mode, and expected index version
  - **Rationale**: Supports deterministic stale-request rejection and stable preview identity rules.
- **Preview Model Strategy**: Use host-prepared preview document models rather than raw ad hoc rendering inputs
  - **Rationale**: Centralizes validation, metadata shaping, and capability gating.

## Testing Decisions

- **Primary Test Focus**:
  - navigator state projection
  - search filtering behavior
  - group pruning rules
  - stale open-request validation
  - preview model creation
  - render block classification and fallback logic
- **Rationale**: These seams carry the most user-visible risk while remaining amenable to automated testing.

- **Property-Based Testing Framework Candidate**: `fast-check`
  - **Rationale**: Fits the TypeScript stack and is well suited for navigation and preview invariants in this unit.

## Security and Packaging Decisions

- **Security Stance**: Treat markdown-derived content as untrusted and keep file access, identity validation, and capability decisions on the host side
  - **Rationale**: Supports the enabled security baseline and prevents the webview from becoming a privileged execution path.
- **Webview Security Direction**: Preserve CSP-compatible asset loading and avoid assumptions that require unrestricted inline script execution
  - **Rationale**: Supports secure VS Code webview delivery.
- **Packaging Direction**: Prefer bundled local assets and libraries that can ship inside the extension package
  - **Rationale**: Avoids dependence on the old site runtime model and supports `.vsix` delivery readiness.

## Deferred Decisions

- Exact markdown rendering library choice
- Exact syntax-highlighting library and theme integration details
- Exact Mermaid runtime packaging strategy
- Exact tree virtualization strategy if very large repositories prove it necessary

These remain deferred because they are better finalized during NFR Design and Code Generation once implementation tradeoffs are evaluated against the actual extension bundle shape.
