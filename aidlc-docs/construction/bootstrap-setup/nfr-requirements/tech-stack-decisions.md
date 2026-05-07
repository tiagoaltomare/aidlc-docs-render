# Tech Stack Decisions

## Primary Language Decisions

- **Bootstrap Validation and Setup Logic**: TypeScript
  - **Rationale**: Aligns with the extension host, shared typed contracts, and existing test strategy.

## Runtime Architecture Decisions

- **Validation and Planning Execution Location**: Extension host
  - **Rationale**: Extracted-folder inspection, workspace-bound target resolution, and file-copy execution must remain inside the trusted host boundary.
- **User Interaction Surface**: VS Code-native command and prompt surfaces
  - **Rationale**: The unit is command-driven and does not require a dedicated custom webview to deliver the initial guided setup flow.

## Filesystem and Execution Decisions

- **Source Inspection Strategy**: Use VS Code-native workspace/file APIs for directory inspection and copy operations
  - **Rationale**: Keeps file handling inside supported extension boundaries.
- **Destination Resolution Strategy**: Build explicit source-to-target mappings before execution
  - **Rationale**: Supports boundary validation, overwrite analysis, and testable planning behavior.
- **Execution Strategy**: Separate validation and planning from actual write execution
  - **Rationale**: Improves fail-closed behavior and keeps safety checks understandable.

## Setup Mode Decisions

- **Initial Setup Mode Direction**: Support the approved Codex/OpenAI Codex-style workspace layout first
  - **Rationale**: Matches the current cycle scope and approved requirements.
- **Mode Extensibility Direction**: Represent setup mode and target layout explicitly rather than hardcoding everything into copy steps
  - **Rationale**: Keeps the unit extendable for later setup modes.

## Testing Decisions

- **Primary Test Focus**:
  - extracted-folder validation
  - required-asset detection
  - workspace-bound target resolution
  - existing-target categorization
  - deterministic setup planning
  - execution outcome categorization
- **Rationale**: These seams carry the highest safety and correctness risk while remaining amenable to isolated automated testing.

- **Property-Based Testing Framework Candidate**: `fast-check`
  - **Rationale**: Fits the TypeScript stack and is well suited for path and planning invariants in this unit.

## Security and Packaging Decisions

- **Security Stance**: Treat both extracted source content and workspace path inputs as untrusted until validated on the host side
  - **Rationale**: Supports the enabled security baseline and prevents unsafe copy behavior.
- **Overwrite Safety Direction**: Represent existing-target analysis and overwrite risk explicitly in planning before execution
  - **Rationale**: Reduces the chance of silent destructive behavior.
- **Packaging Direction**: Keep bootstrap behavior inside the extension-host runtime with no external helper services
  - **Rationale**: Supports `.vsix` delivery readiness and simpler review.

## Deferred Decisions

- Exact progress-reporting mechanism for long-running setup operations
- Exact rollback or cleanup strategy after partial execution failures
- Exact future setup-mode support beyond the initially approved layout

These remain deferred because they depend more directly on implementation tradeoffs and later delivery-readiness work.
