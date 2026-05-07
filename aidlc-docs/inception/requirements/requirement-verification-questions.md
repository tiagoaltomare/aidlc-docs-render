# Requirement Verification Questions

Use this document to validate the requirements for converting the current AIDLC docs renderer into a full VS Code extension for `1.117+`.

Please answer each question by filling in the letter choice after the `[Answer]: tag. If none of the listed options fit, choose X and describe your answer after the tag.

## Question 1
What should be the primary way users open the AIDLC viewer inside VS Code?

A) Command Palette command that opens the viewer in a webview panel
B) Custom Activity Bar view with the document viewer embedded there
C) Both a webview panel and an Activity Bar view
X) Other (please describe after [Answer]: tag below)

[Answer]: X - The navbar may be rendered in the webview and files selected must be open in tabs on editor area

## Question 2
How should the extension locate the AIDLC documents it renders?

A) Always use the current workspace folder's `aidlc-docs/` directory
B) Let the user choose any folder or file tree through extension settings/commands
C) Support both workspace `aidlc-docs/` auto-detection and manual folder selection
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 3
Which save/editing behavior is required in the final extension?

A) Users can edit only `[Answer]: A
B) Users can edit full markdown documents inside the viewer and save back to files
C) Keep answer editing in the viewer, but open full files in the editor for broader edits
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
What should replace the current live reload behavior?

A) Automatically refresh when markdown files change in the workspace
B) Manual refresh command/button is enough
C) Both auto-refresh and manual refresh controls
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5
How strict is the requirement to preserve the current UI and behavior?

A) Preserve all major functions, but redesign the UI freely for VS Code
B) Preserve functions and keep the current navigation/interaction model very close
C) Reproduce the current UI and behavior as closely as possible before later enhancements
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
How should the manifest generation work in the extension architecture?

A) Remove the generated `manifest.js` file and build the data in extension/runtime memory
B) Keep a generated manifest artifact, but make it an internal build/runtime detail
C) Support both generated manifest mode and direct workspace scan mode
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What level of offline/self-contained behavior is required for the extension webview?

A) Fully self-contained with bundled dependencies and no CDN reliance
B) Prefer bundled dependencies, but internet access is acceptable in development only
C) CDN usage is acceptable if it simplifies delivery
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
What compatibility target should I assume for the extension packaging and APIs?

A) Support only VS Code `1.117+` desktop
B) Support VS Code `1.117+` desktop and remote workspaces if feasible
C) Support VS Code `1.117+` desktop, remote workspaces, and web extension compatibility where feasible
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 9
What testing and delivery expectation should define "full functional extension" for this cycle?

A) Buildable extension with core manual verification of all current features
B) Buildable extension plus automated tests for core logic and extension activation
C) Buildable extension, automated tests, and packaging readiness for `.vsix` delivery
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 10
Should the extension include support for creating or updating AIDLC answers in-place without leaving VS Code?

A) Yes, this is mandatory
B) Nice to have, but not required for the first delivery
C) No, read-only rendering is enough for now
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 11
Should security extension rules be enforced for this project?

A) Yes - enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No - skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 12
Should property-based testing (PBT) rules be enforced for this project?

A) Yes - enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial - enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No - skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
X) Other (please describe after [Answer]: tag below)

[Answer]: B
