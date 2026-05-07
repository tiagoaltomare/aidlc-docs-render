# Refresh and Delivery Readiness Code Generation Plan

## Unit Context

- **Unit**: Refresh and Delivery Readiness
- **Stories Implemented by This Unit**:
  - US-15 Refresh Automatically on Workspace Changes
  - US-16 Refresh Manually When Needed
  - US-17 Install a Packaged Extension Build
- **Primary Dependencies**:
  - Extension Foundation
  - Discovery and Indexing
  - Navigator and Preview UI
  - Answer Editing and Save
  - Bootstrap Setup
- **Expected Interfaces and Contracts**:
  - extension-host runtime context, command registration, and contribution wiring
  - discovery refresh and runtime index replacement hooks
  - preview revalidation and stale-state handling surfaces
  - shared refresh and readiness-result models for coordinated status updates
  - repository-local validation scripts for build and packaging readiness
- **Database Entities Owned**: None
- **Service Boundaries and Responsibilities**:
  - this unit owns refresh trigger classification, coordinated runtime resynchronization, explicit stale/degraded handling, manual refresh entry points, and typed delivery-readiness validation summaries
  - this unit does not replace discovery indexing, preview rendering, answer rebuilding, or bootstrap planning logic; it coordinates and validates their already existing behavior

## Target Code Paths

- **Workspace Root**: `C:\Users\tiagoa\Source\aidlc-docs-render`
- **Application Code Target**:
  - `src/shared/`
  - `src/extension/`
  - `scripts/`
  - `tests/`
- **Documentation Target**:
  - `aidlc-docs/construction/refresh-and-delivery-readiness/code/`

## Generation Strategy

- Brownfield migration: extend the existing extension runtime in place instead of introducing a parallel refresh subsystem.
- Keep trigger classification, refresh scheduling, stale-state derivation, and readiness aggregation explicit and testable.
- Reuse VS Code-native watcher, command, notification, and output surfaces for the first delivery instead of creating a new custom UI layer.
- Keep delivery-readiness checks repository-local and aligned with the later Build and Test stage rather than duplicating that stage.

## Detailed Steps

### Step 1. Prepare shared refresh and delivery-readiness models
- [x] Review the current runtime, discovery state, preview state, and package-check surfaces to identify the shared types needed for refresh coordination and readiness reporting.
- [x] Extend `src/shared/` with refresh-trigger, synchronization-state, stale-surface, readiness-check, and readiness-report models plus pure helpers.
- [x] Keep the shared model surface explicit enough to support watcher events, manual refresh, save/bootstrap-triggered refresh, and packaging-readiness summaries.

### Step 2. Generate host-side refresh classification and coordination logic
- [x] Add host-side logic under `src/extension/` for relevant-trigger classification, superseding refresh scheduling, and single-path synchronization coordination.
- [x] Implement preserved last-valid-state handling and explicit degraded or stale publication logic.
- [x] Keep classification and synchronization seams isolated from watcher registration so they remain highly testable.

### Step 3. Integrate automatic refresh into the extension runtime
- [x] Wire VS Code-native watcher registration into the extension runtime for relevant docs and workspace events.
- [x] Route save-triggered and bootstrap-triggered resynchronization through the same coordination path as watcher-triggered refreshes.
- [x] Keep automatic refresh constrained to relevant scope so unrelated workspace noise does not trigger unnecessary rebuilds.

### Step 4. Add manual refresh commands and user-facing status reporting
- [x] Register and implement an explicit manual refresh command in the extension host.
- [x] Add concise refresh-status and stale-state feedback through existing VS Code-native surfaces.
- [x] Ensure navigator and preview consumers receive consistent synchronized status updates after manual refresh.

### Step 5. Extend preview and navigator synchronization boundaries
- [x] Update existing preview and host flows so refreshed or missing documents resolve into valid, stale, unavailable, empty, or degraded states explicitly.
- [x] Ensure open preview documents react correctly when the active index changes or disappears.
- [x] Preserve fail-closed behavior when refreshed identity validation fails.

### Step 6. Add delivery-readiness validation and packaging checks
- [x] Extend repository-local validation logic and scripts so build, test, and packaging readiness can be summarized through explicit typed categories.
- [x] Add an extension-host entry point that surfaces delivery-readiness results without depending on the legacy standalone viewer workflow.
- [x] Keep readiness reporting aligned with what the final Build and Test stage will execute and verify.

### Step 7. Generate unit tests for refresh and readiness behavior
- [x] Add tests for relevant-versus-irrelevant trigger classification, superseding refresh intent, and last-valid-state preservation.
- [x] Add tests for stale-preview or unavailable-document state derivation after index replacement.
- [x] Add tests for delivery-readiness coverage and deterministic readiness aggregation, aligned with Partial PBT expectations.

### Step 8. Validate brownfield safety and delivery boundaries
- [x] Verify the unit modifies the existing extension, preview, discovery, and validation structure in place without creating duplicate brownfield files.
- [x] Verify refresh and readiness behavior remain inside the extension-host or repository-local validation boundary with no external helper dependency.
- [x] Verify the resulting implementation leaves the repository ready for the final Build and Test stage.

### Step 9. Produce code-generation summaries for this unit
- [x] Create markdown summaries in `aidlc-docs/construction/refresh-and-delivery-readiness/code/` covering modified files, created files, and test scope.
- [x] Capture how this unit closes US-15 through US-17 and how it prepares the repository for the final Build and Test stage.

## Story Traceability

- **US-15**: Closed by relevant workspace watcher triggers, coordinated refresh scheduling, and synchronized runtime replacement after content changes.
- **US-16**: Closed by an explicit manual refresh command and deterministic user-facing refresh feedback.
- **US-17**: Closed by typed build, test, and packaging readiness validation that supports real `.vsix` delivery preparation.

## Plan Notes

- Total planned generation steps: 9
- Highest-impact changes in this unit are concentrated in shared refresh/readiness models, extension-host synchronization orchestration, watcher and command integration, preview staleness handling, and repository-local readiness validation.
- This unit intentionally stops short of executing the final verification workflows itself, because actual build, test, and packaging execution belongs to the next `Build and Test` stage.
