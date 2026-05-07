# Answer Editing and Save Code Summary

## Unit Outcome

The repository now supports answer-aware preview editing for eligible standalone `[Answer]:` markers. The preview can render answer controls, track unsaved answer changes, submit save requests through the host, rebuild markdown safely, and persist updates back to the workspace file through VS Code-native file APIs.

## Modified Application Files

- `src/shared/contracts.ts`
  - Added the preview save action to the host/webview message contract surface.
- `src/shared/runtimeContracts.ts`
  - Added contract metadata for answer-save requests.
- `src/shared/preview.ts`
  - Extended the preview model with answer extraction data, save state integration, and answer render blocks.
- `src/extension/renderedPreviewProvider.ts`
  - Added host-side preview save handling, stale-save rejection, markdown rebuild, workspace persistence, and save-result feedback.
- `src/webview/preview/App.tsx`
  - Extended the preview UI with answer controls, dirty/save lifecycle messaging, and explicit preview-versus-raw editing guidance.
- `src/webview/preview/index.tsx`
  - Added VS Code API access for preview save requests.
- `tests/shared/contracts.test.ts`
  - Updated contract coverage for the preview save action.
- `tests/shared/preview.test.ts`
  - Extended preview coverage for answer-aware preview blocks.

## Created Application Files

- `src/shared/answers.ts`
  - Shared answer extraction, markdown rebuild, save payload, and preview save-state helpers.
- `tests/shared/answers.test.ts`
  - Tests for standalone answer detection, fenced-code exclusion, non-standalone marker rejection, rebuild integrity, idempotence, and save-state derivation.

## Test Scope

- Standalone answer-marker eligibility
- Fenced-code exclusion behavior
- Non-standalone marker rejection
- Existing answer-value extraction
- Round-trip and idempotent rebuild behavior
- Non-owned content preservation
- Preview save-state derivation
- Answer-aware preview block generation

## Notes

- Build and automated test execution were not run in this stage.
- Save behavior is fail-closed and preview-scoped, but deeper refresh and multi-editor conflict coordination remain deferred to the later refresh-and-delivery unit.
