import { Polarity } from './build-core';

// ── WFCD string → Polarity ───────────────────────────

const WFCD_POLARITY_MAP: Record<string, Polarity> = {
  madurai: Polarity.MADURAI,
  vazarin: Polarity.VAZARIN,
  naramon: Polarity.NAIRU,
  umbra: Polarity.UMBRA,
  penjaga: Polarity.PENJAGA,
  universal: Polarity.UNIVERSAL,
};

/**
 * Parse a WFCD polarity string (e.g., "madurai", "vazarin") to Polarity enum.
 * @param wfcdPolarity - Lowercase polarity name from WFCD data
 * @returns Polarity enum (defaults to UNIVERSAL if unknown)
 */
export function parsePolarity(wfcdPolarity: string): Polarity {
  return WFCD_POLARITY_MAP[wfcdPolarity.toLowerCase()] ?? Polarity.UNIVERSAL;
}

// ── Display ──────────────────────────────────────────

export const POLARITY_SYMBOL: Record<Polarity, string> = {
  [Polarity.MADURAI]: 'V',
  [Polarity.VAZARIN]: '—',
  [Polarity.NAIRU]: 'D',
  [Polarity.UMBRA]: '◆',
  [Polarity.PENJAGA]: '□',
  [Polarity.UNIVERSAL]: '★',
};

export const POLARITY_COLOR: Record<Polarity, string> = {
  [Polarity.MADURAI]: '#d4af37',
  [Polarity.VAZARIN]: '#4eb5b5',
  [Polarity.NAIRU]: '#8a6de0',
  [Polarity.UMBRA]: '#ff4444',
  [Polarity.PENJAGA]: '#5a8c5a',
  [Polarity.UNIVERSAL]: '#ffffff',
};

export const POLARITY_LABEL: Record<Polarity, string> = {
  [Polarity.MADURAI]: 'Madurai',
  [Polarity.VAZARIN]: 'Vazarin',
  [Polarity.NAIRU]: 'Nairu',
  [Polarity.UMBRA]: 'Umbra',
  [Polarity.PENJAGA]: 'Penjaga',
  [Polarity.UNIVERSAL]: 'Universal',
};

// ── Matching ──────────────────────────────────────────

/**
 * Check if a mod's polarity matches its slot for cost reduction.
 * Universal matches everything; Umbra only matches Umbra.
 * @param modPolarity - Mod's polarity
 * @param slotPolarity - Slot's polarity
 * @returns true if matched (cost halved), false if mismatched (full cost)
 */
export function polarityMatches(modPolarity: Polarity, slotPolarity: Polarity): boolean {
  if (modPolarity === Polarity.UNIVERSAL || slotPolarity === Polarity.UNIVERSAL) return true;
  if (modPolarity === Polarity.UMBRA && slotPolarity === Polarity.UMBRA) return true;
  // Umbra mods partially match Madurai (V) — treated as mismatch
  return modPolarity === slotPolarity;
}

// ── Drain calculation ────────────────────────────────

/**
 * Calculate a mod's drain at a given rank.
 * Standard mods: drain = baseDrain + rank.
 * @param baseDrain - Mod's base drain (at rank 0)
 * @param rank - Current rank (0-10)
 * @returns Drain at that rank
 */
export function modDrainAtRank(baseDrain: number, rank: number): number {
  return baseDrain + rank;
}

/**
 * Calculate the effective capacity cost of a mod in a slot.
 * Matched polarity: ceil(drain / 2). Mismatched: full drain.
 * @param drain - Mod's drain at current rank
 * @param matched - Whether mod polarity matches slot polarity
 * @returns Effective capacity cost
 */
export function effectiveCost(drain: number, matched: boolean): number {
  return matched ? Math.ceil(drain / 2) : drain;
}

// ── Capacity ─────────────────────────────────────────

export interface CapacityBreakdown {
  used: number;
  total: number;
  remaining: number;
  overCap: boolean;
}

/**
 * Warframe capacity = base(30) + auraContribution + MR(0 for calculation)
 * Aura adds its drain to capacity if polarity matched, else subtracts it.
 */
export interface WarframeCapacityInput {
  auraDrain: number;
  auraMatched: boolean;
  modCosts: number[];
  mr?: number;
}

/**
 * Calculate Warframe capacity breakdown.
 * Base: 30 + MR. Aura: adds its drain if matched, subtracts if mismatched.
 * @param input - Warframe capacity inputs
 * @returns CapacityBreakdown (used, total, remaining, overCap)
 */
export function warframeCapacity(input: WarframeCapacityInput): CapacityBreakdown {
  const base = 30;
  const mrBonus = input.mr ?? 0;
  const auraMod = input.auraMatched ? input.auraDrain : -input.auraDrain;
  const total = base + auraMod + mrBonus;
  const used = input.modCosts.reduce((s, c) => s + c, 0);
  return { used, total, remaining: total - used, overCap: used > total };
}

/**
 * Weapon capacity = base(30) + stanceContribution
 * Stance adds its drain to capacity if polarity matched, else subtracts it.
 */
export interface WeaponCapacityInput {
  stanceDrain: number;
  stanceMatched: boolean;
  modCosts: number[];
  mr?: number;
}

/**
 * Calculate Weapon capacity breakdown.
 * Base: 30 + MR. Stance: adds its drain if matched, subtracts if mismatched.
 * @param input - Weapon capacity inputs
 * @returns CapacityBreakdown (used, total, remaining, overCap)
 */
export function weaponCapacity(input: WeaponCapacityInput): CapacityBreakdown {
  const base = 30;
  const mrBonus = input.mr ?? 0;
  const stanceMod = input.stanceMatched ? input.stanceDrain : -input.stanceDrain;
  const total = base + stanceMod + mrBonus;
  const used = input.modCosts.reduce((s, c) => s + c, 0);
  return { used, total, remaining: total - used, overCap: used > total };
}
