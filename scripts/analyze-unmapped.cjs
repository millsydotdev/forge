/**
 * Analyzes unmapped stat names from @wfcd/items.
 * Categorizes by pattern type.
 */
const Items = require('@wfcd/items');
const all = new Items();

const ENGINE_MAP_KEYS = new Set([
  'Damage','Base Damage','Weapon Damage','Melee Damage',
  'Multishot',
  'Critical Chance','Critical Damage','Melee Critical Chance','Melee Critical Damage',
  'Heat','Cold','Electricity','Toxin','Radiation','Viral','Corrosive','Blast','Gas','Magnetic',
  'Impact','Puncture','Slash',
  'Fire Rate','Attack Speed','Draw Speed','Charge Rate',
  'Magazine Capacity','Max Ammo','Ammo Maximum',
  'Reload Speed','Reload Time',
  'Status Chance','Status Duration','Status Damage','Melee Status Chance','Melee Status Damage',
  'Punch Through','Range','Melee Range',
  'Combo Duration','Combo Count Chance',
  'Slam Attack','Slide Attack','Finisher Damage','Ground Finisher Damage','Slam Radial Damage',
  'Channeling Damage','Channeling Cost',
  'Ability Strength','Ability Duration','Ability Range','Ability Efficiency',
  'Health','Shield Capacity','Maximum Shields','Armor','Energy Maximum','Maximum Energy',
  'Sprint Speed','Holster Speed',
  'Aura Strength','Enemy Armor','Enemy Max Shield','Energy Restore',
  'Weapon Recoil','Projectile Speed','Zoom','Accuracy','Beam Range','Blast Radius','Blast Range',
  'Shield Recharge','Shield Recharge Delay','to Parkour Velocity','Aim Glide/Wall Latch Duration',
  'Casting Speed','Health Regen','Health per hit','Bleedout Reduction','Revive Speed',
  'Damage during Bleedout','Damage Taken During Revive','Energy Max','Energy',
  'Overguard Max','Slide','Friction','Jump Height','Dodge Speed','Mobility',
  'Gravity while Aim Gliding','Gravity while Falling Down','Bullet Jump',
  'Damage Block','Parry Angle','Enemy Radar','Loot Radar',
  'Chance to Explode (Use with Caution)',
  'Life Steal','Life Steal on Heavy Attack','Life Steal on Nikanas',
  'Weak Point Damage','Weak Point Critical Chance. Multishot cannot be modified.',
  'Headshot Damage','Bodyshot Damage',
  'Damage on first shot in Magazine','Bonus Damage on final shot. Requires Magazine 6 or higher.',
  'Damage while Invisible','damage if no enemies are within 10m.',
  'Critical Chance for Slide Attack','Critical Damage when inside the Marked Zone.',
  'Melee Damage per Status Type affecting the target',
  'Direct Damage per Status Type affecting the target for 20s. Stacks up to 2x.',
  'to Headshot Multiplier',
  'Critical Chance stacks with Combo Multiplier','Status Chance per Combo Multiplier',
  'Maximum Shields per enemy killed for 10s (Maximum 10 stacks)',
  'Critical Chance (x2 for Heavy Attacks)',
  'Chance to Resist Knockdown',
  'Additional Combo Count Chance','Additional Combo Count Chance on Lifted enemies',
  'Combo Count Chance while Blocking','Combo Count Chance while Blocking with a Shield',
  'Status Chance on Lifted enemies','Status Chance per Combo Multiplier',
  'Ammo Efficiency while Airborne',
  'Accuracy while Airborne','Accuracy when Aiming','Critical Chance when Aiming',
  'Critical Damage when Aiming','Fire Rate when Aiming','Status Chance when Aiming',
  'Damage when Aiming',
  'Fire Rate when Airborne','Fire Rate when Crouching','Weapon Recoil while Airborne',
  'Chance to deal Electrical Damage when shield struck',
  'Overguard Damage',
  'Elemental Resistance','Physical Damage Resistance',
  'Shield Resistance to Environmental Ice Hazards',
  'Faster Knockdown Recovery','Faster Stagger Recovery',
  'Energy from Health Orbs',
  'Companion Health Regen/s',
  'Heavy Attack Wind Up Speed','Heavy Attack Efficiency','Initial Combo',
  'Damage to Corpus','Damage to Grineer','Damage to Infested',
  'Damage to Orokin','Damage to Murmur','Damage to Sentient',
]);

// Resistances
for (const el of ['Heat','Cold','Electricity','Toxin','Radiation','Magnetic','Blast','Viral','Corrosive','Gas','Tau']) {
  ENGINE_MAP_KEYS.add(el + ' Resistance');
}

const STAT_ALIAS = {
  'Power Strength':'Ability Strength','Power Duration':'Ability Duration',
  'Power Range':'Ability Range','Power Efficiency':'Ability Efficiency',
  'Critical Hit Chance':'Critical Chance','Critical Hit Damage':'Critical Damage',
  'Fire':'Heat','Freeze':'Cold','Shock':'Electricity','Poison':'Toxin',
  'Impact Damage':'Impact','Puncture Damage':'Puncture','Slash Damage':'Slash',
  'Shield':'Shield Capacity','Shields':'Shield Capacity',
  'Energy Max':'Energy Maximum','Maximum Energy':'Energy Maximum','Max Energy':'Energy Maximum',
  'Damage (Primary/Secondary)':'Damage','Damage (Melee)':'Melee Damage',
  'Fire Rate (Auto)':'Fire Rate','Fire Rate (Semi-Auto)':'Fire Rate',
  'Fire Rate (x2 for Bows)':'Fire Rate',
  'Flight Speed':'Projectile Speed','Reload Amount':'Reload Speed','Reload':'Reload Speed',
  'Reload Time':'Reload Speed','Beam Length':'Beam Range',
  'Max Shield Capacity':'Shield Capacity',
};

const STAT_RE_ANCHORED = /^([+-]\d+(?:\.\d+)?)(%?)\s*(.+)/;
const NLD_RE = /^(\d+(?:\.\d+)?)(%?)\s*(.+)/;
const XP_RE = /^x(\d+(?:\.\d+)?)\s*(.+)/;
const COLOR_TAG = /<[^>]+>/g;

// Skip known prose first-words
const PROSE_STARTS = new Set([
  'Sentinel','Companion','Reveals','Reduced','Increases','Decreases',
  'Creates','Shoot','Converts','Disable','Stall','Drains','Refills',
  'Opens','Gain','Revives','Heals','Draws','Strikes','Deploys',
  'Summons','Casts','Swaps','Leaves','Becomes','Convert','Requires',
  'Detects','Collects','Applies','Returns','Clears','Shield',
]);

const standardNames = new Map();
const nldNames = new Map();
const xpNames = new Map();

for (const item of all) {
  if (item.category !== 'Mods') continue;
  const mod = item;
  if (!mod.levelStats) continue;
  for (const ls of mod.levelStats) {
    if (!ls.stats) continue;
    for (const raw of ls.stats) {
      for (const line of raw.split('\n')) {
        const cleaned = line.replace(COLOR_TAG, '').trim();
        if (!cleaned) continue;
        
        const firstWord = cleaned.split(/\s/)[0] || '';
        if (PROSE_STARTS.has(firstWord) && !/^[+-x\d]/.test(cleaned)) {
          continue;
        }
        
        let m;
        if (m = STAT_RE_ANCHORED.exec(cleaned)) {
          const name = m[3].trim();
          const aliased = STAT_ALIAS[name] || name;
          if (!ENGINE_MAP_KEYS.has(aliased) && !ENGINE_MAP_KEYS.has(name)) {
            standardNames.set(name, (standardNames.get(name) || 0) + 1);
          }
        } else if (m = NLD_RE.exec(cleaned)) {
          const name = m[3].trim();
          const aliased = STAT_ALIAS[name] || name;
          if (!ENGINE_MAP_KEYS.has(aliased) && !ENGINE_MAP_KEYS.has(name)) {
            nldNames.set(name, (nldNames.get(name) || 0) + 1);
          }
        } else if (m = XP_RE.exec(cleaned)) {
          const name = m[2].trim();
          const aliased = STAT_ALIAS[name] || name;
          if (!ENGINE_MAP_KEYS.has(aliased) && !ENGINE_MAP_KEYS.has(name)) {
            xpNames.set(name, (xpNames.get(name) || 0) + 1);
          }
        }
      }
    }
  }
}

console.log('=== UNIQUE UNMAPPED STAT NAMES BY PATTERN ===');
console.log('Standard (+/-): ' + standardNames.size);
console.log('NoLeadDigit:    ' + nldNames.size);
console.log('x-Prefix:       ' + xpNames.size);
console.log('Total unmapped: ' + (standardNames.size + nldNames.size + xpNames.size));

console.log('\n=== TOP 60 UNMAPPED STANDARD NAMES ===');
[...standardNames.entries()].sort((a,b) => b[1] - a[1]).slice(0, 60).forEach(([name, count]) => {
  console.log('  [' + count + '] ' + name.slice(0, 100));
});

console.log('\n=== ALL NLD NAMES ===');
[...nldNames.entries()].sort((a,b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log('  [' + count + '] ' + name.slice(0, 100));
});

console.log('\n=== ALL X-PREFIX NAMES ===');
[...xpNames.entries()].sort((a,b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log('  [' + count + '] ' + name.slice(0, 100));
});
