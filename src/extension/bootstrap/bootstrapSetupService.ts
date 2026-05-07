import * as crypto from "node:crypto";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  buildCodexTargetRelativePath,
  buildSetupPlan,
  ExistingTargetSnapshot,
  ExtractedSourceValidationResult,
  resolveSupportedSetupMode,
  SetupExecutionOutcome,
  SetupExecutionResult,
  SetupSourceFileRecord,
  summarizeSetupExecution,
  validateExtractedSourceFiles
} from "../../shared/bootstrap";
import { COMMAND_IDS } from "../constants";

export class BootstrapSetupService implements vscode.Disposable {
  private readonly outputChannel: vscode.OutputChannel;

  public constructor() {
    this.outputChannel = vscode.window.createOutputChannel("AIDLC Setup");
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }

  public async runGuidedSetup(): Promise<SetupExecutionOutcome | null> {
    const workspaceFolder = await this.selectWorkspaceFolder();
    if (!workspaceFolder) {
      void vscode.window.showWarningMessage("Open a workspace folder before starting AIDLC setup.");
      return null;
    }

    const selectedSourceFolder = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: "Select Extracted AIDLC Folder"
    });

    if (!selectedSourceFolder || selectedSourceFolder.length === 0) {
      return null;
    }

    const sourceFolderUri = selectedSourceFolder[0];
    const sourceFiles = await this.collectSourceFiles(sourceFolderUri);
    const validation = validateExtractedSourceFiles(sourceFolderUri.fsPath, sourceFiles);

    if (!validation.valid) {
      const failureSummary = this.formatValidationFailure(validation);
      this.writeValidationSummary(validation, failureSummary);
      void vscode.window.showErrorMessage(failureSummary);
      return null;
    }

    const mode = resolveSupportedSetupMode(validation);
    const relevantSourceFiles = sourceFiles.filter((file) => buildCodexTargetRelativePath(file.relativePath) !== null);
    const existingTargets = await this.collectExistingTargets(workspaceFolder.uri.fsPath, relevantSourceFiles);
    const plan = buildSetupPlan({
      validation,
      mode,
      workspaceRoot: workspaceFolder.uri.fsPath,
      sourceFiles: relevantSourceFiles,
      existingTargets
    });

    if (plan.planStatus === "invalid") {
      this.writePlanSummary(plan.planSummary, plan.targetMappings);
      void vscode.window.showErrorMessage(plan.planSummary);
      return null;
    }

    const confirmation = await this.confirmPlan(plan);
    if (!confirmation) {
      return {
        modeLabel: plan.mode?.label ?? null,
        createdPaths: [],
        updatedPaths: [],
        skippedPaths: [],
        blockedPaths: plan.blockedMappings.map((mapping) => mapping.destinationRelativePath),
        failedPaths: [],
        notAttemptedPaths: plan.executableMappings.map((mapping) => mapping.destinationRelativePath),
        completionStatus: "cancelled",
        summaryMessage: "AIDLC setup was cancelled before workspace changes were applied."
      };
    }

    const executionResults = await this.executePlan(plan);
    const outcome = summarizeSetupExecution(plan.mode?.label ?? null, executionResults);
    this.writeOutcomeSummary(workspaceFolder.uri.fsPath, validation, plan.planSummary, executionResults, outcome);
    await this.presentOutcome(outcome);
    return outcome;
  }

  private async selectWorkspaceFolder(): Promise<vscode.WorkspaceFolder | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    if (workspaceFolders.length === 1) {
      return workspaceFolders[0];
    }

    return (await vscode.window.showWorkspaceFolderPick({
      placeHolder: "Select the workspace that should receive the AIDLC setup files."
    })) ?? null;
  }

  private async collectSourceFiles(rootUri: vscode.Uri): Promise<readonly SetupSourceFileRecord[]> {
    const files: SetupSourceFileRecord[] = [];
    const pending: Array<{ uri: vscode.Uri; relativePrefix: string }> = [{ uri: rootUri, relativePrefix: "" }];

    while (pending.length > 0) {
      const current = pending.shift();
      if (!current) {
        continue;
      }

      const entries = await vscode.workspace.fs.readDirectory(current.uri);
      for (const [entryName, entryType] of entries) {
        const relativePath = current.relativePrefix
          ? `${current.relativePrefix}/${entryName}`
          : entryName;
        const entryUri = vscode.Uri.joinPath(current.uri, entryName);

        if (entryType === vscode.FileType.Directory) {
          pending.push({ uri: entryUri, relativePrefix: relativePath });
          continue;
        }

        if (entryType !== vscode.FileType.File) {
          continue;
        }

        const bytes = await vscode.workspace.fs.readFile(entryUri);
        files.push({
          absolutePath: entryUri.fsPath,
          relativePath,
          contentSignature: hashBytes(bytes)
        });
      }
    }

    return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  }

  private async collectExistingTargets(
    workspaceRoot: string,
    sourceFiles: readonly SetupSourceFileRecord[]
  ): Promise<readonly ExistingTargetSnapshot[]> {
    const snapshots: ExistingTargetSnapshot[] = [];

    for (const sourceFile of sourceFiles) {
      const destinationRelativePath = buildCodexTargetRelativePath(sourceFile.relativePath);
      if (!destinationRelativePath) {
        continue;
      }

      const destinationUri = vscode.Uri.file(path.resolve(workspaceRoot, destinationRelativePath));
      try {
        const stat = await vscode.workspace.fs.stat(destinationUri);
        if (stat.type === vscode.FileType.Directory) {
          snapshots.push({
            absolutePath: destinationUri.fsPath,
            relativePath: destinationRelativePath,
            kind: "directory"
          });
          continue;
        }

        const bytes = await vscode.workspace.fs.readFile(destinationUri);
        snapshots.push({
          absolutePath: destinationUri.fsPath,
          relativePath: destinationRelativePath,
          kind: "file",
          contentSignature: hashBytes(bytes)
        });
      } catch (error) {
        if (isFileNotFoundError(error)) {
          snapshots.push({
            absolutePath: destinationUri.fsPath,
            relativePath: destinationRelativePath,
            kind: "missing"
          });
          continue;
        }

        snapshots.push({
          absolutePath: destinationUri.fsPath,
          relativePath: destinationRelativePath,
          kind: "directory"
        });
      }
    }

    return snapshots;
  }

  private async confirmPlan(plan: ReturnType<typeof buildSetupPlan>): Promise<boolean> {
    if (plan.planStatus === "noop") {
      return true;
    }

    const updateCount = plan.targetMappings.filter((mapping) => mapping.operationType === "update").length;
    const blockCount = plan.blockedMappings.length;
    const createCount = plan.targetMappings.filter((mapping) => mapping.operationType === "create").length;

    const warningParts = [
      `AIDLC setup will create ${createCount} file(s) and update ${updateCount} file(s).`
    ];
    if (blockCount > 0) {
      warningParts.push(`${blockCount} file(s) are blocked and will be left untouched.`);
    }

    const action = await vscode.window.showWarningMessage(
      warningParts.join(" "),
      { modal: updateCount > 0 || blockCount > 0 },
      "Continue Setup"
    );

    return action === "Continue Setup";
  }

  private async executePlan(plan: ReturnType<typeof buildSetupPlan>): Promise<readonly SetupExecutionResult[]> {
    const results: SetupExecutionResult[] = [];

    for (const mapping of plan.targetMappings) {
      if (mapping.operationType === "skip") {
        results.push({
          destinationRelativePath: mapping.destinationRelativePath,
          status: "skipped",
          detail: mapping.detail
        });
        continue;
      }

      if (mapping.operationType === "block") {
        results.push({
          destinationRelativePath: mapping.destinationRelativePath,
          status: "blocked",
          detail: mapping.detail
        });
        continue;
      }

      try {
        const destinationDirectoryUri = vscode.Uri.file(path.dirname(mapping.destinationPath));
        await vscode.workspace.fs.createDirectory(destinationDirectoryUri);
        await vscode.workspace.fs.copy(
          vscode.Uri.file(mapping.sourcePath),
          vscode.Uri.file(mapping.destinationPath),
          { overwrite: true }
        );

        results.push({
          destinationRelativePath: mapping.destinationRelativePath,
          status: mapping.operationType === "create" ? "created" : "updated",
          detail: mapping.detail
        });
      } catch (error) {
        results.push({
          destinationRelativePath: mapping.destinationRelativePath,
          status: "failed",
          detail: error instanceof Error ? error.message : "Unknown file operation error."
        });

        const remainingMappings = plan.targetMappings.slice(plan.targetMappings.indexOf(mapping) + 1)
          .filter((remainingMapping) =>
            remainingMapping.operationType === "create" || remainingMapping.operationType === "update"
          );

        for (const remainingMapping of remainingMappings) {
          results.push({
            destinationRelativePath: remainingMapping.destinationRelativePath,
            status: "not-attempted",
            detail: "Not attempted because setup stopped after an earlier failure."
          });
        }

        break;
      }
    }

    return results;
  }

  private async presentOutcome(outcome: SetupExecutionOutcome): Promise<void> {
    const message = outcome.summaryMessage;
    const openNavigatorAction = "Open Navigator";
    const showDetailsAction = "Show Details";

    if (outcome.completionStatus === "failed" || outcome.completionStatus === "partial" || outcome.completionStatus === "blocked") {
      const action = await vscode.window.showWarningMessage(message, showDetailsAction);
      if (action === showDetailsAction) {
        this.outputChannel.show(true);
      }
      return;
    }

    const action = await vscode.window.showInformationMessage(message, openNavigatorAction, showDetailsAction);
    if (action === openNavigatorAction) {
      await vscode.commands.executeCommand(COMMAND_IDS.openNavigatorPanel);
      return;
    }

    if (action === showDetailsAction) {
      this.outputChannel.show(true);
    }
  }

  private formatValidationFailure(validation: ExtractedSourceValidationResult): string {
    return `${validation.validationMessage} Expected the extracted folder to contain the core-workflow AGENTS file and the aws-aidlc-rule-details directory.`;
  }

  private writeValidationSummary(validation: ExtractedSourceValidationResult, message: string): void {
    this.outputChannel.clear();
    this.outputChannel.appendLine("AIDLC Setup Validation");
    this.outputChannel.appendLine(`Source folder: ${validation.sourcePath}`);
    this.outputChannel.appendLine(message);
    this.outputChannel.appendLine("");
  }

  private writePlanSummary(planSummary: string, mappings: readonly { destinationRelativePath: string; detail: string }[]): void {
    this.outputChannel.clear();
    this.outputChannel.appendLine("AIDLC Setup Plan");
    this.outputChannel.appendLine(planSummary);
    for (const mapping of mappings) {
      this.outputChannel.appendLine(`- ${mapping.destinationRelativePath || "(unsupported target)"}: ${mapping.detail}`);
    }
    this.outputChannel.appendLine("");
  }

  private writeOutcomeSummary(
    workspaceRoot: string,
    validation: ExtractedSourceValidationResult,
    planSummary: string,
    executionResults: readonly SetupExecutionResult[],
    outcome: SetupExecutionOutcome
  ): void {
    this.outputChannel.clear();
    this.outputChannel.appendLine("AIDLC Setup Summary");
    this.outputChannel.appendLine(`Workspace: ${workspaceRoot}`);
    this.outputChannel.appendLine(`Source folder: ${validation.sourcePath}`);
    this.outputChannel.appendLine(`Validation: ${validation.validationMessage}`);
    this.outputChannel.appendLine(`Plan: ${planSummary}`);
    this.outputChannel.appendLine(`Outcome: ${outcome.summaryMessage}`);
    this.outputChannel.appendLine("");

    for (const result of executionResults) {
      this.outputChannel.appendLine(`- [${result.status}] ${result.destinationRelativePath}: ${result.detail}`);
    }

    this.outputChannel.appendLine("");
  }
}

function hashBytes(bytes: Uint8Array): string {
  return crypto.createHash("sha1").update(Buffer.from(bytes)).digest("hex");
}

function isFileNotFoundError(error: unknown): boolean {
  return error instanceof vscode.FileSystemError
    && (error.name.includes("FileNotFound") || error.message.includes("FileNotFound"));
}
