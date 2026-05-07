# Discovery and Indexing Code Generation Plan

## Unit Context

- **Unit**: Discovery and Indexing
- **Stories Implemented by This Unit**:
  - US-05 Auto-detect AIDLC docs
  - US-06 Choose a docs root manually
- **Dependencies on Other Units/Services**:
  - Extension Foundation activation and contribution baseline
  - shared contract and runtime status patterns from the foundation unit
- **Expected Interfaces and Contracts**:
  - host-side discovery/indexing service interface
  - normalized runtime document record type
  - grouped navigation output contract
  - active docs-root and discovery-state contract
- **Database Entities Owned**: None
- **Service Boundaries and Responsibilities**:
  - discovery/indexing owns docs-root resolution, validation, enumeration, normalization, grouping, and refresh-safe index replacement
  - preview, answer editing, bootstrap execution, and packaging remain outside this unit

## Target Code Paths

- **Workspace Root**: `C:\Users\tiagoa\Source\aidlc-docs-render`
- **Application Code Target**:
  - `src/shared/`
  - `src/extension/discovery/`
  - `src/extension/runtime/`
  - `src/extension/activation.ts`
  - tests under `tests/`
- **Documentation Target**:
  - `aidlc-docs/construction/discovery-and-indexing/code/`

## Generation Strategy

- Brownfield modification in place on the new extension structure created by the foundation unit.
- Implement host-side discovery and indexing as modular, testable services with pure helper seams for normalization and grouping.
- Integrate the unit into the foundation runtime without prematurely implementing full navigator rendering behavior.

## Detailed Steps

### Step 1. Analyze and prepare extension integration points
- [x] Review the existing foundation runtime files and identify where discovery/indexing state will attach.
- [x] Confirm code paths for shared document-model types, discovery services, and runtime status integration.
- [x] Record assumptions that the later navigator/preview unit will consume.

### Step 2. Generate shared discovery/indexing types and contracts
- [x] Create or extend shared types for docs-root candidates, active docs roots, runtime document records, navigation groups, runtime document index, and discovery state.
- [x] Add deterministic helper contracts for phase mapping, title derivation, and grouped navigation output.
- [x] Keep shared contracts aligned with future navigator and preview consumers.

### Step 3. Generate docs-root resolution and validation logic
- [x] Implement host-side auto-detection for `aidlc-docs/`.
- [x] Implement manual docs-root selection entry logic and validation helpers.
- [x] Implement boundary-safe docs-root validation with explicit invalid reasons.
- [x] Ensure invalid manual overrides preserve the last known valid runtime state.

### Step 4. Generate document enumeration and normalization logic
- [x] Implement markdown-only document enumeration within the active docs root.
- [x] Implement stable relative-path derivation.
- [x] Implement title extraction with heading-first and filename-fallback behavior.
- [x] Implement AIDLC phase, section, and subsection derivation helpers.

### Step 5. Generate grouped runtime index and refresh-safe replacement logic
- [x] Implement grouped navigation-state construction from normalized document records.
- [x] Implement the runtime index store with distinct valid, empty, invalid, and failed states.
- [x] Implement refresh-safe replacement behavior that only promotes validated rebuilt indexes.
- [x] Add host-side runtime APIs that later units can consume for active discovery/index state.

### Step 6. Integrate discovery/indexing into the extension foundation runtime
- [x] Wire discovery/indexing services into the existing runtime context.
- [x] Update activation/runtime initialization so the unit can populate or expose discovery state.
- [x] Ensure the integration does not break the foundation unit's activation and host scaffolding contracts.

### Step 7. Generate unit tests for pure and near-pure logic
- [x] Add tests for docs-root validation behavior.
- [x] Add tests for path normalization, title derivation, phase mapping, and grouping behavior.
- [x] Add tests for refresh-safe replacement and state partition behavior.
- [x] Keep tests aligned with Partial PBT expectations where pure helpers exist, while leaving full PBT breadth to later execution stages.

### Step 8. Validate brownfield safety and produced structure
- [x] Verify no duplicate brownfield files were created outside planned paths.
- [x] Verify discovery/indexing logic remains host-side and does not leak into unrelated webview runtime code.
- [x] Verify the repository remains ready for Navigator and Preview UI to consume the resulting contracts and state.

### Step 9. Produce code-generation summaries for this unit
- [x] Create markdown summaries in `aidlc-docs/construction/discovery-and-indexing/code/` covering modified files, created files, and test scope.
- [x] Capture how the generated discovery/indexing logic satisfies US-05 and US-06 and enables later navigator/preview work.

## Story Traceability

- **US-05 Auto-detect AIDLC docs**: Implemented through active docs-root auto-detection and runtime indexing.
- **US-06 Choose a docs root manually**: Implemented through manual root selection validation and controlled active-root replacement.

## Plan Notes

- Total planned generation steps: 9
- Highest-impact code in this unit will live in host-side services and shared types rather than UI files.
- This unit intentionally stops short of full navigator rendering and preview consumption; it delivers the runtime data layer those later units need.
