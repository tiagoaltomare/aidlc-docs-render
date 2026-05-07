# Navigator and Preview UI Code Summary

## Unit Outcome

The repository now contains a real navigator and rendered-preview experience on top of the extension foundation and runtime discovery index. The panel and side-view hosts consume live navigator state, the webview UI supports search plus raw/preview open modes, and the custom editor preview renders structured markdown blocks with dedicated code and Mermaid handling paths.

## Modified Application Files

- `scripts/build.mjs`
  - Replaced the foundation-only browser bundle output with navigator and preview bundles.
- `src/shared/contracts.ts`
  - Replaced the foundation placeholder message actions with navigator and preview runtime message actions.
- `src/shared/runtimeContracts.ts`
  - Updated contract metadata to reflect search, open, select-root, and preview-state message flows.
- `src/shared/documents.ts`
  - Simplified phase derivation logic used by fallback preview metadata.
- `src/extension/activation.ts`
  - Wired host-side navigator actions, raw-open flow, preview-open flow, preview provider runtime access, and host-state synchronization.
- `src/extension/renderedPreviewProvider.ts`
  - Replaced the placeholder HTML with a React-backed rendered preview pipeline and document-change updates.
- `src/extension/webview/renderWebviewHtml.ts`
  - Generalized webview HTML rendering for multiple React bundles and bootstrap payloads.
- `src/extension/webview/navigatorPanelProvider.ts`
  - Upgraded the panel host from placeholder HTML to a message-driven navigator webview.
- `src/extension/webview/navigatorSideViewProvider.ts`
  - Upgraded the side view from placeholder HTML to a message-driven navigator webview.
- `src/extension/webview/navigatorHostManager.ts`
  - Added shared host-state projection, search-query state, and delegated raw/preview/select-root action handling.
- `tests/shared/contracts.test.ts`
  - Updated contract coverage for the new navigator/preview action names.

## Created Application Files

- `src/shared/navigator.ts`
  - Shared navigator payload types and pure helpers for state derivation, search filtering, and stale-request validation.
- `src/shared/preview.ts`
  - Shared preview payload types and pure helpers for preview model building and block classification.
- `src/webview/navigator/App.tsx`
  - React navigator UI with grouped browsing, search, status states, and raw/preview actions.
- `src/webview/navigator/index.tsx`
  - Navigator bundle bootstrap and VS Code webview message hookup.
- `src/webview/preview/App.tsx`
  - React rendered-preview UI with metadata, block rendering, and localized fallback notices.
- `src/webview/preview/index.tsx`
  - Preview bundle bootstrap and host update handling.
- `tests/shared/navigator.test.ts`
  - Tests for search normalization, navigator projection, and stale open-request validation.
- `tests/shared/preview.test.ts`
  - Tests for preview block classification, Mermaid fallback, and preview identity preservation.

## Test Scope

- Navigator state derivation
- Search filtering and group pruning behavior
- Open-request version validation
- Preview block classification
- Mermaid fallback behavior
- Preview identity metadata preservation

## Notes

- Build and automated test execution were not run in this stage.
- Mermaid support is now explicitly modeled and rendered through a dedicated preview path, but it still falls back to a safe source presentation until a bundled diagram runtime is added in a later refinement.
