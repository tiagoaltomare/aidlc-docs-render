import * as path from "node:path";
import * as vscode from "vscode";
import { DiscoveryState } from "../../shared/documents";
import {
  classifyRefreshTrigger,
  coalesceRefreshTriggers,
  createInitialRuntimeSyncState,
  DeliveryReadinessCheck,
  DELIVERY_CHECK_RESULTS,
  deriveDeliveryReadinessReport,
  deriveFailedSyncState,
  deriveRefreshingSyncState,
  deriveSucceededSyncState,
  RefreshTrigger,
  RuntimeSyncState
} from "../../shared/refresh";

interface RefreshCoordinatorOptions {
  readonly getDiscoveryState: () => DiscoveryState;
  readonly detectDocsRoot: () => Promise<DiscoveryState>;
  readonly refreshDiscovery: () => Promise<DiscoveryState>;
  readonly publishRuntimeState: (syncState: RuntimeSyncState, discoveryState: DiscoveryState) => void;
  readonly validateDeliveryReadiness: () => Promise<readonly DeliveryReadinessCheck[]>;
}

export class RefreshCoordinator implements vscode.Disposable {
  private readonly outputChannel: vscode.OutputChannel;
  private syncState: RuntimeSyncState = createInitialRuntimeSyncState();
  private pendingTrigger: RefreshTrigger | null = null;
  private refreshInFlight = false;

  public constructor(private readonly options: RefreshCoordinatorOptions) {
    this.outputChannel = vscode.window.createOutputChannel("AIDLC Delivery");
  }

  public dispose(): void {
    this.outputChannel.dispose();
  }

  public getSyncState(): RuntimeSyncState {
    return this.syncState;
  }

  public async requestRefresh(trigger: RefreshTrigger): Promise<void> {
    const classification = classifyRefreshTrigger(
      trigger,
      this.options.getDiscoveryState().activeRoot?.absolutePath ?? null
    );

    if (!classification.relevant) {
      return;
    }

    this.pendingTrigger = coalesceRefreshTriggers(this.pendingTrigger, {
      ...trigger,
      fullRefresh: trigger.fullRefresh || classification.requiresFullRefresh
    });

    if (this.refreshInFlight) {
      return;
    }

    this.refreshInFlight = true;
    try {
      while (this.pendingTrigger) {
        const nextTrigger = this.pendingTrigger;
        this.pendingTrigger = null;
        await this.executeRefresh(nextTrigger);
      }
    } finally {
      this.refreshInFlight = false;
    }
  }

  public async runDeliveryReadinessCheck(): Promise<void> {
    const checks = await this.options.validateDeliveryReadiness();
    const report = deriveDeliveryReadinessReport(checks);

    this.outputChannel.clear();
    this.outputChannel.appendLine("AIDLC Delivery Readiness");
    this.outputChannel.appendLine(report.summaryMessage);
    this.outputChannel.appendLine("");
    for (const check of report.checks) {
      this.outputChannel.appendLine(`- [${check.result}] ${check.category}: ${check.detail}`);
    }
    this.outputChannel.appendLine("");

    if (report.overallResult === DELIVERY_CHECK_RESULTS.passed) {
      const action = await vscode.window.showInformationMessage(report.summaryMessage, "Show Details");
      if (action === "Show Details") {
        this.outputChannel.show(true);
      }
      return;
    }

    const action = await vscode.window.showWarningMessage(report.summaryMessage, "Show Details");
    if (action === "Show Details") {
      this.outputChannel.show(true);
    }
  }

  public static createTrigger(source: RefreshTrigger["source"], paths: readonly string[] = [], fullRefresh = false): RefreshTrigger {
    return {
      source,
      paths: [...paths].map((candidatePath) => normalizeCandidatePath(candidatePath)),
      fullRefresh,
      requestedAt: new Date().toISOString()
    };
  }

  private async executeRefresh(trigger: RefreshTrigger): Promise<void> {
    const discoveryBefore = this.options.getDiscoveryState();
    this.syncState = deriveRefreshingSyncState(this.syncState, trigger);
    this.options.publishRuntimeState(this.syncState, discoveryBefore);

    try {
      const discoveryAfter = trigger.fullRefresh || !discoveryBefore.activeRoot
        ? await this.options.detectDocsRoot()
        : await this.options.refreshDiscovery();

      const preservedLastValidState = discoveryAfter.lastValidIndex !== null;
      if (discoveryAfter.mode === "failed") {
        this.syncState = deriveFailedSyncState(
          this.syncState,
          trigger,
          preservedLastValidState,
          discoveryAfter.error ?? "Runtime synchronization failed."
        );
      } else {
        this.syncState = deriveSucceededSyncState(
          this.syncState,
          trigger,
          new Date().toISOString(),
          discoveryAfter.mode === "empty"
        );
      }

      this.options.publishRuntimeState(this.syncState, discoveryAfter);
    } catch (error) {
      const currentDiscoveryState = this.options.getDiscoveryState();
      this.syncState = deriveFailedSyncState(
        this.syncState,
        trigger,
        currentDiscoveryState.lastValidIndex !== null,
        error instanceof Error ? error.message : "Unknown refresh error."
      );
      this.options.publishRuntimeState(this.syncState, currentDiscoveryState);
    }
  }
}

function normalizeCandidatePath(candidatePath: string): string {
  return candidatePath.replace(/\\/g, path.sep);
}
