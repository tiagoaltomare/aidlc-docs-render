# Requirements

## Intent Analysis Summary

- **User Request**: Transform the current site that renders AIDLC markdown files into a full functional VS Code extension for `1.117+`, use React for the frontend, preserve the existing functions, and complete a production-ready delivery cycle.
- **Request Type**: Brownfield migration and product transformation.
- **Scope Estimate**: System-wide change affecting runtime model, UI architecture, persistence model, packaging, and testing.
- **Complexity Estimate**: Complex.
- **Requirements Depth**: Comprehensive.

## Solution Summary

The current browser-first static viewer will be transformed into a VS Code extension centered on a React-based webview navigator. The extension must detect and render AIDLC documentation, keep the current core feature set, open selected files in editor-area tabs, support in-place answer editing, support raw markdown and rendered preview experiences, refresh on workspace changes, and be deliverable as a buildable packaged extension with automated validation.

## Functional Requirements

### FR-01 Extension Activation and Entry Points

- The solution MUST be delivered as a VS Code extension targeting `1.117+`.
- The extension MUST activate in a way that supports opening the AIDLC experience from VS Code commands and extension UI surfaces.
- The extension MUST provide a React-based webview experience as the main navigation shell for AIDLC documents.

### FR-02 Document Discovery

- The extension MUST automatically detect `aidlc-docs/` in the current workspace when present.
- The extension MUST also support manual selection or configuration of the docs root when auto-detection is insufficient.
- The extension MUST handle both workspace-driven detection and manual path selection without requiring repository restructuring.
- The extension MUST also support AIDLC workspace initialization when the repository has not yet been prepared.
- For initialization, the extension MUST let the user indicate the local folder where the downloaded and extracted AIDLC release contents are located.
- Based on that selected extracted folder, the extension MUST perform the required copy/setup steps in the target workspace so the user does not need to manually place the files.
- The initialization flow MUST reflect the official AIDLC setup model in which the extracted release contains `aidlc-rules/` with `aws-aidlc-rules/` and `aws-aidlc-rule-details/`, and the extension must copy the appropriate files into the workspace according to the selected setup mode.
- The initialization flow MUST support at least the VS Code extension use case for agent/workspace setup, including creation or update of the required top-level instruction file and the rule-details directory in the correct locations.
- The extension SHOULD let the user choose the target setup mode when multiple supported agent/layout conventions are possible for the workspace.

### FR-02A AIDLC Bootstrap and Setup Assistance

- The extension MUST provide an explicit command or guided setup flow to initialize AIDLC in the current repository/workspace.
- The setup flow MUST ask where the user extracted the official AIDLC zip contents, instead of assuming a fixed `Downloads` location.
- The setup flow MUST validate that the selected folder contains the expected extracted AIDLC structure before copying files.
- The setup flow MUST copy the required workflow/rule files into the correct destination paths for the chosen setup mode.
- The setup flow MUST avoid requiring the user to manually copy `core-workflow` and rule-details files after selecting the extracted folder.
- The setup flow MUST report what files and directories were created or updated in the workspace.

### FR-03 Navigation Experience

- The React webview MUST render the document navigation structure derived from the current AIDLC conventions.
- Navigation MUST preserve phase grouping behavior equivalent to the current viewer, including `overview`, `inception`, `construction`, `operations`, and fallback grouping when needed.
- The navigator MUST support search across the discovered documents.
- The navigator MUST support section and subsection grouping comparable to the current experience.

### FR-04 Editor-Area File Opening

- Selecting a file from the navigator MUST open that file in VS Code editor-area tabs.
- The extension MUST support both:
  - raw markdown editor tabs
  - rendered preview tabs
- The webview navigator MUST act as the coordinating shell for opening the supported tab modes.

### FR-05 Markdown Rendering

- The rendered experience MUST support the current markdown feature set used by the site.
- Rendered documents MUST preserve code block rendering and syntax highlighting behavior.
- Rendered documents MUST preserve Mermaid diagram rendering behavior.
- The extension MUST continue to display document title, path context, and AIDLC phase context in the rendered experience.

### FR-06 Answer Field Behavior

- The extension MUST preserve the current `[Answer]:` interaction model for standalone answer markers.
- Standalone `[Answer]:` lines MUST be converted into editable answer fields in the rendered experience.
- Non-standalone uses of `[Answer]:` MUST NOT incorrectly create answer input controls.
- Users MUST be able to create or update AIDLC answers in place without leaving VS Code.
- Full markdown editing beyond answer fields MUST remain available through raw markdown editor tabs.

### FR-07 Save Behavior

- Answer-field edits performed in the rendered experience MUST save back to the workspace markdown files.
- The solution MUST keep answer editing in the rendered experience while using editor tabs for broader file editing.
- The extension MUST replace the current local HTTP save flow with VS Code-native file operations.

### FR-08 Refresh and Synchronization

- The extension MUST automatically refresh relevant UI state when markdown files change in the workspace.
- The extension MUST also provide manual refresh controls or commands.
- The navigator and rendered views MUST stay synchronized with the current workspace content after refresh.

### FR-09 Manifest and Data Loading Model

- The extension MUST remove the dependency on a generated checked-in `manifest.js` runtime artifact.
- Document indexing and content loading MUST be built from extension/runtime memory and workspace scanning logic.
- The extension MAY internally use derived in-memory data structures, but users must not depend on external manifest generation as an operational step.

### FR-10 Compatibility Modes

- The extension MUST support raw markdown editor tabs and rendered preview tabs as first-class user flows.
- The extension SHOULD support the current workspace model, remote workspaces, and web-extension-compatible operation where feasible within the chosen VS Code APIs.

### FR-11 Packaging and Delivery

- The final delivery for this cycle MUST include packaging readiness for `.vsix` distribution.
- The extension MUST be buildable from the repository with documented steps.
- The extension MUST be functionally complete enough to replace the existing site for the core AIDLC docs workflow.

## Non-Functional Requirements

### NFR-01 Frontend Technology

- The frontend of the extension MUST use React.
- The React implementation MUST be suitable for VS Code webviews and aligned with extension packaging constraints.

### NFR-02 User Experience

- The solution MAY redesign the current UI for better VS Code fit, but it MUST preserve all major user-facing functions of the existing viewer.
- The navigation and reading experience SHOULD feel coherent with VS Code rather than as a direct browser clone.
- The design MUST remain usable for large AIDLC document trees.

### NFR-03 Performance

- Initial document discovery and navigation rendering SHOULD remain responsive for normal AIDLC repositories.
- Search, refresh, and document switching SHOULD avoid unnecessary full rescans where practical.

### NFR-04 Security

- Security Baseline rules are enabled and blocking for this project.
- The extension design MUST account for VS Code webview security boundaries, including content handling, message passing, and dependency trust.
- File writes MUST be limited to intended workspace targets.
- Input and message handling MUST be validated before persistence or privileged extension-host actions.

### NFR-05 Dependency Strategy

- The user accepts CDN usage in the shipped extension if it simplifies delivery.
- This allowance MUST still be evaluated against applicable VS Code webview CSP and enabled security constraints during design and implementation.
- Any external dependency strategy MUST remain compatible with `.vsix` delivery requirements.

### NFR-06 Testability

- The delivered extension MUST include automated tests for core logic and extension activation paths.
- The delivery MUST include packaging readiness and validation appropriate for `.vsix` output.
- Manual verification of preserved core features MUST also be supported.

### NFR-07 Property-Based Testing

- Property-Based Testing is enabled in Partial mode for this project.
- At minimum, applicable pure functions and serialization or round-trip transformations introduced during the migration MUST be considered for PBT coverage during later construction stages.

## User Scenarios

### US-01 Browse and Read

- A user opens the extension in VS Code and browses the AIDLC docs tree by phase, section, and document.

### US-00 Initialize AIDLC in a Repository

- A user downloads the official AIDLC release zip, extracts it to a local folder of their choice, points the extension to that extracted folder, and lets the extension copy the required AIDLC files into the correct workspace locations automatically.

### US-02 Search and Navigate

- A user searches for a specific requirement, stage, or question and navigates directly to the relevant document.

### US-03 Open Raw Markdown

- A user selects a document from the navigator and opens the raw markdown file in an editor tab for full manual editing.

### US-04 Open Rendered Preview

- A user opens a rendered preview tab for a selected document while still keeping the navigator available.

### US-05 Answer Workflow Questions

- A user fills in standalone `[Answer]:` fields directly from the rendered experience and saves them back to disk.

### US-06 Stay in Sync

- A user edits markdown in raw tabs or through other workspace actions and sees the navigator and preview update through automatic or manual refresh.

## Business and Delivery Constraints

- The current major functions of the site must be maintained in the extension.
- The delivery target is the current cycle and must end as a full functional extension rather than a prototype.
- The project is allowed to redesign the UI, but not to regress on core capabilities.

## Architectural Considerations

- The migration replaces a static browser-plus-Python-helper model with an extension-host plus webview model.
- The navigation shell is expected to remain in a React webview.
- Editor tabs are expected to host raw markdown and rendered preview experiences.
- The existing manifest-generation flow should be eliminated as a required user workflow.
- The extension must add a repository bootstrap capability for AIDLC setup, not just document rendering, because initial workspace preparation becomes part of the product scope.
- CDN usage is accepted by the user, but it will need explicit validation against extension CSP and security constraints in later stages.

## Open Risks to Carry Forward

- CDN acceptance may conflict with secure default webview CSP policies and could require mitigation or revision during design.
- Supporting both rendered preview tabs and raw markdown tabs increases extension complexity but is now an explicit requirement.
- Remote and web-compatible support is a goal "where feasible" and may need precise scoping during planning and design.

## Extension Rule Compliance Summary

### Security Baseline

- **SECURITY-01**: N/A at requirements stage. No persistence resource design has been specified yet.
- **SECURITY-02**: N/A at requirements stage. No network intermediary design has been specified yet.
- **SECURITY-03**: N/A at requirements stage. Logging design belongs to later stages.
- **SECURITY-04**: N/A at requirements stage. Webview response-header strategy is not designed yet.
- **SECURITY-05**: Compliant at requirements stage. Input validation has been captured as a requirement for file writes and message handling.
- **SECURITY-06**: N/A at requirements stage. Access-policy design is deferred.
- **SECURITY-07**: N/A at requirements stage. Network design is deferred.
- **SECURITY-08**: N/A at requirements stage. Authentication and authorization design is not yet in scope.
- **SECURITY-09**: Compliant at requirements stage. Supported-version and safe delivery expectations are captured.
- **SECURITY-10**: Compliant at requirements stage. Packaging and dependency strategy are explicitly called out for later enforcement.
- **SECURITY-11**: Compliant at requirements stage. Secure design concerns and layered responsibility boundaries are captured.
- **SECURITY-12**: N/A at requirements stage. No user-authentication system is defined.
- **SECURITY-13**: N/A at requirements stage. Integrity-verification details will be decided in design and build planning.
- **SECURITY-14**: N/A at requirements stage. Monitoring and alerting are not designed yet.
- **SECURITY-15**: Compliant at requirements stage. Safe message and file-operation handling are captured as requirements.

### Property-Based Testing

- **PBT-02**: N/A at requirements stage. Round-trip candidates will be identified during design and code planning.
- **PBT-03**: N/A at requirements stage. Invariants are not yet decomposed to unit level.
- **PBT-07**: N/A at requirements stage. Generator design belongs to later stages.
- **PBT-08**: N/A at requirements stage. Execution and reproducibility rules belong to later stages.
- **PBT-09**: Compliant at requirements stage. Partial PBT enforcement has been selected and must be reflected in later tech stack decisions.
