export const HOST_TYPES = {
  panel: "panel",
  sideView: "side-view"
} as const;

export type NavigatorHostType = (typeof HOST_TYPES)[keyof typeof HOST_TYPES];

export const RUNTIME_LIFECYCLE = {
  notInitialized: "not-initialized",
  initializing: "initializing",
  ready: "ready",
  degraded: "degraded",
  failed: "failed"
} as const;

export type RuntimeLifecycle = (typeof RUNTIME_LIFECYCLE)[keyof typeof RUNTIME_LIFECYCLE];

export interface ContributionDefinition {
  readonly id: string;
  readonly type: "command" | "view" | "customEditor";
  readonly label: string;
  readonly critical: boolean;
}

export interface ContributionState extends ContributionDefinition {
  readonly status: "pending" | "active" | "failed" | "disposed";
  readonly detail?: string;
}

export interface RuntimeContractDefinition {
  readonly name: string;
  readonly action: WebviewToHostAction | HostToWebviewAction;
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly expectsResponse: boolean;
}

export interface RuntimeStatusSnapshot {
  readonly lifecycle: RuntimeLifecycle;
  readonly readyCapabilities: readonly string[];
  readonly degradedCapabilities: readonly string[];
  readonly blockingFailures: readonly string[];
}

export interface FoundationHostStatePayload {
  readonly hostType: NavigatorHostType;
  readonly runtimeStatus: RuntimeStatusSnapshot;
}

export const WEBVIEW_TO_HOST_ACTIONS = {
  searchQueryChanged: "navigator.search-query-changed",
  openRawDocument: "navigator.open-raw-document",
  openPreviewDocument: "navigator.open-preview-document",
  selectDocsRoot: "navigator.select-docs-root",
  refreshRuntime: "navigator.refresh-runtime",
  runDeliveryReadinessCheck: "navigator.run-delivery-readiness-check",
  saveAnswerEdits: "preview.save-answer-edits"
} as const;

export type WebviewToHostAction =
  (typeof WEBVIEW_TO_HOST_ACTIONS)[keyof typeof WEBVIEW_TO_HOST_ACTIONS];

export const HOST_TO_WEBVIEW_ACTIONS = {
  navigatorStateChanged: "navigator.state-changed",
  previewStateChanged: "preview.state-changed"
} as const;

export type HostToWebviewAction =
  (typeof HOST_TO_WEBVIEW_ACTIONS)[keyof typeof HOST_TO_WEBVIEW_ACTIONS];

export interface WebviewToHostMessage {
  readonly action: WebviewToHostAction;
  readonly payload?: Record<string, unknown>;
}

export interface HostToWebviewMessage {
  readonly action: HostToWebviewAction;
  readonly payload: Record<string, unknown>;
}

const commandIdPattern = /^aidlc\.[a-z][A-Za-z0-9]*$/;

export function isNavigatorHostType(value: string): value is NavigatorHostType {
  return value === HOST_TYPES.panel || value === HOST_TYPES.sideView;
}

export function isWebviewToHostAction(value: string): value is WebviewToHostAction {
  return Object.values(WEBVIEW_TO_HOST_ACTIONS).includes(value as WebviewToHostAction);
}

export function isHostToWebviewAction(value: string): value is HostToWebviewAction {
  return Object.values(HOST_TO_WEBVIEW_ACTIONS).includes(value as HostToWebviewAction);
}

export function validateCommandId(commandId: string): boolean {
  return commandIdPattern.test(commandId);
}

export function validateRequiredFields(
  payload: Record<string, unknown> | undefined,
  requiredFields: readonly string[]
): boolean {
  if (!payload) {
    return requiredFields.length === 0;
  }

  return requiredFields.every((field) => field in payload);
}
