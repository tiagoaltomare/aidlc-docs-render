import React, { useEffect, useMemo, useState } from "react";
import { HOST_TO_WEBVIEW_ACTIONS } from "../../shared/contracts";
import {
  NavigatorDocumentSummary,
  NavigatorGroupView,
  NavigatorHostStatePayload,
  NAVIGATOR_VIEW_MODES
} from "../../shared/navigator";

interface AppProps {
  readonly initialState: NavigatorHostStatePayload;
  readonly vscodeApi: {
    postMessage: (message: { action: string; payload?: Record<string, unknown> }) => void;
  };
}

export function App({ initialState, vscodeApi }: AppProps): React.JSX.Element {
  const [state, setState] = useState(initialState);
  const [query, setQuery] = useState(initialState.navigator.searchQuery);

  useEffect(() => {
    const handler = (event: MessageEvent<{ action?: string; payload?: NavigatorHostStatePayload }>) => {
      if (event.data?.action !== HOST_TO_WEBVIEW_ACTIONS.navigatorStateChanged || !event.data.payload) {
        return;
      }

      setState(event.data.payload);
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setQuery(state.navigator.searchQuery);
  }, [state.navigator.searchQuery]);

  const documentCount = useMemo(
    () => countDocuments(state.navigator.groups),
    [state.navigator.groups]
  );

  return (
    <main style={styles.shell} data-testid="navigator-host-shell">
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>AIDLC Navigator</div>
          <h1 style={styles.title}>{state.hostType === "panel" ? "Panel" : "Side View"}</h1>
          <p style={styles.subtitle}>{state.navigator.statusMessage}</p>
        </div>
        <div style={styles.metrics}>
          <span data-testid="navigator-runtime-label">Runtime: {state.runtimeStatus.lifecycle}</span>
          <span data-testid="navigator-sync-label">Sync: {state.navigator.syncState.lifecycle}</span>
          <span data-testid="navigator-document-count">{documentCount} docs</span>
        </div>
      </header>

      <section style={styles.searchCard}>
        <label htmlFor="navigator-search-input" style={styles.label}>Search docs</label>
        <div style={styles.searchRow}>
          <input
            id="navigator-search-input"
            data-testid="navigator-search-input"
            style={styles.input}
            value={query}
            placeholder="Filter by title or path"
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              vscodeApi.postMessage({
                action: "navigator.search-query-changed",
                payload: { query: nextQuery }
              });
            }}
          />
          <button
            type="button"
            data-testid="navigator-clear-search-button"
            style={styles.secondaryButton}
            onClick={() => {
              setQuery("");
              vscodeApi.postMessage({
                action: "navigator.search-query-changed",
                payload: { query: "" }
              });
            }}
          >
            Clear
          </button>
        </div>
        <div style={styles.searchMeta}>
          <span>Root: {state.navigator.activeRootPath ?? "Not selected"}</span>
          <div style={styles.metaActions}>
            <button
              type="button"
              data-testid="navigator-refresh-button"
              style={styles.linkButton}
              onClick={() => {
                vscodeApi.postMessage({ action: "navigator.refresh-runtime" });
              }}
            >
              Refresh
            </button>
            <button
              type="button"
              data-testid="navigator-readiness-button"
              style={styles.linkButton}
              onClick={() => {
                vscodeApi.postMessage({ action: "navigator.run-delivery-readiness-check" });
              }}
            >
              Delivery Readiness
            </button>
            <button
              type="button"
              data-testid="navigator-select-docs-root-button"
              style={styles.linkButton}
              onClick={() => {
                vscodeApi.postMessage({ action: "navigator.select-docs-root" });
              }}
            >
              Choose docs root
            </button>
          </div>
        </div>
      </section>

      {state.navigator.mode === NAVIGATOR_VIEW_MODES.ready ? (
        <section data-testid="navigator-tree" style={styles.treeSection}>
          {state.navigator.groups.map((group) => (
            <NavigationGroupNode
              key={group.id}
              group={group}
              indexVersion={state.navigator.activeIndexVersion}
              vscodeApi={vscodeApi}
            />
          ))}
        </section>
      ) : (
        <NavigatorStatusPanel
          mode={state.navigator.mode}
          statusMessage={state.navigator.statusMessage}
          onSelectDocsRoot={() => {
            vscodeApi.postMessage({ action: "navigator.select-docs-root" });
          }}
        />
      )}
    </main>
  );
}

function NavigationGroupNode({
  group,
  indexVersion,
  vscodeApi
}: {
  readonly group: NavigatorGroupView;
  readonly indexVersion: number | null;
  readonly vscodeApi: AppProps["vscodeApi"];
}): React.JSX.Element {
  const testId = toTestId(group.id);

  return (
    <details open style={styles.groupCard} data-testid={`${testId}-group`}>
      <summary style={styles.summary}>
        <span>{group.label}</span>
        <span style={styles.groupHint}>{group.type}</span>
      </summary>

      {group.documents.length > 0 ? (
        <ul style={styles.documentList}>
          {group.documents.map((document) => (
            <DocumentRow
              key={document.relativePath}
              document={document}
              indexVersion={indexVersion}
              vscodeApi={vscodeApi}
            />
          ))}
        </ul>
      ) : null}

      {group.children.length > 0 ? (
        <div style={styles.childGroups}>
          {group.children.map((child) => (
            <NavigationGroupNode
              key={child.id}
              group={child}
              indexVersion={indexVersion}
              vscodeApi={vscodeApi}
            />
          ))}
        </div>
      ) : null}
    </details>
  );
}

function DocumentRow({
  document,
  indexVersion,
  vscodeApi
}: {
  readonly document: NavigatorDocumentSummary;
  readonly indexVersion: number | null;
  readonly vscodeApi: AppProps["vscodeApi"];
}): React.JSX.Element {
  const testId = toTestId(document.relativePath);
  const payload = {
    relativePath: document.relativePath,
    expectedIndexVersion: indexVersion ?? -1
  };

  return (
    <li style={styles.documentRow} data-testid={`${testId}-row`}>
      <div>
        <strong>{document.title}</strong>
        <div style={styles.documentPath}>{document.relativePath}</div>
      </div>
      <div style={styles.actionRow}>
        <button
          type="button"
          data-testid={`${testId}-raw-button`}
          style={styles.secondaryButton}
          onClick={() => {
            vscodeApi.postMessage({
              action: "navigator.open-raw-document",
              payload
            });
          }}
        >
          Raw
        </button>
        <button
          type="button"
          data-testid={`${testId}-preview-button`}
          style={styles.primaryButton}
          onClick={() => {
            vscodeApi.postMessage({
              action: "navigator.open-preview-document",
              payload
            });
          }}
        >
          Preview
        </button>
      </div>
    </li>
  );
}

function NavigatorStatusPanel({
  mode,
  statusMessage,
  onSelectDocsRoot
}: {
  readonly mode: string;
  readonly statusMessage: string;
  readonly onSelectDocsRoot: () => void;
}): React.JSX.Element {
  return (
    <section style={styles.statusPanel} data-testid="navigator-status-panel">
      <strong>Status: {mode}</strong>
      <p>{statusMessage}</p>
      <button
        type="button"
        data-testid="navigator-status-select-root-button"
        style={styles.primaryButton}
        onClick={onSelectDocsRoot}
      >
        Choose docs root
      </button>
    </section>
  );
}

function countDocuments(groups: readonly NavigatorGroupView[]): number {
  return groups.reduce((count, group) => {
    return count + group.documents.length + countDocuments(group.children);
  }, 0);
}

function toTestId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    padding: 20,
    background: "linear-gradient(180deg, rgba(31,41,55,0.12), transparent 28%), var(--vscode-sideBar-background)",
    color: "var(--vscode-foreground)",
    fontFamily: "var(--vscode-font-family)",
    display: "grid",
    gap: 16
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start"
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--vscode-descriptionForeground)"
  },
  title: {
    margin: "4px 0 8px",
    fontSize: 28
  },
  subtitle: {
    margin: 0,
    color: "var(--vscode-descriptionForeground)"
  },
  metrics: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    color: "var(--vscode-descriptionForeground)"
  },
  searchCard: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 14,
    padding: 14,
    display: "grid",
    gap: 10,
    background: "rgba(255,255,255,0.02)"
  },
  label: {
    fontWeight: 600
  },
  searchRow: {
    display: "flex",
    gap: 8
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--vscode-input-border)",
    background: "var(--vscode-input-background)",
    color: "var(--vscode-input-foreground)"
  },
  searchMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    fontSize: 12,
    color: "var(--vscode-descriptionForeground)"
  },
  metaActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap"
  },
  treeSection: {
    display: "grid",
    gap: 10
  },
  groupCard: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 12,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.02)"
  },
  summary: {
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600
  },
  groupHint: {
    fontSize: 12,
    color: "var(--vscode-descriptionForeground)",
    textTransform: "uppercase"
  },
  documentList: {
    listStyle: "none",
    padding: 0,
    margin: "12px 0 0",
    display: "grid",
    gap: 8
  },
  childGroups: {
    marginTop: 12,
    display: "grid",
    gap: 8
  },
  documentRow: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 10,
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center"
  },
  documentPath: {
    fontSize: 12,
    color: "var(--vscode-descriptionForeground)",
    marginTop: 4
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  primaryButton: {
    border: "1px solid transparent",
    borderRadius: 999,
    padding: "8px 12px",
    background: "var(--vscode-button-background)",
    color: "var(--vscode-button-foreground)",
    cursor: "pointer"
  },
  secondaryButton: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "transparent",
    color: "var(--vscode-foreground)",
    cursor: "pointer"
  },
  linkButton: {
    border: "none",
    background: "transparent",
    color: "var(--vscode-textLink-foreground)",
    cursor: "pointer",
    padding: 0
  },
  statusPanel: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 14,
    padding: 16,
    display: "grid",
    gap: 12,
    background: "rgba(255,255,255,0.02)"
  }
};
