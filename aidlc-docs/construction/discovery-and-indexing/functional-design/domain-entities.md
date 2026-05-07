# Domain Entities

## Entity 1: DocsRootCandidate

- **Purpose**: Represents a possible document root source for the runtime.
- **Core Attributes**:
  - absolute path
  - source type (`auto-detected` or `manual`)
  - validation status
  - rejection reason when invalid

## Entity 2: ActiveDocsRoot

- **Purpose**: Represents the validated docs root currently used for indexing.
- **Core Attributes**:
  - absolute path
  - selection source
  - activation timestamp or refresh version

## Entity 3: RuntimeDocumentRecord

- **Purpose**: Represents one indexed markdown document in normalized form.
- **Core Attributes**:
  - relative path
  - absolute path
  - display title
  - phase
  - section
  - subsection

## Entity 4: RuntimeDocumentIndex

- **Purpose**: Represents the complete in-memory indexed set of documents for the active root.
- **Core Attributes**:
  - active docs root
  - document records
  - index version
  - index status

## Entity 5: NavigationGroup

- **Purpose**: Represents a grouped navigation node derived from indexed documents.
- **Core Attributes**:
  - group type (`phase`, `section`, `subsection`)
  - label
  - children
  - ordered document references

## Entity 6: DiscoveryState

- **Purpose**: Represents the current operational state of discovery and indexing.
- **Core Attributes**:
  - current mode (`undetected`, `detected`, `manual`, `empty`, `failed`)
  - active docs root reference
  - last valid index reference
  - current error details when applicable

## Relationships

- `DocsRootCandidate` may become an `ActiveDocsRoot` after validation.
- `ActiveDocsRoot` owns one active `RuntimeDocumentIndex`.
- `RuntimeDocumentIndex` contains many `RuntimeDocumentRecord` entries.
- `NavigationGroup` is derived from `RuntimeDocumentRecord` entries within a `RuntimeDocumentIndex`.
- `DiscoveryState` references the current `ActiveDocsRoot` and the current or last valid `RuntimeDocumentIndex`.
