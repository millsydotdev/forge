import { describe, it, expect } from 'vitest';
import {
  parseOverframeJson,
  parseBuildCode,
} from '../features/build-planner/services/overframe-importer';

describe('parseOverframeJson', () => {
  it('returns failure for empty object', () => {
    const result = parseOverframeJson({});
    expect(result.success).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('returns failure for null input', () => {
    const result = parseOverframeJson(null);
    expect(result.success).toBe(false);
  });

  it('extracts warframe name from build data', () => {
    const input = {
      build: {
        warframe: { name: 'Excalibur Umbra' },
        mods: [],
      },
    };
    const result = parseOverframeJson(input);
    expect(result.success).toBe(true);
    expect(result.warframe?.name).toBe("Excalibur Umbra");
  });

  it('extracts warframe name from warframe string field', () => {
    const input = { build: { warframe: 'Rhino', mods: [] } };
    const result = parseOverframeJson(input);
    expect(result.warframe?.name).toBe('Rhino');
  });

  it('parses warframe mods', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [{
          name: 'Warframe Mods',
          type: 'warframe',
          mods: [
            { name: 'Intensify', rank: 9 },
            { name: 'Continuity', rank: 9 },
          ],
        }],
      },
    };
    const result = parseOverframeJson(input);
    expect(result.mods).toHaveLength(2);
    expect(result.mods![0].name).toBe('Intensify');
    expect(result.mods![1].rank).toBe(9);
  });

  it('parses warframe mods with modName field', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [{
          name: 'Warframe Mods',
          mods: [{ modName: 'Vitality', rank: 10 }],
        }],
      },
    };
    const result = parseOverframeJson(input);
    expect(result.mods![0].name).toBe('Vitality');
  });

  it('parses arcanes', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [],
        arcanes: [
          { name: 'Arcane Energize', rank: 5 },
          { name: 'Arcane Guardian', rank: 3 },
        ],
      },
    };
    const result = parseOverframeJson(input);
    expect(result.arcanes).toHaveLength(2);
    expect(result.arcanes![0].name).toBe('Arcane Energize');
    expect(result.arcanes![0].rank).toBe(5);
  });

  it('parses arcanes from arcane field (singular)', () => {
    const input = { build: { warframe: 'Volt', mods: [], arcane: [{ name: 'Arcane Strike', rank: 4 }] } };
    const result = parseOverframeJson(input);
    expect(result.arcanes![0].name).toBe('Arcane Strike');
  });

  it('parses archon shards', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [],
        shards: [
          { color: 'azure', tauforged: true },
          { type: 'crimson', isTau: false },
        ],
      },
    };
    const result = parseOverframeJson(input);
    expect(result.shards).toHaveLength(2);
    expect(result.shards![0].color).toBe('azure');
    expect(result.shards![0].isTau).toBe(true);
    expect(result.shards![1].color).toBe('crimson');
  });

  it('parses weapons with slot mapping', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [],
        weapons: {
          primary: { name: 'Braton Prime', mods: [{ name: 'Serration', rank: 10 }] },
          secondary: { name: 'Lex Prime', mods: [] },
          melee: { name: 'Gram Prime', mods: [] },
        },
      },
    };
    const result = parseOverframeJson(input);
    expect(result.primary?.name).toBe('Braton Prime');
    expect(result.primary?.mods).toHaveLength(1);
    expect(result.secondary?.name).toBe('Lex Prime');
    expect(result.melee?.name).toBe('Gram Prime');
  });

  it('maps rifle/bow/pistol slots to primary/secondary', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [],
        weapons: {
          rifle: { name: 'Braton', mods: [] },
          pistol: { name: 'Lex', mods: [] },
        },
      },
    };
    const result = parseOverframeJson(input);
    expect(result.primary?.name).toBe('Braton');
    expect(result.secondary?.name).toBe('Lex');
  });

  it('parses helminth ability', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [],
        helminth: { ability: 'Roar' },
      },
    };
    const result = parseOverframeJson(input);
    expect(result.helminth?.abilityName).toBe('Roar');
  });

  it('parses helminth from helminthAbility field (string)', () => {
    const input = { build: { warframe: 'Volt', mods: [], helminthAbility: 'Warcry' } };
    const result = parseOverframeJson(input);
    expect(result.helminth?.abilityName).toBe('Warcry');
  });

  it('handles weapon arcanes', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [],
        weapons: {
          primary: {
            name: 'Braton',
            mods: [],
            arcanes: [{ name: 'Primary Merciless', rank: 5 }],
          },
        },
      },
    };
    const result = parseOverframeJson(input);
    expect(result.primary?.arcanes).toHaveLength(1);
    expect(result.primary?.arcanes![0].name).toBe('Primary Merciless');
  });

  it('handles polarity extraction', () => {
    const input = {
      build: {
        warframe: 'Volt',
        mods: [{
          name: 'Warframe Mods',
          type: 'warframe',
          mods: [{ name: 'Intensify', rank: 9, polarity: 'Madurai' }],
        }],
      },
    };
    const result = parseOverframeJson(input);
    expect(result.mods![0].polarity).toBe('MADURAI');
  });

  it('parses mod groups from loadout.mods', () => {
    const input = {
      build: {
        warframe: 'Nezha',
        loadout: {
          mods: [{ name: 'Warframe Mods', mods: [{ name: 'Reaping Chakram', rank: 0 }] }],
        },
      },
    };
    const result = parseOverframeJson(input);
    expect(result.mods![0].name).toBe('Reaping Chakram');
  });

  it('sets success=false and warns on parse error', () => {
    // null doesn't throw in findBuildInJson but will lack build data
    const result = parseOverframeJson({ warframe: null, mods: null });
    expect(result.success).toBe(false);
  });
});

describe('parseBuildCode', () => {
  it('detects tndx1: prefix', () => {
    const code = `tndx1:${btoa(JSON.stringify({ v: 1 }))}`;
    const result = parseBuildCode(code);
    expect(result.success).toBe(false);
    expect(result.warnings[0]).toMatch(/Native Forge build code/);
  });

  it('parses JSON directly', () => {
    const result = parseBuildCode(JSON.stringify({ build: { warframe: 'Wisp', mods: [] } }));
    expect(result.success).toBe(true);
    expect(result.warframe?.name).toBe('Wisp');
  });

  it('rejects invalid input', () => {
    const result = parseBuildCode('garbage input');
    expect(result.success).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
