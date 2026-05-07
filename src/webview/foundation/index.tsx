import React from "react";
import { createRoot } from "react-dom/client";
import { FoundationHostStatePayload } from "../../shared/contracts";
import { App } from "./App";

declare global {
  interface Window {
    __AIDLC_FOUNDATION_STATE__?: FoundationHostStatePayload;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App state={window.__AIDLC_FOUNDATION_STATE__!} />
    </React.StrictMode>
  );
}
