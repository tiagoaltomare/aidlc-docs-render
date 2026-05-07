# End-to-End Test Instructions

## Purpose

Validate the complete user-facing extension workflows from initialization through editing and delivery readiness.

## Scenario 1: Initialize a Repository and Browse Docs

1. Open an unprepared test workspace
2. Run `AIDLC: Start Guided Setup`
3. Point the extension to an extracted AIDLC release folder
4. Confirm setup copies the expected files into the workspace
5. Confirm discovery refreshes and the navigator becomes available
6. Open one raw markdown tab and one rendered preview tab

## Scenario 2: Answer Workflow and Sync

1. In the rendered preview, edit a standalone `[Answer]:` field
2. Save the answer
3. Confirm the markdown file is updated
4. Confirm the preview stays synchronized after save
5. Edit the same file in raw markdown and confirm refresh behavior remains coherent

## Scenario 3: Runtime Recovery and Readiness

1. Trigger `AIDLC: Refresh Runtime`
2. Confirm the navigator and preview return to a current state
3. Trigger `AIDLC: Check Delivery Readiness`
4. Confirm the readiness report clearly states build, test, and packaging status

## Expected E2E Outcome

- The extension supports bootstrap, discovery, navigation, preview, answer save, refresh, and readiness reporting in one coherent flow
- Any stale or unavailable document states are surfaced explicitly instead of failing silently
