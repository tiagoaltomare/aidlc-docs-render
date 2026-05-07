# Business Logic Model

## Unit Scope

- **Unit**: Discovery and Indexing
- **Purpose**: Replace manifest generation with runtime discovery, docs-root selection, and in-memory indexing.
- **Stories Owned**:
  - US-05 Auto-detect AIDLC docs
  - US-06 Choose a docs root manually
- **Boundaries**:
  - Owns docs-root resolution and runtime document-model creation
  - Owns navigation-oriented metadata grouping by phase, section, and subsection
  - Does not own preview rendering, answer editing, bootstrap file-copy execution, or packaging validation

## Core Workflow Model

### Workflow 1: Automatic Docs-Root Discovery

1. The runtime receives workspace context from the extension foundation.
2. The discovery logic evaluates the workspace for an `aidlc-docs/` directory.
3. If a valid docs root is found, it becomes the active discovery target.
4. The active docs root is passed to indexing logic to produce runtime document state.

### Workflow 2: Manual Docs-Root Selection

1. Automatic discovery fails or the user explicitly chooses a docs root.
2. The discovery logic receives a user-selected path.
3. The selected path is validated as a usable docs root candidate.
4. If valid, the selected path becomes the active discovery target and is indexed.
5. If invalid, the runtime produces a controlled failure state without corrupting previous valid state.

### Workflow 3: Runtime Index Construction

1. The indexing logic enumerates markdown files under the active docs root.
2. Each file is normalized into a runtime document model.
3. The logic derives:
   - display title
   - relative path
   - phase group
   - section and subsection placement
4. A grouped navigation model is assembled from the normalized documents.
5. The resulting document index becomes the shared runtime source for navigator and preview consumers.

### Workflow 4: Index Refresh

1. A refresh trigger occurs from manual action or later workspace change coordination.
2. The indexing logic re-evaluates the active docs root.
3. The runtime document model is rebuilt or updated from the current files.
4. The refreshed index replaces the prior active index only if validation succeeds.

## Data Flow Model

- **Input Sources**:
  - workspace folders
  - user-selected docs root path
  - markdown files under the active root
- **Transformations**:
  - path normalization
  - title extraction
  - phase/section/subsection grouping
  - document-index assembly
- **Outputs**:
  - active docs-root selection state
  - normalized document metadata collection
  - grouped navigation state

## Functional Outcomes

- The extension can detect `aidlc-docs/` automatically when present.
- Users can choose a docs root manually when the workspace layout is non-standard.
- The runtime can build a stable, in-memory document index without relying on a checked-in manifest file.
- Later units receive a normalized document model and grouped navigation state.
