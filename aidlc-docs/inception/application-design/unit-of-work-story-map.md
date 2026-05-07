# Unit of Work Story Map

## Story-to-Unit Mapping

| Story | Summary | Assigned Unit |
|---|---|---|
| US-01 | Start guided AIDLC setup | Bootstrap Setup |
| US-02 | Select extracted AIDLC source folder | Bootstrap Setup |
| US-03 | Apply AIDLC files to the workspace | Bootstrap Setup |
| US-04 | Handle reinitialization safely | Bootstrap Setup |
| US-05 | Auto-detect AIDLC docs | Discovery and Indexing |
| US-06 | Choose a docs root manually | Discovery and Indexing |
| US-07 | Browse documents by AIDLC structure | Navigator and Preview UI |
| US-08 | Search the documentation tree | Navigator and Preview UI |
| US-09 | Open raw markdown in editor tabs | Navigator and Preview UI |
| US-10 | Open rendered preview tabs | Navigator and Preview UI |
| US-11 | Render code and Mermaid correctly | Navigator and Preview UI |
| US-12 | Render standalone answer fields | Answer Editing and Save |
| US-13 | Save answer edits back to markdown | Answer Editing and Save |
| US-14 | Preserve full editing through raw tabs | Answer Editing and Save |
| US-15 | Refresh automatically on workspace changes | Refresh and Delivery Readiness |
| US-16 | Refresh manually when needed | Refresh and Delivery Readiness |
| US-17 | Install a packaged extension build | Refresh and Delivery Readiness |

## Supporting Unit Coverage

### Extension Foundation

- Supports all stories indirectly by providing activation, commands, views, preview registration, shared contracts, and runtime scaffolding.

### Bootstrap Setup

- Owns the repository initialization journey and setup-mode handling.

### Discovery and Indexing

- Owns docs-root resolution and runtime document-model creation.

### Navigator and Preview UI

- Owns reading, browsing, search, tab opening, and rendered viewing experience.

### Answer Editing and Save

- Owns answer-field rendering correctness and save-back persistence.

### Refresh and Delivery Readiness

- Owns synchronization, packaging validation, and end-of-cycle delivery readiness.

## Coverage Check

- **All stories assigned**: Yes
- **Unassigned stories**: None
- **Cross-unit stories**: Some stories depend on enabling contracts from foundation, but each story has one primary owning unit
