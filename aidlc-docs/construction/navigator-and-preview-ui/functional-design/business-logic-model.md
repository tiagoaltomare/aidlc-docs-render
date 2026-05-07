# Business Logic Model

## Unit Scope

- **Unit**: Navigator and Preview UI
- **Purpose**: Deliver the React navigator hosts and rendered preview experience inside VS Code.
- **Stories Owned**:
  - US-07 Browse Documents by AIDLC Structure
  - US-08 Search the Documentation Tree
  - US-09 Open Raw Markdown in Editor Tabs
  - US-10 Open Rendered Preview Tabs
  - US-11 Render Code and Mermaid Correctly
- **Boundaries**:
  - Owns navigator presentation, search interaction, document-opening actions, and rendered preview composition
  - Consumes the runtime document index produced by Discovery and Indexing
  - Does not own answer persistence, bootstrap file-copy flows, or workspace refresh orchestration policies

## Core Workflow Model

### Workflow 1: Initialize Navigator UI State

1. The navigator host receives the latest discovery state and runtime document index from the extension host.
2. The host derives a navigator view state containing grouped navigation, search readiness, and empty or degraded state details.
3. The React navigator renders the appropriate shell:
   - ready with grouped documents
   - empty when the docs root is valid but has no markdown
   - unavailable when discovery has not produced an active index
   - degraded when the host reports a controlled error

### Workflow 2: Search the Documentation Tree

1. The user enters a search query in the navigator.
2. The navigator normalizes the query for matching.
3. The navigator filters visible document choices against the runtime index using document title and relative path metadata.
4. Group nodes remain visible only when they still contain at least one matching descendant document or directly matching document path.
5. Clearing the query restores the full grouped navigation structure without rebuilding the underlying index.

### Workflow 3: Open a Document as Raw Markdown

1. The user selects the raw-open action for a document from the navigator.
2. The navigator emits a structured open request containing the selected document identity and the requested open mode.
3. The host validates that the document still exists in the current active index.
4. The editor integration layer opens the workspace markdown file in a normal editor tab.
5. The navigator host remains available after the raw tab opens.

### Workflow 4: Open a Rendered Preview Tab

1. The user selects the rendered-preview action for a document from the navigator.
2. The navigator emits a structured preview-open request containing the selected document identity.
3. The host resolves the current document metadata and raw markdown content from the active runtime index.
4. The preview pipeline builds a preview document model that includes:
   - title
   - relative path
   - phase
   - markdown source
   - render capability state
5. The rendered preview opens in the editor area and displays metadata plus rendered document content.

### Workflow 5: Build the Preview Rendering Model

1. The preview flow receives the selected document's markdown and metadata.
2. The preview logic classifies content regions into renderable blocks such as prose, code, Mermaid, and unresolved fallback blocks.
3. The preview logic applies safe rendering rules for markdown, syntax-highlighted code, and Mermaid-capable blocks.
4. If a block cannot be rendered safely or successfully, the preview replaces that block with a controlled fallback explanation instead of breaking the whole document view.

### Workflow 6: Handle Unavailable or Stale Selection State

1. The navigator or preview receives a document request that no longer maps to the current active index.
2. The host rejects the request as stale rather than opening a mismatched document.
3. The affected UI surface shows a controlled message that the document is no longer available in the current discovery state.
4. The user can recover by choosing another document or refreshing in a later unit.

## State Model

### Navigator View State

- Tracks whether the navigator is ready, empty, unavailable, or degraded.
- Tracks grouped navigation state and the active search query.
- Tracks whether search is filtering the visible tree or showing the full tree.

### Document Selection State

- Tracks the currently targeted document identity for raw-open and preview-open actions.
- Tracks the requested open mode so host actions remain explicit.
- Prevents stale selections from opening mismatched content.

### Preview View State

- Tracks the selected document metadata and markdown source used to render the preview.
- Tracks render capability state for markdown, Mermaid, and syntax highlighting.
- Tracks whether any block-level fallback messages are active.

## Functional Outcomes

- Users can browse the discovered AIDLC documents through grouped navigation in both panel and side-view hosts.
- Users can narrow the visible tree with search and restore the full tree without reindexing.
- Users can open the same workspace markdown file either as a raw editor tab or a rendered preview tab.
- Preview rendering preserves document identity and handles code and Mermaid safely with understandable fallbacks.

## Testable Properties

- **Invariant**: Search filtering never introduces document identities that were not present in the source runtime index.
- **Invariant**: Group pruning removes only groups that have no matching visible document descendants under the active search query.
- **Invariant**: Preview document identity always matches a document record from the active index version used to create it.
- **Easy verification**: Render block classification can be checked to ensure every input region becomes exactly one output block or one fallback block.
