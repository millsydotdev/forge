# Contributing to TennoDex

Thank you for your interest in contributing! This guide covers the development workflow, code standards, and how to submit changes.

## Development Setup

```bash
# Clone and install
git clone https://github.com/your-org/tennodex.git
cd tennodex
npm ci

# Update game data (requires internet)
npm run update-data

# Start dev (PowerShell script sets isolated runtime dirs)
npm run start
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Build all targets (preload → main → renderer) |
| `npm run lint` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript strict check |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E (requires `npm run build` first) |
| `npm run format` | Prettier write |
| `npm run ci` | Full CI pipeline (lint → typecheck → test → build) |

## Pull Request Workflow

1. **Branch from `main`** — `git checkout -b feature/your-feature`
2. **Make changes** — Follow code style (see below)
3. **Run checks locally** — `npm run ci` must pass
4. **Open PR** — Target `main`, include description + screenshots for UI changes
5. **CI runs automatically** — GitHub Actions: lint → typecheck → test → build (Ubuntu) + E2E (Windows)
6. **Review & merge** — Squash merge after approval

## Code Style

- **TypeScript** — `strict: true`, no `any`, explicit return types on exported functions
- **ESLint** — `npm run lint` (zero warnings required)
- **Prettier** — `npm run format` (single quotes, 120 width, trailing commas, no arrow parens)
- **React** — Functional components, hooks over classes, no default exports
- **State** — Zustand stores for global state, hooks for derived/computed logic
- **CSS** — Custom properties from `app.css` (`--wf-*` tokens), no inline styles unless dynamic

## Project Structure

```
src/
├── app/                    # Electron entry points
├── browser/                # Main process (IPC, services)
├── preload/                # Context bridge (renderer ↔ main)
├── features/build-planner/ # UI + build logic
│   ├── components/         # React components
│   ├── hooks/              # Zustand hooks
│   ├── model.ts            # Build state types
│   └── services/           # Codec, Riven, Overframe
├── stat-processor/         # Pure TS math engine
│   ├── index.ts            # calculateWarframe/Weapon/Companion
│   └── types.ts            # CalculatedStats, WeaponStats
├── data/                   # Game data access
├── build-core/             # Shared build types
├── polarity.ts             # Capacity/polarity math
├── store/                  # Zustand stores
└── styles/                 # Design tokens
```

## Testing

- **Unit** — Vitest + React Testing Library (jsdom)
- **E2E** — Playwright (Windows, requires built app)
- **Coverage** — 60% lines/functions/statements, 50% branches
- Run `npm run test:watch` for TDD

## Game Data Pipeline

`npm run update-data` fetches from `@wfcd/items` → `src/data/game-data.json`. Do not edit the JSON directly — regenerate instead.

## Build Codec

Builds share via `tndx1:` base64 JSON. See `docs/build-codec.md` for spec. Migration hook exists in `build-codec.ts:migrateBuild()`.

## Architecture Principles

- **Build-centric** — The build is always the hero; UI serves the build
- **Calculation engine is pure TS** — No React, no Electron, testable in isolation
- **Complex actions in hooks** — Not in stores (keeps stores simple)
- **Desktop-native** — Keyboard shortcuts, context menus, drag-drop, undo/redo

## Security

- No `eval`, no `innerHTML` with user input
- SSRF protection on Overframe import (host allowlist + private IP blocking)
- CSP enforced via Electron `webRequest.onHeadersReceived`
- Context isolation + `nodeIntegration: false` in renderer

## Questions?

Open an issue or ask in the PR. We're happy to help.