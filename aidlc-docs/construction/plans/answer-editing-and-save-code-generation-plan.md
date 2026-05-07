# Answer Editing and Save Code Generation Plan

## Unit Context

- **Unit**: Answer Editing and Save
- **Stories Implemented by This Unit**:
  - US-12 Render Standalone Answer Fields
  - US-13 Save Answer Edits Back to Markdown
  - US-14 Preserve Full Editing Through Raw Tabs
- **Primary Dependencies**:
  - Extension Foundation
  - Navigator and Preview UI
- **Expected Interfaces and Contracts**:
  - typed preview host/webview messages for answer edit and save flows
  - runtime preview document identity and version references
  - host-side markdown extraction, rebuild, and workspace save pipeline
  - preview UI extension points for answer controls and save lifecycle feedback
- **Database Entities Owned**: None
- **Service Boundaries and Responsibilities**:
  - this unit owns answer-field extraction, answer edit state, markdown rebuild, and workspace save-back
  - preview rendering from the previous unit remains the base content pipeline
  - discovery, grouped navigation, bootstrap setup, and refresh orchestration remain outside this unit

## Target Code Paths

- **Workspace Root**: `C:\Users\tiagoa\Source\aidlc-docs-render`
- **Application Code Target**:
  - `src/shared/`
  - `src/extension/`
  - `src/webview/preview/`
  - `tests/`
- **Documentation Target**:
  - `aidlc-docs/construction/answer-editing-and-save/code/`

## Generation Strategy

- Brownfield migration: extend the existing preview pipeline in place rather than introducing a separate answer-editing surface.
- Keep authoritative answer extraction, markdown rebuild, validation, and file persistence on the host side.
- Add answer controls and save lifecycle feedback to the existing React preview while preserving the current read-oriented preview structure for non-answer content.
- Preserve clear seams for the later refresh-and-delivery unit, especially around save completion, stale document handling, and raw-versus-preview mode coordination.

## Detailed Steps

### Step 1. Prepare shared answer-editing contracts and domain models
- [x] Review the current preview contracts, preview document model, and rendered preview provider flow.
- [x] Extend `src/shared/` with answer-field descriptors, extraction results, save request/result payloads, and preview save-state types.
- [x] Keep the contract surface typed, version-aware, and aligned with stale-save rejection requirements.

### Step 2. Generate host-side answer extraction and markdown rebuild logic
- [x] Add pure or near-pure host-side logic for standalone answer-marker detection, excluded-region handling, and existing-value extraction.
- [x] Add structured markdown rebuild logic that rewrites only owned answer regions and preserves unrelated content.
- [x] Keep extraction and rebuild seams independent from filesystem writes so they remain highly testable.

### Step 3. Extend the preview provider with answer-aware host orchestration
- [x] Modify the rendered preview provider under `src/extension/` so it can build answer-enriched preview state from workspace markdown.
- [x] Add host-side message handling for answer edits and save requests.
- [x] Add save-request validation, rebuild execution, and VS Code-native workspace persistence with explicit save-result feedback.

### Step 4. Extend the preview React UI with answer controls and save feedback
- [x] Modify the existing preview React components under `src/webview/preview/` to render eligible answer fields as editable controls.
- [x] Add local answer-edit state, dirty tracking, save lifecycle cues, and explicit mode guidance that points broader edits to raw tabs.
- [x] Add stable `data-testid` coverage for answer controls, save actions, and save-state feedback.

### Step 5. Integrate save-success baseline updates and failure recovery behavior
- [x] Ensure successful saves establish a new preview baseline for extracted answer values.
- [x] Ensure failed saves preserve unsaved answer edits for retry.
- [x] Preserve fail-closed behavior when document identity becomes stale or rebuild cannot be completed safely.

### Step 6. Generate unit tests for extraction, rebuild, and save behavior
- [x] Add tests for standalone answer-marker eligibility, fenced-code exclusion, existing-value extraction, and non-standalone marker rejection.
- [x] Add tests for round-trip rebuild integrity, non-owned content preservation, and unchanged-value idempotence.
- [x] Add tests for save-request validation and save-result state mapping, aligned with Partial PBT expectations.

### Step 7. Validate brownfield safety and preview-boundary integrity
- [x] Verify the unit modifies the existing extension and preview structure in place without creating duplicate brownfield files.
- [x] Verify preview answer editing remains scoped to answer fields and does not imply full arbitrary markdown persistence.
- [x] Verify the resulting unit leaves clean extension points for later refresh coordination and packaging validation.

### Step 8. Produce code-generation summaries for this unit
- [x] Create markdown summaries in `aidlc-docs/construction/answer-editing-and-save/code/` covering modified files, created files, and test scope.
- [x] Capture how this unit closes US-12 through US-14 and what remains intentionally deferred to later units.

## Story Traceability

- **US-12**: Closed by standalone answer-marker detection and answer-control rendering in preview.
- **US-13**: Closed by validated save requests, markdown rebuild, and VS Code-native workspace persistence.
- **US-14**: Closed by explicit preview-versus-raw editing boundaries and mode guidance in the preview experience.

## Plan Notes

- Total planned generation steps: 8
- Highest-impact changes in this unit are concentrated in shared answer models, host-side extraction/rebuild logic, rendered preview provider orchestration, and preview UI save-state handling.
- This unit intentionally stops short of implementing automatic refresh coordination, simultaneous raw/preview conflict resolution policy beyond guarded stale handling, bootstrap setup, and final delivery validation.
