const Items = require('@wfcd/items');
const all = new Items();

// ── Kit Weapons (Zaws, Kitguns, etc.) ──────────────────────
console.log('=== MODULAR/KIT WEAPONS ===');
const kitPatterns = [
  'Zaw', 'Kitgun', 'Modular', 'ModularWeapon',
  '/Zaws/', '/Kitguns/', '/ModularWeapons/',
  'Strike', 'Grip', 'Link', 'Chamber', 'Loader', 'Scrap',
];
const kitParts = [...all].filter(i => {
  const u = i.uniqueName || '';
  return u.includes('/Zaws/') || u.includes('/Kitguns/') || u.includes('/ModularWeapons/') ||
         (i.category === 'Melee' && (u.includes('/Strike/') || u.includes('/Grip/') || u.includes('/Link/'))) ||
         (i.category === 'Secondary' && (u.includes('/Chamber/') || u.includes('/Loader/') || u.includes('/Grip/'))) ||
         i.type === 'ModularWeaponPart';
});
console.log(`Kit part items: ${kitParts.length}`);
for (const p of kitParts) {
  const keys = ['name','uniqueName','category','type','damagePerShot','totalDamage','criticalChance','criticalMultiplier','procChance','fireRate','masteryReq','disposition','tags','attacks'].filter(k => p[k] !== undefined);
  const info = keys.map(k => `${k}=${JSON.stringify(p[k]).slice(0,60)}`).join(', ');
  console.log(`  ${p.name} [${p.category}/${p.type}] — ${info}`);
}

// ── Companion Weapons ──────────────────────────────────
console.log('\n=== COMPANION WEAPONS ===');
const compWeapons = [...all].filter(i => i.type === 'Companion Weapon' || 
  i.uniqueName?.includes('/SentinelWeapons/') || i.uniqueName?.includes('/PetWeapons/'));
console.log(`Companion weapons: ${compWeapons.length}`);
for (const w of compWeapons.slice(0, 20)) {
  console.log(`  ${w.name} [${w.category}] — dmg=${w.totalDamage} crit=${w.criticalChance}x${w.criticalMultiplier} status=${w.procChance} fireRate=${w.fireRate}`);
}

// ── Companion mods / precepts ──────────────────────────
console.log('\n=== COMPANION MODS ===');
const compMods = [...all].filter(i =>
  i.category === 'Mods' && 
  (i.type === 'Companion Mod' || i.type === 'Sentinel Mod' || i.type === 'Robotic' ||
   (i.uniqueName && (i.uniqueName.includes('/SentinelPrecepts/') || i.uniqueName.includes('/PetPrecepts/'))))
);
console.log(`Companion mods/precepts: ${compMods.length}`);
// Group by type
const compTypes = {};
for (const m of compMods) {
  const t = m.type || 'Unknown';
  compTypes[t] = (compTypes[t] || 0) + 1;
}
for (const [t, c] of Object.entries(compTypes).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${t}: ${c}`);
}
// Show sample stats from companion precepts
console.log('\nSample companion precept stats:');
let preceptCount = 0;
for (const m of compMods) {
  if (m.levelStats) {
    const last = m.levelStats[m.levelStats.length - 1];
    if (last && last.stats) {
      preceptCount++;
      if (preceptCount <= 15) {
        console.log(`  ${m.name}: ${last.stats.slice(0, 2).join(' | ')}`);
      }
    }
  }
}
console.log(`  ... total precepts with stats: ${preceptCount}`);

// ── Railjack / Necramech / Archwing ─────────────────────
console.log('\n=== RAILJACK ===');
const rjItems = [...all].filter(i => i.uniqueName?.includes('/Railjack/') && i.category !== 'Skins');
console.log(`Railjack non-skin items: ${rjItems.length}`);
const rjCats = {};
for (const i of rjItems) { rjCats[i.category] = (rjCats[i.category]||0)+1; }
for (const [c,n] of Object.entries(rjCats).sort((a,b)=>b[1]-a[1])) console.log(`  ${c}: ${n}`);

console.log('\n=== NECRAMECH ===');
const necraItems = [...all].filter(i => i.uniqueName?.toLowerCase().includes('necramech') && i.category !== 'Skins');
console.log(`Necramech non-skin items: ${necraItems.length}`);
for (const i of necraItems) console.log(`  ${i.name} [${i.category}/${i.type}]`);
