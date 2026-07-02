# Forge — Build Plan → 100%

## Legend
- ✅ Done
- 🔶 Partially done
- ❌ Not started
- 🚧 In progress

---

## Quality Scorecard

| Category | Current | Target | Δ |
|----------|---------|--------|---|
| Architecture | 85% | 95% | +10 |
| Build System | 80% | 96% | +16 |
| Type Safety | 70% | 100% | +30 |
| **Testing** | **5%** | **95%** | **+90** |
| Code Quality | 65% | 92% | +27 |
| Documentation | 70% | 95% | +25 |
| Dev Experience | 75% | 95% | +20 |
| Packaging | 80% | 90% | +10 |
| Project Health | 50% | 90% | +40 |
| **Overall** | **66%** | **94%** | **+28** |

---

## Foundational Quality Work

### Phase F1 — Testing Foundation 🔥

| # | Todo | Est. | Status |
|---|------|------|--------|
| F1.1 | Set up Vitest + React Testing Library | 0.5h | ❌ |
| F1.2 | Unit test `polarity.ts` (modDrainAtRank, effectiveCost, capacity, polarityMatches) | 0.5h | ❌ |
| F1.3 | Unit test `damage-calculator.ts` (status probabilities edge cases) | 0.5h | ❌ |
| F1.4 | Unit test `calc-breakdown.ts` (buildBreakdown, groupModifiersByKey) | 0.5h | ❌ |
| F1.5 | Unit test `enemy-simulator.ts` (scaleStats, calcEffectiveArmor, calcEhp) | 0.5h | ❌ |
| F1.6 | Unit test `build-codec.ts` (round-trip encode/decode, invalid formats) | 1h | ❌ |
| F1.7 | Unit test `build-core-mapper.ts` (toBuildCore mapping) | 0.5h | ❌ |
| F1.8 | Unit test `overframe-importer.ts` (parseOverframeJson variants) | 1h | ❌ |
| F1.9 | Unit test `stat-processor.ts` weapons (calculateSingleWeapon with known mods) | 3h | ❌ |
| F1.10 | Unit test `stat-processor.ts` warframe (ability stats, health, armor, shields) | 2h | ❌ |
| F1.11 | Unit test `stat-processor.ts` enemy damage (armor DR, faction mult, TTK) | 2h | ❌ |
| F1.12 | Unit test `stat-processor.ts` DoT (slash, heat, toxin, gas, electric, viral) | 1.5h | ❌ |
| F1.13 | Unit test `wfcd-resolver.ts` (stat line parsing, element combo, conditionals) | 3h | ❌ |
| F1.14 | Unit test `wfcd-data-service.ts` (load, filters, categories) | 1h | ❌ |
| F1.15 | Component test `ModCard` (render, rank click, polarity cycle, remove) | 1h | ❌ |
| F1.16 | Component test `ModPalette` (search, polar/category/owned filters) | 1h | ❌ |
| F1.17 | Component test `StatsHUD` (stat display, breakdown tooltips) | 1h | ❌ |
| F1.18 | Component test `CapacityBar` (used/total/remaining/overcap states) | 0.5h | ❌ |
| F1.19 | Integration: build → encode → decode → calculate round-trip | 2h | ❌ |
| F1.20 | Integration: Overframe import → full build state reconstruction | 1.5h | ❌ |

**Subtotal: ~24h**

---

### Phase F2 — TypeScript Strictness

| # | Todo | Est. | Status |
|---|------|------|--------|
| F2.1 | Enable `strict: true` in tsconfig.json, fix all resulting errors | 4h | ❌ |
| F2.2 | Replace ~200+ `any` usages with proper types across codebase | 6h | ❌ |
| F2.3 | Fix all `strictNullChecks` violations (handle null/undefined branches) | 4h | ❌ |
| F2.4 | Enable `noUnusedLocals` / `noUnusedParameters`, clean up dead code | 1h | ❌ |
| F2.5 | Create proper `DamageType` union type, replace string keys in damage maps | 1.5h | ❌ |
| F2.6 | Replace all `(x as any)` in `use-build-planner.ts` — type IPC responses properly | 3h | ❌ |
| F2.7 | Type the Overwolf GEP message handler — proper message union types | 2h | ❌ |
| F2.8 | Add explicit return type annotations to ALL exported functions | 2h | ❌ |
| F2.9 | Replace `declare const overwolf: any` with proper ambient types | 1h | ❌ |
| F2.10 | Enable `verbatimModuleSyntax` for cleaner imports | 0.5h | ❌ |

**Subtotal: ~25h**

---

### Phase F3 — Architecture & Code Quality

| # | Todo | Est. | Status |
|---|------|------|--------|
| F3.1 | Split `use-build-planner.ts` (846→~200 lines): extract useWeaponState, useWarframeState, useLoadouts, useOverwolfHandler, useBuildCalculation | 4h | ❌ |
| F3.2 | Split `builder-shell.tsx` (351→~150 lines): extract header, nav, panel sub-components | 2h | ❌ |
| F3.3 | Split `stats-hud.tsx` (412→~200 lines): extract WarframeStats, WeaponStats, CompanionStats, EnemyStats | 2h | ❌ |
| F3.4 | Replace `alert()` with proper toast notification system (useToast hook + ToastContainer) | 2h | ❌ |
| F3.5 | Add React Error Boundary at app root + per-feature boundaries | 1.5h | ❌ |
| F3.6 | Remove all `console.log` from production code → use toggleable logger | 1h | ❌ |
| F3.7 | Replace all magic strings with const enums (STAT_KEYS, STACKING_GROUPS, ELEMENT_TYPES, CONDITION_TYPES) | 3h | ❌ |
| F3.8 | Decouple Overwolf-specific code → platform abstraction layer so calculator works standalone | 4h | ❌ |
| F3.9 | Consolidate duplicated `ItemOption` interfaces (types.d.ts vs shared/item-info.ts) | 0.5h | ❌ |
| F3.10 | Audit + remove dead code (ability-stats.ts if superseded by stat-processor) | 0.5h | ❌ |
| F3.11 | Fix `rejectUnauthorized: false` in WfcdAssetService → proper CA handling | 1h | ❌ |
| F3.12 | Deduplicate IPC response parsing logic (loadLoadout + handleImport share identical loops) | 2h | ❌ |

**Subtotal: ~23.5h**

---

### Phase F4 — Build & Dev Experience

| # | Todo | Est. | Status |
|---|------|------|--------|
| F4.1 | Add ESLint + Prettier config | 1h | ❌ |
| F4.2 | Add lint-staged + husky precommit hooks | 0.5h | ❌ |
| F4.3 | Update TypeScript 4.7.4 → 5.x | 1h | ❌ |
| F4.4 | Add webpack-dev-server HMR for renderer dev mode (ReactRefreshWebpackPlugin) | 2h | ❌ |
| F4.5 | Clean up webpack config duplication with webpack-merge | 1h | ❌ |
| F4.6 | Add source-map-explorer bundle analysis script | 0.5h | ❌ |
| F4.7 | Add webpack code splitting by route/feature | 1.5h | ❌ |
| F4.8 | Add filesystem build caching | 0.5h | ❌ |
| F4.9 | Create `npm run lint` + `npm run typecheck` scripts, wire into AGENTS.md | 0.5h | ❌ |
| F4.10 | Add CSS minification (css-minimizer-webpack-plugin) for prod builds | 0.5h | ❌ |
| F4.11 | Add contenthash to chunk filenames for cache busting | 0.5h | ❌ |

**Subtotal: ~9.5h**

---

### Phase F5 — CI/CD & DevOps

| # | Todo | Est. | Status |
|---|------|------|--------|
| F5.1 | Create GitHub Actions CI workflow (lint → typecheck → test → build on PR) | 2h | ❌ |
| F5.2 | Add automated test reporting + coverage to PR comments | 1h | ❌ |
| F5.3 | Add data freshness CI check (compare game-data.json generatedAt vs @wfcd/items) | 1h | ❌ |
| F5.4 | Schedule weekly `npm run update-data` via CI cron | 0.5h | ❌ |
| F5.5 | Add automated build + artifact upload on every main commit | 1h | ❌ |
| F5.6 | Add release workflow (tag → build → publish NSIS) | 2h | ❌ |
| F5.7 | Add Dependabot config for auto dependency PRs | 0.5h | ❌ |
| F5.8 | Add code coverage threshold enforcement (fail CI below 60%) | 0.5h | ❌ |
| F5.9 | Add bundle size budget check to CI | 0.5h | ❌ |

**Subtotal: ~9h**

---

### Phase F6 — Documentation

| # | Todo | Est. | Status |
|---|------|------|--------|
| F6.1 | Create README.md (overview, features, screenshot, quick start, build instructions) | 2h | ❌ |
| F6.2 | Create CONTRIBUTING.md (PR workflow, code style, testing expectations) | 1h | ❌ |
| F6.3 | Document build codec format (tndx1: spec) | 1h | ❌ |
| F6.4 | Add TSDoc to key public APIs (stat-processor.ts, build-core.ts, modifier.ts) | 2h | ❌ |
| F6.5 | Create CHANGELOG.md (semantic versioning, link to releases) | 0.5h | ❌ |

**Subtotal: ~6.5h**

---

### Phase F7 — UI/UX Polish

| # | Todo | Est. | Status |
|---|------|------|--------|
| F7.1 | Add loading states/spinners (data fetch, build calc, image loading) | 2h | ❌ |
| F7.2 | Add empty states ("Select a weapon", "No mods selected") | 1h | ❌ |
| F7.3 | Add error states with retry (IPC failure, graceful degradation) | 1.5h | ❌ |
| F7.4 | Add keyboard navigation (tab stops, Enter/Escape, arrow keys in mod grid) | 2h | ❌ |
| F7.5 | Add ARIA labels/roles (icon buttons, tablist, mod grid) | 1.5h | ❌ |
| F7.6 | Add responsive breakpoints for window resize | 2h | ❌ |
| F7.7 | Add dark/light mode toggle (CSS vars already support it) | 1h | ❌ |
| F7.8 | Add smooth transition animations (panel transitions, mod drag feedback) | 1.5h | ❌ |

**Subtotal: ~12.5h**

---

### Phase F8 — Maintenance & Security

| # | Todo | Est. | Status |
|---|------|------|--------|
| F8.1 | Update Electron 21.1.0 → latest LTS | 2h | ❌ |
| F8.2 | Add Content-Security-Policy header to BrowserWindow | 1h | ❌ |
| F8.3 | Remove `rejectUnauthorized: false` with proper CA cert handling | 1h | ❌ |
| F8.4 | Add schema validation on game-data.json load (version check) | 1h | ❌ |
| F8.5 | Add build codec migration system for future format changes | 1.5h | ❌ |
| F8.6 | Add input sanitization for Overframe import (guard malicious payloads) | 1h | ❌ |
| F8.7 | Audit IPC handlers for privilege escalation (renderer → main) | 1h | ❌ |

**Subtotal: ~8.5h**

---

### Phase F9 — Performance (Bonus)

| # | Todo | Est. | Status |
|---|------|------|--------|
| F9.1 | Memoize expensive stat-processor calculations within a build cycle | 1h | ❌ |
| F9.2 | Virtualize mod palette list with react-window (3000+ mods) | 2h | ❌ |
| F9.3 | Lazy-load game-data.json on first calculation, not startup | 1h | ❌ |
| F9.4 | Add image preloading / caching hints for asset CDN | 1h | ❌ |
| F9.5 | Use `useDeferredValue` for search input responsiveness | 0.5h | ❌ |

**Subtotal: ~5.5h**

---

## Feature Implementation (Existing Roadmap)

### Phase 1 — Polarity & Capacity ✅

#### Polarity System ✅
- Polarity enum (MADURAI, VAZARIN, NAIRU, UMBRA, PENJAGA, UNIVERSAL)
- WFCD string → enum mapping via `parsePolarity()`
- Slot polarity matching (`polarityMatches()`) — V/—/D match themselves, ◆ matches V, ★ matches everything
- Drain formula: `effectiveCost(drain, matched)` → ceil(drain/2) if matched, drain if not
- Forma editing: click any slot polarity badge → popup picker → live recalculation

#### Capacity ✅
- Warframe: `min(30, level) + auraDrain + MR` with aura polarity bonus/penalty
- Weapon: `min(30, level) + stanceDrain + MR` (stances deferred)
- Capacity bar component with color thresholds (green → yellow → red)
- Overcap detection and visual warning

#### Polarity Icons ✅
Symbols: V (Madurai), — (Vazarin), D (Nairu), ◆ (Umbra), □ (Penjaga), ★ (Universal)

---

### Phase 2 — UI Overhaul ✅

- Dark navy/gold Warframe theme (`#0d0e15`, `#13141f`, `#d6a43e`)
- 3-column layout (warframe | weapon | stats)
- 2×4 mod grid with polarity icons, rank dots, drain numbers
- ModCard component with polarity badge, name, rank dots, cost, remove button
- ModSearch dropdown with live text filtering
- Polarity picker popup for forma editing
- Weapon tabs: Primary / Secondary / Melee / Companion
- Archon shard selectors (5 slots, color picker)

---

### Phase 3 — Set Bonuses ❌

#### What needs to happen
- WFCD mod data has `modSetId` (e.g. `"Augur"`, `"Gladiator"`, `"Vigilante"`, `"Saxum"`, etc.)
- Count equipped mods per set across warframe + all weapons + companion
- At threshold breakpoints (2/4/6), inject set bonus Modifier[] into the resolution pipeline
- Display set counters in UI

#### Known sets
| Set | 2pc | 4pc | 6pc |
|-----|-----|-----|-----|
| Augur | +20% shields on cast | +40% shields on cast | — |
| Gladiator | +10% crit chance (combo) | +20% crit chance | +30% crit chance |
| Vigilante | +5% enhanced crit tier | +10% enhanced crit tier | +15% enhanced crit tier |
| Saxum | +50% damage (impact) | +100% damage | — |
| Mecha | +25% status to marked | +50% status | — |

#### Files
- `src/data/wfcd-resolver.ts` — add post-resolution set bonus pass
- `src/components/build-planner.tsx` — set counter badges on mod grid header

---

### Phase 4 — Riven Mods ❌

#### Data
- Rivens are procedurally generated → not in @wfcd/items static data
- Weapon disposition is in WFCD weapon data: `disposition` field (0.5–1.5, mapped to 0.5×–1.5× multiplier)
- Riven stat pool per weapon type (primary/secondary/melee/archwing)

#### UI
- "Add Riven" button in weapon mod slots
- Editor modal:
  1. Weapon auto-selected (or manual)
  2. Stats: pick N positives (2 or 3) + optional negative from pool
  3. Each stat has a roll range: `baseValue × disposition × (0.9–1.1)`
  4. MR rank, polarity, drain (riven drain formula: `MR + 2` typically)
  5. Disposition multiplier applied live
  6. Generated riven acts as a ModSlot with custom modifiers

#### Stat pools
- Primary: damage, multishot, crit chance, crit damage, status chance, recoil, zoom, faction damage, elemental
- Secondary: same + fire rate, magazine capacity, reload speed, punch through
- Melee: damage, attack speed, range, crit chance, crit damage, status chance, elemental, combo duration

#### Files
- New: `src/components/riven-editor.tsx`
- `src/components/build-planner.tsx` — riven add button
- `src/data/wfcd-resolver.ts` — riven Modifier generation

---

### Phase 5 — Helminth ❌

#### UI
- "Inject Helminth" toggle on warframe panel
- Donor warframe selector → shows available abilities from WFCD data
- Slot picker (which ability rank 1/2/3/4 to replace)
- Visual badge showing "Replaced by [Donor]'s [Ability]"

#### Calculation
- BuildCore already has `HelminthAbility { donorWarframeId, slotIndex, replacesAbilityIndex }`
- `WfcdResolver.resolveWarframePassive()` already handles donor passive injection
- Need to: replace the warframe's ability modifiers with donor's ability modifiers in resolution
- After replacement, ability stat display shows the donor ability's scaling

---

### Phase 6 — Exalted Weapons ❌

#### Detection
- WFCD warframe data has `exalted[]` array of weapon uniqueNames
- Exalted weapons: Excalibur (Exalted Blade), Mesa (Regulators), Titania (Dex Pixia), etc.
- When warframe with exalted weapons is selected, show sub-tab for each

#### Each exalted weapon needs
- Own mod grid (8 slots, exilus, arcane)
- Own capacity (30 base + MR, no stance, no aura)
- Own stat calculation in weapon slot
- Note: some exalteds inherit mods from equipped weapon (e.g., Wukong's Iron Staff inherits melee mods)

#### Resolution
- `StatProcessor.calculateBuild()` already handles `weapons[]` array; exalted weapons can be added as extra entries
- `BuildCore` needs `exalted: { id, normalMods[], arcanes[] }[]` field

---

### Phase 7 — Companions 🔶

#### Done
- Companion type selector (sentinel/beast/moa/hound/predasite/vulpaphyla)
- Model dropdown filtered by type via `matchesCompType()`
- Weapon selector + weapon mod grid (for sentinel/moa/hound)
- Companion mod grid (8 slots)
- Wired into `BuildCore` with `companion { id, type, normalMods, weapon }` field
- `WfcdData.getItems('Companions')` + `getItems('CompanionWeapons')` IPC handlers

#### Missing
- **Companion stats in resolution** — `StatProcessor` needs companion stat path
  - Companion base stats (health, shields, armor from WFCD)
  - Companion weapon DPS calculation
  - Precept mod behavior (Vacuum, Animal Instinct, etc. — mostly utility, no stat impact)
- **Capacity for companion** — base 30 + MR, no aura/stance
- **Polarity on companion slots** — currently all UNIVERSAL, should load actual polarities
- **Beast weapon** — beasts use claws (weaponless), their attacks scale from companion stats

---

### Phase 8 — Primer Weapons & Condition Overload 🔶

#### Done
- `calculateStatusProbabilities()` exists — handles 4× physical weight weighting
- Status chance per shot calc exists

#### Missing
- **Primer DPS** — separate "primer score" that weights status/sec, variety of status types, ammo economy
- **Condition Overload** — multiply melee damage by `1 + (unique_proc_types × 0.8)` across the build
  - Count unique damage types across equipped weapons (not just the melee itself)
  - Apply as a post-resolution modifier on melee
- **Gun CO** (Galvanized Shot, Galvanized Savvy) — similar per-status multiplier for secondaries
- **Viral weighting** — viral procs double the damage of subsequent procs; factor into DPS
- **UI** — show primer rating, CO multiplier, status distribution bars

---

### Phase 9 — Archon Shards 🔶

#### Done
- UI: 5 shard slots with color dropdown (crimson/azure/amber/violet, blank)
- `WfcdResolver` has hardcoded per-color bonuses

#### Missing
- **Tauforged variant** — 1.5× effectiveness, toggle in UI
- **Accurate values** from actual WFCD data or reference
  - Crimson: +10% ability strength (tauforged +15%)
  - Azure: +225 armor (tauforged +337.5)
  - Amber: +7.5% energy orb effectiveness (tauforged +11.25%)
  - Violet: +1% critical damage per electric status on enemy (tauforged +1.5%)
- **New colors** — Topaz, Emerald (from recent updates)
- **Set bonuses** — violet shard bonus requires electric damage sources across build

---

### Phase 10 — Stats Panel Overhaul ❌

#### Current
- Ability stats: strength/duration/range/efficiency (flat percent)
- Weapon: avg DPS, base damage, elemental damage, multishot, crit chance, crit multiplier

#### Target
Full stat breakdown organized in expandable sections:

##### Warframe
- **Ability stats**: str/dur/range/efficiency with caps (efficiency max 175%)
- **EHP**: effective health (health × (1 + armor/300) + shields)
- **Energy**: max energy, regen/sec, efficiency-adjusted cost
- **Mobility**: sprint speed, parkour modifiers
- **Passive indicators**: conditional buffs (e.g., "Wall latch +50% electric")

##### Weapon
- **DPS**: sustained, burst, and average with reload cycle
- **Damage distribution**: Impact/Puncture/Slash/Elemental bars
- **Fire rate**: RPM, charge time, burst mechanics
- **Reload**: reload time, reload DPS ratio
- **Status**: chance per shot, status/sec, proc distribution by type (with 4× physical weight)
- **Crit**: yellow/orange/red crit tier probabilities, CD multiplier per tier
- **Accuracy**: spread/recoil stats
- **Comparison**: Δ display when swapping mods (green/red diff numbers)

##### Companion
- Health/shields/armor
- Companion weapon DPS (if applicable)
- Precept summary

#### UI Pattern
- Collapsible sections per stat category
- Consistent color coding: positive stats green, negative red
- Tooltips on hover for calculation breakdowns

---

### Phase 11 — Build Import/Export (NEW)

#### Design
- Encode entire `BuildCore` as a portable string
- Decode string → reconstruct full build state (warframe, weapons, mods, polarities, ranks, arcanes, shards, MR, helminth, companion)
- **Identifiers**: use `uniqueName` from WFCD (permanent — never recycled across updates)
- **Version prefix** (`tndex1:...`) so future format changes don't break old codes
- **Compression**: JSON → zlib (deflate raw) → Base62 for shareable strings (~200–400 chars)

#### Format

```
tndex1:<base62-encoded-data>
```

Where decoded JSON shape:

```ts
interface EncodedBuild {
  v: 1;
  mr: number;
  wf: { id: string; aura: string|null; auraRank: number; exilus: string|null; exilusRank: number;
         mods: [string, number][]; modPols: string[]; arcanes: [string|null, number][];
         shards: (string|null)[]; }
  helminth: { donor: string; slot: number } | null;
  primary: WeaponEncoded | null;
  secondary: WeaponEncoded | null;
  melee: WeaponEncoded | null;
  companion: { id: string; type: string; mods: [string, number][];
               weapon: { id: string; mods: [string, number][] } | null; } | null;
}

interface WeaponEncoded {
  id: string; mods: [string, number][]; exilus: string|null; exilusRank: number;
  pols: string[]; arcanes: [string|null, number][];
}
```

#### Decoding on import
1. Validate version prefix
2. Base62 → binary → inflate → JSON parse
3. Resolve all uniqueNames via `window.tennoDex.getItemDetail()` to get names/maxRanks/baseDrains/polarities
4. Set all state variables (wf, weaponStates, comp, mr, helminth)
5. Display success toast + build name

#### UI
- **Export button** on header: copies code to clipboard
- **Import button** on header: opens text input → paste → load
- **Share summary**: once decoded, show build name, warframe name, MR, total mods

---

## Recommended Execution Order

### Phase F1 — Testing (24h)
_Do this first — enables safe refactoring for everything else_

↓

### Phase F2 — TypeScript Strictness (25h)
_Catch bugs at compile time before they reach runtime_

↓

### Phase F3 + F4 — Architecture & Build (33h)
_Split monoliths, add HMR, ESLint, husky — dev velocity multiplier_

↓

### Phase 11 — Import/Export (8h)
_Quick win, unlocks sharing, self-contained_

↓

### Phase 7 finish — Companion stats (4h)
_Unblocks companion modding_

↓

### Phase F5 + F6 — CI/CD & Docs (15.5h)
_Automate quality gates, document the project_

↓

### Phase 3 — Set Bonuses (4h)
_Adds critical gameplay mechanic_

↓

### Phase 10 — Stats Panel (12h)
_Makes output useful, unifies with breakdowns_

↓

### Phase 5 — Helminth (4h)
_Major feature, mid effort_

↓

### Phase 6 — Exalted Weapons (6h)
_Deep warframe-specific feature_

↓

### Phase 8 — Primer & CO (8h)
_Math-heavy, late_

↓

### Phase 4 — Rivens (10h)
_Most complex UI, late_

↓

### Phase 9 — Shards (4h)
_Polish_

↓

### Phase F7 + F8 + F9 — UI Polish, Security, Perf (26.5h)
_Ongoing polish layer — sprinkle throughout_

---

## Totals

| Category | Hours |
|----------|-------|
| Foundational Quality (F1–F9) | ~124h |
| Feature Implementation (P1–P11) | ~60h |
| **Grand Total** | **~184h** |

**From 66% → 94% in ~184 engineering hours.** Start with Phase F1 (Testing) and Phase F2 (TypeScript) for the highest ROI — they catch bugs early and make every subsequent change safer.

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                     │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  src/browser/index.ts                                    │     │
│  │  ├── Application (.run)                                  │     │
│  │  │   ├── WfcdDataService ──── @wfcd/items (static JSON)  │     │
│  │  │   ├── WfcdAssetService ─── warframestat.us CDN        │     │
│  │  │   ├── WfcdResolver ─────── parses WFCD → Modifier[]   │     │
│  │  │   └── registerIpcHandlers ─ ipcMain.handle(...)       │     │
│  │  │       ├── getItems(category?)    → ItemInfo[]          │     │
│  │  │       ├── getItemDetail(un)      → unknown            │     │
│  │  │       ├── getAssetUrl(imageName) → string | null      │     │
│  │  │       ├── calculateBuild(core)   → CalculatedStats    │     │
│  │  │       └── fetchBuildPage(url)    → Overframe JSON     │     │
│  │  └── createMainWindow ─── contextIsolation: true         │     │
│  │                          nodeIntegration: false           │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  src/browser/window/create-main-window.ts                │     │
│  │  → loads dist/renderer/index.html                       │     │
│  └─────────────────────────────────────────────────────────┘     │
└───────────────────────┬─────────────────────────────────────────┘
                        │ IPC (contextBridge)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Electron Renderer Process                    │
│                                                                  │
│  preload.ts ─── exposes window.tennoDex API ────────────┐       │
│  { getItems, getItemDetail, getAssetUrl,                │       │
│    calculateBuild, fetchBuildPage }                     │       │
│                                                         ▼       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  src/renderer/index.tsx                                    │  │
│  │  → <BuildPlanner> (renders everything)                     │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │  useBuildPlanner()  hook  (846 lines)                │   │  │
│  │  │  ─────────────────────────────────────────           │   │  │
│  │  │  State:  warframes[], weapons{}, allMods[],          │   │  │
│  │  │          wf (WarframeState), weaponStates{},         │   │  │
│  │  │          comp (CompanionState), helminth,            │   │  │
│  │  │          result (CalculatedStats), mr, buffs,        │   │  │
│  │  │          conditionalTriggers, enemyState, ...        │   │  │
│  │  │                                                     │   │  │
│  │  │  Effects:                                           │   │  │
│  │  │  1. Fetch items on mount (warframes, weapons,       │   │  │
│  │  │     mods, arcanes, companions)                      │   │  │
│  │  │  2. Fetch frame detail on wf.id change              │   │  │
│  │  │  3. Overwolf GEP message handler (mount once)       │   │  │
│  │  │  4. Recalculate build on any state change           │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │  <BuilderShell>   (351 lines — too big)              │   │  │
│  │  │  Sub-components:                                     │   │  │
│  │  │  ├── ArsenalIdentity (header)                        │   │  │
│  │  │  ├── CenterSurface (mod grid area)                   │   │  │
│  │  │  │   ├── <AbilityPanel>                              │   │  │
│  │  │  │   ├── <ModGrid> + <ModCard>                      │   │  │
│  │  │  │   ├── <OtherSlotsStrip> (exilus, aura, arcane)   │   │  │
│  │  │  │   └── <ModLibraryDrawer>                          │   │  │
│  │  │  │       └── <ModPalette>                            │   │  │
│  │  │  ├── ContextPanel (target, buffs, conditionals)      │   │  │
│  │  │  └── StatsHUD    (412 lines — too big)               │   │  │
│  │  │      ├── Warframe stats (health, shields, armor...)  │   │  │
│  │  │      ├── Weapon stats (DPS, damage, crit, status...) │   │  │
│  │  │      ├── Companion stats (health, shields, armor)    │   │  │
│  │  │      └── Enemy stats (TTK, shots-to-kill, EHP)       │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  src/data/                                                       │
│  ├── game-data.ts ─── GameData class (singleton)                │  │
│  ├── game-data.json ── generated by update-data script          │  │
│  ├── wfcd-resolver.ts ── 789 lines — stat parser engine         │  │
│  ├── wfcd-types.ts ─── WFCD type definitions                    │  │
│  └── damage-type-mods.ts ── health/shield/armor modifiers       │  │
│                                                                  │
│  src/ (engine layer — pure functions, no React)                  │  │
│  ├── build-core.ts ─── BuildCore interface                      │  │
│  ├── modifier.ts ─── Modifier interface                         │  │
│  ├── stat-processor.ts ─── 1368+ lines — main calc engine       │  │
│  ├── damage-calculator.ts ─── status probability calc           │  │
│  ├── polarity.ts ─── polarity match, drain, capacity            │  │
│  ├── calc-breakdown.ts ─── PoB-style audit trail                │  │
│  ├── enemy-simulator.ts ─── enemy scaling, armor DR             │  │
│  ├── ability-stats.ts ─── (possibly superseded by processor)    │  │
│  └── ability-dps.ts ─── ability damage estimation               │  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Data Interfaces

```
Modifier (atomic stat change)
├── stat: string             ← magic string! should be union type
├── category: FLAT | MULTIPLIER
├── value: number
├── stackingGroup: string    ← magic string! should be union type
├── source: string
├── priority: number
└── condition?: ModifierCondition

BuildCore (sandbox state)
├── warframe: WarframeBuild
├── primary: WeaponBuild | null
├── secondary: WeaponBuild | null
├── melee: WeaponBuild | null
├── companion: CompanionBuild | null
├── buffs?: Modifier[]
├── conditionalTriggers?: ConditionalTriggerState
└── enemy?: EnemyTargetState

CalculatedStats (result)
├── strength, duration, range, efficiency
├── health, shields, armor, energy, ehp, sprintSpeed
├── weapons: Record<string, WeaponStats>
├── companion?: CompanionStats
├── setBonuses?: SetBonusInfo[]
├── helminthAbility?: HelminthAbilityStats
├── enemy?: EnemySummaryStats
└── breakdowns?: WarframeBreakdowns ← PoB audit trails
```

---

## Dependency Graph

```
F1 (Testing)
  │
  ├──► F2 (TypeScript Strictness) — needs tests to verify fixes
  │       │
  │       └──► F3 (Architecture) — needs types to refactor safely
  │               │
  │               ├──► F4 (Build/DevX) — parallel with F3
  │               │       │
  │               │       └──► F5 (CI/CD) — needs build working
  │               │               │
  │               │               └──► F6 (Docs) — needs stable API
  │               │
  │               ├──► P11 (Import/Export) — low dep, can start early
  │               ├──► P7 (Companion stats) — needs engine stable
  │               ├──► P3 (Set Bonuses) — needs resolver API stable
  │               ├──► P10 (Stats Panel) — needs stat-processor stable
  │               ├──► P5 (Helminth) — needs resolver + panel
  │               ├──► P6 (Exalted) — needs weapon engine stable
  │               ├──► P8 (Primer/CO) — needs DoT engine stable
  │               ├──► P4 (Rivens) — needs resolver API stable
  │               └──► P9 (Shards) — polish, lowest dep
  │
  └──► F7 (UI Polish) — best after architecture splits
      └──► F8 (Security) — independent, do anytime
          └──► F9 (Performance) — last, needs everything stable
```

---

## Known Bugs & Issues Registry

Found during code audit — specific, reproducible problems:

| # | Severity | File | Line(s) | Issue |
|---|----------|------|---------|-------|
| B1 | 🔴 Critical | `src/browser/services/wfcd-asset-service.ts` | 10 | `rejectUnauthorized: false` — disables SSL cert validation for all HTTPS requests. MITM vulnerability. |
| B2 | 🔴 Critical | `src/data/wfcd-resolver.ts` | (many) | Stat line parser `STAT_RE` may misparse WFCD stats with decimals (e.g. "+37.5%"). Non-capturing groups could cause mismatches. |
| B3 | 🟠 High | `src/features/build-planner/hooks/use-build-planner.ts` | 225-232 | Mod dedup by name loses mods with same name but different uniqueName (e.g. primed vs normal variants). `baseDrain + fusionLimit` scoring is fragile. |
| B4 | 🟠 High | `src/features/build-planner/hooks/use-build-planner.ts` | 98-107 | `saveLoadout` has `useCallback` deps `[wf, weaponStates, comp, helminth, mr]` but function closure captures stale state on rapid saves. `alert()` used after save. |
| B5 | 🟠 High | `src/features/build-planner/hooks/use-build-planner.ts` | 109-193 | `loadLoadout` fires multiple `setState` calls in Promise chains — each triggers re-render. Batch with `unstable_batchedUpdates` or single set. |
| B6 | 🟠 High | `src/features/build-planner/hooks/use-build-planner.ts` | 550-671 | Build calculation effect depends on `[wf, weaponStates, comp, helminth, ...]` — runs on EVERY keystroke/change. No debounce. |
| B7 | 🟠 High | `src/stat-processor.ts` | 359-480 | `applyConditions` has 15+ unimplemented trigger types that default to `include = false` — users won't know their conditional mods are silently doing nothing. |
| B8 | 🟠 High | `src/stat-processor.ts` | 248-267 | `bucketify` uses `stat + '::' + stackingGroup` as key — if any stat name contains `::`, bucket lookup breaks. No sanitization. |
| B9 | 🟡 Medium | `src/features/build-planner/components/mod-card.tsx` | 8-11 | `POL_CYCLE` cycles through all polarities — Umbra forma is one-time in game. Cycle should not include Umbra unless explicitly a forma action. |
| B10 | 🟡 Medium | `src/features/build-planner/services/build-codec.ts` | 53-57 | `encodeBuild` uses `btoa` which throws on non-Latin1 characters. No zlib compression despite design doc mentioning it. String length can exceed clipboard limits. |
| B11 | 🟡 Medium | `src/features/build-planner/services/overframe-importer.ts` | 78-85 | `parseModString` regex is fragile — fails on mod names containing "Rank" or "R" naturally (e.g. "Rank 10" is a real Overframe format quirk). |
| B12 | 🟡 Medium | `src/browser/ipc/register-ipc-handlers.ts` | 50-96 | All IPC handlers use silent `catch(e) { console.error(...); return null; }` — renderer never knows WHY a call failed. No structured error propagation. |
| B13 | 🟡 Medium | `src/stat-processor.ts` | 933-948 | Enemy damage disabled when `enemyState` returns null — no fallback, silently shows 0 TTK. |
| B14 | 🟡 Medium | `src/types.d.ts` | 15 | `getItemDetail(uniqueName: string): Promise<unknown>` — entire IPC response is `unknown`, forcing `as any` everywhere it's consumed. |
| B15 | 🟢 Low | `src/stat-processor.ts` | 245 | `ABILITY_STATS` array — `['strength', 'duration', 'range', 'efficiency']` used bare instead of a shared constant. |
| B16 | 🟢 Low | `src/features/build-planner/components/riven-editor.tsx` | 4-41 | Stat pools hardcoded in component — should come from game-data.json or a shared config. |
| B17 | 🟢 Low | `src/utils/assets.ts` | 13 | `getImageUrl` returns CDN URL directly but WfcdAssetService also builds CDN URLs — two code paths for the same thing. Renderer should use IPC only. |
| B18 | 🟢 Low | `src/features/build-planner/components/stats-hud.tsx` | 35-37 | `coMultiplier` hardcoded as 0.8 fallback — should come from game-data or stat-processor result. |

---

## Tech Debt Audit — Specific Locations

### Dead Code
| File | Lines | Why Dead |
|------|-------|----------|
| `src/ability-stats.ts` | 1-57 | `calculateAbilityStats()` computes str/dur/range/efficiency manually — but `stat-processor.ts` does the same work via `resolveMultiplied(abilityBuckets, '${stat}::ability')`. No callers found. |
| `src/utils/assets.ts` | 1-90 | All `getImageUrl`, `getModImage`, etc. are pure URL builders — but the app already uses `WfcdAssetService` via IPC for cached CDN downloads. Direct CDN URLs bypass caching. |
| `windows/background/bridge.js` | (unknown) | Overwolf background page bridge — may be vestigial from the Overwolf build target. |

### Duplicated Code
| What | Where | Duplicated In |
|------|-------|---------------|
| `ItemOption` interface | `src/types.d.ts:1-11` | `src/shared/item-info.ts:1-11` (identical) |
| `ItemInfo` interface | `src/shared/item-info.ts:1-11` | `src/data/wfcd-data-service.ts:5` (inline `IndexedItem`) |
| Mod resolution from IPC | `use-build-planner.ts:116-122` (loadLoadout) | `use-build-planner.ts:689-695` (handleImport) — 90% identical loops |
| Polarity parsing | `src/polarity.ts:14-16` | `src/features/build-planner/services/overframe-importer.ts:66-69` (duplicate map) |
| Weapon encoding | `build-codec.ts:26-37` (encode) | `build-codec.ts:97-112` (decode) — mirrored logic, easy to drift |

### Magic Strings Needing Constants
| String | Used In |
|--------|---------|
| `'base_damage'`, `'crit_chance'`, `'crit_damage'`, `'status_chance'` | `stat-processor.ts` lines 756-860 |
| `'weapon_base_damage'`, `'weapon_crit'`, `'weapon_status'`, `'weapon_elemental'` | `stat-processor.ts` lines 248-317 (bucket keys) |
| `'impact'`, `'puncture'`, `'slash'`, `'heat'`, `'cold'`, `'electric'`, `'toxin'` | `damage-calculator.ts`, `stat-processor.ts`, `damage-type-mods.ts` |
| `'warframe'`, `'primary'`, `'secondary'`, `'melee'`, `'companion'` | `use-build-planner.ts`, `build-core-mapper.ts`, `builder-shell.tsx` |
| `'MADURAI'`, `'VAZARIN'`, `'NAIRU'`, `'UMBRA'`, `'PENJAGA'`, `'UNIVERSAL'` | `polarity.ts`, `model.ts`, `overframe-importer.ts`, `riven-editor.tsx` |
| `'onKill'`, `'onHeadshot'`, `'onSlashProc'`, `'galvanizedStacks'` | `modifier.ts:26-53`, `stat-processor.ts:382-470` |

---

## Error Handling Audit

| Location | Pattern | Risk |
|----------|---------|------|
| `register-ipc-handlers.ts:52-75` | `try { ... } catch (e) { console.error(...); return null; }` | Renderer receives null with NO indication of failure. Every consumer must check for null — most don't. |
| `wfcd-data-service.ts:40-44` | `try { all = new Items(); } catch (e) { console.error(...); return; }` | Silently returns with empty data. App shows "no items" with no error state. |
| `use-build-planner.ts:193` | `catch (e) { alert('Load failed: ' + (e as any).message); }` | `alert()` — blocks UI thread, no stack trace. |
| `use-build-planner.ts:670` | `.catch(e => console.error('[BuildPlanner] calculateBuild failed:', e))` | Silent console error — UI shows stale previous result, user has no idea calc failed. |
| `riven-store.ts:19,28` | `catch { /* ignore */ }` | localStorage parse failures silently ignored — data corruption goes undetected. |
| `wfcd-resolver.ts:287,297` | `catch { return null; }` | enrichSlot/enrichArcane catch-all swallows errors — no log, no retry. |
| `create-main-window.ts:15` | `.catch(error => console.error(...))` | Renderer load failure logged but no fallback UI shown. |

### Fix Strategy
1. Create `AppError` class extending `Error` with `code: string`, `context: unknown`, `severity: 'warn' | 'error' | 'fatal'`
2. Create `Result<T, E = AppError>` union type instead of `T | null` returns
3. IPC handlers return `{ success: true, data: T } | { success: false, error: string }`
4. Add `<ErrorBoundary>` at root with fallback UI and "Retry" / "Report" buttons
5. Add `useErrorHandler()` hook that surfaces errors to toast + console
6. Replace ALL `catch { /* ignore */ }` with at minimum a console.warn

---

## Definition of Done

Each phase is complete only when ALL criteria are met:

### Phase F1 (Testing) ✅ Definition
- [ ] `npm run test` passes with zero failures
- [ ] Code coverage ≥ 60% (lines, branches, functions)
- [ ] Every pure function in `src/` has unit tests
- [ ] Every component in `src/features/build-planner/components/` has smoke tests
- [ ] CI runs tests on every PR

### Phase F2 (TypeScript) ✅ Definition
- [ ] `tsconfig.json` has `"strict": true` and compiles with zero errors
- [ ] Zero `any` types in `src/` (except `declare module` wrappers)
- [ ] Zero `as any` casts
- [ ] All functions have explicit return types
- [ ] `noUnusedLocals`, `noUnusedParameters` enabled
- [ ] `npm run typecheck` passes

### Phase F3 (Architecture) ✅ Definition
- [ ] `use-build-planner.ts` ≤ 300 lines
- [ ] `builder-shell.tsx` ≤ 200 lines
- [ ] `stats-hud.tsx` ≤ 250 lines
- [ ] No `alert()` calls in production code
- [ ] Error boundary wraps each major UI region
- [ ] All `console.log` calls gated behind `DEBUG` flag
- [ ] Magic strings replaced with const enums

### Phase P3 (Set Bonuses) ✅ Definition
- [ ] Set bonus counts computed across all equipped slots
- [ ] Active set bonuses injected into Modifier[] pipeline
- [ ] Set bonus display in UI (badge: "Augur 2/4")
- [ ] Verified against 5 known sets with correct stat injection
- [ ] Test: 2-piece, 4-piece, no match, all 3 weapons

---

## Specific npm Packages Needed

### Phase F1
```
npm i -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

### Phase F2
```
npm i -D typescript@^5.5  (and fix peer deps)
```

### Phase F3
```
npm i react-error-boundary  (prebuilt error boundary)
```

### Phase F4
```
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier husky lint-staged webpack-dev-server @pmmmwh/react-refresh-webpack-plugin react-refresh css-minimizer-webpack-plugin source-map-explorer
```

### Phase F6
```
npm i -D typedoc  (for API docs generation)
```

### Phase F7
```
npm i react-window @types/react-window  (for virtualized mod list)
```

### Phase F8
```
npm update electron@latest
```

---

## Feature Phase — Detailed Implementation Notes

### Phase 3 — Set Bonuses (Expand Existing)

#### Data Flow
```
Mod.uniqueName → WfcdDataService.getModSetPath() → "modSetPath"
                                                          │
                                                          ▼
Collect across: warframe.mods + weapon.mods + companion.mods + exalted.mods
                                                          │
                                                          ▼
Count per modSetPath → threshold table (2/4/6)
                                                          │
                                                          ▼
Lookup setDef.stats[activeIdx] → parse stat string
                                                          │
                                                          ▼
WfcdResolver.resolveSetBonusStat() → Modifier[]
                                                          │
                                                          ▼
Inject into frameMods / weaponMods pool → bucketify() picks it up
```

#### Files to modify
- `src/data/wfcd-resolver.ts` — add `resolveSetBonusStat()` method (line ~789+)
- `src/stat-processor.ts` — after `collectAllMods()` (line 1136), call `collectSetBonuses()` and fold Modifier[] into pools (line 1240 area — already partially done!)
- `src/data/wfcd-data-service.ts` — expose `getModSetPath()` and `getSetDef()` (already done at lines 125-127)
- UI: `src/features/build-planner/components/set-bonus-panel.tsx` — already exists as shell, needs wiring

#### Already Working (from `stat-processor.ts`):
- `collectSetBonuses()` at line 1159 — collects counts and active bonus strings ✅
- `setBonusMods` parsed at line 1230-1238 ✅
- Injected into `frameMods` array at line 1248 ✅

#### Still Missing:
- Set bonus stat string → Modifier[] parsing in resolver (partial stub exists)
- UI `SetBonusPanel` needs to receive real data from `CalculatedStats.setBonuses`
- Verification: augment mod set (2pc → +str) should show in ability stats

---

### Phase 7 — Companions (Detailed)

#### Companion Stat Resolution Path
```
src/features/build-planner/services/build-core-mapper.ts
  └─ toBuildCore() ─── companion: { id, type, normalMods, slotPolarities, weapon }
                          │
                          ▼
src/stat-processor.ts :: calculateBuild()
  └─ if (build.companion) → calculateCompanion(build.companion, resolver)
                          │
                          ▼
src/stat-processor.ts :: calculateCompanion()  (lines 1192-1216)
  └─ Resolves: companion_base_health, companion_base_shield, companion_base_armor
     Then multiplies by health/shields/armor multipliers from mods
     Returns: CompanionStats { health, shields, armor, ehp }
```

#### What's Already Wired
- `calculateCompanion()` exists ✅
- Base stats come from `WfcdDataService.load()` line 73-79 ✅
- Companion weapon uses `calculateSingleWeapon()` via `build.companion.weapon` at line 1342-1358 ✅
- `CalculatedStats.companion` and `CalculatedStats.weapons['companion_weapon']` populated ✅

#### What's Still Missing
- **Polarity loading**: `build-core-mapper.ts` line 76 uses `companion.slotPolarities` but these are always defaults — need WFCD data for actual polarities
- **Beast weapon stats**: Beasts (Kubrow, Kavat, Predasite, Vulpaphyla) have no weapon — their attack is `companion_base_melee` which isn't resolved yet
- **UI display**: `StatsHUD` has companion stat section at line 39 but needs to be shown when `activeSlot === 'companion'`
- **Capacity**: companion capacity calc at `use-build-planner.ts:543-547` already exists ✅ — just needs UI element

---

### Phase 9 — Archon Shards (Detailed Implementation)

#### Data Model (src/data/game-data.ts)
```ts
interface ShardDef {
  color: string;     // 'crimson' | 'azure' | 'amber' | 'violet' | 'topaz' | 'emerald'
  label: string;     // 'Crimson' | 'Azure' | etc.
  stats: ShardStatDef[];
}

interface ShardStatDef {
  stat: string;      // 'strength' | 'armor' | 'energy_max' | 'crit_damage' | 'status_duration' ...
  value: number;     // base value (tauforged = 1.5x)
  group: string;     // 'ability' | 'warframe_armor' | 'warframe_energy' | 'weapon_crit_damage' ...
  category: 'FLAT' | 'MULTIPLIER';
}
```

#### Resolution Path
```
EquippedShard { id: '', color, isTau }
  │
  ▼
WfcdResolver.resolveShard(shard)
  ├─ Looks up gameData.getShardDef(shard.color)
  ├─ For each ShardStatDef:
  │   ├─ value = isTau ? stat.value * 1.5 : stat.value
  │   └─ Emits Modifier { stat, category: stat.category, value, stackingGroup: stat.group, ... }
  └─ Returns Modifier[]
```

#### Current State
- `WfcdResolver` has hardcoded per-color logic — needs to be data-driven
- `game-data.ts` has `shardDefs` already populated in `game-data.json` ✅
- UI has 5 slots with color dropdown ✅
- Tauforged toggle missing ❌
- Topaz and Emerald colors missing from dropdown ❌
- Violet/crit damage interaction with electric procs missing ❌

---

## App-wide Constant Registry

Create `src/constants.ts` with:

```ts
// ── Stat Names ─────────────────────────────────────────
export const STAT = {
  BASE_DAMAGE: 'base_damage',
  CRIT_CHANCE: 'crit_chance',
  CRIT_DAMAGE: 'crit_damage',
  STATUS_CHANCE: 'status_chance',
  FIRE_RATE: 'fire_rate',
  MULTISHOT: 'multishot',
  RELOAD_SPEED: 'reload_speed',
  MAGAZINE: 'magazine',
  STRENGTH: 'strength',
  DURATION: 'duration',
  RANGE: 'range',
  EFFICIENCY: 'efficiency',
  HEALTH: 'health',
  SHIELDS: 'shields',
  ARMOR: 'armor',
  ENERGY: 'energy',
  SPRINT_SPEED: 'sprint_speed',
} as const;

// ── Stacking Groups ────────────────────────────────────
export const GROUP = {
  WEAPON_BASE_DAMAGE: 'weapon_base_damage',
  WEAPON_CRIT: 'weapon_crit',
  WEAPON_CRIT_DAMAGE: 'weapon_crit_damage',
  WEAPON_STATUS: 'weapon_status',
  WEAPON_FIRE_RATE: 'weapon_fire_rate',
  WEAPON_MULTISHOT: 'weapon_multishot',
  WEAPON_ELEMENTAL: 'weapon_elemental',
  WEAPON_PHYSICAL: 'weapon_physical',
  WEAPON_RELOAD: 'weapon_reload',
  WEAPON_CO: 'weapon_co',
  FACTION_DAMAGE: 'faction_damage',
  ABILITY: 'ability',
  WARFRAME_HEALTH: 'warframe_health',
  WARFRAME_SHIELDS: 'warframe_shields',
  WARFRAME_ARMOR: 'warframe_armor',
  WARFRAME_ENERGY: 'warframe_energy',
  AURA_DEBUFF: 'aura_debuff',
  COMPANION_BASE: 'companion_base',
} as const;

// ── Element Types ──────────────────────────────────────
export const ELEMENT = {
  IMPACT: 'impact',
  PUNCTURE: 'puncture',
  SLASH: 'slash',
  HEAT: 'heat',
  COLD: 'cold',
  ELECTRIC: 'electric',
  TOXIN: 'toxin',
  BLAST: 'blast',
  CORROSIVE: 'corrosive',
  GAS: 'gas',
  MAGNETIC: 'magnetic',
  RADIATION: 'radiation',
  VIRAL: 'viral',
  VOID: 'void',
  TAU: 'tau',
  TRUE: 'true',
} as const;

export type DamageType = typeof ELEMENT[keyof typeof ELEMENT];

// ── Conditional Trigger Types ──────────────────────────
export const TRIGGER = {
  ON_KILL: 'onKill',
  ON_HEADSHOT: 'onHeadshot',
  ON_HEADSHOT_KILL: 'onHeadshotKill',
  ON_SLASH_PROC: 'onSlashProc',
  GALVANIZED_STACKS: 'galvanizedStacks',
  ON_AIM_GLIDE: 'onAimGlide',
  ON_WALL_LATCH: 'onWallLatch',
  ON_SLIDE: 'onSlide',
  ON_SPAWN: 'onSpawn',
  ON_MELEE_KILL: 'onMeleeKill',
  PER_COMBO_MULTIPLIER: 'perComboMultiplier',
} as const;

// ── Damage Type Combine Table ──────────────────────────
export const ELEMENTAL_COMBINE: Record<string, Record<string, string>> = {
  heat: { cold: 'blast', electric: 'radiation', toxin: 'gas' },
  cold: { heat: 'blast', electric: 'magnetic', toxin: 'viral' },
  electric: { heat: 'radiation', cold: 'magnetic', toxin: 'corrosive' },
  toxin: { heat: 'gas', cold: 'viral', electric: 'corrosive' },
};

// ── Physical Weights (Warframe mechanic) ──────────────
export const PHYSICAL_WEIGHT = 4;
export const ELEMENTAL_WEIGHT = 1;
export const PHYSICAL_KEYS: ReadonlySet<string> = new Set(['impact', 'puncture', 'slash']);
```

---

## Performance Budget

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Initial render (cold) | ~2s (est.) | <500ms | `window.performance` + IPC timing |
| Build calculation | ~100ms (est.) | <50ms | `performance.now()` around IPC call |
| Mod palette filter (3000 mods) | ~30ms (est.) | <5ms | React DevTools profiler |
| Bundle size (renderer) | ~2MB (est.) | <500KB gzip | `source-map-explorer` |
| Build codec encode/decode | ~10ms (est.) | <5ms | unit test timing |
| Image load (asset CDN) | per-request | cached | browser cache hit rate |

---

## Testing Strategy

### Unit Tests (Vitest)
```
src/__tests__/
├── polarity.test.ts
├── damage-calculator.test.ts
├── calc-breakdown.test.ts
├── enemy-simulator.test.ts
├── build-codec.test.ts
├── build-core-mapper.test.ts
├── stat-processor.test.ts          ← largest, organized by section
│   ├── warframe-stats.test.ts
│   ├── weapon-stats.test.ts
│   ├── enemy-damage.test.ts
│   ├── dot-calculations.test.ts
│   └── set-bonuses.test.ts
├── wfcd-resolver.test.ts
│   ├── stat-line-parsing.test.ts
│   ├── element-combination.test.ts
│   └── conditional-mods.test.ts
└── overframe-importer.test.ts
```

### Component Tests (Vitest + @testing-library/react)
```
src/features/build-planner/components/__tests__/
├── ModCard.test.tsx
├── ModPalette.test.tsx
├── StatsHUD.test.tsx
├── CapacityBar.test.tsx
└── BuilderShell.test.tsx
```

### Integration Tests
```
src/__tests__/integration/
├── build-roundtrip.test.ts     (state → BuildCore → encode → decode → calculate → verify)
├── overframe-import.test.ts    (JSON → parse → map → BuildCore → calculate)
└── loadout-save-load.test.ts   (save → localStorage → read → restore state)
```

### Test Data Strategy
- Create `src/__tests__/fixtures/` with:
  - `braton.json` — base weapon with known stats
  - `excalibur.json` — base warframe
  - `serration.json` — single mod (+165% damage)
  - `full-build.json` — complete build with known output values
  - `overframe-payload.json` — sample Overframe API response
  - `build-code-valid.json` / `build-code-invalid.json`
- Use `vi.mock()` for `@wfcd/items` and `window.tennoDex` IPC
- Use `vi.mock('../../data/game-data')` to inject controlled game-data.json

### Coverage Targets
| Threshold | Initial | Target |
|-----------|---------|--------|
| Lines | 40% | 80% |
| Functions | 30% | 75% |
| Branches | 25% | 70% |
| Statements | 40% | 80% |
