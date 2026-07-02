# TennoDex — Warframe Build Planner

**Quick commands**
```
npm run build              # preload → main → renderer (sequential)
npm run start              # sets up .runtime/, auto‑builds if needed, launches Electron (GPU disabled)
npm run build:ow-electron  # package Windows NSIS installer via ow‑electron‑builder
npm run update-data        # generate src/data/game-data.json from @wfcd/items
npm run lint               # eslint src/ --ext .ts,.tsx
npm run typecheck          # tsc --noEmit
npm run test               # vitest run (all unit tests)
npm run test:e2e           # vitest run with E2E config (requires `npm run build` first)
npm run test:watch         # vitest watch mode
npm run test:ui            # vitest UI mode
npm run format             # prettier --write src/
```

**Development workflow**
- Run `npm run start` for normal development. The PowerShell script sets temporary `APPDATA`, `LOCALAPPDATA`, `TEMP`, and disables Electron GPU.
- To rebuild manually use `npm run build` or the three granular targets (`npm run build:preload`, `npm run build:main`, `npm run build:renderer`).
- CI enforces the order `lint → typecheck → test`; keep this order locally when verifying changes.

**Testing**
- Unit tests: `npm run test` (Vitest, jsdom environment).
- Single test file: `vitest run path/to/file.test.ts` or `npm run test -- path/to/file.test.ts`.
- Watch mode: `npm run test:watch`.
- UI mode: `npm run test:ui`.
- E2E tests (node environment): `npm run test:e2e` (must run after a successful `npm run build`).
- Run a specific E2E test: `vitest run --config vitest.e2e.config.ts path/to/file.e2e.test.ts`.

**Data generation**
- `npm run update-data` pulls the official Warframe item list (`@wfcd/items`) and writes `src/data/game-data.json`. Requires internet access.

**Build quirks**
- Three separate webpack configs (main, preload, renderer). When adding native dependencies, list them under `externals` in `webpack.main.config.js` (e.g., `@wfcd/items`, `@napi-rs/canvas`).
- TypeScript path alias `electron` resolves to the Overwolf Electron package (`node_modules/@overwolf/ow-electron/electron`).

**Environment notes**
- `scripts/start-dev.ps1` creates `.runtime/` subfolders (`appdata`, `localappdata`, `temp`) and sets:
  - `ELECTRON_DISABLE_GPU=1`
  - `ELECTRON_ENABLE_LOGGING=1`
  - `ELECTRON_NO_ATTACH_CONSOLE=1`
  - `FORGE_RUNTIME_DIR` (or legacy `TENNODEX_RUNTIME_DIR`) pointing to the `.runtime` root.
- `.runtime/` is ignored via `.gitignore`.

**Continuous Integration**
- GitHub Actions runs on Node 20.
- Lint, typecheck, unit tests, and dev builds run on Ubuntu.
- E2E tests run on Windows (needs the dev build artifacts).
- Production build uses `npx webpack --config webpack.prod.config.js` and then packages with `npm run build:ow-electron`.
- All CI steps use `npm ci` for deterministic installs.

**Style & linting**
- Prettier: `singleQuote`, `printWidth: 120`, `trailingComma: all`, `arrowParens: avoid`.
- ESLint: recommended + React + React‑Hooks; warnings for `no-console`, `@typescript-eslint/no-explicit-any`, and unused vars prefixed with `_`.

<!-- ssg:governance -->
# SSG Governance (managed by ssg — do not edit between these markers)

This project uses [SigmaShake SSG](https://sigmashake.com) to govern every AI agent
tool call before it executes.

**MCP server:** The `ssg-governance` MCP server (registered in `opencode.json`) routes
every tool call through `ssg_evaluate` so SSG can ALLOW, ASK, DENY, or FORCE a
substitute command.

**Plugin hook:** `~/.config/opencode/plugin/ssg-governance.js` intercepts every
`tool.execute.before` and `tool.execute.after` event, calling `ssg hook opencode`
and throwing an Error on a DENY/FORCE decision to abort the tool call.
Note: the plugin gate does NOT fire inside `task`-spawned subagents (opencode#5894).

**Permission block:** `opencode.jsonc` carries a `permission` block compiled from your
`.rules` files. Opencode's own in-terminal ask/allow/reject prompt surfaces for ASK decisions.

Run `ssg status` to verify governance is active.

<!-- /ssg:governance -->
