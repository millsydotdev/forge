const Items = require('@wfcd/items');
const all = new Items();

// ── Kitgun / Zaw parts ────────────────────────────────
console.log('=== SEARCHING FOR KIT WEAPONS ===');
// Kitgun paths typically: /Lotus/Weapons/Corpus/ModularWeapons/Kitgun/
// Zaw paths: /Lotus/Weapons/Tenno/ModularWeapons/Zaw/
const searches = [
  '/ModularWeapons/', '/ZawStrike/', '/ZawGrip/', '/ZawLink/',
  '/KitgunChamber/', '/KitgunLoader/', '/KitgunGrip/',
  'Modular', 'Zaw', 'Kitgun',
];
for (const s of searches) {
  const items = [...all].filter(i => i.uniqueName && i.uniqueName.includes(s));
  if (items.length > 0) {
    console.log(`\nSearch: "${s}" → ${items.length} items`);
    items.slice(0, 10).forEach(i => console.log(`  ${i.name} [${i.category}] — ${i.uniqueName}`));
  }
}

// Check the Misc category for parts
console.log('\n=== MISC ITEMS WITH PART-RELATED TYPES ===');
const miscParts = [...all].filter(i => i.category === 'Misc' && 
  (i.uniqueName?.includes('/ModularWeapons/') || i.uniqueName?.includes('/Zaw/') || i.uniqueName?.includes('/Kitgun/')));
console.log(`Misc modular items: ${miscParts.length}`);
miscParts.forEach(i => console.log(`  ${i.name} — ${i.uniqueName} type=${i.type}`));

// Companion weapon mods specifically (not precepts)
console.log('\n=== COMPANION WEAPON MODS ===');
const compWeaponMods = [...all].filter(i => 
  i.category === 'Mods' && (i.compatName === 'SENTINEL' || i.compatName === 'MOA' || i.compatName === 'HOUND' ||
  i.type === 'Companion Weapon Mod' || i.type === 'Robotic Weapon Mod'));
console.log(`Companion weapon mods: ${compWeaponMods.length}`);
// Sample
compWeaponMods.slice(0, 10).forEach(m => {
  const last = m.levelStats?.[m.levelStats.length - 1];
  console.log(`  ${m.name} — stats: ${last?.stats?.join(', ')}`);
});

// Necramech mods
console.log('\n=== NECRAMECH MODS ===');
const necraMods = [...all].filter(i => 
  i.category === 'Mods' && (i.uniqueName?.toLowerCase().includes('necramech') || i.compatName === 'NECRAMECH'));
console.log(`Necramech mods: ${necraMods.length}`);
necraMods.slice(0, 20).forEach(m => {
  const last = m.levelStats?.[m.levelStats.length - 1];
  console.log(`  ${m.name} [${m.type}] — ${last?.stats?.join(', ')}`);
});

// Archwing mods (not skins)
console.log('\n=== ARCHWING (wings) MODS ===');
const archwingMods = [...all].filter(i => 
  i.category === 'Mods' && (i.compatName === 'ARCHWING' || i.uniqueName?.toLowerCase().includes('/archwing/')));
console.log(`Archwing mods: ${archwingMods.length}`);

// Arch-Melee mods
console.log('\n=== ARCH-MELEE MODS ===');
const archMeleeMods = [...all].filter(i => 
  i.category === 'Mods' && (i.compatName === 'ARCHMELEE' || i.type === 'Arch-Melee Mod'));
console.log(`Arch-Melee mods: ${archMeleeMods.length}`);

// Arch-Gun mods
console.log('\n=== ARCH-GUN MODS ===');
const archGunMods = [...all].filter(i => 
  i.category === 'Mods' && (i.compatName === 'ARCHGUN' || i.type === 'Arch-Gun Mod'));
console.log(`Arch-Gun mods: ${archGunMods.length}`);

// K-Drive mods
console.log('\n=== K-DRIVE MODS ===');
const kdriveMods = [...all].filter(i => 
  i.category === 'Mods' && (i.compatName === 'KDRIVE' || i.uniqueName?.toLowerCase().includes('kdrive')));
console.log(`K-Drive mods: ${kdriveMods.length}`);
kdriveMods.slice(0, 10).forEach(m => {
  const last = m.levelStats?.[m.levelStats.length - 1];
  console.log(`  ${m.name} — ${last?.stats?.join(', ')}`);
});

// Parazon mods
console.log('\n=== PARAZON MODS ===');
const parazonMods = [...all].filter(i => 
  i.category === 'Mods' && (i.compatName === 'PARAZON' || i.type === 'Parazon Mod'));
console.log(`Parazon mods: ${parazonMods.length}`);
parazonMods.slice(0, 10).forEach(m => {
  const last = m.levelStats?.[m.levelStats.length - 1];
  console.log(`  ${m.name} — ${last?.stats?.join(', ')}`);
});
