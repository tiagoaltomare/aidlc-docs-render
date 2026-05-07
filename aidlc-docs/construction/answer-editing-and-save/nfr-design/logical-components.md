# Logical Components

## Component 1: Answer Region Classifier

- **Purpose**: Determine which markdown regions are eligible answer-marker regions versus excluded or untouched regions.
- **Responsibilities**:
  - track fenced code and other excluded regions
  - identify standalone answer-marker placements
  - produce deterministic eligibility output
- **Patterns Applied**:
  - Region-Aware Answer Extraction
  - Pure-Seam-First Transformation Logic

## Component 2: Answer Extraction Builder

- **Purpose**: Produce the structured extraction result and ordered answer-field descriptors for a markdown document.
- **Responsibilities**:
  - build stable answer-field identities
  - preserve original answer values
  - capture untouched content structure needed for rebuild
- **Patterns Applied**:
  - Region-Aware Answer Extraction
  - Structured Rebuild From Extraction Result
  - Pure-Seam-First Transformation Logic

## Component 3: Preview Answer State Adapter

- **Purpose**: Bridge the host-produced extraction result into the preview’s editable answer state.
- **Responsibilities**:
  - initialize current values from the extracted baseline
  - expose dirty-state inputs to the preview
  - preserve explicit save lifecycle status
- **Patterns Applied**:
  - Explicit Save Lifecycle State Machine
  - Dirty-State Delta Comparison

## Component 4: Dirty-State Comparator

- **Purpose**: Determine whether the preview currently contains unsaved answer changes.
- **Responsibilities**:
  - compare current values against the original extracted baseline
  - expose stable dirty/not-dirty results
  - avoid unnecessary rebuild work during ordinary typing
- **Patterns Applied**:
  - Dirty-State Delta Comparison
  - Pure-Seam-First Transformation Logic

## Component 5: Save Request Guard

- **Purpose**: Validate incoming save requests before rebuild and persistence begin.
- **Responsibilities**:
  - verify document identity and version relevance
  - verify answer-field ownership and field-id legitimacy
  - reject stale or malformed requests
- **Patterns Applied**:
  - Host-Owned Markdown Authority
  - Fail-Closed Save Pipeline

## Component 6: Markdown Rebuild Engine

- **Purpose**: Apply updated answer values back into markdown using the structured extraction result.
- **Responsibilities**:
  - rewrite only owned answer regions
  - preserve untouched content exactly
  - produce explicit rebuild success or failure output
- **Patterns Applied**:
  - Structured Rebuild From Extraction Result
  - Pure-Seam-First Transformation Logic

## Component 7: Workspace Save Executor

- **Purpose**: Persist rebuilt markdown back to the workspace file through trusted VS Code APIs.
- **Responsibilities**:
  - perform the final write to the intended target file
  - return explicit success or failure categories
  - avoid partial writes on failed validation or rebuild
- **Patterns Applied**:
  - Host-Owned Markdown Authority
  - Fail-Closed Save Pipeline

## Component 8: Save Lifecycle Coordinator

- **Purpose**: Orchestrate validation, rebuild, write, and preview feedback into a single explicit save flow.
- **Responsibilities**:
  - transition between idle, saving, saved, and failed states
  - preserve unsaved edits on failure
  - establish a new baseline on success
- **Patterns Applied**:
  - Fail-Closed Save Pipeline
  - Explicit Save Lifecycle State Machine

## Component 9: Editing Mode Boundary Surface

- **Purpose**: Keep preview answer editing clearly separated from full raw markdown editing.
- **Responsibilities**:
  - surface mode guidance to the preview UI
  - preserve raw-tab expectations for broader edits
  - prevent preview save affordances from implying full-document persistence coverage
- **Patterns Applied**:
  - Dual-Mode Editing Separation

## Interaction Summary

- `Answer Region Classifier` and `Answer Extraction Builder` create the authoritative extraction result.
- `Preview Answer State Adapter` and `Dirty-State Comparator` drive responsive preview editing behavior.
- `Save Request Guard` validates save inputs before any trusted mutation occurs.
- `Markdown Rebuild Engine` produces the new markdown candidate only from validated state.
- `Workspace Save Executor` performs the actual workspace write through VS Code APIs.
- `Save Lifecycle Coordinator` returns explicit save-state feedback to the preview while `Editing Mode Boundary Surface` preserves clarity about preview versus raw editing responsibilities.
