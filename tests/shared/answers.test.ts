import test from "node:test";
import assert from "node:assert/strict";
import { derivePreviewSaveState, extractAnswerFields, rebuildMarkdownWithAnswers } from "../../src/shared/answers";

test("extractAnswerFields detects standalone answer markers and preserves current values", () => {
  const extraction = extractAnswerFields(`# Title
[Answer]: existing
Paragraph
[Answer]:
`);

  assert.equal(extraction.fields.length, 2);
  assert.equal(extraction.fields[0]?.originalValue, "existing");
  assert.equal(extraction.fields[1]?.originalValue, "");
});

test("extractAnswerFields ignores answer markers inside fenced code blocks", () => {
  const extraction = extractAnswerFields(`\`\`\`md
[Answer]: do not edit
\`\`\`
[Answer]: real answer`);

  assert.equal(extraction.fields.length, 1);
  assert.equal(extraction.fields[0]?.originalValue, "real answer");
});

test("extractAnswerFields ignores non-standalone answer references in prose", () => {
  const extraction = extractAnswerFields(`Please review [Answer]: this text is not a field.
[Answer]: real`);

  assert.equal(extraction.fields.length, 1);
  assert.equal(extraction.fields[0]?.originalValue, "real");
});

test("rebuildMarkdownWithAnswers preserves unrelated content and rewrites only answer lines", () => {
  const markdown = `Intro
[Answer]: old
Outro`;
  const extraction = extractAnswerFields(markdown);
  const rebuilt = rebuildMarkdownWithAnswers(extraction, [{
    fieldId: extraction.fields[0]!.fieldId,
    value: "new"
  }]);

  assert.equal(rebuilt.markdown, `Intro
[Answer]: new
Outro`);
});

test("rebuildMarkdownWithAnswers is idempotent when values do not change", () => {
  const markdown = `[Answer]: same`;
  const extraction = extractAnswerFields(markdown);
  const rebuilt = rebuildMarkdownWithAnswers(extraction, [{
    fieldId: extraction.fields[0]!.fieldId,
    value: "same"
  }]);

  assert.equal(rebuilt.markdown, markdown);
  assert.deepEqual(rebuilt.changedFieldIds, []);
});

test("derivePreviewSaveState reports dirty, saving, failed, and saved states", () => {
  const extraction = extractAnswerFields(`[Answer]: one`);
  const updates = [{
    fieldId: extraction.fields[0]!.fieldId,
    value: "two"
  }];

  assert.equal(derivePreviewSaveState(extraction, updates, false, null, false).status, "dirty");
  assert.equal(derivePreviewSaveState(extraction, updates, true, null, false).status, "saving");
  assert.equal(derivePreviewSaveState(extraction, updates, false, "failed", true).status, "failed");
  assert.equal(derivePreviewSaveState(extraction, [{
    fieldId: extraction.fields[0]!.fieldId,
    value: "one"
  }], false, "saved", false).status, "saved");
});
