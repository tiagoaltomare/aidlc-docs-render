import test from "node:test";
import assert from "node:assert/strict";
import { deriveRuntimeStatus } from "../../src/shared/runtimeStatus";
import { deriveNavigatorState, normalizeSearchQuery, validateOpenRequest } from "../../src/shared/navigator";
import { RuntimeDocumentIndex } from "../../src/shared/documents";
import { createInitialRuntimeSyncState } from "../../src/shared/refresh";

const runtimeStatus = deriveRuntimeStatus({
  criticalFailures: [],
  activeCapabilities: ["aidlc.openNavigatorPanel"]
});

const activeIndex: RuntimeDocumentIndex = {
  activeRoot: {
    absolutePath: "C:/workspace/aidlc-docs",
    source: "auto-detected",
    version: 2
  },
  version: 2,
  status: "ready",
  documents: [
    {
      absolutePath: "C:/workspace/aidlc-docs/inception/requirements/requirements.md",
      relativePath: "inception/requirements/requirements.md",
      title: "Requirements",
      phase: "inception",
      section: "requirements",
      subsection: null
    },
    {
      absolutePath: "C:/workspace/aidlc-docs/construction/plans/build.md",
      relativePath: "construction/plans/build.md",
      title: "Build Plan",
      phase: "construction",
      section: "plans",
      subsection: null
    }
  ],
  navigationGroups: [
    {
      id: "phase:inception",
      label: "inception",
      type: "phase",
      documentPaths: [],
      children: [
        {
          id: "phase:inception:section:requirements",
          label: "requirements",
          type: "section",
          documentPaths: ["inception/requirements/requirements.md"],
          children: []
        }
      ]
    },
    {
      id: "phase:construction",
      label: "construction",
      type: "phase",
      documentPaths: [],
      children: [
        {
          id: "phase:construction:section:plans",
          label: "plans",
          type: "section",
          documentPaths: ["construction/plans/build.md"],
          children: []
        }
      ]
    }
  ]
};

test("normalizeSearchQuery trims and lowercases input", () => {
  assert.equal(normalizeSearchQuery("  Build Plan "), "build plan");
});

test("deriveNavigatorState filters visible groups using search query", () => {
  const result = deriveNavigatorState(runtimeStatus, {
    mode: "detected",
    activeRoot: activeIndex.activeRoot,
    currentIndex: activeIndex,
    lastValidIndex: activeIndex,
    error: null
  }, activeIndex, "build", createInitialRuntimeSyncState());

  assert.equal(result.mode, "ready");
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0]?.label, "construction");
  assert.equal(result.groups[0]?.children[0]?.documents[0]?.title, "Build Plan");
});

test("validateOpenRequest rejects stale index versions", () => {
  const stale = validateOpenRequest(activeIndex, {
    relativePath: "construction/plans/build.md",
    expectedIndexVersion: 1
  });
  const valid = validateOpenRequest(activeIndex, {
    relativePath: "construction/plans/build.md",
    expectedIndexVersion: 2
  });

  assert.equal(stale, null);
  assert.equal(valid?.title, "Build Plan");
});
