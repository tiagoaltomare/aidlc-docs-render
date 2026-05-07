# Tech Stack Decisions

## Primary Language Decisions

- **Refresh Coordination and Delivery Validation Logic**: TypeScript
  - **Rationale**: Aligns with the extension host, existing shared type strategy, and current automated test approach.

## Runtime Architecture Decisions

- **Refresh Orchestration Location**: Extension host
  - **Rationale**: Workspace watching, state replacement, preview resynchronization, and readiness validation all require host-side authority.
- **User Interaction Surface**: VS Code-native commands, notifications, and output-oriented status surfaces
  - **Rationale**: Manual refresh and delivery-readiness flows are operational actions and do not require a new dedicated custom webview.

## Refresh and Watcher Decisions

- **Watcher Strategy**: Use VS Code-native workspace file-watch mechanisms scoped to relevant paths and events
  - **Rationale**: Keeps refresh behavior aligned with the extension runtime and avoids custom external filesystem watchers.
- **Refresh Coordination Strategy**: Route all relevant triggers through one host-side coordination path
  - **Rationale**: Supports coherent snapshot publication and prevents independent consumer drift.
- **Failure Recovery Strategy**: Preserve the last valid synchronized state and publish explicit degraded outcomes
  - **Rationale**: Improves reliability without hiding refresh failures.

## Delivery Validation Decisions

- **Validation Execution Location**: Repository-local extension or project validation logic
  - **Rationale**: Build, test, and packaging checks are tied to the repository and should stay close to the shipped extension codebase.
- **Validation Output Strategy**: Represent readiness by explicit typed check categories and summarized outcome reporting
  - **Rationale**: Keeps delivery readiness understandable and testable without requiring the full build pipeline in every unit test.

## Testing Decisions

- **Primary Test Focus**:
  - refresh-trigger relevance classification
  - superseding or coalescing refresh intent
  - last-valid-state preservation
  - stale-preview and unavailable-document state derivation
  - delivery-readiness result aggregation
- **Rationale**: These seams carry the highest correctness and user-trust risk while remaining amenable to isolated automated testing.

- **Property-Based Testing Framework Candidate**: `fast-check`
  - **Rationale**: Fits the TypeScript stack and is well suited for trigger-sequence and readiness-coverage invariants in this unit.

## Security and Packaging Decisions

- **Security Stance**: Treat watcher events, changed paths, and readiness inputs as untrusted until classified against the allowed scope
  - **Rationale**: Supports the enabled security baseline and reduces unsafe refresh or validation behavior.
- **Packaging Direction**: Keep refresh and readiness behavior inside the extension-host runtime with repository-local validation hooks
  - **Rationale**: Supports `.vsix` delivery readiness and avoids dependence on the old standalone site workflow.

## Deferred Decisions

- Exact debounce or coalescing timing policy for rapid watcher bursts
- Exact visual surface for long-running delivery-readiness reporting
- Exact integration depth between readiness validation and final build/test automation commands

These remain deferred because they depend more directly on implementation tradeoffs and the later build-and-test stage.
