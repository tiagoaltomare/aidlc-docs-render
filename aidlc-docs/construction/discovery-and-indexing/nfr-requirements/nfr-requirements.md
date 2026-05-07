# NFR Requirements

## Unit Scope

- **Unit**: Discovery and Indexing
- **Purpose**: Replace manifest generation with runtime discovery, docs-root selection, and in-memory indexing.
- **NFR Focus**: Safe docs-root resolution, deterministic path normalization, stable grouped metadata generation, refresh-safe state replacement, and efficient runtime indexing for normal AIDLC repositories.

## Scalability Requirements

- The discovery and indexing model must scale to AIDLC repositories with many markdown files and nested sections without requiring architectural rewrites.
- The in-memory index must support growth in document count, grouping depth, and metadata volume while preserving a stable contract for downstream consumers.
- The grouping model must remain extensible so future units can add search and preview capabilities without redefining indexed document identities.

## Performance Requirements

- Initial docs-root discovery should complete quickly for normal workspace sizes.
- Runtime indexing should avoid unnecessary repeated full-workspace scans outside the active docs root.
- Title extraction, phase mapping, and grouping derivation should be efficient enough that refreshes remain acceptable for interactive use.
- Refresh-triggered reindexing should avoid replacing valid state with partial or inconsistent results.

## Availability and Reliability Requirements

- Automatic discovery must behave deterministically when a valid default docs root exists.
- Manual override must not destroy the last known valid index when a selected path is invalid.
- The unit must preserve a controlled distinction between:
  - valid index
  - valid empty index
  - invalid-root state
  - failed refresh state
- Refresh operations must replace active state only after validation succeeds.

## Security Requirements

- Candidate docs-root paths must be validated before indexing begins.
- The unit must only index files within the intended active docs root boundary.
- Relative path normalization must prevent unstable or unsafe document identities.
- The unit must avoid leaking unrelated workspace files into the runtime document model.
- Invalid or malformed path input must fail safely without corrupting active state.

## Maintainability Requirements

- Discovery logic, indexing logic, title derivation, and grouping logic should remain modular and testable as separate concerns.
- Runtime document entities and navigation grouping outputs must be defined through stable shared types.
- The unit must not encode preview-specific or answer-editing-specific assumptions into the indexing model.
- The logic should remain understandable enough that future units can extend it without reverse-engineering hidden coupling.

## Testability Requirements

- Auto-discovery behavior must be testable independently of UI or preview units.
- Manual selection validation and replacement rules must be testable as pure or near-pure behaviors where practical.
- Path normalization, title derivation, phase mapping, and grouping invariants must be testable through automated tests.
- Partial PBT expectations apply strongly to pure helpers in this unit, especially for:
  - path normalization
  - grouping invariants
  - title fallback derivation
  - refresh-safe state replacement helpers

## Usability Requirements

- The user must be able to understand whether the extension is using auto-detected or manually selected docs roots.
- Invalid docs-root selections must fail with a clear state rather than confusing silent behavior.
- Empty but valid docs roots must remain understandable and distinct from failure conditions.

## Delivery and Packaging Requirements

- The unit must fit within the extension-host architecture established by the foundation unit.
- The indexing and discovery logic must remain packaging-friendly and not rely on legacy Python or checked-in manifest workflows.
- The code structure should remain compatible with future packaging, test execution, and preview integration work.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-01**: N/A. No persistence store is defined in this unit.
- **SECURITY-02**: N/A. No network intermediary is defined in this unit.
- **SECURITY-03**: Compliant. The unit preserves controlled operational states that later implementation can log clearly.
- **SECURITY-04**: N/A. This unit does not define HTML-serving behavior directly.
- **SECURITY-05**: Compliant. Path validation and safe input handling are explicit requirements.
- **SECURITY-06**: N/A. No IAM policy surface exists in this unit.
- **SECURITY-07**: N/A. No network configuration exists in this unit.
- **SECURITY-08**: N/A. No authenticated application surface exists in this unit.
- **SECURITY-09**: Compliant. Invalid selections and failed refreshes must remain controlled and non-destructive.
- **SECURITY-10**: Compliant. The unit avoids reintroducing unmanaged legacy runtime dependencies.
- **SECURITY-11**: Compliant. Discovery/indexing responsibilities remain separate from unrelated privileged operations.
- **SECURITY-12**: N/A. No authentication model is introduced.
- **SECURITY-13**: Compliant. Deterministic normalization and boundary validation support data integrity expectations.
- **SECURITY-14**: N/A. Monitoring/alerting is outside this unit's immediate scope.
- **SECURITY-15**: Compliant. Refresh and selection failures must fail closed without replacing valid runtime state.

### Property-Based Testing

- **PBT-02**: Applicable in principle. Round-trip properties may apply to normalized relative/absolute path helpers if introduced.
- **PBT-03**: Strongly applicable. Grouping invariants and path/title normalization invariants should be testable later.
- **PBT-07**: Strongly applicable. Domain-specific generators for valid and invalid path/grouping scenarios will be valuable.
- **PBT-08**: Applicable later. Reproducibility belongs to implementation and test execution stages.
- **PBT-09**: Compliant. The unit remains compatible with TypeScript PBT framework adoption.
