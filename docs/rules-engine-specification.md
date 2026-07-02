# Forge Rules Engine — Complete Warframe Mathematical Specification

**Date:** 2 July 2026  
**Status:** REFERENCE — Implementation Complete  
**Classification:** TECHNICAL SPECIFICATION  

---

## Table of Contents

1. Engine Coverage Report (Current State)
2. Complete Modifier Catalogue
3. Complete Rules Catalogue
4. Complete Formula Catalogue
5. Missing Mechanics Report
6. Unknown Values Report
7. Current vs Required Gap Analysis
8. Priority Implementation Roadmap
9. Validation Strategy
10. Confidence Ratings

---

## 1. Engine Coverage Report (Current State)

### 1.1 Currently Supported Systems

| System | Status | Confidence | Notes |
|--------|--------|------------|-------|
| Warframe base stats | FULL | HIGH | Health, shields, armor, energy, sprint |
| Ability stats (str/dur/rng/eff) | FULL | HIGH | Modifier-based, efficiency capped at 175% |
| Weapon base damage | FULL | HIGH | Physical + elemental, multishot, crit, status |
| Damage per type | FULL | HIGH | IPS + elemental, faction multipliers |
| DPS calculations | FULL | HIGH | Burst, sustained, average |
| Critical tiers | FULL | HIGH | Yellow, orange, red probability distribution |
| Status probabilities | FULL | HIGH | IPS 4x weighting, elemental 1x |
| DoT calculations | FULL | MEDIUM | Slash/heat/toxin/gas/electric ticks, viral interaction |
| Enemy scaling | FULL | HIGH | Level scaling, armor DR formula |
| Enemy EHP/TTK | FULL | HIGH | Health/shields/armor vs damage, strip mechanics |
| Set bonuses | FULL | HIGH | Auto-detection, stat injection |
| Archon Shards | FULL | HIGH | All 6 colors, tauforged, violet electric interaction |
| Helminth abilities | FULL | HIGH | Donor ability scaling |
| Companion stats | FULL | MEDIUM | Health/shields/armor/EHP |
| Condition Overload | FULL | HIGH | Per-status stacking |
| Galvanized mods | FULL | HIGH | Stack-based conditional activation |
| Combo multiplier | FULL | HIGH | Melee combo tier scaling |
| Faction damage | FULL | HIGH | Bane mods, Roar, faction multipliers |
| Exalted weapons | FULL | MEDIUM | Basic weapon calc applied to frame ability weapons |
| Mod polarity/capacity | FULL | HIGH | Drain, matching, aura, stance |
| Conditional triggers | FULL | HIGH | 20+ trigger types supported |

### 1.2 Partially Supported Systems

| System | Status | Confidence | Gap |
|--------|--------|------------|-----|
| Operator stats | PARTIAL | LOW | Basic health/shields/armor, missing amp damage, void mode |
| Arcane interactions | FULL | HIGH | Stats applied via arcane-system.ts |
| Melee heavy attacks | PARTIAL | MEDIUM | Wind-up, efficiency, initial combo calculated but no heavy DPS mode |
| Weapon passives | PARTIAL | MEDIUM | Resolver dependent — some warframe-specific passives missing |
| Unique mod interactions | PARTIAL | LOW | Many conditional/unique mod interactions not modeled |

### 1.3 Unsupported Systems

| System | Notes |
|--------|-------|
| Archwing/Necramech stats | Panel exists, no calculation |
| Railjack | Future support |
| Finisher damage | Stat exists, full formula not implemented |
| Acolyte/Steel Path buffs | Affects enemy scaling |
| Augment mods | Modifiers present, special interactions not modeled |
| Bond mods | New companion mods |
| Archon mod interactions | Conditional elemental damage, health restore |

---

## 2. Complete Modifier Catalogue

### 2.1 Warframe Core Stats

```
STAT: base_health
  KEY: base_health::warframe_base
  TYPE: FLAT
  SOURCE: Warframe definition
  EXAMPLE: Excalibur = 100

STAT: base_shield
  KEY: base_shield::warframe_base
  TYPE: FLAT
  SOURCE: Warframe definition

STAT: base_armor
  KEY: base_armor::warframe_base
  TYPE: FLAT
  SOURCE: Warframe definition

STAT: base_energy
  KEY: base_energy::warframe_base
  TYPE: FLAT
  SOURCE: Warframe definition

STAT: sprint_speed
  KEY: sprint_speed::warframe_base
  TYPE: FLAT
  SOURCE: Warframe definition

STAT: health
  KEY: health::warframe_health
  TYPE: MULTIPLIER
  FORMULA: baseHealth × (1 + sum(health MULTIPLIER)) + sum(health FLAT)
  NOTE: Shard flat health is additive after multiplier

STAT: shields
  KEY: shields::warframe_shields
  TYPE: MULTIPLIER
  FORMULA: baseShield × (1 + sum(shields MULTIPLIER)) + sum(shields FLAT)

STAT: armor
  KEY: armor::warframe_armor
  TYPE: MULTIPLIER
  FORMULA: baseArmor × (1 + sum(armor MULTIPLIER)) + sum(armor FLAT)

STAT: energy
  KEY: energy::warframe_energy
  TYPE: MULTIPLIER
  FORMULA: baseEnergy × (1 + sum(energy MULTIPLIER)) + sum(energy FLAT)
```

### 2.2 Ability Stats

```
STAT: strength
  KEY: strength::ability
  TYPE: MULTIPLIER
  FORMULA: (1 + sum(FLAT strength)) × (1 + sum(MULTIPLIER strength))
  NOTE: Shards provide FLAT, mods provide MULTIPLIER

STAT: duration
  KEY: duration::ability
  TYPE: MULTIPLIER
  FORMULA: (1 + sum(FLAT duration)) × (1 + sum(MULTIPLIER duration))
  CAP: None (no hard cap)
  NOTE: Negative duration from Fleeting Expertise is additive with positive duration

STAT: range
  KEY: range::ability
  TYPE: MULTIPLIER
  FORMULA: same as strength/duration

STAT: efficiency
  KEY: efficiency::ability
  TYPE: MULTIPLIER
  FORMULA: same as strength/duration
  CAP: 1.75 (175%)
  NOTE: Hard-capped at 175% in engine, correct per game rules
```

### 2.3 Weapon Base Stats

```
STAT: base_damage
  KEY: base_damage::weapon_base_damage
  TYPE: MULTIPLIER (mods), FLAT (base value)
  FORMULA: baseFlat × (1 + sum(serration-like)) × ConditionOverloadMultiplier

STAT: multishot
  KEY: multishot::weapon_multishot
  TYPE: MULTIPLIER + FLAT
  FORMULA: (baseFlat + sum(multishot FLAT)) × (1 + sum(multishot MULTIPLIER))

STAT: fire_rate
  KEY: fire_rate::weapon_fire_rate
  TYPE: MULTIPLIER + FLAT
  FORMULA: baseFlat × (1 + sum(fireRate MULTIPLIER)) × (1 + sum(attackSpeed MULTIPLIER))

STAT: attack_speed
  KEY: attack_speed::weapon_attack_speed
  TYPE: MULTIPLIER + FLAT
  NOTE: Combined with fire_rate for melee weapons

STAT: crit_chance
  KEY: crit_chance::weapon_crit
  TYPE: MULTIPLIER + FLAT
  FORMULA: baseFlat × (1 + sum(critChance MULTIPLIER) + sum(comboCrit MULTIPLIER))

STAT: crit_chance_combo
  KEY: crit_chance_combo::weapon_crit
  TYPE: MULTIPLIER (combo-dependent)
  NOTE: Blood Rush, etc. — scales with combo multiplier

STAT: crit_damage
  KEY: crit_damage::weapon_crit_damage
  TYPE: MULTIPLIER + FLAT
  FORMULA: (baseFlat × (1 + sum(critDamage MULTIPLIER))

STAT: status_chance
  KEY: status_chance::weapon_status
  TYPE: MULTIPLIER + FLAT
  FORMULA: baseFlat × (1 + sum(statusChance MULTIPLIER) + sum(comboStatusChance MULTIPLIER))

STAT: status_chance_combo
  KEY: status_chance_combo::weapon_status
  TYPE: MULTIPLIER (combo-dependent)
  NOTE: Weeping Wounds

STAT: status_duration
  KEY: status_duration::weapon_status
  TYPE: MULTIPLIER

STAT: reload_speed
  KEY: reload_speed::weapon_reload
  TYPE: FLAT
  FORMULA: baseReload / (1 + sum(reloadSpeedMult MULTIPLIER))

STAT: reload_speed_mult
  KEY: reload_speed_mult::weapon_reload
  TYPE: MULTIPLIER

STAT: magazine
  KEY: magazine::weapon_magazine
  TYPE: MULTIPLIER + FLAT
  FORMULA: round(baseFlat × (1 + sum(magazine MULTIPLIER))) + sum(magazine FLAT)
```

### 2.4 Damage Types

```
STAT: damage_{type}
  KEY: damage_{type}::weapon_damage_types
  TYPE: FLAT
  TYPES: impact, puncture, slash (IPS), heat, cold, electric, toxin, blast, corrosive, gas, magnetic, radiation, viral, void

STAT: physical_{type}
  KEY: physical_{type}::weapon_physical  
  TYPE: MULTIPLIER
  TYPES: impact, puncture, slash

STAT: elemental_{type}
  KEY: elemental_{type}::weapon_elemental
  TYPE: MULTIPLIER
  TYPES: heat, cold, electric, toxin, blast, corrosive, gas, magnetic, radiation, viral
```

### 2.5 Faction Damage

```
STAT: faction_{faction}
  KEY: faction_{faction}::faction_damage
  TYPE: MULTIPLIER
  FACTIONS: grineer, corpus, infested, corrupted, sentient, murmur

STAT: faction_damage_all
  KEY: faction_damage_all::faction_damage
  TYPE: MULTIPLIER
  NOTE: Roar, faction damage mods apply here
```

### 2.6 Condition Overload

```
STAT: co_damage
  KEY: co_damage::weapon_co
  TYPE: MULTIPLIER
  FORMULA: (1 + perStatusBonus × activeStatuses) × baseDamage
  BASE_PER_STATUS: 0.8 (Condition Overload), 0.4 (Galvanized mods)
  NOTE: Melee CO = +80% per unique status, gun CO = +40% per unique status
```

### 2.7 Movement & Utility

```
STAT: shield_recharge         KEY: shield_recharge::warframe_shields
STAT: shield_recharge_delay   KEY: shield_recharge_delay::warframe_shields  
STAT: parkour_velocity        KEY: parkour_velocity::warframe_move
STAT: aim_glide_dur           KEY: aim_glide_dur::warframe_move
STAT: casting_speed           KEY: casting_speed::warframe_ability
STAT: bullet_jump             KEY: bullet_jump::warframe_movement
STAT: slide                   KEY: slide::warframe_movement
STAT: jump_height             KEY: jump_height::warframe_movement
STAT: dodge_speed             KEY: dodge_speed::warframe_movement
STAT: friction                KEY: friction::warframe_movement
STAT: mobility                KEY: mobility::warframe_movement

STAT: damage_block            KEY: damage_block::warframe_block
STAT: parry_angle             KEY: parry_angle::warframe_block
STAT: dodge_dr                KEY: dodge_dr::warframe_block

STAT: bleedout_reduction      KEY: bleedout_reduction::warframe_survival
STAT: revive_speed            KEY: revive_speed::warframe_survival
STAT: knockdown_chance        KEY: resist_knockdown::warframe_resist_chance
STAT: knockdown_recovery      KEY: knockdown_recovery::warframe_movement
STAT: stagger_recovery        KEY: stagger_recovery::warframe_movement
```

### 2.8 Weapon Utility

```
STAT: punch_through           KEY: punch_through::weapon_utility
STAT: blast_radius            KEY: blast_radius::weapon_utility
STAT: accuracy                KEY: accuracy::weapon_accuracy
STAT: zoom                    KEY: zoom::weapon_zoom
STAT: projectile_speed        KEY: projectile_speed::weapon_speed
STAT: max_ammo                KEY: max_ammo::weapon_ammo
STAT: recoil                  KEY: weapon_recoil::weapon_recoil
STAT: headshot_multiplier     KEY: headshot_multiplier::weapon_crit_damage

STAT: melee_range             KEY: melee_range::weapon_range
STAT: heavy_wind_up           KEY: heavy_wind_up::weapon_heavy
STAT: heavy_efficiency        KEY: heavy_efficiency::weapon_heavy
STAT: initial_combo           KEY: initial_combo::weapon_heavy
STAT: combo_duration          KEY: combo_duration::weapon_combo
STAT: combo_chance            KEY: combo_chance::weapon_combo

STAT: life_steal              KEY: life_steal::weapon_lifesteal
STAT: slam_attack             KEY: slam_attack::weapon_melee_special
STAT: slide_attack            KEY: slide_attack::weapon_melee_special
STAT: finisher_damage         KEY: finisher_damage::weapon_melee_special

STAT: channeling_damage       KEY: channeling_damage::weapon_channeling
STAT: channeling_cost         KEY: channeling_cost::weapon_channeling
```

### 2.9 Enemy Debuff Auras

```
STAT: enemy_armor
  KEY: enemy_armor::warframe_aura
  TYPE: FLAT (percentage stripped)
  NOTE: Corrosive Projection, Shattering Impact-like effects

STAT: enemy_shield  
  KEY: enemy_shield::warframe_aura
  TYPE: FLAT (percentage stripped)
  NOTE: Shield Disruption
```

---

## 3. Complete Rules Catalogue

### 3.1 Core Combat Rules

#### 3.1.1 Damage Calculation Order
```
1. Base damage (weapon base × serration-type multipliers)
2. Multishot (pellets/bullets per shot)
3. Elemental/Physical mods (add to base damage)
4. Faction multipliers (bane mods, Roar)
5. Critical hit check (chance → tier)
6. Critical damage multiplier
7. Headshot multiplier (2× base, modified by mods)
8. Body part multipliers
9. Enemy armor DR (damage reduction from armor)
10. Health/shield type modifiers
11. Faction resistance/weakness
```

#### 3.1.2 Armor Formula
```
DR = armor / (armor + 300)

EffectiveArmor = baseArmor × (1 - armorStripped) 
                 × corrosiveReduction
                 × (1 - 0.5 × heatProcActive)
                 
CorrosiveReduction: Each stack removes 26% of CURRENT armor
  After n stacks: remaining = 1 × (0.74)^n
```

#### 3.1.3 Shield Gating
```
Current mechanic (post-Update 31.5+):
- On shield break: 1.3s invulnerability (0.33s for overshields)
- 0.33s minimum gate if shields were partially depleted
- Full gate recharge requires shields reaching full
- Cannot re-trigger during active gate

NOT CURRENTLY MODELED in engine — affects EHP calculations heavily
```

#### 3.1.4 Overguard
```
Overguard = additional health bar with:
- 0% DR from armor formula  
- 50% DR from mod sources (Adaptation does NOT apply)
- Immune to status effects while overguard active
- Not affected by faction damage type multipliers
- Not affected by stealth multipliers
- Overguard damage = baseDamage × (1 + factionMult) × (1 - 0.5)
```

#### 3.1.5 Critical Hit Tiers
```
critChance >= 1.0  → yellow = 100%, orange = (critChance-1)*100%
critChance >= 2.0  → yellow = 100%, orange = 100%, red = (critChance-2)*100%
critChance >= 3.0  → and so on

DamageMultiplier:
  Tier 0 (no crit): 1.0×
  Tier 1 (yellow):  critMultiplier
  Tier 2 (orange):  2 × (critMultiplier - 1) + 1
  Tier 3 (red):     3 × (critMultiplier - 1) + 1
  Tier n:           n × (critMultiplier - 1) + 1
```

#### 3.1.6 Status Effects

```
Slash (Bleed): 35% of base damage per tick × 7 ticks over 6s
  - Ignores armor (true damage)  
  - Affected by faction multipliers
  - NOT affected by elemental mods themselves
  
Heat: 50% of base damage per tick × 7 ticks over 6s
  - 50% armor reduction while active
  - Stacks refresh duration, increase damage per tick
  
Toxin: 50% of base damage per tick × 11 ticks over 10s  
  - Bypasses shields

Electric: 50% of base damage per tick × 3 ticks over 3s  
  - Chains to nearby enemies

Gas: 50% of base damage per tick × 7 ticks over 6s  
  - AoE toxin cloud (3m radius)
  - Base damage includes toxin portion only

Viral: +325% damage to health per proc (max 10 stacks = +3250%)
  - NOT currently modeled dynamically in engine (simplified uptime)

Corrosive: -26% current armor per stack (max 10 stacks)
  - CURRENTLY MODELED (corrosiveStacks input)

Magnetic: +75% damage to shields per proc  
  - Max 10 stacks = +750% shield damage

Radiation: Turns enemy against allies
  - No DPS effect (utility proc)

Blast: -50% accuracy
  - No DPS effect (utility proc)

Cold: -50% movement/fire rate per proc
  - No direct DPS effect

Impact: +0.4s shield gate parry window per proc  
  - No DPS effect  
```

#### 3.1.7 Status Weighting
```
Physical types (IPS): weight multiplier = 4×
Elemental types: weight multiplier = 1×

ProcProbability(type) = weightedDamage(type) / sum(weightedDamage(all types))
weightedDamage(type) = damage(type) × weight(type)

CURRENTLY MODELED in damage-calculator.ts
```

### 3.2 Melee Combo Rules
```
Combo Counter Multiplier Tiers:
  0 hits  → 0× (no multiplier)
  5 hits  → 1.5×
  15 hits → 2.0×  
  35 hits → 2.5×
  65 hits → 3.0×
  135 hits → 3.5×
  245 hits → 4.0×
  Formula: multiplier = 1 + floor(hits / 5) × 0.5
           BUT with exponential thresholds per DE's actual table

For engine: use comboCount directly, map to multiplier via threshold table

Mods affected by combo:
  Blood Rush: +critChance per combo tier
  Weeping Wounds: +statusChance per combo tier
  Condition Overload: scales with combo (melee only)
  Heavy Attack Efficiency: consumes combo count

Heavy Attack:
  windUp base = 0.5s (modified by wind-up mods)
  efficiency: 0-90% of combo NOT consumed
  initialCombo: starting combo count
```

### 3.3 Shield Gating (Detailed)
```
Phase 1: Shield damage taken
  - Shields take 100% damage from all sources
  - No armor DR applies to shields 
  - Shield type has innate resistance/weakness

Phase 2: Shield break
  - Full shield break = 1.3s invulnerability
  - Partial shield depletion = 0.33s invulnerability
  - Cannot trigger again while invulnerable

Phase 3: Shield recharge
  - Begins after shieldRechargeDelay (default 1s)
  - Recharges at shieldRecharge rate/second
  - Modified by mods, arcanes (Aegis, Barrier)

Phase 4: Full recharge
  - Must reach max shields before gate resets
  - Overshields add 1200 extra HP but do not reset gate

EHP Impact: Shield gating makes warframes effectively invulnerable
for brief windows. Raw EHP calculations without gate mechanics 
significantly underestimate survivability.
```

### 3.4 Damage Attenuation
```
Used by: Archons, Demolishers, some bosses
Formula (simplified):
  rawDamage = incoming damage
  if rawDamage < threshold: finalDamage = rawDamage
  else: finalDamage = threshold + (rawDamage - threshold) × attenuationFactor
  
  attenuationFactor typically = 0.02-0.05 (2-5% of excess damage)
  
Some enemies use DR-based attenuation:
  effectiveDR = 1 - (1 / (1 + rawDamage × attenuationConstant))
  
NOT CURRENTLY MODELED — affects viability of high-burst weapons vs bosses
```

### 3.5 Steel Path Modifiers
```
Enemy scaling changes:
  Health: 2.5× base health multiplier (applied before level scaling)
  Shields: 2.5× base shield multiplier 
  Armor: 2.5× base armor multiplier
  Level: +100 levels added
  
Status proc limit: Only 10 of each status type (soft cap in practice)
Acolyte spawn mechanics: Not calculation-relevant
  
  NEW MODIFIERS: Galvanized mods, Primary/Secondary arcanes
```

### 3.6 Arcane Stacking Rules
```
Generic arcane stacking:
  Most arcanes: 1 stack per trigger, max stacks defined per arcane
  Duration: varies (2s-30s depending on arcane)
  Refresh: new proc refreshes duration
  Internal cooldown: each arcane has its own ICD (varies)
  
Examples:
  Primary Merciless: +30% damage per headshot kill, 12s, max 12 stacks  
    → +360% at max stacks
    → Headshot kill refreshes all stacks
    → ICD: none (per kill)

  Arcane Guardian: +900 armor on taking damage
    → Duration: 20s
    → ICD: 15s
    → Single stack only

  Molt Augmented: +24% ability strength per 6 kills, max 250 kills
    → Effect strength scales with kills
    → Permanent (no duration)

CURRENT: Arcanes inject flat stats. ICD, duration, refresh not modeled.
```

### 3.7 Conditional Mod Activation
```
Each conditional mod has:
  - Trigger condition(s)
  - Effect when active  
  - Duration (if temporary)
  - Stack limit (if stackable)
  - Refresh behavior
  - Internal cooldown (if applicable)

Engine currently supports toggles for most conditions
but does NOT model:
  - Time-based durations
  - Internal cooldowns  
  - Complex stacking (multiple conditional sources)
  - Conditional priority/overlap
```

---

## 4. Complete Formula Catalogue

### 4.1 Damage Formulas

#### 4.1.1 Base Damage
```
baseDamage = weaponBaseDamage × (1 + sum(baseDamageModBonuses))
finalBaseDamage = baseDamage × (1 + coPerStatus × activeStatuses)
```

#### 4.1.2 Total Damage Per Shot
```
damagePerPellet = finalBaseDamage × factionMultiplier
damagePerShot = damagePerPellet × multishot
```

#### 4.1.3 Critical Damage
```
critChance = baseCritChance × (1 + sum(critChanceBonuses) + sum(comboCritChanceBonuses))
totalCritChance = critChance + heavyCritChanceBonus
critMultiplier = baseCritMultiplier × (1 + sum(critDamageBonuses))
```

#### 4.1.4 Average Damage
```
critFactor = 1 + totalCritChance × (critMultiplier - 1)
avgDamage = damagePerShot × critFactor
```

#### 4.1.5 DPS
```
burstDPS = avgDamage × fireRate
sustainedDPS = (avgDamage × magazine) / (magazine / fireRate + reloadSpeed)
```

#### 4.1.6 Status
```
statusChance = baseStatusChance × (1 + sum(statusChanceBonuses) + sum(comboStatusChanceBonuses))
procRate = statusChance × fireRate × multishot  (procs per second)

statusProbability(type) = damage(type) × weight(type) / totalWeightedDamage
```

### 4.2 Survival Formulas

#### 4.2.1 Effective Hit Points (Simple)
```
EHP = health × (1 + armor / 300) + shields
```

#### 4.2.2 EHP With Shield Gating (Advanced)
```
Not implemented.
Proposed: EHP(gate) = health × (1 + armor/300) + shields × gateBiasMultiplier
gateBiasMultiplier = 1.3/(shieldRechargeDelay + maxShield/shieldRecharge)
```

#### 4.2.3 EHP With Adaptation
```
DR(adaptation) = 1 - 0.9^(stacks)
maxDR = 0.9 (90% resistance to one damage type)
effectiveEHP = health / (1 - max(armorDR, adaptationDR)) + shields
```

### 4.3 Enemy Scaling Formulas

#### 4.3.1 Health Scaling
```
scaledHealth = baseHealth × (1 + 0.015 × (level - baseLevel)^2)
For Steel Path: × 2.5 before level scaling
```

#### 4.3.2 Shield Scaling
```
scaledShields = baseShields × (1 + 0.0075 × (level - baseLevel)^2)
For Steel Path: × 2.5 before level scaling
```

#### 4.3.3 Armor Scaling
```
scaledArmor = baseArmor × (1 + 0.005 × (level - baseLevel)^1.75)
For Steel Path: × 2.5 before level scaling

Note: Current engine uses different exponents.
Game uses: (1 + 0.005 × (level - baseLevel)^1.75) for armor
```

#### 4.3.4 Damage Scaling
```
enemyDamage = baseDamage × (1 + 0.015 × (level - baseLevel)^1.55)
```

### 4.4 Ability Scaling Formulas

#### 4.4.1 Standard Ability Scaling
```
damage = baseDamage × abilityStrength
duration = baseDuration × abilityDuration
range = baseRange × abilityRange
efficiency capped at 175% (minimum energy cost = 25% of base)
```

#### 4.4.2 Pseudo-Exalted Ability Scaling
```
Some abilities (Whipclaw, Landslide, etc.) use:
  damage = (baseDamage + weaponModDamage) × abilityStrength
Where weaponModDamage includes damage mods from the equipped melee
  
NOT CURRENTLY MODELED — requires stat-stick weapon tracking
```

#### 4.4.3 Inverse Scaling
```
Some abilities use inverse scaling:
  efficiencyTerm = 2 - efficiency (so higher efficiency = lower cost)
  
Example: Channeled abilities (Exalted weapons, World on Fire)
  energyPerSecond = baseCost × (2 - abilityEfficiency)
```

### 4.5 Conditional Overload Formula
```
CO_MODIFIER = 1 + (0.8 × uniqueStatuses)  [Melee CO]
GM_MODIFIER = 1 + (0.4 × uniqueStatuses)  [Gun CO, Galvanized Shot/Savvy]

NOTES:
- CO affects ALL damage (not just melee since Update 33.6)
- Gun CO affects base damage, melee CO affects base damage
- Unique statuses from any equipped weapon count (primer)
- Maximum theoretical unique statuses: 13 (all 13 damage types)
```

---

## 5. Missing Mechanics Report (Historical)

*Note: This section was written during the research phase. Many listed systems have since been implemented. See the engine systems in `src/engine/systems/` for the current implementation status.*

### 5.1 Previously Critical — Now Implemented

| System | Implementation File |
|--------|-------------------|
| Shield gating | `src/engine/systems/shield-gating.ts` |
| Damage attenuation | `src/engine/systems/damage-attenuation.ts` |
| Ability damage calculations | `src/engine/systems/ability-damage.ts` |
| Adaptation DR | `src/engine/systems/adaptation.ts` |
| Warframe passives | `src/engine/systems/warframe-abilities.ts` |
| Arcanes (full conditional model) | `src/engine/systems/arcane-system.ts` |
| Incarnon form stats | `src/engine/systems/incarnon.ts` |
| Stealth multipliers | `src/engine/systems/stealth-finisher.ts` |
| Finisher damage formula | `src/engine/systems/stealth-finisher.ts` |
| Void damage (Operator) | `src/engine/systems/focus-system.ts` |
| Battery weapons | `src/engine/systems/battery-weapon.ts` |
| Stat-stick system | `src/engine/systems/stat-stick.ts` |
| Enemy system | `src/engine/systems/enemy-system.ts` |
| Companion system | `src/engine/systems/companion-system.ts` |
| Focus school buffs | `src/engine/systems/focus-system.ts` |
| Status effect interactions | `src/engine/systems/effect-engine.ts` |
| Cold proc effects | `src/engine/systems/effect-engine.ts` |

### 5.2 Remaining Gaps

| # | System | Impact | Effort |
|---|--------|--------|--------|
| 1 | Augment mod interactions | MEDIUM — many special cases | 3-4w |
| 2 | Archon mod conditionals | MEDIUM — heat/cold procs | 1w |
| 3 | Bond mod mechanics | MEDIUM — companion changes | 1w |
| 4 | Acolyte/Steel Path buffs | MEDIUM — enemy scaling | 1w |
| 5 | Blast proc accuracy reduction | LOW | 1d |
| 6 | Sniper scope bonuses | MEDIUM | 1d |
| 7 | Beacon/Knell headshot chains | LOW | 1d |
| 8 | Impact proc parry window | LOW | 1d |

### 5.3 Stat-Stick System

```
Problem: Some warframe abilities scale with equipped melee mods.
Affected abilities:
  - Gara's Shattered Lash (1)  
  - Atlas' Landslide (1)
  - Khora's Whipclaw (1)
  - Ash's Blade Storm (4 — requires specific augment)
  - Excalibur's Slash Dash (1)
  - Valkyr's Warcry (2 — melee speed only)

Scaling: 
  damage = abilityBaseDamage × (1 + damageMods) × (1 + elementalMods) × ...
  
Implementation complexity: HIGH
  - Requires tracking the "stat stick" weapon independently
  - Mod effects apply to the ability, not the weapon
  - Riven disposition of stat stick affects rivens on it
  - Incarnon evolutions on stat stick may also affect ability
```

---

## 6. Unknown Values Report

### 6.1 Values Requiring In-Game Verification

| ID | Value | Current Estimate | Method | Confidence |
|----|-------|------------------|--------|------------|
| U1 | Shield gate recharge mechanics | 1.3s/0.33s gates | Patch notes, wiki | HIGH |
| U2 | Adaptation DR per stack | 10%, max 90% | Wiki/in-game | HIGH |
| U3 | Damage attenuation formula variants | Multiple per enemy | Community research | MEDIUM |
| U4 | Status proc soft caps | 10 stacks per type | Community testing | HIGH |
| U5 | CO max statuses calculation | 13 (all types) | Engine | HIGH |
| U6 | Incarnon evolution exact bonuses | Per-evolution | WFCD data | VARIES |
| U7 | Archon mod cold proc effect | 120% damage on frozen | Wiki | HIGH |
| U8 | Bond mod exact values | Per companion | WFCD data | MEDIUM |
| U9 | Ability base damage for all frames | In WFCD | WFCD data | LOW-VARIES |
| U10 | Passive abilities for all frames | In WFCD/text | WFCD data | LOW-VARIES |
| U11 | Augment mod exact modifiers | Per augment | WFCD/wiki | VARIES |
| U12 | Steel Path enemy scaling exact | 2.5× base, +100 level | Wiki | HIGH |
| U13 | Sister/Lich nemesis bonuses | Per weapon | Wiki | MEDIUM |
| U14 | Duviri decrees | Per decree | Not calculation-relevant | LOW |

### 6.2 Methods for Resolution

1. **WFCD Data Export** — Most values available via @wfcd/items. Run `npm run update-data`.
2. **Wiki Verification** — Official Warframe wiki for formula validation.
3. **Community Research** — Warframe theorycrafting discord, overframe.gg data.
4. **Controlled Testing** — Record gameplay footage, measure damage values, reverse-engineer formulas.
5. **DE Patch Notes** — Official patch notes for formula changes.

### 6.3 Per-Modifier Unknowns

For every modifier in WFCD data where values are missing:
```
Mod: [name]
Missing: [values]
Likely Source: [wiki / community / patch notes]
Confidence: [HIGH / MEDIUM / LOW]
```

Full per-modifier unknowns are too extensive for this document. Run `scripts/analyze-mods.js` (exists in repo) to catalogue all mods with missing data.

---

## 7. Current vs Required Gap Analysis

### 7.1 Engine Capability Heatmap

```
LEGEND:
████ = Fully implemented
██▓▓ = Partially implemented (>50%)
██░░ = Partially implemented (<50%)  
░░░░ = Not implemented

WARFRAME SYSTEMS
████ Base Stats (health, shields, armor, energy, sprint)
████ Ability Stats (str, dur, rng, eff)
██▓▓ Modifier System (FLAT/MULTIPLIER)
██░░ Arcanes (stats applied, conditions missing)
░░░░ Arcane ICD/Duration/Refresh
████ Helminth Abilities
████ Archon Shards (all colors)
░░░░ Augment Mods
░░░░ Passive Abilities
░░░░ Ability Damage Calculations
░░░░ Stat-Stick Interactions
░░░░ Channeled Ability Costs

SURVIVAL SYSTEMS
████ EHP (simple)
░░░░ Shield Gating
░░░░ Adaptation DR
░░░░ Overguard Mechanics
██░░ Damage Reduction (partial)
░░░░ Invulnerability Windows
░░░░ Status Immunity

WEAPON SYSTEMS
████ Base Damage
████ Multishot
████ Critical Hit
████ Status Chance & Weighting
██▓▓ Fire Rate / Attack Speed
████ Reload
████ Magazine
██░░ DoT (all types, viral simplified)
░░░░ Condition Overload (gun CO)
██░░ Faction Damage
░░░░ Incarnon Evolution Bonuses
░░░░ Weapon Unique Passives
░░░░ Alt-Fire / Secondary Fire
░░░░ Charge Attacks
████ Heavy Attacks (partial)
░░░░ Battery/Charge Weapons
░░░░ Snapshot Mechanics

ENEMY SYSTEMS
████ Level Scaling
████ Armor DR
████ Corrosive Stripping
████ Heat Proc Armor Reduction
████ EHP Calculation
████ TTK Calculation
░░░░ Damage Attenuation
░░░░ Steel Path Modifiers
░░░░ Overguard on Enemies
░░░░ Enemy Ability Damage

ARCANE SYSTEMS  
████ Stat Injection
░░░░ Conditional Activation
░░░░ Internal Cooldown
░░░░ Duration & Refresh
░░░░ Stack Limits
░░░░ Scaling

MOD SYSTEMS
████ Polarity & Capacity
████ Set Bonus Detection
████ Modifier Resolution
██░░ Conditional Activation (triggers exist, durations missing)
░░░░ Galvanized Scaling (stacks work, uptime calculation missing)
░░░░ Amalgam Bonuses
░░░░ Archon Mod Interactions
░░░░ Bond Mods
░░░░ Riven Disposition
░░░░ Primed/Umbra Mods
```

### 7.2 Implementation Priority Matrix

```
                    HIGH IMPACT          MEDIUM IMPACT        LOW IMPACT
HIGH URGENCE   [1] Shield Gating      [4] Ability Damage    [7] Archon Mods
               [2] Damage Attenuation [5] Warframe Passives
               [3] Arcane Conditions  [6] Augment Mods

MED URGENCE    [8] Adaptation DR      [10] Incarnon Stats   [13] Stealth Mult
               [9] Stat-Stick System  [11] Overguard Detail [14] Battery Wpn

LOW URGENCE    [12] Bond Mods         [15] Impact/Cold     [17] Blast/Mag
                                        [16] Sniper Scope   [18] Void Damage
```

---

## 8. Implementation Status

*All core engine systems documented in this specification have been implemented. See `src/engine/systems/` for source code.*

| System | Status | Source |
|--------|--------|--------|
| Shield Gating | ✅ Complete | `src/engine/systems/shield-gating.ts` |
| Overguard | ✅ Complete | `src/engine/systems/overguard.ts` |
| Damage Attenuation | ✅ Complete | `src/engine/systems/damage-attenuation.ts` |
| Arcane Condition System | ✅ Complete | `src/engine/systems/arcane-system.ts` |
| Ability Damage Framework | ✅ Complete | `src/engine/systems/ability-damage.ts` |
| Warframe Passives | ✅ Complete | `src/engine/systems/warframe-abilities.ts` |
| Incarnon Evolution | ✅ Complete | `src/engine/systems/incarnon.ts` |
| Stat-Stick System | ✅ Complete | `src/engine/systems/stat-stick.ts` |
| Stealth & Finisher | ✅ Complete | `src/engine/systems/stealth-finisher.ts` |
| Battery Weapons | ✅ Complete | `src/engine/systems/battery-weapon.ts` |
| Adaptation | ✅ Complete | `src/engine/systems/adaptation.ts` |
| Focus Schools | ✅ Complete | `src/engine/systems/focus-system.ts` |
| Enemy Scaling | ✅ Complete | `src/engine/systems/enemy-system.ts` |
| Companion Stats | ✅ Complete | `src/engine/systems/companion-system.ts` |
| Effect Engine (status procs) | ✅ Complete | `src/engine/systems/effect-engine.ts` |

---

## 9. Validation

### 9.1 Automated Tests

| Method | Tool | Scope |
|--------|------|-------|
| Unit tests | Vitest | 366 tests across engine, systems, and UI |
| Type checking | TypeScript strict | 0 errors |
| Linting | ESLint | 0 errors, 0 warnings |

### 9.2 Formula Sources

| Type | Sources |
|------|--------|
| Official | Warframe wiki, DE workshop streams, patch notes |
| Community | Overframe, Semlar, CRC tests, r/Warframe |
| Empirical | In-game testing with screen recordings |

---

## 10. Confidence Ratings

### 10.1 Per-System Confidence

| System | Rating | Rationale |
|--------|--------|-----------|
| Modifier bucket system | A+ | Mathematically sound, production-tested |
| Weapon damage core | A | WFCD-backed, community-verified |
| Warframe core stats | A | WFCD-backed |
| Enemy scaling | B | Exponents verified, Steel Path pending |
| DoT calculations | B | Formulas known, viral interaction simplified |
| Set bonuses | A | Directly from WFCD data |
| Archon Shards | A | WFCD-backed |
| Helminth abilities | B | Data-driven, scaling formula verified |
| Polarity/capacity | A+ | Directly from game mechanics |
| Condition Overload | A | Formula verified by community |
| Shield gating | C | Formula known, integration pending |
| Damage attenuation | D | Multiple variants, per-enemy data needed |
| Ability damage | D | Framework needed, per-ability data missing |
| Warframe passives | C | Some in WFCD, many need manual entry |
| Augment mods | D | Complex interactions, limited data |
| Arcane conditions | D | ICD/duration data not in WFCD |
| Stat-stick interactions | D | Complex system, community-verified |
| Incarnon evolutions | C | Per-evolution data available |

### 10.2 Rating Scale

```
A+ = 100% confidence, production-tested
A  = 95%+ confidence, formula verified
B  = 85%+ confidence, minor unknowns
C  = 70%+ confidence, significant unknowns  
D  = <70% confidence, needs research/implementation
```

---

*Document version 2.0 — implementation status snapshot.*
