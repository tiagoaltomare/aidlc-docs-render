export const COMMAND_IDS = {
  openNavigatorPanel: "aidlc.openNavigatorPanel",
  focusNavigatorView: "aidlc.focusNavigatorView",
  selectDocsRoot: "aidlc.selectDocsRoot",
  startGuidedSetup: "aidlc.startGuidedSetup",
  manualRefresh: "aidlc.manualRefresh",
  checkDeliveryReadiness: "aidlc.checkDeliveryReadiness"
} as const;

export const VIEW_IDS = {
  navigatorContainer: "aidlcNavigator",
  sideView: "aidlcNavigator.sideView"
} as const;

export const CUSTOM_EDITOR_IDS = {
  renderedPreview: "aidlc.renderedPreview"
} as const;
