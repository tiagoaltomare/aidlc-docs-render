import { ContributionDefinition, ContributionState } from "./contracts";

export interface ContributionRegistry {
  readonly commands: Map<string, ContributionState>;
  readonly views: Map<string, ContributionState>;
  readonly customEditors: Map<string, ContributionState>;
}

export function createContributionRegistry(): ContributionRegistry {
  return {
    commands: new Map(),
    views: new Map(),
    customEditors: new Map()
  };
}

export function registerContribution(
  registry: ContributionRegistry,
  contribution: ContributionDefinition
): void {
  const target =
    contribution.type === "command"
      ? registry.commands
      : contribution.type === "view"
        ? registry.views
        : registry.customEditors;

  if (target.has(contribution.id)) {
    throw new Error(`Duplicate contribution id: ${contribution.id}`);
  }

  target.set(contribution.id, {
    ...contribution,
    status: "active"
  });
}

export function markContributionFailure(
  registry: ContributionRegistry,
  contribution: ContributionDefinition,
  detail: string
): void {
  const target =
    contribution.type === "command"
      ? registry.commands
      : contribution.type === "view"
        ? registry.views
        : registry.customEditors;

  target.set(contribution.id, {
    ...contribution,
    status: "failed",
    detail
  });
}

export function listActiveCapabilities(registry: ContributionRegistry): string[] {
  return [
    ...collectActive(registry.commands),
    ...collectActive(registry.views),
    ...collectActive(registry.customEditors)
  ];
}

function collectActive(target: Map<string, ContributionState>): string[] {
  return [...target.values()]
    .filter((entry) => entry.status === "active")
    .map((entry) => entry.id);
}
