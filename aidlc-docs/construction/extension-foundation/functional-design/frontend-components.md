# Frontend Components

## Scope Note

This unit does not implement the full navigator or preview feature set. It only defines the host-shell frontend components and interaction structure required to support those later units.

## Component 1: NavigatorPanelHostShell

- **Purpose**: Provide the dedicated panel host container for the React navigator.
- **Responsibilities**:
  - Attach to the shared runtime contract surface
  - Receive initial host state from the extension layer
  - Hand off to later navigator rendering logic
- **State**:
  - host status
  - initial contract readiness
  - initial runtime availability

## Component 2: NavigatorSideViewHostShell

- **Purpose**: Provide the side-view host container for the React navigator.
- **Responsibilities**:
  - Mirror the panel-host contract model
  - Support VS Code side-view lifecycle expectations
  - Hand off to later navigator rendering logic
- **State**:
  - host status
  - visibility state
  - runtime readiness

## Component 3: FoundationStatusBoundary

- **Purpose**: Render safe foundation-level status for not-ready, degraded, or failed initialization states.
- **Responsibilities**:
  - Show loading, unavailable, or degraded runtime status
  - Prevent downstream features from assuming full readiness too early
- **State**:
  - lifecycle phase
  - blocking issues
  - recoverable issues

## Interaction Flows

### Flow 1: Open Dedicated Panel

1. User invokes navigator-open command.
2. Extension runtime resolves or creates `NavigatorPanelHostShell`.
3. Foundation contracts are attached.
4. Host shell becomes ready for navigator-specific rendering.

### Flow 2: Reveal Side View

1. User opens or focuses the side view.
2. Runtime resolves `NavigatorSideViewHostShell`.
3. Host shell receives readiness state.
4. Side view becomes ready for navigator-specific rendering.

### Flow 3: Foundation Error State

1. Runtime detects missing contribution or startup failure.
2. `FoundationStatusBoundary` receives a degraded or failed snapshot.
3. The shell displays controlled status instead of broken downstream UI.

## Validation Rules

- Host-shell components must not own document-discovery or preview-specific business logic.
- Host-shell components must consume foundation state rather than rebuilding runtime assumptions locally.
- Foundation status rendering must be available before later feature UI logic is attached.
