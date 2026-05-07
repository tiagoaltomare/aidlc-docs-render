# Logical Components

## Extracted Source Validator

- Inspects the user-selected extracted folder for the required AIDLC release assets.
- Produces a structured validation result that can explain missing, ambiguous, or unsupported source layouts.
- Owns the validation-before-planning gate and exposes no executable setup decisions on failure.

## Setup Mode Resolver

- Determines which supported setup mode applies to the validated source content.
- Converts validated release structure into an explicit setup-mode decision rather than burying layout assumptions in copy logic.
- Prevents execution from continuing when setup mode cannot be resolved cleanly.

## Target Mapping Builder

- Builds explicit source-to-target mappings for the active setup mode.
- Anchors every destination to workspace-relative rules so copy intent is visible before execution.
- Produces normalized planning records that later components can analyze and summarize.

## Workspace Boundary Guard

- Verifies that every resolved destination path remains inside the active workspace root.
- Rejects out-of-bound or ambiguous targets before they can enter the executable plan.
- Centralizes one of the most important safety invariants for both example-based and property-based tests.

## Existing Target Analyzer

- Inspects current workspace targets referenced by the mapping set.
- Classifies target state so the planner can distinguish create, update, skip, and block scenarios explicitly.
- Keeps overwrite-risk reasoning separate from raw file-copy execution.

## Setup Plan Builder

- Combines validation results, setup mode, target mappings, boundary checks, and existing-target analysis into a deterministic setup plan.
- Produces an explicit operation set plus summary metadata for user confirmation and later execution reporting.
- Preserves the no-plan-on-validation-failure invariant.

## Setup Execution Coordinator

- Orchestrates plan execution only after a valid plan exists.
- Ensures execution follows the planned operations and records deterministic outcomes for each item.
- Owns fail-closed behavior when an operation cannot be completed safely.

## File Operation Executor

- Performs the concrete VS Code-native file and directory operations described by the approved plan.
- Avoids business-rule decisions during execution and focuses on applying one classified operation at a time.
- Returns structured success or failure results to the coordinator.

## Setup Outcome Summarizer

- Aggregates operation results into a concise, text-forward outcome summary.
- Preserves clear distinctions among created, updated, skipped, blocked, failed, and not-attempted work.
- Supports accessible reporting for normal success and partial-failure scenarios alike.

## Design Outcome

- Resilience is realized through validation-before-planning gates, deterministic classification, and explicit execution outcomes.
- Security is realized through host-only authority, workspace-bound target validation, and strict separation between planning and write execution.
- Maintainability and Partial PBT readiness are realized through isolated pure planning seams around validation, mapping, categorization, and plan assembly.
