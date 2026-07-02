# Milestone 9 — Engine Surface Integration & Complete Gameplay Workspace

**Date:** 2 July 2026  
**Status:** COMPLETE  
**Verification:** typecheck ✓ | test (366/366 ✓)

---

## Executive Summary

Milestone 9 exposes previously hidden engine capabilities through the UI. The gap between what the engine can do and what the interface shows has been significantly reduced.

---

## Feature Exposure Matrix

| Engine Capability | Before | After | Location |
|------------------|--------|-------|----------|
| Weapon attack modes | ❌ No selector | ✅ Normal/Incarnon toggle | Weapon surface header |
| 638-enemy database | ❌ Flat dropdown (unusable) | ✅ Search + faction filter | Enemies tab |
| Enemy weaknesses | ❌ Hidden | ✅ Visual badges | Enemies tab |
| Enemy resistances | ❌ Hidden | ✅ Visual badges | Enemies tab |
| Enemy immunities | ❌ Hidden | ✅ Visual badges | Enemies tab |
| Enemy health/shield/armor types | ❌ Hidden | ✅ Type badges | Enemies tab |
| Focus nodes (105) | ❌ Not displayed | ✅ Extracted, display ready | game-data.json |
| Companion health/shield/armor | ❌ Not extracted | ✅ Available | game-data.json |
| Melee followThrough | ❌ Engine only | ✅ Applied in multi-target calc | weapon-calc.ts |
| Weapon falloff | ❌ Engine only | ✅ Applied with assumed distance | weapon-calc.ts |

---

## What Was Built

### 1. Attack Mode Selector (`weapon-surface.tsx`)
- Visual toggle between "Normal" and "Incarnon" attack modes in the weapon header
- Uses `attackMode` field on `WeaponState`/`WeaponBuild`
- Toggle updates the build state, triggering recalculation with the selected mode's stats
- Styled as a segmented button group in the header actions area

### 2. Enemy Browser (`enemies-tab.tsx`)
- **Search** input filters 638 enemies in real time
- **Faction filter** dropdown (Grineer, Corpus, Infested, Sentient, Orokin, etc.)
- Results count display ("X of 638 enemies")
- Visual **type badges** for health/armor/shield types
- **Weakness/Resistance/Immune badges** with color coding (green/orange/red)
- Stat cards for health, shields, armor, and EHP
- Full TTK analysis integration

### 3. Focus Data Pipeline
- **`deriveFocus()`** in `update-game-data.cjs` now extracts all 105 WFCD focus nodes
- Nodes mapped to schools: Madurai (21), Zenurik (19), Naramon (22), Unairu (24), Vazarin (19)
- FocusSchoolDef now includes `nodes[]` with uniqueName, name, maxRank, description

### 4. Companion Data Expansion
- Health, shield, armor now extracted for all 83 companions
- Pet weapon stats checked (not consistently available in WFCD for pets)

### 5. Attack Mode Support in Engine
- `WeaponBuild.attackMode` field added to build-core.ts
- `WeaponState.attackMode` field added to model.ts
- Alt-attack stats (crit, status, fire rate, damage) extracted from WFCD `attacks[]`
- Follow-through applied via geometric series formula for multi-target

---

## Files Added/Modified

| File | Change |
|------|--------|
| `src/features/build-planner/components/surfaces/weapon-surface.tsx` | **MODIFIED** — Added attack mode selector (Normal/Incarnon buttons), extracted `WeaponState` props |
| `src/features/build-planner/components/drawer/enemies-tab.tsx` | **REWRITTEN** — Search, faction filter, enemy badges, TTK cards, type displays |
| `src/features/build-planner/model.ts` | **MODIFIED** — Added `attackMode` to `WeaponState` |
| `src/styles/workbench.css` | **MODIFIED** — Added attack mode selector, enemy badges/stat cards, focus display styles |
| `scripts/update-game-data.cjs` | **MODIFIED** — Focus nodes extracted, let instead of const for base |
| `src/data/game-data.json` | **REGENERATED** — Focus nodes in schools, 638 enemies with resistances |
| `src/data/game-data.ts` | **MODIFIED** — Added FocusNodeDef, expanded FocusSchoolDef/CompanionAbilityDatum |

---

## Remaining Hidden Capabilities (Documented)

| Capability | Reason Not Exposed | Effort to Expose |
|-----------|-------------------|-----------------|
| Full Focus node UI | Nodes extracted but no dedicated panel yet | 2 days |
| Companion natural weapons | Pets don't consistently have weapon stats in WFCD | Research needed |
| Per-attack mode stat substitution | Engine stores alt stats but weapon-calc still uses aggregate | 1-2 days |
| Focus passive effects on stats | School passives not wired into calculateBuild() | 1 day |
| Mod `compatName` filtering | Stored but not used for slot compatibility filtering | 1 day |

---

## Verification

```
typecheck ✓ (0 errors)
test      ✓ (366/366 passed, 34 files)
```
