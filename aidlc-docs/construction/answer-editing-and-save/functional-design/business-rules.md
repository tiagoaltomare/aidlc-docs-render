# Business Rules

## Rule Set 1: Answer Marker Eligibility

- A marker is editable only when `[Answer]:` appears in a standalone answer-marker position rather than embedded in ordinary prose or code content.
- The detection logic must evaluate the markdown structure line-by-line and must not convert textual references inside unrelated content into answer fields.
- Answer markers inside fenced code blocks must never become editable answer fields.
- If multiple eligible answer markers exist in one document, each must be represented as a separate answer field with stable field identity.

## Rule Set 2: Existing Value Interpretation

- If an answer marker already includes a value, that value must be used as the initial field value in preview.
- Empty eligible markers must render as empty answer controls rather than as missing or invalid state.
- Original answer values must remain available as the comparison baseline for dirty-state detection.

## Rule Set 3: Preview Editing Scope

- The rendered preview may edit only answer-field values in this unit.
- The preview must not expose arbitrary freeform markdown editing controls for the full document.
- The UI must indicate that broader document edits belong in the raw markdown editor mode.

## Rule Set 4: Save Request Validation

- Every save request must target a valid workspace-backed markdown document known to the preview host.
- The host must reject save requests whose document identity is stale or no longer available.
- A save request must include answer-field values keyed to known answer-field identities from the current preview baseline.

## Rule Set 5: Markdown Rebuild Integrity

- Rebuild logic must preserve all content outside the owned answer-field replacement boundaries.
- Rebuild logic must preserve answer-field ordering as it existed in the source document.
- Rebuild logic must not invent, remove, or merge answer fields outside what was detected from the source markdown.
- If rebuild cannot be completed safely, the save must fail closed rather than writing partial or guessed content.

## Rule Set 6: Workspace Persistence

- Persistence must use VS Code-native workspace file APIs rather than the legacy local HTTP save helper.
- Saves must write only to the intended workspace markdown file associated with the active preview document.
- A failed save must not discard the user’s in-memory answer edits.
- A successful save must update the preview baseline so the saved values become the new original state.

## Rule Set 7: Raw and Preview Mode Expectations

- Raw tabs remain the authoritative mode for full-document editing.
- Preview answer editing must be presented as a convenience for workflow responses, not as a full markdown authoring surface.
- The extension must avoid conflicting cues that imply non-answer markdown can be edited safely from the preview in this unit.

## Rule Set 8: Error and Feedback Handling

- Save success and save failure states must be communicated clearly to the user.
- User-facing save errors must avoid exposing raw stack traces or internal implementation details.
- Controlled failure states must preserve enough context for retry, raw-tab fallback, or later refresh recovery.
