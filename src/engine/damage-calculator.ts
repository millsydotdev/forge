export interface DamageTypes {
  impact?: number;
  puncture?: number;
  slash?: number;
  heat?: number;
  cold?: number;
  electric?: number;
  toxin?: number;
  blast?: number;
  corrosive?: number;
  gas?: number;
  magnetic?: number;
  radiation?: number;
  viral?: number;
  void?: number;
  [key: string]: number | undefined;
}

const PHYSICAL_KEYS = new Set(['impact', 'puncture', 'slash']);

const PHYSICAL_WEIGHT = 4;
const ELEMENTAL_WEIGHT = 1;

/**
 * Calculates the probability of each damage type being chosen for a status
 * proc, following Warframe's weighting rules:
 *
 * 1. Physical types (Impact, Puncture, Slash) have a 4x weight multiplier
 *    compared to elemental types.
 * 2. For each damage type, weightedValue = value × weight.
 * 3. A type's proc probability = weightedValue / totalWeightedSum.
 *
 * Example with { impact: 100, slash: 100, heat: 50 }:
 *   Weighted: impact = 100×4 = 400, slash = 100×4 = 400, heat = 50×1 = 50
 *   Total weighted = 850
 *   Impact = 400/850 ≈ 47.06%
 *   Slash  = 400/850 ≈ 47.06%
 *   Heat   =  50/850 ≈  5.88%
 */
export function calculateStatusProbabilities(damage: DamageTypes): Record<string, number> {
  const weighted: Record<string, number> = {};
  let totalWeighted = 0;

  for (const [type, value] of Object.entries(damage)) {
    if (!value || value <= 0) continue;
    const weight = PHYSICAL_KEYS.has(type) ? PHYSICAL_WEIGHT : ELEMENTAL_WEIGHT;
    const w = value * weight;
    weighted[type] = w;
    totalWeighted += w;
  }

  if (totalWeighted === 0) return {};

  const probabilities: Record<string, number> = {};
  for (const type of Object.keys(weighted)) {
    probabilities[type] = (weighted[type] / totalWeighted) * 100;
  }

  return probabilities;
}
