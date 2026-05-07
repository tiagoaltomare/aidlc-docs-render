import * as path from "node:path";
import { RuntimeDocumentIndex } from "./documents";

export const REFRESH_TRIGGER_SOURCES = {
  startup: "startup",
  watcher: "watcher",
  manual: "manual",
  save: "save",
  bootstrap: "bootstrap"
} as const;

export type RefreshTriggerSource =
  (typeof REFRESH_TRIGGER_SOURCES)[keyof typeof REFRESH_TRIGGER_SOURCES];

export const RUNTIME_SYNC_LIFECYCLES = {
  current: "current",
  refreshing: "refreshing",
  degraded: "degraded",
  stale: "stale",
  failed: "failed"
} as const;

export type RuntimeSyncLifecycle =
  (typeof RUNTIME_SYNC_LIFECYCLES)[keyof typeof RUNTIME_SYNC_LIFECYCLES];

export const PREVIEW_AVAILABILITY = {
  current: "current",
  stale: "stale",
  unavailable: "unavailable"
} as const;

export type PreviewAvailabilityStatus =
  (typeof PREVIEW_AVAILABILITY)[keyof typeof PREVIEW_AVAILABILITY];

export const DELIVERY_CHECK_RESULTS = {
  passed: "passed",
  failed: "failed",
  blocked: "blocked",
  notRun: "not-run"
} as const;

export type DeliveryCheckResult =
  (typeof DELIVERY_CHECK_RESULTS)[keyof typeof DELIVERY_CHECK_RESULTS];

export interface RefreshTrigger {
  readonly source: RefreshTriggerSource;
  readonly paths: readonly string[];
  readonly fullRefresh: boolean;
  readonly requestedAt: string;
}

export interface RefreshWorkClassification {
  readonly relevant: boolean;
  readonly requiresFullRefresh: boolean;
  readonly reason: string;
}

export interface RuntimeSyncState {
  readonly lifecycle: RuntimeSyncLifecycle;
  readonly message: string;
  readonly lastTriggerSource: RefreshTriggerSource | null;
  readonly lastSuccessfulRefreshAt: string | null;
  readonly sequence: number;
}

export interface PreviewAvailabilityState {
  readonly status: PreviewAvailabilityStatus;
  readonly message: string | null;
}

export interface DeliveryReadinessCheck {
  readonly id: string;
  readonly category: "build" | "test" | "packaging";
  readonly result: DeliveryCheckResult;
  readonly detail: string;
}

export interface DeliveryReadinessReport {
  readonly overallResult: DeliveryCheckResult;
  readonly checks: readonly DeliveryReadinessCheck[];
  readonly blockerSummary: readonly string[];
  readonly summaryMessage: string;
}

const RELEVANT_READINESS_FILES = new Set([
  "package.json",
  "tsconfig.json",
  "tsconfig.test.json",
  "scripts/build.mjs",
  "scripts/package-check.mjs"
]);

export function createInitialRuntimeSyncState(): RuntimeSyncState {
  return {
    lifecycle: RUNTIME_SYNC_LIFECYCLES.current,
    message: "Runtime state is current.",
    lastTriggerSource: null,
    lastSuccessfulRefreshAt: null,
    sequence: 0
  };
}

export function classifyRefreshTrigger(
  trigger: RefreshTrigger,
  activeRootPath: string | null
): RefreshWorkClassification {
  if (trigger.source === REFRESH_TRIGGER_SOURCES.manual) {
    return {
      relevant: true,
      requiresFullRefresh: true,
      reason: "Manual refresh always forces a full runtime resynchronization."
    };
  }

  if (trigger.source === REFRESH_TRIGGER_SOURCES.startup || trigger.source === REFRESH_TRIGGER_SOURCES.bootstrap) {
    return {
      relevant: true,
      requiresFullRefresh: true,
      reason: "Startup and bootstrap refreshes rebuild runtime state from the workspace."
    };
  }

  if (trigger.source === REFRESH_TRIGGER_SOURCES.save) {
    return {
      relevant: true,
      requiresFullRefresh: false,
      reason: "Saved answer changes must resynchronize runtime state."
    };
  }

  const normalizedRoot = activeRootPath ? path.resolve(activeRootPath) : null;
  const hasRelevantPath = trigger.paths.some((candidatePath) => {
    const resolvedPath = path.resolve(candidatePath);
    if (normalizedRoot) {
      const relative = path.relative(normalizedRoot, resolvedPath);
      if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
        return candidatePath.toLowerCase().endsWith(".md");
      }
    }

    const normalizedCandidate = candidatePath.replace(/\\/g, "/");
    return [...RELEVANT_READINESS_FILES].some((relevantPath) =>
      normalizedCandidate === relevantPath || normalizedCandidate.endsWith(`/${relevantPath}`)
    );
  });

  return hasRelevantPath
    ? {
        relevant: true,
        requiresFullRefresh: !normalizedRoot || trigger.paths.some((candidatePath) => {
          const normalizedCandidate = candidatePath.replace(/\\/g, "/");
          return [...RELEVANT_READINESS_FILES].some((relevantPath) =>
            normalizedCandidate === relevantPath || normalizedCandidate.endsWith(`/${relevantPath}`)
          );
        }),
        reason: "Watcher event affects docs content or delivery-readiness inputs."
      }
    : {
        relevant: false,
        requiresFullRefresh: false,
        reason: "Watcher event is outside the relevant docs and readiness scope."
      };
}

export function coalesceRefreshTriggers(
  current: RefreshTrigger | null,
  next: RefreshTrigger
): RefreshTrigger {
  if (!current) {
    return next;
  }

  const mergedPaths = new Set([...current.paths, ...next.paths]);
  return {
    source: next.fullRefresh ? next.source : current.fullRefresh ? current.source : next.source,
    paths: [...mergedPaths].sort(),
    fullRefresh: current.fullRefresh || next.fullRefresh,
    requestedAt: next.requestedAt
  };
}

export function deriveRefreshingSyncState(
  current: RuntimeSyncState,
  trigger: RefreshTrigger
): RuntimeSyncState {
  return {
    lifecycle: RUNTIME_SYNC_LIFECYCLES.refreshing,
    message: `Refreshing runtime state after ${trigger.source}.`,
    lastTriggerSource: trigger.source,
    lastSuccessfulRefreshAt: current.lastSuccessfulRefreshAt,
    sequence: current.sequence + 1
  };
}

export function deriveSucceededSyncState(
  current: RuntimeSyncState,
  trigger: RefreshTrigger,
  completedAt: string,
  emptyState: boolean
): RuntimeSyncState {
  return {
    lifecycle: RUNTIME_SYNC_LIFECYCLES.current,
    message: emptyState
      ? "Refresh completed. The active docs root is valid but currently empty."
      : `Refresh completed after ${trigger.source}.`,
    lastTriggerSource: trigger.source,
    lastSuccessfulRefreshAt: completedAt,
    sequence: current.sequence
  };
}

export function deriveFailedSyncState(
  current: RuntimeSyncState,
  trigger: RefreshTrigger,
  preservedLastValidState: boolean,
  detail: string
): RuntimeSyncState {
  return {
    lifecycle: preservedLastValidState
      ? RUNTIME_SYNC_LIFECYCLES.degraded
      : RUNTIME_SYNC_LIFECYCLES.failed,
    message: preservedLastValidState
      ? `Refresh after ${trigger.source} failed. The last valid state is still available. ${detail}`
      : `Refresh after ${trigger.source} failed and no valid state is available. ${detail}`,
    lastTriggerSource: trigger.source,
    lastSuccessfulRefreshAt: current.lastSuccessfulRefreshAt,
    sequence: current.sequence
  };
}

export function derivePreviewAvailability(
  currentIndex: RuntimeDocumentIndex | null,
  lastValidIndex: RuntimeDocumentIndex | null,
  documentAbsolutePath: string
): PreviewAvailabilityState {
  if (currentIndex?.documents.some((document) => document.absolutePath === documentAbsolutePath)) {
    return {
      status: PREVIEW_AVAILABILITY.current,
      message: null
    };
  }

  if (lastValidIndex?.documents.some((document) => document.absolutePath === documentAbsolutePath)) {
    return {
      status: PREVIEW_AVAILABILITY.stale,
      message: "This preview is showing a stale document snapshot because the active docs index no longer matches it."
    };
  }

  return {
    status: PREVIEW_AVAILABILITY.unavailable,
    message: "This preview document is no longer available in the active docs index."
  };
}

export function deriveDeliveryReadinessReport(
  checks: readonly DeliveryReadinessCheck[]
): DeliveryReadinessReport {
  const blockerSummary = checks
    .filter((check) => check.result === DELIVERY_CHECK_RESULTS.failed || check.result === DELIVERY_CHECK_RESULTS.blocked)
    .map((check) => `${check.category}: ${check.detail}`);

  const overallResult = checks.some((check) => check.result === DELIVERY_CHECK_RESULTS.failed)
    ? DELIVERY_CHECK_RESULTS.failed
    : checks.some((check) => check.result === DELIVERY_CHECK_RESULTS.blocked)
      ? DELIVERY_CHECK_RESULTS.blocked
      : checks.some((check) => check.result === DELIVERY_CHECK_RESULTS.notRun)
        ? DELIVERY_CHECK_RESULTS.notRun
        : DELIVERY_CHECK_RESULTS.passed;

  return {
    overallResult,
    checks,
    blockerSummary,
    summaryMessage: buildDeliverySummary(overallResult, checks)
  };
}

function buildDeliverySummary(
  overallResult: DeliveryCheckResult,
  checks: readonly DeliveryReadinessCheck[]
): string {
  const counts = {
    passed: checks.filter((check) => check.result === DELIVERY_CHECK_RESULTS.passed).length,
    failed: checks.filter((check) => check.result === DELIVERY_CHECK_RESULTS.failed).length,
    blocked: checks.filter((check) => check.result === DELIVERY_CHECK_RESULTS.blocked).length,
    notRun: checks.filter((check) => check.result === DELIVERY_CHECK_RESULTS.notRun).length
  };

  return `Delivery readiness is ${overallResult}: ${counts.passed} passed, ${counts.failed} failed, ${counts.blocked} blocked, ${counts.notRun} not run.`;
}
