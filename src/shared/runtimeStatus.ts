import { RUNTIME_LIFECYCLE, RuntimeStatusSnapshot } from "./contracts";

export interface RuntimeStatusInput {
  readonly criticalFailures: readonly string[];
  readonly activeCapabilities: readonly string[];
  readonly degradedCapabilities?: readonly string[];
  readonly initializing?: boolean;
}

export function deriveRuntimeStatus(input: RuntimeStatusInput): RuntimeStatusSnapshot {
  if (input.initializing) {
    return {
      lifecycle: RUNTIME_LIFECYCLE.initializing,
      readyCapabilities: [],
      degradedCapabilities: [],
      blockingFailures: [...input.criticalFailures]
    };
  }

  if (input.criticalFailures.length > 0) {
    return {
      lifecycle: RUNTIME_LIFECYCLE.failed,
      readyCapabilities: [...input.activeCapabilities],
      degradedCapabilities: [...(input.degradedCapabilities ?? [])],
      blockingFailures: [...input.criticalFailures]
    };
  }

  if ((input.degradedCapabilities ?? []).length > 0) {
    return {
      lifecycle: RUNTIME_LIFECYCLE.degraded,
      readyCapabilities: [...input.activeCapabilities],
      degradedCapabilities: [...(input.degradedCapabilities ?? [])],
      blockingFailures: []
    };
  }

  return {
    lifecycle: RUNTIME_LIFECYCLE.ready,
    readyCapabilities: [...input.activeCapabilities],
    degradedCapabilities: [],
    blockingFailures: []
  };
}
