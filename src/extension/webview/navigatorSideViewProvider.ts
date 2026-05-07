import * as vscode from "vscode";
import { WebviewToHostMessage } from "../../shared/contracts";
import { NavigatorHostStatePayload } from "../../shared/navigator";
import { renderReactWebviewHtml } from "./renderWebviewHtml";

export class NavigatorSideViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "aidlcNavigator.sideView";

  private view: vscode.WebviewView | undefined;

  public constructor(
    private readonly extensionUri: vscode.Uri,
    private state: NavigatorHostStatePayload,
    private readonly onMessage: (message: WebviewToHostMessage) => Promise<void> | void
  ) {
  }

  public resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true
    };
    view.webview.onDidReceiveMessage((message: WebviewToHostMessage) => {
      void this.onMessage(message);
    });
    view.webview.html = this.render(view.webview);
  }

  public updateState(state: NavigatorHostStatePayload): void {
    this.state = state;
    if (!this.view) {
      return;
    }

    void this.view.webview.postMessage({
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
