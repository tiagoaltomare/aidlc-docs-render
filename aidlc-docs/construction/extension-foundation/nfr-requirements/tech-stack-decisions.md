# Tech Stack Decisions

## Primary Language Decisions

- **Extension Host Logic**: TypeScript
  - **Rationale**: Strong fit for VS Code extension APIs, shared contract typing, and maintainable runtime wiring.
- **Webview Host Shell Integration**: TypeScript
  - **Rationale**: Aligns with the React-based frontend direction and shared typed contracts.

## Runtime Architecture Decisions

- **Extension Runtime Model**: Native VS Code extension host with centralized activation entry
  - **Rationale**: Matches the foundation unit's responsibility for commands, views, preview registration, and shared service wiring.
- **Contract Model**: Typed host/webview action and response contracts
  - **Rationale**: Supports validation, testability, and safe evolution across downstream units.

## UI Host Decisions

- **Navigator Hosting Strategy**: Support both dedicated panel and side view from the first delivery
  - **Rationale**: Approved in Application Design and required by the functional design business rules.
- **Foundation Status UX**: Minimal host-shell status boundary before downstream features attach
  - **Rationale**: Prevents broken startup experiences and supports safe degraded states.

## Build and Tooling Decisions

- **Package and Extension Metadata**: `package.json`-driven VS Code extension manifest
  - **Rationale**: Required for contribution registration and later `.vsix` packaging.
- **Source Organization**: Separate extension-host and webview-facing code paths with shared contracts module
  - **Rationale**: Preserves separation of privileged host logic from UI code.

## Testing Decisions

- **Unit Testing Focus**:
  - activation lifecycle behavior
  - contribution registration outcomes
  - contract validation helpers
  - runtime status derivation helpers
- **Rationale**: These are the highest-value test seams in the foundation unit.

- **Property-Based Testing Framework Candidate**: `fast-check`
  - **Rationale**: Fits the TypeScript stack and supports Partial PBT enforcement later where pure helpers exist.

## Security and Packaging Decisions

- **Webview Security Stance**: Default to strict contract boundaries and CSP-compatible foundations
  - **Rationale**: Required by the enabled security extension and later preview/webview work.
- **Dependency Strategy**: Favor package-managed local dependencies for foundation/runtime code
  - **Rationale**: The foundation unit should not depend on CDN loading for core runtime behavior.
- **Packaging Direction**: Keep foundation structure compatible with future `.vsix` packaging and validation
  - **Rationale**: Required by delivery goals and later packaging-readiness unit work.

## Deferred Decisions

- Exact React bundling choice for full navigator implementation
- Exact markdown, Mermaid, and syntax-highlighting library choices for preview-heavy units
- Exact testing runner and CI wiring for full-package validation

These remain deferred because they are better decided in later units once preview and packaging scopes are implemented.
