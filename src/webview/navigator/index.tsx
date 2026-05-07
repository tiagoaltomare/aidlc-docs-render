import React from "react";
import { createRoot } from "react-dom/client";
import { NavigatorHostStatePayload } from "../../shared/navigator";
import { App } from "./App";

declare global {
  interface Window {
    __AIDLC_NAVIGATOR_STATE__?: NavigatorHostStatePayload;
    acquireVsCodeApi?: () => {
      postMessage: (message: { action: string; payload?: Record<string, unknown> }) => void;
    };
  }
}

const rootElement = document.getElementById("root");

if (rootElement && window.__AIDLC_NAVIGATOR_STATE__) {
  const root = createRoot(rootElement);
  const vscodeApi = window.acquireVsCodeApi ? window.acquireVsCodeApi() : { postMessage: () => undefined };

  root.render(
    <React.StrictMode>
      <App initialState={window.__AIDLC_NAVIGATOR_STATE__} vscodeApi={vscodeApi} />
    </React.StrictMode>
  );
}
