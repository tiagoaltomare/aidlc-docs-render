import React from "react";
import { FoundationHostStatePayload } from "../../shared/contracts";

interface AppProps {
  readonly state: FoundationHostStatePayload;
}

function statusLabel(lifecycle: string): string {
  return lifecycle.replace(/-/g, " ");
}

export function App({ state }: AppProps): React.JSX.Element {
  const { runtimeStatus } = state;

  return (
    <main
      data-testid="foundation-host-shell"
      style={{
        color: "var(--vscode-editor-foreground)",
        background: "var(--vscode-editor-background)",
        fontFamily: "var(--vscode-font-family)",
        minHeight: "100vh",
        padding: "16px"
      }}
    >
      <section
        data-testid="foundation-status-boundary"
        style={{
          border: "1px solid var(--vscode-panel-border)",
          borderRadius: "10px",
          padding: "16px",
          display: "grid",
          gap: "12px"
        }}
      >
        <header style={{ display: "grid", gap: "4px" }}>
          <strong data-testid="foundation-host-type-label">
            Host: {state.hostType}
          </strong>
          <span data-testid="foundation-runtime-status-label">
            Runtime: {statusLabel(runtimeStatus.lifecycle)}
          </span>
        </header>

        <div>
          <strong>Ready capabilities</strong>
          <ul data-testid="foundation-ready-capabilities">
            {runtimeStatus.readyCapabilities.length > 0 ? (
              runtimeStatus.readyCapabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))
            ) : (
              <li>None yet</li>
            )}
          </ul>
        </div>

        <div>
          <strong>Degraded capabilities</strong>
          <ul data-testid="foundation-degraded-capabilities">
            {runtimeStatus.degradedCapabilities.length > 0 ? (
              runtimeStatus.degradedCapabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>

        <div>
          <strong>Blocking failures</strong>
          <ul data-testid="foundation-blocking-failures">
            {runtimeStatus.blockingFailures.length > 0 ? (
              runtimeStatus.blockingFailures.map((failure) => (
                <li key={failure}>{failure}</li>
              ))
            ) : (
              <li>None</li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
