import test from "node:test";
import assert from "node:assert/strict";
import {
  AIDLC_PHASES,
  buildNavigationGroups,
  derivePhase,
  deriveSection,
  deriveSubsection,
  deriveTitle,
  normalizeRelativePath,
  replaceIndexState,
  RuntimeDocumentIndex
} from "../../src/shared/documents";

test("normalizeRelativePath produces stable slash-separated paths", () => {
  assert.equal(
    normalizeRelativePath("C:\\repo\\aidlc-docs", "C:\\repo\\aidlc-docs\\inception\\requirements\\req.md"),
    "inception/requirements/req.md"
  );
});

test("deriveTitle prefers markdown h1 and falls back to filename", () => {
  assert.equal(deriveTitle("# Hello World\n\nBody", "inception/test.md"), "Hello World");
  assert.equal(deriveTitle("No heading", "construction/my-file_name.md"), "My File Name");
});

test("derivePhase and grouping helpers map expected sections", () => {
  assert.equal(derivePhase("aidlc-state.md"), AIDLC_PHASES.overview);
  assert.equal(derivePhase("inception/requirements/req.md"), AIDLC_PHASES.inception);
  assert.equal(deriveSection("inception/requirements/req.md"), "requirements");
  assert.equal(deriveSubsection("construction/unit-a/functional-design/file.md"), "functional-design");
});

test("buildNavigationGroups creates stable grouped output", () => {
  const groups = buildNavigationGroups([
    {
      absolutePath: "C:/repo/aidlc-docs/inception/requirements/req.md",
      relativePath: "inception/requirements/req.md",
      title: "Requirements",
      phase: AIDLC_PHASES.inception,
      section: "requirements",
      subsection: null
    },
    {
      absolutePath: "C:/repo/aidlc-docs/aidlc-state.md",
      relativePath: "aidlc-state.md",
      title: "State",
      phase: AIDLC_PHASES.overview,
      section: null,
      subsection: null
    }
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.label, "overview");
  assert.equal(groups[1]?.label, "inception");
  assert.equal(groups[1]?.children[0]?.label, "requirements");
});

test("replaceIndexState preserves current index when replacement is invalid", () => {
  const readyIndex: RuntimeDocumentIndex = {
    activeRoot: {
      absolutePath: "C:/repo/aidlc-docs",
      source: "auto-detected",
      version: 1
    },
    documents: [],
    navigationGroups: [],
    version: 1,
    status: "ready"
  };

  const currentState = {
    mode: "detected" as const,
    activeRoot: readyIndex.activeRoot,
    currentIndex: readyIndex,
    lastValidIndex: readyIndex,
    error: null
  };

  const result = replaceIndexState(currentState, null, "failed", "bad root");
  assert.equal(result.replaced, false);
  assert.equal(result.nextState.currentIndex, readyIndex);
  assert.equal(result.nextState.error, "bad root");
});
