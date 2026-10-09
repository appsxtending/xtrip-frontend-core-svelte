# Manual assistive-technology acceptance

Status: NOT PERFORMED. Automated axe/keyboard checks are not a replacement for screen-reader testing. This checklist is a consuming-release gate; F0.5 establishes its process and does not claim full WCAG certification.

Record tester, date, commit, OS, browser/version, assistive technology/version, locale, route, observations and any linked defects. Use synthetic profiles only; retain no credentials or private data.

- NVDA with Chromium: navigate workbench landmarks/headings, skip link and component selector. Confirm meaningful names, reading order, focus visibility, dialog announcement/trap/return, tabs and form labels/errors.
- Arabic RTL: verify spoken names and logical reading order, keyboard arrow behavior and values with mixed-direction content. Repeat core login/read/refresh/logout and status announcements.
- Thai: verify pronunciation/language metadata, labels and localized timestamps. Verify English and pseudo-expanded layouts visually without clipping.
- At actual 400% browser zoom on a desktop viewport, verify one-dimensional reflow, operability, no obscured focus and no loss of content. At 200% text-only zoom, verify labels/errors and buttons remain usable.
- High contrast/forced colors and reduced motion: inspect focus outlines and state distinctions; verify content does not depend on animation or color alone.
- Record failure severity and remediation/retest evidence before any consuming application release that depends on these paths.
