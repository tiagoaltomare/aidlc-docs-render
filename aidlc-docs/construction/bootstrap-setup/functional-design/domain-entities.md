# Domain Entities

## Entity 1: ExtractedSourceSelection

- **Purpose**: Represent the user-selected extracted AIDLC source folder.
- **Fields**:
  - absolute source path
  - selection timestamp
  - selection status
- **Rules**:
  - The selection must refer to a folder, not a file.
  - The selected path must become the only source root considered for the current validation run.

## Entity 2: ExtractedSourceValidationResult

- **Purpose**: Represent the result of validating the extracted AIDLC folder structure.
- **Fields**:
  - source path
  - valid flag
  - detected assets
  - missing required assets
  - supported setup capabilities
  - validation message
- **Rules**:
  - A valid result must prove the required source assets are present for the chosen setup mode.
  - An invalid result must prevent setup planning from continuing.

## Entity 3: SetupModeDescriptor

- **Purpose**: Represent the resolved setup mode for the current workspace and delivery scope.
- **Fields**:
  - mode id
  - mode label
  - required source assets
  - target layout description
- **Rules**:
  - The mode must be one of the supported setup modes for the extension version.
  - The mode must define the destination layout needed for planning.

## Entity 4: SetupTargetMapping

- **Purpose**: Represent one source-to-destination mapping in the setup plan.
- **Fields**:
  - source path
  - destination path
  - operation type
  - existing-target state
  - overwrite risk
- **Rules**:
  - Destination path must remain within the workspace root.
  - Operation type must be explicit before execution begins.

## Entity 5: SetupOperationPlan

- **Purpose**: Represent the complete plan of file operations required for setup.
- **Fields**:
  - setup mode
  - target mappings
  - blocked mappings
  - execution order
  - plan status
- **Rules**:
  - The plan must not exist in executable form if validation failed.
  - Every planned operation must correspond to exactly one target mapping.

## Entity 6: SetupExecutionOutcome

- **Purpose**: Represent the result of applying the setup operation plan.
- **Fields**:
  - created paths
  - updated paths
  - skipped paths
  - failed paths
  - blocked paths
  - completion status
  - summary message
- **Rules**:
  - Every attempted operation must be reflected in exactly one outcome bucket.
  - A failed outcome must preserve enough detail for the user to understand what happened next.

## Entity Relationships

- `ExtractedSourceSelection` feeds `ExtractedSourceValidationResult`.
- `ExtractedSourceValidationResult` and workspace context determine the `SetupModeDescriptor`.
- `SetupModeDescriptor` and validated source assets produce a set of `SetupTargetMapping` items.
- `SetupTargetMapping` items compose the `SetupOperationPlan`.
- Applying the `SetupOperationPlan` produces the `SetupExecutionOutcome`.
