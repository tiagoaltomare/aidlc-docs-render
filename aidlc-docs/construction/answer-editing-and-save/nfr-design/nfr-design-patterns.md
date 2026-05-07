# NFR Design Patterns

## Pattern 1: Host-Owned Markdown Authority

- **Problem**: The preview webview can collect answer edits, but authoritative markdown parsing, rebuild, and file persistence must remain trusted host operations.
- **Pattern**: Keep the webview limited to answer-field UI state while the host owns extraction, rebuild, validation, and workspace write execution.
- **NFRs Addressed**:
  - security
  - reliability
  - maintainability
- **Result**: Preview editing remains responsive without granting untrusted UI code direct authority over markdown or disk writes.

## Pattern 2: Region-Aware Answer Extraction

- **Problem**: `[Answer]:` text may appear in contexts that must not become editable fields, including code fences or ordinary prose.
- **Pattern**: Extraction is performed through region-aware parsing that explicitly tracks eligible and ineligible content regions before producing answer descriptors.
- **NFRs Addressed**:
  - security
  - correctness
  - testability
- **Result**: Eligible answer fields are identified deterministically while excluded regions remain untouched.

## Pattern 3: Structured Rebuild From Extraction Result

- **Problem**: Ad hoc string replacement risks corrupting unrelated content, moving markers, or applying answer updates outside the intended boundaries.
- **Pattern**: Markdown rebuild is driven by a structured extraction result that preserves owned answer regions and untouched content segments separately.
- **NFRs Addressed**:
  - reliability
  - data integrity
  - maintainability
  - testability
- **Result**: The system can rebuild markdown predictably and preserve non-owned content exactly.

## Pattern 4: Fail-Closed Save Pipeline

- **Problem**: Save failures must never produce partial writes, silent data loss, or writes to stale or incorrect files.
- **Pattern**: Save execution follows a guarded pipeline: validate identity, rebuild safely, write once, and return explicit success or failure categories. Any failure aborts the write and preserves in-memory edits.
- **NFRs Addressed**:
  - security
  - reliability
  - usability
- **Result**: Save behavior becomes predictable, recoverable, and resistant to partial corruption.

## Pattern 5: Explicit Save Lifecycle State Machine

- **Problem**: Users need clear feedback about whether answer changes are unsaved, in progress, saved, or failed, and the code should not bury those states in ad hoc UI flags.
- **Pattern**: Represent save lifecycle using explicit typed states shared across host and preview layers.
- **NFRs Addressed**:
  - usability
  - accessibility
  - maintainability
- **Result**: The UI can present clear feedback and later units can integrate refresh or conflict behavior against stable save semantics.

## Pattern 6: Dirty-State Delta Comparison

- **Problem**: Recomputing full extraction or markdown rebuild on every keystroke is unnecessary and can complicate responsiveness.
- **Pattern**: Preview dirty state is derived by comparing current answer values against the original extracted baseline, not by performing full persistence logic on every edit.
- **NFRs Addressed**:
  - performance
  - maintainability
  - usability
- **Result**: Editing stays responsive while save enablement remains accurate.

## Pattern 7: Dual-Mode Editing Separation

- **Problem**: The preview supports answer editing, but full markdown editing still belongs in raw tabs; mixing those expectations would create user confusion and implementation risk.
- **Pattern**: Preserve explicit separation between answer-field convenience editing in preview and full-document editing in raw tabs.
- **NFRs Addressed**:
  - usability
  - maintainability
  - delivery readiness
- **Result**: The unit stays scoped, understandable, and easier to evolve without preview becoming an unsafe general editor.

## Pattern 8: Pure-Seam-First Transformation Logic

- **Problem**: Extraction eligibility, rebuild integrity, exclusion handling, and round-trip guarantees are high-risk behaviors that need strong automated coverage.
- **Pattern**: Keep markdown transformation logic in pure or near-pure seams with thin adapters for preview messaging and workspace writes.
- **NFRs Addressed**:
  - testability
  - maintainability
  - performance
- **Result**: The highest-risk logic becomes suitable for both example-based and property-based testing.
