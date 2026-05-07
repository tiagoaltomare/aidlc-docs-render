# Security Test Instructions

## Purpose

Validate the main security-sensitive behaviors introduced across the extension migration.

## Security Test Areas

### 1. Workspace Write Boundaries

- During bootstrap setup, confirm that:
  - only intended workspace destinations are written
  - out-of-bound target resolution is blocked
  - existing conflicting targets are surfaced as blocked instead of overwritten silently

### 2. Message and Command Validation

- Confirm that:
  - stale preview save requests are rejected safely
  - stale navigator open requests are rejected safely
  - refresh and readiness commands do not perform unintended writes

### 3. Refresh Scope Validation

- Confirm that unrelated workspace changes do not trigger privileged refresh work unnecessarily
- Confirm that relevant docs or packaging-input changes do trigger coordinated refresh behavior

### 4. Packaging and Runtime Boundaries

- Confirm that readiness checks stay repository-local
- Confirm that no legacy helper server or external unmanaged process is required for extension operation

## Execution Approach

- Use manual inspection in the extension development host
- Combine this with source review of:
  - `src/extension/bootstrap/`
  - `src/extension/refresh/`
  - `src/extension/renderedPreviewProvider.ts`
  - `src/shared/`

## Expected Results

- Unsafe writes are blocked
- Stale requests fail closed
- Refresh scope stays within intended boundaries
- Delivery readiness does not depend on the old standalone workflow
