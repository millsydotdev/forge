export type DetailRecord = Record<string, unknown> & {
  levelStats?: { stats: string[] }[];
  imageName?: string;
  name?: string;
  school?: string;
  health?: number;
  shield?: number;
  armor?: number;
  power?: number;
  sprintSpeed?: number;
};

export interface OperatorModValues {
  abilityStrength: number;
  abilityDuration: number;
  abilityRange: number;
  abilityEfficiency: number;
  health: number;
  shield: number;
  armor: number;
  energy: number;
  sprintSpeed: number;
}

export function defaultModValues(): OperatorModValues {
  return {
    abilityStrength: 0, abilityDuration: 0, abilityRange: 0, abilityEfficiency: 0,
    health: 0, shield: 0, armor: 0, energy: 0, sprintSpeed: 0,
  };
}

export function getLevelStatLines(detail: DetailRecord): string[] {
  const levelStats = detail.levelStats;
  if (!Array.isArray(levelStats)) return [];
  return levelStats.flatMap(ls => Array.isArray(ls.stats) ? ls.stats.filter((s): s is string => typeof s === 'string') : []);
}

const STAT_PATTERN = /^([+-]?\d+(?:\.\d+)?)%\s*(.*)$/;

export function parseOperatorModLines(detail: DetailRecord | null): OperatorModValues {
  const mods = defaultModValues();
  if (!detail) return mods;
  for (const raw of getLevelStatLines(detail)) {
    const m = raw.match(STAT_PATTERN);
    if (!m) continue;
    const val = parseFloat(m[1]);
    const statName = m[2].trim().toLowerCase();
    if (statName.includes('ability strength')) mods.abilityStrength += val;
    else if (statName.includes('ability duration')) mods.abilityDuration += val;
    else if (statName.includes('ability range')) mods.abilityRange += val;
    else if (statName.includes('ability efficiency')) mods.abilityEfficiency += val;
    else if (statName.includes('health')) mods.health += val;
    else if (statName.includes('shield')) mods.shield += val;
    else if (statName.includes('armor')) mods.armor += val;
    else if (statName.includes('energy')) mods.energy += val;
    else if (statName.includes('sprint speed')) mods.sprintSpeed += val;
  }
  return mods;
}

export function computeOperatorStats(
  opDetail: DetailRecord | null,
  focusMods: OperatorModValues,
  arcaneMods: OperatorModValues,
) {
  if (!opDetail) return null;
  const base = {
    health: opDetail.health ?? 100,
    shield: opDetail.shield ?? 100,
    armor: opDetail.armor ?? 0,
    energy: opDetail.power ?? 100,
    sprintSpeed: opDetail.sprintSpeed ?? 1.0,
    abilityStrength: 0,
    abilityDuration: 0,
    abilityRange: 0,
    abilityEfficiency: 0,
  };
  const final = {
    health: base.health + focusMods.health + arcaneMods.health,
    shield: base.shield + focusMods.shield + arcaneMods.shield,
    armor: base.armor + focusMods.armor + arcaneMods.armor,
    energy: base.energy + focusMods.energy + arcaneMods.energy,
    sprintSpeed: base.sprintSpeed + focusMods.sprintSpeed + arcaneMods.sprintSpeed,
    abilityStrength: base.abilityStrength + focusMods.abilityStrength + arcaneMods.abilityStrength,
    abilityDuration: base.abilityDuration + focusMods.abilityDuration + arcaneMods.abilityDuration,
    abilityRange: base.abilityRange + focusMods.abilityRange + arcaneMods.abilityRange,
    abilityEfficiency: base.abilityEfficiency + focusMods.abilityEfficiency + arcaneMods.abilityEfficiency,
  };
  const effective = final.health + final.shield + (final.armor * final.health / 100);
  return {
    health: final.health,
    shield: final.shield,
    armor: final.armor,
    energy: final.energy,
    sprintSpeed: final.sprintSpeed,
    abilityStrength: final.abilityStrength,
    abilityDuration: final.abilityDuration,
    abilityRange: final.abilityRange,
    abilityEfficiency: final.abilityEfficiency,
    effectiveHealth: effective,
  };
}
