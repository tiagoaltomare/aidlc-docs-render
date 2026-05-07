# Navigator and Preview UI Code Generation Plan

## Unit Context

- **Unit**: Navigator and Preview UI
- **Stories Implemented by This Unit**:
  - US-07 Browse Documents by AIDLC Structure
  - US-08 Search the Documentation Tree
  - US-09 Open Raw Markdown in Editor Tabs
  - US-10 Open Rendered Preview Tabs
  - US-11 Render Code and Mermaid Correctly
- **Primary Dependencies**:
  - Extension Foundation
  - Discovery and Indexing
- **Expected Interfaces and Contracts**:
  - typed host/webview messaging for navigator actions and state payloads
  - runtime discovery/index state as navigator input
  - custom editor preview integration for rendered tabs
  - host-side validation for raw-open and preview-open requests
- **Database Entities Owned**: None
- **Service Boundaries and Responsibilities**:
  - this unit owns browse/search/open/render behavior
  - discovery remains the source of truth for docs-root and document index state
  - answer parsing, answer saving, bootstrap setup, and refresh orchestration remain outside this unit

## Target Code Paths

- **Workspace Root**: `C:\Users\tiagoa\Source\aidlc-docs-render`
- **Application Code Target**:
  - `package.json`
  - `src/shared/`
  - `src/extension/`
  - `src/webview/`
  - `tests/`
- **Documentation Target**:
  - `aidlc-docs/construction/navigator-and-preview-ui/code/`

## Generation Strategy

- Brownfield migration: extend the current extension scaffold in place rather than introducing parallel UI stacks.
- Replace foundation placeholder behavior with typed navigator and preview runtime flows.
- Keep open-mode validation and render-model shaping on the host side, while React handles presentation and local interaction state.
- Preserve a clean seam for the next unit so answer-field editing can attach to preview rendering without reworking browsing and preview foundations.

## Detailed Steps

### Step 1. Prepare the runtime contracts and shared UI models
- [x] Review the existing foundation contracts, discovery/index shared types, and rendered preview placeholder flow.
- [x] Extend `src/shared/` with navigator-specific actions, payloads, preview models, and capability-state types.
- [x] Keep the contract surface typed, version-aware, and aligned with stale-request rejection requirements.

### Step 2. Generate host-side navigator state projection and search logic
- [x] Add host-side logic that derives navigator readiness, grouped visibility, and filtered search projections from the active discovery state and runtime index.
- [x] Add pure or near-pure helpers for search normalization, group pruning, and document lookup.
- [x] Keep this logic independent from React rendering so it remains easy to test.

### Step 3. Upgrade the navigator host infrastructure
- [x] Modify the navigator host manager and webview providers under `src/extension/` so panel and side-view hosts can deliver real navigator state instead of foundation placeholders.
- [x] Add host-side message handling for search changes, raw-open requests, and preview-open requests.
- [x] Ensure host updates can reach both panel and side-view surfaces consistently.

### Step 4. Generate the React navigator UI
- [x] Replace the foundation-only webview app with navigator-focused React components under `src/webview/`.
- [x] Implement grouped tree rendering, search input, status states, and explicit raw/preview open actions.
- [x] Add stable `data-testid` coverage for interactive UI elements and major states.

### Step 5. Generate host-side open flows for raw tabs and rendered preview tabs
- [x] Add raw-open integration that resolves a selected runtime document back to the workspace markdown file and opens it in a normal editor tab.
- [x] Add preview-open integration that validates document identity and routes to the rendered preview provider.
- [x] Preserve explicit open modes and fail closed when the active index no longer matches the request.

### Step 6. Replace the rendered preview placeholder with a real preview model pipeline
- [x] Extend the rendered preview provider with host-side preview model construction based on the active index and selected document.
- [x] Add preview block classification and capability-gated rendering inputs for markdown, code, Mermaid, and fallback states.
- [x] Generate the preview-side React UI and secure webview HTML shell needed to display rendered document metadata and content.

### Step 7. Generate unit tests for navigator and preview behavior
- [x] Add tests for navigator state projection, search filtering, group pruning, and stale-request validation.
- [x] Add tests for preview model shaping and block-classification or fallback behavior where the logic is sufficiently isolated.
- [x] Keep tests aligned with Partial PBT expectations by covering invariant-friendly seams, while deferring broader execution strategy to Build and Test.

### Step 8. Validate brownfield safety and packaging direction
- [x] Verify the unit modifies the existing extension structure in place without creating duplicate brownfield files.
- [x] Verify new UI dependencies and assets remain compatible with secure VS Code webview packaging expectations.
- [x] Verify the resulting unit leaves clear extension points for the later answer-editing and refresh units.

### Step 9. Produce code-generation summaries for this unit
- [x] Create markdown summaries in `aidlc-docs/construction/navigator-and-preview-ui/code/` covering modified files, created files, and test scope.
- [x] Capture how this unit closes US-07 through US-11 and what remains intentionally deferred to later units.

## Story Traceability

- **US-07**: Closed by grouped navigator state derivation and tree rendering.
- **US-08**: Closed by in-memory search projection and filtered visible tree behavior.
- **US-09**: Closed by validated raw-open actions that open workspace-backed markdown tabs.
- **US-10**: Closed by validated preview-open flows and rendered preview tabs.
- **US-11**: Closed by preview-model construction and rendering support for code, Mermaid, and safe fallbacks.

## Plan Notes

- Total planned generation steps: 9
- Highest-impact changes in this unit are concentrated in shared contracts, host/webview messaging, navigator React UI, and the rendered preview provider.
- This unit intentionally stops short of implementing answer-field editing, save-back persistence, automatic refresh coordination, and bootstrap setup logic.
