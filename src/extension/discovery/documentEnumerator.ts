import * as vscode from "vscode";

export async function enumerateMarkdownFiles(rootPath: string): Promise<readonly string[]> {
  const files: string[] = [];
  await visitDirectory(vscode.Uri.file(rootPath), files);
  return files.sort((left, right) => left.localeCompare(right));
}

async function visitDirectory(directory: vscode.Uri, files: string[]): Promise<void> {
  const entries = await vscode.workspace.fs.readDirectory(directory);

  for (const [name, fileType] of entries) {
    const child = vscode.Uri.joinPath(directory, name);
    if (fileType === vscode.FileType.Directory) {
      await visitDirectory(child, files);
      continue;
    }

    if (fileType === vscode.FileType.File && name.toLowerCase().endsWith(".md")) {
      files.push(child.fsPath);
    }
  }
}
