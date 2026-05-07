# Personas

## Persona 1: Technical Workspace Maintainer

- **Name**: Technical Workspace Maintainer
- **Primary Role**: Developer or technical AI-assisted workflow user who configures repositories and works daily inside VS Code
- **Goals**:
  - Initialize AIDLC in repositories without manual file-copy work
  - Open and navigate AIDLC artifacts quickly inside VS Code
  - Switch efficiently between rendered documentation and raw markdown editing
  - Keep the extension reliable enough for daily project use
- **Key Behaviors**:
  - Works inside repositories and understands workspace structure
  - Frequently uses commands, tabs, and integrated tooling in VS Code
  - Expects automation for setup, refresh, and save flows
- **Pain Points Today**:
  - Needs a separate browser-style viewer and helper scripts
  - Must reason about manual setup and file placement when initializing AIDLC
  - Juggles rendering, editing, and saving across non-native flows
- **Needs From the Extension**:
  - Guided AIDLC setup from an extracted release folder
  - Reliable document discovery and refresh behavior
  - Clear opening modes for raw editor tabs and rendered preview tabs
  - Safe save-back behavior using VS Code-native file operations
- **Relevant Stories**:
  - US-01 through US-11

## Persona 2: Documentation Workflow Contributor

- **Name**: Documentation Workflow Contributor
- **Primary Role**: User who mainly reads AIDLC documents, fills workflow answers, and reviews generated artifacts inside VS Code
- **Goals**:
  - Read AIDLC documents in a clean, structured way
  - Search and jump to relevant workflow documents quickly
  - Fill `[Answer]:` fields without breaking markdown formatting
  - Stay inside VS Code instead of switching to external tools
- **Key Behaviors**:
  - Works more in docs and review flows than in implementation code
  - Needs confidence that edited answers are saved correctly
  - Benefits from rendered previews more than raw file manipulation
- **Pain Points Today**:
  - Answering workflow questions outside VS Code adds friction
  - Raw markdown is harder to navigate than a purpose-built viewer
  - Manual refresh and save flows can feel fragile
- **Needs From the Extension**:
  - Searchable rendered docs experience
  - Reliable answer-field rendering only where appropriate
  - Simple save and refresh feedback
  - Easy switching between rendered and raw file views when needed
- **Relevant Stories**:
  - US-03 through US-10

## Persona Strategy

- Both personas are treated as equally primary for the first delivery.
- Story emphasis should balance repository bootstrap and technical workflow needs with reading, answering, and review workflows.
