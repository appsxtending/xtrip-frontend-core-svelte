# XTrip core Svelte foundation

Use the xtrip-svelte requirements authority and its approved task context. SINGLE_AGENT. SvelteKit 3, Svelte 5 runes, Vite 8, TypeScript 6, Tailwind 4 and Open Props; Node 24 LTS. Exact reserved files are pinned in contracts. No cross-repository source imports or business API calls from the UI package. No secrets or business logic in SSR. Public exports are SSR-safe; server modules stay private. Run npm run verify. Do not publish packages or create remotes without owner authorization.

F0.2: generated artifacts are never edited directly. Run npm run generate:api after an approved contract repin. npm run check:api fails on malformed canonical examples; do not weaken this gate or repair examples locally. Run npm run test:api:real with the owner-provided ignored test environment. Keep UI exports independent of API and mock packages. Ignore nested .kilo worktrees in root tooling.
