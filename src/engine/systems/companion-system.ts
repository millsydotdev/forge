/**
 * Companion System
 *
 * All companion types, precepts, bond mods, passive interactions.
 * Covers sentinels, beasts, MOAs, hounds, predasites, vulpaphylas.
 *
 * Bond mods (Whisper in the Walls update):
 *   - Tenacious Bond: +50% (base) crit chance when owner has 1200+ max shields
 *   - Momentous Bond: +60% ability strength on 10+ kills, 30s
 *   - Duplex Bond: spawn specter on kill, 30s cooldown
 *   - Reinforced Bond: +60% fire rate for 10s after 600 overshields gained
 *   - Assassin Bond: +15% reload speed, +15% fire rate per enemy type killed
 *   - Astral Bond: +25% status damage per 5m from target, max 100%
 *   - Shielded Bond: +50 shields per enemy hit with abilities, 30/s max
 *   - Viral Bond: +20% status damage to enemies affected by viral
 */

export type CompanionType = 'sentinel' | 'beast' | 'moa' | 'hound' | 'predasite' | 'vulpaphyla' | 'robot' | 'infested';

export interface CompanionPassiveDef {
  stat: string;
  value: number;
  category: 'FLAT' | 'MULTIPLIER';
  condition?: string;
}

export interface PreceptDef {
  name: string;
  description: string;
  modId: string;
  effects: CompanionPassiveDef[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CompanionWeaponDef {
  name: string;
  uniqueName: string;
  slot: 'primary' | 'secondary' | 'melee';
  baseDamage: number;
  fireRate: number;
  damageType: string;
  multishot: number;
  critChance: number;
  critMultiplier: number;
  statusChance: number;
}

export interface CompanionDef {
  name: string;
  uniqueName: string;
  type: CompanionType;
  baseHealth: number;
  baseShields: number;
  baseArmor: number;
  passiveId: string;
  precepts: string[];
  weapon: CompanionWeaponDef | null;
  specialAbilities: string[];
}

export interface BondModDef {
  name: string;
  description: string;
  condition: string;
  effects: CompanionPassiveDef[];
  requiresShields?: number;
  requiresKills?: number;
  requiresOvershields?: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const BOND_MODS: Record<string, BondModDef> = {
  'Tenacious Bond': {
    name: 'Tenacious Bond',
    description: '+50% crit damage when owner has 1200+ max shields',
    condition: 'maxShields >= 1200',
    effects: [{ stat: 'crit_damage', value: 0.5, category: 'MULTIPLIER', condition: 'maxShields >= 1200' }],
    requiresShields: 1200,
    confidence: 'HIGH',
  },
  'Momentous Bond': {
    name: 'Momentous Bond',
    description: '+60% ability strength on 10+ kills within 30s',
    condition: 'kills >= 10',
    effects: [{ stat: 'strength', value: 0.6, category: 'MULTIPLIER', condition: 'stacks >= 10' }],
    requiresKills: 10,
    confidence: 'HIGH',
  },
  'Duplex Bond': {
    name: 'Duplex Bond',
    description: 'Spawn a specter on kill (30s cooldown)',
    condition: 'onKill',
    effects: [],
    confidence: 'HIGH',
  },
  'Reinforced Bond': {
    name: 'Reinforced Bond',
    description: '+60% fire rate for 10s after gaining 600 overshields',
    condition: 'overshieldsGained >= 600',
    effects: [{ stat: 'fire_rate', value: 0.6, category: 'MULTIPLIER', condition: 'overshieldsGained >= 600' }],
    requiresOvershields: 600,
    confidence: 'HIGH',
  },
  'Assassin Bond': {
    name: 'Assassin Bond',
    description: '+15% reload speed, +15% fire rate per enemy type killed (max 5 types)',
    condition: 'uniqueEnemyKills',
    effects: [
      { stat: 'reload_speed_mult', value: 0.15, category: 'MULTIPLIER', condition: 'per unique enemy type' },
      { stat: 'fire_rate', value: 0.15, category: 'MULTIPLIER', condition: 'per unique enemy type' },
    ],
    confidence: 'MEDIUM',
  },
  'Astral Bond': {
    name: 'Astral Bond',
    description: '+25% status damage per 5m from target, max 100% (4 stacks)',
    condition: 'distanceFromTarget',
    effects: [{ stat: 'status_damage', value: 0.25, category: 'MULTIPLIER', condition: 'per 5m distance' }],
    confidence: 'MEDIUM',
  },
  'Shielded Bond': {
    name: 'Shielded Bond',
    description: '+50 shields per enemy hit with abilities (30/s max)',
    condition: 'onAbilityHit',
    effects: [{ stat: 'shields', value: 50, category: 'FLAT', condition: 'per ability hit' }],
    confidence: 'MEDIUM',
  },
  'Viral Bond': {
    name: 'Viral Bond',
    description: '+20% status damage to enemies affected by viral',
    condition: 'onViralProc',
    effects: [{ stat: 'status_damage', value: 0.2, category: 'MULTIPLIER', condition: 'viral active' }],
    confidence: 'HIGH',
  },
};

export const KNOWN_PRECEPTS: Record<string, PreceptDef> = {
  'Ghost': {
    name: 'Ghost', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/ShadeGhost',
    description: 'Shade: cloaks owner when near enemies.',
    effects: [{ stat: 'invisibility', value: 1, category: 'FLAT' }], confidence: 'HIGH',
  },
  'Assault Mode': {
    name: 'Assault Mode', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/AssaultMode',
    description: 'Sentinel attacks enemies in sight.',
    effects: [], confidence: 'HIGH',
  },
  'Guardian': {
    name: 'Guardian', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/Guardian',
    description: 'Recharges owner\'s shields when depleted. 20s cooldown.',
    effects: [{ stat: 'shield_recharge', value: 1, category: 'MULTIPLIER' }], confidence: 'HIGH',
  },
  'Sacrifice': {
    name: 'Sacrifice', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/Sacrifice',
    description: 'Revives owner once per mission at the cost of the sentinel.',
    effects: [], confidence: 'HIGH',
  },
  'Medi-Ray': {
    name: 'Medi-Ray', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/MediRay',
    description: 'Heals owner for 50 health every 8s.',
    effects: [{ stat: 'health_regen', value: 50, category: 'FLAT' }], confidence: 'HIGH',
  },
  'Retriever': {
    name: 'Retriever', modId: '/Lotus/Types/Beast/Precepts/Retriever',
    description: 'Beast: 30% chance to double resource pickups.',
    effects: [], confidence: 'HIGH',
  },
  'Scavenge': {
    name: 'Scavenge', modId: '/Lotus/Types/Beast/Precepts/Scavenge',
    description: 'Beast: picks up nearby loot.',
    effects: [], confidence: 'HIGH',
  },
  'Hunt': {
    name: 'Hunt', modId: '/Lotus/Types/Beast/Precepts/HuntAbility',
    description: 'Beast: attacks target and holds them.',
    effects: [], confidence: 'HIGH',
  },
  'Protect': {
    name: 'Protect', modId: '/Lotus/Types/Beast/Precepts/Protect',
    description: 'Beast: knocks down nearby enemies when owner is downed.',
    effects: [], confidence: 'HIGH',
  },
  'Stasis': {
    name: 'Stasis', modId: '/Lotus/Types/Beast/Precepts/Stasis',
    description: 'Beast: freezes enemy in place. Finisher opener.',
    effects: [], confidence: 'HIGH',
  },
  'Viral Quills': {
    name: 'Viral Quills', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/QuillsPrecept',
    description: 'Sends quills that deal Viral damage and proc viral.',
    effects: [], confidence: 'HIGH',
  },
  'Tractor Beam': {
    name: 'Tractor Beam', modId: '/Lotus/Types/Sentinels/SentinelPrecepts/TractorBeam',
    description: 'Draws nearby loot toward the sentinel.',
    effects: [], confidence: 'HIGH',
  },
};

export function resolveBondMods(
  equippedBondMods: string[],
  shieldTotal: number,
  stacks: number,
): CompanionPassiveDef[] {
  const results: CompanionPassiveDef[] = [];
  for (const bondName of equippedBondMods) {
    const def = BOND_MODS[bondName];
    if (!def) continue;
    if (def.requiresShields && shieldTotal < def.requiresShields) continue;
    if (def.requiresKills && stacks < def.requiresKills) continue;
    results.push(...def.effects);
  }
  return results;
}
