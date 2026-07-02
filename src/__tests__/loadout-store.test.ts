import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Brand } from '../services/visual-manager';

describe('loadout store (buildStore)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('readLoadouts returns empty object when nothing saved', async () => {
    const { readLoadouts } = await import('../store/buildStore');
    expect(readLoadouts()).toEqual({});
  });

  it('writeLoadouts and readLoadouts round-trip', async () => {
    const { readLoadouts, writeLoadouts } = await import('../store/buildStore');
    writeLoadouts({ 'build1': 'tndx1:abc', 'build2': 'tndx1:def' });
    expect(readLoadouts()).toEqual({ 'build1': 'tndx1:abc', 'build2': 'tndx1:def' });
  });

  it('persists to localStorage', async () => {
    const { writeLoadouts } = await import('../store/buildStore');
    writeLoadouts({ 'test': 'tndx1:xyz' });
    expect(localStorage.getItem(Brand.getStorageKey('loadouts'))).toBe(JSON.stringify({ 'test': 'tndx1:xyz' }));
  });

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem(Brand.getStorageKey('loadouts'), 'not valid json');
    const { readLoadouts } = await import('../store/buildStore');
    expect(readLoadouts()).toEqual({});
  });

  it('overwrites existing loadouts', async () => {
    const { readLoadouts, writeLoadouts } = await import('../store/buildStore');
    writeLoadouts({ 'a': 'code1' });
    writeLoadouts({ 'b': 'code2' });
    expect(readLoadouts()).toEqual({ 'b': 'code2' });
  });
});
