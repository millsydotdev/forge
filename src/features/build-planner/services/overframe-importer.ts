/**
 * Overframe.gg build importer.
 *
 * Supports two input modes:
 *   1. Share URL (e.g. https://overframe.gg/build/123456/)
 *   2. Raw build code
 *
 * The parser fetches the page HTML, extracts embedded JSON data,
 * and maps it to the TennoDex build format.
 */

import { logger } from '../../../utils/logger';

export interface OverframeImportResult {
  warframe?: { id: string; name: string };
  mods?: { name: string; rank: number; polarity?: string }[];
  arcanes?: { name: string; rank: number }[];
  shards?: { color: string; isTau: boolean }[];
  primary?: OverframeWeaponImport;
  secondary?: OverframeWeaponImport;
  melee?: OverframeWeaponImport;
  helminth?: { donorName: string; abilityName: string };
  exaltedWeapon?: OverframeWeaponImport;
  warnings: string[];
  success: boolean;
}

export interface OverframeWeaponImport {
  name: string;
  mods?: { name: string; rank: number; polarity?: string }[];
  arcanes?: { name: string; rank: number }[];
}

/** Normalize a mod/weapon name for WFCD lookup */
function normalizeName(name: string): string {
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
    .replace(/[‐‑–—]/g, '-');
}

/** Known Overframe weapon slot mapping */
const OVERFRAME_SLOTS: Record<string, string> = {
  'primary': 'primary',
  'rifle': 'primary',
  'shotgun': 'primary',
  'bow': 'primary',
  'secondary': 'secondary',
  'pistol': 'secondary',
  'melee': 'melee',
};

/** Known Overframe → WFCD polarity mapping */
const POLARITY_MAP: Record<string, string> = {
  'madurai': 'MADURAI',
  'v': 'MADURAI',
  'vazarin': 'VAZARIN',
  'd': 'VAZARIN',
  'naramon': 'NAIRU',
  '—': 'NAIRU',
  'nairu': 'NAIRU',
  'penjaga': 'PENJAGA',
  'umbra': 'UMBRA',
  'universal': 'UNIVERSAL',
  'none': 'UNIVERSAL',
};

function parsePolarity(pol: string): string {
  const p = (pol || '').toLowerCase().trim();
  return POLARITY_MAP[p] ?? 'UNIVERSAL';
}

/** Recursively search for build data in a parsed JSON object */
function findBuildInJson(obj: unknown, depth = 0): unknown {
  if (depth > 10 || !obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;
  if (o.builds || o.build) {
    if (Array.isArray(o.builds) && o.builds.length > 0) return o.builds[0] as unknown;
    return o.build;
  }
  if (Array.isArray(o)) {
    for (const item of o) {
      const result = findBuildInJson(item, depth + 1);
      if (result) return result;
    }
    return null;
  }
  // Search through keys
  for (const key of Object.keys(o)) {
    if (key === 'build' || key === 'builds' || key === 'currentBuild') {
      return o[key];
    }
    if (typeof o[key] === 'object' && o[key] !== null) {
      const result = findBuildInJson(o[key], depth + 1);
      if (result) return result;
    }
  }
  return null;
}

/** Main parser: takes raw JSON from Overframe, returns import result */
export function parseOverframeJson(json: unknown): OverframeImportResult {
  const warnings: string[] = [];
  const result: OverframeImportResult = { warnings, success: false };

  try {
    // First try to find the build data in the JSON
    const buildData = findBuildInJson(json) as Record<string, unknown>;
    if (!buildData) {
      warnings.push('Could not locate build data in page. Try pasting the share link directly.');
      result.success = false;
      return result;
    }

    // Extract warframe
    const frameName = (buildData.warframe as Record<string, unknown>)?.name as string | undefined ?? buildData.warframe as string | undefined ?? (buildData.frame as Record<string, unknown>)?.name as string | undefined;
    if (frameName) {
      result.warframe = { id: '', name: normalizeName(frameName) };
    } else {
      warnings.push('No warframe detected in build data.');
    }

    // Extract mod groups
    const modGroups = buildData.mods ?? buildData.modGroups ?? (buildData.loadout as Record<string, unknown>)?.mods ?? [];

    // Warframe mods
    const frameMods = (modGroups as Array<Record<string, unknown>>).find((g) =>
      (g.name?.toString().toLowerCase().includes('warframe') || g.type === 'warframe'))?.mods ?? [];
    if (Array.isArray(frameMods) && frameMods.length > 0) {
      result.mods = (frameMods as Array<Record<string, unknown>>).map((m) => ({
        name: normalizeName((m.name ?? m.modName ?? '') as string),
        rank: (m.rank as number) ?? 0,
        polarity: parsePolarity((m.polarity ?? '') as string),
      })).filter((m) => m.name);
    }

    // Arcanes
    const arcaneList = buildData.arcanes ?? buildData.arcane ?? [];
    if (Array.isArray(arcaneList) && arcaneList.length > 0) {
      result.arcanes = (arcaneList as Array<Record<string, unknown>>).map((a) => ({
        name: normalizeName((a.name ?? a.arcaneName ?? '') as string),
        rank: (a.rank as number) ?? 0,
      })).filter((a) => a.name);
    }

    // Archon Shards
    const shardList = buildData.shards ?? buildData.archonShards ?? [];
    if (Array.isArray(shardList) && shardList.length > 0) {
      result.shards = (shardList as Array<Record<string, unknown>>).map((s) => {
        const color = ((s.color ?? s.type ?? '') as string).toLowerCase();
        return {
          color: ['crimson', 'azure', 'amber', 'violet', 'topaz', 'emerald'].includes(color) ? color : 'crimson',
          isTau: !!(s.tauforged ?? s.isTau ?? false),
        };
      });
    }

    // Helminth
    const helminthAbility = (buildData.helminth as Record<string, unknown>)?.ability ?? buildData.helminthAbility;
    if (helminthAbility) {
      result.helminth = {
        donorName: typeof helminthAbility === 'string' ? helminthAbility : normalizeName((helminthAbility as Record<string, unknown>).name as string ?? (helminthAbility as Record<string, unknown>).donor as string ?? ''),
        abilityName: typeof helminthAbility === 'string' ? helminthAbility : normalizeName((helminthAbility as Record<string, unknown>).name as string ?? ''),
      };
    }

    // Weapons
    const weaponSlots = buildData.weapons ?? (buildData.loadout as Record<string, unknown>)?.weapons ?? [];
    for (const [slot, weapon] of Object.entries(weaponSlots) as [string, Record<string, unknown>][]){
      const normalizedSlot = OVERFRAME_SLOTS[slot.toLowerCase()] ?? slot.toLowerCase();
      if (!['primary', 'secondary', 'melee'].includes(normalizedSlot)) continue;
      const weaponResult: OverframeWeaponImport = {
        name: normalizeName((weapon.name ?? weapon.weaponName ?? normalizedSlot) as string),
      };
      if (Array.isArray(weapon.mods)) {
        weaponResult.mods = (weapon.mods as Array<Record<string, unknown>>).map((m) => ({
          name: normalizeName((m.name ?? m.modName ?? '') as string),
          rank: (m.rank as number) ?? 0,
          polarity: parsePolarity((m.polarity ?? '') as string),
        })).filter((m) => m.name);
      }
      if (Array.isArray(weapon.arcanes)) {
        weaponResult.arcanes = (weapon.arcanes as Array<Record<string, unknown>>).map((a) => ({
          name: normalizeName((a.name ?? '') as string),
          rank: (a.rank as number) ?? 0,
        })).filter((a) => a.name);
      }
      (result as unknown as Record<string, OverframeWeaponImport>)[normalizedSlot] = weaponResult;
    }

    result.success = true;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    warnings.push(`Parse error: ${errorMsg}`);
    result.success = false;
  }

  return result;
}

/** Fetch and parse an Overframe build URL */
export async function fetchOverframeBuild(url: string): Promise<OverframeImportResult> {
  const trimmed = url.trim();

  if (!trimmed.startsWith('http')) {
    return { warnings: ['Invalid URL format. Please paste an Overframe share link.'], success: false };
  }

  try {
    const response = await window.forge.fetchBuildPage(trimmed);
    if (!response.success) {
      return { warnings: [response.error || 'Failed to fetch build page.'], success: false };
    }
    return parseOverframeJson(response.data);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return { warnings: [`Import error: ${errorMsg}`], success: false };
  }
}

/** Parse a raw build code string (base64 or JSON) */
export function parseBuildCode(code: string): OverframeImportResult {
  const trimmed = code.trim();
  const warnings: string[] = [];

  // Try base64 decode with tndx1: prefix
  if (trimmed.startsWith('tndx1:')) {
    try {
      JSON.parse(atob(trimmed.slice(6)));
      warnings.push('Native Forge build code detected. Use the Import function instead.');
      return { warnings, success: false };
} catch (e) { logger.error('Failed to parse base64 build code:', e);
      warnings.push('Invalid build code format.');
      return { warnings, success: false };
    }
  }

  // Try as direct JSON
  try {
    const json = JSON.parse(trimmed);
    return parseOverframeJson(json);
  } catch {
    // Not JSON
  }

  warnings.push('Could not parse input. Please paste an Overframe share link or valid build code.');
  return { warnings, success: false };
}
