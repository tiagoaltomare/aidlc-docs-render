# NFR Requirements

## Unit Scope

- **Unit**: Answer Editing and Save
- **Purpose**: Implement answer-field transformation and persistence back to workspace markdown files.
- **NFR Focus**: Safe answer-marker extraction, integrity-preserving markdown rebuild, controlled workspace save-back, clear answer-editing UX, and strong testability for extraction and rebuild seams.

## Scalability Requirements

- The answer-processing logic must handle documents with multiple answer fields without requiring a redesign of the extraction or rebuild approach.
- The preview answer-editing model must support documents that mix headings, prose, code blocks, diagrams, and many answer markers without collapsing the rendering contract.
- The unit must remain extensible so later refresh and synchronization work can integrate with answer-field state without reworking the save foundation.

## Performance Requirements

- Answer-field extraction should be fast enough for interactive preview opening on normal AIDLC markdown documents.
- Dirty-state tracking should respond immediately to user edits without requiring full document reparse on every keystroke unless explicitly needed.
- Save operations should avoid unnecessary work outside the targeted document and should rebuild markdown only from the active preview document state.
- The save flow should provide prompt user feedback when save is in progress, succeeds, or fails.

## Availability and Reliability Requirements

- A failed save must not discard the current in-memory answer edits.
- A failed extraction or rebuild must fail closed without writing partial or guessed markdown back to disk.
- Save success must establish a new consistent baseline so subsequent edits compare against the saved state.
- The unit must distinguish clearly between extraction failure, rebuild failure, and workspace write failure so later units can respond predictably.

## Security Requirements

- The host must validate that every save request targets the expected workspace markdown file and current preview identity before writing.
- Markdown rebuild must preserve non-owned content and must not allow answer-field updates to escape their intended replacement boundaries.
- Persistence must remain restricted to VS Code-native workspace file APIs and must not reintroduce the legacy local HTTP save helper.
- User-facing save errors must avoid exposing stack traces, unrelated file paths, or internal implementation details.
- Answer-field extraction must treat markdown content as untrusted input and must avoid interpreting answer markers inside excluded regions such as fenced code blocks.

## Maintainability Requirements

- Extraction, rebuild, dirty-state comparison, and persistence orchestration should remain separate concerns.
- Answer-field descriptors and save request/result models must remain stable shared types so preview and host logic do not drift.
- The unit must preserve a clear boundary between answer editing and broader raw markdown editing behavior.
- Save lifecycle and error categories should remain explicit rather than hidden inside ad hoc UI state.

## Testability Requirements

- Extraction eligibility rules should be testable independently of VS Code UI concerns.
- Markdown rebuild behavior should be testable independently of actual filesystem writes.
- Save-request validation and save-result mapping should be testable without requiring end-to-end editor interactions.
- Partial PBT expectations apply strongly to:
  - extraction and rebuild round-trip behavior
  - non-owned content preservation invariants
  - non-standalone marker exclusion invariants
  - rebuild idempotence for unchanged values

## Usability Requirements

- Users must be able to tell when answer edits are unsaved, saving, saved, or failed.
- The preview must keep answer editing understandable and must not imply that full markdown authoring is available there.
- Existing answer values must appear clearly in editable controls before the user makes changes.
- Save failure messaging must be actionable enough that users know whether to retry in preview or switch to raw editing.

## Accessibility Requirements

- Answer controls and save actions must remain keyboard-usable within the preview webview.
- Dirty, saving, saved, and failed states must be communicated in ways that are not color-only.
- Save feedback and editing-mode explanations should remain understandable to assistive technologies.

## Delivery and Packaging Requirements

- The unit must fit the established extension-host plus React webview architecture without introducing a side-channel save runtime.
- Save behavior must remain compatible with `.vsix` packaging and local extension execution.
- New dependencies for extraction or rebuild logic should favor lightweight, packaging-friendly choices and should not undermine later security review.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-01**: N/A. No separate persistence store is introduced beyond workspace file writes.
- **SECURITY-02**: N/A. No network intermediary is defined in this unit.
- **SECURITY-03**: Compliant. The unit requires explicit save lifecycle and failure categories that later implementation can log in a controlled manner.
- **SECURITY-04**: Compliant. Preview-side answer editing remains within the secure webview model already established for the extension.
- **SECURITY-05**: Compliant. Save-request validation, excluded-region handling, and rebuild boundary protection are explicit requirements.
- **SECURITY-06**: N/A. No IAM policy surface exists in this unit.
- **SECURITY-07**: N/A. No network configuration exists in this unit.
- **SECURITY-08**: N/A. No authenticated application surface exists in this unit.
- **SECURITY-09**: Compliant. Failed extraction, rebuild, and save paths must fail closed and avoid damaging existing workspace content.
- **SECURITY-10**: Compliant. The unit explicitly avoids reintroducing the legacy HTTP helper flow.
- **SECURITY-11**: Compliant. Answer extraction, rebuild, and persistence responsibilities remain isolated by concern.
- **SECURITY-12**: N/A. No authentication model is introduced.
- **SECURITY-13**: Compliant. Rebuild integrity and workspace target validation protect document integrity.
- **SECURITY-14**: N/A. Monitoring and alerting are outside this unit's immediate scope.
- **SECURITY-15**: Compliant. Save and rebuild failures must fail closed without partial writes or silent data loss.

### Property-Based Testing

- **PBT-02**: Strongly applicable. Extraction plus rebuild has a clear round-trip property.
- **PBT-03**: Strongly applicable. Content-preservation and exclusion invariants are central to this unit.
- **PBT-07**: Strongly applicable. Domain-specific generators for markdown with mixed answer and non-answer regions will be valuable.
- **PBT-08**: Applicable later. Reproducibility belongs to implementation and test execution stages.
- **PBT-09**: Compliant. The unit remains compatible with TypeScript PBT framework adoption.
