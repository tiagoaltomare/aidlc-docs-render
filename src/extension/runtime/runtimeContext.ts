import * as vscode from "vscode";
import { DiscoveryState, RuntimeDocumentIndex } from "../../shared/documents";
import { ContributionRegistry } from "../../shared/contributionRegistry";
import { RuntimeContractDefinition, RuntimeStatusSnapshot } from "../../shared/contracts";
import { RuntimeSyncState } from "../../shared/refresh";
import { BootstrapSetupService } from "../bootstrap/bootstrapSetupService";
import { DiscoveryService } from "../discovery/discoveryService";
import { RefreshCoordinator } from "../refresh/refreshCoordinator";
import { NavigatorHostManager } from "../webview/navigatorHostManager";
import { RenderedPreviewProvider } from "../renderedPreviewProvider";

export interface ExtensionFoundationRuntimeContext {
  readonly extensionContext: vscode.ExtensionContext;
  readonly contributionRegistry: ContributionRegistry;
  readonly contractRegistry: readonly RuntimeContractDefinition[];
  readonly hostManager: NavigatorHostManager;
  readonly discoveryService: DiscoveryService;
  readonly bootstrapSetupService: BootstrapSetupService;
  readonly renderedPreviewProvider: RenderedPreviewProvider;
  readonly refreshCoordinator: RefreshCoordinator;
  status: RuntimeStatusSnapshot;
  syncState: RuntimeSyncState;
  discoveryState: DiscoveryState;
  activeIndex: RuntimeDocumentIndex | null;
}
