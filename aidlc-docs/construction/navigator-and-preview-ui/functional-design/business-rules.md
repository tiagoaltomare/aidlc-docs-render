# Business Rules

## Rule Set 1: Navigator Availability

- The navigator may render grouped content only when discovery has produced an active runtime index.
- A valid but empty docs root must produce an explicit empty-state experience rather than a generic failure.
- A discovery failure or missing docs root must produce an unavailable or degraded state rather than stale navigation.

## Rule Set 2: Search and Visibility

- Search matching must be case-insensitive.
- Search evaluation must use stable document metadata that already exists in the runtime index; it must not read files again during filtering.
- Search must narrow visible choices by matching document title and relative path.
- Clearing the query must restore the original grouped navigation order from the current active index.
- Search filtering must preserve ancestor groups only when they still contain a visible matching document.

## Rule Set 3: Navigation Group Ordering

- Phase ordering must follow the normalized discovery index order rather than UI-local ad hoc reordering.
- Section and subsection ordering must remain deterministic for the same active index.
- Documents rendered as direct members of a group must remain associated with that group until the index changes.

## Rule Set 4: Open Actions

- Every open action must reference a valid relative-path identity from the current active index.
- Raw-open requests must target the workspace-backed markdown file, not a detached copy.
- Preview-open requests must resolve the document from the active index before opening a rendered tab.
- If a request targets a missing or stale document identity, the host must reject it and return a controlled message.

## Rule Set 5: Preview Rendering

- The preview must display document identity metadata at minimum as title, relative path, and phase.
- Standard markdown content must render as read-oriented preview content rather than editable raw markdown.
- Code blocks must preserve language information when available so highlighting can be applied.
- Mermaid-capable blocks must be routed through the preview capability layer rather than treated as ordinary code blocks.
- Failure to render one block must not invalidate the whole preview document.

## Rule Set 6: Feature Boundaries

- This unit may expose preview hooks for later answer-field behavior, but it must not define save-back persistence logic.
- This unit must not mutate the runtime document index while processing navigator or preview actions.
- This unit must not perform workspace bootstrap or file-copy operations.

## Rule Set 7: Error and Fallback Handling

- User-facing error states must explain that the content is unavailable, unsupported, or stale without exposing internal stack details.
- Render fallbacks must be localized to the failed block whenever possible.
- Host-side validation failures must fail closed by refusing the action instead of guessing a substitute document.
