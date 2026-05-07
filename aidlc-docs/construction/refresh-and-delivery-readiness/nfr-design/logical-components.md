# Logical Components

## Refresh Trigger Classifier

- Inspects watcher events, command requests, save completions, and bootstrap completions before refresh work is scheduled.
- Produces explicit relevance and scope decisions that downstream orchestration can trust.
- Centralizes one of the most important performance and security boundaries for this unit.

## Refresh Scheduler

- Accepts classified relevant refresh requests and determines whether to enqueue, supersede, or collapse pending work.
- Preserves deterministic sequencing so newer relevant state does not get overwritten by older pending refresh work.
- Keeps performance-oriented coalescing concerns separate from business-state rebuilding.

## Synchronization Coordinator

- Orchestrates the single runtime refresh path for discovery, navigator, preview, and integration-triggered refresh consumers.
- Ensures one coherent snapshot is published after a refresh attempt completes.
- Owns the boundary between imperative trigger handling and typed runtime state replacement.

## Last Valid Snapshot Store

- Retains the last known valid synchronized runtime snapshot.
- Supports degraded publication paths when refresh rebuilding fails after a prior valid state exists.
- Prevents silent loss of usable state during recoverable failures.

## Preview and Selection Validity Resolver

- Validates active navigator selection and open preview identities against the refreshed index.
- Derives ready, stale, unavailable, empty, or failed surface states for downstream presentation.
- Keeps stale-preview correctness separate from the raw discovery refresh logic itself.

## Refresh Outcome Publisher

- Converts refresh execution results and snapshot validity into concise runtime status updates and user-facing feedback.
- Preserves clear distinctions between clean success, degraded success, explicit stale states, and failure.
- Supports lightweight normal-status updates and richer degraded-state reporting paths.

## Delivery Readiness Check Registry

- Defines the set of build, test, packaging, and blocker validation categories used by readiness reporting.
- Keeps readiness coverage explicit and stable as the repository evolves.
- Prevents ad hoc omission of validation categories from final delivery summaries.

## Delivery Readiness Aggregator

- Combines typed readiness-check results into one deterministic overall readiness report.
- Derives passed, failed, blocked, or not-yet-run outcomes without free-form guesswork.
- Preserves the coverage invariant that every category appears exactly once in the summarized report.

## Validation Boundary Adapter

- Bridges repository-local validation execution with the typed readiness reporting model.
- Keeps build/test/package execution concerns at the boundary while preserving pure readiness aggregation inside the core logic.
- Supports later build-and-test integration without redesigning the delivery-report model.

## Design Outcome

- Resilience is realized through relevant-trigger gating, superseding refresh scheduling, preserved last-valid snapshots, and explicit stale-state publication.
- Security is realized through trigger-scope validation, coherent host-side snapshot publication, and repository-local validation boundaries.
- Maintainability and Partial PBT readiness are realized through isolated pure seams around classification, scheduling, state replacement, stale-surface derivation, and readiness aggregation.
