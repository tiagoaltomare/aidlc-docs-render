import * as vscode from "vscode";
import { AnswerFieldValueUpdate, AnswerSaveRequestPayload, rebuildMarkdownWithAnswers } from "../shared/answers";
import { derivePhase, deriveTitle, RuntimeDocumentIndex } from "../shared/documents";
import {
  buildPreviewDocumentModel,
  DEFAULT_PREVIEW_CAPABILITIES,
  PreviewHostStatePayload
} from "../shared/preview";
import { RuntimeStatusSnapshot, WebviewToHostMessage } from "../shared/contracts";
import { derivePreviewAvailability, RuntimeSyncState } from "../shared/refresh";
import { renderReactWebviewHtml } from "./webview/renderWebviewHtml";

export class RenderedPreviewProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = "aidlc.renderedPreview";
  private readonly openPreviews = new Map<string, { document: vscode.TextDocument; panel: vscode.WebviewPanel }>();

  public constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly getRuntimeStatus: () => RuntimeStatusSnapshot,
    private readonly getSyncState: () => RuntimeSyncState,
    private readonly getActiveIndex: () => RuntimeDocumentIndex | null,
    private readonly getDiscoveryState: () => { currentIndex: RuntimeDocumentIndex | null; lastValidIndex: RuntimeDocumentIndex | null },
    private readonly onSuccessfulSave: (documentPath: string) => Promise<void> | void
  ) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel
  ): Promise<void> {
    panel.webview.options = {
      enableScripts: true
    };

    const initialState = this.buildPreviewState(document);
    panel.webview.html = renderReactWebviewHtml(panel.webview, this.extensionUri, {
      title: "AIDLC Rendered Preview",
      bundleName: "preview.js",
      bootstrapVariable: "__AIDLC_PREVIEW_STATE__",
      state: initialState
    });
    this.openPreviews.set(document.uri.toString(), { document, panel });
    panel.webview.onDidReceiveMessage((message: WebviewToHostMessage) => {
      void this.handleMessage(document, panel, message);
    });

    const changeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.toString() !== document.uri.toString()) {
        return;
      }

      void panel.webview.postMessage({
        action: "preview.state-changed",
        payload: this.buildPreviewState(event.document)
      });
    });

    panel.onDidDispose(() => {
      changeSubscription.dispose();
      this.openPreviews.delete(document.uri.toString());
    });
  }

  public refreshOpenPreviews(): void {
    for (const preview of this.openPreviews.values()) {
      void preview.panel.webview.postMessage({
        action: "preview.state-changed",
        payload: this.buildPreviewState(preview.document)
      });
    }
  }

  private buildPreviewState(document: vscode.TextDocument): PreviewHostStatePayload {
    const activeIndex = this.getActiveIndex();
    const discoveryState = this.getDiscoveryState();
    const matchingRecord = activeIndex?.documents.find(
      (entry) => entry.absolutePath === document.uri.fsPath
    );

    const preview = buildPreviewDocumentModel(
      matchingRecord ?? {
        absolutePath: document.uri.fsPath,
        relativePath: document.uri.path.split("/").pop() ?? document.fileName,
        title: deriveTitle(document.getText(), document.fileName),
        phase: derivePhase(document.uri.path.split("/").pop() ?? document.fileName),
        section: null,
        subsection: null
      },
      document.getText(),
      activeIndex?.version ?? null,
      DEFAULT_PREVIEW_CAPABILITIES
    );

    return {
      runtimeStatus: this.getRuntimeStatus(),
      syncState: this.getSyncState(),
      availability: derivePreviewAvailability(
        discoveryState.currentIndex,
        discoveryState.lastValidIndex,
        document.uri.fsPath
      ),
      preview,
      saveState: {
        status: "idle",
        message: null
      }
    };
  }

  private async handleMessage(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel,
    message: WebviewToHostMessage
  ): Promise<void> {
    if (message.action !== "preview.save-answer-edits") {
      return;
    }

    const payload = toSavePayload(message.payload);
    const activeIndex = this.getActiveIndex();
    const matchingRecord = activeIndex?.documents.find(
      (entry) => entry.absolutePath === document.uri.fsPath
    );

    if (!matchingRecord || payload.expectedIndexVersion !== (activeIndex?.version ?? null) || payload.relativePath !== matchingRecord.relativePath) {
      void panel.webview.postMessage({
        action: "preview.state-changed",
        payload: {
          ...this.buildPreviewState(document),
          saveState: {
            status: "failed",
            message: "The preview is stale. Reopen the document or refresh before saving answer edits."
          }
        } satisfies PreviewHostStatePayload
      });
      return;
    }

    const currentState = this.buildPreviewState(document);
    void panel.webview.postMessage({
      action: "preview.state-changed",
      payload: {
        ...currentState,
        saveState: {
          status: "saving",
          message: "Saving answer edits..."
        }
      } satisfies PreviewHostStatePayload
    });

    const rebuild = this.rebuildMarkdown(currentState.preview.answerExtraction, payload.fieldValues);
    try {
      await vscode.workspace.fs.writeFile(document.uri, Buffer.from(rebuild.markdown, "utf8"));
      const reopened = await vscode.workspace.openTextDocument(document.uri);
      await this.onSuccessfulSave(document.uri.fsPath);
      void panel.webview.postMessage({
        action: "preview.state-changed",
        payload: {
          ...this.buildPreviewState(reopened),
          saveState: {
            status: "saved",
            message: "Answer edits saved to the workspace markdown file."
          }
        } satisfies PreviewHostStatePayload
      });
    } catch {
      void panel.webview.postMessage({
        action: "preview.state-changed",
        payload: {
          ...currentState,
          saveState: {
            status: "failed",
            message: "The answer edits could not be saved. Your unsaved values are still available in the preview."
          }
        } satisfies PreviewHostStatePayload
      });
    }
  }

  private rebuildMarkdown(
    extraction: PreviewHostStatePayload["preview"]["answerExtraction"],
    fieldValues: readonly AnswerFieldValueUpdate[]
  ): { markdown: string } {
    return rebuildMarkdownWithAnswers(extraction, fieldValues);
  }
}

function toSavePayload(payload: Record<string, unknown> | undefined): AnswerSaveRequestPayload {
  return {
    relativePath: String(payload?.relativePath ?? ""),
    expectedIndexVersion: Number(payload?.expectedIndexVersion ?? -1),
    fieldValues: Array.isArray(payload?.fieldValues)
      ? payload.fieldValues.map((item) => ({
          fieldId: String((item as { fieldId?: unknown }).fieldId ?? ""),
          value: String((item as { value?: unknown }).value ?? "")
        }))
      : []
  };
}
