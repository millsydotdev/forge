# Forge Knowledge Base

**Authoritative source of truth for every Warframe gameplay mechanic in the engine.**

Each entry documents one mechanic with its formula, trigger, stacking, dependencies, evidence, and confidence.

---

## Entry Structure

```
KB-{NNN}: {Name}
  Category:     {Warframe | Weapon | Arcane | Mod | Companion | Enemy | Focus | Mission | System}
  Source:       {file path}
  Formula:      {mathematical expression}
  Trigger:      {when does this apply}
  Stacking:     {how multiple instances combine}
  Refresh:      {what happens on re-proc}
  ICD:          {internal cooldown}
  Duration:     {how long it lasts}
  Dependencies: {other mechanics required}
  Exceptions:   {known edge cases}
  Evidence:     {source reference}
  Confidence:   {HIGH | MEDIUM | LOW}
  Verified:     {date}
```

---

## Warframe Core

### KB-001: Warframe Base Stats Resolution

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/data/wfcd-resolver.ts` → `resolveWarframePassive()` |
| **Formula** | `base_health = wf.health` `base_shield = wf.shield` `base_armor = wf.armor` `base_energy = wf.power ?? 100` `base_sprint = wf.sprintSpeed` |
| **Trigger** | Always (base values loaded at build calculation time) |
| **Stacking** | Base values are FLAT; mods apply as MULTIPLIER on top |
| **Dependencies** | WFCD warframe entry must be resolvable |
| **Exceptions** | Some warframes have `power` field as null; defaults to 100 |
| **Evidence** | `@wfcd/items` game export; confirmed in-game |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-002: Final Warframe Core Stats

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/engine/stat-processor/index.ts` lines 274-282 |
| **Formula** | `health = (base_health × healthBucket.multiplier) + shardHealthFlat` `shields = (base_shield × shieldBucket.multiplier) + shardShieldFlat` `armor = (base_armor × armorBucket.multiplier) + shardArmorFlat` `energy = (base_energy × energyBucket.multiplier) + shardEnergyFlat` |
| **Trigger** | Always |
| **Stacking** | Health/Shields/Armor/Energy MULTIPLIER mods multiply base; FLAT shards add after multiplier |
| **Dependencies** | KB-001 (base stats), Resolver → stat-mapping → bucket aggregation |
| **Evidence** | Confirmed in-game; matches warframe wiki formulas |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-003: Effective Hit Points (EHP)

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/engine/stat-processor/index.ts` line 284 |
| **Formula** | `EHP = health × (1 + armor / 300) + shields` |
| **Trigger** | Always |
| **Dependencies** | KB-002 (health, shields, armor) |
| **Evidence** | Standard Warframe damage reduction formula `DR = armor / (armor + 300)` |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-004: Ability Stats (STR/DUR/RNG/EFF)

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/engine/stat-processor/index.ts` lines 250-255 |
| **Formula** | `final = base × (1 + sum of MULTIPLIER bonuses)` `efficiency = min(efficiency, 1.75)` |
| **Trigger** | Always |
| **Stacking** | MULTIPLIER bonuses sum additively: 1 + 0.3 + 0.2 = 1.5× |
| **Exceptions** | Efficiency hard-capped at 175% by DE |
| **Evidence** | DE patch notes, wiki documentation |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-005: Ability Energy Cost

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/engine/systems/ability-damage.ts` lines 67-79 |
| **Formula** | `costPerCast = max(round(baseCost × max(2 - efficiency, 0.25)), 0)` `channeledCostPerSecond = baseCost × max(2 - efficiency, 0.25)` |
| **Trigger** | On ability cast / while channeled |
| **Dependencies** | KB-004 (efficiency stat) |
| **Exceptions** | Efficiency hard-capped at 175%; minimum cost floors at 25% of base |
| **Evidence** | DE patch notes (update 27.2): efficiency cap and minimum cost |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-006: Warframe Passive Effects

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/engine/systems/warframe-abilities.ts` (PASSIVE_EFFECTS) |
| **Formula** | Per-warframe; see `PASSIVE_EFFECTS` dictionary (16 defined) |
| **Trigger** | Always (warframe-specific) |
| **Dependencies** | Varies per warframe |
| **Exceptions** | Many passives are complex mechanics, not stat bonuses |
| **Evidence** | WFCD `passiveDescription` (prose); wiki for values |
| **Confidence** | MEDIUM (16/50+ passives defined) |
| **Verified** | 2026-07-02 |

---

## Weapon Stats

### KB-010: Base Damage & Condition Overload

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 42-47 |
| **Formula** | `coBonus = (coBucket.mult - 1) ?? 0` `finalMult = baseMult + coBonus × activeStatuses` `total = baseFlat × finalMult` |
| **Trigger** | Always (CO bonus per active status on target) |
| **Stacking** | Condition Overload: +120% per status (at max rank) |
| **Dependencies** | `activeStatuses` from build state |
| **Evidence** | DE: CO additive within base damage category |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-011: Faction Multiplier

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 50-61 |
| **Formula** | `factionMult = factionBucket.mult ?? 1` `factionMult ×= factionAllBucket.mult ?? 1` |
| **Trigger** | When target faction is set |
| **Stacking** | Faction-specific and "all factions" multiply together |
| **Dependencies** | `targetFaction` from build state; Roar adds `faction_damage_all` |
| **Evidence** | DE confirmed Roar/Bane mods are multiplicative with each other |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-012: Critical Chance & Multiplier

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 102-114 |
| **Formula** | `critChance = baseCrit × (baseCritMult + heavyCritBonus)` `critMultiplier = critDmgFlat × critDmgMult \|\| 1` `heavyCritChance = baseCrit × (baseCritMult + heavyCritBonus × 2)` |
| **Trigger** | Always (flat crit mods add to base, multiplier mods multiply) |
| **Stacking** | Crit chance: base × (1 + mod sum + combo bonus). Crit dmg: flat × mult |
| **Dependencies** | `crit_chance_combo` for Blood Rush-style bonuses |
| **Evidence** | Standard DE critical hit formula |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-013: Crit Tiers

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 156-160 |
| **Formula** | `yellow = min(cc, 1)`, `orange = max(0, min(cc - 1, 1))`, `red = max(0, cc - 2)` |
| **Trigger** | If critChance > 100% |
| **Stacking** | Each tier above 100% adds the crit multiplier bonus again: `orangeTierMult = 1 + 2×(cm-1)`, `redTierMult = 1 + 3×(cm-1)` |
| **Evidence** | DE critical hit tier system |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-014: Multishot

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 98-99 |
| **Formula** | `multishot = (flat ?? 1) × (mult ?? 1) \|\| 1` |
| **Trigger** | Always |
| **Stacking** | FLAT base multishot × MULTIPLIER mod sum |
| **Evidence** | Standard formula; Split Chamber (+90%) etc. add to multiplier |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-015: Fire Rate / Attack Speed

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 119-127 |
| **Formula** | `fireRate = fireRateFlat > 0 ? fireRateFlat × fireRateMult : (asFlat × asMult)` where `fireRateMult = frBucketMult × asBucketMult` |
| **Trigger** | Always |
| **Stacking** | Fire rate and attack speed multipliers multiply together |
| **Dependencies** | `fire_rate` bucket for ranged; `attack_speed` bucket for melee |
| **Evidence** | Standard formula |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-016: Status Chance

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 130-132 |
| **Formula** | `statusChance = (flat ?? 0) × (mult + comboMult - 1)` |
| **Trigger** | Always |
| **Stacking** | Flat base × (mod multiplier + combo bonus). Weeping Wounds adds to multiplier |
| **Evidence** | Standard DE status formula |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-017: Status Probability Distribution

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/damage-calculator.ts` |
| **Formula** | `weight = 4 for IPS, 1 for elemental` `probability = damage × weight / sum(all damages × weights) × statusChance` |
| **Trigger** | Per status proc |
| **Dependencies** | KB-016 (status chance), per-type damage values |
| **Evidence** | DE confirmed IPS weighting system |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-018: Reload Speed

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 135-138 |
| **Formula** | `reloadSpeed = baseReload / max(reloadMult, 0.01)` |
| **Trigger** | On reload |
| **Stacking** | MULTIPLIER bonuses sum (e.g., +30% = 1.3×); division applies |
| **Evidence** | Standard formula: reload time = base / (1 + sum of bonuses) |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-019: Magazine

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 141-142 |
| **Formula** | `magazine = max(1, round(flat × mult))` |
| **Trigger** | Always |
| **Stacking** | FLAT base × MULTIPLIER bonuses |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-020: DPS Calculations

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/weapon-calc.ts` lines 145-152 |
| **Formula** | `critFactor = 1 + critChance × (critMultiplier - 1)` `avgShotDamage = totalDamage × multishot × critFactor` `burstDps = avgShotDamage × fireRate` `timePerCycle = (magazine / fireRate) + reloadSpeed` `sustainedDps = (avgShotDamage × magazine) / timePerCycle` |
| **Trigger** | Always |
| **Dependencies** | KB-010 (damage), KB-012 (crit), KB-014 (multishot), KB-015 (fire rate), KB-018 (reload), KB-019 (magazine) |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

---

## Damage Over Time

### KB-030: Slash Bleed

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/dot.ts` |
| **Formula** | `tick = slashDmg > 0 ? 0.35 × totalBase : 0` `ticks = max(1, round(7 × statusDuration))` `dps = tick × ticks × procRate × procChance × viralMult` |
| **Trigger** | On slash status proc |
| **Stacking** | Damage is true damage (bypasses armor). 35% of total base damage per tick |
| **Dependencies** | KB-017 (status probabilities), KB-016 (status chance), viral multiplier |
| **Exceptions** | Slash proc is TRUE damage — ignores armor and shields entirely |
| **Evidence** | DE confirmed slash proc mechanics |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-031: Heat Burn

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/dot.ts` |
| **Formula** | `tick = 0.5 × totalBase × heatModMult` `ticks = round(7 × statusDuration)` `dps = tick × ticks × procRate × procChance × viralMult` |
| **Trigger** | On heat status proc |
| **Stacking** | Applies 50% armor reduction while active; multiple heat procs reset duration, don't stack damage per tick |
| **Dependencies** | `status_damage` bucket mods affect tick damage |
| **Evidence** | DE: heat proc armor reduction = 50% |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-032: Toxin

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/dot.ts` |
| **Formula** | `tick = 0.5 × totalBase` `ticks = round(11 × statusDuration)` `dps = tick × ticks × procRate × procChance × viralMult` |
| **Trigger** | On toxin status proc |
| **Stacking** | Bypasses shields; multiple procs stack independently |
| **Exceptions** | Toxin damage bypasses shields entirely (deals damage directly to health) |
| **Evidence** | DE confirmed toxin mechanics |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-033: Gas

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/dot.ts` |
| **Formula** | `tick = 0.5 × totalBase` `ticks = round(7 × statusDuration)` `dps = tick × ticks × procRate × procChance × viralMult` |
| **Trigger** | On gas status proc |
| **Stacking** | Creates 3m AoE cloud dealing Toxin damage to all enemies inside |
| **Evidence** | DE: gas cloud mechanics |
| **Confidence** | MEDIUM (gas proc changes in recent updates may affect behavior) |
| **Verified** | 2026-07-02 |

### KB-034: Electric

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/stat-processor/dot.ts` |
| **Formula** | `tick = 0.5 × totalBase` `ticks = round(3 × statusDuration)` `dps = tick × ticks × procRate × procChance × viralMult` |
| **Trigger** | On electric status proc |
| **Stacking** | Chain lightning to enemies within 5m; chains to 5m range per target |
| **Evidence** | DE: electric chain mechanics |
| **Confidence** | MEDIUM (chain behavior simplified) |
| **Verified** | 2026-07-02 |

---

## Enemy Systems

### KB-040: Enemy Level Scaling

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/enemy-simulator.ts` |
| **Formula** | `scaled = base × (1 + (level - 1)^exp)` where `healthExp = 0.5`, `shieldExp = 0.6`, `armorExp = 0.75` |
| **Trigger** | At spawn (based on enemy level) |
| **Dependencies** | Enemy base stats from game-data.json |
| **Evidence** | DE scaling formula; confirmed by community testing |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-041: Effective Armor & Damage Reduction

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/enemy-simulator.ts` line 34-39 |
| **Formula** | `corrosiveReduction = (1 - 0.26)^corrosiveStacks` `effectiveArmor = scaledArmor × (1 - armorStripped) × corrosiveReduction` `DR = effectiveArmor / (effectiveArmor + 300)` |
| **Trigger** | On damage calculation against armored health |
| **Stacking** | Corrosive procs multiply (26% of remaining per stack). Armor strip from abilities is additive (100% = no armor) |
| **Exceptions** | Heat proc: 50% armor reduction (multiplicative with other strip) |
| **Evidence** | Community-tested corrosive stacking formula |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-042: Enemy EHP

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/enemy-simulator.ts` line 46 |
| **Formula** | `EHP = scaledHealth / (1 - DR) + scaledShields` |
| **Trigger** | At calculation time |
| **Dependencies** | KB-040 (scaling), KB-041 (armor DR) |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-043: Damage Type Modifiers

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/data/damage-type-mods.ts` |
| **Formula** | `vsHealth = (1 + healthMod + armorMod) × (1 - DR)` `vsShield = (1 + shieldMod)` |
| **Trigger** | Per damage instance against specific health/armor/shield type |
| **Dependencies** | KB-041 (armor DR), enemy health/armor/shield type |
| **Evidence** | Sourced from wiki; covers 9 health types, 4 armor types, 3 shield types |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-044: Damage Attenuation (Boss)

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/systems/damage-attenuation.ts` |
| **Formula** | `threshold: final = min(raw, threshold) + max(raw - threshold, 0) × factor` `dr_based: final = raw / (1 + raw × constant)` `hybrid: threshold first, then DR-based on excess` |
| **Trigger** | Vs specific boss enemies (Archon, Demolyst, Exploiter, Profit-Taker) |
| **Dependencies** | Enemy must be flagged as having attenuation |
| **Evidence** | Community-tested values; DE patch notes |
| **Confidence** | MEDIUM (exact thresholds may vary with updates) |
| **Verified** | 2026-07-02 |

### KB-045: Sentient Adaptation

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/systems/enemy-system.ts` |
| **Formula** | `multiplier = 1 - min(hitCount × 0.10, 0.60)` `void damage: always 1.0` |
| **Trigger** | Repeated hits on Sentient-type enemies |
| **Stacking** | -10% per hit, cap at -60% (40% damage minimum) |
| **Exceptions** | Void damage ignores Sentient adaptation entirely |
| **Evidence** | DE patch notes, confirmed |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-046: Eximus Overguard

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/systems/enemy-system.ts` |
| **Formula** | `overguardHP = (base + scaling × (1 + (level - 1) × 0.01)) × (steelPath ? 2.5 : 1)` `DR = 0.50` |
| **Trigger** | Eximus units at spawn |
| **Dependencies** | Eximus type, level, Steel Path flag |
| **Evidence** | Community-tested; values vary by eximus type |
| **Confidence** | MEDIUM (exact constants may vary per eximus type) |
| **Verified** | 2026-07-02 |

### KB-047: Enemy Damage to TTK

| Field | Value |
|-------|-------|
| **Category** | Enemy |
| **Source** | `src/engine/stat-processor/enemy.ts` |
| **Formula** | `shotsToKill = ceil(shields / dmgPerShotToShields) + ceil(health / dmgPerShotToHealth)` `burstTTK = shotsToKill / fireRate` `sustainedTTK = firingTime + reloadCycles × reloadSpeed` |
| **Trigger** | When enemy target is set |
| **Dependencies** | KB-042 (EHP), KB-043 (damage type mods), weapon stats |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

---

## Survivability Systems

### KB-050: Shield Gating

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/systems/shield-gating.ts` |
| **Formula** | `gateDuration = shieldsFull ? 1.3s : 0.33s` `rechargeTime = delay + (maxShields / rate)` `uptime = 1.3 / (1.3 + rechargeTime)` `ehpMult = 1 / max(1 - uptime, 0.1), capped at 10` |
| **Trigger** | On shield depletion |
| **Stacking** | Gate does not stack; must fully recharge shields to reset |
| **ICD** | Gate cannot re-trigger during active invulnerability period |
| **Duration** | 1.3s (full depletion) or 0.33s (partial) |
| **Dependencies** | Max shields, shield recharge rate, recharge delay |
| **Exceptions** | Overshields do NOT reset the gate. Toxin bypasses shields |
| **Evidence** | DE Update 31.5 patch notes |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-051: Overguard (Player)

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/systems/overguard.ts` |
| **Formula** | `incomingDamage × (1 - 0.50)` (faction multipliers do NOT apply) `overguardEHP = maxOverguard / 0.50` |
| **Trigger** | When overguard is active (player or enemy) |
| **Stacking** | Does not stack; separate health bar |
| **Dependencies** | Overguard max value |
| **Exceptions** | Adaptation does not apply to overguard damage. Status immune while overguard active. No stealth multipliers. Faction multipliers ignored. |
| **Evidence** | DE confirmed overguard mechanics |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-052: Adaptation Mod

| Field | Value |
|-------|-------|
| **Category** | Mod |
| **Source** | `src/engine/systems/adaptation.ts` |
| **Formula** | `DR = min(stacks × 0.10, 0.90)` `effectiveDamage = incoming × (1 - DR)` `maxEHP = 1 / (1 - 0.90) = 10×` |
| **Trigger** | On damage taken (per damage type) |
| **Stacking** | Same type: +1 stack (max 10). New type: resets to 1 |
| **Duration** | 20s per stack (not modeled — assumed sustained) |
| **Dependencies** | Damage type of incoming hit |
| **Exceptions** | Does NOT apply to overguard. True damage bypasses. New damage type resets stacks. |
| **Evidence** | DE confirmed Adaptation mechanics |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-053: Stealth & Finisher Multipliers

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/systems/stealth-finisher.ts` |
| **Formula** | `melee: 8×, sniper: 4×, bow: 3×, other ranged: 2×` `finisher: true damage, ignores armor` `headshot: 2× (stacks with stealth)` |
| **Trigger** | On unaware enemies / finisher attacks |
| **Stacking** | Stealth and finisher are not additive — whichever is higher is used |
| **Exceptions** | Overguard: not affected by stealth multipliers |
| **Evidence** | DE confirmed stealth system |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

---

## Special Weapon Systems

### KB-060: Stat-Stick Abilities

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/systems/stat-stick.ts` |
| **Formula** | See KB-009: 6 abilities affected with specific damage share percentages |
| **Trigger** | When warframe with stat-stick ability is equipped and melee weapon is equipped |
| **Stacking** | Mod bonuses from melee weapon contribute to ability base damage |
| **Dependencies** | Equipped melee weapon mods, riven disposition |
| **Exceptions** | Only specific abilities use stat sticks; percentage varies per ability |
| **Evidence** | Community-tested for each ability |
| **Confidence** | MEDIUM (some share percentages approximated) |
| **Verified** | 2026-07-02 |

### KB-061: Incarnon Evolution Bonuses

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/systems/incarnon.ts` |
| **Formula** | `accumulated[stat] = Σ(stageBonuses[stat]) for stages 1..evolutionStage` |
| **Trigger** | At evolution stage selection |
| **Stacking** | Evolution bonuses accumulate additively across stages |
| **Dependencies** | Weapon must be Incarnon-compatible; evolution stage selected |
| **Evidence** | Wiki-curated for 6 weapons; 70+ undocumented |
| **Confidence** | MEDIUM (6/70+ documented) |
| **Verified** | 2026-07-02 |

### KB-062: Battery/Charge Weapons

| Field | Value |
|-------|-------|
| **Category** | Weapon |
| **Source** | `src/engine/systems/battery-weapon.ts` |
| **Formula** | `battery: sustainedDps = (dmgPerShot × shots) / (timeToEmpty + timeToRecharge)` `charge: burstDps = fullChargeDmg / chargeTime` |
| **Trigger** | When weapon is battery-type or charge-type |
| **Dependencies** | Battery capacity, recharge rate, charge time |
| **Exceptions** | Charge weapons are burst-only; sustained = burst (no reload cycle) |
| **Confidence** | MEDIUM (general model, weapon-specific params vary) |
| **Verified** | 2026-07-02 |

---

## Companion System

### KB-070: Companion Core Stats

| Field | Value |
|-------|-------|
| **Category** | Companion |
| **Source** | `src/engine/stat-processor/index.ts` lines 113-140 |
| **Formula** | `health = base × healthMult`, `shields = base × shieldMult`, `armor = base × armorMult`, `EHP = health × (1 + armor/300) + shields` |
| **Trigger** | Always |
| **Stacking** | Same warframe bucket system (health::warframe_health, etc.) |
| **Dependencies** | Companion base stats from WFCD; companion mods resolved through pipeline |
| **Confidence** | MEDIUM (basic pipeline; bond mod interactions not fully modeled) |
| **Verified** | 2026-07-02 |

### KB-071: Bond Mods

| Field | Value |
|-------|-------|
| **Category** | Mod/Companion |
| **Source** | `src/engine/systems/companion-system.ts` (BOND_MODS) |
| **Formula** | Condition-based activation thresholds (shields ≥ 1200, kills ≥ 10, etc.) |
| **Trigger** | Per-bond condition (shield total, kill count, distance, etc.) |
| **Stacking** | Multiple bonds can be active simultaneously |
| **Dependencies** | Warframe shields, kill count, overshields, distance to target |
| **Confidence** | MEDIUM (values approximate for some bonds) |
| **Verified** | 2026-07-02 |

---

## Focus Schools

### KB-080: Focus School Passives

| Field | Value |
|-------|-------|
| **Category** | Focus |
| **Source** | `src/engine/systems/focus-system.ts` |
| **Formula** | Per-school: see school passive table in formulas |
| **Trigger** | When focus school is selected |
| **Stacking** | Passives are additive with other mod bonuses |
| **Confidence** | MEDIUM (values verified but may shift) |
| **Verified** | 2026-07-02 |

### KB-081: Waybound Passives

| Field | Value |
|-------|-------|
| **Category** | Focus |
| **Source** | `src/engine/systems/focus-system.ts` |
| **Formula** | Per-waybound: see waybound table in formulas |
| **Trigger** | When waybound node is unlocked and active |
| **Stacking** | Additive with school passives and mod bonuses |
| **Confidence** | MEDIUM |
| **Verified** | 2026-07-02 |

---

## Arcane System

### KB-090: Arcane Activation

| Field | Value |
|-------|-------|
| **Category** | Arcane |
| **Source** | `src/engine/systems/arcane-system.ts` |
| **Formula** | Per-arcane trigger, ICD, duration, max stacks — see ARC_TRIGGER_DATA |
| **Trigger** | Per-arcane trigger condition (on_kill, on_headshot, on_damage_taken, etc.) |
| **Stacking** | Arcane effects resolve through the Modifier pipeline as FLAT/MULTIPLIER |
| **ICD** | Per-arcane (6s for Grace, 15s for Energize, 10s for Avenger, etc.) |
| **Duration** | Per-arcane (12s for Avenger, 20s for Guardian, 24s for Rage, etc.) |
| **Dependencies** | Trigger condition from build state |
| **Confidence** | MEDIUM (22/150+ arcanes have mapped metadata) |
| **Verified** | 2026-07-02 |

---

## Effect Engine

### KB-100: Effect Value Scaling

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/systems/effect-engine.ts` |
| **Formula** | `linear: value = base + factor × stacks` `exponential: value = base × factor^stacks` `diminishing: value = base × (1 - (1 - factor)^stacks)` |
| **Trigger** | When effect condition is met |
| **Stacking** | 7 rules: additive, multiplicative, highest_only, refreshes, replaces, unique, mutually_exclusive |
| **ICD** | Per-effect condition parameter |
| **Duration** | Per-effect duration parameter |
| **Dependencies** | GameState for trigger condition checks |
| **Confidence** | MEDIUM (framework implemented; no production effects use it yet) |
| **Verified** | 2026-07-02 |

---

## Polarity & Capacity

### KB-110: Polarity Matching

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/polarity.ts` |
| **Formula** | `matched = modPolarity === slotPolarity (UNIVERSAL matches all, UMBRA only matches UMBRA)` |
| **Trigger** | On mod equip |
| **Stacking** | N/A (binary match/mismatch) |
| **Exceptions** | UMBRA polarity does NOT match MADURAI despite same symbol (Aura Forma exception: UMBRA matches all in aura slot) |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-111: Capacity Calculation

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/polarity.ts` |
| **Formula** | `drain = baseDrain + rank` `effectiveCost = matched ? ceil(drain/2) : drain` `warframeCap = 30 + auraContribution + MR` `weaponCap = 30 + stanceContribution + MR` `auraContribution = matched ? auraDrain : -auraDrain` |
| **Trigger** | On mod equip/unequip |
| **Stacking** | N/A |
| **Dependencies** | Mod rank, polarity, slot polarity, MR |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

---

## Modifier Pipeline

### KB-120: Bucket Resolution

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/stat-processor/bucket-ops.ts` |
| **Formula** | `result = sum(FLAT values) × (1 + sum(MULTIPLIER values))` |
| **Trigger** | Always; core resolution step |
| **Stacking** | FLAT values: additive sum. MULTIPLIER values: additive sum → (1 + sum) |
| **Dependencies** | All systems feed Modifiers into buckets |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-121: Conditional Modifiers

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/stat-processor/conditions.ts` |
| **Formula** | Per-condition type; see 22 trigger types with stack multiplication |
| **Trigger** | When conditional trigger state is set |
| **Stacking** | Galvanized/onKill stacks multiply the mod's value |
| **Dependencies** | ConditionalTriggerState from build input |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

### KB-122: Elemental Combination

| Field | Value |
|-------|-------|
| **Category** | System |
| **Source** | `src/engine/stat-processor/elemental.ts` |
| **Formula** | `heat+cold → blast, heat+electric → radiation, heat+toxin → gas` `cold+electric → magnetic, cold+toxin → viral` `electric+toxin → corrosive` |
| **Trigger** | When ≥2 single-element mods equipped |
| **Stacking** | Combined element value = sum of contributing elements |
| **Dependencies** | Modifier stat names starting with `elemental_` |
| **Exceptions** | If 3+ elements, pairs combine left-to-right |
| **Confidence** | HIGH |
| **Verified** | 2026-07-02 |

---

## Helminth

### KB-130: Helminth Ability Scaling

| Field | Value |
|-------|-------|
| **Category** | Warframe |
| **Source** | `src/engine/stat-processor/index.ts` lines 375-391 |
| **Formula** | `scaledDamage = baseDamage × (1 + (scalingStatValue - 1) × scalingFactor)` |
| **Trigger** | When helminth ability is equipped |
| **Dependencies** | KB-004 (ability stats), game data for base damage/scaling factor |
| **Confidence** | MEDIUM (dependent on game data completeness) |
| **Verified** | 2026-07-02 |

---

## Operator

### KB-140: Operator Stats

| Field | Value |
|-------|-------|
| **Category** | Operator |
| **Source** | `src/engine/stat-processor/index.ts` lines 518-533 |
| **Formula** | `operatorHealth = round(250 × mult)`, `operatorShields = round(250 × mult)`, `operatorArmor = round(flat)`, `operatorEnergy = round(100 × mult)` |
| **Trigger** | When operator/focus school is configured |
| **Stacking** | Uses same bucket system with `operator_*` stacking groups |
| **Dependencies** | Focus school selection, operator arcanes |
| **Confidence** | MEDIUM (basic health/shields; amp damage and focus abilities not integrated) |
| **Verified** | 2026-07-02 |
