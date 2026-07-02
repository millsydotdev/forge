const Items = require('@wfcd/items');
const all = new Items();

// All AMP parts (type === 'Amp')
const ampParts = [...all].filter(i => i.type === 'Amp');
console.log('=== AMP PARTS ===');
console.log(`Total: ${ampParts.length}`);
for (const p of ampParts) {
  const partType = p.uniqueName.includes('/Barrel/') ? 'PRISM' :
                   p.uniqueName.includes('/Chassis/') ? 'SCAFFOLD' :
                   p.uniqueName.includes('/Grip/') ? 'BRACE' : 'UNKNOWN';
  console.log(`\n[${partType}] ${p.name}`);
  console.log(`  Path: ${p.uniqueName}`);
  console.log(`  Damage: ${p.totalDamage} (${p.damagePerShot}/shot)`);
  console.log(`  Crit: ${(p.criticalChance*100).toFixed(1)}% x${p.criticalMultiplier}`);
  console.log(`  Status: ${(p.procChance*100).toFixed(1)}%`);
  console.log(`  Fire Rate: ${p.fireRate}/s`);
  if (p.attacks) console.log(`  Attacks: ${JSON.stringify(p.attacks.map(a => ({name: a.name, type: a.attackType, damage: a.damage})))}`);
  if (p.tags) console.log(`  Tags: ${p.tags.join(', ')}`);
}

// AMP arcanes 
console.log('\n=== AMP ARCANES ===');
const ampArcanes = [...all].filter(i => {
  // Items with "Virtuos" or "Conjunctive" in name, category Arcanes
  // Or any Arcane with "amp" in its uniqueName path
  return i.category === 'Arcanes' && 
    (i.uniqueName.toLowerCase().includes('amp') || 
     i.uniqueName.toLowerCase().includes('virtuos') ||
     (i.type === 'Amp'));
});
console.log(`Found: ${ampArcanes.length}`);
for (const a of ampArcanes) {
  console.log(`  ${a.name} — ${a.uniqueName} — type: ${a.type}`);
  const lastStats = a.levelStats?.[a.levelStats.length - 1]?.stats;
  if (lastStats) lastStats.forEach(s => console.log(`    stat: ${s}`));
}

// Search for any Arcane with Operator in the name
const opArcanes = [...all].filter(i => i.category === 'Arcanes' && 
  (i.name.toLowerCase().includes('operator') || i.name.toLowerCase().includes('virtuos') ||
   i.name.toLowerCase().includes('conjunctive') || i.name.toLowerCase().includes('magus') ||
   i.name.toLowerCase().includes('arcane')));
console.log(`\n=== OPERATOR ARCANES (search) ===`);
console.log(`Found: ${opArcanes.length}`);
const seen = new Set();
for (const a of opArcanes) {
  if (seen.has(a.name)) continue; seen.add(a.name);
  const lastStats = a.levelStats?.[a.levelStats.length - 1]?.stats || [];
  console.log(`  ${a.name} (${a.type}) — ${a.uniqueName.split('/').slice(-2,-1)}`);
  lastStats.slice(0,2).forEach(s => console.log(`    "${s}"`));
}

// List all Amp unique names sorted
console.log('\n=== ALL AMP-RELATED WEAPON PATHS ===');
const allAmpPaths = [...all].filter(i => i.uniqueName && i.uniqueName.includes('OperatorAmplifiers'));
const pathGroups = {};
for (const p of allAmpPaths) {
  const parts = p.uniqueName.split('/');
  const setName = parts[parts.indexOf('OperatorAmplifiers') + 1];
  const compType = parts[parts.indexOf('OperatorAmplifiers') + 2];
  const key = `${setName}/${compType}`;
  if (!pathGroups[key]) pathGroups[key] = [];
  pathGroups[key].push(p.name);
}
for (const [key, items] of Object.entries(pathGroups).sort()) {
  console.log(`  ${key}:`);
  items.forEach(n => console.log(`    ${n}`));
}
