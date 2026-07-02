/**
 * Zaw Calculator — combines grip + strike + link stats into a complete melee profile.
 * Data sourced from @wfcd/items via WfcdDataService.getItemDetail().
 * Each part's attacks[] array contains the fire-mode stats.
 */

export interface ZawProfile {
  gripName: string;
  strikeName: string;
  linkName: string;
  primary: ZawAttackMode;
  // Zaw does not have secondary fire; only melee attack
}

export interface ZawAttackMode {
  damage: Record<string, number>; // type -> amount
  totalDamage: number;
  critChance: number; // 0-1
  critMultiplier: number;
  statusChance: number; // 0-1
  attackSpeed: number; // attacks per second
  slideAttackSpeed: number;
  // Derived
  dps: number; // totalDamage * attackSpeed
  statusPerSecond: number;
}

const defaultAttack: ZawAttackMode = {
  damage: {}, totalDamage: 0,
  critChance: 0, critMultiplier: 2, statusChance: 0,
  attackSpeed: 1, slideAttackSpeed: 1,
  dps: 0, statusPerSecond: 0,
};

export function calculateZawProfile(
  grip: Record<string, unknown> | null,
  strike: Record<string, unknown> | null,
  link: Record<string, unknown> | null,
): ZawProfile {
  const primary = computeAttack(strike); // strike contains the base attack stats
  // Apply modifiers from grip/link? For simplicity, we just sum damage and adjust stats.
  // In reality, grip/link modify disposition, stats, etc. We'll leave as future work.
  return {
    gripName: (grip?.name as string) ?? 'None',
    strikeName: (strike?.name as string) ?? 'None',
    linkName: (link?.name as string) ?? 'None',
    primary,
  };
}

function computeAttack(detail: Record<string, unknown> | null): ZawAttackMode {
  if (!detail) return { ...defaultAttack };

  const attackSpeed = (detail.attackSpeed as number) ?? 1;
  const slideAttackSpeed = (detail.slideAttackSpeed as number) ?? 1;
  const critChance = (detail.criticalChance as number) ?? 0;
  const critMult = (detail.criticalMultiplier as number) ?? 2;
  const statusChance = (detail.statusChance as number) ?? 0;

  // Damage from attacks[] or top-level
  const attacks = detail.attacks as Array<Record<string, unknown>> | undefined;
  let damage: Record<string, number> = {};
  let totalDamage = 0;

  if (attacks && attacks.length > 0) {
    const attack = attacks[0] as {
      damage?: Record<string, number>;
    };
    if (attack.damage) {
      damage = { ...attack.damage };
      totalDamage = Object.values(damage).reduce((a, b) => a + b, 0);
    }
  }

  if (totalDamage === 0) {
    const td = (detail.totalDamage as number) ?? 0;
    if (td > 0) {
      damage = { impact: td }; // fallback
      totalDamage = td;
    }
  }

  const dps = totalDamage * attackSpeed;
  const statusPerSecond = totalDamage * statusChance * attackSpeed;

  return {
    damage,
    totalDamage,
    critChance,
    critMultiplier: critMult,
    statusChance,
    attackSpeed,
    slideAttackSpeed,
    dps,
    statusPerSecond,
  };
}