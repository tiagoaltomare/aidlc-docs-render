# User Stories

## Story Organization

- **Approach**: User journey-based with feature subgrouping
- **Granularity**: Fine-grained stories for distinct capabilities and interactions
- **Acceptance Criteria Depth**: Standard detail with important user-visible behaviors and edge cases

## Story Map

### Journey Group 1: Initialize AIDLC in a Repository

#### US-01: Start Guided AIDLC Setup

**As a** technical workspace maintainer  
**I want** a clear command or entry point to initialize AIDLC in the current workspace  
**So that** I can start setup without manually following file-copy instructions

**Primary Personas**: Technical Workspace Maintainer

**Acceptance Criteria**
- The extension exposes an explicit setup/initiation command for AIDLC workspace initialization.
- The command is available from a VS Code-native interaction point such as the Command Palette.
- If the workspace is already initialized, the extension tells the user and offers an appropriate next action instead of blindly duplicating files.

#### US-02: Select Extracted AIDLC Source Folder

**As a** technical workspace maintainer  
**I want** to point the extension to the folder where I extracted the official AIDLC release  
**So that** the extension can prepare the workspace from that source

**Primary Personas**: Technical Workspace Maintainer

**Acceptance Criteria**
- The setup flow asks the user to choose the extracted AIDLC folder instead of assuming a fixed download path.
- The chosen folder is validated against the expected extracted AIDLC structure before setup continues.
- If the structure is invalid or incomplete, the extension shows a clear error and does not perform partial copying.

#### US-03: Apply AIDLC Files to the Workspace

**As a** technical workspace maintainer  
**I want** the extension to copy the required AIDLC files into the right workspace locations  
**So that** I do not need to manually place AGENTS or rule-details files

**Primary Personas**: Technical Workspace Maintainer

**Acceptance Criteria**
- After validation, the extension copies the required files into the correct destination paths for the chosen setup mode.
- The extension supports at least the Codex/OpenAI Codex-style workspace setup layout required by the project.
- The extension reports what files or folders were created or updated.
- The extension avoids writing outside the intended workspace target.

#### US-04: Handle Reinitialization Safely

**As a** technical workspace maintainer  
**I want** the extension to handle existing AIDLC files safely during setup  
**So that** initialization does not accidentally damage an already prepared workspace

**Primary Personas**: Technical Workspace Maintainer

**Acceptance Criteria**
- If destination files already exist, the extension detects that state before overwriting them.
- The extension presents a safe and explicit update behavior instead of silently replacing files.
- The extension completes with a clear summary of the final workspace state.

### Journey Group 2: Discover and Navigate Documentation

#### US-05: Auto-Detect AIDLC Docs

**As a** technical workspace maintainer or documentation workflow contributor  
**I want** the extension to detect `aidlc-docs/` automatically in the workspace  
**So that** I can start browsing quickly when the repository is already prepared

**Primary Personas**: Technical Workspace Maintainer, Documentation Workflow Contributor

**Acceptance Criteria**
- The extension detects `aidlc-docs/` in the current workspace when it exists.
- The extension loads document metadata without requiring a generated checked-in manifest file.
- If auto-detection fails, the extension clearly offers a manual selection path.

#### US-06: Choose a Docs Root Manually

**As a** technical workspace maintainer or documentation workflow contributor  
**I want** to manually choose the docs root when auto-detection is insufficient  
**So that** the extension still works in non-standard repository layouts

**Primary Personas**: Technical Workspace Maintainer, Documentation Workflow Contributor

**Acceptance Criteria**
- The extension provides a manual selection flow for choosing a docs root.
- The chosen path is validated before the navigator attempts to render documents.
- Invalid selections do not leave the extension in a broken or misleading state.

#### US-07: Browse Documents by AIDLC Structure

**As a** documentation workflow contributor  
**I want** the navigator to group documents by AIDLC phase and section  
**So that** I can understand the documentation tree quickly

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- The navigator groups documents into `overview`, `inception`, `construction`, `operations`, and fallback groups as needed.
- Sections and subsections are shown in a way comparable to the current viewer.
- The navigation remains usable for larger AIDLC trees.

#### US-08: Search the Documentation Tree

**As a** documentation workflow contributor  
**I want** to search across the discovered docs  
**So that** I can quickly find specific stages, requirements, or questions

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- The navigator provides search across the discovered document set.
- Search results narrow the visible navigation choices in a way users can understand.
- Clearing the search restores the normal navigation structure.

### Journey Group 3: Open and Read Documents

#### US-09: Open Raw Markdown in Editor Tabs

**As a** technical workspace maintainer  
**I want** selected documents to open as raw markdown in editor tabs  
**So that** I can make broader manual edits when needed

**Primary Personas**: Technical Workspace Maintainer

**Acceptance Criteria**
- The extension can open a selected document as a normal raw markdown editor tab.
- The opened tab points to the workspace file rather than to a detached copy.
- The navigator remains available after opening the raw markdown tab.

#### US-10: Open Rendered Preview Tabs

**As a** documentation workflow contributor  
**I want** selected documents to open in rendered preview tabs  
**So that** I can read and interact with AIDLC content more comfortably

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- The extension can open a selected document in a rendered preview tab in the editor area.
- The rendered preview preserves key document context such as title, path, and phase.
- The rendered preview supports markdown features required by the existing viewer.

#### US-11: Render Code and Mermaid Correctly

**As a** documentation workflow contributor  
**I want** rendered documents to preserve code highlighting and Mermaid diagrams  
**So that** I can understand technical content without regressions from the current site

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- Code blocks are rendered with syntax highlighting.
- Mermaid diagrams are rendered in the preview experience.
- If a renderable element fails, the extension shows a safe and understandable fallback rather than a broken page.

### Journey Group 4: Answer and Save Workflow Content

#### US-12: Render Standalone Answer Fields

**As a** documentation workflow contributor  
**I want** standalone `[Answer]:` markers to become editable answer fields  
**So that** I can fill workflow responses directly in the rendered experience

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- A standalone `[Answer]:` line is rendered as an editable answer input.
- Non-standalone uses of `[Answer]:` do not become editable fields.
- Existing answer values are shown correctly when present in the markdown.

#### US-13: Save Answer Edits Back to Markdown

**As a** documentation workflow contributor  
**I want** answer edits to save directly back to workspace markdown files  
**So that** my workflow responses persist without leaving VS Code

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- Saving an answer-field edit writes the updated content back to the correct workspace markdown file.
- The save flow uses VS Code-native file operations rather than a local HTTP helper server.
- The user receives clear feedback when the save succeeds or fails.

#### US-14: Preserve Full Editing Through Raw Tabs

**As a** technical workspace maintainer  
**I want** broader markdown edits to remain available in raw tabs while answer edits stay easy in preview  
**So that** I can use the best editing mode for each task

**Primary Personas**: Technical Workspace Maintainer, Documentation Workflow Contributor

**Acceptance Criteria**
- The rendered experience focuses on answer-field interaction rather than full arbitrary markdown editing.
- Full markdown changes remain possible through raw editor tabs.
- The two modes are understandable and do not create conflicting expectations about what can be edited where.

### Journey Group 5: Stay Synchronized and Ready to Ship

#### US-15: Refresh Automatically on Workspace Changes

**As a** documentation workflow contributor  
**I want** the navigator and previews to refresh when workspace markdown changes  
**So that** I can trust what I am seeing

**Primary Personas**: Documentation Workflow Contributor, Technical Workspace Maintainer

**Acceptance Criteria**
- Relevant extension views refresh automatically when source markdown files change in the workspace.
- Automatic refresh keeps navigation and rendered content aligned with current files.
- Refresh behavior avoids misleading stale content after file edits.

#### US-16: Refresh Manually When Needed

**As a** technical workspace maintainer  
**I want** a manual refresh control  
**So that** I can explicitly resynchronize the extension when needed

**Primary Personas**: Technical Workspace Maintainer, Documentation Workflow Contributor

**Acceptance Criteria**
- The extension provides a manual refresh command or control.
- Manual refresh rebuilds the current document-discovery state from workspace content.
- The manual refresh action is available without leaving VS Code.

#### US-17: Install a Packaged Extension Build

**As a** repository maintainer or technical workspace maintainer  
**I want** the extension to be deliverable as an installable `.vsix`-ready package  
**So that** the solution can be distributed and validated as a real extension

**Primary Personas**: Technical Workspace Maintainer

**Acceptance Criteria**
- The repository can produce a build suitable for `.vsix` packaging.
- The delivery includes the steps or automation needed to validate packaging readiness.
- Packaging readiness does not depend on the old standalone viewer workflow.

## INVEST Review Summary

- **Independent**: Stories are separated by clear user outcomes such as setup, discovery, preview, answer editing, and refresh.
- **Negotiable**: UI details and implementation choices remain open where not fixed by requirements.
- **Valuable**: Every story maps to a visible user workflow or maintainability outcome.
- **Estimable**: Stories are split finely enough to estimate and implement incrementally.
- **Small**: The story set favors narrow capability slices over broad epics for the first cycle.
- **Testable**: Each story includes acceptance criteria with observable behaviors.

## Persona-to-Story Mapping

- **Technical Workspace Maintainer**: US-01, US-02, US-03, US-04, US-05, US-06, US-09, US-10, US-11, US-13, US-14, US-16, US-17
- **Documentation Workflow Contributor**: US-05, US-06, US-07, US-08, US-10, US-11, US-12, US-13, US-14, US-15, US-16
