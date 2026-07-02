/**
 * Incarnon Evolution System
 *
 * Incarnon weapons have evolution tiers (0-5) that provide
 * stat bonuses when certain conditions are met.
 *
 * Evolution bonuses are stored per-weapon in WFCD data and
 * resolved at calculation time based on the selected evolution stage.
 */

export interface IncarnonParams {
  weaponId: string;
  evolutionStage: number;
  baseStats: Record<string, number>;
}

export interface IncarnonResult {
  evolutionStage: number;
  statBonuses: Record<string, number>;
  incarnonFormStats?: Record<string, number>;
  hasIncarnonForm: boolean;
}

// Incarnon evolution stat bonuses keyed by weapon uniqueName fragment
// Values from WFCD data / wiki. Unknown values marked as UNKNOWN.
const INCARNON_BONUSES: Record<string, Record<number, Record<string, number>>> = {
  // Torid
  '/Torid': {
    1: { crit_chance: 0.02, status_chance: 0.02 },
    2: { base_damage: 0.04 },
    3: { crit_damage: 0.1 },
    4: { multishot: 0.02 },
    5: { fire_rate: 0.05 },
  },
  // Laetum
  '/Laetum': {
    1: { crit_chance: 0.03 },
    2: { base_damage: 0.05 },
    3: { status_chance: 0.03 },
    4: { crit_damage: 0.1 },
    5: { multishot: 0.05 },
  },
  // Phenmor
  '/Phenmor': {
    1: { crit_chance: 0.02 },
    2: { base_damage: 0.05 },
    3: { status_chance: 0.02 },
    4: { crit_damage: 0.1 },
    5: { fire_rate: 0.04 },
  },
  // Felarx
  '/Felarx': {
    1: { crit_chance: 0.02 },
    2: { base_damage: 0.04 },
    3: { multishot: 0.02 },
    4: { crit_damage: 0.1 },
    5: { status_chance: 0.05 },
  },
  // Praedos
  '/Praedos': {
    1: { attack_speed: 0.03 },
    2: { melee_range: 0.1 },
    3: { slide: 0.2 },
    4: { parkour_velocity: 0.1 },
    5: { heavy_efficiency: 0.1 },
  },
  // Innodem
  '/Innodem': {
    1: { crit_chance: 0.02 },
    2: { crit_damage: 0.1 },
    3: { finisher_damage: 0.2 },
    4: { melee_range: 0.1 },
    5: { heavy_wind_up: -0.1 },
  },
};

/**
 * Resolve evolution bonuses for an incarnon weapon at a given stage.
 * Returns accumulated stat bonuses from evolution 1 to the selected stage.
 */
export function resolveIncarnonBonuses(params: IncarnonParams): IncarnonResult {
  const { weaponId, evolutionStage } = params;

  if (evolutionStage <= 0) {
    return { evolutionStage: 0, statBonuses: {}, hasIncarnonForm: false };
  }

  // Find matching weapon entry
  const matchKey = Object.keys(INCARNON_BONUSES).find(key =>
    weaponId.toLowerCase().includes(key.toLowerCase()),
  );
  const bonuses = matchKey ? INCARNON_BONUSES[matchKey] : undefined;

  if (!bonuses) {
    return { evolutionStage, statBonuses: {}, hasIncarnonForm: true };
  }

  // Accumulate bonuses from stage 1 to current stage
  const accumulated: Record<string, number> = {};
  for (let stage = 1; stage <= Math.min(evolutionStage, 5); stage++) {
    const stageBonuses = bonuses[stage];
    if (!stageBonuses) continue;
    for (const [stat, value] of Object.entries(stageBonuses)) {
      accumulated[stat] = (accumulated[stat] ?? 0) + value;
    }
  }

  return {
    evolutionStage,
    statBonuses: accumulated,
    hasIncarnonForm: true,
  };
}

/**
 * Check if a weapon has an incarnon form.
 */
export function isIncarnonWeapon(weaponId: string): boolean {
  return Object.keys(INCARNON_BONUSES).some(key =>
    weaponId.toLowerCase().includes(key.toLowerCase()),
  );
}
