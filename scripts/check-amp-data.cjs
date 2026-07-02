const Items = require('@wfcd/items');
const all = new Items();

// Search for AMP, Operator, Focus items
const patterns = [
  { name: 'Amp parts', filter: i => /\/Amp\//.test(i.uniqueName) },
  { name: 'Operator items', filter: i => /\/Operator\//.test(i.uniqueName) },
  { name: 'Void items', filter: i => /\/Void/.test(i.uniqueName) },
  { name: 'Focus Lens', filter: i => i.type === 'Focus' || (i.category === 'Mods' && /focus/i.test(i.uniqueName)) },
  { name: 'Amp (type)', filter: i => i.type === 'Amp' },
  { name: 'Prism (type)', filter: i => i.type === 'Prism' },
  { name: 'Scaffold (type)', filter: i => i.type === 'Scaffold' },
  { name: 'Brace (type)', filter: i => i.type === 'Brace' },
];

for (const p of patterns) {
  const items = [...all].filter(p.filter);
  console.log(`${p.name}: ${items.length}`);
  if (items.length > 0) {
    items.slice(0, 5).forEach(i => {
      const keys = Object.keys(i).filter(k => !k.startsWith('_')).join(', ');
      console.log(`  ${i.uniqueName} — ${i.name} [${i.category}] keys: ${keys}`);
    });
  }
}

// Search all unique names for clues
console.log('\n--- Searching unique names containing "amp" (case insensitive) ---');
const ampRelated = [...all].filter(i => i.uniqueName && i.uniqueName.toLowerCase().includes('amp'));
console.log(`Found: ${ampRelated.length}`);
ampRelated.slice(0, 30).forEach(i => console.log(`  ${i.category}/${i.type}: ${i.uniqueName} — ${i.name}`));

// Search for focus schools
console.log('\n--- Searching for "School" or "Focus" in types ---');
const schoolItems = [...all].filter(i => i.type === 'Lens' || (i.category === 'Upgrades' && /focus/i.test(i.uniqueName)));
console.log(`Found: ${schoolItems.length}`);
schoolItems.slice(0, 10).forEach(i => console.log(`  ${i.category}/${i.type}: ${i.uniqueName} — ${i.name}`));

// Check for /Lotus/Upgrades/Focus/
console.log('\n--- /Lotus/Upgrades/Focus/ ---');
const focusPaths = [...all].filter(i => i.uniqueName && i.uniqueName.includes('/Lotus/Upgrades/Focus/'));
console.log(`Found: ${focusPaths.length}`);
focusPaths.slice(0, 20).forEach(i => console.log(`  ${i.category}/${i.type}: ${i.uniqueName} — ${i.name}`));
