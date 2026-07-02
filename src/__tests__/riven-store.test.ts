import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Brand } from '../services/visual-manager';

describe('riven-store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  async function freshStore() {
    return await import('../features/build-planner/services/riven-store');
  }

  it('addRiven returns a unique riven_custom_ id', async () => {
    const { addRiven } = await freshStore();
    const id = addRiven({ name: 'R1', positives: [], negative: null });
    expect(id).toMatch(/^riven_custom_\d+$/);
  });

  it('addRiven returns incrementing ids', async () => {
    const { addRiven } = await freshStore();
    const id1 = addRiven({ name: 'R1', positives: [], negative: null });
    const id2 = addRiven({ name: 'R2', positives: [], negative: null });
    const num1 = parseInt(id1.replace('riven_custom_', ''), 10);
    const num2 = parseInt(id2.replace('riven_custom_', ''), 10);
    expect(num2).toBe(num1 + 1);
  });

  it('getRiven returns stored riven', async () => {
    const { addRiven, getRiven } = await freshStore();
    const data = { name: 'Test', positives: [{ stat: 'base_damage', value: 150 }], negative: null };
    const id = addRiven(data);
    const retrieved = getRiven(id);
    expect(retrieved).toEqual(data);
  });

  it('getRiven returns undefined for unknown id', async () => {
    const { getRiven } = await freshStore();
    expect(getRiven('riven_custom_999999')).toBeUndefined();
  });

  it('deleteRiven removes stored riven', async () => {
    const { addRiven, getRiven, deleteRiven } = await freshStore();
    const id = addRiven({ name: 'R3', positives: [], negative: null });
    deleteRiven(id);
    expect(getRiven(id)).toBeUndefined();
  });

  it('getAllRivens returns all stored rivens', async () => {
    const { addRiven, getAllRivens } = await freshStore();
    addRiven({ name: 'R4', positives: [{ stat: 'base_damage', value: 100 }], negative: null });
    addRiven({ name: 'R5', positives: [{ stat: 'multishot', value: 80 }], negative: null });
    const all = getAllRivens();
    expect(all.size).toBe(2);
  });

  it('persists to localStorage', async () => {
    const { addRiven } = await freshStore();
    const data = { name: 'Riven', positives: [{ stat: 'fire_rate', value: 30 }], negative: null };
    const id = addRiven(data);
    const savedRaw = localStorage.getItem(Brand.getStorageKey('rivens'));
    expect(savedRaw).not.toBeNull();
    const saved = JSON.parse(savedRaw!);
    expect(saved).toHaveLength(1);
    expect(saved[0][0]).toBe(id);
    expect(saved[0][1]).toEqual(data);
  });
});
