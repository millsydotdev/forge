const Items = require('@wfcd/items');
const fs = require('fs');
const path = require('path');

const all = new Items();

const statLines = new Map();

const COLOR_TAG = /<[^>]+>/g;
const STAT_RE = /^([+-]\d+(?:\.\d+)?)%?\s*(.*)/;

function parseStatLine(line) {
  const cleaned = line.replace(COLOR_TAG, '').trim();
  const m = STAT_RE.exec(cleaned);
  if (!m) return null;
  const isPercent = cleaned.includes('%');
  return { raw: cleaned, name: m[2].trim(), value: +m[1], isPercent };
}

let modCount = 0, arcaneCount = 0, entriesWithStats = 0, parsedLines = 0;

for (const item of all) {
  if (!item || !item.levelStats) continue;
  const cat = item.category || 'Unknown';
  const type = item.type || cat;
  const isMod = cat === 'Mods' || (type || '').toLowerCase().includes('mod');
  const isArcane = cat === 'Arcanes' || (type || '').toLowerCase().includes('arcane');
  if (!isMod && !isArcane) continue;
  if (isMod) modCount++;
  if (isArcane) arcaneCount++;

  let hasStats = false;
  for (const rank of item.levelStats) {
    if (!rank.stats || !Array.isArray(rank.stats)) continue;
    for (const blob of rank.stats) {
      for (const line of blob.split('\n')) {
        const parsed = parseStatLine(line);
        if (!parsed) continue;
        parsedLines++;
        hasStats = true;
        const key = parsed.name;
        if (!statLines.has(key)) {
          statLines.set(key, {
            name: parsed.name,
            isPercent: parsed.isPercent,
            examples: [],
            conditions: new Set(),
            sources: new Set(),
          });
        }
        const entry = statLines.get(key);
        if (entry.examples.length < 3) {
          entry.examples.push(`${parsed.value}${parsed.isPercent ? '%' : ''} :: ${item.name}`);
        }
        if (entry.sources.size < 8) entry.sources.add(item.name);
        if (/for \d+s/i.test(parsed.name)) entry.conditions.add('duration');
        if (/Stacks up to/i.test(parsed.name)) entry.conditions.add('stacks');
        if (/on Kill/i.test(parsed.name)) entry.conditions.add('onKill');
        if (/on Headshot/i.test(parsed.name)) entry.conditions.add('onHeadshot');
        if (/when Aiming/i.test(parsed.name)) entry.conditions.add('whenAiming');
        if (/while.*Aim Glide/i.test(parsed.name)) entry.conditions.add('aimGlide');
        if (/while.*Wall Latch/i.test(parsed.name)) entry.conditions.add('wallLatch');
        if (/while.*Sliding/i.test(parsed.name)) entry.conditions.add('slide');
        if (/on Spawn/i.test(parsed.name)) entry.conditions.add('onSpawn');
        if (/per Status Type/i.test(parsed.name)) entry.conditions.add('perStatus');
        if (/per Combo/i.test(parsed.name)) entry.conditions.add('perCombo');
        if (/while Airborne/i.test(parsed.name)) entry.conditions.add('airborne');
        if (/during.*Heavy/i.test(parsed.name)) entry.conditions.add('heavyAttack');
        if (/on Critical Hit/i.test(parsed.name)) entry.conditions.add('onCritHit');
        if (/on Status Effect/i.test(parsed.name)) entry.conditions.add('onStatusEffect');
        if (/on Energy/i.test(parsed.name)) entry.conditions.add('onEnergyPickup');
        if (/on Health/i.test(parsed.name)) entry.conditions.add('onHealthPickup');
        if (/on Ammo/i.test(parsed.name)) entry.conditions.add('onAmmoPickup');
        if (/Sprint/i.test(parsed.name)) entry.conditions.add('sprint');
      }
    }
  }
  if (hasStats) entriesWithStats++;
}

const sorted = [...statLines.values()].sort((a, b) => a.name.localeCompare(b.name));

const report = {
  summary: {
    totalItems: all.length,
    modsScanned: modCount,
    arcanesScanned: arcaneCount,
    entriesWithStats,
    parsedLines,
    uniqueStatLines: sorted.length,
  },
  statLines: sorted.map(s => ({
    name: s.name,
    isPercent: s.isPercent,
    conditions: [...s.conditions].sort(),
    sources: [...s.sources],
    examples: s.examples,
  })),
};

const outPath = path.resolve(__dirname, '../.runtime/stat-catalog.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
console.log('Written ' + sorted.length + ' unique stat lines (from ' + parsedLines + ' parsed lines)');
console.log('Mods: ' + modCount + ', Arcanes: ' + arcaneCount + ', Entries with stats: ' + entriesWithStats);
