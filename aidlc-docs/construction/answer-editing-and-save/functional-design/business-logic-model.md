# Business Logic Model

## Unit Scope

- **Unit**: Answer Editing and Save
- **Purpose**: Implement answer-field transformation and persistence back to workspace markdown files.
- **Stories Owned**:
  - US-12 Render Standalone Answer Fields
  - US-13 Save Answer Edits Back to Markdown
  - US-14 Preserve Full Editing Through Raw Tabs
- **Boundaries**:
  - Owns standalone `[Answer]:` detection, preview answer-field state, markdown rebuild, and workspace save requests
  - Consumes the rendered preview experience and document identity provided by the previous unit
  - Does not own docs-root discovery, grouped navigation, bootstrap setup flows, or refresh orchestration policies

## Core Workflow Model

### Workflow 1: Detect Editable Answer Fields

1. The preview pipeline receives raw markdown for a selected document.
2. The answer-processing logic scans the document line-by-line.
3. A line becomes an editable answer field only when `[Answer]:` appears as a standalone answer marker according to the unit rules.
4. The logic captures:
   - marker location
   - current answer value, if present
   - field identity within the document
5. The preview model is enriched with answer-field descriptors so the rendered preview can replace those markers with editable controls.

### Workflow 2: Render Preview Answer Controls

1. The preview UI receives the enriched preview model.
2. Non-answer content continues through the normal preview rendering flow.
3. Each eligible answer marker is rendered as an answer control with the current answer value already populated.
4. The preview keeps answer-field editing local to those controls rather than switching into arbitrary markdown editing mode.

### Workflow 3: Track Answer Edits in Preview

1. The user changes one or more answer-field values in the rendered preview.
2. The preview stores those edits in a local answer-edit state keyed by field identity.
3. The preview can determine whether the document has unsaved answer edits by comparing current field values against the original extracted values.
4. The save action packages only the current answer-field values and document identity for host-side processing.

### Workflow 4: Rebuild Markdown With Updated Answers

1. The host receives a save request for a specific preview document and answer-field value set.
2. The answer-processing logic reloads or uses the authoritative raw markdown source for that document.
3. The rebuild logic applies the updated answers back into the exact marker locations.
4. The resulting markdown preserves all non-answer content and formatting outside the answer-field replacement boundaries.
5. The host produces an updated markdown payload ready for workspace persistence.

### Workflow 5: Persist Updated Markdown to the Workspace

1. The host validates that the save request still targets the current document identity.
2. The host writes the rebuilt markdown back to the workspace markdown file through VS Code-native file APIs.
3. If the write succeeds, the preview receives a save-success state and the document source becomes the new baseline for answer-field values.
4. If the write fails, the preview receives a controlled save-failure state and the unsaved answer edits remain visible for retry or manual recovery.

### Workflow 6: Preserve Dual Editing Modes

1. The user may choose to edit a document broadly through the raw markdown tab or fill answers through the rendered preview.
2. The rendered preview remains scoped to answer fields and save actions for those fields only.
3. Raw editor tabs remain the place for arbitrary markdown restructuring, wording changes, or non-answer edits.
4. The extension communicates those two modes clearly so users do not expect full markdown editing in the rendered preview.

## State Model

### Answer Extraction State

- Tracks all detected standalone answer markers for the current document.
- Tracks each marker's original value and exact document placement.
- Distinguishes eligible answer fields from non-eligible textual occurrences of `[Answer]:`.

### Preview Answer Edit State

- Tracks the current in-preview value for each answer field.
- Tracks whether any answer field is dirty relative to the original extracted state.
- Tracks save lifecycle state such as idle, saving, saved, or failed.

### Save Request State

- Tracks the targeted document identity and preview/index version reference.
- Tracks the answer-field values included in the pending save request.
- Tracks save outcome metadata for user feedback.

## Functional Outcomes

- Standalone answer markers become editable fields in the rendered preview.
- Existing answer values are preserved and shown correctly before editing begins.
- Saving answer edits writes the updated markdown back to the correct workspace file without using the old HTTP helper flow.
- The rendered preview stays focused on answer editing while raw tabs remain available for broader markdown changes.

## Testable Properties

- **Round-trip**: Extracting answer fields and rebuilding markdown with unchanged values must reproduce the original markdown exactly.
- **Invariant**: Rebuilding markdown changes only the segments owned by detected answer fields and preserves all unrelated content verbatim.
- **Invariant**: Non-standalone occurrences of `[Answer]:` never produce editable answer-field descriptors.
- **Idempotence**: Reapplying rebuild with the same answer values produces the same markdown output as a single application.
