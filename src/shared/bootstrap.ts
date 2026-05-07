import * as path from "node:path";

export const SETUP_MODE_IDS = {
  codex: "codex"
} as const;

export type SetupModeId = (typeof SETUP_MODE_IDS)[keyof typeof SETUP_MODE_IDS];

export const SETUP_OPERATION_TYPES = {
  create: "create",
  update: "update",
  skip: "skip",
  block: "block"
} as const;

export type SetupOperationType = (typeof SETUP_OPERATION_TYPES)[keyof typeof SETUP_OPERATION_TYPES];

export type ExistingTargetState = "missing" | "same-file" | "different-file" | "kind-conflict";
export type OverwriteRisk = "none" | "safe-update" | "blocked";
export type SetupPlanStatus = "invalid" | "ready" | "noop" | "blocked";
export type SetupExecutionStatus = "created" | "updated" | "skipped" | "blocked" | "failed" | "not-attempted";
export type SetupCompletionStatus = "succeeded" | "partial" | "blocked" | "failed" | "cancelled" | "noop";

export interface SetupModeDescriptor {
  readonly modeId: SetupModeId;
  readonly label: string;
  readonly requiredSourceAssets: readonly string[];
  readonly targetLayoutDescription: string;
}

export interface DetectedSetupAsset {
  readonly assetId: string;
  readonly kind: "file" | "directory";
  readonly absolutePath: string;
  readonly relativePath: string;
}

export interface SetupSourceFileRecord {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly contentSignature: string;
}

export interface ExtractedSourceValidationResult {
  readonly sourcePath: string;
  readonly valid: boolean;
  readonly detectedAssets: readonly DetectedSetupAsset[];
  readonly missingRequiredAssets: readonly string[];
  readonly supportedSetupModes: readonly SetupModeDescriptor[];
  readonly validationMessage: string;
}

export interface ExistingTargetSnapshot {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly kind: "missing" | "file" | "directory";
  readonly contentSignature?: string;
}

export interface SetupTargetMapping {
  readonly sourcePath: string;
  readonly sourceRelativePath: string;
  readonly destinationPath: string;
  readonly destinationRelativePath: string;
  readonly operationType: SetupOperationType;
  readonly existingTargetState: ExistingTargetState;
  readonly overwriteRisk: OverwriteRisk;
  readonly detail: string;
}

export interface SetupOperationPlan {
  readonly sourcePath: string;
  readonly workspaceRoot: string;
  readonly mode: SetupModeDescriptor | null;
  readonly targetMappings: readonly SetupTargetMapping[];
  readonly blockedMappings: readonly SetupTargetMapping[];
  readonly executableMappings: readonly SetupTargetMapping[];
  readonly executionOrder: readonly string[];
  readonly planStatus: SetupPlanStatus;
  readonly planSummary: string;
}

export interface SetupExecutionResult {
  readonly destinationRelativePath: string;
  readonly status: SetupExecutionStatus;
  readonly detail: string;
}

export interface SetupExecutionOutcome {
  readonly modeLabel: string | null;
  readonly createdPaths: readonly string[];
  readonly updatedPaths: readonly string[];
  readonly skippedPaths: readonly string[];
  readonly blockedPaths: readonly string[];
  readonly failedPaths: readonly string[];
  readonly notAttemptedPaths: readonly string[];
  readonly completionStatus: SetupCompletionStatus;
  readonly summaryMessage: string;
}

export interface BuildSetupPlanInput {
  readonly validation: ExtractedSourceValidationResult;
  readonly mode: SetupModeDescriptor | null;
  readonly workspaceRoot: string;
  readonly sourceFiles: readonly SetupSourceFileRecord[];
  readonly existingTargets: readonly ExistingTargetSnapshot[];
}

export const CODEX_SETUP_MODE: SetupModeDescriptor = {
  modeId: SETUP_MODE_IDS.codex,
  label: "Codex/OpenAI Codex Workspace",
  requiredSourceAssets: [
    "aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
    "aidlc-rules/aws-aidlc-rule-details/**"
  ],
  targetLayoutDescription: "Copies the top-level AGENTS.md file and the .aidlc-rule-details directory into the current workspace."
};

const REQUIRED_AGENTS_PATH = "aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md";
const REQUIRED_RULE_DETAILS_PREFIX = "aidlc-rules/aws-aidlc-rule-details/";

export function normalizeSetupRelativePath(inputPath: string): string {
  return inputPath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+/g, "/");
}

export function getSupportedSetupModes(): readonly SetupModeDescriptor[] {
  return [CODEX_SETUP_MODE];
}

export function validateExtractedSourceFiles(
  sourcePath: string,
  sourceFiles: readonly SetupSourceFileRecord[]
): ExtractedSourceValidationResult {
  const normalizedFiles = sourceFiles.map((file) => ({
    ...file,
    relativePath: normalizeSetupRelativePath(file.relativePath)
  }));

  const agentsFile = normalizedFiles.find((file) => file.relativePath === REQUIRED_AGENTS_PATH);
  const ruleDetailsFiles = normalizedFiles.filter((file) => file.relativePath.startsWith(REQUIRED_RULE_DETAILS_PREFIX));

  const detectedAssets: DetectedSetupAsset[] = [];
  const missingRequiredAssets: string[] = [];

  if (agentsFile) {
    detectedAssets.push({
      assetId: "core-workflow-agents",
      kind: "file",
      absolutePath: agentsFile.absolutePath,
      relativePath: agentsFile.relativePath
    });
  } else {
    missingRequiredAssets.push(REQUIRED_AGENTS_PATH);
  }

  if (ruleDetailsFiles.length > 0) {
    detectedAssets.push({
      assetId: "rule-details-directory",
      kind: "directory",
      absolutePath: path.join(sourcePath, "aidlc-rules", "aws-aidlc-rule-details"),
      relativePath: "aidlc-rules/aws-aidlc-rule-details"
    });
  } else {
    missingRequiredAssets.push("aidlc-rules/aws-aidlc-rule-details/**");
  }

  const valid = missingRequiredAssets.length === 0;
  const supportedSetupModes = valid ? [CODEX_SETUP_MODE] : [];
  const validationMessage = valid
    ? "The extracted AIDLC folder contains the required assets for Codex/OpenAI Codex workspace setup."
    : `The selected folder is missing required AIDLC setup assets: ${missingRequiredAssets.join(", ")}.`;

  return {
    sourcePath,
    valid,
    detectedAssets,
    missingRequiredAssets,
    supportedSetupModes,
    validationMessage
  };
}

export function resolveSupportedSetupMode(
  validation: ExtractedSourceValidationResult,
  preferredModeId: SetupModeId = SETUP_MODE_IDS.codex
): SetupModeDescriptor | null {
  if (!validation.valid) {
    return null;
  }

  return validation.supportedSetupModes.find((mode) => mode.modeId === preferredModeId) ?? null;
}

export function buildCodexTargetRelativePath(sourceRelativePath: string): string | null {
  const normalizedSourcePath = normalizeSetupRelativePath(sourceRelativePath);
  if (normalizedSourcePath === REQUIRED_AGENTS_PATH) {
    return "AGENTS.md";
  }

  if (!normalizedSourcePath.startsWith(REQUIRED_RULE_DETAILS_PREFIX)) {
    return null;
  }

  const suffix = normalizedSourcePath.slice(REQUIRED_RULE_DETAILS_PREFIX.length);
  return suffix.length > 0 ? normalizeSetupRelativePath(`.aidlc-rule-details/${suffix}`) : ".aidlc-rule-details";
}

export function isPathWithinWorkspaceRoot(workspaceRoot: string, candidatePath: string): boolean {
  const resolvedWorkspaceRoot = path.resolve(workspaceRoot);
  const resolvedCandidatePath = path.resolve(candidatePath);
  const relative = path.relative(resolvedWorkspaceRoot, resolvedCandidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function classifyTargetOperation(
  sourceFile: SetupSourceFileRecord,
  existingTarget: ExistingTargetSnapshot | undefined
): Pick<SetupTargetMapping, "operationType" | "existingTargetState" | "overwriteRisk" | "detail"> {
  if (!existingTarget || existingTarget.kind === "missing") {
    return {
      operationType: SETUP_OPERATION_TYPES.create,
      existingTargetState: "missing",
      overwriteRisk: "none",
      detail: "Target does not exist yet and will be created."
    };
  }

  if (existingTarget.kind !== "file") {
    return {
      operationType: SETUP_OPERATION_TYPES.block,
      existingTargetState: "kind-conflict",
      overwriteRisk: "blocked",
      detail: "Target already exists with an incompatible type."
    };
  }

  if (existingTarget.contentSignature === sourceFile.contentSignature) {
    return {
      operationType: SETUP_OPERATION_TYPES.skip,
      existingTargetState: "same-file",
      overwriteRisk: "none",
      detail: "Target already matches the source content."
    };
  }

  return {
    operationType: SETUP_OPERATION_TYPES.update,
    existingTargetState: "different-file",
    overwriteRisk: "safe-update",
    detail: "Target exists and will be updated with newer setup content."
  };
}

export function buildSetupPlan(input: BuildSetupPlanInput): SetupOperationPlan {
  if (!input.validation.valid || !input.mode) {
    return {
      sourcePath: input.validation.sourcePath,
      workspaceRoot: input.workspaceRoot,
      mode: input.mode,
      targetMappings: [],
      blockedMappings: [],
      executableMappings: [],
      executionOrder: [],
      planStatus: "invalid",
      planSummary: input.validation.validationMessage
    };
  }

  const existingByRelativePath = new Map(
    input.existingTargets.map((target) => [normalizeSetupRelativePath(target.relativePath), target] as const)
  );

  const normalizedSourceFiles = [...input.sourceFiles]
    .map((file) => ({
      ...file,
      relativePath: normalizeSetupRelativePath(file.relativePath)
    }))
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  const targetMappings = normalizedSourceFiles.map<SetupTargetMapping>((sourceFile) => {
    const destinationRelativePath = buildCodexTargetRelativePath(sourceFile.relativePath);
    if (!destinationRelativePath) {
      return {
        sourcePath: sourceFile.absolutePath,
        sourceRelativePath: sourceFile.relativePath,
        destinationPath: input.workspaceRoot,
        destinationRelativePath: "",
        operationType: SETUP_OPERATION_TYPES.block,
        existingTargetState: "kind-conflict",
        overwriteRisk: "blocked",
        detail: "Source file does not map to a supported destination in the selected setup mode."
      };
    }

    const destinationPath = path.resolve(input.workspaceRoot, destinationRelativePath);
    if (!isPathWithinWorkspaceRoot(input.workspaceRoot, destinationPath)) {
      return {
        sourcePath: sourceFile.absolutePath,
        sourceRelativePath: sourceFile.relativePath,
        destinationPath,
        destinationRelativePath,
        operationType: SETUP_OPERATION_TYPES.block,
        existingTargetState: "kind-conflict",
        overwriteRisk: "blocked",
        detail: "Resolved destination would escape the workspace root."
      };
    }

    const classification = classifyTargetOperation(
      sourceFile,
      existingByRelativePath.get(destinationRelativePath)
    );

    return {
      sourcePath: sourceFile.absolutePath,
      sourceRelativePath: sourceFile.relativePath,
      destinationPath,
      destinationRelativePath,
      ...classification
    };
  });

  const blockedMappings = targetMappings.filter((mapping) => mapping.operationType === SETUP_OPERATION_TYPES.block);
  const executableMappings = targetMappings.filter(
    (mapping) => mapping.operationType === SETUP_OPERATION_TYPES.create || mapping.operationType === SETUP_OPERATION_TYPES.update
  );
  const skippedMappings = targetMappings.filter((mapping) => mapping.operationType === SETUP_OPERATION_TYPES.skip);

  const planStatus: SetupPlanStatus = blockedMappings.length > 0 && executableMappings.length === 0
    ? "blocked"
    : executableMappings.length === 0 && skippedMappings.length > 0
      ? "noop"
      : executableMappings.length === 0 && blockedMappings.length === 0
        ? "noop"
        : "ready";

  return {
    sourcePath: input.validation.sourcePath,
    workspaceRoot: input.workspaceRoot,
    mode: input.mode,
    targetMappings,
    blockedMappings,
    executableMappings,
    executionOrder: executableMappings.map((mapping) => mapping.destinationRelativePath),
    planStatus,
    planSummary: buildPlanSummary(input.mode.label, targetMappings)
  };
}

export function summarizeSetupExecution(
  modeLabel: string | null,
  results: readonly SetupExecutionResult[]
): SetupExecutionOutcome {
  const createdPaths = results.filter((result) => result.status === "created").map((result) => result.destinationRelativePath);
  const updatedPaths = results.filter((result) => result.status === "updated").map((result) => result.destinationRelativePath);
  const skippedPaths = results.filter((result) => result.status === "skipped").map((result) => result.destinationRelativePath);
  const blockedPaths = results.filter((result) => result.status === "blocked").map((result) => result.destinationRelativePath);
  const failedPaths = results.filter((result) => result.status === "failed").map((result) => result.destinationRelativePath);
  const notAttemptedPaths = results.filter((result) => result.status === "not-attempted").map((result) => result.destinationRelativePath);

  let completionStatus: SetupCompletionStatus;
  if (failedPaths.length > 0 && createdPaths.length === 0 && updatedPaths.length === 0) {
    completionStatus = "failed";
  } else if (failedPaths.length > 0 || notAttemptedPaths.length > 0) {
    completionStatus = "partial";
  } else if (createdPaths.length === 0 && updatedPaths.length === 0 && skippedPaths.length > 0 && blockedPaths.length === 0) {
    completionStatus = "noop";
  } else if (createdPaths.length === 0 && updatedPaths.length === 0 && blockedPaths.length > 0) {
    completionStatus = "blocked";
  } else if (blockedPaths.length > 0) {
    completionStatus = "partial";
  } else {
    completionStatus = "succeeded";
  }

  return {
    modeLabel,
    createdPaths,
    updatedPaths,
    skippedPaths,
    blockedPaths,
    failedPaths,
    notAttemptedPaths,
    completionStatus,
    summaryMessage: buildExecutionSummary(modeLabel, {
      created: createdPaths.length,
      updated: updatedPaths.length,
      skipped: skippedPaths.length,
      blocked: blockedPaths.length,
      failed: failedPaths.length,
      notAttempted: notAttemptedPaths.length
    }, completionStatus)
  };
}

function buildPlanSummary(modeLabel: string, mappings: readonly SetupTargetMapping[]): string {
  const counts = {
    create: mappings.filter((mapping) => mapping.operationType === SETUP_OPERATION_TYPES.create).length,
    update: mappings.filter((mapping) => mapping.operationType === SETUP_OPERATION_TYPES.update).length,
    skip: mappings.filter((mapping) => mapping.operationType === SETUP_OPERATION_TYPES.skip).length,
    block: mappings.filter((mapping) => mapping.operationType === SETUP_OPERATION_TYPES.block).length
  };

  return `${modeLabel}: ${counts.create} create, ${counts.update} update, ${counts.skip} skip, ${counts.block} blocked.`;
}

function buildExecutionSummary(
  modeLabel: string | null,
  counts: {
    readonly created: number;
    readonly updated: number;
    readonly skipped: number;
    readonly blocked: number;
    readonly failed: number;
    readonly notAttempted: number;
  },
  completionStatus: SetupCompletionStatus
): string {
  const prefix = modeLabel ? `${modeLabel} setup` : "AIDLC setup";
  return `${prefix} ${completionStatus}: ${counts.created} created, ${counts.updated} updated, ${counts.skipped} skipped, ${counts.blocked} blocked, ${counts.failed} failed, ${counts.notAttempted} not attempted.`;
}
