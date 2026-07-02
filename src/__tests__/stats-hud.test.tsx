import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsHUD } from '../features/build-planner/components/stats-hud';
import type { CalculatedStats, WeaponStats } from '../engine/stat-processor';

function emptyWeaponStats(overrides?: Partial<WeaponStats>): WeaponStats {
  return {
    totalDamage: 100, totalBase: 80, multishot: 1, critChance: 0.25,
    critMultiplier: 2, fireRate: 10, statusChance: 0.3, reloadSpeed: 2,
    magazine: 50, avgShotDamage: 100, avgDps: 500, sustainedDps: 400,
    burstDps: 600, damagePerType: { slash: 100 }, statusProbs: { slash: 1 },
    critTiers: { yellow: 0.8, orange: 0.15, red: 0.05 },
    dot: { totalDotDps: 0, slash: 0, heat: 0, toxin: 0, gas: 0, electric: 0, viral: 0, slashTick: 0, heatTick: 0, toxinTick: 0, gasTick: 0, electricTick: 0, viralTick: 0 },
    ...overrides,
  };
}

function emptyResult(overrides?: Partial<CalculatedStats>): CalculatedStats {
  return {
    health: 500, shields: 300, armor: 200, energy: 200, ehp: 800,
    sprintSpeed: 1.2, strength: 1, duration: 1, range: 1, efficiency: 1,
    shieldRecharge: 15, shieldRechargeDelay: 3,
    weapons: {}, setBonuses: [],
    ...overrides,
  } as CalculatedStats;
}

describe('StatsHUD', () => {
  it('shows empty state when result is null', () => {
    render(<StatsHUD result={null} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={undefined} />);
    expect(screen.getByText('Select items to see stats')).toBeInTheDocument();
  });

  it('shows loading bar when calculating', () => {
    const { container } = render(<StatsHUD result={emptyResult()} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={{}} calculating />);
    expect(container.querySelector('.calc-loading-bar')).toBeInTheDocument();
  });

  it('renders warframe core stats', () => {
    render(<StatsHUD result={emptyResult()} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={{}} />);
    expect(screen.getAllByText('WARFRAME').length).toBeGreaterThan(0);
    expect(screen.getAllByText('500').length).toBeGreaterThan(0);
  });

  it('renders ability bars for warframe slot', () => {
    render(<StatsHUD result={emptyResult()} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={{}} />);
    expect(screen.getByText('ABILITIES')).toBeInTheDocument();
    const pcts = screen.getAllByText('100%');
    expect(pcts.length).toBe(4);
  });

  it('renders weapon stats for weapon slot', () => {
    const weapons = { primary: emptyWeaponStats() };
    render(<StatsHUD result={emptyResult()} activeSlot="primary" curWeapon={{ id: 'test', mods: [], exilus: null, arcanes: [null, null], slotPolarities: [] }} primerSlot={null} weaponStates={{}} resultWeapons={weapons} />);
    expect(screen.getByText('WEAPON')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
  });

  it('renders companion stats when companion data present', () => {
    const result = emptyResult({
      companion: { health: 300, shields: 200, armor: 100, ehp: 400, shieldRecharge: 10, healthRegen: 0 },
    });
    render(<StatsHUD result={result} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={{}} />);
    expect(screen.getByText('COMPANION')).toBeInTheDocument();
    expect(screen.getByText('Companion Health')).toBeInTheDocument();
  });

  it('renders companion stat values', () => {
    const result = emptyResult({
      companion: { health: 300, shields: 200, armor: 100, ehp: 400, shieldRecharge: 10, healthRegen: 0 },
    });
    render(<StatsHUD result={result} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={{}} />);
    expect(screen.getByText('Companion Shields')).toBeInTheDocument();
    expect(screen.getByText('Companion Armor')).toBeInTheDocument();
    expect(screen.getByText('Companion EHP')).toBeInTheDocument();
  });

  it('renders set bonuses when present', () => {
    const result = emptyResult({
      setBonuses: [{ label: 'Augur', count: 2, maxPieces: 4, statStrings: ['+20% shields on cast'], activeBonus: '+20% shields on cast' }],
    });
    render(<StatsHUD result={result} activeSlot="warframe" curWeapon={null} primerSlot={null} weaponStates={{}} resultWeapons={{}} />);
    expect(screen.getByText('SET BONUSES')).toBeInTheDocument();
    expect(screen.getByText(/Augur/)).toBeInTheDocument();
  });
});
