# Frontend Components

## Scope Note

This unit defines the React-based navigator and rendered preview experience. It consumes host-provided discovery and document data, but it does not implement answer persistence, bootstrap flows, or refresh orchestration policies.

## Component 1: NavigatorHostApp

- **Purpose**: Root application shell shared by dedicated panel and side-view hosts.
- **Responsibilities**:
  - Receive host state and navigator payloads
  - Route between ready, empty, unavailable, and degraded UI states
  - Dispatch structured user actions back to the host
- **Props**:
  - host kind
  - navigator view state
  - host capability state
- **State**:
  - transient UI busy flags
  - local search input value

## Component 2: NavigatorSearchBar

- **Purpose**: Capture and clear the current documentation search query.
- **Responsibilities**:
  - Display the current query
  - Dispatch query-change and clear actions
  - Expose understandable empty-search behavior
- **Props**:
  - raw query
  - search enabled
  - placeholder text
- **State**:
  - controlled input text

## Component 3: NavigationTree

- **Purpose**: Render grouped phase, section, subsection, and document choices.
- **Responsibilities**:
  - Display the visible navigation groups in deterministic order
  - Support collapsed and expanded group presentation
  - Surface document-level open actions
- **Props**:
  - visible groups
  - active status message
  - selected relative path when applicable
- **State**:
  - expanded group ids

## Component 4: NavigationGroupNode

- **Purpose**: Render one group node plus its nested children and direct document actions.
- **Responsibilities**:
  - Show group label and descendant visibility
  - Render nested groups recursively
  - Render raw-open and preview-open actions for direct documents
- **Props**:
  - group model
  - expanded state
  - action handlers
- **State**:
  - none beyond local disclosure behavior if not lifted

## Component 5: NavigatorStatusPanel

- **Purpose**: Render empty, unavailable, and degraded navigator states.
- **Responsibilities**:
  - Explain why content is not currently browsable
  - Offer relevant host-driven next actions such as manual selection or retry hooks
  - Prevent the UI from showing misleading stale navigation
- **Props**:
  - readiness mode
  - status message
  - available actions
- **State**:
  - none

## Component 6: PreviewApp

- **Purpose**: Root rendered-preview application for editor-area preview tabs.
- **Responsibilities**:
  - Receive preview document models from the host
  - Render metadata and content regions
  - Route block-level failures into controlled fallback presentation
- **Props**:
  - preview document model
  - capability state
  - preview status
- **State**:
  - local render error markers

## Component 7: PreviewHeader

- **Purpose**: Show document identity context for the rendered preview.
- **Responsibilities**:
  - Display title, relative path, and phase
  - Show preview mode cues distinct from raw editing
- **Props**:
  - title
  - relative path
  - phase
- **State**:
  - none

## Component 8: PreviewContentSurface

- **Purpose**: Render the classified content blocks for a preview document.
- **Responsibilities**:
  - Render prose blocks through markdown output
  - Render code blocks with language-aware highlighting
  - Render Mermaid blocks through the supported diagram capability
  - Render fallback blocks when a specific block cannot be shown safely
- **Props**:
  - render blocks
  - capability state
- **State**:
  - none

## Component 9: PreviewFallbackNotice

- **Purpose**: Show safe, localized explanations for failed or unsupported preview content.
- **Responsibilities**:
  - Explain unsupported or failed rendering without internal details
  - Keep the rest of the preview visible
- **Props**:
  - fallback message
  - affected block kind
- **State**:
  - none

## Interaction Flows

### Flow 1: Search and Browse

1. `NavigatorHostApp` receives the current navigator state.
2. The user types into `NavigatorSearchBar`.
3. `NavigationTree` re-renders from the filtered visible groups.
4. Clearing the query restores the original grouped tree projection.

### Flow 2: Open a Raw Tab

1. The user chooses the raw-open action from `NavigationGroupNode`.
2. `NavigatorHostApp` dispatches a raw `DocumentOpenRequest`.
3. The host opens the workspace markdown file in a native editor tab.

### Flow 3: Open a Rendered Preview

1. The user chooses the preview-open action from `NavigationGroupNode`.
2. `NavigatorHostApp` dispatches a preview `DocumentOpenRequest`.
3. `PreviewApp` receives the built `PreviewDocumentModel`.
4. `PreviewHeader` and `PreviewContentSurface` render the preview tab.

### Flow 4: Render Fallback Behavior

1. `PreviewContentSurface` receives a block that cannot be rendered with the active capability state.
2. The failing block is replaced with `PreviewFallbackNotice`.
3. The surrounding preview content remains visible.

## Validation Rules

- Navigator components must consume grouped navigation state from the host rather than rebuilding document grouping locally.
- Search UI must remain controlled by explicit query state and must not mutate the source runtime index.
- Preview components must treat rendered content as read-oriented output for this unit.
- Preview fallback notices must not expose stack traces, raw exception objects, or internal file-system paths.

## Host Integration Points

- Navigator UI sends:
  - search query changes
  - clear-search actions
  - open raw document requests
  - open preview requests
- Preview UI receives:
  - preview document model payloads
  - render capability state
  - controlled fallback messages
