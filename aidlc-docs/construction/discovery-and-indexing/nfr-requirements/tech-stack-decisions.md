# Tech Stack Decisions

## Primary Language Decisions

- **Discovery and Indexing Logic**: TypeScript
  - **Rationale**: Aligns with the extension host stack, shared typed contracts, and testable pure helper design.

## Runtime Architecture Decisions

- **Execution Location**: Extension host
  - **Rationale**: Discovery and indexing require trusted workspace access and should remain outside webview code.
- **State Model**: In-memory indexed document state with controlled replacement
  - **Rationale**: Replaces the legacy generated manifest workflow while supporting interactive refresh and downstream consumers.

## Filesystem and Path Decisions

- **Workspace Access Strategy**: Use VS Code workspace/file APIs as the primary runtime boundary
  - **Rationale**: Keeps workspace handling aligned with extension-host trust boundaries.
- **Path Identity Strategy**: Use normalized relative paths rooted at the active docs root
  - **Rationale**: Provides stable downstream document identities.

## Grouping and Metadata Decisions

- **Phase Mapping Strategy**: Preserve AIDLC top-level grouping conventions in the index model
  - **Rationale**: Keeps behavior aligned with the current viewer and approved requirements.
- **Title Resolution Strategy**: Prefer explicit headings, otherwise use deterministic filename fallback
  - **Rationale**: Preserves current user-facing expectations while supporting index stability.

## Testing Decisions

- **Primary Test Focus**:
  - docs-root detection logic
  - manual selection validation
  - path normalization helpers
  - title derivation helpers
  - phase/section grouping helpers
  - refresh-safe replacement behavior
- **Rationale**: These are the highest-value unit seams and are largely pure or near-pure.

- **Property-Based Testing Framework Candidate**: `fast-check`
  - **Rationale**: Fits the TypeScript stack and is especially useful for normalization and grouping invariants in this unit.

## Security and Packaging Decisions

- **Security Stance**: Treat candidate paths and derived document identities as validated host-side inputs only
  - **Rationale**: Supports the enabled security extension and preserves boundary safety.
- **Legacy Runtime Replacement**: Do not depend on Python helpers or checked-in manifests for active extension behavior
  - **Rationale**: This unit's purpose is to replace those legacy flows with extension-host logic.
- **Packaging Direction**: Keep the unit as host-side TypeScript logic with no special packaging exceptions
  - **Rationale**: Simplifies later build and `.vsix` readiness work.

## Deferred Decisions

- Exact refresh optimization strategy for large repositories
- Exact caching strategy beyond the initial in-memory index
- Exact search index or fuzzy matching implementation details

These remain deferred because they depend more heavily on the later navigator, refresh, and delivery-readiness units.
