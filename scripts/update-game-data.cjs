/**
 * Build-time script to generate src/data/game-data.json from @wfcd/items.
 * Run: node scripts/update-game-data.cjs (or npm run update-data)
 *
 * MILESTONE 3: Now extracts WFCD fields previously ignored:
 *   - Warframe abilities (names, descriptions, base stats)
 *   - Warframe passive descriptions
 *   - Warframe exalted weapon data from WFCD `exalted[]` field
 *   - Enemy data from WFCD Enemy.json (full extraction)
 *   - Companion precepts/abilities from WFCD
 *   - Arcane metadata from WFCD (all ~150 arcanes)
 *   - Focus node data from WFCD
 */

const fs = require('fs');
const path = require('path');

// ── Exalted Weapons ─────────────────────────────────────
// These are derived from BOTH warframe's `exalted[]` WFCD field AND a fallback map.
function deriveExalted(items) {
  const result = {};
  const fallbackMap = {
    'Mesa':           { name: 'Regulators',    slot: 'secondary' },
    'Mesa Prime':     { name: 'Regulators',    slot: 'secondary' },
    'Excalibur':      { name: 'Exalted Blade', slot: 'melee' },
    'Excalibur Prime':{ name: 'Exalted Blade', slot: 'melee' },
    'Excalibur Umbra':{ name: 'Exalted Blade', slot: 'melee' },
    'Valkyr':         { name: 'Hysteria',      slot: 'melee' },
    'Valkyr Prime':   { name: 'Hysteria',      slot: 'melee' },
    'Titania':        { name: 'Dex Pixia',     slot: 'secondary' },
    'Titania Prime':  { name: 'Dex Pixia',     slot: 'secondary' },
    'Baruuk':         { name: 'Desert Wind',   slot: 'melee' },
    'Baruuk Prime':   { name: 'Desert Wind',   slot: 'melee' },
    'Wukong':         { name: 'Iron Staff',    slot: 'melee' },
    'Wukong Prime':   { name: 'Iron Staff',    slot: 'melee' },
    'Sevagoth':       { name: 'Shadow Claws',  slot: 'melee' },
    'Sevagoth Prime': { name: 'Shadow Claws',  slot: 'melee' },
    'Ivara':          { name: 'Artemis Bow',   slot: 'primary' },
    'Ivara Prime':    { name: 'Artemis Bow',   slot: 'primary' },
    'Garuda':         { name: 'Talons',        slot: 'melee' },
    'Garuda Prime':   { name: 'Talons',        slot: 'melee' },
  };

  for (const item of items) {
    if (item.category !== 'Warframes') continue;
    // Try WFCD's `exalted` field first
    if (item.exalted && Array.isArray(item.exalted) && item.exalted.length > 0) {
      result[item.uniqueName] = {
        name: item.exalted[0].name || 'Exalted Weapon',
        slot: item.exalted[0].slot || 'melee',
        source: 'wfcd',
      };
      continue;
    }
    // Fallback to manual map
    const entry = fallbackMap[item.name];
    if (entry) {
      result[item.uniqueName] = { name: entry.name, slot: entry.slot, source: 'manual' };
    }
  }
  return result;
}

// ── Incarnon Weapons ─────────────────────────────────────
function deriveIncarnon(items) {
  const baseNames = [
    'Braton', 'Braton Prime', 'Braton Vandal',
    'Boar', 'Boar Prime', 'Burston', 'Burston Prime',
    'Dread', 'Paris', 'Paris Prime', 'Mk1-Paris',
    'Soma', 'Soma Prime', 'Strun', 'Strun Prime', 'Strun Wraith', 'Mk1-Strun',
    'Torid', 'Vectis', 'Vectis Prime',
    'Boltor', 'Boltor Prime', 'Gorgon', 'Gorgon Wraith',
    'Mutalist Cernos', 'Cernos', 'Cernos Prime',
    'Aklex', 'Aklex Prime', 'Angstrum', 'Prisma Angstrum',
    'Bronco', 'Bronco Prime', 'Despair',
    'Furis', 'Dex Furis', 'Mk1-Furis', 'Kunai',
    'Lato', 'Lato Prime', 'Lato Vandal',
    'Lex', 'Lex Prime', 'Magnus', 'Magnus Prime',
    'Vasto', 'Vasto Prime', 'Viper', 'Viper Wraith',
    'Dual Cestra', 'Bo', 'Bo Prime', 'Mk1-Bo',
    'Ceramic Dagger', 'Dakra Prime', 'Dual Ether',
    'Fang', 'Fang Prime', 'Furax', 'Furax Wraith', 'Mk1-Furax',
    'Glaive', 'Glaive Prime', 'Hate',
    'Jaw Sword', 'Venka', 'Venka Prime',
    'Skana', 'Skana Prime', 'Prisma Skana',
    'Sibear', 'Scoliac', 'Ripkas', 'Mire',
    'Ninkondi', 'Ninkondi Prime', 'Okina', 'Okina Prime',
    'Orthos', 'Orthos Prime', 'Pangolin Sword',
    'Reaper Prime', 'Xoris', 'Magistar', 'Twin Basolk',
    'Kogake', 'Kogake Prime', 'Volnus', 'Sheev',
    'Dragon Nikana', 'Zamzaku', 'Nar Gada',
    'Ack & Brunt', 'Aegrit', 'Afuris', 'Aksomati', 'Aksomati Prime',
    'Baza', 'Baza Prime', 'Boltace', 'Carmine Penta',
    'Cestra', 'Convectrix', 'Daikyu', 'Dera', 'Dera Vandal',
    'Destreza', 'Destreza Prime', 'Endura', 'Flux Rifle',
    'Fragor', 'Fragor Prime', 'Gammacor',
    'Grinlok', 'Guandao', 'Guandao Prime', 'Halikar',
    'Harpak', 'Hikou', 'Hikou Prime', 'Javlok',
    'Kesheg', 'Kestrel', 'Kohm', 'Kraken',
    'Kronen', 'Kronen Prime', 'Lacera', 'Lesion',
    'Marelok', 'Marelok Vandal', 'Miter', 'MK1-Braton',
    'MK1-Kunai', 'MK1-Strun', 'MK1-Bo', 'MK1-Furax', 'MK1-Paris',
    'MK1-Furis', 'Nami Solo', 'Nami Skyla', 'Nami Skyla Prime',
    'Nikana', 'Nikana Prime', 'Panthera', 'Panthera Prime',
    'Paracyst', 'Penta', 'Penta (Secura)',
    'Pox', 'Prova', 'Prova Vandal', 'Pupacyst',
    'Pyrana', 'Pyrana Prime', 'Quanta', 'Quanta Vandal',
    'Quartakk', 'Redeemer', 'Redeemer Prime',
    'Seer', 'Serro', 'Sibear', 'Simulor',
    'Snipetron', 'Snipetron Vandal', 'Spectra', 'Spectra Vandal',
    'Stradavar', 'Stradavar Prime', 'Sydon',
    'Synapse', 'Synoid Gammacor', 'Synoid Simulor',
    'Sybaris', 'Sybaris Prime', 'Tiberon', 'Tiberon Prime',
    'Tipedo', 'Tipedo Prime', 'Tonbo',
    'Twin Gremlins', 'Twin Kohmak', 'Twin Krohkur',
    'Twin Vipers', 'Twin Vipers Wraith', 'Veldt',
    'Zenistar', 'Zhuge', 'Zhuge Prime', 'Zarr',
  ];

  const weaponMap = new Map();
  for (const item of items) {
    if (!['Primary', 'Secondary', 'Melee'].includes(item.category)) continue;
    const n = (item.name || '').toLowerCase().trim();
    if (n) weaponMap.set(n, item.uniqueName);
  }

  const result = [];
  const notFound = [];
  for (const baseName of baseNames) {
    const key = baseName.toLowerCase().trim();
    if (weaponMap.has(key)) {
      result.push(weaponMap.get(key));
      continue;
    }
    let matched = false;
    for (const [wfcdName, uid] of weaponMap) {
      if (wfcdName.startsWith(key) || key.startsWith(wfcdName)) {
        result.push(uid);
        matched = true;
      }
    }
    if (!matched) notFound.push(baseName);
  }
  return [...new Set(result)].sort();
}

// ── Helminth Abilities ──────────────────────────────────
const HELMINTH_DONORS = {
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
  '/Lotus/Powersuits/Dante/Dante': 'Nocturne',
  '/Lotus/Powersuits/Jade/Jade': 'Ophanim',
  '/Lotus/Powersuits/Voruna/Voruna': 'Lycan Hunt',
  '/Lotus/Powersuits/Citrine/Citrine': 'Preserved Gems',
  '/Lotus/Powersuits/Gyre/Gyre': 'Rotorswell',
  '/Lotus/Powersuits/Caliban/Caliban': 'Razor Gyre',
  '/Lotus/Powersuits/Yarelli/Yarelli': 'Merulina',
  '/Lotus/Powersuits/Lavos/Lavos': 'Vial Rush',
  '/Lotus/Powersuits/Xaku/XakuPrime': "Xata's Whisper",
};

const HELMINTH_DMG_MAP = {
  'Wrathful Advance': { baseDamage: 500, scalingFactor: 1.5, damageType: 'True' },
  'Thermal Sunder': { baseDamage: 350, scalingFactor: 1.0, damageType: 'Heat' },
  'Fire Blast': { baseDamage: 400, scalingFactor: 1.0, damageType: 'Heat' },
  'Ice Wave': { baseDamage: 300, scalingFactor: 1.0, damageType: 'Cold' },
  'Shock': { baseDamage: 200, scalingFactor: 1.0, damageType: 'Electric' },
  'Smite': { baseDamage: 350, scalingFactor: 1.0, damageType: 'Radiation' },
  'Tempest Barrage': { baseDamage: 250, scalingFactor: 1.0, damageType: 'Blast' },
  'Airburst': { baseDamage: 200, scalingFactor: 1.0, damageType: 'Impact' },
  'Seeking Shuriken': { baseDamage: 300, scalingFactor: 1.0, damageType: 'Slash' },
};

function deriveHelminth(items) {
  const result = [];
  const seen = new Set();
  for (const [uniqueName, abilityName] of Object.entries(HELMINTH_DONORS)) {
    const key = uniqueName + '::' + abilityName;
    if (seen.has(key)) continue;
    seen.add(key);
    const wf = Array.from(items).find(i => i.uniqueName === uniqueName && i.category === 'Warframes');
    const donorName = wf ? wf.name : (uniqueName.split('/').pop() || 'Unknown');
    const dmg = HELMINTH_DMG_MAP[abilityName] || { baseDamage: 0, scalingFactor: 0, damageType: 'Buff' };
    result.push({
      donorUniqueName: uniqueName,
      donorName,
      abilityName,
      baseDamage: dmg.baseDamage,
      scalingStat: 'strength',
      scalingFactor: dmg.scalingFactor,
      damageType: dmg.damageType,
    });
  }
  return result;
}

// ── Focus Schools (now also extracting from WFCD if available) ──────
function deriveFocus(items) {
  let base = [
    { value: 'madurai', label: 'Madurai', passives: [{ stat: 'strength', value: 0.2, description: '+20% Ability Strength' }, { stat: 'physical_damage', value: 0.2, description: '+20% Physical Damage' }] },
    { value: 'zenurik', label: 'Zenurik', passives: [{ stat: 'efficiency', value: 0.2, description: '+20% Ability Efficiency' }] },
    { value: 'naramon', label: 'Naramon', passives: [{ stat: 'combo_chance', value: 0.5, description: '+50% Combo Count Chance' }] },
    { value: 'unairu', label: 'Unairu', passives: [{ stat: 'armor', value: 200, description: '+200 Base Armor' }] },
    { value: 'vazarin', label: 'Vazarin', passives: [{ stat: 'health', value: 0.2, description: '+20% Health' }] },
  ];
  // Extract focus nodes from WFCD and attach to school data
  try {
    const focusItems = Array.from(items).filter(i =>
      i.category === 'Mods' && i.uniqueName && i.uniqueName.includes('/Lotus/Upgrades/Focus/'),
    );
    if (focusItems.length > 0) {
      // Map WFCD focus nodes → school
      const schoolMap = { madurai: [], zenurik: [], naramon: [], unairu: [], vazarin: [] };
      for (const node of focusItems) {
        const pol = (node.polarity || '').toLowerCase();
        if (schoolMap[pol]) {
          const maxRank = node.fusionLimit || 3;
          const finalStat = (node.levelStats && node.levelStats[maxRank])
            ? node.levelStats[maxRank].stats[0] || ''
            : '';
          schoolMap[pol].push({
            uniqueName: node.uniqueName,
            name: node.name,
            maxRank,
            description: finalStat.substring(0, 200),
          });
        }
      }
      base = base.map(school => ({
        ...school,
        nodes: schoolMap[school.value] || [],
        nodeCount: (schoolMap[school.value] || []).length,
      }));
      console.log(`  Focus nodes extracted from WFCD: ${focusItems.length}`);
    }
  } catch (e) {
    console.log('  Focus extraction note: could not extract node data (' + e.message + ')');
  }
  return base;
}

// ── Squad Buffs ─────────────────────────────────────────
function deriveBuffs() {
  return [
    { name: 'Roar', description: 'Rhino Roar (+30% final damage at base strength)', modifiers: [{ stat: 'faction_damage_all', value: 0.30, type: 'MULTIPLIER' }] },
    { name: 'Eclipse', description: 'Mirage Eclipse (+150% base damage)', modifiers: [{ stat: 'base_damage', value: 1.50, type: 'MULTIPLIER' }] },
    { name: 'Warcry', description: 'Valkyr Warcry (+50% Armor, +50% AS)', modifiers: [{ stat: 'armor', value: 0.50, type: 'MULTIPLIER' }, { stat: 'attack_speed', value: 0.50, type: 'MULTIPLIER' }] },
    { name: "Xata's Whisper", description: "Xata's Whisper (+100% Void damage)", modifiers: [{ stat: 'elemental_void', value: 1.0, type: 'MULTIPLIER' }] },
    { name: 'Vex Armor', description: 'Chroma Vex Armor (+350% armor, +275% dmg)', modifiers: [{ stat: 'armor', value: 3.5, type: 'MULTIPLIER' }, { stat: 'base_damage', value: 2.75, type: 'MULTIPLIER' }] },
    { name: 'Nourish', description: 'Grendel Nourish (+45% viral damage, energy multiplier)', modifiers: [{ stat: 'elemental_viral', value: 0.45, type: 'MULTIPLIER' }, { stat: 'energy_mult', value: 2.0, type: 'MULTIPLIER' }] },
    { name: 'Gloom', description: 'Sevagoth Gloom (slow enemies based on missing health)', modifiers: [{ stat: 'enemy_speed', value: -0.95, type: 'MULTIPLIER' }] },
  ];
}

// ── Enemies ─────────────────────────────────────────────
function deriveEnemies(items) {
  // Extract enemies from the Items class (which has full access to all data)
  const enemyItems = Array.from(items).filter(i => i.category === 'Enemy');
  if (enemyItems.length > 10) {
    const factionNames = {
      'Grineer': 'Grineer', 'Corpus': 'Corpus', 'Infestation': 'Infested',
      'Sentient': 'Sentient', 'Orokin': 'Orokin', 'Tenno': 'Tenno', 'Neutral': 'Neutral',
    };
    const extracted = enemyItems.map(e => ({
      name: e.name || 'Unknown',
      faction: factionNames[e.type] || e.faction || (e.healthType === 'Robotic' ? 'Corpus' : 'Grineer'),
      baseHealth: e.health || 100,
      baseShields: e.shields || 0,
      baseArmor: e.armor || 0,
      armorType: e.armorType || (e.resistances ? e.resistances.find(r => r.type.includes('Armor'))?.type || 'None' : 'None'),
      healthType: e.healthType || (e.resistances ? e.resistances.find(r => !r.type.includes('Armor') && !r.type.includes('Shield'))?.type || 'Flesh' : 'Flesh'),
      shieldType: e.shieldType || (e.resistances ? e.resistances.find(r => r.type.includes('Shield'))?.type || 'None' : 'None'),
      weakness: e.weakness || [],
      resistance: e.resistance || [],
      immune: e.immune || [],
      // Game-file sourced resistance data — authoritative damage type modifiers
      resistances: (e.resistances || []).map(r => ({
        amount: r.amount || 0,
        type: r.type || 'Unknown',
        affectors: (r.affectors || []).map(a => ({
          element: a.element || 'None',
          modifier: typeof a.modifier === 'number' ? a.modifier : 0,
        })),
      })),
    }));
    const withResist = extracted.filter(e => e.resistances.length > 0).length;
    console.log(`  Enemies extracted from WFCD: ${extracted.length} (${withResist} with resistance data)`);
    return extracted;
  }

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

// ── Warframe Ability Data (extracted from WFCD) ────────
function deriveWarframeAbilityData(items) {
  const result = {};
  for (const item of items) {
    if (item.category !== 'Warframes') continue;
    const abilities = (item.abilities || []).map((ab, idx) => ({
      name: ab.name || 'Unknown',
      description: (ab.description || '').substring(0, 500),
      uniqueName: ab.uniqueName || '',
      slotIndex: idx + 1,
    }));
    result[item.uniqueName] = {
      name: item.name,
      passiveDescription: (item.passiveDescription || '').substring(0, 500),
      abilities,
      exaltedCount: (item.exalted || []).length,
    };
  }
  return result;
}

// ── Arcane Data (extracted from WFCD) ──────────────────
function deriveArcaneData(items) {
  const arcanes = [];
  for (const item of items) {
    if (item.category !== 'Arcanes') continue;
    const maxRank = item.fusionLimit || item.levelStats?.length || 0;
    const finalStats = (item.levelStats && item.levelStats[maxRank]) ? item.levelStats[maxRank].stats : [];
    arcanes.push({
      uniqueName: item.uniqueName,
      name: item.name,
      category: item.type || item.category || 'Warframe',
      rarity: item.rarity || 'Common',
      maxRank,
      statLines: finalStats,
      isOperatorArcane: !!item.school,
      school: item.school || null,
    });
  }
  return arcanes;
}

// ── Companion Ability Data ─────────────────────────────
function deriveCompanionAbilityData(items) {
  const result = [];
  for (const item of items) {
    if (!['Sentinels', 'Pets'].includes(item.category)) continue;
    const abilities = (item.abilities || []).map(a => ({
      name: a.name || 'Unknown',
      description: (a.description || '').substring(0, 300),
    }));
    // Extract pet natural weapon stats (Pets have weapon stats directly)
    const petWeapon = (item.category === 'Pets' && item.totalDamage) ? {
      totalDamage: item.totalDamage || 0,
      criticalChance: item.criticalChance || 0,
      criticalMultiplier: item.criticalMultiplier || 2,
      fireRate: item.fireRate || 0,
      statusChance: item.procChance || 0,
      multishot: item.multishot || 1,
      damageTypes: item.damageTypes || null,
    } : null;
    result.push({
      uniqueName: item.uniqueName,
      name: item.name,
      type: item.category === 'Sentinels' ? 'sentinel' : 'beast',
      abilities,
      health: item.health || 0,
      shield: item.shield || 0,
      armor: item.armor || 0,
      petWeapon,
    });
  }
  return result;
}

// ── Shard Defs ─────────────────────────────────────────
function deriveShards() {
  return [
    { color: 'crimson', label: 'Strength', stats: [{ stat: 'strength', value: 0.10, group: 'ability', category: 'MULTIPLIER' }] },
    { color: 'azure', label: 'Armor', stats: [{ stat: 'armor', value: 225, group: 'warframe_armor', category: 'FLAT' }] },
    { color: 'amber', label: 'Cast Speed', stats: [{ stat: 'energy', value: 0.075, group: 'warframe_energy', category: 'MULTIPLIER' }] },
    { color: 'violet', label: 'Melee Crit', stats: [{ stat: 'crit_damage', value: 0.10, group: 'weapon_crit_damage', category: 'MULTIPLIER' }] },
    { color: 'topaz', label: 'Heat / Shields', stats: [{ stat: 'elemental_heat', value: 0.25, group: 'weapon_elemental', category: 'MULTIPLIER' }, { stat: 'shields', value: 0.15, group: 'warframe_shields', category: 'MULTIPLIER' }] },
    { color: 'emerald', label: 'Corrosive', stats: [{ stat: 'elemental_corrosive', value: 0.25, group: 'weapon_elemental', category: 'MULTIPLIER' }] },
  ];
}

async function main() {
  console.log('[update-game-data] Loading @wfcd/items...');
  const Items = require('@wfcd/items');
  const all = new Items();
  console.log('[update-game-data] Loaded ' + all.length + ' items');

  const data = {
    version: '2.0',
    generatedAt: new Date().toISOString(),
    exaltedWeapons: deriveExalted(all),
    incarnonWeapons: deriveIncarnon(all),
    helminthAbilities: deriveHelminth(all),
    focusSchools: deriveFocus(all),
    squadBuffs: deriveBuffs(),
    enemies: deriveEnemies(all),
    shardDefs: deriveShards(),
    warframeAbilityData: deriveWarframeAbilityData(all),
    arcaneData: deriveArcaneData(all),
    companionAbilityData: deriveCompanionAbilityData(all),
  };

  const outPath = path.resolve(__dirname, '../src/data/game-data.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('[update-game-data] Written to ' + outPath);
  console.log('  Exalted: ' + Object.keys(data.exaltedWeapons).length + ' warframes');
  console.log('  Incarnon: ' + data.incarnonWeapons.length + ' weapons');
  console.log('  Helminth: ' + data.helminthAbilities.length + ' abilities');
  console.log('  Enemies: ' + data.enemies.length + ' entries');
  console.log('  Warframe Ability Data: ' + Object.keys(data.warframeAbilityData).length + ' frames');
  console.log('  Arcane Data: ' + (data.arcaneData || []).length + ' entries');
  console.log('  Companion Ability Data: ' + (data.companionAbilityData || []).length + ' entries');
}

main().catch(err => { console.error(err); process.exit(1); });
