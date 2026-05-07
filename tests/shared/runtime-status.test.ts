import test from "node:test";
import assert from "node:assert/strict";
import { deriveRuntimeStatus } from "../../src/shared/runtimeStatus";

test("deriveRuntimeStatus returns ready when no failures are present", () => {
  const result = deriveRuntimeStatus({
    criticalFailures: [],
    activeCapabilities: ["aidlc.openNavigatorPanel"]
  });

  assert.equal(result.lifecycle, "ready");
  assert.deepEqual(result.readyCapabilities, ["aidlc.openNavigatorPanel"]);
  assert.deepEqual(result.blockingFailures, []);
});

test("deriveRuntimeStatus returns failed when critical failures exist", () => {
  const result = deriveRuntimeStatus({
    criticalFailures: ["aidlcNavigator.sideView"],
    activeCapabilities: ["aidlc.openNavigatorPanel"],
    degradedCapabilities: ["aidlc.renderedPreview"]
  });

  assert.equal(result.lifecycle, "failed");
  assert.deepEqual(result.blockingFailures, ["aidlcNavigator.sideView"]);
});
