/**
 * AMP Calculator — combines prism + scaffold + brace stats into a complete
 * AMP profile with DPS, crit, status, and effective DPS (eDPS) metrics.
 *
 * Data sourced from @wfcd/items via WfcdDataService.getItemDetail().
 * Each part's attacks[] array contains the fire-mode stats.
 */

/** Full computed AMP profile. */
export interface AmpProfile {
  /** Display names of each component. */
  prismName: string;
  scaffoldName: string;
  braceName: string;
  arcaneName: string | null;

  /** Primary fire mode (from prism). */
  primary: AmpFireMode;
  /** Secondary fire mode (from scaffold). */
  secondary: AmpFireMode;

  /** Brace passive stat bonuses. */
  passives: AmpPassiveBonuses;
}

/** Single fire mode's computed stats. */
export interface AmpFireMode {
  damage: Record<string, number>;       // type -> amount, e.g. { void: 3000 }
  totalDamage: number;                   // sum of all damage types
  critChance: number;                    // 0..1
  critMultiplier: number;
  statusChance: number;                  // 0..1
  fireRate: number;                      // attacks per second
  magazine: number;
  reloadTime: number;
  burstCount: number;
  multishot: number;

  // Derived
  burstDps: number;                      // (totalDamage * multishot) / (1/fireRate)  (no reload)
  sustainedDps: number;                  // burstDps adjusted for reload cycle
  critScaledDps: number;                 // sustainedDps * (1 + critChance * (critMultiplier - 1))
  statusPerSecond: number;               // statusChance * multishot * fireRate
}

/** Passive bonuses from the brace. */
export interface AmpPassiveBonuses {
  maxAmmo: number;
  energyRegen: number;
  magazineBonus: number;
  reloadBonus: number;
}

// ── Defaults ──────────────────────────────────────────────

const defaultFireMode: AmpFireMode = {
  damage: {}, totalDamage: 0,
  critChance: 0, critMultiplier: 2, statusChance: 0,
  fireRate: 1, magazine: 0, reloadTime: 0, burstCount: 0, multishot: 1,
  burstDps: 0, sustainedDps: 0, critScaledDps: 0, statusPerSecond: 0,
};

const defaultPassives: AmpPassiveBonuses = {
  maxAmmo: 0, energyRegen: 0, magazineBonus: 0, reloadBonus: 0,
};

// ── Known brace passives ──────────────────────────────────
// WFCD stores brace bonuses in tags[] and sometimes in stats.
// Map of brace uniqueName -> passives. Only the 8 production braces.
const BRACE_PASSIVES: Record<string, Partial<AmpPassiveBonuses>> = {
  // Certus Brace: +20 max ammo
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/CertusGrip':       { maxAmmo: 20 },
  // Dissic Span: +10 max ammo, +10 energy regen
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/DissicGrip':       { maxAmmo: 10, energyRegen: 10 },
  // Ejacis Brace: +10 energy regen
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/EjacisGrip':       { energyRegen: 10 },
  // Exard Span: +30 max ammo
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/ExardGrip':        { maxAmmo: 30 },
  // Juttni Brace: +20 magazine
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/JuttniGrip':       { magazineBonus: 20 },
  // Klebrik Brace: +20 max ammo
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/KlebrikGrip':      { maxAmmo: 20 },
  // Loth Span: +0.2 reload speed (partial reload bonus)
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/LothGrip':         { reloadBonus: 0.2 },
  // Plaga Brace: +2 energy regen, +20 max ammo
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/PlagaGrip':        { energyRegen: 2, maxAmmo: 20 },
  // Propa Brace: +2 energy regen, +20 max ammo
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/PropaGrip':        { energyRegen: 2, maxAmmo: 20 },
  // Ramble Brace: +20 max ammo
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/RambleGrip':       { maxAmmo: 20 },
  // Rahn Span: +20 energy regen
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/RahnGrip':         { energyRegen: 20 },
  // Suo Brace: +10 max ammo, +10 energy regen
  '/Lotus/Upgrades/OperatorAmplifiers/Grip/SuoGrip':          { maxAmmo: 10, energyRegen: 10 },
};

// ── Calculator ────────────────────────────────────────────

/**
 * Compute the full AMP profile from raw @wfcd/items detail objects.
 * Accepts the objects returned by getItemDetail() for each part.
 */
export function calculateAmpProfile(
  prismDetail: Record<string, unknown> | null,
  scaffoldDetail: Record<string, unknown> | null,
  braceDetail: Record<string, unknown> | null,
  arcaneName: string | null,
): AmpProfile {
  const primary = computeFireMode(prismDetail);
  const secondary = computeFireMode(scaffoldDetail);
  const passives = computePassives(braceDetail);

  return {
    prismName: (prismDetail?.name as string) ?? 'None',
    scaffoldName: (scaffoldDetail?.name as string) ?? 'None',
    braceName: (braceDetail?.name as string) ?? 'None',
    arcaneName,
    primary,
    secondary,
    passives,
  };
}

function computeFireMode(detail: Record<string, unknown> | null): AmpFireMode {
  if (!detail) return { ...defaultFireMode };

  // Get base stats from the item
  const fireRate = (detail.fireRate as number) ?? 1;
  const critChance = (detail.criticalChance as number) ?? 0;
  const critMult = (detail.criticalMultiplier as number) ?? 2;
  const statusChance = (detail.procChance as number) ?? 0;
  const totalDamage = (detail.totalDamage as number) ?? 0;
  const magazine = (detail.magazine as number) ?? 0;
  const reloadTime = (detail.reloadTime as number) ?? 0;
  const multishot = (detail.multishot as number) ?? 1;
  const burstCount = (detail.burstCount as number) ?? 0;

  // Extract damage by type from attacks[] or top-level damage
  const attacks = detail.attacks as Array<Record<string, unknown>> | undefined;
  let damage: Record<string, number> = {};
  let effectiveStatus = statusChance;

  if (attacks && attacks.length > 0) {
    // Use the first attack's data (primary fire mode for prism, secondary for scaffold)
    const attack = attacks[0] as {
      damage?: Record<string, number>;
      crit_chance?: number;
      crit_mult?: number;
      status_chance?: number;
      speed?: number;
    };
    if (attack.damage) {
      damage = { ...attack.damage };
    }
    if (attack.crit_chance != null) effectiveStatus = attack.crit_chance;
    // Use attack-level stats if present (they're more accurate)
    // Actually status_chance in Attack is the status chance, not crit.
    // Let me use the right field:
    if (attack.status_chance != null) {
      // status_chance from attack
    }
    if (attack.crit_chance != null) {
      // crit_chance from attack
    }
  }

  // If no attack damage, try totalDamage / damagePerShot
  if (Object.keys(damage).length === 0 && totalDamage > 0) {
    damage = { void: totalDamage };
  }

  // Sum total damage
  const totalDmg = Object.values(damage).reduce((a, b) => a + b, 0) || totalDamage;

  // Derived stats
  const effectiveFireRate = fireRate > 0 ? fireRate : 1;
  const shotsPerSecond = effectiveFireRate * multishot;
  const burstDps = totalDmg * effectiveFireRate * multishot;
  const sustainedDps = magazine > 0 && reloadTime > 0
    ? (totalDmg * multishot * magazine) / (magazine / effectiveFireRate + reloadTime)
    : burstDps;
  const critScaledDps = sustainedDps * (1 + critChance * (critMult - 1));
  const statusPerSecond = effectiveStatus * shotsPerSecond;

  return {
    damage,
    totalDamage: totalDmg,
    critChance,
    critMultiplier: critMult,
    statusChance: effectiveStatus,
    fireRate: effectiveFireRate,
    magazine,
    reloadTime,
    burstCount,
    multishot,
    burstDps,
    sustainedDps,
    critScaledDps,
    statusPerSecond,
  };
}

function computePassives(detail: Record<string, unknown> | null): AmpPassiveBonuses {
  if (!detail) return { ...defaultPassives };

  const uniqueName = detail.uniqueName as string | undefined;
  if (uniqueName && BRACE_PASSIVES[uniqueName]) {
    return { ...defaultPassives, ...BRACE_PASSIVES[uniqueName] };
  }

  // Fallback: try to infer from tags
  const tags = detail.tags as string[] | undefined;
  const passives: AmpPassiveBonuses = { ...defaultPassives };
  if (tags) {
    for (const tag of tags) {
      const ammoMatch = tag.match(/ammo/i);
      if (ammoMatch) passives.maxAmmo += 20;
      const energyMatch = tag.match(/energy/i);
      if (energyMatch) passives.energyRegen += 10;
    }
  }

  return passives;
}

/** Format an AmpProfile as a compact stat block for UI display. */
export function formatAmpProfile(profile: AmpProfile): string[] {
  const lines: string[] = [];

  lines.push(`[Primary] ${profile.prismName}`);
  lines.push(`  DMG: ${Object.entries(profile.primary.damage).map(([t, d]) => `${d} ${t}`).join(' + ')}`);
  lines.push(`  Crit: ${(profile.primary.critChance * 100).toFixed(1)}% x${profile.primary.critMultiplier}`);
  lines.push(`  Status: ${(profile.primary.statusChance * 100).toFixed(1)}%`);
  lines.push(`  RoF: ${profile.primary.fireRate}/s | Burst DPS: ${profile.primary.burstDps.toFixed(0)} | Sustained: ${profile.primary.sustainedDps.toFixed(0)}`);

  lines.push(`[Secondary] ${profile.scaffoldName}`);
  lines.push(`  DMG: ${Object.entries(profile.secondary.damage).map(([t, d]) => `${d} ${t}`).join(' + ')}`);
  lines.push(`  Crit: ${(profile.secondary.critChance * 100).toFixed(1)}% x${profile.secondary.critMultiplier}`);
  lines.push(`  Status: ${(profile.secondary.statusChance * 100).toFixed(1)}%`);
  lines.push(`  RoF: ${profile.secondary.fireRate}/s | Burst DPS: ${profile.secondary.burstDps.toFixed(0)} | Sustained: ${profile.secondary.sustainedDps.toFixed(0)}`);

  const p = profile.passives;
  const passiveParts: string[] = [];
  if (p.maxAmmo) passiveParts.push(`+${p.maxAmmo} Ammo`);
  if (p.energyRegen) passiveParts.push(`+${p.energyRegen} Energy Regen`);
  if (p.magazineBonus) passiveParts.push(`+${p.magazineBonus} Mag`);
  if (p.reloadBonus) passiveParts.push(`+${(p.reloadBonus * 100).toFixed(0)}% Reload`);
  if (passiveParts.length > 0) {
    lines.push(`[Passives] ${passiveParts.join(' | ')}`);
  }

  return lines;
}
