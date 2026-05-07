# Components

## Component 1: Extension Activation Layer

- **Purpose**: Start and register the extension capabilities inside VS Code.
- **Responsibilities**:
  - Register commands, views, custom editors, and webview providers
  - Initialize shared services
  - Coordinate lifecycle setup and teardown
- **Interfaces**:
  - Consumes VS Code extension activation APIs
  - Provides registered entry points for commands and UI contributions

## Component 2: Navigator View Component

- **Purpose**: Provide the React-based AIDLC navigation experience.
- **Responsibilities**:
  - Render the AIDLC tree, search, grouping, and selection controls
  - Support both a dedicated webview panel and a side-view host
  - Reflect current workspace and discovery state
- **Interfaces**:
  - Receives document tree and view state from the extension host
  - Sends user actions such as search, open-preview, open-raw, refresh, and setup requests

## Component 3: Rendered Preview Component

- **Purpose**: Render selected markdown documents in an editor-area preview experience.
- **Responsibilities**:
  - Render markdown, highlighted code, Mermaid, title/path/phase metadata
  - Transform standalone `[Answer]:` markers into editable UI controls
  - Dispatch save actions back to the extension host
- **Interfaces**:
  - Receives document payloads and preview state from the extension host
  - Sends answer-edit, save, and refresh requests

## Component 4: Raw Document Integration Component

- **Purpose**: Bridge the extension navigator with native raw markdown editor tabs.
- **Responsibilities**:
  - Open selected markdown files in VS Code editor tabs
  - Keep raw file editing aligned with navigator and preview flows
- **Interfaces**:
  - Consumes file URIs and open-mode requests
  - Relies on VS Code text document/editor APIs

## Component 5: Workspace Discovery Component

- **Purpose**: Discover AIDLC docs roots and maintain the runtime document model.
- **Responsibilities**:
  - Auto-detect `aidlc-docs/`
  - Support manual docs-root selection
  - Build in-memory document metadata and content references
  - Watch for workspace changes that affect the docs tree
- **Interfaces**:
  - Receives workspace context and optional user-selected paths
  - Provides normalized document tree data to UI-facing components and services

## Component 6: Answer Editing Component

- **Purpose**: Encapsulate answer-marker parsing and answer-field persistence behavior.
- **Responsibilities**:
  - Detect standalone answer markers
  - Merge existing answers into preview state
  - Rebuild markdown updates for save-back
- **Interfaces**:
  - Receives raw markdown content
  - Produces answer-field view models and updated markdown payloads

## Component 7: Bootstrap Setup Component

- **Purpose**: Initialize AIDLC in repositories from extracted release contents.
- **Responsibilities**:
  - Guide the user through source-folder selection
  - Validate extracted AIDLC structure
  - Resolve setup mode and target workspace layout
  - Coordinate copy/update operations and safe reinitialization behavior
- **Interfaces**:
  - Receives user-selected extracted folder and workspace context
  - Produces setup plan, result summary, and file-change actions

## Component 8: Refresh and Synchronization Component

- **Purpose**: Keep navigator and preview experiences aligned with workspace changes.
- **Responsibilities**:
  - Observe document changes
  - Trigger state refreshes and cache invalidation
  - Coordinate manual and automatic refresh flows
- **Interfaces**:
  - Receives filesystem and document change events
  - Emits refresh/update events to UI-facing components

## Component 9: Packaging and Validation Component

- **Purpose**: Support extension build, packaging readiness, and validation flows.
- **Responsibilities**:
  - Encapsulate build/package metadata needs
  - Provide hooks for automated validation and packaging checks
  - Keep packaging concerns isolated from runtime UI logic
- **Interfaces**:
  - Consumes build configuration and validation commands
  - Produces packaging/validation status for development workflows
