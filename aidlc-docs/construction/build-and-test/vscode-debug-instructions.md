# VS Code Debug Instructions

## Purpose

Run and debug the extension inside VS Code using an Extension Development Host.

## What Is Included

- a ready-to-use launch configuration at `.vscode/launch.json`
- source maps already enabled in `scripts/build.mjs`
- a pre-launch build step that rebuilds the extension before each debug session

## Prerequisites

1. Open the workspace in VS Code
2. Run `npm install`
3. Confirm the TypeScript toolchain is available:

```bash
npx tsc --version
```

If this check fails, debug sessions will not start correctly because the build step depends on the local toolchain.

## Start a Debug Session

1. Open the Run and Debug view in VS Code
2. Choose `Run AIDLC Extension`
3. Start the session
4. A new `Extension Development Host` window should open

This second window is where the extension is loaded and where you can test commands, views, preview tabs, refresh behavior, and setup flows.

## Recommended Debug Flow

### 1. Verify Activation

In the Extension Development Host:

1. Open the Command Palette
2. Run `AIDLC: Open Navigator Panel`
3. Confirm the extension activates and the AIDLC UI appears

Good first breakpoint locations:

- `src/extension/activation.ts`
- `src/extension/runtime/runtimeContext.ts`

### 2. Debug Discovery and Navigation

Use these breakpoints when validating docs discovery and tree state:

- `src/extension/discovery/discoveryService.ts`
- `src/extension/discovery/documentIndexBuilder.ts`
- `src/extension/webview/navigatorHostManager.ts`

Suggested scenario:

1. Open a workspace with `aidlc-docs`
2. Run `AIDLC: Select Docs Root` if auto-detection does not pick the expected root
3. Interact with navigator search and document open actions

### 3. Debug Rendered Preview and Answer Save

Use these breakpoints when validating rendered tabs and save-back behavior:

- `src/extension/renderedPreviewProvider.ts`
- `src/webview/preview/App.tsx`
- `src/shared/answers.ts`

Suggested scenario:

1. Open a markdown document in rendered preview mode
2. Edit a standalone `[Answer]:` field
3. Save through the preview flow
4. Confirm refresh and stale-state handling behave correctly

### 4. Debug Guided Setup and Refresh

Use these breakpoints when validating setup and sync behavior:

- `src/extension/bootstrap/bootstrapSetupService.ts`
- `src/extension/refresh/refreshCoordinator.ts`

Suggested scenario:

1. Run `AIDLC: Start Guided Setup`
2. Select an extracted AIDLC folder
3. Confirm copied files, rediscovery, and runtime refresh all happen in sequence

## Webview Debugging

The navigator and preview UIs run in webviews, so the extension-host debugger is not the whole story.

For webview-side debugging:

1. In the Extension Development Host, open the Command Palette
2. Run `Developer: Open Webview Developer Tools`
3. Use the browser devtools window to inspect:
   - React rendering
   - console logs
   - runtime errors in navigator or preview code

Useful webview entry points:

- `src/webview/navigator/App.tsx`
- `src/webview/preview/App.tsx`

## Common Debug Targets

- extension activation and command registration
- docs-root resolution
- index rebuild after refresh
- rendered preview model creation
- answer extraction and markdown rebuild
- bootstrap target planning
- delivery-readiness checks

## Troubleshooting

### Debug Session Fails Before Launch

Likely cause:

- local dependencies are missing
- `tsc` is unavailable
- the build step failed

Recommended fix:

1. Run `npm install`
2. Run `npm run build`
3. Retry the debug launch

### Breakpoints Do Not Bind

Likely cause:

- the build output is stale
- the build did not finish
- the session started before the current bundle was generated

Recommended fix:

1. Stop the debug session
2. Run `npm run build`
3. Start the debug session again

### Webview Looks Broken but Extension Host Seems Fine

Likely cause:

- the issue is in the navigator or preview bundle rather than the extension host

Recommended fix:

1. Open `Developer: Open Webview Developer Tools`
2. Inspect console errors there
3. Rebuild and restart the debug session after fixes
