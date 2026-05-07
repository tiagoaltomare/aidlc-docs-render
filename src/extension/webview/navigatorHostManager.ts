import * as vscode from "vscode";
import { HOST_TYPES, WebviewToHostMessage } from "../../shared/contracts";
import { DiscoveryState, RuntimeDocumentIndex } from "../../shared/documents";
import { deriveNavigatorState, NavigatorHostStatePayload, NavigatorOpenDocumentRequest } from "../../shared/navigator";
import { RuntimeSyncState } from "../../shared/refresh";
import { NavigatorPanelProvider } from "./navigatorPanelProvider";
import { NavigatorSideViewProvider } from "./navigatorSideViewProvider";

interface NavigatorHostHandlers {
  readonly onSelectDocsRoot: () => Promise<void>;
  readonly onRefreshRuntime: () => Promise<void>;
  readonly onRunDeliveryReadinessCheck: () => Promise<void>;
  readonly onOpenRawDocument: (request: NavigatorOpenDocumentRequest) => Promise<void>;
  readonly onOpenPreviewDocument: (request: NavigatorOpenDocumentRequest) => Promise<void>;
}

export class NavigatorHostManager {
  private readonly panelProvider: NavigatorPanelProvider;
  private readonly sideViewProvider: NavigatorSideViewProvider;
  private searchQuery = "";
  private runtimeStatus: NavigatorHostStatePayload["runtimeStatus"];
  private syncState: RuntimeSyncState;
  private discoveryState: DiscoveryState;
  private activeIndex: RuntimeDocumentIndex | null;

  public constructor(
    extensionUri: vscode.Uri,
    initialRuntimeStatus: NavigatorHostStatePayload["runtimeStatus"],
    initialSyncState: RuntimeSyncState,
    initialDiscoveryState: DiscoveryState,
    initialActiveIndex: RuntimeDocumentIndex | null,
    private readonly handlers: NavigatorHostHandlers
  ) {
    this.runtimeStatus = initialRuntimeStatus;
    this.syncState = initialSyncState;
    this.discoveryState = initialDiscoveryState;
    this.activeIndex = initialActiveIndex;
    this.panelProvider = new NavigatorPanelProvider(
      extensionUri,
      this.buildHostState(HOST_TYPES.panel),
      (message) => this.handleMessage(message)
    );
    this.sideViewProvider = new NavigatorSideViewProvider(
      extensionUri,
      this.buildHostState(HOST_TYPES.sideView),
      (message) => this.handleMessage(message)
    );
  }

  public getSideViewProvider(): NavigatorSideViewProvider {
    return this.sideViewProvider;
  }

  public openPanel(): void {
    this.panelProvider.revealOrCreate();
  }

  public updateContext(
    runtimeStatus: NavigatorHostStatePayload["runtimeStatus"],
    syncState: RuntimeSyncState,
    discoveryState: DiscoveryState,
    activeIndex: RuntimeDocumentIndex | null
  ): void {
    this.runtimeStatus = runtimeStatus;
    this.syncState = syncState;
    this.discoveryState = discoveryState;
    this.activeIndex = activeIndex;
    this.updateHosts();
  }

  private updateHosts(): void {
    this.panelProvider.updateState(this.buildHostState(HOST_TYPES.panel));
    this.sideViewProvider.updateState(this.buildHostState(HOST_TYPES.sideView));
  }

  private buildHostState(hostType: NavigatorHostStatePayload["hostType"]): NavigatorHostStatePayload {
    return {
      hostType,
      runtimeStatus: this.runtimeStatus,
      navigator: deriveNavigatorState(
        this.runtimeStatus,
        this.discoveryState,
        this.activeIndex,
        this.searchQuery,
        this.syncState
      )
    };
  }

  private async handleMessage(message: WebviewToHostMessage): Promise<void> {
    switch (message.action) {
      case "navigator.search-query-changed":
        this.searchQuery = String(message.payload?.query ?? "");
        this.updateHosts();
        return;
      case "navigator.open-raw-document":
        await this.handlers.onOpenRawDocument(toOpenRequest(message.payload));
        return;
      case "navigator.open-preview-document":
        await this.handlers.onOpenPreviewDocument(toOpenRequest(message.payload));
        return;
      case "navigator.select-docs-root":
        await this.handlers.onSelectDocsRoot();
        return;
      case "navigator.refresh-runtime":
        await this.handlers.onRefreshRuntime();
        return;
      case "navigator.run-delivery-readiness-check":
        await this.handlers.onRunDeliveryReadinessCheck();
        return;
      default:
        return;
    }
  }
}

function toOpenRequest(payload: Record<string, unknown> | undefined): NavigatorOpenDocumentRequest {
  return {
    relativePath: String(payload?.relativePath ?? ""),
    expectedIndexVersion: Number(payload?.expectedIndexVersion ?? -1)
  };
}
