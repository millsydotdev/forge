import { describe, it, expect } from 'vitest';
import {
  parsePolarity,
  polarityMatches,
  modDrainAtRank,
  effectiveCost,
  warframeCapacity,
  weaponCapacity,
  POLARITY_SYMBOL,
  POLARITY_COLOR,
  POLARITY_LABEL,
} from '../engine/polarity';
import { Polarity } from '../engine/build-core';

describe('parsePolarity', () => {
  it('maps lowercase madurai to MADURAI', () => {
    expect(parsePolarity('madurai')).toBe(Polarity.MADURAI);
  });

  it('maps lowercase vazarin to VAZARIN', () => {
    expect(parsePolarity('vazarin')).toBe(Polarity.VAZARIN);
  });

  it('maps naramon to NAIRU', () => {
    expect(parsePolarity('naramon')).toBe(Polarity.NAIRU);
  });

  it('maps umbra to UMBRA', () => {
    expect(parsePolarity('umbra')).toBe(Polarity.UMBRA);
  });

  it('maps penjaga to PENJAGA', () => {
    expect(parsePolarity('penjaga')).toBe(Polarity.PENJAGA);
  });

  it('maps universal to UNIVERSAL', () => {
    expect(parsePolarity('universal')).toBe(Polarity.UNIVERSAL);
  });

  it('is case-insensitive', () => {
    expect(parsePolarity('MADURAI')).toBe(Polarity.MADURAI);
    expect(parsePolarity('Madurai')).toBe(Polarity.MADURAI);
  });

  it('falls back to UNIVERSAL for unknown polarity', () => {
    expect(parsePolarity('unknown')).toBe(Polarity.UNIVERSAL);
    expect(parsePolarity('')).toBe(Polarity.UNIVERSAL);
  });
});

describe('polarityMatches', () => {
  it('matches same polarity', () => {
    expect(polarityMatches(Polarity.MADURAI, Polarity.MADURAI)).toBe(true);
    expect(polarityMatches(Polarity.VAZARIN, Polarity.VAZARIN)).toBe(true);
    expect(polarityMatches(Polarity.NAIRU, Polarity.NAIRU)).toBe(true);
    expect(polarityMatches(Polarity.UMBRA, Polarity.UMBRA)).toBe(true);
    expect(polarityMatches(Polarity.PENJAGA, Polarity.PENJAGA)).toBe(true);
  });

  it('does not match different polarities', () => {
    expect(polarityMatches(Polarity.MADURAI, Polarity.VAZARIN)).toBe(false);
    expect(polarityMatches(Polarity.VAZARIN, Polarity.NAIRU)).toBe(false);
    expect(polarityMatches(Polarity.NAIRU, Polarity.MADURAI)).toBe(false);
  });

  it('universal mod matches any slot', () => {
    expect(polarityMatches(Polarity.UNIVERSAL, Polarity.MADURAI)).toBe(true);
    expect(polarityMatches(Polarity.UNIVERSAL, Polarity.VAZARIN)).toBe(true);
    expect(polarityMatches(Polarity.UNIVERSAL, Polarity.UMBRA)).toBe(true);
  });

  it('universal slot matches any mod', () => {
    expect(polarityMatches(Polarity.MADURAI, Polarity.UNIVERSAL)).toBe(true);
    expect(polarityMatches(Polarity.VAZARIN, Polarity.UNIVERSAL)).toBe(true);
    expect(polarityMatches(Polarity.UMBRA, Polarity.UNIVERSAL)).toBe(true);
  });

  it('umbra mod does not match madurai slot (treated as mismatch)', () => {
    expect(polarityMatches(Polarity.UMBRA, Polarity.MADURAI)).toBe(false);
  });

  it('universal + universal matches', () => {
    expect(polarityMatches(Polarity.UNIVERSAL, Polarity.UNIVERSAL)).toBe(true);
  });
});

describe('modDrainAtRank', () => {
  it('equals baseDrain + rank for rank 0', () => {
    expect(modDrainAtRank(6, 0)).toBe(6);
  });

  it('equals baseDrain + rank for rank 3', () => {
    expect(modDrainAtRank(6, 3)).toBe(9);
  });

  it('equals baseDrain + rank for rank 10', () => {
    expect(modDrainAtRank(10, 10)).toBe(20);
  });

  it('handles baseDrain of 0', () => {
    expect(modDrainAtRank(0, 5)).toBe(5);
  });

  it('handles rank 0 with high baseDrain', () => {
    expect(modDrainAtRank(18, 0)).toBe(18);
  });
});

describe('effectiveCost', () => {
  it('matched polarity halves and rounds up', () => {
    expect(effectiveCost(9, true)).toBe(5); // ceil(9/2) = 5
    expect(effectiveCost(10, true)).toBe(5); // ceil(10/2) = 5
    expect(effectiveCost(11, true)).toBe(6); // ceil(11/2) = 6
    expect(effectiveCost(6, true)).toBe(3);  // ceil(6/2) = 3
    expect(effectiveCost(7, true)).toBe(4);  // ceil(7/2) = 4
  });

  it('mismatched polarity uses full drain', () => {
    expect(effectiveCost(9, false)).toBe(9);
    expect(effectiveCost(6, false)).toBe(6);
    expect(effectiveCost(14, false)).toBe(14);
  });

  it('edge case: drain of 1 matched = 1', () => {
    expect(effectiveCost(1, true)).toBe(1);
  });

  it('edge case: drain of 0 matched = 0', () => {
    expect(effectiveCost(0, true)).toBe(0);
  });
});

describe('warframeCapacity', () => {
  it('returns correct capacity with matched aura', () => {
    const result = warframeCapacity({
      auraDrain: 7,
      auraMatched: true,
      modCosts: [5, 9, 7, 7, 7, 7, 7, 7],
    });
    expect(result.total).toBe(37); // 30 + 7
    expect(result.used).toBe(56);
    expect(result.remaining).toBe(-19);
    expect(result.overCap).toBe(true);
  });

  it('returns correct capacity with mismatched aura (penalty)', () => {
    const result = warframeCapacity({
      auraDrain: 7,
      auraMatched: false,
      modCosts: [3, 5],
    });
    expect(result.total).toBe(23); // 30 - 7
    expect(result.used).toBe(8);
    expect(result.remaining).toBe(15);
    expect(result.overCap).toBe(false);
  });

  it('includes MR bonus when provided', () => {
    const result = warframeCapacity({
      auraDrain: 0,
      auraMatched: true,
      modCosts: [10, 10],
      mr: 30,
    });
    expect(result.total).toBe(60); // 30 + 0 + 30
    expect(result.used).toBe(20);
    expect(result.remaining).toBe(40);
  });

  it('detects overcap correctly', () => {
    const result = warframeCapacity({
      auraDrain: 0,
      auraMatched: true,
      modCosts: [31],
    });
    expect(result.total).toBe(30);
    expect(result.overCap).toBe(true);
  });

  it('empty mod costs', () => {
    const result = warframeCapacity({
      auraDrain: 0,
      auraMatched: true,
      modCosts: [],
    });
    expect(result.total).toBe(30);
    expect(result.used).toBe(0);
    expect(result.overCap).toBe(false);
  });
});

describe('weaponCapacity', () => {
  it('returns correct capacity with matched stance', () => {
    const result = weaponCapacity({
      stanceDrain: 7,
      stanceMatched: true,
      modCosts: [5, 9, 7, 7],
    });
    expect(result.total).toBe(37); // 30 + 7
    expect(result.used).toBe(28);
    expect(result.remaining).toBe(9);
    expect(result.overCap).toBe(false);
  });

  it('returns correct capacity with mismatched stance (penalty)', () => {
    const result = weaponCapacity({
      stanceDrain: 7,
      stanceMatched: false,
      modCosts: [10, 10],
    });
    expect(result.total).toBe(23); // 30 - 7
    expect(result.used).toBe(20);
    expect(result.remaining).toBe(3);
  });

  it('includes MR bonus', () => {
    const result = weaponCapacity({
      stanceDrain: 0,
      stanceMatched: true,
      modCosts: [15],
      mr: 20,
    });
    expect(result.total).toBe(50);
  });

  it('detects overcap', () => {
    const result = weaponCapacity({
      stanceDrain: 0,
      stanceMatched: true,
      modCosts: [40],
    });
    expect(result.overCap).toBe(true);
  });
});

describe('polarity constant records', () => {
  it('POLARITY_SYMBOL has all polarities', () => {
    expect(POLARITY_SYMBOL[Polarity.MADURAI]).toBe('V');
    expect(POLARITY_SYMBOL[Polarity.VAZARIN]).toBe('—');
    expect(POLARITY_SYMBOL[Polarity.NAIRU]).toBe('D');
    expect(POLARITY_SYMBOL[Polarity.UMBRA]).toBe('◆');
    expect(POLARITY_SYMBOL[Polarity.PENJAGA]).toBe('□');
    expect(POLARITY_SYMBOL[Polarity.UNIVERSAL]).toBe('★');
  });

  it('POLARITY_COLOR has all polarities', () => {
    expect(POLARITY_COLOR[Polarity.MADURAI]).toBe('#d4af37');
    expect(POLARITY_COLOR[Polarity.VAZARIN]).toBe('#4eb5b5');
    expect(POLARITY_COLOR[Polarity.NAIRU]).toBe('#8a6de0');
    expect(POLARITY_COLOR[Polarity.UMBRA]).toBe('#ff4444');
    expect(POLARITY_COLOR[Polarity.PENJAGA]).toBe('#5a8c5a');
    expect(POLARITY_COLOR[Polarity.UNIVERSAL]).toBe('#ffffff');
  });

  it('POLARITY_LABEL has all polarities', () => {
    expect(POLARITY_LABEL[Polarity.MADURAI]).toBe('Madurai');
    expect(POLARITY_LABEL[Polarity.VAZARIN]).toBe('Vazarin');
    expect(POLARITY_LABEL[Polarity.NAIRU]).toBe('Nairu');
    expect(POLARITY_LABEL[Polarity.UMBRA]).toBe('Umbra');
    expect(POLARITY_LABEL[Polarity.PENJAGA]).toBe('Penjaga');
    expect(POLARITY_LABEL[Polarity.UNIVERSAL]).toBe('Universal');
  });
});
