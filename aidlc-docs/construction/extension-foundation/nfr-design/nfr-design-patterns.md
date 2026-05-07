# NFR Design Patterns

## Pattern 1: Single-Initialization Guard

- **Intent**: Prevent duplicate extension runtime setup during repeated activation triggers.
- **Applied To**:
  - extension activation lifecycle
  - shared service initialization
  - contribution registration bootstrap
- **Why It Matters**:
  - Supports deterministic startup
  - Prevents repeated registration side effects
  - Preserves a consistent runtime state for downstream units

## Pattern 2: Contract-First Host/Webview Boundary

- **Intent**: Treat all host-to-webview and webview-to-host interactions as explicit typed contracts with validation boundaries.
- **Applied To**:
  - action messages
  - response payloads
  - host capability requests
- **Why It Matters**:
  - Reduces ad-hoc coupling
  - Supports safe validation and future evolution
  - Aligns with security requirements for constrained message handling

## Pattern 3: Fail-Closed Registration and Host Provisioning

- **Intent**: Stop or degrade safely when critical foundation setup cannot be completed with confidence.
- **Applied To**:
  - command registration
  - host-type provisioning
  - runtime contract readiness
- **Why It Matters**:
  - Prevents unsafe partial startup
  - Keeps runtime status explicit
  - Supports controlled degraded states instead of silent corruption

## Pattern 4: Shared Host Abstraction

- **Intent**: Support dedicated panel and side-view navigator hosts through a shared host model rather than duplicating core logic.
- **Applied To**:
  - host lifecycle
  - base host state
  - downstream navigator attachment
- **Why It Matters**:
  - Supports both delivery surfaces from the first cycle
  - Preserves predictable behavior
  - Reduces duplication across host implementations

## Pattern 5: Runtime Status Boundary

- **Intent**: Represent initialization, degraded states, and failures through a structured runtime status surface.
- **Applied To**:
  - startup reporting
  - host-shell readiness
  - downstream unit coordination
- **Why It Matters**:
  - Keeps not-ready and failed states explicit
  - Improves maintainability and observability
  - Supports safe UX for incomplete or degraded runtime conditions

## Pattern 6: Separation of Privileged Operations

- **Intent**: Keep privileged extension-host actions and file-capable operations outside webview UI code.
- **Applied To**:
  - command handling
  - future save flows
  - future bootstrap/setup orchestration
- **Why It Matters**:
  - Preserves security boundaries
  - Supports CSP-compatible webview posture
  - Keeps trust-sensitive logic centralized

## Pattern 7: Capability Registry Pattern

- **Intent**: Represent registered commands, views, and preview providers as explicit capability records rather than implicit side effects only.
- **Applied To**:
  - contribution registration
  - readiness checks
  - downstream capability discovery
- **Why It Matters**:
  - Improves deterministic behavior
  - Supports testing and degraded-state handling
  - Makes contribution availability inspectable

## Pattern 8: Packaging-Ready Source Separation

- **Intent**: Separate host runtime code, shared contracts, and webview-facing code paths from the start.
- **Applied To**:
  - project structure
  - build inputs
  - future packaging validation
- **Why It Matters**:
  - Reduces later restructuring cost
  - Supports `.vsix` readiness
  - Keeps the foundation compatible with later React/webview bundling decisions

## Partial PBT-Oriented Pattern Guidance

- Pure helpers introduced in this unit should preserve:
  - stable contract normalization behavior
  - deterministic runtime status derivation
  - contribution registry invariants
- These patterns are intentionally designed to allow later property-based testing without refactoring core unit seams.
