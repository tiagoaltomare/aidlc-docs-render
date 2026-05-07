import test from "node:test";
import assert from "node:assert/strict";
import {
  createContributionRegistry,
  listActiveCapabilities,
  markContributionFailure,
  registerContribution
} from "../../src/shared/contributionRegistry";

test("registerContribution tracks active capabilities", () => {
  const registry = createContributionRegistry();

  registerContribution(registry, {
    id: "aidlc.openNavigatorPanel",
    type: "command",
    label: "Open panel",
    critical: true
  });

  assert.deepEqual(listActiveCapabilities(registry), ["aidlc.openNavigatorPanel"]);
});

test("markContributionFailure stores failure details", () => {
  const registry = createContributionRegistry();

  markContributionFailure(
    registry,
    {
      id: "aidlcNavigator.sideView",
      type: "view",
      label: "Navigator view",
      critical: true
    },
    "View registration failed"
  );

  const failure = registry.views.get("aidlcNavigator.sideView");
  assert.equal(failure?.status, "failed");
  assert.equal(failure?.detail, "View registration failed");
});
