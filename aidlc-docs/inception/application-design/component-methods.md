# Component Methods

## Extension Activation Layer

### `activate(context)`
- **Purpose**: Register commands, views, preview providers, and shared services.
- **Inputs**: extension context
- **Outputs**: initialized runtime registrations

### `registerContributionPoints()`
- **Purpose**: Register command palette actions, side view, dedicated panel, and preview hooks.
- **Inputs**: none
- **Outputs**: contribution registrations

## Navigator View Component

### `renderNavigator(state)`
- **Purpose**: Render grouped docs navigation and search state in React hosts.
- **Inputs**: normalized navigator state
- **Outputs**: rendered webview UI

### `handleNavigatorAction(action)`
- **Purpose**: Forward user actions such as open, search, refresh, or setup.
- **Inputs**: UI action payload
- **Outputs**: host message or state transition

## Rendered Preview Component

### `renderPreview(documentViewModel)`
- **Purpose**: Render a selected markdown document in preview mode.
- **Inputs**: document content, metadata, answer-field view state
- **Outputs**: rendered preview UI

### `handlePreviewSave(saveRequest)`
- **Purpose**: Trigger save-back for answer-field edits.
- **Inputs**: updated answer values and document identity
- **Outputs**: save request to host service

## Raw Document Integration Component

### `openRawDocument(uri)`
- **Purpose**: Open a markdown file in the native editor.
- **Inputs**: file URI
- **Outputs**: visible editor tab

### `revealExistingRawEditor(uri)`
- **Purpose**: Reuse an existing raw editor when applicable.
- **Inputs**: file URI
- **Outputs**: existing editor focus or fallback open action

## Workspace Discovery Component

### `detectDocsRoot(workspaceContext)`
- **Purpose**: Find `aidlc-docs/` automatically from workspace state.
- **Inputs**: workspace folders
- **Outputs**: detected docs root or null

### `selectDocsRoot()`
- **Purpose**: Let the user choose a docs root manually.
- **Inputs**: user interaction
- **Outputs**: selected path or cancellation

### `buildDocumentIndex(docsRoot)`
- **Purpose**: Create normalized in-memory document metadata and path structure.
- **Inputs**: docs root path
- **Outputs**: document index and grouped navigation model

## Answer Editing Component

### `extractAnswerFields(markdown)`
- **Purpose**: Detect standalone answer markers and existing values.
- **Inputs**: raw markdown content
- **Outputs**: answer-field descriptors

### `rebuildMarkdownWithAnswers(markdown, answers)`
- **Purpose**: Merge updated answer values back into markdown.
- **Inputs**: original markdown and updated answer values
- **Outputs**: updated markdown content

## Bootstrap Setup Component

### `selectExtractedAidlcFolder()`
- **Purpose**: Let the user choose the extracted AIDLC source folder.
- **Inputs**: user interaction
- **Outputs**: selected source path or cancellation

### `validateExtractedAidlcStructure(sourcePath)`
- **Purpose**: Confirm that expected AIDLC contents exist.
- **Inputs**: selected source path
- **Outputs**: validation result and detected setup capabilities

### `resolveSetupTargets(mode, workspaceContext)`
- **Purpose**: Determine destination files and directories for the chosen setup mode.
- **Inputs**: selected setup mode and workspace context
- **Outputs**: target mapping plan

### `applySetupPlan(setupPlan)`
- **Purpose**: Copy or update files in the workspace according to the selected setup mode.
- **Inputs**: setup action plan
- **Outputs**: setup result summary

## Refresh and Synchronization Component

### `watchDocsChanges(docsRoot)`
- **Purpose**: Observe relevant workspace changes affecting the docs experience.
- **Inputs**: docs root path
- **Outputs**: change-event stream

### `refreshRuntimeState(reason)`
- **Purpose**: Rebuild or update runtime state after a manual or automatic refresh trigger.
- **Inputs**: refresh reason
- **Outputs**: updated document and UI state

## Packaging and Validation Component

### `runPackagingValidation()`
- **Purpose**: Validate extension packaging readiness.
- **Inputs**: current project build/package context
- **Outputs**: validation results

### `collectDeliveryArtifacts()`
- **Purpose**: Summarize build/package outputs and readiness indicators.
- **Inputs**: build and validation results
- **Outputs**: delivery status summary
