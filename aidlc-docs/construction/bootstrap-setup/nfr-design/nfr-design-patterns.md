# NFR Design Patterns

## Host-Only Setup Authority

- Keep extracted-folder validation, setup-mode resolution, target mapping, overwrite analysis, and file-copy execution inside the extension host.
- Treat the user-provided extracted folder and all discovered paths as untrusted until host-side validation succeeds.
- Prevent webviews or other unprivileged surfaces from directly deciding destinations or performing writes.

## Validation-Before-Planning Gate

- Require extracted-folder structure validation to complete successfully before any executable setup plan is built.
- Fail closed when required release content is missing, ambiguous, or inconsistent with supported setup modes.
- Ensure invalid input can surface actionable feedback without leaking into partial planning state.

## Workspace-Bound Target Resolution

- Resolve every destination from explicit workspace-root anchored rules instead of ad hoc path concatenation during copy steps.
- Validate that each resolved target remains inside the intended workspace before the plan can proceed.
- Reject ambiguous or out-of-bound destinations before execution begins.

## Explicit Reinitialization Classification

- Classify each planned operation as create, update, skip, block, or fail candidate before file execution starts.
- Keep reinitialization behavior explicit so existing workspace content is not silently overwritten.
- Preserve clear user-facing reasoning for why an item will be created, updated, skipped, or blocked.

## Deterministic Setup Plan

- Build the setup plan from normalized source facts, setup mode, workspace root, and existing-target analysis.
- Equivalent validated inputs must produce equivalent operation plans and summaries.
- Keep plan generation stable so tests and user trust do not depend on incidental filesystem traversal order.

## Fail-Closed Execution Pipeline

- Execute only previously validated and classified operations.
- Stop or report deterministic partial outcomes when execution failures occur, without inventing fallback destinations or implicit retries.
- Preserve the distinction between unapplied, skipped, blocked, and failed work in the final outcome.

## Outcome-Complete Reporting

- Map every planned or attempted operation to exactly one outcome bucket in the final summary.
- Provide concise, text-forward reporting that distinguishes full success, partial success, blocked execution, and hard failure.
- Ensure summaries remain readable even when many files are involved.

## Pure-Seam-First Planning Logic

- Isolate validation rules, path mapping, destination boundary checks, existing-target categorization, and plan assembly into pure or near-pure helpers where practical.
- Reserve imperative filesystem interaction for the execution boundary.
- Keep the highest-risk safety rules easy to verify with example-based and property-based tests.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-03**: Compliant. The design keeps planning and execution outcomes explicit and reportable.
- **SECURITY-05**: Compliant. Validation-before-planning and workspace-bound resolution enforce input and boundary safety.
- **SECURITY-09**: Compliant. Reinitialization classification and fail-closed execution prevent silent destructive behavior.
- **SECURITY-10**: Compliant. All setup behavior remains inside the extension host with no external helper runtime.
- **SECURITY-11**: Compliant. Validation, planning, execution, and reporting remain separated by design.
- **SECURITY-13**: Compliant. Source-to-target mapping and boundary guards protect setup integrity.
- **SECURITY-15**: Compliant. Ambiguous or invalid state prevents planning or execution rather than degrading unsafely.

### Property-Based Testing

- **PBT-03**: Strongly supported. Workspace-bound destination and no-plan-on-validation-failure invariants are first-class design seams.
- **PBT-07**: Strongly supported. The design isolates generators around source layouts, workspace paths, and target mappings.
- **PBT-09**: Compliant. Pure-seam-first helpers fit the shared TypeScript testing strategy.
