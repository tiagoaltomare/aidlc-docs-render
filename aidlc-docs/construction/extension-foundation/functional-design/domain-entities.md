# Domain Entities

## Entity 1: ExtensionRuntimeContext

- **Purpose**: Represents the shared runtime state available after activation.
- **Core Attributes**:
  - activation status
  - extension context reference
  - service registry reference
  - contribution registry reference
  - contract registry reference

## Entity 2: ContributionDefinition

- **Purpose**: Describes a command, view, provider, or other runtime contribution the foundation owns.
- **Core Attributes**:
  - contribution id
  - contribution type
  - display label
  - criticality
  - registration status

## Entity 3: ContributionRegistry

- **Purpose**: Maintains the active set of registered extension contributions.
- **Core Attributes**:
  - command definitions
  - view definitions
  - preview definitions
  - registration results

## Entity 4: NavigatorHostDescriptor

- **Purpose**: Represents a supported navigator host surface.
- **Core Attributes**:
  - host id
  - host type
  - lifecycle status
  - reuse eligibility

## Entity 5: RuntimeContractDefinition

- **Purpose**: Defines a shared action or message contract between the extension host and webview-facing units.
- **Core Attributes**:
  - contract name
  - action identifier
  - required payload fields
  - optional payload fields
  - response expectation

## Entity 6: RuntimeStatusSnapshot

- **Purpose**: Summarizes runtime readiness for downstream units and UI surfaces.
- **Core Attributes**:
  - lifecycle phase
  - ready capabilities
  - degraded capabilities
  - blocking failures

## Relationships

- `ExtensionRuntimeContext` owns the `ContributionRegistry` and references multiple `RuntimeContractDefinition` entries.
- `ContributionRegistry` contains many `ContributionDefinition` instances.
- `ExtensionRuntimeContext` manages many `NavigatorHostDescriptor` instances.
- `RuntimeStatusSnapshot` is derived from the current `ExtensionRuntimeContext`, contribution states, and host states.
