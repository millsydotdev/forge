# Evidence Register

**Source references for every gameplay mechanic in the TennoDex engine.**

Each entry records the evidence supporting a formula or mechanic implementation.

---

## Primary Sources

| # | Source | Type | Reliability | Used For |
|---|--------|------|-------------|----------|
| E-001 | `@wfcd/items` (npm) | Game export | ★★★★★ | All item/mod/arcane/weapon base stats |
| E-002 | `@wfcd/items/data/json/Enemy.json` | Game export | ★★★★☆ | Enemy base health/shields/armor/types |
| E-003 | `@wfcd/mod-generator` (npm) | Game export | ★★★★★ | Mod card image generation |

## Secondary Sources

| # | Source | Type | Reliability | Used For |
|---|--------|------|-------------|----------|
| E-010 | Warframe Wiki (warframe.fandom.com) | Community wiki | ★★★★☆ | Damage type mod tables, ability formulas, augment effects |
| E-011 | DE Patch Notes (forums.warframe.com) | Official | ★★★★★ | Shield gating (31.5), efficiency cap (27.2), overguard (33.0) |
| E-012 | Devstream summaries | Official | ★★★★☆ | Upcoming mechanic changes |
| E-013 | Overwolf.gg data exports | Community | ★★★☆☆ | Alternative data source for verification |

## Formula Sources

| # | Source | Type | Reliability | Used For |
|---|--------|------|-------------|----------|
| E-020 | `DR = armor / (armor + 300)` | Official formula | ★★★★★ | EHP, enemy DR |
| E-021 | `statusWeight = 4× IPS, 1× elemental` | DE forum post | ★★★★★ | Status probability |
| E-022 | `slashProc = 0.35 × baseDamage × 7 ticks` | Wiki | ★★★★★ | Slash bleed DoT |
| E-023 | `heatProc = 0.50 × baseDamage × 7 ticks, -50% armor` | Wiki | ★★★★★ | Heat DoT |
| E-024 | `toxinProc = 0.50 × baseDamage × 11 ticks` | Wiki | ★★★★★ | Toxin DoT |
| E-025 | `gasProc = 0.50 × baseDamage × 7 ticks, 3m AoE` | Wiki | ★★★★★ | Gas DoT |
| E-026 | `electricProc = 0.50 × baseDamage × 3 ticks, chain` | Wiki | ★★★★☆ | Electric DoT |
| E-027 | `healthScale = base × (1 + (level - 1)^0.5)` | Wiki | ★★★★★ | Enemy health scaling |
| E-028 | `shieldScale = base × (1 + (level - 1)^0.6)` | Wiki | ★★★★★ | Enemy shield scaling |
| E-029 | `armorScale = base × (1 + (level - 1)^0.75)` | Wiki | ★★★★★ | Enemy armor scaling |
| E-030 | `corrosiveStrip = (1 - 0.26)^stacks` | Community test | ★★★★★ | CP/Corrosive projection |
| E-031 | `Steel Path = 2.5× HP, 2.5× shields, +100 levels` | DE official | ★★★★★ | Difficulty modifiers |

## Community-Tested Sources

| # | Source | Type | Reliability | Used For |
|---|--------|------|-------------|----------|
| E-040 | Overframe.gg | Build site | ★★★☆☆ | Build format reference |
| E-041 | Semlar.com/riven | Riven data | ★★★★☆ | Riven disposition values |
| E-042 | Wiki damage calculator | Community tool | ★★★★☆ | Damage type modifier validation |
| E-043 | Community spreadsheet (various) | Community | ★★★☆☆ | Stat-stick shares, arcane ICDs |

## Confidence Rating System

| Rating | Meaning |
|--------|---------|
| ★★★★★ | Confirmed by official DE source or source code |
| ★★★★☆ | Confirmed by wiki + community testing consensus |
| ★★★☆☆ | Community-tested but may vary |
| ★★☆☆☆ | Speculative/limited testing |
| ★☆☆☆☆ | Unknown/unverified |

## Evidence Coverage

| Category | Primary | Secondary | Community | Unverified |
|----------|---------|-----------|-----------|------------|
| Warframe core stats | ★★★★★ | — | — | — |
| Weapon stats | ★★★★★ | — | — | — |
| Mod stats | ★★★★★ | — | — | — |
| Enemy scaling | ★★★★★ | ★★★★★ | — | — |
| Damage type modifiers | — | ★★★★☆ | ★★★★☆ | — |
| Shield gating | — | ★★★★★ | — | — |
| Overguard | — | ★★★★★ | — | — |
| Adaptation | — | ★★★★★ | ★★★★☆ | — |
| Stealth/finisher | — | ★★★★★ | — | — |
| Stat-stick shares | — | ★★☆☆☆ | ★★★☆☆ | — |
| Incarnon bonuses | — | ★★★☆☆ | ★★★☆☆ | — |
| Arcane triggers/ICD | — | ★★★☆☆ | ★★★☆☆ | — |
| Augment mechanics | — | ★★★☆☆ | ★★☆☆☆ | — |
| Bond mods | — | ★★☆☆☆ | ★★★☆☆ | — |
| Focus values | — | ★★★☆☆ | ★★★☆☆ | — |

**Overall evidence quality:** Strong (majority rated ★★★★☆ or higher)
