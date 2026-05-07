# Business Logic Model

## Unit Scope

- **Unit**: Refresh and Delivery Readiness
- **Purpose**: Complete synchronization behavior, automated validation, and package readiness for delivery.
- **Stories Owned**:
  - US-15 Refresh Automatically on Workspace Changes
  - US-16 Refresh Manually When Needed
  - US-17 Install a Packaged Extension Build
- **Boundaries**:
  - Owns automatic refresh triggers, manual refresh orchestration, synchronization of discovery and preview state, package-readiness validation flow, and final delivery-oriented validation summaries
  - Consumes runtime state, discovery/indexing, preview state, answer-save outcomes, and bootstrap outcomes from prior units
  - Does not replace the existing discovery, preview rendering, answer-save, or bootstrap business logic; it coordinates and validates them

## Core Workflow Model

### Workflow 1: React to Workspace Changes Automatically

1. The extension observes relevant workspace file changes that can affect docs discovery, navigator structure, preview content, or saved answers.
2. The refresh coordinator classifies the change event by scope such as docs-root metadata change, markdown content change, bootstrap-created content, or irrelevant workspace noise.
3. If the event is relevant, the coordinator schedules a controlled refresh instead of letting each consumer rebuild independently.
4. The coordinator rebuilds affected runtime state in a deterministic order so navigator, preview, and discovery consumers converge on the same workspace view.

### Workflow 2: Run Manual Refresh on Demand

1. The user invokes an explicit refresh command or control.
2. The refresh coordinator captures the current active docs-root and preview context.
3. The coordinator forces a full resynchronization of discovery-derived runtime state even if no file watcher event occurred.
4. The coordinator publishes the refreshed state and reports the result back to the user in a concise form.

### Workflow 3: Synchronize Open Preview and Navigation State

1. After a refresh trigger, the extension compares the refreshed index against currently open navigator selections and preview document identities.
2. If a document still exists and remains valid, the refreshed metadata and content replace the stale snapshot in place.
3. If a selected or open document is no longer valid, the extension moves that surface into a clear stale or unavailable state instead of rendering misleading content.
4. Save-success flows and bootstrap-success flows can also trigger this synchronization path so the UI reflects applied changes quickly.

### Workflow 4: Handle Refresh Failure Without Losing the Last Valid State

1. If refresh rebuilding fails, the coordinator records the failure context and keeps the last valid runtime state available where possible.
2. The extension distinguishes between:
   - clean refresh success
   - empty-but-valid refresh state
   - degraded refresh with preserved last valid state
   - hard failure with no valid baseline
3. The user sees understandable refresh status rather than a silent or contradictory UI.

### Workflow 5: Validate Delivery Readiness and Packaging

1. The user invokes a package-readiness or delivery validation workflow.
2. The extension or repository validation logic checks the readiness of the build, test, and packaging paths needed for `.vsix` delivery.
3. The validation flow records the outcome by category such as build prerequisites, test coverage status, packaging configuration, and known blockers.
4. The user receives a final readiness summary that explains whether the extension is ready to package, partially ready, or blocked.

## State Model

### Refresh Trigger State

- Tracks the origin of a refresh such as file watcher, manual request, save completion, bootstrap completion, or startup synchronization.
- Tracks whether the refresh is incremental in intent or forced full resynchronization.

### Runtime Synchronization State

- Tracks the current refresh lifecycle, the last completed refresh timestamp, the current active docs-root version, and whether the UI is aligned with the latest known workspace state.
- Tracks whether the runtime is clean, refreshing, degraded, stale, or failed.

### Delivery Validation State

- Tracks the latest build-and-package readiness validation request and its summarized outcome.
- Tracks which readiness checks passed, failed, or were not executed yet.

## Functional Outcomes

- The extension can refresh itself automatically when relevant workspace content changes.
- The extension gives users an explicit manual refresh path when they want deterministic resynchronization.
- Navigator and preview surfaces remain aligned with the latest valid workspace state after save, bootstrap, or file changes.
- The repository can expose a delivery-readiness view of build, test, and package status before the final `.vsix` workflow.

## Testable Properties

- **Invariant**: Only relevant workspace changes trigger runtime refresh work.
- **Invariant**: A failed refresh does not silently discard the last valid state when one exists.
- **Idempotence**: Running manual refresh repeatedly without workspace changes yields equivalent synchronized state.
- **Easy verification**: Delivery-readiness summaries can be checked to ensure every validation category is represented exactly once.
