import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyRefreshTrigger,
  coalesceRefreshTriggers,
  createInitialRuntimeSyncState,
  DELIVERY_CHECK_RESULTS,
  deriveDeliveryReadinessReport,
  deriveFailedSyncState,
  derivePreviewAvailability,
  deriveRefreshingSyncState,
  deriveSucceededSyncState
} from "../../src/shared/refresh";
import { RuntimeDocumentIndex } from "../../src/shared/documents";

test("classifyRefreshTrigger ignores unrelated watcher noise", () => {
  const classification = classifyRefreshTrigger({
    source: "watcher",
    paths: ["C:/workspace/node_modules/pkg/index.js"],
    fullRefresh: false,
    requestedAt: "2026-05-07T14:00:00Z"
  }, "C:/workspace/aidlc-docs");

  assert.equal(classification.relevant, false);
});

test("classifyRefreshTrigger marks docs markdown and package inputs as relevant", () => {
  const docClassification = classifyRefreshTrigger({
    source: "watcher",
    paths: ["C:/workspace/aidlc-docs/inception/requirements.md"],
    fullRefresh: false,
    requestedAt: "2026-05-07T14:00:00Z"
  }, "C:/workspace/aidlc-docs");
  const packageClassification = classifyRefreshTrigger({
    source: "watcher",
    paths: ["C:/workspace/package.json"],
    fullRefresh: false,
    requestedAt: "2026-05-07T14:00:00Z"
  }, "C:/workspace/aidlc-docs");

  assert.equal(docClassification.relevant, true);
  assert.equal(docClassification.requiresFullRefresh, false);
  assert.equal(packageClassification.relevant, true);
  assert.equal(packageClassification.requiresFullRefresh, true);
});

test("coalesceRefreshTriggers preserves full refresh intent and merges paths", () => {
  const merged = coalesceRefreshTriggers({
    source: "watcher",
    paths: ["a.md"],
    fullRefresh: false,
    requestedAt: "2026-05-07T14:00:00Z"
  }, {
    source: "manual",
    paths: ["package.json"],
    fullRefresh: true,
    requestedAt: "2026-05-07T14:00:01Z"
  });

  assert.equal(merged.fullRefresh, true);
  assert.deepEqual(merged.paths, ["a.md", "package.json"]);
  assert.equal(merged.source, "manual");
});

test("sync-state helpers preserve last successful refresh on failures", () => {
  const initial = createInitialRuntimeSyncState();
  assert.equal(initial.lifecycle, "current");
  const refreshing = deriveRefreshingSyncState(initial, {
    source: "manual",
    paths: [],
    fullRefresh: true,
    requestedAt: "2026-05-07T14:00:00Z"
  });
  const succeeded = deriveSucceededSyncState(refreshing, {
    source: "manual",
    paths: [],
    fullRefresh: true,
    requestedAt: "2026-05-07T14:00:00Z"
  }, "2026-05-07T14:00:05Z", false);
  const failed = deriveFailedSyncState(succeeded, {
    source: "watcher",
    paths: ["a.md"],
    fullRefresh: false,
    requestedAt: "2026-05-07T14:00:06Z"
  }, true, "failed");

  assert.equal(succeeded.lastSuccessfulRefreshAt, "2026-05-07T14:00:05Z");
  assert.equal(failed.lifecycle, "degraded");
  assert.equal(failed.lastSuccessfulRefreshAt, "2026-05-07T14:00:05Z");
});

test("derivePreviewAvailability distinguishes current, stale, and unavailable states", () => {
  const currentIndex: RuntimeDocumentIndex = {
    activeRoot: {
      absolutePath: "C:/workspace/aidlc-docs",
      source: "auto-detected",
      version: 1
    },
    version: 1,
    status: "ready",
    documents: [{
      absolutePath: "C:/workspace/aidlc-docs/req.md",
      relativePath: "req.md",
      title: "Req",
      phase: "overview",
      section: null,
      subsection: null
    }],
    navigationGroups: []
  };
  const lastValidIndex: RuntimeDocumentIndex = {
    ...currentIndex,
    documents: [{
      absolutePath: "C:/workspace/aidlc-docs/old.md",
      relativePath: "old.md",
      title: "Old",
      phase: "overview",
      section: null,
      subsection: null
    }]
  };

  assert.equal(derivePreviewAvailability(currentIndex, lastValidIndex, "C:/workspace/aidlc-docs/req.md").status, "current");
  assert.equal(derivePreviewAvailability(currentIndex, lastValidIndex, "C:/workspace/aidlc-docs/old.md").status, "stale");
  assert.equal(derivePreviewAvailability(currentIndex, lastValidIndex, "C:/workspace/aidlc-docs/missing.md").status, "unavailable");
});

test("deriveDeliveryReadinessReport covers all result categories", () => {
  const report = deriveDeliveryReadinessReport([
    { id: "build", category: "build", result: DELIVERY_CHECK_RESULTS.passed, detail: "ok" },
    { id: "test", category: "test", result: DELIVERY_CHECK_RESULTS.notRun, detail: "pending" },
    { id: "package", category: "packaging", result: DELIVERY_CHECK_RESULTS.blocked, detail: "blocked" }
  ]);

  assert.equal(report.overallResult, DELIVERY_CHECK_RESULTS.blocked);
  assert.equal(report.blockerSummary.length, 1);
});
