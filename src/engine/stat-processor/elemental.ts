import type { Modifier } from '../modifier';

const SINGLE_ELEMENTALS = new Set(['heat', 'cold', 'electric', 'toxin']);

const ELEMENTAL_COMBINE: Record<string, Record<string, string>> = {
  heat: { cold: 'blast', electric: 'radiation', toxin: 'gas' },
  cold: { heat: 'blast', electric: 'magnetic', toxin: 'viral' },
  electric: { heat: 'radiation', cold: 'magnetic', toxin: 'corrosive' },
  toxin: { heat: 'gas', cold: 'viral', electric: 'corrosive' },
};

export function combineElementals(mods: Modifier[]): Modifier[] {
  const collected: { type: string; value: number; indices: number[] }[] = [];
  for (let i = 0; i < mods.length; i++) {
    const m = mods[i];
    if (m.stat.startsWith('elemental_') && m.stackingGroup === 'weapon_elemental') {
      const type = m.stat.slice('elemental_'.length);
      if (!SINGLE_ELEMENTALS.has(type)) continue;
      const existing = collected.find(c => c.type === type);
      if (existing) {
        existing.value += m.value;
        existing.indices.push(i);
      } else {
        collected.push({ type, value: m.value, indices: [i] });
      }
    }
  }

  if (collected.length < 2) return mods;

  const combined: { type: string; value: number }[] = [];
  for (let i = 0; i < collected.length; i += 2) {
    const first = collected[i];
    const second = collected[i + 1];
    if (second) {
      const combinedType = ELEMENTAL_COMBINE[first.type]?.[second.type];
      if (combinedType) {
        combined.push({ type: combinedType, value: first.value + second.value });
      } else {
        combined.push({ type: first.type, value: first.value });
        combined.push({ type: second.type, value: second.value });
      }
    } else {
      combined.push({ type: first.type, value: first.value });
    }
  }

  const removeIndices = new Set(collected.flatMap(c => c.indices));
  const result = mods.filter((_, i) => !removeIndices.has(i));
  for (const c of combined) {
    result.push({
      stat: `elemental_${c.type}`,
      category: 'MULTIPLIER',
      value: c.value,
      stackingGroup: 'weapon_elemental',
      source: 'Combined Elemental',
      priority: 2,
    });
  }
  return result;
}
