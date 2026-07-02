/**
 * Refined coverage analysis — only counts actual mappable stat lines,
 * not full-sentence augment descriptions.
 */
const Items = require('@wfcd/items');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const all = new Items();

// Count by category
const cats = {};
for (const item of all) cats[item.category || 'Unknown'] = (cats[item.category || 'Unknown'] || 0) + 1;
console.log('=== Items by category ===');
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${n}`);

// ── Mod stat extraction with filtering ──────────────────────
// Only keep lines that look like actual stat modifiers, not descriptions.
// Heuristic: stat lines are typically <50 chars, start with +/-/digit/x, 
// don't contain common prose words.

const PROSE_WORDS = new Set(['a ','an ','the ','this ','that ','these ','those ','your ','every ','after ',
  'when ','while ','within ','during ','create ','deals ','deal ','causes ','cause ','attacks ','attack ',
  'enemies ','enemy ','players ','player ','warframe ','companion ','kubrow ','kavat ','sentinel ',
  'increases ','decreases ','grants ','allow ','allows ','augment ','ability ',
  'absorbs ','explodes ','firing ','switching ','applying ','applies ',
  'cooldown ','radius ','duration ','range ','infinite ',
  'Alternate ','Aegis ','Airburst ','Antimatter ','Aquablades ','Artemis ',
  'At ', 'A ']);

function isActualStatLine(s) {
  if (!s || s.length > 80) return false;
  // Must start with +/-, a digit, or x
  if (!/^[+\-\dx√]/i.test(s)) return false;
  // Filter out chat/description text
  const lower = s.toLowerCase().trim();
  for (const pw of PROSE_WORDS) if (lower.startsWith(pw)) return false;
  return true;
}

// Also track warframe/weapon stat lines from their own levelStats
function extractStats(items, categories, maxLen = 60) {
  const names = new Set();
  for (const item of items) {
    if (!categories.includes(item.category)) continue;
    const stats = item.levelStats?.[0]?.stats ?? [];
    for (const s of stats) {
      let name = s.replace(/<[^>]+>/g, '').trim();
      name = name.replace(/^[\d,.]+/, '').trim();
      if (name && name.length < maxLen) names.add(name);
    }
  }
  return names;
}

console.log('\n=== Mod Analysis — Filtered ===');
let modCount = 0;
let validStatCount = 0;
const allStatNames = new Set();
const modStatSources = {};

for (const item of all) {
  if (item.category !== 'Mods') continue;
  modCount++;
  // Use max-level stats
  const stats = item.levelStats?.[item.levelStats.length - 1]?.stats ?? [];
  const processed = new Set();
  for (const raw of stats) {
    // Strip color tags
    let cleaned = raw.replace(/<[^>]+>/g, '').trim();
    // Split on \n 
    const lines = cleaned.split('\n').filter(Boolean);
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (!isActualStatLine(line)) continue;
      // Extract the name part (remove value prefix)
      let name = line.replace(/^[+\-\dx√][\d,.%]*\s*/, '');
      // Remove trailing units in parens
      name = name.replace(/\s*\([^)]*\)$/, '').trim();
      // Remove trailing "."
      name = name.replace(/\.$/, '').trim();
      if (name && !processed.has(name)) {
        processed.add(name);
        allStatNames.add(name);
        if (!modStatSources[name]) modStatSources[name] = [];
        if (modStatSources[name].length < 3) {
          modStatSources[name].push(`${item.name}: "${line}"`);
        }
      }
    }
  }
}

console.log(`Mods scanned: ${modCount}`);
console.log(`Valid stat-like names: ${allStatNames.size}`);

// ── Load our maps ─────────────────────────────────────
const genRaw = fs.readFileSync(path.join(ROOT, '..', 'src/data/generated-stat-map.ts'), 'utf-8');
const genKeys = [...genRaw.matchAll(/^\s+'([^']+)':/gm)].map(m => m[1]);
const genSet = new Set(genKeys);

const resRaw = fs.readFileSync(path.join(ROOT, '..', 'src/data/wfcd-resolver.ts'), 'utf-8');
const handKeys = [...resRaw.matchAll(/^\s+'([^']+)':/gm)].map(m => m[1]);
const handSet = new Set(handKeys);

const both = new Set([...genSet, ...handSet]);
// Also read GENERATED_STAT_ALIAS
const aliasKeys = [...genRaw.matchAll(/['"]([^'"]+)['"]\s*:\s*['"][^'"]+['"]/g)].map(m => m[1]);
const handAliases = [...resRaw.matchAll(/['"]([^'"]+)['"]\s*:\s*['"][^'"]+['"]/g)].map(m => m[1]);
const allAliases = new Set([...aliasKeys, ...handAliases]);
// Remove known generic keys from aliases
allAliases.delete('stat');
allAliases.delete('category');
allAliases.delete('stackingGroup');
allAliases.delete('priority');
allAliases.delete('scaleByHundred');

// Also read alias map values
const aliasValues = [...genRaw.matchAll(/:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const handAliasValues = [...resRaw.matchAll(/:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const aliasValSet = new Set([...aliasValues, ...handAliasValues]);
aliasValSet.delete('MULTIPLIER'); aliasValSet.delete('FLAT');

const combinedMapped = new Set([...both, ...aliasValSet]);

console.log(`\n=== Coverage ===`);
console.log(`Hand-written STAT_MAP: ${handSet.size}`);
console.log(`Generated STAT_MAP: ${genSet.size}`);
console.log(`Combined stat keys: ${both.size}`);

// Check each WFCD stat name
let covered = 0;
let uncoveredByName = [];
let uncoveredByCategory = {};

for (const name of allStatNames) {
  const lower = name.toLowerCase();
  let found = false;
  
  // Exact match (case-insensitive)
  for (const m of combinedMapped) {
    if (m.toLowerCase() === lower) { found = true; break; }
  }
  // Alias match
  if (!found) {
    for (const a of allAliases) {
      if (a.toLowerCase() === lower) { found = true; break; }
    }
  }
  
  if (found) covered++;
  else {
    uncoveredByName.push(name);
    // Categorize
    const cat = lower.includes('amp') ? 'AMP' :
                lower.includes('operator') ? 'OPERATOR' :
                lower.includes('companion') || lower.includes('kavat') || lower.includes('kubrow') || lower.includes('sentinel') ? 'COMPANION' :
                lower.includes('railjack') || lower.includes('tactical') || lower.includes('avionic') ? 'RAILJACK' :
                lower.includes('drift') || lower.includes('k-drive') || lower.includes('hoverboard') ? 'K-DRIVE' :
                lower.includes('necramech') || lower.includes('mech') ? 'NECRAMECH' :
                lower.includes('ability strength') || lower.includes('ability duration') || lower.includes('ability range') || lower.includes('ability efficiency') ? 'ABILITY' :
                lower.includes('max energy') || lower.includes('energy max') || lower.includes('max shields') || lower.includes('max health') || lower.includes('base') ? 'WARFRAME_CORE' :
                lower.includes('reload') || lower.includes('fire rate') || lower.includes('magazine') || lower.includes('punch') || lower.includes('multishot') || lower.includes('crit') || lower.includes('status') || lower.includes('damage') ? 'WEAPON' :
                lower.includes('sprint') || lower.includes('parkour') || lower.includes('bullet jump') || lower.includes('slide') || lower.includes('dodge') || lower.includes('jump') ? 'MOVEMENT' :
                lower.includes('shield') || lower.includes('armor') || lower.includes('regen') || lower.includes('recovery') || lower.includes('revive') || lower.includes('bleedout') || lower.includes('gate') ? 'SURVIVAL' :
                lower.includes('heavy') || lower.includes('combo') || lower.includes('channel') || lower.includes('finisher') || lower.includes('melee') ? 'MELEE_SPECIAL' :
                lower.includes('arcane') || lower.includes('shard') || lower.includes('tauforged') ? 'ARCANE_SHARD' :
                'OTHER';
    uncoveredByCategory[cat] = (uncoveredByCategory[cat] || 0) + 1;
  }
}

console.log(`Covered: ${covered} / ${allStatNames.size} (${(covered/allStatNames.size*100).toFixed(1)}%)`);
console.log(`Uncovered: ${uncoveredByName.length}`);

console.log('\n=== Uncovered by Category ===');
for (const [cat, cnt] of Object.entries(uncoveredByCategory).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${cat}: ${cnt}`);
}

console.log('\n=== Sample Uncovered Stats (first 80) ===');
for (const n of uncoveredByName.slice(0, 80)) {
  const src = modStatSources[n]?.[0]?.split(':')[0] || '?';
  console.log(`  "${n}"  ← ${src}`);
}

// Warframe innate stats
console.log('\n=== Warframe Innate Stats ===');
const frameStats = extractStats(all, ['Warframes']);
console.log(`  Total: ${frameStats.size}`);
const frameCovered = [...frameStats].filter(n => {
  for (const m of combinedMapped) if (m.toLowerCase() === n.toLowerCase()) return true;
  return false;
});
console.log(`  Covered: ${frameCovered.length}/${frameStats.size}`);
for (const n of [...frameStats].sort()) {
  const isCov = frameCovered.includes(n);
  console.log(`  ${isCov ? '✅' : '❌'} "${n}"`);
}

// Weapon innate stats
console.log('\n=== Weapon Innate Stats ===');
const wpnStats = extractStats(all, ['Primary','Secondary','Melee','Arch-Gun','Arch-Melee']);
console.log(`  Total: ${wpnStats.size}`);
const wpnCovered = [...wpnStats].filter(n => {
  for (const m of combinedMapped) if (m.toLowerCase() === n.toLowerCase()) return true;
  return false;
});
for (const n of [...wpnStats].sort()) {
  const isCov = wpnCovered.includes(n);
  console.log(`  ${isCov ? '✅' : '❌'} "${n}"`);
}

// Read stat-display.ts
const displayRaw = fs.readFileSync(path.join(ROOT, '..', 'src/features/build-planner/data/stat-display.ts'), 'utf-8');
const displayKeys = [...displayRaw.matchAll(/^\s+(\w+):\s*\{/gm)].map(m => m[1]);

// Read CalculatedStats
const typesRaw = fs.readFileSync(path.join(ROOT, '..', 'src/stat-processor/types.ts'), 'utf-8');
const calcFields = [...typesRaw.matchAll(/^\s+(\w+)\??:\s+(?:number|Record|string|boolean)/gm)].map(m => m[1]);

console.log(`\n=== Summary ===`);
console.log(`  Mods: ${modCount}`);
console.log(`  Warframes: ${cats['Warframes'] || 0}`);
console.log(`  Weapons: ${(cats['Primary']||0)+(cats['Secondary']||0)+(cats['Melee']||0)+(cats['Arch-Gun']||0)+(cats['Arch-Melee']||0)}`);
console.log(`  Stat maps: ${both.size} unique keys (${handSet.size} hand-written + ${genSet.size} generated)`);
console.log(`  WFCD stat coverage: ${covered}/${allStatNames.size} (${(covered/allStatNames.size*100).toFixed(1)}%)`);
console.log(`  CalculatedStats fields: ${calcFields.length}`);
console.log(`  STAT_DISPLAY entries: ${displayKeys.length}`);

// Full report
const report = {
  totalItems: all.length,
  modCount, warframes: cats['Warframes'], weapons: { primary: cats['Primary'], secondary: cats['Secondary'], melee: cats['Melee'] },
  handWrittenStats: handSet.size,
  generatedStats: genSet.size,
  combinedMapped: both.size,
  validStatNames: allStatNames.size,
  covered, uncovered: uncoveredByName.length,
  coveragePercent: Number((covered / allStatNames.size * 100).toFixed(1)),
  uncoveredByCategory,
  sampleUncovered: uncoveredByName.slice(0, 50).map(n => ({ name: n, mod: (modStatSources[n]?.[0] || '').split(':')[0] })),
  calcStatsFields: calcFields.length,
  statDisplayEntries: displayKeys.length,
  warframeInnateStats: [...frameStats].map(n => ({ name: n, covered: frameCovered.includes(n) })),
  weaponInnateStats: [...wpnStats].map(n => ({ name: n, covered: wpnCovered.includes(n) })),
};
fs.writeFileSync(path.join(ROOT, '..', 'coverage-report.json'), JSON.stringify(report, null, 2));
console.log('\nReport → coverage-report.json');
