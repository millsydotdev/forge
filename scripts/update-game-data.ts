/**
 * Build-time script to generate src/data/game-data.json from @wfcd/items.
 * Run: npx ts-node scripts/update-game-data.ts
 * Or via npm: npm run update-data
 */
import * as fs from 'fs';
import * as path from 'path';
import Items from '@wfcd/items';

interface ExaltedEntry { name: string; slot: string; }
interface IncarnonEntry { uniqueName: string; name: string; }
interface HelminthAbility { donorUniqueName: string; donorName: string; abilityName: string; baseDamage: number; scalingStat: string; scalingFactor: number; damageType: string; }
interface FocusSchool { value: string; label: string; passives: { stat: string; value: number; description: string }[]; }
interface SquadBuff { name: string; description: string; modifiers: { stat: string; value: number; type: 'FLAT' | 'MULTIPLIER' }[]; }
interface EnemyDef { name: string; faction: string; baseHealth: number; baseShields: number; baseArmor: number; armorType: string; healthType: string; shieldType: string; weakness: string[]; resistance: string[]; immune: string[]; }
interface ShardDef { color: string; label: string; stats: { stat: string; value: number; group: string; category: 'FLAT' | 'MULTIPLIER' }[]; }
interface GameData {
  version: string;
  generatedAt: string;
  exaltedWeapons: Record<string, ExaltedEntry>;
  incarnonWeapons: Set<string>;
  helminthAbilities: HelminthAbility[];
  focusSchools: FocusSchool[];
  squadBuffs: SquadBuff[];
  enemies: EnemyDef[];
  shardDefs: ShardDef[];
}

// ── Exalted Weapons ──────────────────────────────────────
// Warframes with a 4th ability that creates an exalted weapon:
// Known exalted ability names and their weapon slot
const EXALTED_ABILITY_MAP: Record<string, { slot: string }> = {
  'Regulators': { slot: 'secondary' },
  'Exalted Blade': { slot: 'melee' },
  'Hysteria': { slot: 'melee' },
  'Dex Pixia': { slot: 'secondary' },
  'Desert Wind': { slot: 'melee' },
  'Primal Fury': { slot: 'melee' },
  'Iron Staff': { slot: 'melee' },
  'Shadow Claws': { slot: 'melee' },
  'Talons': { slot: 'melee' },
  'Artemis Bow': { slot: 'primary' },
  'Ballerina': { slot: 'melee' },
  'Voidrig\'s Arquebex': { slot: 'arch-gun' },
  'Ironbride': { slot: 'melee' },
};

function deriveExalted(all: Items): Record<string, ExaltedEntry> {
  const result: Record<string, ExaltedEntry> = {};
  for (const item of all) {
    if (item.category !== 'Warframes') continue;
    const wf = item as any;
    if (!wf.abilities || !Array.isArray(wf.abilities)) continue;
    for (const ability of wf.abilities) {
      const mapped = EXALTED_ABILITY_MAP[ability.name];
      if (mapped) {
        result[wf.uniqueName] = { name: ability.name, slot: mapped.slot };
        break;
      }
    }
  }
  return result;
}

// ── Incarnon Weapons ─────────────────────────────────────
function deriveIncarnon(all: Items): string[] {
  const result: string[] = [];
  for (const item of all) {
    if (!['Primary', 'Secondary', 'Melee'].includes(item.category)) continue;
    if (item.name?.includes('Incarnon') || item.uniqueName?.includes('Incarnon')) {
      result.push(item.uniqueName);
    }
  }
  return [...new Set(result)].sort();
}

// ── Helminth Abilities ───────────────────────────────────
// Known Helminth donor warframes and their subsumed ability
const HELMINTH_DONORS: Record<string, string> = {
  '/Lotus/Powersuits/Rhino/Rhino': 'Roar',
  '/Lotus/Powersuits/Mirage/Mirage': 'Eclipse',
  '/Lotus/Powersuits/Nidus/Nidus': 'Larva',
  '/Lotus/Powersuits/Wukong/Wukong': 'Defy',
  '/Lotus/Powersuits/Grendel/Grendel': 'Nourish',
  '/Lotus/Powersuits/Kullervo/Kullervo': 'Wrathful Advance',
  '/Lotus/Powersuits/Xaku/Xaku': "Xata's Whisper",
  '/Lotus/Powersuits/Sevagoth/Sevagoth': 'Gloom',
  '/Lotus/Powersuits/Protea/Protea': 'Dispensary',
  '/Lotus/Powersuits/Hildryn/Hildryn': 'Pillage',
  '/Lotus/Powersuits/Titania/Titania': 'Spellbind',
  '/Lotus/Powersuits/Ember/Ember': 'Fire Blast',
  '/Lotus/Powersuits/Frost/Frost': 'Ice Wave',
  '/Lotus/Powersuits/Loki/Loki': 'Decoy',
  '/Lotus/Powersuits/Nekros/Nekros': 'Terrify',
  '/Lotus/Powersuits/Trinity/Trinity': 'Well of Life',
  '/Lotus/Powersuits/Nyx/Nyx': 'Mind Control',
  '/Lotus/Powersuits/Excalibur/Excalibur': 'Radial Blind',
  '/Lotus/Powersuits/Mag/Mag': 'Pull',
  '/Lotus/Powersuits/Volt/Volt': 'Shock',
  '/Lotus/Powersuits/Ash/Ash': 'Seeking Shuriken',
  '/Lotus/Powersuits/Atlas/Atlas': 'Petrify',
  '/Lotus/Powersuits/Banshee/Banshee': 'Silence',
  '/Lotus/Powersuits/Chroma/Chroma': 'Elemental Ward',
  '/Lotus/Powersuits/Ivara/Ivara': 'Quiver',
  '/Lotus/Powersuits/Limbo/Limbo': 'Banish',
  '/Lotus/Powersuits/Mesa/Mesa': 'Shooting Gallery',
  '/Lotus/Powersuits/Oberon/Oberon': 'Smite',
  '/Lotus/Powersuits/Saryn/Saryn': 'Molting',
  '/Lotus/Powersuits/Vauban/Vauban': 'Tesla Nervos',
  '/Lotus/Powersuits/Zephyr/Zephyr': 'Airburst',
  '/Lotus/Powersuits/Hydroid/Hydroid': 'Tempest Barrage',
  '/Lotus/Powersuits/Baruuk/Baruuk': 'Lull',
  '/Lotus/Powersuits/Garuda/Garuda': 'Blood Altar',
  '/Lotus/Powersuits/Khora/Khora': 'Ensnare',
  '/Lotus/Powersuits/Revenant/Revenant': 'Reave',
  '/Lotus/Powersuits/Octavia/Octavia': 'Metronome',
  '/Lotus/Powersuits/Gauss/Gauss': 'Thermal Sunder',
  '/Lotus/Powersuits/Equinox/Equinox': 'Rest & Rage',
  '/Lotus/Powersuits/Nezha/Nezha': 'Fire Walker',
  '/Lotus/Powersuits/Inaros/Inaros': 'Desiccation',
  '/Lotus/Powersuits/Wisp/Wisp': 'Reservoirs',
  '/Lotus/Powersuits/Harrow/Harrow': 'Condemn',
  '/Lotus/Powersuits/Grendel/Grendel': 'Nourish',
};

function deriveHelminth(all: Items): HelminthAbility[] {
  const result: HelminthAbility[] = [];
  const donorEntries = Object.entries(HELMINTH_DONORS);
  // Deduplicate: some warframes map to same uniqueName (e.g. Grendel appears twice, Saryn appears differently)
  const seen = new Set<string>();
  for (const [uniqueName, abilityName] of donorEntries) {
    const key = `${uniqueName}::${abilityName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const wf = (Array.from(all) as any[]).find((i: any) => i.uniqueName === uniqueName && i.category === 'Warframes');
    const donorName = wf?.name ?? uniqueName.split('/').pop() ?? 'Unknown';
    result.push({
      donorUniqueName: uniqueName,
      donorName,
      abilityName,
      baseDamage: 0,
      scalingStat: 'strength',
      scalingFactor: 0,
      damageType: 'Buff',
    });
  }
  // Assign damage data for known damaging helminth abilities
  const dmgMap: Record<string, { baseDamage: number; scalingFactor: number; damageType: string }> = {
    'Wrathful Advance': { baseDamage: 500, scalingFactor: 1.5, damageType: 'True' },
    "Xata's Whisper": { baseDamage: 0, scalingFactor: 0, damageType: 'Void' },
    'Thermal Sunder': { baseDamage: 350, scalingFactor: 1.0, damageType: 'Heat' },
    'Fire Blast': { baseDamage: 400, scalingFactor: 1.0, damageType: 'Heat' },
    'Ice Wave': { baseDamage: 300, scalingFactor: 1.0, damageType: 'Cold' },
    'Shock': { baseDamage: 200, scalingFactor: 1.0, damageType: 'Electric' },
    'Smite': { baseDamage: 350, scalingFactor: 1.0, damageType: 'Radiation' },
    'Pull': { baseDamage: 0, scalingFactor: 0, damageType: 'Magnetic' },
    'Tempest Barrage': { baseDamage: 250, scalingFactor: 1.0, damageType: 'Blast' },
    'Airburst': { baseDamage: 200, scalingFactor: 1.0, damageType: 'Impact' },
    'Seeking Shuriken': { baseDamage: 300, scalingFactor: 1.0, damageType: 'Slash' },
  };
  for (const entry of result) {
    const dmg = dmgMap[entry.abilityName];
    if (dmg) {
      entry.baseDamage = dmg.baseDamage;
      entry.scalingFactor = dmg.scalingFactor;
      entry.damageType = dmg.damageType;
    }
  }
  return result;
}

// ── Focus Schools ────────────────────────────────────────
function deriveFocus(): FocusSchool[] {
  return [
    {
      value: 'madurai', label: 'Madurai', passives: [
        { stat: 'strength', value: 0.2, description: '+20% Ability Strength' },
        { stat: 'physical_damage', value: 0.2, description: '+20% Physical Damage' },
      ],
    },
    {
      value: 'zenurik', label: 'Zenurik', passives: [
        { stat: 'efficiency', value: 0.2, description: '+20% Ability Efficiency' },
      ],
    },
    {
      value: 'naramon', label: 'Naramon', passives: [
        { stat: 'combo_chance', value: 0.5, description: '+50% Combo Count Chance' },
      ],
    },
    {
      value: 'unairu', label: 'Unairu', passives: [
        { stat: 'armor', value: 200, description: '+200 Base Armor' },
      ],
    },
    {
      value: 'vazarin', label: 'Vazarin', passives: [
        { stat: 'health', value: 0.2, description: '+20% Health' },
      ],
    },
  ];
}

// ── Squad Buffs ──────────────────────────────────────────
function deriveBuffs(): SquadBuff[] {
  return [
    { name: 'Roar', description: 'Rhino Roar (+30% final damage)', modifiers: [{ stat: 'faction_damage_all', value: 0.30, type: 'MULTIPLIER' }] },
    { name: 'Eclipse', description: 'Mirage Eclipse (+150% base damage)', modifiers: [{ stat: 'base_damage', value: 1.50, type: 'MULTIPLIER' }] },
    { name: 'Warcry', description: 'Valkyr Warcry (+50% Armor, +50% AS)', modifiers: [{ stat: 'armor', value: 0.50, type: 'MULTIPLIER' }, { stat: 'attack_speed', value: 0.50, type: 'MULTIPLIER' }] },
    { name: "Xata's Whisper", description: "Xata's Whisper (+100% Void damage)", modifiers: [{ stat: 'elemental_void', value: 1.0, type: 'MULTIPLIER' }] },
    { name: 'Vex Armor', description: 'Chroma Vex Armor (+350% armor, +275% dmg)', modifiers: [{ stat: 'armor', value: 3.5, type: 'MULTIPLIER' }, { stat: 'base_damage', value: 2.75, type: 'MULTIPLIER' }] },
  ];
}

// ── Enemies ──────────────────────────────────────────────
function deriveEnemies(all: Items): EnemyDef[] {
  // Try to load from WFCD Enemy.json data if available
  try {
    const enemyPath = require.resolve('@wfcd/items/data/json/Enemy.json');
    const enemyData = JSON.parse(fs.readFileSync(enemyPath, 'utf-8'));
    if (Array.isArray(enemyData) && enemyData.length > 0) {
      return enemyData
        .filter((e: any) => e && (e.name || e.uniqueName) && (e.health || e.baseHealth))
        .map((e: any) => {
          const weakness: string[] = [];
          const resistance: string[] = [];
          const immune: string[] = [];
          if (e.dmgTypeMultipliers && typeof e.dmgTypeMultipliers === 'object') {
            for (const [type, mult] of Object.entries(e.dmgTypeMultipliers)) {
              const m = mult as number;
              if (m === 0) immune.push(type);
              else if (m < 1) resistance.push(type);
              else if (m > 1) weakness.push(type);
            }
          } else {
            weakness.push(...(e.weakness ?? []));
            resistance.push(...(e.resistance ?? []));
            immune.push(...(e.immune ?? []));
          }
          return {
            name: e.name ?? 'Unknown',
            faction: e.faction ?? e.type ?? 'Unknown',
            baseHealth: e.health ?? e.baseHealth ?? 100,
            baseShields: e.shields ?? e.shield ?? e.baseShields ?? 0,
            baseArmor: e.armor ?? e.baseArmor ?? 0,
            armorType: e.armorType ?? 'None',
            healthType: e.healthType ?? 'Flesh',
            shieldType: e.shieldType ?? 'None',
            weakness,
            resistance,
            immune,
          };
        });
    }
  } catch {
    // Fall through to manual list
  }

  // Fallback: hardcoded common enemies
  return [
    { name: 'Heavy Gunner', faction: 'Grineer', baseHealth: 700, baseShields: 0, baseArmor: 200, armorType: 'Ferrite', healthType: 'Cloned Flesh', shieldType: 'None', weakness: ['Corrosive', 'Slash', 'Viral'], resistance: ['Impact', 'Gas', 'Electric'], immune: [] },
    { name: 'Bombard', faction: 'Grineer', baseHealth: 500, baseShields: 0, baseArmor: 200, armorType: 'Alloy', healthType: 'Cloned Flesh', shieldType: 'None', weakness: ['Radiation', 'Slash'], resistance: ['Corrosive', 'Toxin'], immune: [] },
    { name: 'Tech', faction: 'Corpus', baseHealth: 300, baseShields: 800, baseArmor: 50, armorType: 'Ferrite', healthType: 'Flesh', shieldType: 'Shield', weakness: ['Magnetic', 'Toxin'], resistance: ['Impact', 'Blast', 'Cold'], immune: [] },
    { name: 'Nox', faction: 'Grineer', baseHealth: 1000, baseShields: 0, baseArmor: 100, armorType: 'Ferrite', healthType: 'Cloned Flesh', shieldType: 'None', weakness: ['Slash', 'Viral'], resistance: ['Heat', 'Corrosive'], immune: ['Toxin'] },
    { name: 'Demolyst', faction: 'Infested', baseHealth: 5000, baseShields: 500, baseArmor: 50, armorType: 'Fossilized', healthType: 'Infested Flesh', shieldType: 'Shield', weakness: ['Heat', 'Corrosive', 'Blast'], resistance: ['Slash', 'Cold'], immune: ['Viral'] },
    { name: 'Eidolon Teralyst', faction: 'Sentient', baseHealth: 15000, baseShields: 5000, baseArmor: 200, armorType: 'Alloy', healthType: 'Sentient', shieldType: 'Shield', weakness: ['Radiation', 'Void'], resistance: ['All'], immune: ['Slash', 'Puncture', 'Impact'] },
    { name: 'Thrax Centurion', faction: 'Orokin', baseHealth: 2000, baseShields: 1500, baseArmor: 100, armorType: 'Ferrite', healthType: 'Orokin', shieldType: 'Shield', weakness: ['Void', 'Toxin'], resistance: ['All'], immune: [] },
    { name: 'Acolyte', faction: 'Grineer', baseHealth: 1200, baseShields: 0, baseArmor: 50, armorType: 'Ferrite', healthType: 'Cloned Flesh', shieldType: 'None', weakness: ['Viral', 'Slash'], resistance: ['Impact', 'Puncture'], immune: [] },
    { name: 'Eximus (Grineer)', faction: 'Grineer', baseHealth: 1000, baseShields: 300, baseArmor: 150, armorType: 'Ferrite', healthType: 'Cloned Flesh', shieldType: 'Shield', weakness: ['Corrosive', 'Magnetic'], resistance: ['Heat', 'Cold'], immune: [] },
    { name: 'Jade Light Eximus', faction: 'Orokin', baseHealth: 1800, baseShields: 600, baseArmor: 100, armorType: 'Alloy', healthType: 'Orokin', shieldType: 'Shield', weakness: ['Void', 'Corrosive'], resistance: ['Heat', 'Cold'], immune: [] },
  ];
}

// ── Shard Defs ───────────────────────────────────────────
function deriveShards(): ShardDef[] {
  return [
    { color: 'crimson', label: 'Strength', stats: [{ stat: 'strength', value: 0.10, group: 'ability', category: 'MULTIPLIER' }] },
    { color: 'azure', label: 'Armor', stats: [{ stat: 'armor', value: 225, group: 'warframe_armor', category: 'FLAT' }] },
    { color: 'amber', label: 'Cast Speed', stats: [{ stat: 'energy', value: 0.075, group: 'warframe_energy', category: 'MULTIPLIER' }] },
    { color: 'violet', label: 'Melee Crit', stats: [{ stat: 'crit_damage', value: 0.10, group: 'weapon_crit_damage', category: 'MULTIPLIER' }] },
    { color: 'topaz', label: 'Heat / Shields', stats: [{ stat: 'elemental_heat', value: 0.25, group: 'weapon_elemental', category: 'MULTIPLIER' }, { stat: 'shields', value: 0.15, group: 'warframe_shields', category: 'MULTIPLIER' }] },
    { color: 'emerald', label: 'Corrosive', stats: [{ stat: 'elemental_corrosive', value: 0.25, group: 'weapon_elemental', category: 'MULTIPLIER' }] },
  ];
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  console.log('[update-game-data] Loading @wfcd/items...');
  const all = new Items();
  console.log(`[update-game-data] Loaded ${all.length} items`);

  const data: GameData = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    exaltedWeapons: deriveExalted(all),
    incarnonWeapons: deriveIncarnon(all),
    helminthAbilities: deriveHelminth(all),
    focusSchools: deriveFocus(),
    squadBuffs: deriveBuffs(),
    enemies: deriveEnemies(all),
    shardDefs: deriveShards(),
  };

  const outPath = path.resolve(__dirname, '../src/data/game-data.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // Store as a JS module that exports a JSON-compatible object
  // Use Sets for incarnonWeapons
  const jsonReady = {
    ...data,
    incarnonWeapons: Array.from(data.incarnonWeapons),
  };

  fs.writeFileSync(outPath, JSON.stringify(jsonReady, null, 2), 'utf-8');
  console.log(`[update-game-data] Written to ${outPath}`);
  console.log(`  Exalted: ${Object.keys(data.exaltedWeapons).length} warframes`);
  console.log(`  Incarnon: ${data.incarnonWeapons.size} weapons`);
  console.log(`  Helminth: ${data.helminthAbilities.length} abilities`);
  console.log(`  Enemies: ${data.enemies.length} entries`);
}

main().catch(console.error);
