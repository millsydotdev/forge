/**
 * Stealth & Finisher Multiplier System
 *
 * Stealth damage multipliers apply when attacking unaware enemies:
 * - Melee stealth kill: 8× damage (affected by stealth damage mods)
 * - Ranged stealth kill: varies by weapon (snipers: higher)
 * - Finisher damage: bypasses armor, affected by finisher damage mods
 */

export interface StealthParams {
  isStealthed: boolean;
  weaponType: 'melee' | 'primary' | 'secondary' | 'sniper' | 'bow';
  baseDamage: number;
  finisherDamageMod: number;
  stealthDamageMod: number;
  isFinisher: boolean;
  isHeadshot: boolean;
}

export interface StealthResult {
  stealthMultiplier: number;
  finisherMultiplier: number;
  totalMultiplier: number;
  finalDamage: number;
}

const STEALTH_MULTIPLIERS: Record<string, number> = {
  melee: 8.0,
  primary: 2.0,
  secondary: 2.0,
  sniper: 4.0,
  bow: 3.0,
};

const HEADSHOT_BASE_MULTIPLIER = 2.0;

/**
 * Calculate the total damage multiplier from stealth and finisher sources.
 *
 * Stealth multiplier applies when the target is unaware.
 * Finisher multiplier applies to finisher attacks (parazon, stealth finisher).
 * Headshot multiplier applies to headshots (stacks with stealth).
 */
export function calculateStealthFinisher(params: StealthParams): StealthResult {
  const {
    isStealthed,
    weaponType,
    baseDamage,
    finisherDamageMod,
    stealthDamageMod,
    isFinisher,
    isHeadshot,
  } = params;

  let stealthMultiplier = 1.0;
  let finisherMultiplier = 1.0;

  if (isStealthed) {
    const baseStealthMult = STEALTH_MULTIPLIERS[weaponType] ?? 2.0;
    stealthMultiplier = baseStealthMult * (1 + stealthDamageMod);
  }

  if (isFinisher) {
    // Finisher attacks deal TRUE damage (ignores armor completely)
    // Formula: baseDamage × (1 + finisherDamageMods)
    finisherMultiplier = 1 + finisherDamageMod;
  }

  const headshotMultiplier = isHeadshot ? HEADSHOT_BASE_MULTIPLIER : 1.0;

  // Stealth and finisher multipliers are multiplicative
  const totalMultiplier = Math.max(stealthMultiplier, finisherMultiplier) * headshotMultiplier;

  return {
    stealthMultiplier,
    finisherMultiplier,
    totalMultiplier,
    finalDamage: baseDamage * totalMultiplier,
  };
}

/**
 * Calculate finisher damage against an enemy.
 * Finisher damage ignores armor and shields, dealing true damage to health.
 */
export function calculateFinisherDamage(
  baseDamage: number,
  finisherDamageMod: number,
  enemyHealth: number,
  stealthActive: boolean,
): number {
  const stealthMult = stealthActive ? 8.0 : 1.0;
  const totalMult = stealthMult * (1 + finisherDamageMod);
  return Math.min(baseDamage * totalMult, enemyHealth);
}
