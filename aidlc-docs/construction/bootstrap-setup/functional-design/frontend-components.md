# Frontend Components

## Scope Note

This unit is command-driven and host-heavy, but it still includes user-facing interactions for setup initiation, source-folder selection guidance, status reporting, and completion summaries. File operations themselves remain host-side only.

## Component 1: BootstrapCommandEntry

- **Purpose**: Expose the guided setup flow through a VS Code-native command entry point.
- **Responsibilities**:
  - Start the setup flow
  - Present concise guidance before source selection
  - Route into validation and planning logic
- **Props**:
  - workspace status
  - setup availability
- **State**:
  - command invocation status

## Component 2: SourceSelectionPrompt

- **Purpose**: Guide the user to choose the extracted AIDLC source folder.
- **Responsibilities**:
  - Explain what folder the user should pick
  - Trigger folder selection
  - Surface validation-ready status
- **Props**:
  - prompt message
  - source selection status
- **State**:
  - selected path display

## Component 3: ValidationStatusSurface

- **Purpose**: Communicate whether the extracted source folder passed or failed validation.
- **Responsibilities**:
  - Show valid or invalid state
  - Report missing required assets
  - Prevent ambiguous continuation when validation fails
- **Props**:
  - validation result
  - supported setup mode information
- **State**:
  - none

## Component 4: ReinitializationNotice

- **Purpose**: Explain when the workspace already contains setup targets and what safe behavior will be applied.
- **Responsibilities**:
  - Show existing-target findings
  - Distinguish create, update, skip, and blocked outcomes
  - Set clear expectations before execution
- **Props**:
  - existing-target analysis
  - overwrite-risk summary
- **State**:
  - none

## Component 5: SetupCompletionSummary

- **Purpose**: Report the final setup result to the user.
- **Responsibilities**:
  - Show created, updated, skipped, blocked, and failed outcomes
  - Summarize the chosen setup mode
  - Provide next-step guidance when needed
- **Props**:
  - setup execution outcome
  - summary message
- **State**:
  - none

## Interaction Flows

### Flow 1: Start Guided Setup

1. `BootstrapCommandEntry` is invoked by the user.
2. The flow presents a short explanation of what source folder needs to be selected.
3. `SourceSelectionPrompt` begins folder selection.

### Flow 2: Validate the Extracted Source

1. The user selects a folder.
2. `ValidationStatusSurface` receives the validation result.
3. If invalid, the flow stops with a clear explanation.
4. If valid, the flow proceeds to planning and any reinitialization checks.

### Flow 3: Report Existing Initialization

1. The setup planner detects existing targets in the workspace.
2. `ReinitializationNotice` explains the detected state and the safe handling behavior.
3. Execution proceeds according to the validated and planned operation set.

### Flow 4: Present Final Summary

1. Setup execution completes or stops with failure.
2. `SetupCompletionSummary` reports the final outcome.
3. The user can see what was created, updated, skipped, blocked, or failed.

## Validation Rules

- User-facing setup components must never perform file operations directly.
- Validation failure must be presented clearly before any execution summary appears.
- Existing-target reporting must not imply silent overwrite behavior.
- Completion summaries must remain understandable without requiring the user to inspect raw logs.
