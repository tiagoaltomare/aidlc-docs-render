import { build } from "esbuild";

const shared = {
  bundle: true,
  sourcemap: true,
  target: "es2022",
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": "\"production\""
  }
};

await build({
  ...shared,
  platform: "node",
  format: "cjs",
  external: ["vscode"],
  entryPoints: ["src/extension/index.ts"],
  outfile: "dist/extension/index.js"
});

await build({
  ...shared,
  platform: "browser",
  format: "iife",
  entryPoints: ["src/webview/navigator/index.tsx"],
  outfile: "dist/webview/navigator.js"
});

await build({
  ...shared,
  platform: "browser",
  format: "iife",
  entryPoints: ["src/webview/preview/index.tsx"],
  outfile: "dist/webview/preview.js"
});
