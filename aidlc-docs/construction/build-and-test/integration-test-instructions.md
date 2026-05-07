# Integration Test Instructions

## Purpose

Validate that the implemented units work together as one VS Code extension rather than only as isolated helpers.

## Test Scenarios

### Scenario 1: Bootstrap Setup → Discovery Refresh

- **Description**: Confirm that guided AIDLC setup creates the workspace files and immediately resynchronizes discovery state.
- **Setup**:
  - open the extension in a test workspace without prepared AIDLC files
  - prepare an extracted AIDLC release folder with the expected `aidlc-rules/` contents
- **Test Steps**:
  1. Run `AIDLC: Start Guided Setup`
  2. Select the extracted release folder
  3. Accept the planned setup actions
  4. Confirm that `AGENTS.md` and `.aidlc-rule-details/` are created or updated
  5. Confirm that the navigator refreshes without restarting the extension
- **Expected Results**:
  - setup completes with a clear summary
  - docs discovery re-runs automatically
  - navigator state reflects the prepared workspace immediately

### Scenario 2: Raw or Preview Edit → Refresh Coordination

- **Description**: Confirm that answer saves and file changes resynchronize preview and navigator state.
- **Setup**:
  - workspace contains valid `aidlc-docs/`
  - open one document in rendered preview and one in raw markdown
- **Test Steps**:
  1. Edit a standalone `[Answer]:` field in preview and save it
  2. Confirm the preview remains current after save
  3. Edit a markdown file directly in the raw editor
  4. Confirm watcher-driven refresh updates navigator or preview state appropriately
- **Expected Results**:
  - save succeeds through the preview flow
  - coordinated refresh runs through the shared runtime path
  - stale or unavailable content is surfaced explicitly if the active index changes

### Scenario 3: Manual Refresh and Delivery Readiness

- **Description**: Confirm that the operational commands added in the final unit behave correctly.
- **Setup**:
  - workspace is open with valid extension runtime state
- **Test Steps**:
  1. Run `AIDLC: Refresh Runtime`
  2. Confirm status updates appear and the runtime returns to a current state
  3. Run `AIDLC: Check Delivery Readiness`
  4. Confirm the summary reports build, test, and packaging categories
- **Expected Results**:
  - manual refresh triggers a full runtime resynchronization
  - readiness output is shown in a concise, typed summary

## Run Integration Validation

- Start the extension in a VS Code Extension Development Host
- Exercise the scenarios above manually
- Record any mismatches between:
  - bootstrap and discovery
  - preview save and refresh coordination
  - manual refresh and readiness reporting

## Cleanup

- Remove generated test workspace artifacts if needed
- Reset or recreate the test workspace for repeated runs
