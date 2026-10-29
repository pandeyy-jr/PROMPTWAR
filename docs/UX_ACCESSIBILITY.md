# UX and Accessibility Standards

Status: target standard. Phase 1 improves the public shell (skip link, correct landmarks, visible focus, larger supporting type, stronger contrast, a named hero illustration, and hidden decorative drawing details), but no formal browser keyboard, screen-reader, zoom/reflow, or automated accessibility audit has been performed.

## Interaction principles

- Design mobile-first for basic smartphones, constrained bandwidth, and limited technical literacy. Keep the primary worker actions visible and use short, familiar language.
- Separate worker and employer/admin navigation and label the current role/context. Do not expose a management action to a worker as a decorative affordance.
- Every control that appears interactive must work. Use links for navigation and buttons for actions; show disabled state and reason when an action is unavailable.
- Prefer short forms, sensible defaults, clear time/date/currency formatting, and a confirmation step for consequential changes.
- Explain before submission who can see a safety report. Do not imply anonymity unless the system actually guarantees it.

## Accessibility requirements

- Use semantic landmarks/headings, logical reading order, descriptive page titles, and meaningful link/button names.
- All functions must work with keyboard alone. Provide a clearly visible focus indicator and no keyboard traps.
- Associate persistent labels and instructions with form controls; identify required fields; summarize validation errors and associate field errors programmatically.
- Announce loading, success, and error feedback with appropriate status/live-region semantics. Move focus when a form submission creates a meaningful context change.
- Maintain readable contrast for text, controls, focus, and status indicators. Never communicate severity/status by color alone.
- Use practical touch target spacing and responsive layouts. Tables must remain usable on narrow screens through responsive columns, cards, or an accessible horizontal-scroll pattern with context.
- Respect reduced-motion preferences. Avoid unnecessary animation and auto-updating content that disrupts assistive technology.

## Required states

Every data workflow needs designed loading, empty, success, validation-error, permission-denied, and recoverable server-error states. Do not show fabricated sample records as live user data. Use plain explanations and a clear recovery action where possible.

## Regional-language strategy

Keep UI copy ready for localization: avoid embedding copy in complex markup, format dates/times/currency with locale-aware APIs, and keep labels concise. English is the initial implementation language unless the user chooses additional languages; do not claim localization before translated content and usability review exist.

## Verification

Test keyboard traversal and activation, visible focus, zoom/reflow on narrow screens, contrast of actual rendered states, form labels/errors, screen-reader status messages where feasible, and responsive tables. Record known limitations in [TESTING_QA.md](TESTING_QA.md).
