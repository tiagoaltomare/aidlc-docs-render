# Business Logic Model

## Unit Scope

- **Unit**: Extension Foundation
- **Purpose**: Establish the extension shell, activation flow, command registrations, contribution points, and shared runtime contracts.
- **Boundaries**:
  - Owns activation-time orchestration and shared extension runtime setup
  - Owns contribution registration and host/webview contract initialization
  - Does not own document discovery, preview rendering logic, answer parsing, bootstrap execution details, or packaging validation logic

## Core Workflow Model

### Workflow 1: Extension Activation

1. The extension host starts the extension.
2. The foundation layer resolves core runtime context.
3. The foundation layer initializes shared services and registries.
4. The foundation layer registers commands, navigator hosts, and preview-capable contribution points.
5. The foundation layer exposes stable runtime contracts for downstream units.

### Workflow 2: Contribution Registration

1. The foundation layer determines which commands, views, and preview hooks must be available.
2. Each contribution is registered against the shared extension context.
3. Registration metadata is stored in a runtime registry.
4. Failures in one contribution path are surfaced safely without leaving the runtime in an unknown state.

### Workflow 3: UI Host Provisioning

1. A user requests the navigator through a command or view interaction.
2. The foundation layer resolves the target host type:
   - dedicated panel
   - side view
3. The foundation layer attaches shared contracts and base state to that UI host.
4. The selected UI host becomes available for navigator-specific logic in later units.

### Workflow 4: Shared Contract Provisioning

1. The foundation layer defines host-to-webview message shapes and event channels.
2. Runtime contracts are published for consumers such as discovery, preview, and save flows.
3. Downstream units use those contracts instead of inventing ad-hoc message paths.

## State Model

### Activation State

- Tracks whether the extension shell has been initialized.
- Tracks registered contributions and host instances.
- Tracks shared service availability for later units.

### Contribution Registry State

- Maintains the set of registered commands, view providers, and preview providers.
- Maintains status of each contribution: pending, active, failed, disposed.

### Host Shell State

- Maintains which navigator hosts are available.
- Tracks whether the dedicated panel and side view are provisioned or reusable.

### Contract Registry State

- Maintains shared message types, action names, and runtime payload contracts.
- Provides a stable reference surface for downstream units.

## Functional Outcomes

- The extension can activate reliably.
- Users have valid extension entry points even before downstream units are fully implemented.
- Downstream units receive consistent contracts and lifecycle hooks.
- The runtime foundation supports multiple UI hosts from the first delivery.
