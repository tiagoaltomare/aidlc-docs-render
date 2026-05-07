import * as vscode from "vscode";

function escapeJson(text: string): string {
  return text.replace(/</g, "\\u003c");
}

interface ReactWebviewHtmlOptions {
  readonly title: string;
  readonly bundleName: string;
  readonly bootstrapVariable: string;
  readonly state: unknown;
}

export function renderReactWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  options: ReactWebviewHtmlOptions
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "webview", options.bundleName)
  );

  const nonce = String(Date.now());
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src ${webview.cspSource} 'nonce-${nonce}'`,
    `font-src ${webview.cspSource} https: data:`
  ].join("; ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${options.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}">
      window.${options.bootstrapVariable} = ${escapeJson(JSON.stringify(options.state))};
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}
