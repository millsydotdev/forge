const fs = require('fs');
const path = require('path');
const Items = require('@wfcd/items');

console.log('Loading items from @wfcd/items...');
const items = new Items();
const mods = items.filter(item => item.category === 'Mods');
console.log(`Found ${mods.length} mods.`);

// Let's parse and count unique mod stat strings.
const statCounts = new Map();
const statExamples = new Map();

const STAT_RE = /([+-]?\d+(?:\.\d+)?)%?\s*(.*)/;
const COLOR_TAG = /<[^>]+>/g;

function parseStatLine(line) {
  const cleaned = line.replace(COLOR_TAG, '').trim();
  const m = STAT_RE.exec(cleaned);
  if (!m) return null;
  const isPercent = cleaned.includes('%');
  return { name: m[2].trim(), value: parseFloat(m[1]), isPercent };
}

// Full STAT_MAP keys from wfcd-resolver.ts to see what is mapped
const KNOWN_STATS = new Set([
  'Damage', 'Base Damage', 'Weapon Damage', 'Multishot',
  'Critical Chance', 'Critical Damage', 'Melee Critical Chance', 'Melee Critical Damage',
  'Heat', 'Cold', 'Electricity', 'Toxin', 'Radiation', 'Viral', 'Corrosive', 'Blast', 'Gas', 'Magnetic',
  'Impact', 'Puncture', 'Slash', 'Melee Damage',
  'Fire Rate', 'Attack Speed', 'Draw Speed', 'Charge Rate',
  'Magazine Capacity', 'Max Ammo', 'Ammo Maximum',
  'Reload Speed', 'Reload Time',
  'Status Chance', 'Status Duration', 'Melee Status Chance',
  'Punch Through', 'Range', 'Melee Range',
  'Combo Duration', 'Combo Count Chance',
  'Slam Attack', 'Slide Attack', 'Finisher Damage', 'Ground Finisher Damage', 'Slam Radial Damage',
  'Channeling Cost', 'Channeling Damage',
  'Ability Strength', 'Ability Duration', 'Ability Range', 'Ability Efficiency',
  'Health', 'Shield Capacity', 'Maximum Shields', 'Armor', 'Energy Maximum', 'Maximum Energy', 'Sprint Speed', 'Holster Speed',
  'Aura Strength', 'Enemy Armor', 'Enemy Max Shield', 'Energy Restore',
  // Faction
  'Damage to Corpus', 'Damage to Grineer', 'Damage to Infested', 'Damage to Orokin', 'Damage to Murmur', 'Damage to Sentients',
  // Heavy Attack
  'Heavy Attack Wind Up Speed', 'Heavy Attack Efficiency', 'Initial Combo', 'Critical Chance (x2 for Heavy Attacks)',
  // Aiming
  'Critical Chance when Aiming', 'Critical Damage when Aiming', 'Accuracy when Aiming', 'Fire Rate when Aiming',
  // Utility
  'Weapon Recoil', 'Projectile Speed', 'Zoom', 'Accuracy',
  // Survivability/Movement
  'Shield Recharge', 'Shield Recharge Delay', 'to Parkour Velocity', 'Aim Glide/Wall Latch Duration',
]);

const KNOWN_ALIASES = new Set([
  'Power Strength', 'Power Duration', 'Power Range', 'Power Efficiency',
  'Critical Hit Chance', 'Critical Hit Damage',
  'Fire', 'Freeze', 'Shock', 'Poison',
  'Impact Damage', 'Puncture Damage', 'Slash Damage',
  'Shield', 'Shields', 'Energy Max',
  'Damage (Primary/Secondary)', 'Damage (Melee)', 'Fire Rate (Auto)', 'Fire Rate (Semi-Auto)',
  'Fire Rate (x2 for Bows)', 'Flight Speed', 'Reload Amount', 'Reload',
]);

const unmappedStats = new Map();
const mappedStats = new Map();
const nonNumericProse = [];

for (const mod of mods) {
  // If there are levelStats, check the last rank (fully upgraded mod stats)
  if (!mod.levelStats || mod.levelStats.length === 0) continue;
  const maxRankStats = mod.levelStats[mod.levelStats.length - 1].stats || [];
  
  for (const line of maxRankStats) {
    const parsed = parseStatLine(line);
    if (!parsed) {
      nonNumericProse.push({ mod: mod.name, line });
      continue;
    }
    
    const canonicalName = parsed.name;
    const isMapped = KNOWN_STATS.has(canonicalName) || KNOWN_ALIASES.has(canonicalName);
    
    if (isMapped) {
      mappedStats.set(canonicalName, (mappedStats.get(canonicalName) || 0) + 1);
    } else {
      unmappedStats.set(canonicalName, (unmappedStats.get(canonicalName) || 0) + 1);
      if (!statExamples.has(canonicalName)) {
        statExamples.set(canonicalName, { mod: mod.name, line, parsed });
      }
    }
  }
}

console.log(`Mapped unique stat names found: ${mappedStats.size}`);
console.log(`Unmapped unique stat names found: ${unmappedStats.size}`);

// Write a structured report to the artifacts directory.
const reportPath = process.argv[2] || 'mod_stats_report.md';

let md = `# Warframe Mod Statistics Analysis & Math Engine Spec

This document catalogs all mod statistics resolved from '@wfcd/items'. It identifies which mod statistics are currently mapped, which ones are unmapped, and how the math engine can resolve them to perform correct calculations.

---

## 1. Summary of Mod Stat Coverage
* **Total Mods Analyzed:** ${mods.length}
* **Unique Mapped Stat Types Found:** ${mappedStats.size}
* **Unique Unmapped Stat Types Found:** ${unmappedStats.size}
* **Mods with Non-Numeric/Prose Stats (e.g. Augments, special conditions):** ${nonNumericProse.length}

---

## 2. Unmapped Mod Stats Catalog
Below is a list of all unique unmapped mod stat strings found in the '@wfcd/items' database, along with examples and proposed mathematical treatments.

| Stat Name / Text | Occurrences | Example Mod | Sample Line | Proposed Math & Category |
| --- | --- | --- | --- | --- |
`;

const sortedUnmapped = [...unmappedStats.entries()].sort((a, b) => b[1] - a[1]);
for (const [name, count] of sortedUnmapped) {
  const ex = statExamples.get(name);
  let proposal = 'TBD';
  
  // Basic heuristic suggestions for the math engine:
  const lower = name.toLowerCase();
  if (lower.includes('aim') || lower.includes('zoom')) {
    proposal = '`MULTIPLIER` for zoom / weapon aiming magnification';
  } else if (lower.includes('recoil')) {
    proposal = '`MULTIPLIER` for weapon recoil reduction (additive sum)';
  } else if (lower.includes('accuracy')) {
    proposal = '`MULTIPLIER` for weapon accuracy (additive sum)';
  } else if (lower.includes('silence') || lower.includes('hush') || lower.includes('suppression')) {
    proposal = '`FLAT` boolean / percentage noise reduction';
  } else if (lower.includes('heavy attack') || lower.includes('wind up') || lower.includes('preparation')) {
    proposal = '`MULTIPLIER` for heavy attack wind-up speed';
  } else if (lower.includes('parkour') || lower.includes('bullet jump') || lower.includes('aim glide')) {
    proposal = '`MULTIPLIER` for movement utility / parkour velocity';
  } else if (lower.includes('loot') || lower.includes('radar')) {
    proposal = '`FLAT` utility range (meters)';
  } else if (lower.includes('damage to')) {
    proposal = 'Faction damage `MULTIPLIER` (applies multiplicatively to final damage)';
  } else if (lower.includes('projectile speed') || lower.includes('flight speed')) {
    proposal = '`MULTIPLIER` for projectile flight velocity';
  } else if (lower.includes('holster') || lower.includes('swap')) {
    proposal = '`MULTIPLIER` for weapon swap speed';
  } else if (lower.includes('headshot')) {
    proposal = '`MULTIPLIER` for headshot damage multiplier';
  }

  md += `| **${name}** | ${count} | *${ex.mod}* | \`${ex.line}\` | ${proposal} |\n`;
}

md += `
---

## 3. Mapped Mod Stats Reference
These stats are already supported in \`wfcd-resolver.ts\` and correctly parsed by the resolver:

| Stat Name | Occurrences |
| --- | --- |
`;

const sortedMapped = [...mappedStats.entries()].sort((a, b) => b[1] - a[1]);
for (const [name, count] of sortedMapped) {
  md += `| ${name} | ${count} |\n`;
}

md += `
---

## 4. Prose / Non-Numeric Mod Effects (Augments & Special Perks)
These mods have conditional logic, custom passive triggers, or prose lines that cannot be parsed by a simple regex. Examples:
`;

// Show a few samples of prose lines:
const proseSamples = nonNumericProse.slice(0, 15);
for (const sample of proseSamples) {
  md += `* **${sample.mod}**: \`${sample.line}\`\n`;
}
if (nonNumericProse.length > 15) {
  md += `* ... and ${nonNumericProse.length - 15} more. These require special conditional logic flags in the Build Planner rather than straight math additions.\n`;
}

fs.writeFileSync(reportPath, md);
console.log(`Successfully wrote report to ${reportPath}`);
