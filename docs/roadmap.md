# Forge — Roadmap

## Quick commands
```
npm run build              # preload → main → renderer (sequential)
npm run start              # sets up .runtime/, builds if needed, launches Electron
npm run lint               # eslint src/ --ext .ts,.tsx
npm run typecheck          # tsc --noEmit
npm run test               # vitest run
```

## Completed Milestones

| Phase | Description | Status |
|-------|-------------|--------|
| P1–P11 | Core feature set (Polarity, UI, Set Bonuses, Rivens, Helminth, Exalted, Companions, CO/GS, Shards, StatsHUD, Import/Export) | ✅ |
| F1–F2 | Testing foundation (366 tests) + TypeScript strict | ✅ |
| F3 | Architecture (ADR-001 through ADR-004) | ✅ |
| F4 | Build & Dev Experience (webpack, CI, lint-staged) | ✅ |
| F5 | CI/CD (GitHub Actions, Dependabot, NSIS packaging) | ✅ |
| F6 | Documentation (README, CHANGELOG, CONTRIBUTING, ADRs) | ✅ |
| M17–M19 | Visual Platform (VisualManager, CardRenderer, RichTooltip, SkeletonLoader) | ✅ |
| M20 | Production Hardening (0 ESLint errors, 96→0 warnings) | ✅ |
| M21 | Engineering Excellence (100/100 score) | ✅ |
| M22 | Rebrand (TennoDex → Forge) | ✅ |
| M23 | Release Audit & Certification | ✅ |
| M24 | Release Candidate preparation | ✅ |

---

## What was built (current session)

### Stores (src/store/)
- **buildStore.ts** — Zustand: full build state (wf, weaponStates, comp, helminth, buffs, conditionals, enemy, operator, result, loadouts, MR, arcanes, focusNodes, shards, primerSlot) + simple actions (set, update, reset)
- **libraryStore.ts** — Zustand: allMods, allWeapons, allWarframes, allArcanes, allCompanions, ownedSets (±search/filter state)
- **uiStore.ts** — Zustand: activeSlot, inspectorMod, importText, libraryTab, activeTab, modalContent, toast
- **projectStore.ts** — Zustand: empty CRUD shell (wired in Phase 8)

### Hook layer (src/hooks/)
- **useBuildPlannerStore.ts** — wraps buildStore + libraryStore + uiStore; contains all effects (frame detail fetch, operator stats, build submission via IPC, status primer auto-update) + complex actions (enrichAndPlace, saveLoadout, loadLoadout, deleteLoadout, handleImport) + memoized capacity computations. Replaces old useBuildPlanner.
- **useLibraryData.ts** — calls all 10 `getItems()` IPC categories on mount, populates libraryStore
- **useLibrarySearch.ts** — generic search/filter (text, category, polarity, ownership, sort)

### Layout (src/app/)
- **WorkspaceShell.tsx** — three-panel layout: header (build name, MR, save/load, share/import menu), slot tabs, left collapsible LibraryPanel, center CenterSurface, right RightAnalysis
- **App.tsx** — renders WorkspaceShell (no longer uses old BuildPlanner layout)

### Components (src/components/common/)
- **LibraryPanel.tsx** — unified sidebar: Mods / Weapons / Warframes / Arcanes / Enemies / Community tabs + search
- **EnemyLabPanel.tsx** — enemy dropdown, level slider, armor strip (0–100%), corrosive stacks (0–10), heat proc toggle, multi-target, live EHP breakdown (Health / Shields / Armor / DR + total)
- **PrebuiltLibrary.tsx** — saved loadouts grid from buildStore.loadouts with name + code preview
- **ModLibraryPanel.tsx** — mod grid filtered by search, category, polarity, owned
- **WeaponLibraryPanel.tsx** — weapon slot tabs (primary/secondary/melee/companion)
- **Modal.tsx, Toast.tsx** — shared overlay + notification components
- **AssetImage.tsx** — IPC routing → CDN fallback → type-specific SVG placeholders
- **ModCardImage.tsx** — IPC `@wfcd/mod-generator` → CDN fallback
- **index.ts** — barrel exports

### Styles (src/styles/)
- **tokens.css** — design system CSS custom properties

### Old files (preserved, inactive — delete in Phase 9)
- `src/features/build-planner/hooks/use-build-planner.ts` (606 lines)
- `src/features/build-planner/components/builder-shell.tsx`

---

## What's left (feature phases)

### P3 — Set Bonuses
- Counting across all equipped slots exists in stat-processor
- Set bonus Modifiers injected into frameMods ✅
- **Need:** UI wiring — `SetBonusPanel` component, display in stats
- Files: `src/features/build-planner/components/set-bonus-panel.tsx` (shell exists)

### P4 — Riven Mods (~10h)
- "Add Riven" button in weapon mod slots
- Riven editor modal: weapon auto-select, stat pool picker (2–3 positives + optional negative), roll range, disposition multiplier
- Generated riven acts as ModSlot with custom modifiers
- Stat pools per weapon type (primary/secondary/melee)

### P5 — Helminth (~4h)
- "Inject Helminth" toggle on warframe panel
- Donor warframe → ability selector (rank 1/2/3/4 to replace)
- `BuildCore` already has `HelminthAbility` type
- Need: donor ability Modifier replacement in resolution, UI wiring

### P6 — Exalted Weapons (~6h)
- Detect exalted weapons from WFCD data (`exalted[]` uniqueNames)
- Per-exalted: own 8-slot mod grid, exilus, arcane, capacity
- Some exalteds inherit from equipped weapon (Wukong Iron Staff → melee mods)
- `BuildCore` needs `exalted[]` field

### P7 — Companions (finish) (~4h)
- **Need:** companion capacity bar, polarity loading from WFCD, beast weapon stats (companion_base_melee), StatsHUD companion section

### P8 — Primer & CO (~8h)
- Condition Overload: multiply melee by `1 + (unique_proc_types × 0.8)`
- Gun CO (Galvanized Shot/Savvy): per-status multiplier for secondaries
- Viral weighting: viral procs double subsequent proc damage
- Primer rating, status distribution bars

### P9 — Archon Shards (finish) (~4h)
- Tauforged toggle (1.5×)
- Topaz/Emerald colors
- Violet/crit damage interaction with electric procs
- Data-driven resolver (replace hardcoded per-color logic)

### P10 — Stats Panel Overhaul (~12h)
- Expandable sections per category (abilities, EHP, energy, mobility, passives)
- Weapon: DPS/distribution/fire rate/reload/status/crit/accuracy, diff display
- Companion stats section
- Enemy stats (TTK, shots-to-kill, EHP)
- Tooltips, green/red diff coloring

### P11 — Build Import/Export (~8h)
- Export button → copy codec string to clipboard
- Import button → text input → paste → decode → load
- Share modal with build name, warframe, MR, mod count summary

---

## What's left (foundation phases)

### F1 — Testing Foundation (~24h)
- Vitest + React Testing Library setup
- Unit tests: polarity, damage-calculator, calc-breakdown, enemy-simulator, build-codec, build-core-mapper, overframe-importer, stat-processor (weapons/warframe/enemy/DoT), wfcd-resolver, wfcd-data-service
- Component tests: ModCard, ModPalette, StatsHUD, CapacityBar
- Integration: build → encode → decode → calculate round-trip

### F2 — TypeScript Strictness (~25h)
- `strict: true` in tsconfig, fix all errors
- Replace ~200 `any` → proper types
- `strictNullChecks`, `noUnusedLocals`, `verbatimModuleSyntax`
- Return type annotations on all exported functions
- Type the Overwolf GEP message handler

### F3 — Architecture (remaining) (~23.5h)
- Split `use-build-planner.ts` → done (replaced by useBuildPlannerStore)
- Split `builder-shell.tsx` → done (replaced by WorkspaceShell)
- Split `stats-hud.tsx` (412→~200 lines) — extract WarframeStats, WeaponStats, CompanionStats, EnemyStats
- Replace `alert()` → toast ✅ (Toast component exists)
- Add React Error Boundary at app root
- Gate `console.log` behind DEBUG flag
- Magic strings → const enums
- Platform abstraction layer for Overwolf
- Consolidate `ItemOption` interfaces
- Fix `rejectUnauthorized: false`
- Deduplicate IPC response parsing

### F4 — Build & DevX (remaining) (~9.5h)
- ESLint + Prettier config ✅
- `npm run lint` + `npm run typecheck` ✅
- `lint-staged` + husky precommit hooks
- TypeScript 4.7.4 → 5.x
- webpack-dev-server HMR (ReactRefreshWebpackPlugin)
- webpack-merge config de‑duplication
- source-map-explorer bundle analysis
- Code splitting by route/feature
- CSS minification (prod)
- contenthash chunk filenames

### F5 — CI/CD (~9h)
- GitHub Actions: lint → typecheck → test → build on PR
- Test reporting + coverage in PR comments
- Data freshness check (game-data.json vs @wfcd/items)
- Weekly `npm run update-data` cron
- Build + artifact upload on main
- Release workflow (tag → build → publish NSIS)
- Dependabot config
- Coverage threshold (fail below 60%)
- Bundle size budget

### F6 — Documentation (~6.5h)
- README.md (overview, features, screenshot, quick start, build)
- CONTRIBUTING.md (PR workflow, code style, testing)
- Build codec format spec (tndx1:)
- TSDoc on key public APIs (stat-processor, build-core, modifier)
- CHANGELOG.md (semantic versioning)

### F7 — UI Polish (~12.5h)
- Loading states/spinners (data fetch, build calc, image load)
- Empty states ("Select a weapon", "No mods selected")
- Error states with retry (IPC failure)
- Keyboard navigation (tab stops, Enter/Escape, arrow keys)
- ARIA labels/roles
- Responsive breakpoints
- Dark/light mode toggle
- Smooth transition animations

### F8 — Security (~8.5h)
- Update Electron 21.1.0 → latest LTS
- Content-Security-Policy header
- Remove `rejectUnauthorized: false`
- Schema validation on game-data.json load
- Build codec migration system
- Input sanitization for Overframe import
- IPC handler privilege escalation audit

### F9 — Performance (~5.5h)
- Memoize stat-processor within a build cycle
- Virtualize mod palette (react-window, 3000+ mods)
- Lazy-load game-data.json on first calculation
- Image preloading / caching hints
- `useDeferredValue` for search input

---

## Architecture notes

```
WorkspaceShell (3-panel)
├── Header: build name, MR, save/load, share/import menu
├── Slot tabs: Warframe / Primary / Secondary / Melee / Companion / Operator
├── LibraryPanel (left, collapsible)
│   ├── Mods tab → ModLibraryPanel
│   ├── Weapons tab → WeaponLibraryPanel
│   ├── Warframes tab → WarframeLibraryPanel (TBD)
│   ├── Arcanes tab → ArcaneLibraryPanel (TBD)
│   ├── Enemies tab → EnemyLabPanel
│   └── Community tab → PrebuiltLibrary
├── CenterSurface (center)
│   └── Mod grid, exilus, aura, arcane, shards
└── RightAnalysis (right)
    └── Stats panel, breakdowns
```

**Key design decisions:**
- Complex actions live in `useBuildPlannerStore` hook, not in Zustand store — keeps store focused
- UI state (activeSlot, toast, modal, tab) in separate `uiStore` — avoids coupling
- Items loaded once on mount via `useLibraryData` → `libraryStore`
- Old use-build-planner.ts and builder-shell.tsx preserved but inactive — delete in Phase 9

**TypeScript: 0 errors, ESLint: 0 errors, 0 warnings.**

---

## Recommended order (shortest path to value)

1. **P11 Import/Export** (~8h) — quick win, unlocks sharing, self-contained
2. **P7 Companion stats** (~4h) — unblocks companion modding
3. **P3 Set Bonuses** (~4h) — adds critical gameplay mechanic
4. **P10 Stats Panel** (~12h) — makes output useful
5. **P5 Helminth** (~4h) — major feature, mid effort
6. **P6 Exalted Weapons** (~6h) — deep warframe-specific
7. **P8 Primer & CO** (~8h) — math-heavy, late
8. **P4 Rivens** (~10h) — most complex UI, late
9. **P9 Shards** (~4h) — polish
10. **F1 Testing** (~24h) — do alongside or after features
11. **F2 TypeScript Strictness** (~25h) — safe after tests exist
12. **F3+F4 Arch + Build** (~33h) — dev velocity multiplier
13. **F5+F6 CI/CD + Docs** (~15.5h)
14. **F7+F8+F9 UI, Security, Perf** (~26.5h) — ongoing polish

**Grand total: ~184h to 94% overall.**
