# TennoCalc Mathematical Specification (Math Engine Spec)

This document outlines the exact mathematical formulas, stacking rules, and logic required by the TennoCalc engine to process Warframe and weapon statistics accurately, reflecting the in-game mechanics of *Warframe*.

---

## 1. Warframe Core Statistics

### 1.1 Attribute Scaling (Health, Shields, Armor, Energy)
In Warframe, core attribute mods (e.g., *Vitality*, *Steel Fiber*, *Redirection*, *Flow*) multiply the **base value** of the Warframe at Rank 0 (or Rank 30 depending on the stat, but `@wfcd/items` stores the base values directly).
Flat modifiers (e.g., Archon Shard flat armor) are added *after* mod multipliers are applied.

$$\text{Attribute} = \text{BaseAttribute} \times \left(1 + \sum \text{PercentMods}\right) + \sum \text{FlatAdditives}$$

*   **Example (Armor with Steel Fiber [+110%] & Azure Archon Shard [+225 Armor]):**
    $$\text{Armor} = \text{BaseArmor} \times (1 + 1.10) + 225$$

### 1.2 Ability Stats
Ability stats start at a base of 1.0 (100%) and stack additively.
*   **Ability Strength:** $1.0 + \sum \text{StrengthMods}$
*   **Ability Duration:** $1.0 + \sum \text{DurationMods}$
*   **Ability Range:** $1.0 + \sum \text{RangeMods}$
*   **Ability Efficiency:** $1.0 + \sum \text{EfficiencyMods}$
    *   *Cap:* Ability Efficiency has an in-game hard cap of **175%** (1.75).
    *   *Note:* For channeled abilities, the cost is calculated using both Efficiency and Duration. The final cost cannot go below 25% of the base cost.

### 1.3 Effective Hit Points (EHP)
EHP represents the total damage a Warframe can take before dying, accounting for armor damage reduction applied to Health. Shields do not benefit from Armor.

$$\text{Damage Reduction (DR)} = \frac{\text{Armor}}{\text{Armor} + 300}$$

$$\text{EHP} = \frac{\text{Health}}{1 - \text{DR}} + \text{Shields} = \text{Health} \times \left(1 + \frac{\text{Armor}}{300}\right) + \text{Shields}$$

---

## 2. Weapon Statistics & Damage Calculations

### 2.1 Modded Base Damage
Damage mods (e.g., *Serration*, *Point Blank*, *Pressure Point*) increase the weapon's total base damage additively.

$$\text{ModdedBase} = \text{BaseWeaponDamage} \times \left(1 + \sum \text{BaseDamageMods}\right)$$

### 2.2 Physical Damage (Impact, Puncture, Slash)
Physical damage mods (e.g., *Ruination*, *Fanged Fusillade*) increase the damage of their specific type, scaled off the **innate base damage of that type on the weapon**. If a weapon has no innate Slash damage, a Slash damage mod has no effect.

$$\text{Damage}_{\text{Physical}} = \text{BasePhysical} \times \left(1 + \sum \text{BaseDamageMods}\right) \times \left(1 + \sum \text{PhysicalTypeMods}\right)$$

### 2.3 Elemental Damage (Heat, Cold, Electricity, Toxin, etc.)
Elemental damage mods (e.g., *Hellfire*, *Infected Clip*) add elemental damage scaled off the **total modded base damage** ($\text{ModdedBase}$).

$$\text{Damage}_{\text{Element}} = \text{ModdedBase} \times \sum \text{ElementMods}$$

### 2.4 Elemental Combination Rules
In Warframe, single elements combine into dual elements in a specific priority order based on their slot position (top row 1-4, bottom row 5-8):
1.  **Heat + Cold** $\rightarrow$ **Radiation**
2.  **Heat + Electricity** $\rightarrow$ **Radiation** (actually Electricity + Heat = Radiation, Toxin + Heat = Gas)
3.  **Combination Mapping Table:**
    *   **Electricity + Toxin** $\rightarrow$ **Corrosive**
    *   **Cold + Toxin** $\rightarrow$ **Viral**
    *   **Heat + Toxin** $\rightarrow$ **Gas**
    *   **Cold + Electricity** $\rightarrow$ **Magnetic**
    *   **Heat + Cold** $\rightarrow$ **Blast**
    *   **Heat + Electricity** $\rightarrow$ **Radiation**
4.  If a weapon has an **innate combined element** (e.g., Radiation on Kuva Nukor), that element does not merge with added single elements unless the single elements combine first.

---

## 3. Offensive Math (Multishot, Crit, DPS)

### 3.1 Multishot
Multishot represents the number of projectiles fired per trigger pull.
$$\text{Projectiles} = \text{BaseMultishot} \times \left(1 + \sum \text{MultishotMods}\right)$$
*   If $\text{Projectiles} = 2.4$, the weapon is guaranteed to fire 2 projectiles, and has a 40% chance to fire a 3rd projectile.
*   Average damage is scaled linearly by multishot: $\text{AvgDamage} = \text{ShotDamage} \times \text{Projectiles}$.

### 3.2 Critical Hit Tiers & Expected Multiplier
Warframe uses a multi-tier critical hit system:
*   $\text{CritChance} \le 1.0$ (100%): Chance for a Tier 1 (Yellow) crit.
*   $1.0 < \text{CritChance} \le 2.0$: Guaranteed Yellow crit, chance for Tier 2 (Orange) crit.
*   $2.0 < \text{CritChance} \le 3.0$: Guaranteed Orange crit, chance for Tier 3 (Red) crit.
*   $\text{CritMultiplier}_{\text{Tier } T} = 1 + T \times (\text{CritMultiplier} - 1)$

$$\text{ExpectedCritMultiplier} = 1 + \text{CritChance} \times (\text{CritMultiplier} - 1)$$

### 3.3 Status Chance & Probabilities
Status chance is the probability that *at least one* status effect is applied per trigger pull.
$$\text{StatusPerProjectile} = 1 - (1 - \text{StatusChance}_{\text{Modified}})^{\frac{1}{\text{Projectiles}}}$$
The probability of a specific status effect triggering is proportional to that damage type's share of the total damage, with physical damage types historically weighted at 4x (though in modern Warframe, weighting is 1:1, we can support either or follow modern 1:1 weighting).

### 3.4 Rate of Fire, Reload, and Magazine
*   **Fire Rate:** $\text{BaseFireRate} \times \left(1 + \sum \text{FireRateMods}\right)$
*   **Magazine Capacity:** $\text{Round}\left(\text{BaseMagazine} \times \left(1 + \sum \text{MagazineMods}\right)\right)$
*   **Reload Time:** $\frac{\text{BaseReload}}{1 + \sum \text{ReloadSpeedMods}}$

### 3.5 DPS Calculations
*   **Burst DPS:** $\text{AverageShotDamage} \times \text{FireRate}$
*   **Sustained DPS:** Accounts for the reload time during continuous firing cycles.
    $$\text{Sustained DPS} = \frac{\text{AverageShotDamage} \times \text{MagazineSize}}{\left(\frac{\text{MagazineSize}}{\text{FireRate}}\right) + \text{ReloadTime}}$$

---

## 4. Advanced & Conditional Modifiers

### 4.1 Faction Damage Multipliers (Bane, Expel, Cleanse, Smite)
Faction mods apply a multiplicative bonus to the final damage dealt to a specific enemy faction (Grineer, Corpus, Infested, Murmur, Sentient).
$$\text{FinalDamage} = \text{TotalDamage} \times (1 + \text{FactionMultiplier})$$
*   *Double Dipping:* For Damage over Time (DoT) status effects (Slash bleed, Heat burn, Gas cloud, Toxin poison), faction multipliers apply twice!
    $$\text{DoTDamage} = \text{BaseDoT} \times (1 + \text{FactionMultiplier})^2$$

### 4.2 Condition Overload & Galvanized Aptitude
Mods that increase damage per active status type on the target.
$$\text{BaseDamageBonus} = \sum \text{BaseDamageMods} + \left(\text{COBonusPerStatus} \times \text{ActiveStatusTypes}\right)$$

### 4.3 Heavy Attacks (Melee-Only)
Heavy attacks consume the combo multiplier to deal massive damage.
*   **Heavy Attack Damage:** Scales based on the weapon's heavy attack base damage and current combo tier multiplier.
*   **Heavy Attack Crit Chance:** Many mods provide double critical chance on heavy attacks:
    $$\text{CritChance}_{\text{Heavy}} = \text{BaseCritChance} \times \left(1 + \text{CritChanceMods} + \text{HeavyCritBonus}\right)$$
*   **Initial Combo:** Provides a flat floor combo count, allowing heavy attacks to be used immediately without building combo.
