# NFR Requirements

## Unit Scope

- **Unit**: Bootstrap Setup
- **Purpose**: Initialize AIDLC in repositories from extracted release contents.
- **NFR Focus**: Safe extracted-folder validation, workspace-bound target resolution, predictable reinitialization handling, controlled file-copy execution, and clear setup outcome reporting.

## Scalability Requirements

- The setup planner must scale to the full set of files and directories needed for supported AIDLC setup modes without requiring architectural changes.
- The target-mapping model must remain extensible so additional supported setup modes can be introduced later without redesigning the core planning flow.
- The setup outcome model must scale to reporting many created, updated, skipped, blocked, or failed paths without losing clarity.

## Performance Requirements

- Extracted-folder validation should complete quickly enough for an interactive setup flow on normal extracted AIDLC releases.
- Setup planning should avoid repeated unnecessary scans of the same source or destination paths once required state has been gathered.
- File-copy execution should report progress and completion clearly without appearing stalled during normal-size setup operations.
- Existing-target analysis should be efficient enough that reinitialization checks do not make the setup flow feel sluggish.

## Availability and Reliability Requirements

- Validation failures must prevent any workspace mutations.
- Planning failures must not produce partially executable or ambiguous setup state.
- Execution failures must produce deterministic outcome summaries that distinguish what was applied from what was not attempted.
- Reinitialization handling must remain predictable when the workspace already contains some or all setup targets.

## Security Requirements

- Every resolved destination path must remain within the intended workspace root.
- Source assets used in setup must come only from the validated extracted folder.
- The setup flow must fail closed when source validation, setup-mode resolution, or destination resolution is ambiguous.
- File operations must not silently overwrite sensitive or unexpected workspace targets.
- User-facing setup errors must avoid exposing irrelevant internal details while still clearly indicating what blocked or failed.

## Maintainability Requirements

- Validation, setup-mode resolution, target mapping, existing-target analysis, execution, and summary generation should remain separate concerns.
- Setup plan and outcome models must remain explicit shared types so future setup modes do not rely on ad hoc implicit logic.
- The unit must preserve a clear distinction between planning and execution so testing and safety checks remain understandable.
- Reinitialization behavior should be represented explicitly rather than scattered across copy logic.

## Testability Requirements

- Extracted-folder validation should be testable independently from actual file-copy execution where practical.
- Workspace-bound destination resolution should be testable as a pure or near-pure planning concern.
- Existing-target analysis and operation categorization should be testable without invoking the full setup flow.
- Partial PBT expectations apply meaningfully to:
  - workspace-bound destination invariants
  - validation-failure no-plan invariants
  - deterministic planning for equivalent inputs
  - execution summary coverage invariants

## Usability Requirements

- The setup flow must communicate what source folder the user needs to provide and what the extension will do with it.
- Validation failures must be understandable and actionable without leaving the user guessing what is missing.
- Reinitialization scenarios must clearly explain whether files will be created, updated, skipped, or blocked.
- Final setup summaries must clearly indicate success, partial failure, or blocked outcomes.

## Accessibility Requirements

- Setup prompts and summaries should remain understandable through standard VS Code interaction surfaces.
- Status and outcome distinctions must not rely only on color or iconography.
- The final result should be readable in a concise, text-forward form suitable for assistive technologies.

## Delivery and Packaging Requirements

- The unit must fit the existing extension-host architecture and use VS Code-native file-system interaction surfaces.
- Setup behavior must remain compatible with `.vsix` packaging and local extension execution.
- The unit must not depend on the old standalone site runtime or any external helper service to perform initialization.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-01**: N/A. No separate persistence store is introduced beyond workspace file-copy operations.
- **SECURITY-02**: N/A. No network intermediary is defined in this unit.
- **SECURITY-03**: Compliant. The unit requires explicit planning and execution outcomes that later implementation can log in a controlled way.
- **SECURITY-04**: N/A. This unit does not define HTML-serving behavior directly.
- **SECURITY-05**: Compliant. Source validation, destination-boundary validation, and overwrite-risk handling are explicit requirements.
- **SECURITY-06**: N/A. No IAM policy surface exists in this unit.
- **SECURITY-07**: N/A. No network configuration exists in this unit.
- **SECURITY-08**: N/A. No authenticated application surface exists in this unit.
- **SECURITY-09**: Compliant. Reinitialization and execution failures must avoid silent or unsafe overwrites.
- **SECURITY-10**: Compliant. The unit avoids introducing unmanaged helper processes or legacy runtime dependencies.
- **SECURITY-11**: Compliant. Validation, planning, and execution responsibilities remain separated by concern.
- **SECURITY-12**: N/A. No authentication model is introduced.
- **SECURITY-13**: Compliant. Target-boundary validation and source-to-target mapping protect setup integrity.
- **SECURITY-14**: N/A. Monitoring and alerting are outside this unit's immediate scope.
- **SECURITY-15**: Compliant. Validation, planning, and execution failures must fail closed without unsafe partial behavior.

### Property-Based Testing

- **PBT-02**: Applicable in principle. Round-trip style properties may apply later if setup plans gain invertible summary or replay helpers.
- **PBT-03**: Strongly applicable. Workspace-bound path, no-plan-on-validation-failure, and execution-summary invariants are clear candidates.
- **PBT-07**: Strongly applicable. Domain-specific generators for source structures, workspace paths, and target mappings will be valuable.
- **PBT-08**: Applicable later. Reproducibility belongs to implementation and test execution stages.
- **PBT-09**: Compliant. The unit remains compatible with TypeScript PBT framework adoption.
