# NFR Design Patterns

## Relevant-Trigger-First Refresh Gate

- Classify watcher events, save completions, bootstrap completions, startup sync, and manual refresh requests before scheduling any runtime rebuild work.
- Reject irrelevant workspace noise early so the extension does not drift into expensive or misleading refresh behavior.
- Treat trigger source and affected paths as untrusted inputs until they pass scope checks.

## Single Refresh Coordination Path

- Route watcher-triggered, manual, save-triggered, and bootstrap-triggered refreshes through one host-side coordination path.
- Prevent independent consumers from rebuilding and publishing state separately.
- Ensure each published refresh result represents one coherent runtime snapshot.

## Superseding Refresh Scheduling

- Allow later relevant refresh requests to supersede older pending work when the older work has not yet published state.
- Avoid duplicate rescans for near-simultaneous events that affect the same logical content set.
- Preserve deterministic publication order so users do not see stale state briefly overwrite newer state.

## Last-Valid-State Preservation

- Preserve the last valid synchronized snapshot when a refresh attempt fails after a valid baseline already exists.
- Publish degraded or stale status explicitly instead of silently clearing working state.
- Keep failure recovery behavior shared across watcher, manual, and integration-triggered refreshes.

## Explicit Stale-or-Unavailable Surface Handling

- Validate current navigator selection and preview identity against the refreshed index before publishing updated UI state.
- Transition missing or invalid documents into explicit stale or unavailable states instead of rendering misleading content.
- Preserve clear separation among ready, empty, stale, degraded, and failed conditions.

## Typed Delivery-Readiness Aggregation

- Represent build, test, packaging, and blocker outcomes as explicit typed checks rather than free-form summary strings only.
- Aggregate per-category results into a deterministic overall readiness status.
- Ensure every readiness category is represented exactly once in the final report.

## Repository-Local Validation Boundary

- Keep readiness checks inside repository-local or extension-host controlled validation paths rather than relying on legacy helper services.
- Separate runtime synchronization duties from build/package validation duties even when both belong to the same delivery-oriented unit.
- Preserve packaging readiness without coupling the extension to the old standalone viewer workflow.

## Pure-Seam-First Synchronization Logic

- Isolate trigger classification, refresh supersession rules, last-valid-state replacement, stale-preview derivation, and readiness report aggregation into pure or near-pure helpers where practical.
- Reserve imperative watcher registration, command execution, and build/test invocation for the outer orchestration boundary.
- Keep the highest-risk correctness rules easy to verify with example-based and property-based tests.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-03**: Compliant. Refresh and readiness outcomes remain explicit and reportable.
- **SECURITY-05**: Compliant. Trigger scope validation and readiness-input classification are built into the design.
- **SECURITY-09**: Compliant. Stale-state handling and readiness aggregation reduce unsafe or misleading operational behavior.
- **SECURITY-10**: Compliant. The design keeps synchronization and delivery validation inside managed repository-local or extension-host boundaries.
- **SECURITY-11**: Compliant. Refresh coordination and readiness validation remain separated by concern.
- **SECURITY-13**: Compliant. Coherent snapshot publication and validated trigger scope protect runtime integrity.
- **SECURITY-15**: Compliant. Failed refreshes and blocked readiness checks fail closed with explicit degraded or blocked states.

### Property-Based Testing

- **PBT-03**: Strongly supported. Trigger-filtering, supersession, preserved-state, and readiness-coverage invariants are first-class seams.
- **PBT-07**: Strongly supported. The design isolates generators around trigger sequences, snapshot lifecycles, and readiness-check sets.
- **PBT-09**: Compliant. Pure-seam-first helpers fit the shared TypeScript testing strategy.
