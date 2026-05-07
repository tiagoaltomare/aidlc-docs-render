import {
  HOST_TO_WEBVIEW_ACTIONS,
  RuntimeContractDefinition,
  WEBVIEW_TO_HOST_ACTIONS
} from "./contracts";

export const FOUNDATION_RUNTIME_CONTRACTS: readonly RuntimeContractDefinition[] = [
  {
    name: "SearchQueryChangedRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.searchQueryChanged,
    requiredFields: ["query"],
    optionalFields: [],
    expectsResponse: true
  },
  {
    name: "OpenRawDocumentRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.openRawDocument,
    requiredFields: ["relativePath", "expectedIndexVersion"],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "OpenPreviewDocumentRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.openPreviewDocument,
    requiredFields: ["relativePath", "expectedIndexVersion"],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "SelectDocsRootRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.selectDocsRoot,
    requiredFields: [],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "RefreshRuntimeRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.refreshRuntime,
    requiredFields: [],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "RunDeliveryReadinessCheckRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.runDeliveryReadinessCheck,
    requiredFields: [],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "SaveAnswerEditsRequest",
    action: WEBVIEW_TO_HOST_ACTIONS.saveAnswerEdits,
    requiredFields: ["relativePath", "expectedIndexVersion", "fieldValues"],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "NavigatorStateChangedEvent",
    action: HOST_TO_WEBVIEW_ACTIONS.navigatorStateChanged,
    requiredFields: ["runtimeStatus", "navigator"],
    optionalFields: [],
    expectsResponse: false
  },
  {
    name: "PreviewStateChangedEvent",
    action: HOST_TO_WEBVIEW_ACTIONS.previewStateChanged,
    requiredFields: ["runtimeStatus", "preview"],
    optionalFields: [],
    expectsResponse: false
  }
];

export function getContractByAction(action: string): RuntimeContractDefinition | undefined {
  return FOUNDATION_RUNTIME_CONTRACTS.find((contract) => contract.action === action);
}
