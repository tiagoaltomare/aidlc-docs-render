export interface AnswerFieldDescriptor {
  readonly fieldId: string;
  readonly markerLineIndex: number;
  readonly originalLine: string;
  readonly originalValue: string;
  readonly currentValue: string;
}

export interface AnswerExtractionResult {
  readonly markdown: string;
  readonly lineEnding: string;
  readonly lines: readonly string[];
  readonly fields: readonly AnswerFieldDescriptor[];
}

export interface AnswerFieldValueUpdate {
  readonly fieldId: string;
  readonly value: string;
}

export interface AnswerSaveRequestPayload {
  readonly relativePath: string;
  readonly expectedIndexVersion: number;
  readonly fieldValues: readonly AnswerFieldValueUpdate[];
}

export interface MarkdownRebuildResult {
  readonly markdown: string;
  readonly changedFieldIds: readonly string[];
}

export interface PreviewSaveState {
  readonly status: "idle" | "dirty" | "saving" | "saved" | "failed";
  readonly message: string | null;
}

export function extractAnswerFields(markdown: string): AnswerExtractionResult {
  const lineEnding = markdown.includes("\r\n") ? "\r\n" : "\n";
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const fields: AnswerFieldDescriptor[] = [];
  let inFence = false;
  let sequence = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }

    if (inFence || !trimmed.startsWith("[Answer]:")) {
      continue;
    }

    const leadingWhitespace = line.match(/^\s*/)?.[0] ?? "";
    const value = line.slice(leadingWhitespace.length + "[Answer]:".length).trim();
    fields.push({
      fieldId: `answer-${index}-${sequence++}`,
      markerLineIndex: index,
      originalLine: line,
      originalValue: value,
      currentValue: value
    });
  }

  return {
    markdown,
    lineEnding,
    lines,
    fields
  };
}

export function rebuildMarkdownWithAnswers(
  extraction: AnswerExtractionResult,
  updates: readonly AnswerFieldValueUpdate[]
): MarkdownRebuildResult {
  const updateMap = new Map(updates.map((update) => [update.fieldId, update.value]));
  const nextLines = [...extraction.lines];
  const changedFieldIds: string[] = [];

  for (const field of extraction.fields) {
    const nextValue = updateMap.get(field.fieldId);
    if (nextValue === undefined) {
      nextLines[field.markerLineIndex] = field.originalLine;
      continue;
    }

    const indentation = field.originalLine.match(/^\s*/)?.[0] ?? "";
    nextLines[field.markerLineIndex] = nextValue.length > 0
      ? `${indentation}[Answer]: ${nextValue}`
      : `${indentation}[Answer]:`;

    if (nextValue !== field.originalValue) {
      changedFieldIds.push(field.fieldId);
    }
  }

  return {
    markdown: nextLines.join(extraction.lineEnding),
    changedFieldIds
  };
}

export function derivePreviewSaveState(
  extraction: AnswerExtractionResult,
  updates: readonly AnswerFieldValueUpdate[],
  saving: boolean,
  message: string | null,
  failed: boolean
): PreviewSaveState {
  if (saving) {
    return {
      status: "saving",
      message: message ?? "Saving answer edits..."
    };
  }

  if (failed) {
    return {
      status: "failed",
      message
    };
  }

  const dirty = updates.some((update) => {
    const field = extraction.fields.find((candidate) => candidate.fieldId === update.fieldId);
    return field ? field.originalValue !== update.value : false;
  });

  if (dirty) {
    return {
      status: "dirty",
      message: message ?? "You have unsaved answer changes."
    };
  }

  return {
    status: message ? "saved" : "idle",
    message
  };
}
