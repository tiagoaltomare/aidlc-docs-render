# Logical Components

## Component 1: Navigator State Projector

- **Purpose**: Derive the UI-facing navigator view state from the discovery state, active index, and current search query.
- **Responsibilities**:
  - compute ready, empty, unavailable, and degraded modes
  - derive visible navigation groups
  - preserve deterministic ordering
- **Patterns Applied**:
  - Read-Only Navigator Projection
  - Explicit UI State Partitioning
  - Pure-Seam-First UI Logic

## Component 2: Search Projection Engine

- **Purpose**: Filter and prune grouped navigation using in-memory metadata only.
- **Responsibilities**:
  - normalize search query input
  - project matching document identities
  - preserve ancestor groups only when needed
- **Patterns Applied**:
  - Read-Only Navigator Projection
  - Pure-Seam-First UI Logic

## Component 3: Navigator Host Contract Adapter

- **Purpose**: Bridge typed navigator actions and state payloads between the host and React navigator surfaces.
- **Responsibilities**:
  - send initial and updated navigator state
  - receive search and open requests
  - normalize message framing between panel and side-view hosts
- **Patterns Applied**:
  - Host-Validated Open Request Boundary
  - Shared Host Shell, Divergent Presentation Surface

## Component 4: Open Request Validator

- **Purpose**: Validate raw-open and preview-open requests before they trigger trusted host behavior.
- **Responsibilities**:
  - verify relative-path identity exists in the active index
  - verify expected index version matches active state
  - fail closed with controlled status when validation fails
- **Patterns Applied**:
  - Host-Validated Open Request Boundary
  - Explicit UI State Partitioning

## Component 5: Preview Model Builder

- **Purpose**: Build the read-oriented preview payload from validated document identity plus source content and metadata.
- **Responsibilities**:
  - shape preview metadata
  - attach capability state
  - prepare render blocks and fallback placeholders
- **Patterns Applied**:
  - Capability-Gated Preview Rendering
  - Pure-Seam-First UI Logic

## Component 6: Render Capability Registry

- **Purpose**: Represent which rendering features are currently available to the preview pipeline.
- **Responsibilities**:
  - declare markdown, highlighting, and Mermaid capability state
  - provide a single source of truth for preview rendering decisions
  - support packaging-safe capability gating
- **Patterns Applied**:
  - Capability-Gated Preview Rendering
  - CSP-Compatible Asset Discipline

## Component 7: Block Rendering Router

- **Purpose**: Route each preview block to the correct rendering path or fallback path.
- **Responsibilities**:
  - dispatch prose, code, Mermaid, and fallback block kinds
  - keep failures localized to the affected block
  - avoid whole-document breakage from one failed block
- **Patterns Applied**:
  - Block-Local Fallback Isolation
  - Capability-Gated Preview Rendering

## Component 8: Webview Security Envelope

- **Purpose**: Encapsulate the CSP-compatible loading and rendering constraints for navigator and preview webviews.
- **Responsibilities**:
  - constrain asset loading model
  - keep rendering assumptions compatible with secure webview delivery
  - prevent drift back toward the old unrestricted standalone page structure
- **Patterns Applied**:
  - CSP-Compatible Asset Discipline

## Component 9: Surface Status Boundary

- **Purpose**: Render and propagate controlled empty, unavailable, degraded, and stale-selection states across navigator and preview surfaces.
- **Responsibilities**:
  - map validation and rendering failures to safe user-facing states
  - prevent stale or misleading content from remaining visible
  - preserve consistent status semantics across panel, side view, and preview
- **Patterns Applied**:
  - Explicit UI State Partitioning
  - Block-Local Fallback Isolation

## Interaction Summary

- `Navigator State Projector` and `Search Projection Engine` derive the visible navigator state without mutating the runtime index.
- `Navigator Host Contract Adapter` receives user actions and forwards them to `Open Request Validator`.
- `Open Request Validator` gates trusted raw-open and preview-open behaviors.
- Valid preview requests flow into `Preview Model Builder`, which uses `Render Capability Registry` and feeds `Block Rendering Router`.
- `Webview Security Envelope` constrains how navigator and preview webviews load assets and execute rendering logic.
- `Surface Status Boundary` provides consistent degraded and fallback behavior across all UI surfaces.
