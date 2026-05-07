# Domain Entities

## Entity 1: AnswerFieldDescriptor

- **Purpose**: Represent one eligible standalone answer field extracted from a markdown document.
- **Fields**:
  - field id
  - document relative path
  - source line or segment reference
  - original answer value
  - current answer value
  - marker text representation
- **Rules**:
  - Field identity must remain stable for the current preview baseline.
  - Only eligible standalone markers may produce descriptors.

## Entity 2: AnswerExtractionResult

- **Purpose**: Represent the complete extraction output for a document.
- **Fields**:
  - source markdown
  - extracted answer fields
  - untouched content segments
  - extraction validity status
- **Rules**:
  - The extraction result must preserve enough structural information to rebuild markdown safely.
  - The extracted fields must remain ordered according to the source document.

## Entity 3: PreviewAnswerEditState

- **Purpose**: Represent the current answer-editing state for a rendered preview session.
- **Fields**:
  - document identity
  - answer field map
  - dirty flag
  - save lifecycle state
  - last save message
- **Rules**:
  - Dirty state must be derived from value comparison against the original extracted values.
  - Save lifecycle must distinguish idle, saving, saved, and failed states.

## Entity 4: AnswerSaveRequest

- **Purpose**: Represent a host-side request to persist answer edits.
- **Fields**:
  - document identity
  - expected preview or index version
  - field value updates
  - request timestamp or request id
- **Rules**:
  - The request must target exactly one document.
  - Field updates must reference known answer-field identities from the current preview baseline.

## Entity 5: MarkdownRebuildResult

- **Purpose**: Represent the output of applying updated answer values back into markdown.
- **Fields**:
  - rebuilt markdown
  - updated answer-field descriptors
  - changed field ids
  - rebuild status
- **Rules**:
  - Rebuilt markdown must preserve all non-owned content.
  - A failed rebuild must not expose a partial write candidate as successful output.

## Entity 6: WorkspaceSaveResult

- **Purpose**: Represent the final save outcome returned to the preview flow.
- **Fields**:
  - document identity
  - success flag
  - user-facing message
  - saved markdown baseline
  - failure reason category
- **Rules**:
  - Success must include the new saved baseline.
  - Failure must preserve the unsaved answer-edit state in the preview session.

## Entity Relationships

- `AnswerExtractionResult` contains ordered `AnswerFieldDescriptor` instances for one source markdown document.
- `PreviewAnswerEditState` is created from `AnswerExtractionResult` and evolves as the user edits answer fields.
- `AnswerSaveRequest` is derived from `PreviewAnswerEditState` when the user triggers save.
- `MarkdownRebuildResult` is produced by applying `AnswerSaveRequest` updates to the authoritative extraction result.
- `WorkspaceSaveResult` reports the persistence outcome and determines the next preview baseline state.
