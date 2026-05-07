# Performance Test Instructions

## Purpose

Validate that the extension remains responsive during discovery, search, refresh, and preview synchronization for normal AIDLC repositories.

## Performance Areas to Check

- **Initial Discovery**: docs-root detection and first index build
- **Search Responsiveness**: filtering the navigator tree in memory
- **Refresh Responsiveness**: watcher-triggered and manual resynchronization
- **Preview Update Responsiveness**: preview revalidation after save or file change

## Manual Performance Validation

### 1. Discovery Timing

- Open a representative AIDLC workspace
- Measure whether navigator content appears quickly after activation
- Confirm that no unnecessary repeated rescans occur during idle time

### 2. Search Timing

- Type into the navigator search field with a populated docs tree
- Confirm that result narrowing feels immediate and does not freeze the host

### 3. Refresh Timing

- Trigger `AIDLC: Refresh Runtime`
- Edit one markdown file and observe watcher-driven refresh behavior
- Confirm the runtime does not visibly thrash on unrelated file changes

### 4. Preview Synchronization

- Save an answer from the preview
- Confirm the preview returns to a current state quickly
- Confirm that stale or unavailable states appear explicitly if the document disappears from the active index

## Expected Performance Outcomes

- Discovery should feel responsive for normal AIDLC repositories
- Search should feel immediate because it operates over in-memory state
- Refresh should avoid duplicate rescans for clustered changes
- Preview synchronization should not require reopening the preview under normal conditions

## If Performance Does Not Meet Expectations

1. Inspect trigger classification and refresh coalescing behavior
2. Check whether unrelated watcher events are being treated as relevant
3. Review whether full rescans are being triggered more often than necessary
4. Re-test after adjustments
