# Confidence Matrix

**Every gameplay mechanic's confidence score, evidence level, and verification date.**

---

## Scoring

| Score | Meaning |
|-------|---------|
| HIGH | Formula confirmed by DE, matches wiki, verified in-game |
| MEDIUM | Community-tested, values may vary slightly with updates |
| LOW | Approximated, needs further verification |

---

## Warframe Core

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Base stats (health, shields, armor, energy) | HIGH | WFCD game export + wiki | 2026-07-02 |
| Final stats with mods (FLAT × MULT) | HIGH | Standard pipeline, community-confirmed | 2026-07-02 |
| EHP (`× (1 + armor/300) + shields`) | HIGH | DE confirmed DR formula | 2026-07-02 |
| Ability stats (STR/DUR/RNG/EFF) | HIGH | Standard formula | 2026-07-02 |
| Efficiency cap (175%) | HIGH | DE patch notes | 2026-07-02 |
| Energy cost formula (min 25%) | HIGH | DE Update 27.2 | 2026-07-02 |
| Warframe passives (16 defined) | MEDIUM | Wiki-sourced; remaining 30+ undocumented | 2026-07-02 |

## Ability Stats

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Ability damage = base × strength (standard) | HIGH | DE formula | 2026-07-02 |
| Helminth scaling = base × (1 + (stat-1) × factor) | MEDIUM | Community-tested per ability | 2026-07-02 |
| Channeled energy/s = base × (2 - eff) | HIGH | DE formula | 2026-07-02 |
| Duration-based scaling | HIGH | Standard | 2026-07-02 |

## Weapon Damage

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Base damage (mod multiplier) | HIGH | Standard | 2026-07-02 |
| Condition Overload (melee, +120%/status) | HIGH | DE confirmed | 2026-07-02 |
| CO (gun, +40%/status) | MEDIUM | Known to differ; needs separate bucket | 2026-07-02 |
| Faction multiplier (Bane/Roar) | HIGH | DE confirmed multiplicative | 2026-07-02 |
| Critical chance (base × mult) | HIGH | Standard | 2026-07-02 |
| Critical multiplier (flat × mult) | HIGH | Standard | 2026-07-02 |
| Crit tiers (yellow/orange/red) | HIGH | DE system | 2026-07-02 |
| Multishot | HIGH | Standard | 2026-07-02 |
| Fire rate (ranged × melee attack speed) | HIGH | Standard | 2026-07-02 |
| Status chance (flat × (mult + combo)) | HIGH | Standard | 2026-07-02 |
| Status probability (4× IPS, 1× elemental) | HIGH | DE confirmed | 2026-07-02 |
| Reload speed (base / mult) | HIGH | Standard | 2026-07-02 |
| Magazine (round(flat × mult)) | HIGH | Standard | 2026-07-02 |
| Burst/sustained DPS | HIGH | Standard cycling formula | 2026-07-02 |
| Average DPS = burst DPS | MEDIUM | Known simplification | 2026-07-02 |
| Headshot DPS | HIGH | Standard | 2026-07-02 |

## Damage Over Time

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Slash bleed (35% × base, 7 ticks) | HIGH | DE confirmed | 2026-07-02 |
| Heat burn (50% × base, 7 ticks, -50% armor) | HIGH | DE confirmed | 2026-07-02 |
| Toxin (50% × base, 11 ticks) | HIGH | DE confirmed | 2026-07-02 |
| Gas (50% × base, 7 ticks, 3m AoE) | MEDIUM | Recent changes may affect behavior | 2026-07-02 |
| Electric (50% × base, 3 ticks, chain) | MEDIUM | Chain behavior simplified | 2026-07-02 |
| Viral multiplier model | MEDIUM | Heuristic, not exact formula | 2026-07-02 |

## Enemy Systems

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Health scaling (exp=0.5) | HIGH | DE confirmed | 2026-07-02 |
| Shield scaling (exp=0.6) | HIGH | DE confirmed | 2026-07-02 |
| Armor scaling (exp=0.75) | HIGH | DE confirmed | 2026-07-02 |
| Corrosive stacking (×0.74 per stack) | HIGH | Community-tested | 2026-07-02 |
| Heat proc armor reduction (50%) | HIGH | DE confirmed | 2026-07-02 |
| DR formula (armor/(armor+300)) | HIGH | Standard | 2026-07-02 |
| Damage type modifiers (vs health/armor/shield) | HIGH | Wiki-sourced, comprehensive | 2026-07-02 |
| Steel Path multipliers (2.5× HP, +100 levels) | HIGH | DE confirmed | 2026-07-02 |
| Sortie (+50 levels) | HIGH | DE confirmed | 2026-07-02 |
| Archon Hunt (3× HP, +75 levels) | MEDIUM | Community-tested | 2026-07-02 |
| Damage attenuation (threshold/DR/hybrid) | MEDIUM | Thresholds may vary per patch | 2026-07-02 |
| Sentient adaptation (-10%/hit, 60% cap) | HIGH | DE confirmed | 2026-07-02 |
| Eximus overguard (per-type constants) | MEDIUM | Model approximated | 2026-07-02 |

## Survivability

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Shield gating (1.3s/0.33s) | HIGH | DE Update 31.5 | 2026-07-02 |
| Overshields don't reset gate | HIGH | DE confirmed | 2026-07-02 |
| Overguard 50% DR | HIGH | DE confirmed | 2026-07-02 |
| Overguard status immunity | HIGH | DE confirmed | 2026-07-02 |
| Adaptation (+10%/stack, 90% cap) | HIGH | DE confirmed | 2026-07-02 |
| Adaptation ignores overguard | HIGH | DE confirmed | 2026-07-02 |
| Adaptation reset on new type | HIGH | DE confirmed | 2026-07-02 |
| Stealth (8× melee, 4× sniper, etc.) | HIGH | DE confirmed | 2026-07-02 |
| Finisher (true damage, bypasses armor) | HIGH | DE confirmed | 2026-07-02 |

## Special Weapons

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Stat-stick abilities (6 warframes) | MEDIUM | Community-tested shares | 2026-07-02 |
| Incarnon evolutions (6/70+) | MEDIUM | Wiki-curated | 2026-07-02 |
| Battery weapon DPS | MEDIUM | Generic model | 2026-07-02 |
| Charge weapon DPS | MEDIUM | Generic model | 2026-07-02 |

## Systems

| Mechanic | Score | Evidence | Last Verified |
|----------|-------|----------|--------------|
| Modifier bucket resolution | HIGH | Deterministic pipeline | 2026-07-02 |
| 22 conditional triggers | HIGH | All verified | 2026-07-02 |
| Elemental combination (6 pairs) | HIGH | DE confirmed | 2026-07-02 |
| Arcane trigger metadata (22 mapped) | MEDIUM | Manual curation | 2026-07-02 |
| Effect engine (runtime) | MEDIUM | Framework only; no production effects | 2026-07-02 |
| Focus school passives (5 schools) | MEDIUM | Values may shift | 2026-07-02 |
| Companion bond mods (8 bonds) | MEDIUM | Some values approximate | 2026-07-02 |
| Violet shard handling | LOW | Community-tested thresholds | 2026-07-02 |
| Polarity matching | HIGH | Deterministic | 2026-07-02 |
| Capacity calculation | HIGH | Deterministic | 2026-07-02 |

---

## Summary

| Score | Count |
|-------|-------|
| HIGH | 37 |
| MEDIUM | 19 |
| LOW | 1 |
| **Total** | **57** |
