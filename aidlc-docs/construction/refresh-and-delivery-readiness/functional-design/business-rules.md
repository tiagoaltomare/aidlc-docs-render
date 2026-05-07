# Business Rules

## Rule Set 1: Refresh Trigger Relevance

- Automatic refresh must react only to workspace changes that can affect discovered docs, rendered content, answer values, or package-readiness inputs.
- Irrelevant workspace noise must not trigger unnecessary full resynchronization.
- Manual refresh must always be treated as an explicit full refresh request, even if no watcher event has fired.

## Rule Set 2: Coordinated Refresh Ownership

- Refresh work must be coordinated through a single runtime path rather than letting discovery, preview, and navigator each rebuild independently.
- A later refresh request may supersede an earlier pending request when the earlier request has not yet published state.
- Published refresh results must represent one coherent runtime snapshot.

## Rule Set 3: State Replacement and Staleness

- A successful refresh must replace stale runtime metadata with the latest valid snapshot.
- If an open preview or selected document no longer exists after refresh, the extension must surface that condition explicitly rather than pretending the document is still current.
- Empty-but-valid docs states must be distinguished from failed refresh states.

## Rule Set 4: Failure Handling

- Refresh failures must be recorded with enough context to explain what failed without exposing irrelevant internal detail.
- When a last valid runtime state exists, refresh failure must preserve it until a later successful refresh replaces it.
- Manual refresh failures and automatic refresh failures may share the same core recovery logic, but user feedback must reflect the trigger context.

## Rule Set 5: Save and Bootstrap Integration

- Successful answer saves must be able to trigger synchronization so preview and navigator state do not remain stale.
- Successful bootstrap/setup execution must be able to trigger discovery refresh without requiring the user to restart the extension.
- Integration-triggered refreshes must follow the same coordinated refresh path as watcher- and user-triggered refreshes.

## Rule Set 6: Delivery Readiness Validation

- Delivery-readiness validation must report build, test, and packaging categories explicitly.
- A readiness summary must distinguish between passed, failed, blocked, and not-yet-run checks.
- Packaging readiness must not rely on the old standalone viewer workflow or helper services.

## Rule Set 7: User Guidance and Status Feedback

- Refresh status and readiness status must be understandable through standard VS Code surfaces.
- Status messages must explain whether the extension is current, refreshing, degraded, stale, or blocked.
- The user must not be left uncertain about whether a manual refresh or delivery validation actually completed.
