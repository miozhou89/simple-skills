---
name: image-to-code
description: Convert image designs to production-ready code. Use when user provides a image(a screenshot of the design draft) to build components/pages. Auto-detects framework, reuses existing components, applies accessibility and performance best practices.
tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# image to code

## Overview

This skill provides a structured workflow for translating image into production-ready code with pixel-perfect accuracy.
The image is a screenshot of the design draft.

## Capabilities

- Auto-detect framework (LVGL, Astro, Next.js, React/Vite, Remix, Nuxt, Angular)
- Scan codebases to find and reuse existing components
- Use existing animation libraries (never install new ones)
- Generate code from image recognition
- Apply accessibility and performance best practices

## Workflow

**Follow these steps in order. Do not skip steps.**

### STEP 1: ANALYZE CODEBASE to Detect Framework

| Config File | Framework | Component Ext | Page Location |
|-------------|-----------|---------------|---------------|
| `lv_conf.h` | LVGL | `.cpp` | `src/gui/` |
| `astro.config.*` | Astro | `.astro` / `.tsx` | `src/pages/` |
| `next.config.*` | Next.js | `.tsx` | `app/` or `pages/` |
| `vite.config.*` + react | React/Vite | `.tsx` | `src/` |
| `remix.config.*` | Remix | `.tsx` | `app/routes/` |
| `nuxt.config.*` | Nuxt | `.vue` | `pages/` |
| `angular.json` | Angular | `.component.ts` | `src/app/` |


### STEP 2: Full Source Scan
Scan ALL files in `src/`:
- Reusable components (Button, Card, Input, Badge, Modal)
- Layout components (Container, Grid, Section, Wrapper)
- Animation patterns
- Utility functions
- Theme tokens (colors, spacing, fonts)

### STEP 3: Catalog Assets

List existing assets in `public/` or `assets/` for naming conventions.

### STEP 4: Generate Code

Generate code based on the image in Detected Framework, use context7 mcp server.

Whole page → Create page file + all section components
Single component → Create just that component

Before marking complete, validate the final UI against the design draft screenshot.

**Validation checklist:**

- [ ] Layout matches (spacing, alignment, sizing)
- [ ] Typography matches (font, size, weight, line height, radius)
- [ ] Colors(including background colors) match exactly
- [ ] Interactive states work as designed (hover, active, disabled)
- [ ] Responsive behavior follows UI/UX design constraints
- [ ] Assets render correctly
- [ ] Accessibility standards met


### STEP 5: ITERATE

Ask: "Does this match your expectation?"
- Yes → Done
- No → Ask what to change (whole component, mobile styles, animations, specific element)

Support partial regeneration for tweaks.

## Best Practices

- Prioritize image fidelity to match designs exactly
- Avoid hardcoded values - extract to constants or use design tokens
- Follow WCAG requirements for accessibility
- Add component documentation as needed
- No barrel imports - import directly from source
- Tree-shake animations - import only needed functions
- Lazy load below-fold - `client:visible` or dynamic import
- Responsive - mobile-first with breakpoint overrides
- Reuse - Never duplicate existing components; When a matching component exists, extend it rather than creating a new one; When there are multiple similar UI elements on a page, extract them into a common component.
- Consistent - follow existing codebase patterns
- Document any new components added to the design system
- Keep components composable and reusable
- Never implement based on assumptions. Always refer to the detailed of provided image.

## Notes

- Always preserve existing code patterns
- Never install new dependencies
- All generated code should be production-ready

## Examples

### Implementing a UI page

User says: "Implement this page base on the image"

**Actions:**

1. Read and parse the provided image to understand the page structure or layouts.
2. Identify main sections(header, sidebar, content area, cards) and their child node.
3. Identify the typography or styles of the page(font, size, weight, line height, radius, colors, background colors)
4. Identify all assets (logos, icons, charts)
5. Build layout using project's layout primitives
6. Implement each section using existing components where possible.
7. assets matching:
    - Try to use existing or built-in assets in the framework, such as icon fonts(eg. LV_SYMBOL_* in LVGL).
    - If the required assets do not exist, use placeholders instead and add comments to explain.
8. Validate responsive behavior against image constraints

**Result:** Complete page matching provided image with responsive layout.

