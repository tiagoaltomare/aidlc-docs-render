import { access } from "node:fs/promises";

const requiredFiles = [
  "dist/extension/index.js",
  "dist/webview/navigator.js",
  "dist/webview/preview.js",
  "package.json"
];

for (const file of requiredFiles) {
  await access(file);
}

console.log("Extension packaging prerequisites are present.");
