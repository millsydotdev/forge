/**
 * Warframe damage type modifiers vs health/armor/shield classes.
 *
 * Sourced from the Warframe wiki damage calculation page. Values are
 * the additive bonus applied to a damage type when hitting a given
 * health/armor/shield class (e.g. +0.75 = +75% damage, -0.50 = -50%).
 *
 * Modern (2022 rework) formula vs an armored health target:
 *   hitDamage = weaponDamage × (1 + healthMod + armorMod) × (1 − DR)
 * vs unarmored health:
 *   hitDamage = weaponDamage × (1 + healthMod)
 * vs shields:
 *   hitDamage = weaponDamage × (1 + shieldMod)
 *
 * DR = armor / (armor + 300), with armor already level-scaled and
 * reduced by armor-strip / corrosive / heat procs.
 */

export type DamageTypeName =
  | 'impact' | 'puncture' | 'slash'
  | 'heat' | 'cold' | 'electric' | 'toxin'
  | 'blast' | 'radiation' | 'gas' | 'magnetic'
  | 'viral' | 'corrosive' | 'void' | 'tau' | 'true';

/** Display-time aliases used by some enemy records. */
const TYPE_ALIASES: Record<string, DamageTypeName> = {
  'True': 'true',
  'Tau': 'tau',
  'Void': 'void',
  'Corrosive': 'corrosive',
  'Viral': 'viral',
  'Magnetic': 'magnetic',
  'Gas': 'gas',
  'Radiation': 'radiation',
  'Blast': 'blast',
  'Toxin': 'toxin',
  'Electric': 'electric',
  'Electricity': 'electric',
  'Cold': 'cold',
  'Heat': 'heat',
  'Slash': 'slash',
  'Puncture': 'puncture',
  'Impact': 'impact',
};

export function normalizeDamageTypeName(name: string): DamageTypeName | null {
  const lower = name.toLowerCase();
  if (TYPE_ALIASES[name]) return TYPE_ALIASES[name];
  if (TYPE_ALIASES[name.charAt(0).toUpperCase() + name.slice(1)]) {
    return TYPE_ALIASES[name.charAt(0).toUpperCase() + name.slice(1)];
  }
  if (isValidDamageType(lower)) return lower as DamageTypeName;
  return null;
}

export function isValidDamageType(name: string): boolean {
  return name in TYPE_ALIASES || ([
    'impact','puncture','slash','heat','cold','electric','toxin',
    'blast','radiation','gas','magnetic','viral','corrosive','void','tau','true'
  ] as string[]).includes(name);
}

export type TypeModTable = Partial<Record<DamageTypeName, number>>;

/** Health class damage modifiers (applied to health pool). */
export const HEALTH_TYPE_MODS: Record<string, TypeModTable> = {
  'Cloned Flesh': {
    viral: 0.5,
    toxin: 0.25,
    gas: -0.25,
    magnetic: -0.25,
    blast: -0.25,
    radiation: -0.25,
  },
  'Flesh': {
    toxin: 0.5,
    gas: 0.5,
    viral: 0.25,
    slash: -0.25,
    cold: -0.25,
    puncture: -0.25,
  },
  'Infested Flesh': {
    heat: 0.5,
    gas: 0.5,
    blast: 0.5,
    viral: 0.25,
    slash: -0.5,
    cold: -0.5,
    puncture: -0.5,
  },
  'Robotic': {
    electric: 0.5,
    puncture: 0.5,
    viral: 0.25,
    slash: -0.25,
    blast: -0.25,
    heat: -0.25,
    cold: -0.25,
  },
  'Fossilized': {
    radiation: 0.25,
    blast: 0.25,
    heat: 0.15,
    cold: 0.15,
    toxin: 0.15,
    electric: 0.15,
    gas: 0.15,
    viral: -0.5,
    puncture: -0.5,
    impact: -0.75,
  },
  'Infested': {
    heat: 0.5,
    gas: 0.5,
    blast: 0.5,
    viral: 0.25,
    slash: -0.5,
    cold: -0.5,
    puncture: -0.5,
  },
  'Sentient': {
    // Sentients adapt and reduce damage over time; neutral base.
    void: 0.5,
  },
  'Orokin': {
    void: 0.5,
    toxin: 0.25,
  },
  'Shield': {},
  'Proto Shield': {},
};

/** Armor class damage modifiers (applied via the armored-health formula). */
export const ARMOR_TYPE_MODS: Record<string, TypeModTable> = {
  'Ferrite': {
    corrosive: 0.75,
    puncture: 0.5,
    slash: -0.15,
    heat: -0.15,
    cold: -0.15,
    toxin: -0.15,
    electric: -0.15,
    blast: -0.15,
    gas: -0.15,
    magnetic: -0.15,
    radiation: -0.15,
    viral: -0.15,
  },
  'Alloy': {
    radiation: 0.75,
    cold: 0.5,
    puncture: -0.15,
    heat: -0.15,
    toxin: -0.15,
    electric: -0.15,
    blast: -0.15,
    gas: -0.15,
    magnetic: -0.15,
    corrosive: -0.15,
    viral: -0.15,
    slash: -0.15,
  },
  'Fossilized': {
    radiation: 0.25,
    blast: 0.25,
    heat: 0.15,
    cold: 0.15,
    toxin: 0.15,
    electric: 0.15,
    gas: 0.15,
    viral: -0.5,
    puncture: -0.5,
    impact: -0.75,
  },
  'None': {},
};

/** Shield class damage modifiers (applied to shield pool). */
export const SHIELD_TYPE_MODS: Record<string, TypeModTable> = {
  'Shield': {
    magnetic: 0.75,
    cold: 0.5,
    toxin: -0.25,
    blast: -0.25,
    heat: -0.25,
    gas: -0.25,
    radiation: -0.25,
    viral: -0.25,
    corrosive: -0.25,
    electric: -0.25,
    slash: -0.25,
    puncture: -0.25,
    impact: -0.25,
  },
  'Proto Shield': {
    magnetic: 0.75,
    radiation: 0.25,
    cold: 0.25,
    toxin: -0.25,
    blast: -0.25,
    heat: -0.25,
    gas: -0.25,
    viral: -0.25,
    corrosive: -0.25,
    electric: -0.25,
    slash: -0.25,
    puncture: -0.25,
    impact: -0.25,
  },
  'None': {},
};

/** Lookup helpers — return 0 if the type/class combination is unknown. */
export function healthTypeMod(healthType: string, dmgType: DamageTypeName): number {
  return HEALTH_TYPE_MODS[healthType]?.[dmgType] ?? 0;
}

export function armorTypeMod(armorType: string, dmgType: DamageTypeName): number {
  return ARMOR_TYPE_MODS[armorType]?.[dmgType] ?? 0;
}

export function shieldTypeMod(shieldType: string, dmgType: DamageTypeName): number {
  return SHIELD_TYPE_MODS[shieldType]?.[dmgType] ?? 0;
}

/**
 * Per-damage-type hit multiplier vs an armored health pool:
 *   (1 + healthMod + armorMod) × (1 − DR)
 * vs unarmored health: (1 + healthMod)
 * vs shields: (1 + shieldMod)
 *
 * `armor` here is the already-scaled, already-stripped, already-corrosive-
 * reduced effective armor. If 0, the armored path collapses to the
 * unarmored health formula.
 */
export function hitMultiplierVsHealth(
  dmgType: DamageTypeName,
  healthType: string,
  armorType: string,
  effectiveArmor: number,
): number {
  const hMod = healthTypeMod(healthType, dmgType);
  if (effectiveArmor <= 0) {
    return 1 + hMod;
  }
  const aMod = armorTypeMod(armorType, dmgType);
  const dr = effectiveArmor / (effectiveArmor + 300);
  return (1 + hMod + aMod) * (1 - dr);
}

export function hitMultiplierVsShield(
  dmgType: DamageTypeName,
  shieldType: string,
): number {
  return 1 + shieldTypeMod(shieldType, dmgType);
}
