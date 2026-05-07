import test from "node:test";
import assert from "node:assert/strict";
import {
  isHostToWebviewAction,
  isNavigatorHostType,
  isWebviewToHostAction,
  validateCommandId,
  validateRequiredFields
} from "../../src/shared/contracts";

test("validateCommandId accepts expected command ids", () => {
  assert.equal(validateCommandId("aidlc.openNavigatorPanel"), true);
  assert.equal(validateCommandId("aidlc.focusNavigatorView"), true);
  assert.equal(validateCommandId("aidlc.startGuidedSetup"), true);
  assert.equal(validateCommandId("aidlc.manualRefresh"), true);
  assert.equal(validateCommandId("aidlc.checkDeliveryReadiness"), true);
  assert.equal(validateCommandId("invalid.command"), false);
});

test("host and action guards validate expected values", () => {
  assert.equal(isNavigatorHostType("panel"), true);
  assert.equal(isNavigatorHostType("side-view"), true);
  assert.equal(isNavigatorHostType("editor"), false);

  assert.equal(isWebviewToHostAction("navigator.search-query-changed"), true);
  assert.equal(isWebviewToHostAction("navigator.refresh-runtime"), true);
  assert.equal(isWebviewToHostAction("navigator.run-delivery-readiness-check"), true);
  assert.equal(isWebviewToHostAction("preview.save-answer-edits"), true);
  assert.equal(isWebviewToHostAction("foundation.nope"), false);
  assert.equal(isHostToWebviewAction("navigator.state-changed"), true);
});

test("validateRequiredFields enforces required payload attributes", () => {
  assert.equal(validateRequiredFields({ runtimeStatus: {} }, ["runtimeStatus"]), true);
  assert.equal(validateRequiredFields({}, ["runtimeStatus"]), false);
});
