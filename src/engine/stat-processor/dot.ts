import type { ResolvedBucket } from './bucket-ops';
import type { DoTStats } from './types';

export function calculateDoT(
  damagePerType: Record<string, number>,
  totalBase: number,
  factionMult: number,
  fireRate: number,
  multishot: number,
  statusChance: number,
  statusProbs: Record<string, number>,
  buckets: Map<string, ResolvedBucket>,
  statusDuration: number = 1,
): DoTStats {
  const heatModMult = 1 + ((buckets.get('status_damage::weapon_status')?.multiplier ?? 1) - 1);
  const slashDmg = damagePerType['slash'] ?? 0;
  const heatDmg = damagePerType['heat'] ?? 0;
  const toxinDmg = damagePerType['toxin'] ?? 0;
  const gasDmg = damagePerType['gas'] ?? 0;
  const electricDmg = damagePerType['electric'] ?? 0;
  const slashProcChance = (statusProbs['slash'] ?? 0) / 100;
  const heatProcChance = (statusProbs['heat'] ?? 0) / 100;
  const toxinProcChance = (statusProbs['toxin'] ?? 0) / 100;
  const gasProcChance = (statusProbs['gas'] ?? 0) / 100;
  const electricProcChance = (statusProbs['electric'] ?? 0) / 100;

  const viralProcChance = (statusProbs['viral'] ?? 0) / 100;
  const baseProcRate = statusChance * fireRate * multishot;
  const viralUptime = Math.min(1, viralProcChance * baseProcRate * 6);
  const viralMult = 1 + viralUptime;

  const baseDamageTotal = totalBase;
  const procRate = baseProcRate;

  const slashTicks = Math.max(1, Math.round(7 * statusDuration));
  const heatTicks = Math.max(1, Math.round(7 * statusDuration));
  const toxinTicks = Math.max(1, Math.round(11 * statusDuration));
  const gasTicks = Math.max(1, Math.round(7 * statusDuration));
  const electricTicks = Math.max(1, Math.round(3 * statusDuration));

  const slashBleedTick = slashDmg > 0 ? (0.35 * baseDamageTotal) : 0;
  const slashBleedDps = slashBleedTick * slashTicks * procRate * slashProcChance * viralMult;

  const heatBurnTick = heatDmg > 0 ? (0.5 * baseDamageTotal * heatModMult) : 0;
  const heatBurnDps = heatBurnTick * heatTicks * procRate * heatProcChance * viralMult;

  const toxinTick = toxinDmg > 0 ? (0.5 * baseDamageTotal) : 0;
  const toxinDps = toxinTick * toxinTicks * procRate * toxinProcChance * viralMult;

  const gasTick = gasDmg > 0 ? (0.5 * baseDamageTotal) : 0;
  const gasDps = gasTick * gasTicks * procRate * gasProcChance * viralMult;

  const electricTick = electricDmg > 0 ? (0.5 * baseDamageTotal) : 0;
  const electricDps = electricTick * electricTicks * procRate * electricProcChance * viralMult;

  const totalDotDps = slashBleedDps + heatBurnDps + toxinDps + gasDps + electricDps;

  return {
    slashBleedTick, slashBleedDps,
    heatBurnTick, heatBurnDps,
    toxinTick, toxinDps,
    gasTick, gasDps,
    electricTick, electricDps,
    totalDotDps,
  };
}
