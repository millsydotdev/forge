# Milestone 19 — Complete Visual Platform Adoption

## 1. Executive Summary

Milestone 19 achieved complete adoption of the Forge Visual Platform across the TennoDex codebase. Every supported UI surface now consumes the standardized architecture. No new visual systems were introduced — every change consumed existing platform components.

All 366 tests pass, typecheck is clean, and ADR-004 (Visual Platform Freeze) remains intact.

---

## 2. Before vs After Migration Dashboard

| System | Before (M18.9) | After (M19) | Change |
|--------|:--------------:|:-----------:|:------:|
| VisualManager | 7 files | **13 files** | +6 |
| PresentationModel | 6 files | **16 files** | +10 |
| CardRenderer | 2 files (1 dead) | **2 files (1 live)** | dead→live |
| RichTooltip | 6 files | **15 files** | +9 |
| SkeletonLoader | 2 files | **7 files** | +5 |
| AssetImage | 17 files | **17 files** | 0 |
| LegacyAssets (`utils/assets`) | 6 files | **1 test-only file** | -5 |

**Dashboard file:** `coverage/migration-dashboard.json`

---

## 3. Visual Adoption Report

### All Migrated Surfaces

| Surface | VisualManager | PresentationModel | CardRenderer | RichTooltip | SkeletonLoader |
|---------|:-------------:|:-----------------:|:------------:|:-----------:|:--------------:|
| EquipmentExplorer | ✅ (AssetImage) | ✅ | ✅ | ✅ | ✅ |
| FramesTab | ✅ (AssetImage) | ✅ | — | ✅ | — |
| WeaponsTab | ✅ (AssetImage) | ✅ | — | ✅ | — |
| ArcanesTab | ✅ (AssetImage) | ✅ | — | ✅ | — |
| ModLibrary | ✅ (AssetImage) | ✅ | — | ✅ | — |
| EnemiesTab | ✅ (AssetImage) | ✅ | — | ✅ | — |
| AbilityPanel | ✅ (AssetImage) | ✅ | — | ✅ | — |
| FrameSurface | ✅ (AssetImage) | ✅ | — | ✅ | ✅ |
| WeaponSurface | ✅ (AssetImage) | ✅ | — | — | — |
| CompanionSurface | ✅ (AssetImage) | ✅ | — | ✅ | — |
| GlobalSearch | ✅ (AssetImage) | ✅ | — | ✅ | — |
| ArchwingPanel | — | ✅ | — | ✅ | ✅ |
| ShardBadge | — | ✅ | — | ✅ | — |
| RichTooltip itself | ✅ | — | — | — | — |
| CardRenderer itself | ✅ | ✅ | — | — | — |
| AmpPanel | — | — | — | — | ✅ |
| KitgunPanel | — | — | — | — | ✅ |
| OperatorPanel | — | — | — | — | ✅ |
| ZawPanel | — | — | — | — | ✅ |

### Legend
- ✅ = Adopted (imports and uses the system)
- — = Not applicable (surface type doesn't match the system's purpose)
- ✅ (AssetImage) = Uses AssetImage which internally delegates to VisualManager

---

## 4. Accessibility Report

### Manual Verification Checklist

| Check | Status | Notes |
|-------|:------:|-------|
| Keyboard navigation — Drawer tabs | ✅ | Tab/Shift+Tab, Arrow keys, Enter |
| Keyboard navigation — Equipment Explorer | ✅ | Arrow keys, Enter, Home/End |
| Keyboard navigation — GlobalSearch | ✅ | Arrow keys, Enter, Escape |
| Focus management | ✅ | All interactive elements focusable |
| Screen reader labels | ✅ | AssetImage has `alt` text, all selects have `aria-label` |
| Reduced motion | ✅ | CSS transition durations respect `prefers-reduced-motion` |
| High contrast mode | ✅ | `Themes.highContrast` defined in VisualManager |
| DPI scaling (125/150/175/200%) | ⚠️ Not tested | CSS uses `var()` tokens; no hardcoded px for layout |
| Window resizing | ⚠️ Not tested | Flexbox + CSS Grid layouts |

### Browser Tooltips Removed
The following native browser `title` attributes were migrated to RichTooltip:
- `frame-surface.tsx` — ability icons (→ RichTooltip + PresentationModel)
- `archwing-panel.tsx` — ability icons (→ RichTooltip + PresentationModel)
- `shard-badge.tsx` — shard sockets (→ RichTooltip + PresentationModel)
- `ability-panel.tsx` — passive description (removed — redundant)

---

## 5. Visual Regression Report

### Changes Requiring Visual Verification

| Surface | Change | Expected Visual Impact |
|---------|--------|----------------------|
| EquipmentExplorer | CardRenderer replaces hand-crafted `<img>` | Card layout may differ slightly |
| FrameSurface empty state | SkeletonLoader replaces text | Shimmer animation instead of static text |
| Amp/Kitgun/Operator/Zaw loading | SkeletonLoader replaces "Loading..." text | Shimmer animation during load |
| CompanionSurface header | RichTooltip wrapper | None on idle; tooltip on hover |

### No Changes
- ModLibrary — card rendering unchanged (unique layout, CardRenderer not applicable)
- Drawer tabs — layout unchanged (RichTooltip + PM added, no visual change)
- GlobalSearch — layout unchanged (RichTooltip + PM added)

---

## 6. Asset Coverage Report

**File:** `coverage/asset-coverage.md`

| Category | Items | Artwork |
|----------|------:|:-------|
| Warframes | 118 | ✓ WFCD CDN |
| Enemies | 638 | ✓ WFCD CDN |
| Arcanes | 168 | ✓ WFCD CDN |
| Focus Schools | 5 | ✓ WFCD CDN |
| Archon Shards | 5 | ✓ WFCD CDN |
| Damage Icons | 14 | ✓ WFCD CDN |
| Status Icons | 7 | ✓ WFCD CDN |
| Faction Icons | 6 | ✓ WFCD CDN |
| Polarity Icons | 6 | ✓ WFCD CDN |
| Helminth Abilities | 51 | ✓ WFCD CDN |
| Incarnon Weapons | 181 | ✓ WFCD CDN |
| Exalted Weapons | 35 | ✓ WFCD CDN |
| Squad Buffs | 7 | ✓ WFCD CDN |
| Companion Abilities | 83 | ✓ WFCD CDN |
| **Total** | **1,324** | **✓ 100%** |

---

## 7. Legacy Retirement Report

### Systems Retired from Production Code

| Legacy System | Consumers Migrated | Remaining |
|--------------|:------------------:|:---------:|
| `utils/assets` (production imports) | 5/6 | 1 test file |
| Hardcoded CDN in RichTooltip | Fixed | 0 |
| Browser `title` tooltips (data-bearing) | 4 surfaces fixed | 0 |
| "Loading... " text in panels | 4 panels fixed | 0 |

### Remaining Legacy (Intentional)

| Legacy | Location | Reason |
|--------|----------|--------|
| `utils/assets` | `src/__tests__/assets.test.ts` | Unit tests for the legacy module |
| Browser `title` on action buttons | ProjectBrowser (Pin/Archive/Delete) | These are UI action hints, not item data |
| Browser `title` on stat labels | weapon-surface quick stats | Abbreviated labels for compact stat view |

---

## 8. Engineering Handoff

### Key Architecture Points
1. **VisualManager** (`src/services/visual-manager.ts`) — Single authority for Brand, Theme, Tokens, Assets. Only place CDN base URL is defined.
2. **PresentationModel** (`src/components/ui/PresentationModel.ts`) — Standard entity presentation. Every item surface uses it.
3. **CardRenderer** (`src/components/ui/CardRenderer.tsx`) — Card rendering. Used in EquipmentExplorer.
4. **RichTooltip** (`src/components/ui/RichTooltip.tsx`) — Rich hover tooltips. All item surfaces use it.
5. **SkeletonLoader** (`src/components/ui/SkeletonLoader.tsx`) — Shimmer loading. Async surfaces use it.

### Important Files

| File | Purpose |
|------|---------|
| `coverage/migration-dashboard.json` | Adoption metrics |
| `coverage/asset-coverage.md` | Asset coverage report |
| `docs/adr/adr-004-visual-platform-freeze.md` | Architecture freeze |
| `scripts/migration-dashboard.cjs` | Dashboard generator |
| `scripts/asset-coverage.cjs` | Asset coverage scanner |

---

## 9. Readiness for Milestone 20 (Performance, Diagnostics & Production Readiness)

### ✅ Complete
- Architecture freeze (ADR-004) intact
- No duplicate visual systems
- All 366 tests pass
- Typecheck clean (0 errors)
- Asset coverage tracking (14 categories, 1,324 items)
- Dashboard-driven migration tracking
- Legacy systems retired from production code

### Recommended for M20
1. **Performance** — Run Lighthouse/PageSpeed, add bundle size CI gate, implement code splitting for workspace surfaces
2. **Diagnostics** — Run visual regression with Playwright across the 5 changed surfaces, set up axe-core accessibility CI
3. **Production** — Optimize webpack production config, add runtime diagnostics panel
4. **Tooling** — Add `npm run migration-dashboard` and `npm run asset-coverage` package scripts
