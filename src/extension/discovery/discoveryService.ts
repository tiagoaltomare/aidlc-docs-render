import * as vscode from "vscode";
import {
  ActiveDocsRoot,
  DiscoveryState,
  DocsRootCandidate,
  replaceIndexState,
  RuntimeDocumentIndex
} from "../../shared/documents";
import { buildRuntimeDocumentIndex } from "./documentIndexBuilder";
import { validateDocsRootCandidate } from "./docsRootValidator";

export class DiscoveryService {
  private version = 0;
  private state: DiscoveryState = {
    mode: "undetected",
    activeRoot: null,
    currentIndex: null,
    lastValidIndex: null,
    error: null
  };

  public getState(): DiscoveryState {
    return this.state;
  }

  public async detectDocsRoot(workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined): Promise<DiscoveryState> {
    if (!workspaceFolders || workspaceFolders.length === 0) {
      this.state = {
        ...this.state,
        mode: "failed",
        error: "No workspace folder is available for discovery."
      };
      return this.state;
    }

    for (const folder of workspaceFolders) {
      const candidatePath = vscode.Uri.joinPath(folder.uri, "aidlc-docs").fsPath;
      const candidate = await validateDocsRootCandidate(candidatePath, "auto-detected");
      if (candidate.valid) {
        return this.activateCandidate(candidate);
      }
    }

    this.state = {
      ...this.state,
      mode: "undetected",
      error: "No default aidlc-docs root was found."
    };
    return this.state;
  }

  public async chooseDocsRoot(): Promise<DiscoveryState> {
    const selected = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select AIDLC Docs Root"
    });

    if (!selected || selected.length === 0) {
      return this.state;
    }

    const candidate = await validateDocsRootCandidate(selected[0].fsPath, "manual");
    if (!candidate.valid) {
      this.state = {
        ...this.state,
        mode: "failed",
        error: candidate.reason ?? "Selected docs root is invalid."
      };
      return this.state;
    }

    return this.activateCandidate(candidate);
  }

  public async refresh(): Promise<DiscoveryState> {
    if (!this.state.activeRoot) {
      return this.state;
    }

    const candidate = await validateDocsRootCandidate(
      this.state.activeRoot.absolutePath,
      this.state.activeRoot.source
    );

    if (!candidate.valid) {
      const replacement = replaceIndexState(this.state, null, "failed", candidate.reason ?? "Refresh validation failed.");
      this.state = replacement.nextState;
      return this.state;
    }

    return this.activateCandidate(candidate);
  }

  private async activateCandidate(candidate: DocsRootCandidate): Promise<DiscoveryState> {
    const nextRoot: ActiveDocsRoot = {
      absolutePath: candidate.absolutePath,
      source: candidate.source,
      version: ++this.version
    };

    let nextIndex: RuntimeDocumentIndex;
    try {
      nextIndex = await buildRuntimeDocumentIndex(nextRoot);
    } catch (error) {
      const replacement = replaceIndexState(
        this.state,
        null,
        "failed",
        error instanceof Error ? error.message : "Index build failed."
      );
      this.state = replacement.nextState;
      return this.state;
    }

    const nextMode = candidate.source === "manual"
      ? "manual"
      : nextIndex.status === "empty"
        ? "empty"
        : "detected";

    const replacement = replaceIndexState(this.state, nextIndex, nextMode, null);
    this.state = replacement.nextState;
    return this.state;
  }
}
