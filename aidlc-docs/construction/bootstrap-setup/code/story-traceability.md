# Bootstrap Setup Story Traceability

## Closed Stories

- **US-01 Start Guided AIDLC Setup**
  - Covered by the explicit `AIDLC: Start Guided Setup` command and the guided workspace/source selection flow.
- **US-02 Select Extracted AIDLC Source Folder**
  - Covered by extracted-folder selection, release-asset validation, and actionable validation failure reporting.
- **US-03 Apply AIDLC Files to the Workspace**
  - Covered by validated source-to-target planning, workspace-bound destination checks, and controlled file-copy execution for the supported Codex/OpenAI Codex layout.
- **US-04 Handle Reinitialization Safely**
  - Covered by existing-target analysis, create/update/skip/block classification, confirmation before updates, and structured outcome reporting.

## Supporting Dependencies Used

- **Extension Foundation**
  - Command registration, runtime context wiring, and extension-host lifecycle management.
- **Discovery and Indexing**
  - Post-setup rediscovery hook so the runtime can resynchronize after setup completes.

## Deferred to Later Units

- Automatic refresh watchers beyond the immediate post-setup rediscovery hook
- Additional setup modes beyond the first supported Codex/OpenAI Codex layout
- Final packaging validation and full build-and-test execution
