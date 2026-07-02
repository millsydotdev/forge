/**
 * Kitgun Calculator — combines receiver + grip + barrel stats into a complete
 * secondary firearm profile.
 *
 * Data sourced from @wfcd/items via WfcdDataService.getItemDetail().
 * Each part's attacks[] array contains the fire-mode stats.
 */

export interface KitgunProfile {
  receiverName: string;
  gripName: string;
  barrelName: string;
  primary: KitgunFireMode;
  // Kitgun only has primary fire; secondary fire is not a separate mode for Kitguns
}

export interface KitgunFireMode {
  damage: Record<string, number>; // type -> amount
  totalDamage: number;
  critChance: number; // 0-1
  critMultiplier: number;
  statusChance: number; // 0-1
  fireRate: number; // shots per second
  reloadTime: number; // seconds
  magazine: number;
  // Derived
  dps: number; // (totalDamage * magazine) / (magazine/fireRate + reloadTime)
  statusPerSecond: number;
}

const defaultFireMode: KitgunFireMode = {
  damage: {}, totalDamage: 0,
  critChance: 0, critMultiplier: 2, statusChance: 0,
  fireRate: 1, reloadTime: 1, magazine: 0,
  dps: 0, statusPerSecond: 0,
};

export function calculateKitgunProfile(
  receiver: Record<string, unknown> | null,
  grip: Record<string, unknown> | null,
  barrel: Record<string, unknown> | null,
): KitgunProfile {
  // Base stats come from barrel; receiver & grip mainly affect disposition / passives.
  // For simplicity we just use barrel's attack stats; future work could merge modifiers.
  const primary = computeFireMode(barrel);
  return {
    receiverName: (receiver?.name as string) ?? 'None',
    gripName: (grip?.name as string) ?? 'None',
    barrelName: (barrel?.name as string) ?? 'None',
    primary,
  };
}

function computeFireMode(detail: Record<string, unknown> | null): KitgunFireMode {
  if (!detail) return { ...defaultFireMode };

  const fireRate = (detail.fireRate as number) ?? 1;
  const reloadTime = (detail.reloadTime as number) ?? 1;
  const magazine = (detail.magazine as number) ?? 0;
  const critChance = (detail.criticalChance as number) ?? 0;
  const critMult = (detail.criticalMultiplier as number) ?? 2;
  const statusChance = (detail.procChance as number) ?? 0;

  // Damage from attacks[] or top-level fields
  const attacks = detail.attacks as Array<Record<string, unknown>> | undefined;
  let damage: Record<string, number> = {};
  let totalDamage = 0;

  if (attacks && attacks.length > 0) {
    const attack = attacks[0] as { damage?: Record<string, number> };
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

  const dps = (totalDamage * magazine) / (magazine / fireRate + reloadTime);
  const statusPerSecond = totalDamage * statusChance * fireRate;

  return {
    damage,
    totalDamage,
    critChance,
    critMultiplier: critMult,
    statusChance,
    fireRate,
    reloadTime,
    magazine,
    dps,
    statusPerSecond,
  };
}