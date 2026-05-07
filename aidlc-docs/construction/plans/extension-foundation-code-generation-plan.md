# Extension Foundation Code Generation Plan

## Unit Context

- **Unit**: Extension Foundation
- **Stories Implemented by This Unit**: Indirect support for all stories through activation, commands, contribution points, runtime contracts, and host scaffolding
- **Primary Dependencies**: None
- **Expected Interfaces and Contracts**:
  - extension activation entry point
  - command and contribution registration surface
  - shared host/webview contract module
  - navigator host provisioning interface
  - runtime status surface for downstream units
- **Database Entities Owned**: None
- **Service Boundaries and Responsibilities**:
  - foundation owns activation and registration scaffolding only
  - discovery, preview, save, bootstrap, and packaging implementation details stay outside this unit

## Target Code Paths

- **Workspace Root**: `C:\Users\tiagoa\Source\aidlc-docs-render`
- **Application Code Target**:
  - `package.json`
  - `src/extension/`
  - `src/shared/`
  - `src/webview/foundation/`
  - `tsconfig*.json`, build config, and test config files as needed
- **Documentation Target**:
  - `aidlc-docs/construction/extension-foundation/code/`

## Generation Strategy

- Brownfield migration: modify the current repository in place and introduce a real extension structure.
- Preserve the current static viewer files as reference inputs unless a plan step explicitly replaces their role.
- Establish the extension foundation first, with typed contracts and host scaffolding that later units can consume.

## Detailed Steps

### Step 1. Analyze and prepare the existing project structure
- [x] Review the current root files and confirm which existing files remain as migration inputs versus active runtime entry points.
- [x] Define the initial TypeScript-based extension structure under workspace root paths.
- [x] Record any runtime assumptions that later units will depend on.

### Step 2. Upgrade the repository to an extension-ready package baseline
- [x] Update `package.json` to become a VS Code extension manifest instead of static-site metadata only.
- [x] Add scripts for build, test, and extension packaging prerequisites.
- [x] Add TypeScript and extension build configuration files required for the foundation unit.
- [x] Document story traceability to all downstream stories through shared runtime support.

### Step 3. Generate the extension activation and contribution wiring layer
- [x] Create the extension entry point and activation coordinator under `src/extension/`.
- [x] Implement contribution registration scaffolding for commands, navigator hosts, and future preview registration.
- [x] Implement single-initialization protection and explicit runtime lifecycle state handling.
- [x] Add summary documentation for the activation/contribution layer in `aidlc-docs/construction/extension-foundation/code/`.

### Step 4. Generate the shared runtime contract and status modules
- [x] Create typed contract definitions under `src/shared/` for host/webview actions and responses.
- [x] Create runtime status and capability registry models under `src/shared/` or `src/extension/`.
- [x] Implement validation-friendly helpers for command ids, host types, and contribution metadata.
- [x] Add unit-test-ready pure helpers where applicable.
- [x] Add summary documentation for shared contracts in `aidlc-docs/construction/extension-foundation/code/`.

### Step 5. Generate the navigator host scaffolding
- [x] Create dedicated panel and side-view host scaffolding under `src/extension/` and `src/webview/foundation/`.
- [x] Implement foundation-level host reuse and host provisioning flows.
- [x] Add a foundation status boundary for not-ready, degraded, and failed runtime states.
- [x] Ensure UI host scaffolding is ready for later navigator-specific logic rather than implementing full navigator behavior now.
- [x] Add summary documentation for host scaffolding in `aidlc-docs/construction/extension-foundation/code/`.

### Step 6. Generate the foundation-level tests
- [x] Add unit tests for activation lifecycle and single-initialization behavior.
- [x] Add unit tests for contribution registration outcomes and capability registry behavior.
- [x] Add unit tests for shared contract helpers and runtime status derivation helpers.
- [x] Keep tests aligned with Partial PBT expectations where pure helpers exist, while leaving full PBT execution breadth to later stages.

### Step 7. Validate brownfield safety and produced structure
- [x] Verify no duplicate “modified/new” brownfield files were created outside the planned structure.
- [x] Verify new extension foundation files live in workspace-root application paths only.
- [x] Verify the repository remains ready for later units: discovery, preview, save, bootstrap, and packaging readiness.

### Step 8. Produce code-generation summaries for this unit
- [x] Create markdown summaries in `aidlc-docs/construction/extension-foundation/code/` covering modified files, created files, and test scope.
- [x] Capture how the generated foundation supports downstream units and story coverage.

## Story Traceability

- **US-01 to US-17**: This unit does not complete end-user stories directly, but it enables every later story through extension activation, commands, host provisioning, runtime contracts, and shared capability status.

## Plan Notes

- Total planned generation steps: 8
- Highest-impact changes in this unit are structural: `package.json`, build configuration, extension entry points, shared contracts, and host shells.
- The unit intentionally stops short of implementing discovery, preview rendering, answer persistence, or setup execution details; those belong to later units.
