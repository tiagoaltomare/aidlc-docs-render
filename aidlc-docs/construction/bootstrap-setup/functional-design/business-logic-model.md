# Business Logic Model

## Unit Scope

- **Unit**: Bootstrap Setup
- **Purpose**: Initialize AIDLC in repositories from extracted release contents.
- **Stories Owned**:
  - US-01 Start Guided AIDLC Setup
  - US-02 Select Extracted AIDLC Source Folder
  - US-03 Apply AIDLC Files to the Workspace
  - US-04 Handle Reinitialization Safely
- **Boundaries**:
  - Owns extracted-folder selection, extracted-structure validation, setup-mode resolution, target mapping, copy/update planning, and setup execution summary behavior
  - Consumes workspace context and extension command surfaces from the foundation unit
  - Does not own docs discovery, navigator rendering, preview editing, or packaging validation

## Core Workflow Model

### Workflow 1: Start Guided Setup

1. The user invokes an explicit AIDLC setup command from a VS Code-native entry point.
2. The extension resolves the current workspace context and confirms that setup can target the active workspace.
3. The extension begins a guided setup flow instead of assuming a fixed source path or silently copying files.

### Workflow 2: Select and Validate the Extracted AIDLC Folder

1. The setup flow asks the user to choose the folder where the official AIDLC release was extracted.
2. The validation logic inspects the selected folder for the expected extracted AIDLC structure.
3. The validation result determines:
   - whether the folder is usable
   - which setup capabilities are present
   - which required source assets are missing, if any
4. If validation fails, the flow stops without applying any partial workspace changes.

### Workflow 3: Resolve Setup Mode and Target Mapping

1. Once a valid extracted folder is confirmed, the setup logic determines the supported setup mode for the current extension delivery.
2. The logic maps source assets from the extracted folder to specific workspace target locations.
3. The target mapping records:
   - source path
   - destination path
   - operation type such as create or update
   - overwrite risk classification
4. The flow ensures no mapped destination escapes the intended workspace boundary.

### Workflow 4: Detect Existing Initialization and Plan Reinitialization

1. Before copying files, the setup logic checks whether destination files or directories already exist.
2. Existing-state analysis distinguishes:
   - missing targets
   - clean create targets
   - update targets
   - conflict or overwrite-sensitive targets
3. The setup plan is built to reflect safe behavior for the detected state rather than blindly overwriting everything.

### Workflow 5: Apply the Setup Plan

1. The extension executes the planned file operations in a controlled sequence.
2. Each operation copies or updates only the validated source assets to the mapped workspace destinations.
3. The execution records which files or directories were created, updated, skipped, or blocked.
4. If an operation fails, the setup flow stops with a clear failure summary rather than continuing into an uncertain partial state.

### Workflow 6: Report the Final Setup Result

1. After execution, the extension produces a user-facing summary of what happened.
2. The summary includes:
   - setup mode used
   - created paths
   - updated paths
   - skipped or blocked paths
   - any next-step guidance
3. If setup found an already initialized workspace, the summary explains the detected state and the chosen safe behavior.

## State Model

### Source Validation State

- Tracks the selected extracted folder and whether it matches the expected AIDLC extracted structure.
- Tracks missing, optional, and recognized source assets.
- Tracks whether setup can proceed safely.

### Setup Planning State

- Tracks the resolved setup mode for the current workspace.
- Tracks the complete source-to-target mapping for planned operations.
- Tracks overwrite risk and existing-target analysis.

### Setup Execution State

- Tracks operation progress and per-path outcomes such as created, updated, skipped, failed, or blocked.
- Tracks whether execution is complete, failed, or partially applied.
- Tracks the user-facing completion summary.

## Functional Outcomes

- Users can start AIDLC initialization from an explicit extension command.
- Users can point the extension to the folder where they extracted the official AIDLC release.
- The extension validates that folder before any workspace changes are made.
- The extension copies required files into the correct workspace locations with safe handling for already-initialized repositories.

## Testable Properties

- **Invariant**: Every resolved destination path stays within the intended workspace root.
- **Invariant**: Validation failure produces no file-operation plan that can be executed.
- **Idempotence**: Recomputing the setup plan for the same source folder and same workspace state yields the same planned operations.
- **Easy verification**: Execution summaries can be checked to ensure every attempted operation is represented exactly once in the reported outcome.
