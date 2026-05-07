import * as vscode from "vscode";
import {
  ActiveDocsRoot,
  buildNavigationGroups,
  derivePhase,
  deriveSection,
  deriveSubsection,
  deriveTitle,
  normalizeRelativePath,
  RuntimeDocumentIndex,
  RuntimeDocumentRecord
} from "../../shared/documents";
import { enumerateMarkdownFiles } from "./documentEnumerator";

export async function buildRuntimeDocumentIndex(activeRoot: ActiveDocsRoot): Promise<RuntimeDocumentIndex> {
  const filePaths = await enumerateMarkdownFiles(activeRoot.absolutePath);
  const documents: RuntimeDocumentRecord[] = [];

  for (const filePath of filePaths) {
    const contentBytes = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
    const markdown = Buffer.from(contentBytes).toString("utf8");
    const relativePath = normalizeRelativePath(activeRoot.absolutePath, filePath);

    documents.push({
      absolutePath: filePath,
      relativePath,
      title: deriveTitle(markdown, relativePath),
      phase: derivePhase(relativePath),
      section: deriveSection(relativePath),
      subsection: deriveSubsection(relativePath)
    });
  }

  return {
    activeRoot,
    documents,
    navigationGroups: buildNavigationGroups(documents),
    version: activeRoot.version,
    status: documents.length > 0 ? "ready" : "empty"
  };
}
