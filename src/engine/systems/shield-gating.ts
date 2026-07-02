/**
 * Shield Gating System
 *
 * Warframe shield gating (post-Update 31.5):
 * - Full shield break: 1.3s invulnerability
 * - Partial shield depletion: 0.33s invulnerability
 * - Gate requires full shield recharge to reset
 * - Overshields do not reset gate
 * - Cannot re-trigger during active gate
 *
 * These values significantly alter effective survivability beyond
 * simple raw EHP calculations.
 */

export interface ShieldGateParams {
  maxShields: number;
  currentShields: number;
  overshields: number;
  shieldRechargeDelay: number;
  shieldRechargeRate: number;
  hasGateAvailable: boolean;
  isCurrentlyGated: boolean;
  gateTimerRemaining: number;
}

export interface ShieldGateResult {
  effectiveHp: number;
  gateUptimeFraction: number;
  timeToFullGateReset: number;
  estimatedEhpWithGating: number;
  gateCyclesPerSecond: number;
}

const FULL_GATE_DURATION = 1.3;
const PARTIAL_GATE_DURATION = 0.33;
const OVERGATE_MAX = 1200;

/**
 * Calculate effective invulnerability uptime from shield gating.
 * This gives a better survivability estimate than static EHP.
 */
export function calculateShieldGating(params: ShieldGateParams): ShieldGateResult {
  const {
    maxShields,
    currentShields,
    overshields,
    shieldRechargeDelay,
    shieldRechargeRate,
  } = params;

  const totalShieldPool = maxShields + Math.min(overshields, OVERGATE_MAX);

  // Time to fully recharge shields from 0
  // Formula: delay + (maxShields / rechargeRate)
  const timeToFullRecharge = shieldRechargeDelay + (maxShields / Math.max(shieldRechargeRate, 1));

  // Gate duration depends on whether shields were fully depleted
  // Full depletion = 1.3s gate, partial = 0.33s
  const gateDuration = currentShields >= maxShields ? FULL_GATE_DURATION : PARTIAL_GATE_DURATION;

  // Effective gate cycles per second (steady state)
  // One cycle = shield depletion + gate + recharge
  const timeToDepleteShields = maxShields / Math.max(currentShields || 1, 1); // placeholder — depends on incoming DPS
  const cycleTime = timeToDepleteShields + gateDuration + timeToFullRecharge;
  const gateCyclesPerSecond = cycleTime > 0 ? 1 / cycleTime : 0;

  // Gate uptime fraction: proportion of time spent invulnerable
  const gateUptimeFraction = gateDuration / Math.max(cycleTime, 0.01);

  // Estimated EHP with gating factored in
  // If the warframe is invulnerable for X% of the time, effective incoming
  // DPS is reduced by that fraction
  const rawEhp = currentShields + (maxShields * (1 + (params as any).armor / 300));
  const ehpWithGating = gateUptimeFraction > 0
    ? rawEhp / (1 - gateUptimeFraction)
    : rawEhp;

  return {
    effectiveHp: totalShieldPool,
    gateUptimeFraction: Math.min(gateUptimeFraction, 0.95),
    timeToFullGateReset: timeToFullRecharge,
    estimatedEhpWithGating: Math.round(ehpWithGating),
    gateCyclesPerSecond,
  };
}

/**
 * Simplified shield gate EHP multiplier for use in the stat processor.
 * Returns a multiplier that can be applied to raw EHP to estimate
 * the survivability benefit of shield gating.
 */
export function shieldGateEhpMultiplier(
  maxShields: number,
  shieldRecharge: number,
  shieldRechargeDelay: number,
  _armor: number,
): number {
  if (maxShields <= 0) return 1.0;

  const rechargeTime = shieldRechargeDelay + (maxShields / Math.max(shieldRecharge, 1));
  const gateUptime = FULL_GATE_DURATION / (FULL_GATE_DURATION + rechargeTime);
  const effectiveMultiplier = 1 / Math.max(1 - gateUptime, 0.1);

  return Math.min(effectiveMultiplier, 10);
}
