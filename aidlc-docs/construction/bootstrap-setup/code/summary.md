# Bootstrap Setup Code Summary

## Unit Outcome

The repository now supports guided AIDLC workspace initialization from an extracted official release folder. The extension can validate the extracted source structure, resolve the supported Codex/OpenAI Codex-style setup mode, classify destination changes before writing, apply setup files safely inside the workspace, and report created, updated, skipped, blocked, failed, or not-attempted paths through VS Code-native interaction surfaces.

## Modified Application Files

- `package.json`
  - Added the guided AIDLC setup command contribution and activation event.
- `src/extension/activation.ts`
  - Wired the bootstrap setup service into the extension runtime and registered the guided setup command with post-setup discovery refresh.
- `src/extension/constants.ts`
  - Added the command identifier for guided AIDLC setup.
- `src/extension/runtime/runtimeContext.ts`
  - Extended the runtime context with the bootstrap setup service.
- `tests/shared/contracts.test.ts`
  - Extended command-id coverage to include the guided setup command.

## Created Application Files

- `src/shared/bootstrap.ts`
  - Added shared setup-mode, validation, mapping, plan, and execution-outcome models plus pure helpers for source validation, target mapping, workspace-bound checks, operation classification, and execution summary derivation.
- `src/extension/bootstrap/bootstrapSetupService.ts`
  - Added the host-side guided setup flow, extracted-folder scanning, existing-target analysis, confirmation handling, file-copy execution, output-channel summaries, and user-facing completion reporting.
- `tests/shared/bootstrap.test.ts`
  - Added tests for required-asset validation, target mapping, workspace-bound path invariants, no-plan-on-validation-failure behavior, deterministic create/update/skip planning, and execution-summary coverage.

## Test Scope

- Required extracted-asset detection
- Supported setup-mode resolution
- Source-to-target mapping for Codex/OpenAI Codex layout
- Workspace-bound destination invariants
- Validation-failure no-plan behavior
- Deterministic reinitialization classification
- Execution-summary coverage and completion-state derivation

## Notes

- Build and automated test execution were not run in this stage.
- The first delivery supports the approved Codex/OpenAI Codex-style workspace layout explicitly, while keeping the shared setup models extendable for additional layouts in later work.
