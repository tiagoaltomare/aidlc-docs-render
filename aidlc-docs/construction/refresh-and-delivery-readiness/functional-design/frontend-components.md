# Frontend Components

## Surface 1: Refresh Command and Status Surface

- **Purpose**: Give the user a clear way to trigger manual refresh and understand current synchronization status.
- **User Interactions**:
  - invoke a manual refresh command
  - observe current refresh lifecycle status
  - inspect degraded or stale-state notices
- **State Expectations**:
  - current refresh lifecycle label
  - last successful refresh indicator
  - trigger-specific feedback message

## Surface 2: Navigator and Preview Sync Feedback

- **Purpose**: Show when navigator or preview content has been refreshed, is stale, or became unavailable after workspace changes.
- **User Interactions**:
  - continue working after auto-refresh
  - respond to stale or unavailable preview messaging
  - understand when a selected document disappeared or moved out of the active index
- **State Expectations**:
  - sync-valid flag
  - stale or unavailable banner state
  - lightweight refresh-in-progress state

## Surface 3: Delivery Readiness Summary Surface

- **Purpose**: Present build, test, and packaging readiness in a concise user-readable form.
- **User Interactions**:
  - invoke delivery validation
  - inspect passed, failed, blocked, or not-yet-run categories
  - identify blockers before packaging a `.vsix`
- **State Expectations**:
  - per-category readiness results
  - overall readiness label
  - blocker summary and next-step guidance

## Interaction Model

- Manual refresh remains a VS Code-native action rather than a complex custom form.
- Refresh feedback should be lightweight and non-disruptive when synchronization succeeds normally.
- Delivery-readiness reporting should be text-forward and suitable for standard VS Code notification, output, or panel-style presentation surfaces.
