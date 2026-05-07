import * as vscode from "vscode";
import { DocsRootCandidate } from "../../shared/documents";

export async function validateDocsRootCandidate(
  candidatePath: string,
  source: DocsRootCandidate["source"]
): Promise<DocsRootCandidate> {
  try {
    const directoryEntries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(candidatePath));
    const hasMarkdown = directoryEntries.some(([, fileType]) => fileType === vscode.FileType.File);

    if (!hasMarkdown && directoryEntries.length === 0) {
      return {
        absolutePath: candidatePath,
        source,
        valid: true,
        reason: "empty-docs-root"
      };
    }

    return {
      absolutePath: candidatePath,
      source,
      valid: true
    };
  } catch (error) {
    return {
      absolutePath: candidatePath,
      source,
      valid: false,
      reason: error instanceof Error ? error.message : "Docs root is not accessible"
    };
  }
}
