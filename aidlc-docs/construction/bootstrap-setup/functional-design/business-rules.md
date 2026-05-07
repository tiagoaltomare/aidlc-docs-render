# Business Rules

## Rule Set 1: Setup Entry and Scope

- Setup must begin from an explicit extension command or guided entry point.
- Setup must target the current workspace only and must not operate outside the intended workspace root.
- Setup must not assume a fixed downloads path or pre-known extraction location.

## Rule Set 2: Extracted Folder Validation

- The selected source folder must be validated against the expected extracted AIDLC structure before setup continues.
- Validation failure must stop the flow before any copy or update operation is attempted.
- Missing required extracted assets must be surfaced clearly to the user.
- Optional source assets may be reported, but they must not be treated as required blockers unless the current setup mode depends on them.

## Rule Set 3: Setup Mode and Target Resolution

- The setup logic must resolve the supported setup mode for this extension delivery before file operations begin.
- Every source asset used in setup must map to an explicit destination path.
- Destination resolution must never escape the intended workspace root.
- Unsupported or ambiguous setup modes must fail closed rather than guessing a target layout.

## Rule Set 4: Existing Target and Reinitialization Handling

- Existing destination files or directories must be detected before overwrite actions are planned.
- Reinitialization behavior must be explicit and safe rather than silently replacing existing content.
- The setup plan must distinguish between create, update, skip, and blocked operations.
- The setup summary must explain when the workspace appeared already initialized.

## Rule Set 5: File Operation Integrity

- Copy and update operations must use only validated source assets from the selected extracted folder.
- File operations must be applied only to the mapped destinations recorded in the setup plan.
- If a file operation cannot be performed safely, the flow must stop or skip according to the planned behavior rather than inventing fallback destinations.
- Setup must not write outside the intended workspace target set.

## Rule Set 6: Failure Handling and Reporting

- Validation failures must produce no workspace mutations.
- Execution failures must produce a clear summary of what succeeded, failed, or was not attempted.
- User-facing errors must avoid exposing raw stack traces or irrelevant internal details.
- The setup result must remain understandable whether the outcome was clean create, update, partial failure, or blocked reinitialization.

## Rule Set 7: User Guidance

- The setup flow must explain what the user needs to provide and what the extension will do next.
- The completion summary must report created or updated paths in user-understandable terms.
- The flow must not leave the user uncertain about whether setup succeeded or whether additional manual action is still required.
