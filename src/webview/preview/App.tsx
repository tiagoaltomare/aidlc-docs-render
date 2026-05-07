import mermaid from "mermaid";
import React, { useEffect, useId, useState } from "react";
import { HOST_TO_WEBVIEW_ACTIONS } from "../../shared/contracts";
import { PreviewHostStatePayload, PreviewRenderBlock } from "../../shared/preview";
import { AnswerFieldDescriptor } from "../../shared/answers";

interface AppProps {
  readonly initialState: PreviewHostStatePayload;
  readonly vscodeApi: {
    postMessage: (message: { action: string; payload?: Record<string, unknown> }) => void;
  };
}

let mermaidInitialized = false;

function ensureMermaid(): void {
  if (mermaidInitialized) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base"
  });
  mermaidInitialized = true;
}

export function App({ initialState, vscodeApi }: AppProps): React.JSX.Element {
  const [state, setState] = useState(initialState);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => toFieldValueMap(initialState.preview.answerExtraction.fields));

  useEffect(() => {
    const handler = (event: MessageEvent<{ action?: string; payload?: PreviewHostStatePayload }>) => {
      if (event.data?.action !== HOST_TO_WEBVIEW_ACTIONS.previewStateChanged || !event.data.payload) {
        return;
      }

      setState(event.data.payload);
      if (event.data.payload.saveState.status !== "saving" && event.data.payload.saveState.status !== "failed") {
        setFieldValues(toFieldValueMap(event.data.payload.preview.answerExtraction.fields));
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const updates = state.preview.answerExtraction.fields.map((field) => ({
    fieldId: field.fieldId,
    value: fieldValues[field.fieldId] ?? field.originalValue
  }));

  const dirty = updates.some((update) => {
    const field = state.preview.answerExtraction.fields.find((candidate) => candidate.fieldId === update.fieldId);
    return field ? field.originalValue !== update.value : false;
  });

  return (
    <main style={styles.shell} data-testid="preview-host-shell">
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Rendered Preview</div>
          <h1 style={styles.title}>{state.preview.title}</h1>
          <div style={styles.meta}>
            <span data-testid="preview-relative-path">{state.preview.relativePath}</span>
            <span data-testid="preview-phase">{state.preview.phase}</span>
          </div>
        </div>
        <div style={styles.runtimeBadge} data-testid="preview-runtime-status">
          {state.runtimeStatus.lifecycle} / {state.syncState.lifecycle}
        </div>
      </header>

      {state.availability.message ? (
        <section style={styles.notice} data-testid="preview-availability-notice">
          <strong>Preview status: {state.availability.status}</strong>
          <p style={{ margin: "6px 0 0" }}>{state.availability.message}</p>
        </section>
      ) : null}

      {state.preview.capabilityState.hostLimitations.length > 0 ? (
        <section style={styles.notice} data-testid="preview-limitations">
          {state.preview.capabilityState.hostLimitations.map((limitation) => (
            <p key={limitation} style={{ margin: 0 }}>{limitation}</p>
          ))}
        </section>
      ) : null}

      <section style={styles.saveBar} data-testid="preview-save-bar">
        <div>
          <strong data-testid="preview-save-state-label">Save state: {state.saveState.status}</strong>
          <p style={styles.saveMessage}>
            {state.saveState.message
              ?? state.availability.message
              ?? (dirty ? "You have unsaved answer changes." : "Answer fields are up to date.")}
          </p>
          <p style={styles.modeMessage} data-testid="preview-editing-mode-notice">
            Preview editing is limited to standalone answer fields. Use the raw markdown tab for broader document edits.
          </p>
        </div>
        <button
          type="button"
          data-testid="preview-save-answer-edits-button"
          style={dirty ? styles.primaryButton : styles.secondaryButton}
          disabled={!dirty || state.saveState.status === "saving" || state.availability.status !== "current"}
          onClick={() => {
            vscodeApi.postMessage({
              action: "preview.save-answer-edits",
              payload: {
                relativePath: state.preview.relativePath,
                expectedIndexVersion: state.preview.activeIndexVersion ?? -1,
                fieldValues: updates
              }
            });
          }}
        >
          {state.saveState.status === "saving" ? "Saving..." : "Save Answers"}
        </button>
      </section>

      <section style={styles.content}>
        {state.preview.renderBlocks.map((block) => (
          <PreviewBlock
            key={block.id}
            block={block}
            answerFields={state.preview.answerExtraction.fields}
            fieldValues={fieldValues}
            disabled={state.saveState.status === "saving"}
            onFieldChange={(fieldId, value) => {
              setFieldValues((current) => ({
                ...current,
                [fieldId]: value
              }));
            }}
          />
        ))}
      </section>
    </main>
  );
}

function PreviewBlock({
  block,
  answerFields,
  fieldValues,
  disabled,
  onFieldChange
}: {
  readonly block: PreviewRenderBlock;
  readonly answerFields: readonly AnswerFieldDescriptor[];
  readonly fieldValues: Record<string, string>;
  readonly disabled: boolean;
  readonly onFieldChange: (fieldId: string, value: string) => void;
}): React.JSX.Element {
  if (block.kind === "heading") {
    const level = Math.min(Math.max(block.level ?? 2, 1), 6);
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    return <Tag style={styles[`heading${level}`]}>{block.text}</Tag>;
  }

  if (block.kind === "paragraph") {
    return <p style={styles.paragraph}>{block.text}</p>;
  }

  if (block.kind === "list") {
    return (
      <ul style={styles.list}>
        {(block.items ?? []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.kind === "code") {
    return (
      <section style={styles.codeCard} data-testid="preview-code-block">
        <div style={styles.codeHeader}>{block.language ?? "text"}</div>
        <pre style={styles.pre}>
          <code>{block.source}</code>
        </pre>
      </section>
    );
  }

  if (block.kind === "mermaid") {
    return <MermaidBlock block={block} />;
  }

  if (block.kind === "answer") {
    const field = answerFields.find((candidate) => candidate.fieldId === block.answerFieldId);
    if (!field) {
      return <PreviewFallbackNotice message="This answer field could not be resolved safely." />;
    }

    return (
      <section style={styles.answerCard} data-testid={`preview-answer-field-${field.fieldId}`}>
        <label style={styles.answerLabel} htmlFor={field.fieldId}>
          Answer
        </label>
        <textarea
          id={field.fieldId}
          data-testid={`preview-answer-input-${field.fieldId}`}
          style={styles.answerInput}
          value={fieldValues[field.fieldId] ?? field.originalValue}
          disabled={disabled}
          placeholder="Fill in the workflow response here"
          onChange={(event) => onFieldChange(field.fieldId, event.target.value)}
        />
      </section>
    );
  }

  return <PreviewFallbackNotice message={block.fallbackMessage ?? "This block could not be rendered safely."} />;
}

function MermaidBlock({ block }: { readonly block: PreviewRenderBlock }): React.JSX.Element {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    block.renderStatus === "fallback" ? block.fallbackMessage ?? "Mermaid preview is unavailable." : null
  );
  const blockUid = useId().replace(/:/g, "-");

  useEffect(() => {
    let disposed = false;

    if (block.renderStatus === "fallback") {
      setSvg(null);
      setError(block.fallbackMessage ?? "Mermaid preview is unavailable.");
      return () => {
        disposed = true;
      };
    }

    ensureMermaid();
    setSvg(null);
    setError(null);

    void mermaid
      .render(`aidlc-mermaid-${blockUid}-${block.id}`, block.source ?? "")
      .then(({ svg: renderedSvg }) => {
        if (!disposed) {
          setSvg(renderedSvg);
        }
      })
      .catch((renderError) => {
        if (!disposed) {
          setError(
            renderError instanceof Error
              ? `Mermaid could not render this diagram safely. ${renderError.message}`
              : "Mermaid could not render this diagram safely."
          );
        }
      });

    return () => {
      disposed = true;
    };
  }, [block.fallbackMessage, block.id, block.renderStatus, block.source, blockUid]);

  return (
    <section style={styles.codeCard} data-testid="preview-mermaid-block">
      <div style={styles.codeHeader}>mermaid</div>
      {error ? <PreviewFallbackNotice message={error} /> : null}
      {svg ? (
        <div
          style={styles.mermaidWrap}
          data-testid="preview-mermaid-rendered"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre style={styles.pre}>
          <code>{block.source}</code>
        </pre>
      )}
    </section>
  );
}

function PreviewFallbackNotice({ message }: { readonly message: string }): React.JSX.Element {
  return (
    <div style={styles.notice} data-testid="preview-fallback-notice">
      <strong>Preview fallback</strong>
      <p style={{ margin: "6px 0 0" }}>{message}</p>
    </div>
  );
}

function toFieldValueMap(fields: readonly AnswerFieldDescriptor[]): Record<string, string> {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.fieldId] = field.currentValue;
    return accumulator;
  }, {});
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    padding: 24,
    background: "linear-gradient(180deg, rgba(13,148,136,0.12), transparent 24%), var(--vscode-editor-background)",
    color: "var(--vscode-editor-foreground)",
    fontFamily: "var(--vscode-font-family)",
    display: "grid",
    gap: 18
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
    margin: "6px 0 8px",
    fontSize: 30
  },
  meta: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 12,
    color: "var(--vscode-descriptionForeground)"
  },
  runtimeBadge: {
    fontSize: 12,
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 999,
    padding: "6px 10px",
    color: "var(--vscode-descriptionForeground)"
  },
  content: {
    display: "grid",
    gap: 14
  },
  paragraph: {
    margin: 0,
    lineHeight: 1.6
  },
  list: {
    margin: 0,
    paddingLeft: 22,
    lineHeight: 1.6
  },
  codeCard: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 14,
    overflow: "hidden",
    background: "rgba(0,0,0,0.18)"
  },
  codeHeader: {
    padding: "8px 12px",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--vscode-descriptionForeground)",
    borderBottom: "1px solid var(--vscode-panel-border)"
  },
  pre: {
    margin: 0,
    padding: 16,
    overflowX: "auto",
    fontFamily: "var(--vscode-editor-font-family)"
  },
  mermaidWrap: {
    padding: 16,
    overflowX: "auto",
    background: "rgba(255,255,255,0.02)"
  },
  notice: {
    border: "1px solid rgba(245, 158, 11, 0.45)",
    background: "rgba(245, 158, 11, 0.12)",
    borderRadius: 12,
    padding: 12
  },
  saveBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 12,
    padding: 14,
    background: "rgba(255,255,255,0.03)"
  },
  saveMessage: {
    margin: "6px 0 0",
    color: "var(--vscode-descriptionForeground)"
  },
  modeMessage: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "var(--vscode-descriptionForeground)"
  },
  primaryButton: {
    border: "1px solid transparent",
    borderRadius: 999,
    padding: "8px 14px",
    background: "var(--vscode-button-background)",
    color: "var(--vscode-button-foreground)",
    cursor: "pointer",
    minWidth: 120
  },
  secondaryButton: {
    border: "1px solid var(--vscode-panel-border)",
    borderRadius: 999,
    padding: "8px 14px",
    background: "transparent",
    color: "var(--vscode-descriptionForeground)",
    cursor: "not-allowed",
    minWidth: 120
  },
  answerCard: {
    border: "1px solid rgba(14, 165, 233, 0.32)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(14, 165, 233, 0.08)",
    display: "grid",
    gap: 8
  },
  answerLabel: {
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--vscode-descriptionForeground)"
  },
  answerInput: {
    width: "100%",
    minHeight: 110,
    padding: 12,
    borderRadius: 10,
    border: "1px solid var(--vscode-input-border)",
    background: "var(--vscode-input-background)",
    color: "var(--vscode-input-foreground)",
    resize: "vertical",
    fontFamily: "var(--vscode-font-family)"
  },
  heading1: { margin: "0 0 8px", fontSize: 34 },
  heading2: { margin: "0 0 8px", fontSize: 28 },
  heading3: { margin: "0 0 8px", fontSize: 22 },
  heading4: { margin: "0 0 8px", fontSize: 18 },
  heading5: { margin: "0 0 8px", fontSize: 16 },
  heading6: { margin: "0 0 8px", fontSize: 14 }
};
