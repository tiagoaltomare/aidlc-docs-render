# Tech Stack Decisions

## Primary Language Decisions

- **Answer Extraction and Save Logic**: TypeScript
  - **Rationale**: Aligns with the extension host, shared typed contracts, and the existing unit-testing approach.
- **Preview Answer Editing UI**: React with TypeScript
  - **Rationale**: Builds directly on the rendered preview UI already established in the previous unit.

## Runtime Architecture Decisions

- **Extraction and Rebuild Execution Location**: Extension host
  - **Rationale**: Keeps authoritative markdown handling and workspace writes inside the trusted host boundary.
- **Preview Editing State Location**: Webview-local UI state backed by typed host requests and responses
  - **Rationale**: Supports responsive editing while preserving host authority over rebuild and persistence.

## Persistence Decisions

- **Workspace Write Strategy**: Use VS Code-native workspace/file APIs for save-back
  - **Rationale**: Matches requirements and avoids legacy helper-server dependencies.
- **Save Validation Strategy**: Validate document identity and answer-field ownership before rebuild and write
  - **Rationale**: Supports fail-closed save behavior and document integrity.

## Parsing and Rebuild Decisions

- **Answer Detection Direction**: Use deterministic line- and region-aware parsing tailored to standalone `[Answer]:` semantics
  - **Rationale**: The unit needs precise eligibility behavior that respects excluded regions such as fenced code blocks.
- **Markdown Rebuild Direction**: Rebuild from a structured extraction result rather than ad hoc string replacement only
  - **Rationale**: Improves integrity, testability, and preservation of non-owned content.

## State and Contract Decisions

- **Preview Save State Strategy**: Track explicit dirty, saving, saved, and failed states in typed preview models
  - **Rationale**: Supports clear user feedback and controlled retry behavior.
- **Save Request Contract**: Use typed host/webview messages carrying document identity, version reference, and answer-field value updates
  - **Rationale**: Keeps preview and host aligned while supporting stale-request rejection.

## Testing Decisions

- **Primary Test Focus**:
  - answer-marker eligibility detection
  - fenced-code exclusion behavior
  - existing-value extraction
  - round-trip rebuild integrity
  - non-owned content preservation
  - save-request validation
  - save-result state mapping
- **Rationale**: These seams carry the highest correctness and data-integrity risk while remaining suitable for automated testing.

- **Property-Based Testing Framework Candidate**: `fast-check`
  - **Rationale**: Fits the TypeScript stack and is especially suitable for round-trip and invariant-heavy markdown transformation logic.

## Security and Packaging Decisions

- **Security Stance**: Treat markdown as untrusted input and keep parsing, rebuild, and persistence decisions on the host side
  - **Rationale**: Supports the enabled security baseline and protects against unsafe preview-side write authority.
- **Preview Editing Security Direction**: Keep the webview limited to answer-field UI state and never let it write directly to disk
  - **Rationale**: Preserves trust boundaries and reduces save-path risk.
- **Packaging Direction**: Prefer lightweight local logic and existing extension/runtime surfaces over external helper processes
  - **Rationale**: Supports `.vsix` delivery readiness and simpler review.

## Deferred Decisions

- Exact conflict-handling behavior when raw-tab edits and preview answer edits diverge simultaneously
- Exact refresh coupling between save completion and navigator or preview invalidation
- Exact choice of any helper utilities for structured markdown region tracking beyond baseline TypeScript logic

These remain deferred because they depend more directly on the later refresh-and-delivery unit and on the final code-generation tradeoffs.
