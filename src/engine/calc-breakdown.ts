/**
 * CalcBreakdown — the audit trail for a single computed stat.
 *
 * Captures the full math tree so the UI can render a PoB-style tooltip:
 *   Base → + Flat additions → × (1 + Multiplier sum) → = Final
 *
 * Each contribution records its source (mod name, arcane, shard, passive)
 * so users can see exactly which item produced which bonus.
 */

import type { Modifier } from './modifier';

export interface CalcContribution {
  source: string;
  value: number;
  category: 'FLAT' | 'MULTIPLIER';
  priority: number;
}

export interface CalcBreakdown {
  label: string;
  base: number;
  baseSource: string;
  flats: CalcContribution[];
  multipliers: CalcContribution[];
  flatSum: number;
  multiplierSum: number;
  final: number;
  formula: string;
}

/**
 * Build a breakdown from a list of modifiers that all share the same
 * stat::stackingGroup key. The FLAT modifiers sum into `base`/`flatSum`,
 * the MULTIPLIER modifiers sum into `multiplierSum` (stored as the raw
 * sum, e.g. 1.65 for +165%), and the final value is
 * `flatSum × (1 + multiplierSum)`.
 */
export function buildBreakdown(
  label: string,
  mods: Modifier[],
  flatSum: number,
  multiplierSum: number,
  final: number,
): CalcBreakdown {
  const flats: CalcContribution[] = [];
  const multipliers: CalcContribution[] = [];

  for (const m of mods) {
    if (m.category === 'FLAT') {
      flats.push({ source: m.source, value: m.value, category: 'FLAT', priority: m.priority });
    } else {
      multipliers.push({ source: m.source, value: m.value, category: 'MULTIPLIER', priority: m.priority });
    }
  }

  flats.sort((a, b) => a.priority - b.priority);
  multipliers.sort((a, b) => a.priority - b.priority);

  const base = flats.length > 0 ? flats[0]?.value ?? flatSum : flatSum;
  const baseSource = flats.length > 0 ? flats[0]?.source ?? 'Base' : 'Base';
  const addedFlats = flats.slice(1);

  const flatStr = addedFlats.length > 0
    ? addedFlats.map(f => `+${f.value}`).join(' ')
    : '';
  const multStr = multiplierSum > 0
    ? `× (1 + ${multiplierSum.toFixed(3)})`
    : '';

  const parts = [String(base)];
  if (flatStr) parts.push(flatStr);
  if (multStr) parts.push(multStr);
  parts.push(`= ${final.toFixed(1)}`);

  return {
    label,
    base,
    baseSource,
    flats: addedFlats,
    multipliers,
    flatSum,
    multiplierSum,
    final,
    formula: parts.join(' '),
  };
}

/**
 * Group modifiers by their `stat::stackingGroup` key and return a map
 * of key → modifier list. Used by the stat processor to feed
 * buildBreakdown without re-scanning the full modifier array.
 */
export function groupModifiersByKey(mods: Modifier[]): Map<string, Modifier[]> {
  const groups = new Map<string, Modifier[]>();
  for (const m of mods) {
    const key = `${m.stat}::${m.stackingGroup}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return groups;
}
