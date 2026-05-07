# NFR Design Patterns

## Pattern 1: Host-Validated Open Request Boundary

- **Problem**: Navigator and preview actions originate in the webview, but file identities and active index versions must be trusted only on the host side.
- **Pattern**: All raw-open and preview-open actions cross a typed boundary that includes relative path identity, requested mode, and expected index version. The host validates the request against the current active index before fulfilling it.
- **NFRs Addressed**:
  - security
  - reliability
  - maintainability
- **Result**: Stale or forged requests fail closed, and UI concerns remain separated from trusted workspace operations.

## Pattern 2: Read-Only Navigator Projection

- **Problem**: Search and navigation rendering need to feel interactive without mutating the source runtime index or re-running discovery logic.
- **Pattern**: The host publishes a stable document index, and the navigator derives a read-only visible projection from that source plus the active search query.
- **NFRs Addressed**:
  - performance
  - scalability
  - maintainability
  - testability
- **Result**: Search remains in-memory and responsive, while source discovery state remains authoritative and unchanged.

## Pattern 3: Explicit UI State Partitioning

- **Problem**: Navigator and preview surfaces must distinguish ready, empty, unavailable, and degraded states without confusing users or collapsing into generic failure behavior.
- **Pattern**: UI state is partitioned into explicit readiness modes shared across host and webview contracts.
- **NFRs Addressed**:
  - usability
  - reliability
  - accessibility
- **Result**: Each surface can render the correct controlled state without stale content or ambiguous messaging.

## Pattern 4: Capability-Gated Preview Rendering

- **Problem**: Markdown, code highlighting, and Mermaid support may have different availability or failure characteristics inside a secure webview.
- **Pattern**: The host constructs a preview model plus a render-capability state, and the preview surface chooses rendering behavior according to those declared capabilities.
- **NFRs Addressed**:
  - security
  - reliability
  - packaging
  - maintainability
- **Result**: Rendering behavior is explicit, testable, and compatible with graceful fallback when a capability is unavailable.

## Pattern 5: Block-Local Fallback Isolation

- **Problem**: A single broken or unsupported renderable region should not collapse an entire preview tab.
- **Pattern**: The preview surface classifies content into blocks and isolates fallback handling at the block level.
- **NFRs Addressed**:
  - reliability
  - usability
  - accessibility
- **Result**: Unsupported or failed blocks are replaced with controlled notices while the rest of the document remains visible.

## Pattern 6: CSP-Compatible Asset Discipline

- **Problem**: VS Code webviews require restrictive security boundaries, and the old site model cannot be copied directly.
- **Pattern**: Scripts, styles, and render dependencies are selected and integrated under a CSP-compatible asset-loading model with no assumption of unrestricted inline execution.
- **NFRs Addressed**:
  - security
  - packaging
  - maintainability
- **Result**: The unit stays aligned with secure webview delivery and `.vsix` packaging needs.

## Pattern 7: Shared Host Shell, Divergent Presentation Surface

- **Problem**: Dedicated panel and side view need consistent behavior without duplicating state logic, while preview tabs remain a separate editor-area experience.
- **Pattern**: Panel and side-view hosts share navigator-state derivation and message contracts, while the preview uses a separate but related host-prepared model.
- **NFRs Addressed**:
  - maintainability
  - scalability
  - delivery readiness
- **Result**: Shared concerns stay centralized, and each UI surface can evolve without unnecessary duplication.

## Pattern 8: Pure-Seam-First UI Logic

- **Problem**: Search projection, group pruning, and preview block classification are user-visible behaviors that should be testable without full VS Code or DOM integration.
- **Pattern**: Keep transformation-heavy UI logic in pure or near-pure seams behind thin host and rendering adapters.
- **NFRs Addressed**:
  - testability
  - maintainability
  - performance
- **Result**: The highest-risk UI logic remains easy to cover with example-based and property-based tests later.
