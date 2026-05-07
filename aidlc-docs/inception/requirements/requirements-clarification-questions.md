# Requirements Clarification Questions

I detected a small number of unresolved decisions that would otherwise force risky architectural assumptions in the VS Code extension design.

Please answer each question by filling in the letter choice after the `[Answer]:` tag. If none of the options fit, choose `X` and describe your answer after the tag.

## Contradiction 1: Viewer shell vs editor tab behavior
You indicated in Question 1 that the navigation should stay in the webview, but the selected files should open in tabs in the editor area. This is different from the original options and can be implemented in more than one way.

### Clarification Question 1
How should the extension split responsibilities between the React webview and VS Code editor tabs?

A) Keep the full rendered document viewer in the webview, and opening a file in a tab should open the raw markdown editor beside it
B) Use the webview mainly as a navigation sidebar, and open the rendered document itself in custom editor tabs
C) Support both modes: raw markdown editor tabs and rendered preview tabs, with the webview acting as the navigator
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Ambiguity 1: CDN usage vs packaged extension delivery
You selected CDN usage as acceptable, but you also requested packaging readiness for `.vsix` delivery and broad compatibility expectations. For a production-style VS Code extension, CDN reliance can weaken offline reliability and complicate CSP and security constraints.

### Clarification Question 2
What should I assume about third-party frontend dependencies in the final extension?

A) Bundle all runtime dependencies locally inside the extension package, even if CDN use is acceptable during development
B) Allow CDN dependencies in the shipped extension if they simplify implementation
C) Bundle only security-sensitive or core rendering dependencies locally, and allow CDN for the rest
X) Other (please describe after [Answer]: tag below)

[Answer]: B
