import { AidlcPhase, RuntimeDocumentRecord } from "./documents";
import { RuntimeStatusSnapshot } from "./contracts";
import { AnswerExtractionResult, PreviewSaveState, extractAnswerFields } from "./answers";
import { PreviewAvailabilityState, RuntimeSyncState } from "./refresh";

export interface PreviewCapabilityState {
  readonly markdownReady: boolean;
  readonly codeHighlightReady: boolean;
  readonly mermaidReady: boolean;
  readonly hostLimitations: readonly string[];
}

export interface PreviewRenderBlock {
  readonly id: string;
  readonly kind: "heading" | "paragraph" | "list" | "code" | "mermaid" | "answer" | "fallback";
  readonly renderStatus: "ready" | "fallback";
  readonly text?: string;
  readonly level?: number;
  readonly items?: readonly string[];
  readonly language?: string;
  readonly source?: string;
  readonly fallbackMessage?: string;
  readonly answerFieldId?: string;
}

export interface PreviewDocumentModel {
  readonly title: string;
  readonly relativePath: string;
  readonly phase: AidlcPhase;
  readonly activeIndexVersion: number | null;
  readonly renderBlocks: readonly PreviewRenderBlock[];
  readonly capabilityState: PreviewCapabilityState;
  readonly answerExtraction: AnswerExtractionResult;
}

export interface PreviewHostStatePayload {
  readonly runtimeStatus: RuntimeStatusSnapshot;
  readonly syncState: RuntimeSyncState;
  readonly availability: PreviewAvailabilityState;
  readonly preview: PreviewDocumentModel;
  readonly saveState: PreviewSaveState;
}

export const DEFAULT_PREVIEW_CAPABILITIES: PreviewCapabilityState = {
  markdownReady: true,
  codeHighlightReady: true,
  mermaidReady: true,
  hostLimitations: []
};

export function buildPreviewDocumentModel(
  document: Pick<RuntimeDocumentRecord, "title" | "relativePath" | "phase">,
  markdown: string,
  activeIndexVersion: number | null,
  capabilityState: PreviewCapabilityState = DEFAULT_PREVIEW_CAPABILITIES
): PreviewDocumentModel {
  const answerExtraction = extractAnswerFields(markdown);
  return {
    title: document.title,
    relativePath: document.relativePath,
    phase: document.phase,
    activeIndexVersion,
    capabilityState,
    renderBlocks: classifyPreviewBlocks(markdown, capabilityState, answerExtraction),
    answerExtraction
  };
}

export function classifyPreviewBlocks(
  markdown: string,
  capabilityState: PreviewCapabilityState,
  extraction: AnswerExtractionResult = extractAnswerFields(markdown)
): readonly PreviewRenderBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: PreviewRenderBlock[] = [];
  let index = 0;
  let blockId = 0;
  const answerByLine = new Map(extraction.fields.map((field) => [field.markerLineIndex, field]));

  while (index < lines.length) {
    const current = lines[index];
    const trimmed = current.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const answerField = answerByLine.get(index);
    if (answerField) {
      blocks.push({
        id: `block-${blockId++}`,
        kind: "answer",
        renderStatus: "ready",
        answerFieldId: answerField.fieldId
      });
      index += 1;
      continue;
    }

    const fenceMatch = current.match(/^```([\w-]*)\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1]?.toLowerCase() || "text";
      const body: string[] = [];
      let cursor = index + 1;
      let closed = false;

      while (cursor < lines.length) {
        if (/^```/.test(lines[cursor])) {
          closed = true;
          cursor += 1;
          break;
        }

        body.push(lines[cursor]);
        cursor += 1;
      }

      if (!closed) {
        blocks.push({
          id: `block-${blockId++}`,
          kind: "fallback",
          renderStatus: "fallback",
          source: [current, ...body].join("\n"),
          fallbackMessage: "The fenced block is not closed, so the preview is showing a safe fallback."
        });
        break;
      }

      const source = body.join("\n");
      if (language === "mermaid") {
        blocks.push({
          id: `block-${blockId++}`,
          kind: "mermaid",
          renderStatus: capabilityState.mermaidReady ? "ready" : "fallback",
          language,
          source,
          fallbackMessage: capabilityState.mermaidReady
            ? undefined
            : capabilityState.hostLimitations[0] ?? "Mermaid preview is unavailable."
        });
      } else {
        blocks.push({
          id: `block-${blockId++}`,
          kind: "code",
          renderStatus: "ready",
          language,
          source
        });
      }

      index = cursor;
      continue;
    }

    const headingMatch = current.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        id: `block-${blockId++}`,
        kind: "heading",
        renderStatus: "ready",
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      let cursor = index;
      while (cursor < lines.length && /^[-*]\s+/.test(lines[cursor].trim())) {
        items.push(lines[cursor].trim().replace(/^[-*]\s+/, ""));
        cursor += 1;
      }

      blocks.push({
        id: `block-${blockId++}`,
        kind: "list",
        renderStatus: "ready",
        items
      });
      index = cursor;
      continue;
    }

    const paragraphLines: string[] = [];
    let cursor = index;
    while (cursor < lines.length) {
      const candidate = lines[cursor];
      const candidateTrimmed = candidate.trim();
      if (!candidateTrimmed || /^```/.test(candidate) || /^(#{1,6})\s+/.test(candidate) || /^[-*]\s+/.test(candidateTrimmed)) {
        break;
      }

      paragraphLines.push(candidateTrimmed);
      cursor += 1;
    }

    blocks.push({
      id: `block-${blockId++}`,
      kind: "paragraph",
      renderStatus: "ready",
      text: paragraphLines.join(" ")
    });
    index = cursor;
  }

  return blocks;
}
