import * as vscode from "vscode";
import { createContributionRegistry, listActiveCapabilities, markContributionFailure, registerContribution } from "../shared/contributionRegistry";
import { ContributionDefinition, validateCommandId } from "../shared/contracts";
import { DeliveryReadinessCheck, DELIVERY_CHECK_RESULTS } from "../shared/refresh";
import { FOUNDATION_RUNTIME_CONTRACTS } from "../shared/runtimeContracts";
import { deriveRuntimeStatus } from "../shared/runtimeStatus";
import { BootstrapSetupService } from "./bootstrap/bootstrapSetupService";
import { COMMAND_IDS, CUSTOM_EDITOR_IDS, VIEW_IDS } from "./constants";
import { DiscoveryService } from "./discovery/discoveryService";
import { RefreshCoordinator } from "./refresh/refreshCoordinator";
import { RenderedPreviewProvider } from "./renderedPreviewProvider";
import { ExtensionFoundationRuntimeContext } from "./runtime/runtimeContext";
import { NavigatorHostManager } from "./webview/navigatorHostManager";
import { NavigatorOpenDocumentRequest, validateOpenRequest } from "../shared/navigator";

let runtimeContextPromise: Promise<ExtensionFoundationRuntimeContext> | undefined;
let runtimeContext: ExtensionFoundationRuntimeContext | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<ExtensionFoundationRuntimeContext> {
  if (runtimeContext) {
    return runtimeContext;
  }

  if (runtimeContextPromise) {
    return runtimeContextPromise;
  }

  runtimeContextPromise = initializeRuntime(context);
  runtimeContext = await runtimeContextPromise;
  runtimeContextPromise = undefined;
  return runtimeContext;
}

export function deactivate(): void {
  runtimeContext = undefined;
  runtimeContextPromise = undefined;
}

async function initializeRuntime(
  context: vscode.ExtensionContext
): Promise<ExtensionFoundationRuntimeContext> {
  const contributionRegistry = createContributionRegistry();
  const initialStatus = deriveRuntimeStatus({
    criticalFailures: [],
    activeCapabilities: [],
    initializing: true
  });

  const discoveryService = new DiscoveryService();
  const bootstrapSetupService = new BootstrapSetupService();
  let foundationContext: ExtensionFoundationRuntimeContext;

  const renderedPreviewProvider = new RenderedPreviewProvider(
    context.extensionUri,
    () => foundationContext.status,
    () => foundationContext.syncState,
    () => foundationContext.activeIndex,
    () => foundationContext.discoveryState,
    async (documentPath) => {
      await foundationContext.refreshCoordinator.requestRefresh(
        RefreshCoordinator.createTrigger("save", [documentPath], false)
      );
    }
  );

  const refreshCoordinator = new RefreshCoordinator({
    getDiscoveryState: () => foundationContext.discoveryState,
    detectDocsRoot: () => discoveryService.detectDocsRoot(vscode.workspace.workspaceFolders),
    refreshDiscovery: () => discoveryService.refresh(),
    publishRuntimeState: (syncState, discoveryState) => {
      foundationContext.syncState = syncState;
      foundationContext.discoveryState = discoveryState;
      foundationContext.activeIndex = discoveryState.currentIndex;
      syncHostState(foundationContext);
    },
    validateDeliveryReadiness: () => validateDeliveryReadiness(resolveWorkspaceRoot())
  });

  const hostManager = new NavigatorHostManager(
    context.extensionUri,
    initialStatus,
    refreshCoordinator.getSyncState(),
    discoveryService.getState(),
    null,
    {
      onSelectDocsRoot: async () => {
        foundationContext.discoveryState = await foundationContext.discoveryService.chooseDocsRoot();
        foundationContext.activeIndex = foundationContext.discoveryState.currentIndex;
        syncHostState(foundationContext);
      },
      onRefreshRuntime: async () => {
        await foundationContext.refreshCoordinator.requestRefresh(
          RefreshCoordinator.createTrigger("manual", [], true)
        );
      },
      onRunDeliveryReadinessCheck: async () => {
        await foundationContext.refreshCoordinator.runDeliveryReadinessCheck();
      },
      onOpenRawDocument: async (request) => {
        await openRawDocument(foundationContext, request);
      },
      onOpenPreviewDocument: async (request) => {
        await openPreviewDocument(foundationContext, request);
      }
    }
  );

  foundationContext = {
    extensionContext: context,
    contributionRegistry,
    contractRegistry: FOUNDATION_RUNTIME_CONTRACTS,
    hostManager,
    discoveryService,
    bootstrapSetupService,
    renderedPreviewProvider,
    refreshCoordinator,
    status: initialStatus,
    syncState: refreshCoordinator.getSyncState(),
    discoveryState: discoveryService.getState(),
    activeIndex: null
  };

  context.subscriptions.push(bootstrapSetupService, refreshCoordinator);

  const failures: string[] = [];

  registerWithHandling(contributionRegistry, failures, {
    id: COMMAND_IDS.openNavigatorPanel,
    type: "command",
    label: "Open AIDLC Navigator Panel",
    critical: true
  }, () => {
    context.subscriptions.push(
      vscode.commands.registerCommand(COMMAND_IDS.openNavigatorPanel, () => {
        foundationContext.hostManager.openPanel();
      })
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: COMMAND_IDS.focusNavigatorView,
    type: "command",
    label: "Focus AIDLC Navigator View",
    critical: false
  }, () => {
    context.subscriptions.push(
      vscode.commands.registerCommand(COMMAND_IDS.focusNavigatorView, async () => {
        await vscode.commands.executeCommand(`${VIEW_IDS.sideView}.focus`);
      })
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: COMMAND_IDS.selectDocsRoot,
    type: "command",
    label: "Select AIDLC Docs Root",
    critical: false
  }, () => {
    context.subscriptions.push(
      vscode.commands.registerCommand(COMMAND_IDS.selectDocsRoot, async () => {
        foundationContext.discoveryState = await foundationContext.discoveryService.chooseDocsRoot();
        foundationContext.activeIndex = foundationContext.discoveryState.currentIndex;
        syncHostState(foundationContext);
      })
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: COMMAND_IDS.startGuidedSetup,
    type: "command",
    label: "Start Guided AIDLC Setup",
    critical: false
  }, () => {
    context.subscriptions.push(
      vscode.commands.registerCommand(COMMAND_IDS.startGuidedSetup, async () => {
        const outcome = await foundationContext.bootstrapSetupService.runGuidedSetup();
        if (!outcome || outcome.completionStatus === "cancelled") {
          return;
        }

        await foundationContext.refreshCoordinator.requestRefresh(
          RefreshCoordinator.createTrigger("bootstrap", [], true)
        );
      })
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: COMMAND_IDS.manualRefresh,
    type: "command",
    label: "Refresh AIDLC Runtime",
    critical: false
  }, () => {
    context.subscriptions.push(
      vscode.commands.registerCommand(COMMAND_IDS.manualRefresh, async () => {
        await foundationContext.refreshCoordinator.requestRefresh(
          RefreshCoordinator.createTrigger("manual", [], true)
        );
      })
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: COMMAND_IDS.checkDeliveryReadiness,
    type: "command",
    label: "Check AIDLC Delivery Readiness",
    critical: false
  }, () => {
    context.subscriptions.push(
      vscode.commands.registerCommand(COMMAND_IDS.checkDeliveryReadiness, async () => {
        await foundationContext.refreshCoordinator.runDeliveryReadinessCheck();
      })
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: VIEW_IDS.sideView,
    type: "view",
    label: "AIDLC Navigator Side View",
    critical: true
  }, () => {
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        VIEW_IDS.sideView,
        foundationContext.hostManager.getSideViewProvider()
      )
    );
  });

  registerWithHandling(contributionRegistry, failures, {
    id: CUSTOM_EDITOR_IDS.renderedPreview,
    type: "customEditor",
    label: "AIDLC Rendered Preview",
    critical: false
  }, () => {
    context.subscriptions.push(
      vscode.window.registerCustomEditorProvider(
        CUSTOM_EDITOR_IDS.renderedPreview,
        renderedPreviewProvider
      )
    );
  });

  const activeCapabilities = listActiveCapabilities(contributionRegistry);
  const degradedCapabilities = [...contributionRegistry.commands.values(), ...contributionRegistry.views.values(), ...contributionRegistry.customEditors.values()]
    .filter((item) => item.status === "failed")
    .map((item) => item.id);

  foundationContext.status = deriveRuntimeStatus({
    criticalFailures: failures,
    activeCapabilities,
    degradedCapabilities
  });

  foundationContext.discoveryState = await foundationContext.discoveryService.detectDocsRoot(
    vscode.workspace.workspaceFolders
  );
  foundationContext.activeIndex = foundationContext.discoveryState.currentIndex;

  const watcher = vscode.workspace.createFileSystemWatcher("**/*");
  context.subscriptions.push(watcher);
  const handleWatcherEvent = (uri: vscode.Uri) => {
    void foundationContext.refreshCoordinator.requestRefresh(
      RefreshCoordinator.createTrigger("watcher", [uri.fsPath], false)
    );
  };
  watcher.onDidChange(handleWatcherEvent, null, context.subscriptions);
  watcher.onDidCreate(handleWatcherEvent, null, context.subscriptions);
  watcher.onDidDelete(handleWatcherEvent, null, context.subscriptions);

  syncHostState(foundationContext);
  return foundationContext;
}

function registerWithHandling(
  registry: ExtensionFoundationRuntimeContext["contributionRegistry"],
  failures: string[],
  contribution: ContributionDefinition,
  register: () => void
): void {
  if (contribution.type === "command" && !validateCommandId(contribution.id)) {
    throw new Error(`Invalid command id: ${contribution.id}`);
  }

  try {
    register();
    registerContribution(registry, contribution);
  } catch (error) {
    markContributionFailure(
      registry,
      contribution,
      error instanceof Error ? error.message : "Unknown registration error"
    );

    if (contribution.critical) {
      failures.push(contribution.id);
    }
  }
}

function syncHostState(context: ExtensionFoundationRuntimeContext): void {
  context.hostManager.updateContext(context.status, context.syncState, context.discoveryState, context.activeIndex);
  context.renderedPreviewProvider.refreshOpenPreviews();
}

async function openRawDocument(
  context: ExtensionFoundationRuntimeContext,
  request: NavigatorOpenDocumentRequest
): Promise<void> {
  const document = validateOpenRequest(context.activeIndex, request);
  if (!document) {
    void vscode.window.showWarningMessage("The selected document is stale or no longer available in the active docs index.");
    return;
  }

  const textDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(document.absolutePath));
  await vscode.window.showTextDocument(textDocument, {
    preview: false,
    preserveFocus: false
  });
}

async function openPreviewDocument(
  context: ExtensionFoundationRuntimeContext,
  request: NavigatorOpenDocumentRequest
): Promise<void> {
  const document = validateOpenRequest(context.activeIndex, request);
  if (!document) {
    void vscode.window.showWarningMessage("The selected preview target is stale or no longer available in the active docs index.");
    return;
  }

  await vscode.commands.executeCommand(
    "vscode.openWith",
    vscode.Uri.file(document.absolutePath),
    CUSTOM_EDITOR_IDS.renderedPreview
  );
}

async function validateDeliveryReadiness(workspaceRoot: string): Promise<readonly DeliveryReadinessCheck[]> {
  const packageJsonUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), "package.json");
  const buildScriptUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), "scripts", "build.mjs");
  const packageCheckUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), "scripts", "package-check.mjs");
  const distExtensionUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), "dist", "extension", "index.js");
  const distNavigatorUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), "dist", "webview", "navigator.js");
  const distPreviewUri = vscode.Uri.joinPath(vscode.Uri.file(workspaceRoot), "dist", "webview", "preview.js");

  const packageJson = await readJsonFile(packageJsonUri);
  const hasBuildScript = await pathExists(buildScriptUri);
  const hasPackageCheckScript = await pathExists(packageCheckUri);
  const hasDistArtifacts =
    await pathExists(distExtensionUri)
    && await pathExists(distNavigatorUri)
    && await pathExists(distPreviewUri);

  const buildCheck: DeliveryReadinessCheck = hasBuildScript && typeof packageJson?.scripts?.build === "string"
    ? {
        id: "build-script",
        category: "build",
        result: DELIVERY_CHECK_RESULTS.passed,
        detail: "Repository build script is configured."
      }
    : {
        id: "build-script",
        category: "build",
        result: DELIVERY_CHECK_RESULTS.failed,
        detail: "Build script configuration is missing or incomplete."
      };

  const testCheck: DeliveryReadinessCheck = typeof packageJson?.scripts?.test === "string"
    ? {
        id: "test-script",
        category: "test",
        result: DELIVERY_CHECK_RESULTS.passed,
        detail: "Repository test script is configured."
      }
    : {
        id: "test-script",
        category: "test",
        result: DELIVERY_CHECK_RESULTS.failed,
        detail: "Test script configuration is missing."
      };

  const packagingCheck: DeliveryReadinessCheck = typeof packageJson?.engines?.vscode === "string"
    && hasPackageCheckScript
    ? hasDistArtifacts
      ? {
          id: "packaging-artifacts",
          category: "packaging",
          result: DELIVERY_CHECK_RESULTS.passed,
          detail: "Packaging configuration and current build artifacts are present."
        }
      : {
          id: "packaging-artifacts",
          category: "packaging",
          result: DELIVERY_CHECK_RESULTS.notRun,
          detail: "Packaging configuration exists, but build artifacts have not been generated yet."
        }
    : {
        id: "packaging-artifacts",
        category: "packaging",
        result: DELIVERY_CHECK_RESULTS.failed,
        detail: "Packaging configuration is missing required extension metadata or package checks."
      };

  return [buildCheck, testCheck, packagingCheck];
}

function resolveWorkspaceRoot(): string {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

async function pathExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(uri: vscode.Uri): Promise<any> {
  try {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return JSON.parse(Buffer.from(bytes).toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}
