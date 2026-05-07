# Build Instructions

## Prerequisites

- **Build Tool**: `npm` with the repository `package.json` scripts
- **Dependencies**:
  - Node.js compatible with the repository toolchain
  - project dependencies from `package.json`
  - local TypeScript compiler from the installed dependencies
- **Environment Variables**: None required for the baseline local build
- **System Requirements**:
  - workspace access to `C:\Users\tiagoa\Source\aidlc-docs-render`
  - write access to `dist/` and `dist-tests/`
  - enough disk space for build outputs and installed dependencies

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify Local Toolchain

```bash
npx tsc --version
```

- If this fails, the local TypeScript toolchain is not available yet.
- In the current review environment, `tsc` was not available on the path, so build validation could not be executed here.

### 3. Build Extension and Webview Bundles

```bash
npm run build
```

### 4. Verify Build Success

- **Expected Output**:
  - extension host bundle at `dist/extension/index.js`
  - navigator bundle at `dist/webview/navigator.js`
  - preview bundle at `dist/webview/preview.js`
- **Build Artifacts**:
  - `dist/extension/index.js`
  - `dist/webview/navigator.js`
  - `dist/webview/preview.js`
- **Common Warnings**:
  - standard bundler warnings may appear, but missing output files are not acceptable

### 5. Validate Packaging Prerequisites

```bash
npm run package:check
```

- This checks the presence of the expected extension and webview build artifacts.

### 6. Package a Tester Build

```bash
npx @vscode/vsce package
```

- This generates a distributable `.vsix` file in the workspace root.
- Use the detailed handoff checklist in `aidlc-docs/construction/build-and-test/vsix-distribution-instructions.md` before sending the package to testers.

## Troubleshooting

### Build Fails with Missing `tsc`

- **Cause**: Dependencies were not installed or the local toolchain is unavailable.
- **Solution**:
  1. Run `npm install`
  2. Re-run `npx tsc --version`
  3. Retry `npm run build`

### Build Fails with Missing Output Artifacts

- **Cause**: Build did not complete successfully or one of the entry points is broken.
- **Solution**:
  1. Re-run `npm run build`
  2. Check the failing entry point in `scripts/build.mjs`
  3. Confirm the corresponding source file still exists under `src/extension/` or `src/webview/`
