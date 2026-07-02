/**
 * Focus School System
 *
 * All 5 schools, all nodes, passives, actives, waybounds.
 * Integration with Operator stats and warframe passives.
 *
 * Each school has:
 *   - School passive (always active when equipped)
 *   - Active ability (1 per school)
 *   - Waybound passives (can be unbound for use with any school)
 *   - Affinity nodes (power strength, duration, etc.)
 */

export interface FocusNodeDef {
  name: string;
  category: 'passive' | 'active' | 'waybound' | 'affinity' | 'upgrade';
  stat?: string;
  value?: number;
  category_type?: 'FLAT' | 'MULTIPLIER';
  description: string;
  maxRank: number;
  costPerRank: number;
  requires: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FocusSchoolDef {
  name: string;
  passive: FocusPassiveDef[];
  active: FocusActiveDef;
  nodes: FocusNodeDef[];
  waybounds: string[];
}

export interface FocusPassiveDef {
  stat: string;
  value: number;
  category: 'FLAT' | 'MULTIPLIER';
  description: string;
}

export interface FocusActiveDef {
  name: string;
  description: string;
  cooldown: number;
  duration: number;
  baseDamage: number;
  damageType: string;
  effects: { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER' }[];
}

export const FOCUS_SCHOOLS: Record<string, FocusSchoolDef> = {
  madurai: {
    name: 'Madurai',
    passive: [
      { stat: 'strength', value: 0.2, category: 'MULTIPLIER', description: '+20% Ability Strength' },
      { stat: 'physical_damage', value: 0.2, category: 'MULTIPLIER', description: '+20% Physical Damage' },
    ],
    active: {
      name: 'Void Strike',
      description: 'Hold Void Mode to charge; next shot deals +x% damage per second charged.',
      cooldown: 0, duration: 0, baseDamage: 0, damageType: 'Void',
      effects: [
        { stat: 'base_damage', value: 0.12, category: 'MULTIPLIER' },
      ],
    },
    nodes: [
      { name: 'Eternal Gaze', category: 'affinity', stat: 'strength', value: 0.15, category_type: 'MULTIPLIER', description: '+15% Operator Amp energy max', maxRank: 3, costPerRank: 6, requires: [], confidence: 'MEDIUM' },
      { name: 'Meteoric Dash', category: 'upgrade', description: 'Void Dash deals 500 damage and knocks back enemies.', maxRank: 3, costPerRank: 5, requires: ['Eternal Gaze'], confidence: 'HIGH' },
      { name: 'Inner Gaze', category: 'waybound', stat: 'amp_energy', value: 0.4, category_type: 'MULTIPLIER', description: '+40% Amp energy max (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Meteoric Dash'], confidence: 'HIGH' },
      { name: 'Sling Strength', category: 'upgrade', stat: 'void_sling_damage', value: 0.5, category_type: 'MULTIPLIER', description: '+50% Void Sling damage', maxRank: 3, costPerRank: 5, requires: ['Inner Gaze'], confidence: 'MEDIUM' },
      { name: 'Void Strike', category: 'active', description: '+12% damage per second in Void Mode, max 12x.', maxRank: 3, costPerRank: 7, requires: ['Sling Strength'], confidence: 'HIGH' },
      { name: 'Rising Blast', category: 'upgrade', description: 'Void Blast creates a 5m blast wave dealing 400 damage.', maxRank: 3, costPerRank: 5, requires: ['Void Strike'], confidence: 'MEDIUM' },
      { name: 'Void Radiance', category: 'upgrade', description: 'Void Mode releases a blinding flash in 8m when exiting.', maxRank: 3, costPerRank: 6, requires: ['Rising Blast'], confidence: 'HIGH' },
      { name: 'Unairu Wisp', category: 'waybound', stat: 'operator_armor', value: 150, category_type: 'FLAT', description: '+150 Operator armor (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Void Radiance'], confidence: 'MEDIUM' },
    ],
    waybounds: ['Inner Gaze', 'Unairu Wisp'],
  },

  zenurik: {
    name: 'Zenurik',
    passive: [
      { stat: 'efficiency', value: 0.2, category: 'MULTIPLIER', description: '+20% Ability Efficiency' },
    ],
    active: {
      name: 'Energizing Dash',
      description: 'Void Dash creates a 5m energy bubble that grants 5 energy/s for 30s.',
      cooldown: 0, duration: 30, baseDamage: 0, damageType: 'Void',
      effects: [
        { stat: 'energy_regen', value: 5, category: 'FLAT' },
      ],
    },
    nodes: [
      { name: 'Hard Reset', category: 'affinity', description: '+30% Operator ability damage', maxRank: 3, costPerRank: 6, requires: [], confidence: 'MEDIUM' },
      { name: 'Energizing Dash', category: 'active', description: '5 energy/s for 30s from Void Dash bubble.', maxRank: 3, costPerRank: 7, requires: ['Hard Reset'], confidence: 'HIGH' },
      { name: 'Wellspring', category: 'waybound', description: '+10 energy/s for 20s after Void Blast (Waybound).', maxRank: 3, costPerRank: 8, requires: ['Energizing Dash'], confidence: 'HIGH' },
      { name: 'Void Flow', category: 'waybound', stat: 'amp_max_energy', value: 0.5, category_type: 'MULTIPLIER', description: '+50% Amp max energy (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Wellspring'], confidence: 'HIGH' },
      { name: 'Void Siphon', category: 'waybound', stat: 'energy_regen', value: 0.6, category_type: 'MULTIPLIER', description: '+0.6 energy/s passive regen (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Void Flow'], confidence: 'HIGH' },
      { name: 'Inner Might', category: 'upgrade', description: '+30% initial energy at mission start', maxRank: 3, costPerRank: 5, requires: ['Void Siphon'], confidence: 'HIGH' },
    ],
    waybounds: ['Wellspring', 'Void Flow', 'Void Siphon'],
  },

  naramon: {
    name: 'Naramon',
    passive: [
      { stat: 'combo_chance', value: 0.5, category: 'MULTIPLIER', description: '+50% Combo Count Chance' },
    ],
    active: {
      name: 'Disorienting Dash',
      description: 'Void Dash confuses enemies, opening them to finishers.',
      cooldown: 0, duration: 10, baseDamage: 0, damageType: 'Void',
      effects: [],
    },
    nodes: [
      { name: 'Power Spike', category: 'upgrade', description: 'Combo counter decays by 5 instead of resetting to 0.', maxRank: 3, costPerRank: 7, requires: [], confidence: 'HIGH' },
      { name: 'Affinity Spike', category: 'waybound', stat: 'affinity_gain', value: 0.25, category_type: 'MULTIPLIER', description: '+25% affinity gain for melee (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Power Spike'], confidence: 'HIGH' },
      { name: 'Disorienting Dash', category: 'active', description: 'Confuses and opens enemies to finishers.', maxRank: 3, costPerRank: 7, requires: ['Affinity Spike'], confidence: 'HIGH' },
      { name: 'Surging Dash', category: 'waybound', stat: 'crit_chance_combo', value: 0.2, category_type: 'MULTIPLIER', description: '+20% melee crit chance per combo tier (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Disorienting Dash'], confidence: 'HIGH' },
      { name: 'Void Stalker', category: 'waybound', description: 'Void Mode gives 10s invisibility after exiting (Waybound).', maxRank: 3, costPerRank: 8, requires: ['Surging Dash'], confidence: 'HIGH' },
      { name: 'Opening Slam', category: 'upgrade', description: 'Slam attacks open enemies to finishers.', maxRank: 3, costPerRank: 5, requires: ['Void Stalker'], confidence: 'MEDIUM' },
    ],
    waybounds: ['Affinity Spike', 'Surging Dash', 'Void Stalker'],
  },

  unairu: {
    name: 'Unairu',
    passive: [
      { stat: 'armor', value: 200, category: 'FLAT', description: '+200 Base Armor' },
    ],
    active: {
      name: 'Caustic Strike',
      description: 'Radial attack that strips 100% armor and 100% shields from enemies within 8m.',
      cooldown: 0, duration: 0, baseDamage: 0, damageType: 'Void',
      effects: [
        { stat: 'enemy_armor', value: -1, category: 'MULTIPLIER' },
      ],
    },
    nodes: [
      { name: 'Unairu Wisp', category: 'passive', description: 'Void Sling leaves an Unairu Wisp that grants +50% operator damage for 10s.', maxRank: 3, costPerRank: 6, requires: [], confidence: 'HIGH' },
      { name: 'Magnetic Blast', category: 'upgrade', description: 'Void Blast removes 50% armor per hit.', maxRank: 3, costPerRank: 5, requires: ['Unairu Wisp'], confidence: 'MEDIUM' },
      { name: 'Caustic Strike', category: 'active', description: '100% armor/shield strip in 8m.', maxRank: 3, costPerRank: 7, requires: ['Magnetic Blast'], confidence: 'HIGH' },
      { name: 'Basilisk Scales', category: 'waybound', stat: 'armor', value: 300, category_type: 'FLAT', description: '+300 armor for Operator (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Caustic Strike'], confidence: 'HIGH' },
      { name: 'Stone Skin', category: 'waybound', stat: 'armor', value: 150, category_type: 'FLAT', description: '+150 armor (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Basilisk Scales'], confidence: 'HIGH' },
      { name: 'Void Resilience', category: 'waybound', description: 'Operator gains status immunity for 10s after exiting Void Mode (Waybound).', maxRank: 3, costPerRank: 8, requires: ['Stone Skin'], confidence: 'HIGH' },
    ],
    waybounds: ['Basilisk Scales', 'Stone Skin', 'Void Resilience'],
  },

  vazarin: {
    name: 'Vazarin',
    passive: [
      { stat: 'health', value: 0.2, category: 'MULTIPLIER', description: '+20% Health' },
    ],
    active: {
      name: 'Protective Sling',
      description: 'Void Sling creates a 5m healing wave that heals 40% max HP and grants 3s invulnerability.',
      cooldown: 0, duration: 3, baseDamage: 0, damageType: 'Void',
      effects: [
        { stat: 'invulnerability', value: 3, category: 'FLAT' },
      ],
    },
    nodes: [
      { name: 'Healing Flame', category: 'waybound', stat: 'health_regen', value: 4, category_type: 'FLAT', description: '+4 health/s regen (Waybound)', maxRank: 3, costPerRank: 8, requires: [], confidence: 'HIGH' },
      { name: 'Protective Sling', category: 'active', description: '40% heal + 3s invulnerability.', maxRank: 3, costPerRank: 7, requires: ['Healing Flame'], confidence: 'HIGH' },
      { name: 'Sonic Fracture', category: 'waybound', description: 'Void Dash creates a 12m area that slows enemies (Waybound).', maxRank: 3, costPerRank: 8, requires: ['Protective Sling'], confidence: 'MEDIUM' },
      { name: 'Molecular Fission', category: 'waybound', stat: 'reload_speed_mult', value: 0.3, category_type: 'MULTIPLIER', description: '+30% reload speed for instant revives (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Sonic Fracture'], confidence: 'MEDIUM' },
      { name: 'Guardian Shell', category: 'waybound', description: 'Void Mode creates a 4s damage-absorbing shield (Waybound).', maxRank: 3, costPerRank: 8, requires: ['Molecular Fission'], confidence: 'MEDIUM' },
      { name: 'Enduring Tides', category: 'waybound', stat: 'operator_health', value: 0.5, category_type: 'MULTIPLIER', description: '+50% Operator health (Waybound)', maxRank: 3, costPerRank: 8, requires: ['Guardian Shell'], confidence: 'HIGH' },
    ],
    waybounds: ['Healing Flame', 'Sonic Fracture', 'Molecular Fission', 'Guardian Shell', 'Enduring Tides'],
  },
};

export function getFocusSchool(schoolKey: string): FocusSchoolDef | undefined {
  return FOCUS_SCHOOLS[schoolKey.toLowerCase()];
}

export function getFocusPassives(schoolKey: string): FocusPassiveDef[] {
  return getFocusSchool(schoolKey)?.passive ?? [];
}

export function getResolvedFocusModifiers(
  schoolKey: string,
  activeNodes: string[],
): { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER'; source: string }[] {
  const school = getFocusSchool(schoolKey);
  if (!school) return [];

  const result: { stat: string; value: number; category: 'FLAT' | 'MULTIPLIER'; source: string }[] = [];

  for (const passive of school.passive) {
    result.push({
      stat: passive.stat,
      value: passive.value,
      category: passive.category,
      source: `${school.name} Focus Passive`,
    });
  }

  for (const nodeName of activeNodes) {
    const node = school.nodes.find(n => n.name.toLowerCase() === nodeName.toLowerCase());
    if (!node || !node.stat) continue;
    if (node.category === 'waybound') {
      result.push({
        stat: node.stat,
        value: node.value ?? 0,
        category: node.category_type ?? 'MULTIPLIER',
        source: `${node.name} (Waybound)`,
      });
    }
  }

  return result;
}
