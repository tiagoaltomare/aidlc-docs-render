# Frontend Components

## Scope Note

This unit extends the rendered preview experience with answer-field editing and save feedback. It does not turn the preview into a full markdown editor and does not own refresh orchestration beyond local save-result handling.

## Component 1: AnswerEnabledPreviewApp

- **Purpose**: Root preview application once answer-field editing is attached to rendered preview state.
- **Responsibilities**:
  - Receive the enriched preview model and answer-editing state
  - Route save lifecycle feedback
  - Keep answer editing scoped to eligible answer controls
- **Props**:
  - preview document model
  - answer extraction result
  - save lifecycle state
- **State**:
  - local answer edits
  - dirty state

## Component 2: AnswerFieldControl

- **Purpose**: Render one editable answer control in place of a standalone answer marker.
- **Responsibilities**:
  - Display the current answer value
  - Capture answer edits
  - Surface field-specific validation cues if needed
- **Props**:
  - field identity
  - current value
  - original value
  - disabled state during save
- **State**:
  - controlled input text

## Component 3: PreviewSaveBar

- **Purpose**: Present save actions and dirty/save feedback for preview answer editing.
- **Responsibilities**:
  - Show whether unsaved answer changes exist
  - Trigger save requests
  - Surface saved or failed status messages
- **Props**:
  - dirty flag
  - save lifecycle state
  - last save message
  - save enabled state
- **State**:
  - none beyond transient UI affordances

## Component 4: AnswerAwarePreviewContentSurface

- **Purpose**: Render normal preview blocks and replace eligible answer-marker regions with answer controls.
- **Responsibilities**:
  - Keep non-answer preview rendering unchanged
  - Insert `AnswerFieldControl` for eligible answer regions
  - Preserve fallback rendering for non-answer block failures
- **Props**:
  - preview render blocks
  - answer field descriptors
  - capability state
- **State**:
  - none

## Component 5: EditingModeNotice

- **Purpose**: Explain the distinction between answer editing in preview and broader editing in raw tabs.
- **Responsibilities**:
  - Reinforce that preview editing is limited to answer fields
  - Point users toward raw tabs for full markdown changes
- **Props**:
  - raw-tab availability
  - contextual mode message
- **State**:
  - none

## Interaction Flows

### Flow 1: Edit an Answer Field

1. `AnswerEnabledPreviewApp` receives extracted answer-field descriptors.
2. `AnswerAwarePreviewContentSurface` swaps the eligible marker region with `AnswerFieldControl`.
3. The user edits the value in the control.
4. Local answer-edit state becomes dirty and `PreviewSaveBar` reflects that unsaved changes exist.

### Flow 2: Save Answer Edits

1. The user triggers save from `PreviewSaveBar`.
2. `AnswerEnabledPreviewApp` packages the current answer values into an `AnswerSaveRequest`.
3. The host processes rebuild and persistence.
4. Save success or failure returns to the preview and the save bar updates its feedback state.

### Flow 3: Preserve Broader Editing Through Raw Tabs

1. The user needs to edit content outside answer fields.
2. `EditingModeNotice` clarifies that raw tabs remain the place for broader markdown changes.
3. The preview continues to focus only on answer-field interaction.

## Validation Rules

- Answer controls must appear only where the host marked a region as an eligible answer field.
- Save UI must not imply that arbitrary markdown edits made elsewhere in the preview will be persisted by this unit.
- Disabled or saving states must prevent duplicate save submissions while a save is in progress.
- Save feedback must remain understandable without relying only on color or animation.
