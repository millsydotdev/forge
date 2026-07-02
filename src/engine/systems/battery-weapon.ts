/**
 * Battery/Charge Weapon System
 *
 * Battery weapons (e.g., Lenz, Basmu, Shedu) use a charge mechanic
 * instead of traditional ammo. They regenerate ammo over time.
 *
 * Charge weapons (e.g., Opticor, Mausolon) have a wind-up time
 * before reaching full power.
 *
 * Both types have distinct DPS calculations compared to standard weapons.
 */

export interface BatteryWeaponParams {
  isBatteryWeapon: boolean;
  isChargeWeapon: boolean;
  maxCharge: number;
  chargeTime: number;
  rechargeDelay: number;
  rechargeRate: number;
  currentCharge: number;
  damagePerCharge: number;
  multishot: number;
  critFactor: number;
  chargeMultiplier: number;
  fireRate: number;
}

export interface BatteryWeaponResult {
  sustainedDps: number;
  burstDps: number;
  chargeTimeEffective: number;
  shotsBeforeDepleted: number;
  timeToRecharge: number;
  avgFireRate: number;
}

/**
 * Calculate DPS for battery weapons.
 *
 * Formula:
 *   burstDPS = damagePerFullCharge × multishot × critFactor / chargeTime
 *   sustainedDPS = fullDamage / (chargeTime + rechargeTime)
 */
export function calculateBatteryWeaponDps(params: BatteryWeaponParams): BatteryWeaponResult {
  const {
    isBatteryWeapon,
    isChargeWeapon,
    maxCharge,
    chargeTime,
    rechargeDelay,
    rechargeRate,
    currentCharge,
    damagePerCharge,
    multishot,
    critFactor,
    chargeMultiplier,
    fireRate,
  } = params;

  if (!isBatteryWeapon && !isChargeWeapon) {
    return {
      sustainedDps: 0, burstDps: 0, chargeTimeEffective: 0,
      shotsBeforeDepleted: 0, timeToRecharge: 0, avgFireRate: 0,
    };
  }

  if (isBatteryWeapon) {
    // Battery weapons: ammo regenerates, infinite ammo
    const damagePerShot = damagePerCharge * multishot * critFactor;
    const shotsBeforeEmpty = currentCharge > 0
      ? Math.floor(currentCharge / (damagePerCharge || 1))
      : 0;
    const timeToEmpty = shotsBeforeEmpty / Math.max(fireRate, 0.01);
    const timeToFullRecharge = rechargeDelay + (maxCharge / Math.max(rechargeRate, 1));

    // Sustained: alternating fire and recharge
    const totalTimePerCycle = timeToEmpty + timeToFullRecharge;
    const sustainedDps = totalTimePerCycle > 0
      ? (damagePerShot * shotsBeforeEmpty) / totalTimePerCycle
      : 0;

    return {
      burstDps: damagePerShot * fireRate,
      sustainedDps,
      chargeTimeEffective: 0,
      shotsBeforeDepleted: shotsBeforeEmpty,
      timeToRecharge: timeToFullRecharge,
      avgFireRate: totalTimePerCycle > 0
        ? shotsBeforeEmpty / totalTimePerCycle
        : fireRate,
    };
  }

  if (isChargeWeapon) {
    // Charge weapons: hold to charge, release to fire
    const damagePerFullCharge = damagePerCharge * chargeMultiplier * multishot * critFactor;
    const burstDps = chargeTime > 0 ? damagePerFullCharge / chargeTime : 0;

    return {
      burstDps,
      sustainedDps: burstDps, // charge weapons are effectively burst-only
      chargeTimeEffective: chargeTime,
      shotsBeforeDepleted: Infinity,
      timeToRecharge: 0,
      avgFireRate: 1 / Math.max(chargeTime, 0.01),
    };
  }

  return {
    sustainedDps: 0, burstDps: 0, chargeTimeEffective: 0,
    shotsBeforeDepleted: 0, timeToRecharge: 0, avgFireRate: 0,
  };
}
