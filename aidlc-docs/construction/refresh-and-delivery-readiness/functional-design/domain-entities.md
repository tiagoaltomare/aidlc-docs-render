# Domain Entities

## Entity 1: RefreshTrigger

- **Purpose**: Represent why a refresh was requested.
- **Fields**:
  - trigger id
  - trigger source
  - affected path set
  - full refresh flag
  - request timestamp
- **Rules**:
  - Trigger source must be explicit, such as startup, file watcher, manual command, save completion, or bootstrap completion.
  - Full refresh intent must be explicit rather than inferred later from downstream behavior.

## Entity 2: RefreshWorkClassification

- **Purpose**: Represent the relevance and scope of a potential refresh.
- **Fields**:
  - relevance flag
  - relevance reason
  - refresh scope
  - supersedes prior work flag
- **Rules**:
  - Irrelevant changes must be classified before scheduling refresh work.
  - Classification must explain whether the trigger requires no action, targeted refresh intent, or full resynchronization.

## Entity 3: RuntimeSynchronizationSnapshot

- **Purpose**: Represent one coherent synchronized runtime view after refresh processing.
- **Fields**:
  - refresh sequence number
  - lifecycle status
  - active docs-root version
  - navigator validity state
  - preview validity state
  - last success timestamp
  - current error summary
- **Rules**:
  - A published snapshot must represent one coherent state across the participating runtime consumers.
  - Snapshot lifecycle must distinguish ready, refreshing, degraded, stale, empty, and failed conditions.

## Entity 4: RefreshExecutionOutcome

- **Purpose**: Represent the outcome of one refresh attempt.
- **Fields**:
  - trigger reference
  - outcome status
  - refreshed components
  - preserved prior state flag
  - outcome message
- **Rules**:
  - Every refresh attempt must resolve to a single explicit outcome.
  - Outcome messaging must reflect whether last valid state was preserved.

## Entity 5: DeliveryReadinessCheck

- **Purpose**: Represent one validation category in the package-readiness workflow.
- **Fields**:
  - check id
  - check category
  - execution status
  - result status
  - detail summary
- **Rules**:
  - Every delivery validation category must map to exactly one check record.
  - Execution status and result status must remain distinct so not-yet-run and failed are not conflated.

## Entity 6: DeliveryReadinessReport

- **Purpose**: Represent the summarized readiness outcome for the extension delivery cycle.
- **Fields**:
  - report timestamp
  - overall readiness status
  - build check results
  - test check results
  - packaging check results
  - blocker summary
- **Rules**:
  - The report must aggregate all delivery checks into one coherent readiness view.
  - The overall readiness status must be derivable from the category results rather than manually guessed.

## Entity Relationships

- `RefreshTrigger` produces `RefreshWorkClassification`.
- `RefreshWorkClassification` drives one `RefreshExecutionOutcome`.
- Successful or degraded refresh execution publishes a `RuntimeSynchronizationSnapshot`.
- Delivery validation is composed of multiple `DeliveryReadinessCheck` records.
- `DeliveryReadinessCheck` records compose one `DeliveryReadinessReport`.
