# Services

## Service 1: Extension Orchestration Service

- **Responsibilities**:
  - Coordinate commands, views, preview providers, and shared lifecycle behavior
  - Route requests between UI-facing components and domain services
- **Interactions**:
  - Uses discovery, preview, setup, save, and refresh services

## Service 2: Document Index Service

- **Responsibilities**:
  - Build and maintain the in-memory document index
  - Normalize paths, titles, phases, sections, and content references
- **Interactions**:
  - Consumed by navigator and preview services
  - Updated by refresh/watch services

## Service 3: Preview Rendering Service

- **Responsibilities**:
  - Prepare preview-ready document models
  - Coordinate markdown rendering inputs, Mermaid/code behavior, and answer-field view models
- **Interactions**:
  - Uses document index and answer processing services
  - Serves rendered preview components

## Service 4: Answer Processing Service

- **Responsibilities**:
  - Parse answer markers
  - Build answer-field metadata
  - Reconstruct updated markdown for persistence
- **Interactions**:
  - Used by preview rendering and save services

## Service 5: Workspace Save Service

- **Responsibilities**:
  - Persist answer-field edits back to workspace files
  - Guard save targets and error handling
- **Interactions**:
  - Receives save requests from preview flows
  - Uses VS Code workspace file APIs

## Service 6: Bootstrap Setup Service

- **Responsibilities**:
  - Validate extracted AIDLC source structure
  - Support multiple setup modes
  - Produce and apply file-copy/update plans
- **Interactions**:
  - Uses workspace context and file services
  - Reports setup results to navigator and command flows

## Service 7: Refresh Coordination Service

- **Responsibilities**:
  - Observe change events
  - Trigger targeted or full state refreshes
  - Keep navigator and preview flows aligned
- **Interactions**:
  - Uses document index and preview services
  - Emits updates to panel/view providers

## Service 8: Editor Integration Service

- **Responsibilities**:
  - Open raw markdown tabs
  - Open or reveal rendered preview tabs
  - Coordinate tab-mode transitions from navigator actions
- **Interactions**:
  - Receives open requests from navigator
  - Uses VS Code editor and custom preview APIs

## Service 9: Packaging Validation Service

- **Responsibilities**:
  - Run packaging-readiness checks
  - Provide build/package validation summaries
- **Interactions**:
  - Used by development and final delivery workflows, not by core runtime navigation
