# Business Rules

## Discovery Rules

### BR-01: Single Active Docs Root

- Only one docs root may be active for indexing at a time within the current runtime context.
- A new valid selection may replace the current active root, but ambiguous simultaneous roots must not silently compete.

### BR-02: Automatic Discovery Preference

- If a valid default `aidlc-docs/` exists in the current workspace context, it should be preferred as the initial discovery candidate.
- Manual selection is used when auto-discovery fails or the user overrides the default.

### BR-03: Controlled Manual Override

- A user-selected docs root may replace the automatically detected root when valid.
- Invalid manual selections must not destroy a previously valid active docs root state.

## Validation Rules

### BR-04: Docs-Root Validation

- A candidate docs root must be validated before indexing begins.
- Validation must confirm that the path is usable as a document root and not a malformed or unrelated directory.

### BR-05: Markdown-Only Index Inclusion

- Only markdown documents relevant to the docs experience should be included in the runtime index.
- Non-markdown files must not appear as indexed documents in this unit's output model.

### BR-06: Stable Relative Pathing

- Indexed document paths must be normalized relative to the active docs root.
- Path normalization must be deterministic so downstream units can use stable document identities.

## Grouping Rules

### BR-07: AIDLC Phase Mapping

- Top-level grouping must follow AIDLC navigation conventions:
  - `overview`
  - `inception`
  - `construction`
  - `operations`
  - fallback `other`

### BR-08: Section and Subsection Derivation

- Nested folders beneath phase roots must be reflected as section and subsection groupings when present.
- Grouping derivation must remain consistent across refreshes for unchanged file structure.

### BR-09: Title Resolution

- The display title for a document should prefer an explicit markdown heading when available.
- If a heading is unavailable, a deterministic fallback title must be derived from the filename.

## Refresh Rules

### BR-10: Replace-Only-On-Valid-Refresh

- A refresh must replace active runtime index state only if the rebuild succeeds validation.
- Failed refreshes must preserve the last known valid index when one exists.

### BR-11: Controlled Empty-State Handling

- If a valid docs root contains no matching markdown files, the index should represent a valid empty state rather than a corrupted state.
- Empty-state behavior must remain distinguishable from invalid-root or failed-index states.

## Integration Rules

### BR-12: Downstream Read-Only Contract

- Navigator and preview consumers should treat the runtime index as a read-only source produced by this unit.
- Mutation of indexed document metadata belongs to later units only through controlled refresh/rebuild flows.
