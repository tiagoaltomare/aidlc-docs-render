import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCodexTargetRelativePath,
  buildSetupPlan,
  CODEX_SETUP_MODE,
  isPathWithinWorkspaceRoot,
  resolveSupportedSetupMode,
  SetupExecutionResult,
  summarizeSetupExecution,
  validateExtractedSourceFiles
} from "../../src/shared/bootstrap";

test("validateExtractedSourceFiles accepts the required Codex setup assets", () => {
  const validation = validateExtractedSourceFiles("C:/Downloads/aidlc", [
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
      relativePath: "aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
      contentSignature: "agents"
    },
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
      relativePath: "aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
      contentSignature: "rules"
    }
  ]);

  assert.equal(validation.valid, true);
  assert.equal(resolveSupportedSetupMode(validation)?.modeId, CODEX_SETUP_MODE.modeId);
});

test("validateExtractedSourceFiles rejects missing required assets", () => {
  const validation = validateExtractedSourceFiles("C:/Downloads/aidlc", [{
    absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
    relativePath: "aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
    contentSignature: "rules"
  }]);

  assert.equal(validation.valid, false);
  assert.deepEqual(validation.missingRequiredAssets, [
    "aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md"
  ]);
});

test("buildCodexTargetRelativePath maps setup assets to workspace targets", () => {
  assert.equal(
    buildCodexTargetRelativePath("aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md"),
    "AGENTS.md"
  );
  assert.equal(
    buildCodexTargetRelativePath("aidlc-rules/aws-aidlc-rule-details/common/process-overview.md"),
    ".aidlc-rule-details/common/process-overview.md"
  );
  assert.equal(buildCodexTargetRelativePath("aidlc-rules/other/file.md"), null);
});

test("isPathWithinWorkspaceRoot rejects escaped destinations", () => {
  assert.equal(isPathWithinWorkspaceRoot("C:/repo", "C:/repo/AGENTS.md"), true);
  assert.equal(isPathWithinWorkspaceRoot("C:/repo", "C:/repo/.aidlc-rule-details/common.md"), true);
  assert.equal(isPathWithinWorkspaceRoot("C:/repo", "C:/other/AGENTS.md"), false);
});

test("buildSetupPlan preserves no-plan-on-validation-failure behavior", () => {
  const invalidValidation = validateExtractedSourceFiles("C:/Downloads/aidlc", []);
  const plan = buildSetupPlan({
    validation: invalidValidation,
    mode: null,
    workspaceRoot: "C:/repo",
    sourceFiles: [],
    existingTargets: []
  });

  assert.equal(plan.planStatus, "invalid");
  assert.equal(plan.executableMappings.length, 0);
});

test("buildSetupPlan deterministically classifies create, update, and skip mappings", () => {
  const validation = validateExtractedSourceFiles("C:/Downloads/aidlc", [
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
      relativePath: "aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
      contentSignature: "agents-new"
    },
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
      relativePath: "aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
      contentSignature: "rules-same"
    },
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rule-details/common/session-continuity.md",
      relativePath: "aidlc-rules/aws-aidlc-rule-details/common/session-continuity.md",
      contentSignature: "rules-new"
    }
  ]);

  const sourceFiles = [
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
      relativePath: "aidlc-rules/aws-aidlc-rules/core-workflow/AGENTS.md",
      contentSignature: "agents-new"
    },
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
      relativePath: "aidlc-rules/aws-aidlc-rule-details/common/process-overview.md",
      contentSignature: "rules-same"
    },
    {
      absolutePath: "C:/Downloads/aidlc/aidlc-rules/aws-aidlc-rule-details/common/session-continuity.md",
      relativePath: "aidlc-rules/aws-aidlc-rule-details/common/session-continuity.md",
      contentSignature: "rules-new"
    }
  ];

  const existingTargets = [
    {
      absolutePath: "C:/repo/AGENTS.md",
      relativePath: "AGENTS.md",
      kind: "file" as const,
      contentSignature: "agents-old"
    },
    {
      absolutePath: "C:/repo/.aidlc-rule-details/common/process-overview.md",
      relativePath: ".aidlc-rule-details/common/process-overview.md",
      kind: "file" as const,
      contentSignature: "rules-same"
    },
    {
      absolutePath: "C:/repo/.aidlc-rule-details/common/session-continuity.md",
      relativePath: ".aidlc-rule-details/common/session-continuity.md",
      kind: "missing" as const
    }
  ];

  const plan = buildSetupPlan({
    validation,
    mode: resolveSupportedSetupMode(validation),
    workspaceRoot: "C:/repo",
    sourceFiles,
    existingTargets
  });

  assert.equal(plan.planStatus, "ready");
  assert.deepEqual(
    plan.targetMappings.map((mapping) => [mapping.destinationRelativePath, mapping.operationType]),
    [
      [".aidlc-rule-details/common/process-overview.md", "skip"],
      [".aidlc-rule-details/common/session-continuity.md", "create"],
      ["AGENTS.md", "update"]
    ]
  );
});

test("summarizeSetupExecution reports complete outcome coverage", () => {
  const results: SetupExecutionResult[] = [
    { destinationRelativePath: "AGENTS.md", status: "updated", detail: "updated" },
    { destinationRelativePath: ".aidlc-rule-details/common/process-overview.md", status: "skipped", detail: "same" },
    { destinationRelativePath: ".aidlc-rule-details/common/question-format-guide.md", status: "blocked", detail: "blocked" },
    { destinationRelativePath: ".aidlc-rule-details/common/welcome-message.md", status: "failed", detail: "failed" },
    { destinationRelativePath: ".aidlc-rule-details/common/session-continuity.md", status: "not-attempted", detail: "later" }
  ];

  const outcome = summarizeSetupExecution(CODEX_SETUP_MODE.label, results);
  assert.equal(outcome.completionStatus, "partial");
  assert.deepEqual(outcome.updatedPaths, ["AGENTS.md"]);
  assert.deepEqual(outcome.failedPaths, [".aidlc-rule-details/common/welcome-message.md"]);
  assert.deepEqual(outcome.notAttemptedPaths, [".aidlc-rule-details/common/session-continuity.md"]);
});
