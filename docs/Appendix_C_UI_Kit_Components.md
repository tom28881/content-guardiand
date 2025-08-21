# Appendix C — UI Kit Components

## Overview
Forge UI Kit provides a curated set of UI components for building lightweight UIs that run inside Atlassian products. UI Kit 2 offers a more flexible, React-based experience with an expanded component set and improved styling and layout primitives.

When in doubt, consult the official component catalog for capabilities, props, and examples.

## Component categories (examples)
- Actions: Button
- Inputs and forms: Form, Textfield, TextArea, Select, Checkbox, RadioGroup
- Feedback: Spinner, SectionMessage
- Overlays: Modal, InlineDialog, Tooltip
- Layout: Inline, Stack (layout primitives vary by UI Kit version)
- Typography and content: Text, Heading, Code, Link
- Data display: Lozenge/Badge, Avatar (availability varies by UI Kit version)

Note: Exact component names and availability differ between UI Kit and UI Kit 2. Always verify the versioned docs you target.

## Implementation notes and best practices
- Prefer UI Kit 2 where possible for richer layouts and improved developer ergonomics.
- Keep UIs small and fast—UI Kit surfaces run within Atlassian products with constrained resource budgets.
- Use built-in components for accessibility defaults (labels, focus states, color contrast) instead of custom widgets.
- Avoid long-running computation in UI handlers; offload to backend functions and return results asynchronously if needed.
- Follow design tokens and spacing rules from the docs for consistent look-and-feel.

## References (official)
- UI Kit components (catalog): https://developer.atlassian.com/platform/forge/ui-kit-components/
- UI Kit 2 overview: https://developer.atlassian.com/platform/forge/ui-kit/
- Building UIs with Forge (overview): https://developer.atlassian.com/platform/forge/build-a-ui-with-forge/

Last verified: 2025-08-07
