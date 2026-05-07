import { DiscoveryState, NavigationGroup, RuntimeDocumentIndex, RuntimeDocumentRecord } from "./documents";
import { NavigatorHostType, RuntimeStatusSnapshot } from "./contracts";
import { RuntimeSyncState } from "./refresh";

export const NAVIGATOR_VIEW_MODES = {
  ready: "ready",
  empty: "empty",
  unavailable: "unavailable",
  degraded: "degraded"
} as const;

export type NavigatorViewMode = (typeof NAVIGATOR_VIEW_MODES)[keyof typeof NAVIGATOR_VIEW_MODES];

export interface NavigatorDocumentSummary {
  readonly relativePath: string;
  readonly title: string;
  readonly phase: string;
  readonly section: string | null;
  readonly subsection: string | null;
}

export interface NavigatorGroupView {
  readonly id: string;
  readonly label: string;
  readonly type: NavigationGroup["type"];
  readonly documents: readonly NavigatorDocumentSummary[];
  readonly children: readonly NavigatorGroupView[];
}

export interface NavigatorStatePayload {
  readonly mode: NavigatorViewMode;
  readonly searchQuery: string;
  readonly activeIndexVersion: number | null;
  readonly activeRootPath: string | null;
  readonly statusMessage: string;
  readonly syncState: RuntimeSyncState;
  readonly groups: readonly NavigatorGroupView[];
}

export interface NavigatorHostStatePayload {
  readonly hostType: NavigatorHostType;
  readonly runtimeStatus: RuntimeStatusSnapshot;
  readonly navigator: NavigatorStatePayload;
}

export interface NavigatorOpenDocumentRequest {
  readonly relativePath: string;
  readonly expectedIndexVersion: number;
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function deriveNavigatorState(
  runtimeStatus: RuntimeStatusSnapshot,
  discoveryState: DiscoveryState,
  activeIndex: RuntimeDocumentIndex | null,
  searchQuery: string,
  syncState: RuntimeSyncState
): NavigatorStatePayload {
  const normalizedQuery = normalizeSearchQuery(searchQuery);
  const mode = deriveNavigatorMode(runtimeStatus, discoveryState, activeIndex);
  const statusMessage = deriveStatusMessage(mode, discoveryState, activeIndex, syncState);
  const groups = activeIndex
    ? projectNavigationGroups(activeIndex, normalizedQuery)
    : [];

  return {
    mode,
    searchQuery,
    activeIndexVersion: activeIndex?.version ?? null,
    activeRootPath: activeIndex?.activeRoot.absolutePath ?? discoveryState.activeRoot?.absolutePath ?? null,
    statusMessage,
    syncState,
    groups
  };
}

export function projectNavigationGroups(
  activeIndex: RuntimeDocumentIndex,
  normalizedQuery: string
): readonly NavigatorGroupView[] {
  const documentMap = new Map<string, NavigatorDocumentSummary>(
    activeIndex.documents.map((document) => [document.relativePath, toDocumentSummary(document)])
  );

  const mappedGroups = activeIndex.navigationGroups.map((group) => mapNavigationGroup(group, documentMap));
  if (!normalizedQuery) {
    return mappedGroups;
  }

  return mappedGroups
    .map((group) => filterGroup(group, normalizedQuery))
    .filter((group): group is NavigatorGroupView => group !== null);
}

export function findDocumentByRelativePath(
  activeIndex: RuntimeDocumentIndex | null,
  relativePath: string
): RuntimeDocumentRecord | null {
  if (!activeIndex) {
    return null;
  }

  return activeIndex.documents.find((document) => document.relativePath === relativePath) ?? null;
}

export function validateOpenRequest(
  activeIndex: RuntimeDocumentIndex | null,
  request: NavigatorOpenDocumentRequest
): RuntimeDocumentRecord | null {
  if (!activeIndex || activeIndex.version !== request.expectedIndexVersion) {
    return null;
  }

  return findDocumentByRelativePath(activeIndex, request.relativePath);
}

function deriveNavigatorMode(
  runtimeStatus: RuntimeStatusSnapshot,
  discoveryState: DiscoveryState,
  activeIndex: RuntimeDocumentIndex | null
): NavigatorViewMode {
  if (activeIndex?.status === "ready") {
    return NAVIGATOR_VIEW_MODES.ready;
  }

  if (activeIndex?.status === "empty" || discoveryState.mode === "empty") {
    return NAVIGATOR_VIEW_MODES.empty;
  }

  if (runtimeStatus.lifecycle === "failed" || discoveryState.mode === "failed") {
    return NAVIGATOR_VIEW_MODES.degraded;
  }

  return NAVIGATOR_VIEW_MODES.unavailable;
}

function deriveStatusMessage(
  mode: NavigatorViewMode,
  discoveryState: DiscoveryState,
  activeIndex: RuntimeDocumentIndex | null,
  syncState: RuntimeSyncState
): string {
  if (syncState.lifecycle === "refreshing") {
    return syncState.message;
  }

  if (syncState.lifecycle === "degraded" || syncState.lifecycle === "stale" || syncState.lifecycle === "failed") {
    return syncState.message;
  }

  if (mode === NAVIGATOR_VIEW_MODES.ready) {
    return `${activeIndex?.documents.length ?? 0} documents available.`;
  }

  if (mode === NAVIGATOR_VIEW_MODES.empty) {
    return "The active docs root is valid, but no markdown files were found.";
  }

  if (mode === NAVIGATOR_VIEW_MODES.degraded) {
    return discoveryState.error ?? "The navigator is degraded and cannot resolve the current document state.";
  }

  return discoveryState.error ?? "No AIDLC docs root is active yet. Choose a docs root to begin browsing.";
}

function toDocumentSummary(document: RuntimeDocumentRecord): NavigatorDocumentSummary {
  return {
    relativePath: document.relativePath,
    title: document.title,
    phase: document.phase,
    section: document.section,
    subsection: document.subsection
  };
}

function mapNavigationGroup(
  group: NavigationGroup,
  documentMap: ReadonlyMap<string, NavigatorDocumentSummary>
): NavigatorGroupView {
  return {
    id: group.id,
    label: group.label,
    type: group.type,
    documents: group.documentPaths
      .map((path) => documentMap.get(path))
      .filter((document): document is NavigatorDocumentSummary => Boolean(document)),
    children: group.children.map((child) => mapNavigationGroup(child, documentMap))
  };
}

function filterGroup(group: NavigatorGroupView, normalizedQuery: string): NavigatorGroupView | null {
  const documents = group.documents.filter((document) => matchesDocument(document, normalizedQuery));
  const children = group.children
    .map((child) => filterGroup(child, normalizedQuery))
    .filter((child): child is NavigatorGroupView => child !== null);

  if (documents.length === 0 && children.length === 0) {
    return null;
  }

  return {
    ...group,
    documents,
    children
  };
}

function matchesDocument(document: NavigatorDocumentSummary, normalizedQuery: string): boolean {
  const title = document.title.toLowerCase();
  const relativePath = document.relativePath.toLowerCase();
  return title.includes(normalizedQuery) || relativePath.includes(normalizedQuery);
}
