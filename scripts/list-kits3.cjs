const Items = require('@wfcd/items');
const all = new Items();

// Show kit part data structures
console.log('=== MODULAR MELEE (ZAW) PARTS ===');
const zawParts = [...all].filter(i => i.uniqueName && i.uniqueName.includes('/ModularMelee01/'));
console.log(`Zaw parts: ${zawParts.length}`);
const zawTypes = {};
for (const p of zawParts) {
  const folder = p.uniqueName.split('/').slice(-2, -1)[0];
  zawTypes[folder] = (zawTypes[folder]||0)+1;
}
console.log('Types:', JSON.stringify(zawTypes));
// Show each part with weapon stats
zawParts.forEach(p => {
  const stats = ['name','uniqueName','category','damagePerShot','totalDamage','criticalChance','criticalMultiplier','procChance','fireRate','attacks','tags','masteryReq','disposition'].filter(k => p[k] !== undefined).map(k => {
    const v = JSON.stringify(p[k]);
    return `${k}=${v.slice(0,80)}`;
  }).join(', ');
  console.log(`  ${stats}`);
});

console.log('\n=== MODULAR SECONDARY (KITGUN) PARTS ===');
const kitgunParts = [...all].filter(i => i.uniqueName && 
  i.uniqueName.includes('/SUModularSecondary'));
console.log(`Kitgun secondary parts: ${kitgunParts.length}`);
const kitgunTypes = {};
for (const p of kitgunParts) {
  const folder = p.uniqueName.split('/').slice(-2, -1)[0];
  kitgunTypes[folder] = (kitgunTypes[folder]||0)+1;
}
console.log('Types:', JSON.stringify(kitgunTypes));
kitgunParts.slice(0, 5).forEach(p => {
  const stats = ['name','uniqueName','category','damagePerShot','totalDamage','criticalChance','criticalMultiplier','procChance','fireRate','attacks','tags','masteryReq','disposition'].filter(k => p[k] !== undefined).map(k => {
    const v = JSON.stringify(p[k]);
    return `${k}=${v.slice(0,80)}`;
  }).join(', ');
  console.log(`  ${stats}`);
});

console.log('\n=== MODULAR PRIMARY (KITGUN) PARTS ===');
const kitgunPriParts = [...all].filter(i => i.uniqueName && i.uniqueName.includes('/SUModularPrimary'));
console.log(`Kitgun primary parts: ${kitgunPriParts.length}`);
const kitgunPriTypes = {};
for (const p of kitgunPriParts) {
  const folder = p.uniqueName.split('/').slice(-2, -1)[0];
  kitgunPriTypes[folder] = (kitgunPriTypes[folder]||0)+1;
}
console.log('Types:', JSON.stringify(kitgunPriTypes));

console.log('\n=== INFESTED KITGUN PARTS ===');
const infKitgunParts = [...all].filter(i => i.uniqueName && i.uniqueName.includes('/InfKitGun/'));
console.log(`Infested kitgun parts: ${infKitgunParts.length}`);
const infKitgunTypes = {};
for (const p of infKitgunParts) {
  const folder = p.uniqueName.split('/').slice(-2, -1)[0];
  infKitgunTypes[folder] = (infKitgunTypes[folder]||0)+1;
}
console.log('Types:', JSON.stringify(infKitgunTypes));

// Count ALL modular weapon paths
console.log('\n=== ALL MODULAR WEAPON PATHS ===');
const allModular = [...all].filter(i => 
  i.uniqueName && (i.uniqueName.includes('/ModularWeapons/') || i.uniqueName.includes('/ModularMelee') || i.uniqueName.includes('/ModularSecondary') || i.uniqueName.includes('/ModularPrimary') || i.uniqueName.includes('/InfKitGun/')));
console.log(`Total modular path items: ${allModular.length}`);
const modCats = {};
for (const m of allModular) { modCats[m.category] = (modCats[m.category]||0)+1; }
console.log('By category:', JSON.stringify(modCats));
