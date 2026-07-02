# Milestone 8b — Weapon Data, Melee Mechanics & Focus/Companion Data Integration

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Completes the 3 deferred tasks from the Gameplay Correctness milestone: per-mode weapon attack stats, melee follow-through & falloff, and data-driven Focus/Companion expansion.

---

## Task 1: Weapon Attacks[] Integration & Melee Follow-Through

### Changes to `src/data/wfcd-resolver.ts`

**`resolveWeaponPassive()`** now extracts the following from WFCD weapon data:

| Field | Source | Purpose |
|-------|--------|---------|
| `followThrough` | WFCD Melee `followThrough` | Multi-target melee damage reduction |
| `range` | WFCD Melee `range` | Melee attack range |
| `windUp` | WFCD Melee `windUp` | Heavy attack wind-up time |
| `comboDuration` | WFCD Melee `comboDuration` | Combo counter decay time |
| `blockingAngle` | WFCD Melee `blockingAngle` | Blocking angle (defaults to 180) |
| `falloff` | WFCD attacks[].falloff | Ranged damage falloff (start/end/reduction) |
| `alt_crit_chance` | WFCD attacks[].crit_chance | Alt/Incarnon mode crit chance |
| `alt_crit_damage` | WFCD attacks[].crit_mult | Alt/Incarnon mode crit multiplier |
| `alt_status_chance` | WFCD attacks[].status_chance | Alt/Incarnon mode status chance |
| `alt_fire_rate` | WFCD attacks[].speed | Alt/Incarnon mode fire rate |

### Changes to `src/engine/build-core.ts`

Added `attackMode` field to `WeaponBuild`:
```typescript
attackMode?: 'normal' | 'alt' | 'incarnon';
```

### Changes to `src/engine/stat-processor/weapon-calc.ts`

**Melee Follow-Through:** When `multiTarget > 1` and `followThrough < 1`, the per-target damage is calculated using the geometric series formula:
```
followThroughMultiplier = (1 - followThrough^n) / ((1 - followThrough) × n)
```
This is applied to enemy damage calculations for multi-target scenarios.

**Damage Falloff:** When falloff data exists (start, end, reduction), a mid-range engagement distance is assumed. Damage is linearly interpolated between full damage (at start) and reduced damage (at end).

---

## Task 2: Data-Driven Focus System

### Changes to `scripts/update-game-data.cjs`

`deriveFocus()` now extracts all 105 WFCD focus nodes and maps them to their respective schools. Each school entry now includes:
- `nodes[]` — array of nodes with `uniqueName`, `name`, `maxRank`, `description`

| School | Nodes Extracted |
|--------|----------------|
| Madurai | 21 |
| Zenurik | 19 |
| Naramon | 22 |
| Unairu | 24 |
| Vazarin | 19 |
| **Total** | **105** |

### Changes to `src/data/game-data.ts`

Added `FocusNodeDef` interface and `nodes`/`nodeCount` fields to `FocusSchoolDef`.

---

## Task 3: Companion Data Expansion

### Changes to `scripts/update-game-data.cjs`

`deriveCompanionAbilityData()` now extracts companion base stats:
- `health`, `shield`, `armor`
- `petWeapon` — natural weapon stats (when available from WFCD)

### Changes to `src/data/game-data.ts`

Extended `CompanionAbilityDatum` with `health`, `shield`, `armor`, and `petWeapon` fields.

---

## Files Changed

| File | Change |
|------|--------|
| `src/data/wfcd-resolver.ts` | **MODIFIED** — Extracts followThrough, range, windUp, comboDuration, blockingAngle, falloff, alt-attack stats from WFCD weapon data |
| `src/engine/stat-processor/weapon-calc.ts` | **MODIFIED** — Applies follow-through multi-target reduction and damage falloff calculations |
| `src/engine/build-core.ts` | **MODIFIED** — Added `attackMode` field to `WeaponBuild` |
| `scripts/update-game-data.cjs` | **MODIFIED** — Extracts focus nodes from WFCD (105 nodes), companion stats + pet weapons |
| `src/data/game-data.ts` | **MODIFIED** — Added `FocusNodeDef`, expanded `FocusSchoolDef`, `CompanionAbilityDatum` |
| `src/data/game-data.json` | **REGENERATED** — Focus nodes attached to schools, companion stats expanded |

---

## Coverage Update

| Metric | Before | After |
|--------|--------|-------|
| Focus nodes extracted | 0 | 105 (all 5 schools) |
| Weapon melee stats extracted | 2 (range, heavy_wind_up) | 7 (+ followThrough, comboDuration, blockingAngle, falloff, alt stats) |
| Companion stats extracted | 0 | health/shield/armor for all 83 |
| Per-attack alt mode stats | 0 | 4 (crit/status/fire rate/damage for alt/incarnon modes) |
| Test count | 366 | 366 (no regression) |

### Remaining (documented)
- **Attack mode selection UI** — The `attackMode` field is defined but not yet wired into a UI selector (dropdown/button on weapon surface)
- **Pet weapon calculations** — Pet natural weapons not consistently available in WFCD; requires further research
- **Full weapon calc attack-mode integration** — weapon-calc.ts currently uses aggregate stats; attack-mode-specific stat substitution is pending

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```
