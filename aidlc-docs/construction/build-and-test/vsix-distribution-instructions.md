# VSIX Distribution Instructions

## Purpose

Create a distributable `.vsix` package that testers can install directly in VS Code 1.117+.

## Prerequisites

- Node.js available locally
- project dependencies installed with `npm install`
- local TypeScript toolchain working
- successful extension build artifacts under `dist/`
- successful packaging prerequisite check

## Recommended Packaging Flow

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify the Toolchain

```bash
npx tsc --version
```

If this step fails, stop here and fix the local environment before attempting packaging.

### 3. Build the Extension

```bash
npm run build
```

### 4. Validate Expected Build Outputs

```bash
npm run package:check
```

This should confirm the presence of:

- `dist/extension/index.js`
- `dist/webview/navigator.js`
- `dist/webview/preview.js`

### 5. Run the Automated Test Gate

```bash
npm test
```

For tester distribution, the `.vsix` should only be generated after the build and tests pass.

### 6. Create the VSIX Package

Use the VS Code extension packaging tool:

```bash
npx @vscode/vsce package
```

Expected result:

- a file like `aidlc-docs-render-1.0.0.vsix` in the workspace root

If `vsce` is not available yet, the `npx` form above is the preferred path because it does not require a permanent global install.

## What to Send to Testers

Provide testers with:

- the generated `.vsix` file
- the targeted VS Code version baseline: `1.117+`
- a short install note:

```text
Open VS Code -> Extensions -> More Actions (...) -> Install from VSIX... -> select the provided file.
```

- a short usage note:
  - open a workspace
  - run the AIDLC commands from the Command Palette
  - use guided setup first if the repository is not initialized yet

## Recommended Release Checklist

Before sending the package to testers, confirm:

1. `npm run build` succeeded
2. `npm test` succeeded
3. `npm run package:check` succeeded
4. the `.vsix` file was generated successfully
5. the package installs in a clean VS Code profile
6. the navigator, preview, answer editing, setup, and refresh flows smoke-test successfully

## Troubleshooting

### `tsc` Not Found

- Run `npm install`
- Re-run `npx tsc --version`
- If needed, remove `node_modules` and install again

### `vsce` Packaging Fails

- Verify `package.json` still points to `./dist/extension/index.js`
- Confirm the build artifacts exist under `dist/`
- Re-run `npm run build`
- Re-run `npm run package:check`

### VSIX Installs but Extension Does Not Activate

- Confirm the package was built after the latest code changes
- Re-test the `.vsix` in a clean VS Code profile
- Check the activation events and contributed commands in `package.json`
