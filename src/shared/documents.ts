import * as path from "node:path";

export const AIDLC_PHASES = {
  overview: "overview",
  inception: "inception",
  construction: "construction",
  operations: "operations",
  other: "other"
} as const;

export type AidlcPhase = (typeof AIDLC_PHASES)[keyof typeof AIDLC_PHASES];

export type DocsRootSource = "auto-detected" | "manual";
export type DiscoveryMode = "undetected" | "detected" | "manual" | "empty" | "failed";
export type IndexStatus = "ready" | "empty" | "failed";

export interface DocsRootCandidate {
  readonly absolutePath: string;
  readonly source: DocsRootSource;
  readonly valid: boolean;
  readonly reason?: string;
}

export interface ActiveDocsRoot {
  readonly absolutePath: string;
  readonly source: DocsRootSource;
  readonly version: number;
}

export interface RuntimeDocumentRecord {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly title: string;
  readonly phase: AidlcPhase;
  readonly section: string | null;
  readonly subsection: string | null;
}

export interface NavigationGroup {
  readonly id: string;
  readonly label: string;
  readonly type: "phase" | "section" | "subsection";
  readonly documentPaths: readonly string[];
  readonly children: readonly NavigationGroup[];
}

export interface RuntimeDocumentIndex {
  readonly activeRoot: ActiveDocsRoot;
  readonly documents: readonly RuntimeDocumentRecord[];
  readonly navigationGroups: readonly NavigationGroup[];
  readonly version: number;
  readonly status: IndexStatus;
}

export interface DiscoveryState {
  readonly mode: DiscoveryMode;
  readonly activeRoot: ActiveDocsRoot | null;
  readonly currentIndex: RuntimeDocumentIndex | null;
  readonly lastValidIndex: RuntimeDocumentIndex | null;
  readonly error: string | null;
}

export interface IndexReplacementResult {
  readonly nextState: DiscoveryState;
  readonly replaced: boolean;
}

export function normalizeRelativePath(rootPath: string, filePath: string): string {
  const relative = path.relative(rootPath, filePath);
  return relative.split(path.sep).join("/");
}

export function deriveTitle(markdown: string, relativePath: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match?.[1]) {
    return match[1].trim();
  }

  const filename = relativePath.split("/").pop() ?? relativePath;
  const stem = filename.replace(/\.md$/i, "");
  return stem.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function derivePhase(relativePath: string): AidlcPhase {
  const [head] = relativePath.split("/");
  if (!head || !relativePath.includes("/")) {
    return AIDLC_PHASES.overview;
  }

  switch (head?.toLowerCase()) {
    case AIDLC_PHASES.inception:
      return AIDLC_PHASES.inception;
    case AIDLC_PHASES.construction:
      return AIDLC_PHASES.construction;
    case AIDLC_PHASES.operations:
      return AIDLC_PHASES.operations;
    default:
      return relativePath.includes("/") ? AIDLC_PHASES.other : AIDLC_PHASES.overview;
  }
}

export function deriveSection(relativePath: string): string | null {
  const parts = relativePath.split("/");
  return parts.length >= 3 ? parts[1] : null;
}

export function deriveSubsection(relativePath: string): string | null {
  const parts = relativePath.split("/");
  return parts.length >= 4 ? parts[2] : null;
}

export function buildNavigationGroups(
  documents: readonly RuntimeDocumentRecord[]
): readonly NavigationGroup[] {
  const phaseOrder: AidlcPhase[] = [
    AIDLC_PHASES.overview,
    AIDLC_PHASES.inception,
    AIDLC_PHASES.construction,
    AIDLC_PHASES.operations,
    AIDLC_PHASES.other
  ];

  const groupedByPhase = new Map<AidlcPhase, RuntimeDocumentRecord[]>();
  for (const document of documents) {
    const bucket = groupedByPhase.get(document.phase) ?? [];
    bucket.push(document);
    groupedByPhase.set(document.phase, bucket);
  }

  return phaseOrder
    .filter((phase) => groupedByPhase.has(phase))
    .map((phase) => buildPhaseGroup(phase, groupedByPhase.get(phase) ?? []));
}

function buildPhaseGroup(phase: AidlcPhase, documents: readonly RuntimeDocumentRecord[]): NavigationGroup {
  const topLevelDocs = documents.filter((document) => !document.section);
  const sectionGroups = new Map<string, RuntimeDocumentRecord[]>();

  for (const document of documents.filter((item) => item.section)) {
    const key = document.section as string;
    const bucket = sectionGroups.get(key) ?? [];
    bucket.push(document);
    sectionGroups.set(key, bucket);
  }

  return {
    id: `phase:${phase}`,
    label: phase,
    type: "phase",
    documentPaths: topLevelDocs.map((document) => document.relativePath),
    children: [...sectionGroups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([section, sectionDocuments]) => buildSectionGroup(phase, section, sectionDocuments))
  };
}

function buildSectionGroup(
  phase: AidlcPhase,
  section: string,
  documents: readonly RuntimeDocumentRecord[]
): NavigationGroup {
  const directDocs = documents.filter((document) => !document.subsection);
  const subsectionGroups = new Map<string, RuntimeDocumentRecord[]>();

  for (const document of documents.filter((item) => item.subsection)) {
    const key = document.subsection as string;
    const bucket = subsectionGroups.get(key) ?? [];
    bucket.push(document);
    subsectionGroups.set(key, bucket);
  }

  return {
    id: `phase:${phase}:section:${section}`,
    label: section,
    type: "section",
    documentPaths: directDocs.map((document) => document.relativePath),
    children: [...subsectionGroups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([subsection, subsectionDocuments]) => ({
        id: `phase:${phase}:section:${section}:subsection:${subsection}`,
        label: subsection,
        type: "subsection" as const,
        documentPaths: subsectionDocuments.map((document) => document.relativePath),
        children: []
      }))
  };
}

export function replaceIndexState(
  currentState: DiscoveryState,
  nextIndex: RuntimeDocumentIndex | null,
  nextMode: DiscoveryMode,
  error: string | null
): IndexReplacementResult {
  if (!nextIndex) {
    return {
      replaced: false,
      nextState: {
        ...currentState,
        mode: nextMode,
        error,
        currentIndex: currentState.currentIndex
      }
    };
  }

  return {
    replaced: true,
    nextState: {
      mode: nextMode,
      activeRoot: nextIndex.activeRoot,
      currentIndex: nextIndex,
      lastValidIndex: nextIndex.status === "failed" ? currentState.lastValidIndex : nextIndex,
      error
    }
  };
}
