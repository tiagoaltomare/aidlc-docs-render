import React from "react";
import { createRoot } from "react-dom/client";
import { PreviewHostStatePayload } from "../../shared/preview";
import { App } from "./App";

declare global {
  interface Window {
    __AIDLC_PREVIEW_STATE__?: PreviewHostStatePayload;
    acquireVsCodeApi?: () => {
      postMessage: (message: { action: string; payload?: Record<string, unknown> }) => void;
    };
  }
}

const rootElement = document.getElementById("root");

if (rootElement && window.__AIDLC_PREVIEW_STATE__) {
  const root = createRoot(rootElement);
  const vscodeApi = window.acquireVsCodeApi ? window.acquireVsCodeApi() : { postMessage: () => undefined };
  root.render(
    <React.StrictMode>
      <App initialState={window.__AIDLC_PREVIEW_STATE__} vscodeApi={vscodeApi} />
    </React.StrictMode>
  );
}
