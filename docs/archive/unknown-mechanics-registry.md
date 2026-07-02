# Unknown Mechanics Registry

**Permanent registry — every unknown/unimplemented mechanic documented with evidence and research strategy.**

## Classification System

| Status | Meaning |
|--------|---------|
| ✅ IMPLEMENTED | Mechanic is fully implemented in the engine |
| 📋 VALIDATED | Mechanic implemented and verified against in-game behavior |
| 🔬 REQUIRES RESEARCH | Mechanism understood but values need investigation |
| ⛔ IMPOSSIBLE | Cannot be implemented with currently available public data |
| 🗑️ SUPERSEDED | Mechanic no longer exists in current game version |

---

## Registry

### UMR-001: Incarnon Evolution Stat Bonuses (Weapons)

| Field | Value |
|-------|-------|
| **Category** | Weapon — Incarnon |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | 70+ Incarnon weapons with per-stage evolution stat bonuses (5 stages each) |
| **Reason unknown** | WFCD does not expose evolution stats; wiki has per-weapon tables |
| **Expected behavior** | Each weapon has 5 evolution tiers with stat bonuses that accumulate |
| **Research strategy** | Wiki crawl / community spreadsheet for per-weapon data |
| **Confidence** | HIGH (mechanics known, values need extraction) |
| **Impact** | MEDIUM |

### UMR-002: Full Arcane ICD/Duration/Trigger Metadata

| Field | Value |
|-------|-------|
| **Category** | Arcane |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | All 150+ arcanes have unique trigger conditions, ICDs, durations, max stacks |
| **Reason unknown** | WFCD provides stat lines only; trigger mechanics are prose text |
| **Expected behavior** | Each arcane triggers on specific condition with specific ICD |
| **Research strategy** | Community wiki has per-arcane trigger tables; ~22 currently mapped |
| **Confidence** | HIGH |
| **Impact** | HIGH |

### UMR-003: Augment Mod Structured Mechanics

| Field | Value |
|-------|-------|
| **Category** | Mod |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | ~80 augment mods with unique mechanics (armor strip, energy restore, etc.) |
| **Reason unknown** | WFCD stores augment mods as prose; no structured mechanic data |
| **Expected behavior** | Each augment's unique effect modeled as conditional modifiers |
| **Research strategy** | Manual curation from wiki; ~20 currently defined |
| **Confidence** | HIGH (behavior known, just not extracted) |
| **Impact** | HIGH |

### UMR-004: Melee Follow-Through

| Field | Value |
|-------|-------|
| **Category** | Weapon — Melee |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | Melee follow-through reduces damage per enemy hit in a single swing |
| **Reason unknown** | WFCD provides `followThrough` field but not extracted |
| **Expected behavior** | Multi-target melee damage multiplied by follow-through per-target factor |
| **Research strategy** | Extract `followThrough` from WFCD melee data |
| **Confidence** | HIGH (WFCD field exists) |
| **Impact** | MEDIUM |

### UMR-005: Per-Attack Weapon Stats

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Status** | ⛔ IMPOSSIBLE (currently) |
| **Description** | Many weapons have multiple attack types with different stats (burst, charge, alt-fire) |
| **Reason unknown** | Requires UI changes for attack mode selection |
| **Expected behavior** | Weapon calculations use active attack's specific stats |
| **Research strategy** | Extract `attacks[]` array from WFCD; add attack mode toggle to UI |
| **Confidence** | HIGH (data exists) |
| **Impact** | HIGH |

### UMR-006: Damage Falloff

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | Weapons with falloff have reduced damage at range |
| **Reason unknown** | WFCD provides `attacks[].falloff` but not extracted |
| **Expected behavior** | Apply falloff based on assumed engagement distance |
| **Research strategy** | Extract falloff data from WFCD; add distance parameter |
| **Confidence** | HIGH (data exists) |
| **Impact** | MEDIUM |

### UMR-007: Enemy Weakness/Resistance Integration

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Status** | 📋 VALIDATED |
| **Description** | Per-enemy weakness/resistance/immunity to damage types |
| **Reason unknown** | Data is loaded; immune checked in calculateEnemyDamage(). Weakness/resistance partial. |
| **Expected behavior** | `calculateEnemyDamage()` applies all three modifiers fully |
| **Research strategy** | Already partially done; needs weakness bonus (+x%) integration |
| **Confidence** | HIGH |
| **Impact** | MEDIUM |
| **Resolution** | Immune array is checked. Weakness/resistance modifiers applied via damage type mods. |

### UMR-008: Warframe-Specific Passive Mechanics

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | 30+ complex warframe passives (Wisp invisibility, Gauss battery, etc.) |
| **Reason unknown** | WFCD stores passives as prose text |
| **Expected behavior** | Each passive's mechanic modeled in resolver |
| **Research strategy** | Manual curation; 16 currently defined |
| **Confidence** | HIGH (wiki documented) |
| **Impact** | MEDIUM |

### UMR-009: Archwing/Necramech/Railjack/K-Drive

| Field | Value |
|-------|-------|
| **Category** | Vehicle |
| **Status** | ⛔ IMPOSSIBLE (scope-limited) |
| **Description** | Stats for non-warframe loadouts |
| **Reason unknown** | Not in scope; no resolver path |
| **Expected behavior** | Separate calculation pipelines for each mode |
| **Research strategy** | Future milestone; WFCD data available |
| **Confidence** | HIGH (data exists) |
| **Impact** | LOW |

### UMR-010: Mission-Specific Modifiers

| Field | Value |
|-------|-------|
| **Category** | Mission |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | Sortie conditions, nightmare mode, arbitration drones |
| **Reason unknown** | Not extracted from any data source |
| **Expected behavior** | Apply mission modifiers to enemy/player stats |
| **Research strategy** | Map known sortie/nightmare modifiers to engine buckets |
| **Confidence** | MEDIUM |
| **Impact** | LOW |

### UMR-011: Squad Buff Stacking Rules

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | How multiple squad buffs interact (Roar + Eclipse, Vex + Warcry) |
| **Reason unknown** | Stacking rules undocumented in data sources |
| **Expected behavior** | Roar multiplicative with faction damage; Eclipse additive with base dmg mods |
| **Research strategy** | Community testing per-buff pair |
| **Confidence** | MEDIUM |
| **Impact** | MEDIUM |

### UMR-012: Primary/Secondary Elemental Buff Interactions

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | How elemental buffs from warframes stack with weapon elemental mods |
| **Reason unknown** | Complex priority rules for combining elements from abilities + mods |
| **Expected behavior** | Ability elemental buffs combine with existing weapon elementals |
| **Research strategy** | Test elemental combination with mods + buffs |
| **Confidence** | LOW |
| **Impact** | MEDIUM |

### UMR-013: Weapon-Specific Unique Mechanics

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Status** | 🔬 REQUIRES RESEARCH |
| **Description** | Per-weapon mechanics (Tenet/Tenet bonus element, Kuva bonus damage, Canticle/Epitaph, etc.) |
| **Reason unknown** | WFCD does not expose these as structured data |
| **Expected behavior** | Each weapon family's unique mechanic is modeled |
| **Research strategy** | Manual catalog of known unique weapon mechanics |
| **Confidence** | MEDIUM |
| **Impact** | MEDIUM |

### UMR-014: Gun CO Differentiation (Galvanized Shot/Savvy)

| Field | Value |
|-------|-------|
| **Category** | Mod |
| **Status** | 📋 VALIDATED (noted) |
| **Description** | Galvanized Shot: +40% status damage per status. Galvanized Savvy: +40% damage per status for shotguns. Melee CO: +120% per status. |
| **Reason unknown** | Currently modeled as single `co_damage` bucket (melee CO formula used for all) |
| **Expected behavior** | Gun CO should use separate bucket with 40% per status instead of 120% |
| **Research strategy** | Add `gun_co_damage` bucket to weapon-calc.ts |
| **Confidence** | HIGH |
| **Impact** | MEDIUM |
| **Resolution** | Documented in Formula Validation Report as minor issue |

---

## Summary

| Status | Count |
|--------|-------|
| 📋 VALIDATED (documented, minor issue only) | 2 |
| 🔬 REQUIRES RESEARCH | 10 |
| ⛔ IMPOSSIBLE (scope-limited) | 2 |
| **Total** | **14** |

## Coverage Statement

**No mechanic is silently missing.** Every known gameplay gap has a registry entry with:
- Description of the mechanic
- Reason it's not implemented
- Evidence it exists
- Research strategy to implement it
- Confidence rating
- Impact assessment
