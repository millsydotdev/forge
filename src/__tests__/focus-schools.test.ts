import { describe, it, expect } from 'vitest';
import { getFocusSchool, getFocusPassives, getResolvedFocusModifiers, FOCUS_SCHOOLS } from '../engine/systems/focus-system';

describe('Focus Schools', () => {
  it('all 5 schools are defined', () => {
    const schools = Object.keys(FOCUS_SCHOOLS);
    expect(schools).toContain('madurai');
    expect(schools).toContain('zenurik');
    expect(schools).toContain('naramon');
    expect(schools).toContain('unairu');
    expect(schools).toContain('vazarin');
  });

  it('Madurai has correct passive', () => {
    const madurai = getFocusSchool('madurai');
    expect(madurai).toBeDefined();
    expect(madurai!.passive[0].stat).toBe('strength');
    expect(madurai!.passive[0].value).toBe(0.2);
    expect(madurai!.passive[1].stat).toBe('physical_damage');
  });

  it('Zenurik gives efficiency passive', () => {
    const zenurik = getFocusSchool('zenurik');
    expect(zenurik!.passive[0].stat).toBe('efficiency');
    expect(zenurik!.passive[0].value).toBe(0.2);
  });

  it('Unairu gives armor passive', () => {
    const passives = getFocusPassives('unairu');
    expect(passives.length).toBe(1);
    expect(passives[0].stat).toBe('armor');
    expect(passives[0].value).toBe(200);
  });

  it('Naramon gives combo chance passive', () => {
    const passives = getFocusPassives('naramon');
    expect(passives[0].stat).toBe('combo_chance');
    expect(passives[0].value).toBe(0.5);
  });

  it('resolves focus modifiers correctly', () => {
    const mods = getResolvedFocusModifiers('madurai', ['Inner Gaze']);
    expect(mods.length).toBeGreaterThan(0);
    const strengthMod = mods.find(m => m.stat === 'strength');
    expect(strengthMod).toBeDefined();
    expect(strengthMod!.value).toBe(0.2);
  });

  it('returns empty for unknown school', () => {
    expect(getFocusSchool('fake')).toBeUndefined();
    expect(getFocusPassives('fake')).toEqual([]);
  });

  it('each school has waybounds defined', () => {
    for (const [, school] of Object.entries(FOCUS_SCHOOLS)) {
      expect(school.waybounds.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each school has an active ability', () => {
    for (const school of Object.values(FOCUS_SCHOOLS)) {
      expect(school.active.name).toBeTruthy();
      expect(school.active.description).toBeTruthy();
    }
  });
});
