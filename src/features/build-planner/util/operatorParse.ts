/**
 * Utility helpers for parsing operator focus nodes and arcanes.
 * These are kept separate from the large `useBuildPlanner` hook to keep the hook concise
 * and to allow unit‑testing of the parsing logic.
 */

/**
 * Focus nodes are already supplied as raw strings (e.g. "+10% Ability Strength").
 * The current operator‑calc implementation expects the raw strings, so we simply
 * return the array unchanged. This function exists for future extensibility.
 */
export function parseFocusMods(focusNodes: string[]): string[] {
  return focusNodes;
}

/**
 * Parse arcane stats from a selected arcane.
 * Returns an array of `{ stat: string; value: number }` objects.
 * If `arcane` is falsy or the item cannot be fetched, an empty array is returned.
 */
export async function parseArcaneMods(arcane: string | null): Promise<{ stat: string; value: number }[]> {
  if (!arcane) return [];
  const arcaneDetail = await window.forge.getItemDetail(arcane);
  if (!arcaneDetail) return [];
  // `levelStats` is the correct field per `ItemDetail` definition.
  const levelStats = (arcaneDetail.levelStats ?? []) as { stats: string[] }[];
  const mods: { stat: string; value: number }[] = [];
  for (const ls of levelStats) {
    const stats = ls.stats ?? [];
    for (const raw of stats) {
      const m = (typeof raw === 'string' ? raw : String(raw)).match(/^([+-]?\d+(?:\.\d+)?)%?\s*(.*)$/);
      if (!m) continue;
      const val = parseFloat(m[1]);
      const statName = m[2].trim().toLowerCase();
      let mappedStat: string | null = null;
      if (statName.includes('ability strength')) mappedStat = 'abilityStrength';
      else if (statName.includes('ability duration')) mappedStat = 'duration';
      else if (statName.includes('ability range')) mappedStat = 'range';
      else if (statName.includes('ability efficiency')) mappedStat = 'efficiency';
      else if (statName.includes('health')) mappedStat = 'health';
      else if (statName.includes('shield')) mappedStat = 'shield';
      else if (statName.includes('armor')) mappedStat = 'armor';
      else if (statName.includes('energy')) mappedStat = 'energy';
      else if (statName.includes('sprint speed')) mappedStat = 'sprintSpeed';
      if (mappedStat) {
        mods.push({ stat: mappedStat, value: val });
      }
    }
  }
  return mods;
}
