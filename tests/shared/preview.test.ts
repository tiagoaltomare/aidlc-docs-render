import test from "node:test";
import assert from "node:assert/strict";
import { buildPreviewDocumentModel, classifyPreviewBlocks, DEFAULT_PREVIEW_CAPABILITIES } from "../../src/shared/preview";

test("classifyPreviewBlocks extracts headings, paragraphs, lists, and code blocks", () => {
  const blocks = classifyPreviewBlocks(`# Title

Paragraph text

- one
- two

\`\`\`ts
const value = 1;
\`\`\`
`, DEFAULT_PREVIEW_CAPABILITIES);

  assert.equal(blocks[0]?.kind, "heading");
  assert.equal(blocks[1]?.kind, "paragraph");
  assert.equal(blocks[2]?.kind, "list");
  assert.equal(blocks[3]?.kind, "code");
});

test("classifyPreviewBlocks marks mermaid blocks as ready when capability is available", () => {
  const blocks = classifyPreviewBlocks(`\`\`\`mermaid
graph TD;
A-->B;
\`\`\``, DEFAULT_PREVIEW_CAPABILITIES);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]?.kind, "mermaid");
  assert.equal(blocks[0]?.renderStatus, "ready");
});

test("classifyPreviewBlocks produces a fallback mermaid block when capability is unavailable", () => {
  const blocks = classifyPreviewBlocks(`\`\`\`mermaid
graph TD;
A-->B;
\`\`\``, {
    ...DEFAULT_PREVIEW_CAPABILITIES,
    mermaidReady: false,
    hostLimitations: ["Mermaid preview is unavailable."]
  });

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]?.kind, "mermaid");
  assert.equal(blocks[0]?.renderStatus, "fallback");
});

test("buildPreviewDocumentModel preserves identity metadata", () => {
  const model = buildPreviewDocumentModel({
    title: "Requirements",
    relativePath: "inception/requirements/requirements.md",
    phase: "inception"
  }, "# Requirements", 4);

  assert.equal(model.title, "Requirements");
  assert.equal(model.activeIndexVersion, 4);
  assert.equal(model.renderBlocks[0]?.kind, "heading");
});

test("buildPreviewDocumentModel emits answer blocks for standalone answer markers", () => {
  const model = buildPreviewDocumentModel({
    title: "Answers",
    relativePath: "inception/questions.md",
    phase: "inception"
  }, `[Answer]: existing`, 2);

  assert.equal(model.answerExtraction.fields.length, 1);
  assert.equal(model.renderBlocks[0]?.kind, "answer");
});
