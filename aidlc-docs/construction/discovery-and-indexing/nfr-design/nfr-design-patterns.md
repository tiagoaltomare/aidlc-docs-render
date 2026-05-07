# NFR Design Patterns

## Pattern 1: Single Active Root Selector

- **Intent**: Maintain one authoritative active docs root at a time.
- **Applied To**:
  - auto-detected root selection
  - manual override handling
  - runtime discovery state
- **Why It Matters**:
  - prevents ambiguous competing roots
  - keeps downstream document identities stable
  - simplifies refresh and index ownership semantics

## Pattern 2: Host-Side Trusted Index Builder

- **Intent**: Keep discovery and indexing in the extension host rather than in webview UI code.
- **Applied To**:
  - workspace path access
  - file enumeration
  - metadata normalization
- **Why It Matters**:
  - preserves trusted filesystem boundaries
  - avoids leaking workspace scanning into untrusted UI contexts
  - aligns with secure extension-host responsibilities

## Pattern 3: Deterministic Normalization Pipeline

- **Intent**: Normalize file path, title, phase, section, and subsection metadata through a fixed sequence of pure transformations.
- **Applied To**:
  - relative path derivation
  - title extraction
  - phase mapping
  - grouping derivation
- **Why It Matters**:
  - supports stable identities across refreshes
  - makes logic testable and PBT-friendly
  - reduces hidden branching and ad-hoc grouping behavior

## Pattern 4: Atomic Index Replacement

- **Intent**: Replace active runtime index state only after validation and full rebuild success.
- **Applied To**:
  - initial indexing
  - manual root replacement
  - refresh-triggered reindexing
- **Why It Matters**:
  - prevents partial or corrupt state from becoming active
  - preserves last known valid state
  - keeps downstream consumers safe during failed refreshes

## Pattern 5: Explicit State Partitioning

- **Intent**: Represent valid, empty, invalid, and failed discovery/index states as distinct runtime conditions.
- **Applied To**:
  - active discovery state
  - empty docs-root behavior
  - invalid-root and refresh failure handling
- **Why It Matters**:
  - improves usability and error clarity
  - avoids conflating “nothing found” with “something broke”
  - supports predictable downstream behavior

## Pattern 6: Boundary-Validated Path Handling

- **Intent**: Validate candidate roots and derived paths against the intended docs-root boundary.
- **Applied To**:
  - manual selection validation
  - file inclusion checks
  - normalized document identity derivation
- **Why It Matters**:
  - prevents unrelated workspace content from entering the runtime index
  - supports security requirements for safe path handling
  - preserves downstream trust in indexed document metadata

## Pattern 7: Read-Only Runtime Index Contract

- **Intent**: Treat the indexed document model as a read-only source for downstream units.
- **Applied To**:
  - navigator consumption
  - preview consumption
  - refresh-safe data replacement
- **Why It Matters**:
  - keeps ownership of index mutation inside this unit
  - simplifies downstream usage contracts
  - reduces accidental state corruption

## Pattern 8: Pure Helper First Design

- **Intent**: Isolate path normalization, title derivation, phase mapping, and grouping logic into pure helper seams.
- **Applied To**:
  - normalization helpers
  - grouping helpers
  - title fallback helpers
  - refresh replacement decisions
- **Why It Matters**:
  - supports strong unit testing
  - aligns directly with Partial PBT expectations
  - lowers maintenance cost for later feature growth
