# Core quality gates

The versioned `contracts/quality-gates.json` defines coverage and upper bounds. F0.5 operates on the shared workbench, sign-in and synthetic protected session; it does not certify the four consuming applications.

`npm run test:quality` runs all 37 families across four locale/layout/theme cases plus keyboard, semantic accessibility, reflow, localized session and per-route laboratory budgets. Existing `npm run test:e2e` includes these checks with the previous foundation/session regressions. `npm run test:visual` compares eight reviewed Linux Chromium references; normal runs use updateSnapshots=none so absent references fail too. The Ubuntu 24.04 runner and lockfile Chromium version define the reference environment. Windows visual comparisons are explicitly skipped, not reported as passed. Review changes to runner, fonts or browser versions alongside reference changes.

For intentional baseline creation, dispatch CI with visual_candidates=true on the reviewed branch. Download its visual-candidates artifact, inspect all eight images, then commit only approved exact reference paths. Candidate runs are not visual acceptance runs. Normal CI must subsequently pass on committed references. Never refresh references to hide missing content or loosen thresholds to conceal regressions.

Performance evidence records decoded JS/CSS/image bytes, TTFB, LCP, CLS, onMount hydration time, browser API/poll counts and click/keyboard-to-second-animation-frame latency. Required observations must exist; no zero interaction/LCP sample is accepted. The interaction measure is a repeatable laboratory responsiveness check, not field INP or p75 Core Web Vitals. Zero images are valid for routes containing no images. There is no direct browser access to backend /v1 endpoints. SSR initially supplies protected read data; hydration must not duplicate the read.

Axe and accessible-name/keyboard checks are automated evidence. Actual screen-reader and browser zoom acceptance is tracked separately in manual-accessibility.md. 320 CSS pixels and doubled root text exercise reflow/text expansion without claiming actual 400% browser zoom. Locale dictionaries must have complete English/Arabic/Thai keys; pseudo-locale expands presentation strings. Workbench component identifiers and server-returned data retain their source values.

Use only canonical synthetic fixtures in retained CI reports. Run real API checks separately with the owner profile and public-key configuration; traces, screenshots and video remain disabled for these journeys. Never commit environment files. The exact F0.2 canonical-example deferral still blocks strict final release; it does not relax quality gates.

Internal F0.4 integration callers migrate from the unpublished `uiCopy.session(locale)` expando to the explicit `sessionCopy(locale)` export. This permits the foundation to tree-shake session-only dictionaries and stay within its original JS budget.

CI also runs isolated negative probes against actual runners: remove a compiled Thai dictionary key, reduce the foundation JS allowance to one byte, and substitute the wrong-size committed screenshot. Each must reach a failing assertion; originals are restored in finally blocks before normal acceptance. Negative reports are retained separately. Candidate runs omit visual drift until references exist.
