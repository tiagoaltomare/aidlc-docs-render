# Unit of Work

## Decomposition Strategy

- **Story Grouping Strategy**: Merge UI-heavy pieces together while keeping bootstrap/setup as a separate first-class unit.
- **Dependency Strategy**: Optimize for parallelism where feasible, using stable contracts and temporary stubs or mocks when needed.
- **Bootstrap Treatment**: Bootstrap/setup remains its own explicit unit of work.

## Unit 1: Extension Foundation and Contribution Wiring

- **Unit Name**: Extension Foundation
- **Purpose**: Establish the extension shell, activation flow, command registrations, contribution points, and shared runtime contracts.
- **Responsibilities**:
  - Define extension activation entry points
  - Register commands, views, preview providers, and shared services
  - Establish base project/build structure for the extension runtime
  - Define shared host/webview message contracts and core types
- **Primary Outcome**: A runnable extension shell that other units can build on
- **Dependencies**: None
- **Parallelization Notes**: Can begin immediately and provides contracts for later units

## Unit 2: Document Discovery and Runtime Indexing

- **Unit Name**: Discovery and Indexing
- **Purpose**: Replace manifest generation with runtime discovery, docs-root selection, and in-memory indexing.
- **Responsibilities**:
  - Auto-detect `aidlc-docs/`
  - Support manual docs-root selection
  - Build normalized document tree/grouping metadata
  - Provide refreshable runtime state for navigator and preview consumers
- **Primary Outcome**: Reliable runtime document model for the extension
- **Dependencies**: Extension Foundation
- **Parallelization Notes**: Can proceed in parallel with bootstrap once base contracts exist

## Unit 3: Navigator and Preview Experience

- **Unit Name**: Navigator and Preview UI
- **Purpose**: Deliver the React navigator hosts and rendered preview experience in VS Code.
- **Responsibilities**:
  - Implement dedicated panel and side-view navigator hosts
  - Render grouped navigation and search
  - Open rendered preview tabs
  - Render markdown, Mermaid, code highlighting, and document metadata
- **Primary Outcome**: Usable read/browse experience inside VS Code
- **Dependencies**: Extension Foundation, Discovery and Indexing
- **Parallelization Notes**: UI shell work can start against mocked data contracts before indexing is fully complete

## Unit 4: Answer Editing and Save-Back Flows

- **Unit Name**: Answer Editing and Save
- **Purpose**: Implement answer-field transformation and persistence back to workspace markdown files.
- **Responsibilities**:
  - Detect standalone `[Answer]:` markers
  - Render editable answer controls in preview
  - Rebuild markdown with updated answers
  - Persist updates via VS Code-native file APIs
  - Coordinate raw-tab and rendered-edit expectations
- **Primary Outcome**: Reliable answer-editing workflow inside the extension
- **Dependencies**: Extension Foundation, Navigator and Preview UI
- **Parallelization Notes**: Pure parsing/rebuild logic can start early; final integration depends on preview hooks

## Unit 5: AIDLC Bootstrap and Setup Automation

- **Unit Name**: Bootstrap Setup
- **Purpose**: Initialize AIDLC in repositories from extracted release contents.
- **Responsibilities**:
  - Ask for the extracted AIDLC source folder
  - Validate extracted structure
  - Support multiple setup modes from the first delivery
  - Resolve target paths and apply safe file-copy/update plans
  - Handle reinitialization safely and report results clearly
- **Primary Outcome**: Guided AIDLC workspace initialization flow
- **Dependencies**: Extension Foundation
- **Parallelization Notes**: Can proceed in parallel with discovery and UI work once file-operation contracts exist

## Unit 6: Refresh, Testing, and Packaging Readiness

- **Unit Name**: Refresh and Delivery Readiness
- **Purpose**: Complete synchronization behavior, automated validation, and package readiness for delivery.
- **Responsibilities**:
  - Implement automatic and manual refresh coordination
  - Align navigator, preview, and saved file updates
  - Add automated tests for core logic and activation paths
  - Validate `.vsix` packaging readiness
- **Primary Outcome**: Stable, shippable extension behavior for the cycle
- **Dependencies**: Extension Foundation, Discovery and Indexing, Navigator and Preview UI, Answer Editing and Save, Bootstrap Setup
- **Parallelization Notes**: Test scaffolding can begin early, but full validation depends on feature-complete units

## Validation Summary

- All required user journeys are covered by at least one unit.
- Bootstrap/setup is isolated as requested.
- UI-heavy concerns are intentionally merged into one unit to reduce fragmentation.
- Core dependency order exists, but the decomposition still supports meaningful parallel work.
