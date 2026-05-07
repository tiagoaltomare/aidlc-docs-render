# Domain Entities

## Entity 1: NavigatorViewState

- **Purpose**: Represent the complete UI-facing state for a navigator host.
- **Fields**:
  - host kind
  - readiness mode
  - active search query
  - visible navigation groups
  - active index version reference
  - status message
- **Rules**:
  - Must be derived from the current discovery state and active runtime index.
  - Must not contain document records from multiple index versions.

## Entity 2: SearchQueryState

- **Purpose**: Represent the current search input and its normalized form.
- **Fields**:
  - raw query
  - normalized query
  - is active
- **Rules**:
  - An empty raw query means search is inactive.
  - The normalized query is the only value used for matching comparisons.

## Entity 3: DocumentOpenRequest

- **Purpose**: Represent a user intent to open a document in a specific mode.
- **Fields**:
  - relative path
  - requested mode
  - source host kind
  - expected index version
- **Rules**:
  - The expected index version must match the active index before the request is fulfilled.
  - Requested mode must be either raw or preview.

## Entity 4: PreviewTabDescriptor

- **Purpose**: Identify a rendered preview tab instance in the editor area.
- **Fields**:
  - relative path
  - display title
  - active index version
  - tab identity key
- **Rules**:
  - The tab identity key must remain stable for the same document and active index version.
  - A new active index version may invalidate a prior descriptor.

## Entity 5: PreviewDocumentModel

- **Purpose**: Represent the preview-ready document payload.
- **Fields**:
  - title
  - relative path
  - phase
  - markdown source
  - render blocks
  - capability state
  - fallback messages
- **Rules**:
  - The metadata must map to exactly one document record from the active index.
  - Render blocks must cover the full source document without overlap.

## Entity 6: RenderBlockModel

- **Purpose**: Represent a classified segment of preview content.
- **Fields**:
  - block kind
  - source range or order position
  - source content
  - optional language
  - render status
  - fallback message
- **Rules**:
  - A block kind must be one of prose, code, Mermaid, or fallback.
  - A fallback block must include a user-facing explanation.

## Entity 7: RenderCapabilityState

- **Purpose**: Represent which preview capabilities are currently available to the renderer.
- **Fields**:
  - markdown ready
  - code highlight ready
  - Mermaid ready
  - host limitations
- **Rules**:
  - Missing capability flags must drive controlled fallback behavior.
  - Capability state must come from the host/runtime boundary, not from untrusted webview assumptions.

## Entity Relationships

- `NavigatorViewState` contains the visible projection of grouped navigation plus the current `SearchQueryState`.
- `DocumentOpenRequest` is issued from `NavigatorViewState` interactions and validated against the active index version.
- `PreviewTabDescriptor` and `PreviewDocumentModel` are created from a validated `DocumentOpenRequest`.
- `PreviewDocumentModel` contains multiple `RenderBlockModel` instances and a shared `RenderCapabilityState`.
