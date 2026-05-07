# NFR Requirements

## Unit Scope

- **Unit**: Navigator and Preview UI
- **Purpose**: Deliver the React navigator hosts and rendered preview experience in VS Code.
- **NFR Focus**: Responsive grouped navigation, predictable preview opening, safe webview rendering, controlled block-level fallbacks, and maintainable host-to-webview contracts.

## Scalability Requirements

- The navigator must remain usable as the discovered document tree grows in document count, section depth, and visible groups.
- Search and tree projection must scale with normal AIDLC repository sizes without forcing the architecture to change.
- The preview pipeline must support documents with mixed prose, code, and Mermaid regions without assuming small or trivial markdown inputs.

## Performance Requirements

- Navigator initialization from an already-built runtime index should feel immediate for normal workspace sizes.
- Search filtering should respond interactively using in-memory data rather than triggering file reads or reindexing.
- Opening a raw tab or rendered preview should avoid unnecessary duplicate resolution work once the active document identity has been validated.
- Preview rendering should degrade gracefully if a specific block is expensive or unsupported rather than freezing the whole view.

## Availability and Reliability Requirements

- The panel host and side-view host must both handle empty, unavailable, and degraded states without crashing the webview.
- Stale document-open requests must be rejected deterministically when the active index version no longer matches the request.
- A single preview rendering failure must remain localized to the affected block whenever possible.
- Host and webview state transitions must remain explicit so later refresh flows can update navigator and preview surfaces predictably.

## Security Requirements

- All document-open actions must be validated on the host side against the active runtime index before a file or preview is opened.
- The webview rendering model must treat markdown-derived content as untrusted input and apply controlled rendering boundaries.
- The rendered UI must remain compatible with a restrictive Content Security Policy suitable for VS Code webviews.
- Unsupported or failed preview blocks must show safe fallback messaging without exposing internal stack traces, raw exceptions, or unrelated file-system details.
- The unit must not introduce direct file-write or bootstrap capabilities into webview UI code.

## Maintainability Requirements

- Navigator state derivation, search projection, preview model creation, and block classification should remain separable concerns.
- Host-to-webview contracts must stay typed and stable so later units can add answer-editing and refresh behavior without rewriting the UI foundation.
- The preview unit must preserve a clear boundary between read-oriented preview behavior and later save-back/edit behavior.
- Render capability checks should remain centralized rather than scattered across unrelated UI components.

## Testability Requirements

- Search projection and group-pruning logic should be testable independently of VS Code webview lifecycle concerns.
- Preview model construction and block classification should be testable independently of actual DOM rendering where practical.
- Host-side stale-request validation and preview identity rules should be testable without relying on manual editor interaction.
- Partial PBT expectations apply meaningfully to:
  - search filtering invariants
  - group pruning invariants
  - preview identity/version matching rules
  - block-classification coverage invariants

## Usability Requirements

- The navigator must communicate clearly whether the current state is ready, empty, unavailable, or degraded.
- Search behavior must be understandable and reversible, with clear restoration of the full tree when the query is cleared.
- Raw-open and preview-open actions must remain distinguishable so users understand which mode they are choosing.
- Rendered previews must preserve key document context such as title, relative path, and phase.

## Accessibility Requirements

- Navigator controls should remain keyboard-usable within the webview.
- Search input, tree actions, and fallback notices should be expressed in a way that remains understandable to assistive technologies.
- Status transitions should avoid relying only on color or motion to convey meaning.

## Delivery and Packaging Requirements

- The unit must fit the extension-host plus React webview architecture already established by the foundation unit.
- The rendered preview experience must remain compatible with `.vsix` packaging and local bundled assets rather than relying on the old standalone site shape.
- Dependencies added for markdown, highlighting, or Mermaid support must remain compatible with the extension packaging model and future security review.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-01**: N/A. No persistence store is defined in this unit.
- **SECURITY-02**: N/A. No network intermediary is defined in this unit.
- **SECURITY-03**: Compliant. The unit requires explicit host and webview state transitions that later implementation can log in a controlled way.
- **SECURITY-04**: Compliant. Restrictive CSP compatibility is an explicit requirement for webview-rendered HTML.
- **SECURITY-05**: Compliant. Host-side validation of open requests and controlled rendering boundaries are explicit requirements.
- **SECURITY-06**: N/A. No IAM policy surface exists in this unit.
- **SECURITY-07**: N/A. No network configuration exists in this unit.
- **SECURITY-08**: N/A. No authenticated application surface exists in this unit.
- **SECURITY-09**: Compliant. Degraded states and block-level fallbacks must fail safely without exposing internal details.
- **SECURITY-10**: Compliant. Packaging-compatible dependency and asset choices are an explicit unit requirement.
- **SECURITY-11**: Compliant. Host validation, capability checks, and preview rendering boundaries remain separated by concern.
- **SECURITY-12**: N/A. No authentication model is introduced.
- **SECURITY-13**: Compliant. Typed contracts and host-side validation protect preview identity and rendering integrity.
- **SECURITY-14**: N/A. Monitoring and alerting are outside this unit's immediate scope.
- **SECURITY-15**: Compliant. Stale requests and render failures must fail closed and remain localized.

### Property-Based Testing

- **PBT-02**: Applicable in principle. Round-trip properties may apply later if preview-to-model transformation pairs are introduced.
- **PBT-03**: Strongly applicable. Search projection, group pruning, and block-coverage invariants are clear candidates.
- **PBT-07**: Strongly applicable. Domain-specific generators for navigation trees, search queries, and render block shapes will be valuable.
- **PBT-08**: Applicable later. Reproducibility belongs to implementation and test execution stages.
- **PBT-09**: Compliant. The unit remains compatible with TypeScript PBT framework adoption.
