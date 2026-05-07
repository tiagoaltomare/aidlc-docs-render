import * as vscode from "vscode";
import { WebviewToHostMessage } from "../../shared/contracts";
import { NavigatorHostStatePayload } from "../../shared/navigator";
import { renderReactWebviewHtml } from "./renderWebviewHtml";

export class NavigatorPanelProvider {
  private panel: vscode.WebviewPanel | undefined;

  public constructor(
    private readonly extensionUri: vscode.Uri,
    private state: NavigatorHostStatePayload,
    private readonly onMessage: (message: WebviewToHostMessage) => Promise<void> | void
  ) {}

  public revealOrCreate(
  ): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "aidlcNavigatorPanel",
      "AIDLC Navigator",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    this.panel.webview.options = {
      enableScripts: true
    };
    this.panel.webview.onDidReceiveMessage((message: WebviewToHostMessage) => {
      void this.onMessage(message);
    });
    this.panel.webview.html = this.render(this.panel.webview);
  }

  public updateState(state: NavigatorHostStatePayload): void {
    this.state = state;
    if (!this.panel) {
      return;
    }

    void this.panel.webview.postMessage({
      action: "navigator.state-changed",
      payload: state
    });
  }

  private render(webview: vscode.Webview): string {
    return renderReactWebviewHtml(webview, this.extensionUri, {
      title: "AIDLC Navigator",
      bundleName: "navigator.js",
      bootstrapVariable: "__AIDLC_NAVIGATOR_STATE__",
      state: this.state
    });
  }
}
