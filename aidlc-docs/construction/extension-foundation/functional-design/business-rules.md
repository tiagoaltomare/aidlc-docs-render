# Business Rules

## Activation Rules

### BR-01: Single Runtime Initialization

- The foundation layer must initialize the shared extension runtime only once per activation cycle.
- Repeated activation-trigger paths must reuse established shared state rather than duplicating runtime setup.

### BR-02: Contribution Availability

- Required contribution points must be registered during activation before user-facing flows depend on them.
- A missing critical contribution must be surfaced as a controlled failure instead of a silent partial startup.

### BR-03: Safe Partial Startup

- If one non-critical contribution fails to register, other independent contributions may still remain available.
- Critical runtime contracts must not be marked ready until their required registrations are complete.

## UI Host Rules

### BR-04: Dual Host Support

- The foundation layer must support both navigator host types in the first delivery:
  - dedicated panel
  - side view
- The runtime must treat these hosts as two surfaces over a shared contract model rather than two unrelated implementations.

### BR-05: Host Reuse Preference

- If a compatible host instance already exists, the runtime should reveal or reuse it instead of creating unnecessary duplicates.
- Host creation rules must remain deterministic so users can predict where the navigator opens.

## Contract Rules

### BR-06: Contract-First Messaging

- Webview-facing interactions must use explicit shared contract definitions.
- No downstream unit should depend on ad-hoc unnamed payload shapes when a contract exists.

### BR-07: Versionable Contract Surface

- Contract definitions should be organized so later units can evolve behavior without breaking the foundation model abruptly.
- Optional downstream payloads should be distinguishable from required payloads at the contract level.

## Validation Rules

### BR-08: Command Identity Validation

- Every registered command must have a unique identity in the extension runtime.
- Duplicate or conflicting command registrations must be rejected or resolved predictably.

### BR-09: Host Capability Validation

- A host request must be validated against the supported host types.
- Unsupported or malformed host requests must fail safely without corrupting runtime state.

### BR-10: Context Guarding

- User-facing actions that require workspace or runtime context must validate that such context exists before proceeding.
- The foundation layer must provide clear status signals when downstream features are not yet ready or the workspace is not prepared.

## Error Handling Rules

### BR-11: Fail-Closed Runtime Actions

- If the runtime cannot guarantee safe registration or contract setup, the action must stop instead of proceeding with partial unsafe assumptions.

### BR-12: Explicit Runtime Status

- The foundation layer must expose enough runtime status to let downstream units distinguish:
  - not initialized
  - initializing
  - ready
  - degraded
  - failed
