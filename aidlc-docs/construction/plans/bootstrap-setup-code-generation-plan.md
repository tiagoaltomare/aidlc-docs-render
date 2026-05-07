# Bootstrap Setup Code Generation Plan

## Unit Context

- **Unit**: Bootstrap Setup
- **Stories Implemented by This Unit**:
  - US-01 Start Guided AIDLC Setup
  - US-02 Select Extracted AIDLC Source Folder
  - US-03 Apply AIDLC Files to the Workspace
  - US-04 Handle Reinitialization Safely
- **Primary Dependencies**:
  - Extension Foundation
  - Discovery and Indexing
  - Navigator and Preview UI
  - Answer Editing and Save
- **Expected Interfaces and Contracts**:
  - extension command registration and runtime context access from the foundation unit
  - workspace-aware file access through VS Code-native APIs
  - shared typed setup planning and execution result models
  - post-setup hooks that can hand control back to discovery and navigator flows without coupling bootstrap to rendering
- **Database Entities Owned**: None
- **Service Boundaries and Responsibilities**:
  - this unit owns extracted-folder selection, source validation, setup-mode resolution, explicit source-to-target planning, reinitialization classification, and controlled workspace file application
  - this unit does not own docs indexing, navigator rendering, markdown preview, answer editing, or final packaging validation

## Target Code Paths

- **Workspace Root**: `C:\Users\tiagoa\Source\aidlc-docs-render`
- **Application Code Target**:
  - `src/shared/`
  - `src/extension/`
  - `tests/`
- **Documentation Target**:
  - `aidlc-docs/construction/bootstrap-setup/code/`

## Generation Strategy

- Brownfield migration: extend the existing extension host in place instead of introducing an external setup helper or a separate setup runtime.
- Keep validation, planning, and execution responsibilities separated so the highest-risk filesystem logic remains testable and fail closed.
- Start with the approved Codex/OpenAI Codex-style workspace layout while representing setup mode and planning types explicitly for later extension.
- Reuse VS Code-native command and prompt surfaces for the first delivery, keeping the setup flow command-driven and packaging friendly.

## Detailed Steps

### Step 1. Prepare shared bootstrap setup models and contracts
- [x] Review the current command/runtime context surfaces and identify the shared types needed for setup validation, mapping, planning, and outcomes.
- [x] Extend `src/shared/` with setup-mode, validation-result, target-mapping, operation-plan, and execution-summary models.
- [x] Keep the contract surface explicit enough to support safe reinitialization handling and future setup modes.

### Step 2. Generate host-side extracted-folder validation and mode resolution logic
- [x] Add host-side logic under `src/extension/` for selecting an extracted source folder and validating the required AIDLC release structure.
- [x] Implement setup-mode resolution for the approved initial layout without hardcoding copy behavior into the validation step.
- [x] Keep validation and mode resolution isolated from file writes so invalid or ambiguous sources cannot mutate the workspace.

### Step 3. Generate target mapping, workspace boundary, and reinitialization planning logic
- [x] Implement explicit source-to-target mapping helpers for the supported setup mode.
- [x] Add workspace-bound destination validation and existing-target analysis for create, update, skip, and block classification.
- [x] Build deterministic setup-plan assembly that preserves no-plan-on-validation-failure behavior.

### Step 4. Wire the setup command flow and controlled execution into the extension runtime
- [x] Register and implement the guided setup command in the extension host using VS Code-native prompts.
- [x] Add execution orchestration that applies only validated planned operations and records structured outcomes.
- [x] Keep execution fail closed on path, validation, or file-operation errors, with no fallback destinations or silent overwrites.

### Step 5. Add user-facing setup summaries and post-setup runtime integration
- [x] Add concise setup-result reporting that explains the selected source, resolved mode, and created, updated, skipped, blocked, or failed paths.
- [x] Integrate successful setup completion with the existing runtime so later discovery or navigator refresh flows can be triggered cleanly.
- [x] Preserve a text-forward interaction style suitable for standard VS Code surfaces and assistive technologies.

### Step 6. Generate unit tests for validation, planning, and outcome categorization
- [x] Add tests for extracted-folder validation, required-asset detection, and setup-mode resolution.
- [x] Add tests for workspace-bound target invariants, deterministic planning, and reinitialization classification.
- [x] Add tests for execution-summary coverage and other high-value seams aligned with Partial PBT expectations.

### Step 7. Validate brownfield safety and packaging-ready setup boundaries
- [x] Verify the unit modifies the existing extension structure in place without creating duplicate brownfield files.
- [x] Verify the setup flow remains entirely inside the extension-host boundary with no dependence on legacy site helpers or external services.
- [x] Verify the resulting seams remain compatible with later refresh orchestration, build verification, and `.vsix` packaging work.

### Step 8. Produce code-generation summaries for this unit
- [x] Create markdown summaries in `aidlc-docs/construction/bootstrap-setup/code/` covering modified files, created files, and test scope.
- [x] Capture how this unit closes US-01 through US-04 and what remains intentionally deferred to the refresh and delivery-readiness unit.

## Story Traceability

- **US-01**: Closed by registering and wiring an explicit guided AIDLC setup command in the extension host.
- **US-02**: Closed by extracted-folder selection, validation, and actionable failure messaging.
- **US-03**: Closed by explicit source-to-target planning and controlled application of required AIDLC files into the workspace.
- **US-04**: Closed by existing-target analysis, safe create or update classification, and clear reporting for skipped or blocked paths.

## Plan Notes

- Total planned generation steps: 8
- Highest-impact changes in this unit are concentrated in shared setup models, host-side validation and planning helpers, command-driven execution orchestration, and deterministic result reporting.
- This unit intentionally stops short of implementing the later automatic or manual refresh stories, final packaging validation, and end-to-end build verification.
