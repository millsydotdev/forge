import type { EnemyTargetState } from '../build-core';
import type { Modifier } from '../modifier';
import { gameData } from '../../data/game-data';
import {
  hitMultiplierVsHealth,
  hitMultiplierVsShield,
} from '../../data/damage-type-resolver';
import { normalizeDamageTypeName } from '../../data/damage-type-mods';
import { calcEffectiveArmor, scaleStats } from '../enemy-simulator';
import { bucketify } from './bucket-ops';
import type { EnemyDamageStats, EnemySummaryStats } from './types';

export function resolveEnemy(
  enemyState: EnemyTargetState,
  auraDebuffMods: Modifier[] = [],
): {
  summary: EnemySummaryStats;
  effectiveArmor: number;
  scaledHealth: number;
  scaledShields: number;
} | null {
  const def = gameData.getEnemyByName(enemyState.targetName);
  if (!def) return null;

  const level = Math.max(1, enemyState.level);
  let armorStripped = enemyState.armorStripped;
  if (enemyState.heatProc) armorStripped = 1 - (1 - armorStripped) * 0.5;

  const auraBuckets = bucketify(auraDebuffMods);
  const enemyArmorMult = auraBuckets.get('enemy_armor::aura_debuff')?.multiplier ?? 1;
  const enemyShieldMult = auraBuckets.get('enemy_shield::aura_debuff')?.multiplier ?? 1;
  const effectiveBaseArmor = Math.max(0, def.baseArmor * enemyArmorMult);
  const effectiveBaseShields = Math.max(0, def.baseShields * enemyShieldMult);

  const { armor: effArmor, dr } = calcEffectiveArmor(
    effectiveBaseArmor,
    level,
    armorStripped,
    enemyState.corrosiveStacks,
  );
  const scaledHealth = scaleStats(def.baseHealth, level, 0.5);
  const scaledShields = scaleStats(effectiveBaseShields, level, 0.6);

  const ehp = scaledHealth / (1 - dr) + scaledShields;

  return {
    summary: {
      name: def.name,
      faction: def.faction,
      level,
      scaledHealth: Math.round(scaledHealth),
      scaledShields: Math.round(scaledShields),
      effectiveArmor: Math.round(effArmor),
      dr,
      ehp: Math.round(ehp),
      healthType: def.healthType,
      armorType: def.armorType,
      shieldType: def.shieldType,
      weakness: def.weakness,
      resistance: def.resistance,
      immune: def.immune,
      multiTarget: enemyState.multiTarget,
    },
    effectiveArmor: effArmor,
    scaledHealth,
    scaledShields,
  };
}

export function calculateEnemyDamage(
  damagePerType: Record<string, number>,
  avgShotDamage: number,
  fireRate: number,
  magazine: number,
  reloadSpeed: number,
  enemy: EnemyTargetState,
  enemyResolved: { effectiveArmor: number; scaledHealth: number; scaledShields: number; summary: EnemySummaryStats },
): EnemyDamageStats {
  const { effectiveArmor, scaledHealth, scaledShields, summary } = enemyResolved;
  const hasShields = scaledShields > 0 && summary.shieldType !== 'None';

  const damagePerTypeVsHealth: Record<string, number> = {};
  const damagePerTypeVsShield: Record<string, number> = {};

  let perShotVsHealth = 0;
  let perShotVsShield = 0;

  for (const [type, raw] of Object.entries(damagePerType)) {
    if (raw <= 0) continue;
    const normalized = normalizeDamageTypeName(type);
    if (!normalized) {
      perShotVsHealth += raw;
      if (hasShields) perShotVsShield += raw;
      damagePerTypeVsHealth[type] = raw;
      if (hasShields) damagePerTypeVsShield[type] = raw;
      continue;
    }
    if (summary.immune.some(name => name.toLowerCase() === normalized || name.toLowerCase() === type)) {
      damagePerTypeVsHealth[type] = 0;
      damagePerTypeVsShield[type] = 0;
      continue;
    }
    const healthMult = hitMultiplierVsHealth(normalized, summary.healthType, summary.armorType, effectiveArmor);
    const healthDmg = raw * healthMult;
    damagePerTypeVsHealth[type] = healthDmg;
    perShotVsHealth += healthDmg;

    if (hasShields) {
      const shieldMult = hitMultiplierVsShield(normalized, summary.shieldType);
      const shieldDmg = raw * shieldMult;
      damagePerTypeVsShield[type] = shieldDmg;
      perShotVsShield += shieldDmg;
    }
  }

  const shotsToBreakShield = hasShields && perShotVsShield > 0
    ? Math.ceil(scaledShields / perShotVsShield)
    : 0;

  const shotsToKillHealth = perShotVsHealth > 0
    ? Math.ceil(scaledHealth / perShotVsHealth)
    : Infinity;

  const shotsToKill = shotsToBreakShield + (Number.isFinite(shotsToKillHealth) ? shotsToKillHealth : 0);

  const burstTtk = fireRate > 0 ? shotsToKill / fireRate : Infinity;

  let sustainedTtk = burstTtk;
  if (magazine > 0 && fireRate > 0 && reloadSpeed > 0 && shotsToKill > magazine) {
    const firingTime = shotsToKill / fireRate;
    const reloadCycles = Math.ceil(shotsToKill / magazine) - 1;
    sustainedTtk = firingTime + Math.max(0, reloadCycles) * reloadSpeed;
  }

  const totalPool = scaledShields + scaledHealth;
  const effectiveDps = sustainedTtk > 0 && Number.isFinite(sustainedTtk)
    ? totalPool / sustainedTtk
    : 0;
  const burstEffectiveDps = burstTtk > 0 && Number.isFinite(burstTtk)
    ? totalPool / burstTtk
    : 0;
  const multiTargetEffectiveDps = effectiveDps * enemy.multiTarget;

  return {
    damagePerShotVsShield: perShotVsShield,
    damagePerShotVsHealth: perShotVsHealth,
    damagePerTypeVsHealth,
    damagePerTypeVsShield,
    shotsToBreakShield,
    shotsToKillHealth,
    shotsToKill,
    timeToKill: Number.isFinite(burstTtk) ? burstTtk : 0,
    sustainedTimeToKill: Number.isFinite(sustainedTtk) ? sustainedTtk : 0,
    effectiveDps,
    burstEffectiveDps,
    multiTargetEffectiveDps,
  };
}
