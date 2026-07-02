/**
 * Build-time script to generate a complete STAT_MAP from @wfcd/items.
 *
 * Scans all 1,800+ mods, extracts every unique stat name from their
 * levelStats strings, and uses pattern matching to map each one to
 * the engine's internal bucket system.
 *
 * Run: node scripts/generate-stat-map.cjs
 * Output: src/data/generated-stat-map.ts
 *
 * The generated file replaces the hand-written STAT_MAP in wfcd-resolver.ts.
 *
 * Coverage strategy:
 *   Anchored regex requires line to START with +/-/digit/x — eliminates
 *   prose descriptions. Unit suffixes (%/m/s) are stripped before name
 *   extraction. ~60 additional stat patterns mapped via alias + ENGINE_MAP
 *   + detectAutoMap.
 */
const fs = require('fs');
const path = require('path');

// ── Manual base mapping: these are the "known" engine buckets ────────
// Pattern-based auto-detection handles everything else.

const STAT_ALIAS = {
  // Ability aliases
  'Power Strength': 'Ability Strength',
  'Power Duration': 'Ability Duration',
  'Power Range': 'Ability Range',
  'Power Efficiency': 'Ability Efficiency',
  // Crit aliases
  'Critical Hit Chance': 'Critical Chance',
  'Critical Hit Damage': 'Critical Damage',
  // Elemental aliases
  'Fire': 'Heat',
  'Freeze': 'Cold',
  'Shock': 'Electricity',
  'Poison': 'Toxin',
  // Physical aliases
  'Impact Damage': 'Impact',
  'Puncture Damage': 'Puncture',
  'Slash Damage': 'Slash',
  // Warframe stat aliases
  'Shield': 'Shield Capacity',
  'Shields': 'Shield Capacity',
  'Energy Max': 'Energy Maximum',
  'Maximum Energy': 'Energy Maximum',
  'Max Energy': 'Energy Maximum',
  // Weapon aliases
  'Damage (Primary/Secondary)': 'Damage',
  'Damage (Melee)': 'Melee Damage',
  'Fire Rate (Auto)': 'Fire Rate',
  'Fire Rate (Semi-Auto)': 'Fire Rate',
  'Fire Rate (x2 for Bows)': 'Fire Rate',
  'Flight Speed': 'Projectile Speed',
  'Reload Amount': 'Reload Speed',
  'Reload': 'Reload Speed',
  'Reload Time': 'Reload Speed',
  'Beam Length': 'Beam Range',
  // Elemental on bullet jump
  'Heat on Bullet Jump': 'Heat',
  'Cold on Bullet Jump': 'Cold',
  'Electricity on Bullet Jump': 'Electricity',
  'Toxin on Bullet Jump': 'Toxin',
  'Impact on Bullet Jump': 'Impact',
  'Puncture on Bullet Jump': 'Puncture',
  'Slash on Bullet Jump': 'Slash',
  // Galvanized / conditional aliases
  'Critical Chance when Aiming for 12s': 'Critical Chance when Aiming',
  'Critical Chance when Aiming for 12s. Stacks up to 5x.': 'Critical Chance when Aiming',
  'Critical Damage when Aiming for 9s': 'Critical Damage when Aiming',
  'Fire Rate when Aiming for 9s': 'Fire Rate when Aiming',
  'Accuracy when Aiming for 9s': 'Accuracy when Aiming',
  'Status Chance when Aiming for 9s': 'Status Chance when Aiming',
  'Multishot for 20s. Stacks up to 4x.': 'Multishot',
  'Multishot for 20s. Stacks up to 5x.': 'Multishot',
  // Additional common aliases
  'COMBO COUNT CHANCE': 'Combo Count Chance',
  'Max Shield Capacity': 'Shield Capacity',
  'Parkour Velocity': 'to Parkour Velocity',
  'Zoom while Aim Gliding': 'Zoom',
  'Slam Attack Damage': 'Slam Attack',
  'Reload Speed on Shotguns': 'Reload Speed',
  'Beam Range': 'Beam Range', // already correct but ensure consistency
};

// ── The core mapping: stat name → engine bucket ──────────────────────
// These are the primary stat names that the pattern matcher resolves TO.
// The key is a normalized stat name from WFCD; the value is the engine mapping.
const ENGINE_MAP = {};

function def(stat, category, stackingGroup, priority = 1, scaleByHundred = true) {
  return { stat, category, stackingGroup, priority, scaleByHundred };
}

// ── Weapon Base ──────────────────────────────────────────────────────
ENGINE_MAP['Damage']                       = def('base_damage', 'MULTIPLIER', 'weapon_base_damage', 1);
ENGINE_MAP['Base Damage']                  = def('base_damage', 'MULTIPLIER', 'weapon_base_damage', 1);
ENGINE_MAP['Weapon Damage']                = def('base_damage', 'MULTIPLIER', 'weapon_base_damage', 1);
ENGINE_MAP['Melee Damage']                 = def('base_damage', 'MULTIPLIER', 'weapon_base_damage', 1);

// ── Multishot ────────────────────────────────────────────────────────
ENGINE_MAP['Multishot']                    = def('multishot', 'MULTIPLIER', 'weapon_multishot', 3);

// ── Critical ─────────────────────────────────────────────────────────
ENGINE_MAP['Critical Chance']              = def('crit_chance', 'MULTIPLIER', 'weapon_crit', 4);
ENGINE_MAP['Critical Damage']              = def('crit_damage', 'MULTIPLIER', 'weapon_crit_damage', 4);
ENGINE_MAP['Melee Critical Chance']        = def('crit_chance', 'MULTIPLIER', 'weapon_crit', 4);
ENGINE_MAP['Melee Critical Damage']        = def('crit_damage', 'MULTIPLIER', 'weapon_crit_damage', 4);

// ── Elemental ────────────────────────────────────────────────────────
for (const el of ['Heat', 'Cold', 'Electricity', 'Toxin', 'Radiation', 'Viral', 'Corrosive', 'Blast', 'Gas', 'Magnetic']) {
  ENGINE_MAP[el] = def(`elemental_${el.toLowerCase()}`, 'MULTIPLIER', 'weapon_elemental', 2);
}

// ── Physical ─────────────────────────────────────────────────────────
ENGINE_MAP['Impact']                       = def('physical_impact', 'MULTIPLIER', 'weapon_physical', 2);
ENGINE_MAP['Puncture']                     = def('physical_puncture', 'MULTIPLIER', 'weapon_physical', 2);
ENGINE_MAP['Slash']                        = def('physical_slash', 'MULTIPLIER', 'weapon_physical', 2);

// ── Fire Rate / Attack Speed ─────────────────────────────────────────
ENGINE_MAP['Fire Rate']                    = def('fire_rate', 'MULTIPLIER', 'weapon_fire_rate', 3);
ENGINE_MAP['Attack Speed']                 = def('attack_speed', 'MULTIPLIER', 'weapon_attack_speed', 3);
ENGINE_MAP['Draw Speed']                   = def('fire_rate', 'MULTIPLIER', 'weapon_fire_rate', 3);
ENGINE_MAP['Charge Rate']                  = def('fire_rate', 'MULTIPLIER', 'weapon_fire_rate', 3);

// ── Magazine / Ammo ──────────────────────────────────────────────────
ENGINE_MAP['Magazine Capacity']            = def('magazine', 'MULTIPLIER', 'weapon_magazine', 3);
ENGINE_MAP['Max Ammo']                     = def('max_ammo', 'MULTIPLIER', 'weapon_ammo', 3);
ENGINE_MAP['Ammo Maximum']                 = def('max_ammo', 'MULTIPLIER', 'weapon_ammo', 3);

// ── Reload ────────────────────────────────────────────────────────────
ENGINE_MAP['Reload Speed']                 = def('reload_speed_mult', 'MULTIPLIER', 'weapon_reload', 3);
ENGINE_MAP['Reload Time']                  = def('reload_speed_mult', 'MULTIPLIER', 'weapon_reload', 3);

// ── Status ────────────────────────────────────────────────────────────
ENGINE_MAP['Status Chance']                = def('status_chance', 'MULTIPLIER', 'weapon_status', 3);
ENGINE_MAP['Status Duration']              = def('status_duration', 'MULTIPLIER', 'weapon_status', 3);
ENGINE_MAP['Melee Status Chance']          = def('status_chance', 'MULTIPLIER', 'weapon_status', 3);
ENGINE_MAP['Status Damage']                = def('status_damage', 'MULTIPLIER', 'weapon_status', 3);

// ── Punch Through / Range ─────────────────────────────────────────────
ENGINE_MAP['Punch Through']                = def('punch_through', 'FLAT', 'weapon_utility', 3);
ENGINE_MAP['Range']                        = def('melee_range', 'MULTIPLIER', 'weapon_range', 3);
ENGINE_MAP['Melee Range']                  = def('melee_range', 'MULTIPLIER', 'weapon_range', 3);

// ── Combo ────────────────────────────────────────────────────────────
ENGINE_MAP['Combo Duration']               = def('combo_duration', 'FLAT', 'weapon_combo', 3);
ENGINE_MAP['Combo Count Chance']           = def('combo_chance', 'MULTIPLIER', 'weapon_combo', 3);

// ── Slam / Slide / Finisher ──────────────────────────────────────────
ENGINE_MAP['Slam Attack']                  = def('slam_attack', 'MULTIPLIER', 'weapon_melee_special', 3);
ENGINE_MAP['Slide Attack']                 = def('slide_attack', 'MULTIPLIER', 'weapon_melee_special', 3);
ENGINE_MAP['Finisher Damage']              = def('finisher_damage', 'MULTIPLIER', 'weapon_melee_special', 3);
ENGINE_MAP['Ground Finisher Damage']       = def('finisher_damage', 'MULTIPLIER', 'weapon_melee_special', 3);
ENGINE_MAP['Slam Radial Damage']           = def('slam_attack', 'MULTIPLIER', 'weapon_melee_special', 3);

// ── Channeling ────────────────────────────────────────────────────────
ENGINE_MAP['Channeling Damage']            = def('channeling_damage', 'MULTIPLIER', 'weapon_channeling', 3);
ENGINE_MAP['Channeling Cost']              = def('channeling_cost', 'MULTIPLIER', 'weapon_channeling', 3);

// ── Warframe Ability Stats ──────────────────────────────────────────
ENGINE_MAP['Ability Strength']             = def('strength', 'MULTIPLIER', 'ability', 1);
ENGINE_MAP['Ability Duration']             = def('duration', 'MULTIPLIER', 'ability', 1);
ENGINE_MAP['Ability Range']                = def('range', 'MULTIPLIER', 'ability', 1);
ENGINE_MAP['Ability Efficiency']           = def('efficiency', 'MULTIPLIER', 'ability', 1);

// ── Warframe Core ─────────────────────────────────────────────────────
ENGINE_MAP['Health']                       = def('health', 'MULTIPLIER', 'warframe_health', 1);
ENGINE_MAP['Shield Capacity']              = def('shields', 'MULTIPLIER', 'warframe_shields', 1);
ENGINE_MAP['Maximum Shields']              = def('shields', 'MULTIPLIER', 'warframe_shields', 1);
ENGINE_MAP['Armor']                        = def('armor', 'MULTIPLIER', 'warframe_armor', 1);
ENGINE_MAP['Energy Maximum']               = def('energy', 'MULTIPLIER', 'warframe_energy', 1);
ENGINE_MAP['Maximum Energy']               = def('energy', 'MULTIPLIER', 'warframe_energy', 1);
ENGINE_MAP['Sprint Speed']                 = def('sprint_speed', 'MULTIPLIER', 'warframe_move', 1);
ENGINE_MAP['Holster Speed']                = def('holster_speed', 'MULTIPLIER', 'warframe_move', 3);

// ── Aura / Squad ─────────────────────────────────────────────────────
ENGINE_MAP['Aura Strength']                = def('aura_strength', 'FLAT', 'aura', 5);
ENGINE_MAP['Enemy Armor']                  = def('enemy_armor', 'MULTIPLIER', 'aura_debuff', 5);
ENGINE_MAP['Enemy Max Shield']             = def('enemy_shield', 'MULTIPLIER', 'aura_debuff', 5);
ENGINE_MAP['Energy Restore']               = def('energy_regen', 'FLAT', 'warframe_energy', 5);

// ── Faction Damage ───────────────────────────────────────────────────
for (const fac of ['Corpus', 'Grineer', 'Infested', 'Orokin', 'Murmur', 'Sentient']) {
  ENGINE_MAP[`Damage to ${fac}`] = def(`faction_${fac.toLowerCase()}`, 'MULTIPLIER', 'faction_damage', 3);
}

// ── Heavy Attack ───────────────────────────────────────────────────────
ENGINE_MAP['Heavy Attack Wind Up Speed']   = def('heavy_wind_up', 'MULTIPLIER', 'weapon_heavy', 3);
ENGINE_MAP['Heavy Attack Efficiency']      = def('heavy_efficiency', 'MULTIPLIER', 'weapon_heavy', 3);
ENGINE_MAP['Initial Combo']                = def('initial_combo', 'FLAT', 'weapon_heavy', 3);
ENGINE_MAP['Critical Chance (x2 for Heavy Attacks)'] = def('heavy_crit_chance', 'MULTIPLIER', 'weapon_crit', 4);

// ── Conditional/Aiming ────────────────────────────────────────────────
ENGINE_MAP['Critical Chance when Aiming']  = def('aiming_crit_chance', 'MULTIPLIER', 'weapon_crit', 4);
ENGINE_MAP['Critical Damage when Aiming']  = def('aiming_crit_dmg', 'MULTIPLIER', 'weapon_crit_damage', 4);
ENGINE_MAP['Accuracy when Aiming']         = def('aiming_accuracy', 'MULTIPLIER', 'weapon_accuracy', 3);
ENGINE_MAP['Fire Rate when Aiming']        = def('aiming_fire_rate', 'MULTIPLIER', 'weapon_fire_rate', 3);
ENGINE_MAP['Status Chance when Aiming']    = def('aiming_status_chance', 'MULTIPLIER', 'weapon_status', 3);
ENGINE_MAP['Damage when Aiming']           = def('aiming_damage', 'MULTIPLIER', 'weapon_base_damage', 1);

// ── Utility ───────────────────────────────────────────────────────────
ENGINE_MAP['Weapon Recoil']                = def('weapon_recoil', 'MULTIPLIER', 'weapon_recoil', 3);
ENGINE_MAP['Projectile Speed']             = def('projectile_speed', 'MULTIPLIER', 'weapon_speed', 3);
ENGINE_MAP['Zoom']                         = def('zoom', 'MULTIPLIER', 'weapon_zoom', 3);
ENGINE_MAP['Accuracy']                     = def('accuracy', 'MULTIPLIER', 'weapon_accuracy', 3);
ENGINE_MAP['Beam Range']                   = def('beam_range', 'FLAT', 'weapon_range', 3);
ENGINE_MAP['Blast Radius']                 = def('blast_radius', 'MULTIPLIER', 'weapon_utility', 3);
ENGINE_MAP['Blast Range']                  = def('blast_radius', 'MULTIPLIER', 'weapon_utility', 3);

// ── Survivability/Movement ────────────────────────────────────────────
ENGINE_MAP['Shield Recharge']              = def('shield_recharge', 'MULTIPLIER', 'warframe_shields', 1);
ENGINE_MAP['Shield Recharge Delay']        = def('shield_recharge_delay', 'MULTIPLIER', 'warframe_shields', 1);
ENGINE_MAP['to Parkour Velocity']          = def('parkour_velocity', 'MULTIPLIER', 'warframe_move', 1);
ENGINE_MAP['Aim Glide/Wall Latch Duration'] = def('aim_glide_dur', 'MULTIPLIER', 'warframe_move', 1);

// ── Special Math ──────────────────────────────────────────────────────
ENGINE_MAP['Melee Damage per Status Type affecting the target'] = def('co_damage', 'MULTIPLIER', 'weapon_co', 1);
ENGINE_MAP['Direct Damage per Status Type affecting the target for 20s. Stacks up to 2x.'] = def('co_damage', 'MULTIPLIER', 'weapon_co', 1);
ENGINE_MAP['to Headshot Multiplier']       = def('headshot_multiplier', 'MULTIPLIER', 'weapon_crit_damage', 4);

// ── Combo-Scaling (Blood Rush / Weeping Wounds) ───────────────────────
ENGINE_MAP['Critical Chance stacks with Combo Multiplier'] = def('crit_chance_combo', 'MULTIPLIER', 'weapon_crit', 4);
ENGINE_MAP['Status Chance per Combo Multiplier'] = def('status_chance_combo', 'MULTIPLIER', 'weapon_status', 3);

// ── Missing Weapon Stats ──────────────────────────────────────────────
ENGINE_MAP['Damage on first shot in Magazine']    = def('first_shot_damage', 'MULTIPLIER', 'weapon_first_shot', 1);
ENGINE_MAP['Bonus Damage on final shot. Requires Magazine 6 or higher.'] = def('final_shot_damage', 'MULTIPLIER', 'weapon_final_shot', 1);
ENGINE_MAP['Damage while Invisible']              = def('invisible_damage', 'MULTIPLIER', 'weapon_conditional_damage', 1);
ENGINE_MAP['damage if no enemies are within 10m.'] = def('isolated_damage', 'MULTIPLIER', 'weapon_conditional_damage', 1);
ENGINE_MAP['Critical Chance for Slide Attack']    = def('slide_crit_chance', 'MULTIPLIER', 'weapon_crit', 4);
ENGINE_MAP['Critical Damage when inside the Marked Zone.'] = def('marked_zone_crit_dmg', 'MULTIPLIER', 'weapon_crit_damage', 4);
ENGINE_MAP['Weak Point Damage']                   = def('weakpoint_damage', 'MULTIPLIER', 'weapon_weakpoint', 1);
ENGINE_MAP['Weak Point Critical Chance. Multishot cannot be modified.'] = def('weakpoint_crit_chance', 'MULTIPLIER', 'weapon_crit', 4);
ENGINE_MAP['Headshot Damage']                     = def('headshot_damage', 'MULTIPLIER', 'weapon_headshot', 1);
ENGINE_MAP['Bodyshot Damage']                     = def('bodyshot_damage', 'MULTIPLIER', 'weapon_headshot', 1);
ENGINE_MAP['Life Steal']                           = def('life_steal', 'MULTIPLIER', 'weapon_lifesteal', 3);
ENGINE_MAP['Life Steal on Heavy Attack']           = def('life_steal_heavy', 'MULTIPLIER', 'weapon_lifesteal', 3);
ENGINE_MAP['Life Steal on Nikanas']                = def('life_steal', 'MULTIPLIER', 'weapon_lifesteal', 3);
ENGINE_MAP['Maximum Shields per enemy killed for 10s (Maximum 10 stacks)'] = def('shields', 'MULTIPLIER', 'warframe_shields', 1);
ENGINE_MAP['additional damage matching the target\'s weakness. Does not combine with other damage types.'] = def('weakness_damage', 'MULTIPLIER', 'weapon_special', 1);

// ── Warframe MISSING CORE STATS ───────────────────────────────────────
ENGINE_MAP['Overguard Max']                = def('overguard_max', 'MULTIPLIER', 'warframe_overguard', 1);
ENGINE_MAP['Casting Speed']                = def('casting_speed', 'MULTIPLIER', 'warframe_ability', 1);
ENGINE_MAP['Health Regen']                 = def('health_regen', 'FLAT', 'warframe_health', 1);
ENGINE_MAP['Health per hit']               = def('health_per_hit', 'FLAT', 'warframe_health', 1);
ENGINE_MAP['Bleedout Reduction']           = def('bleedout_reduction', 'MULTIPLIER', 'warframe_survival', 1);
ENGINE_MAP['Revive Speed']                 = def('revive_speed', 'MULTIPLIER', 'warframe_survival', 1);
ENGINE_MAP['Damage during Bleedout']       = def('bleedout_damage', 'MULTIPLIER', 'warframe_survival', 1);
ENGINE_MAP['Damage Taken During Revive']   = def('revive_damage_taken', 'MULTIPLIER', 'warframe_survival', 1);
ENGINE_MAP['Energy Max']                   = def('energy', 'MULTIPLIER', 'warframe_energy', 1);
ENGINE_MAP['Energy']                       = def('energy', 'MULTIPLIER', 'warframe_energy', 1);

// ── Warframe RESISTANCE STATS ─────────────────────────────────────────
const RESIST_TYPES = ['Heat', 'Cold', 'Electricity', 'Toxin', 'Radiation', 'Magnetic', 'Blast', 'Viral', 'Corrosive', 'Gas', 'Tau'];
for (const rt of RESIST_TYPES) {
  ENGINE_MAP[`${rt} Resistance`] = def(`resistance_${rt.toLowerCase()}`, 'MULTIPLIER', 'warframe_resistance', 1);
}
ENGINE_MAP['Elemental Resistance']         = def('resistance_elemental', 'MULTIPLIER', 'warframe_resistance', 1);
ENGINE_MAP['Physical Damage Resistance']   = def('resistance_physical', 'MULTIPLIER', 'warframe_resistance', 1);
ENGINE_MAP['Shield Resistance to Environmental Ice Hazards'] = def('resistance_ice_hazard', 'MULTIPLIER', 'warframe_resistance', 1);
ENGINE_MAP['Chance to Resist Knockdown']   = def('resist_knockdown', 'MULTIPLIER', 'warframe_resist_chance', 1);
ENGINE_MAP['Faster Knockdown Recovery']    = def('knockdown_recovery', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Faster Stagger Recovery']      = def('stagger_recovery', 'MULTIPLIER', 'warframe_movement', 1);

// ── Warframe MOVEMENT STATS ───────────────────────────────────────────
ENGINE_MAP['Slide']                        = def('slide', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Friction']                     = def('friction', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Jump Height']                  = def('jump_height', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Dodge Speed']                  = def('dodge_speed', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Mobility']                     = def('mobility', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Gravity while Aim Gliding']    = def('gravity_aim_glide', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Gravity while Falling Down']   = def('gravity_falling', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Bullet Jump']                  = def('bullet_jump', 'MULTIPLIER', 'warframe_movement', 1);

// ── Block / Parry ────────────────────────────────────────────────────
ENGINE_MAP['Damage Block']                 = def('damage_block', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['Parry Angle']                  = def('parry_angle', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['chance to Stagger on Block']   = def('stagger_on_block', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['chance to Stun on Block']      = def('stun_on_block', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['Damage Resistance while Dodging'] = def('dodge_dr', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['Damage Resistance during Bullet Jump'] = def('bullet_jump_dr', 'MULTIPLIER', 'warframe_block', 1);

// ── Enemy Radar / Loot Radar / Utility ────────────────────────────────
ENGINE_MAP['Enemy Radar']                  = def('enemy_radar', 'FLAT', 'warframe_utility', 3);
ENGINE_MAP['Loot Radar']                   = def('loot_radar', 'FLAT', 'warframe_utility', 3);
ENGINE_MAP['Chance to Explode (Use with Caution)'] = def('explode_chance', 'MULTIPLIER', 'weapon_utility', 3);

// ── Energy / Ammo Conversion Stats ────────────────────────────────────
ENGINE_MAP['Converts Secondary ammo pickups to 8% of Ammo Pick Up.'] = def('ammo_conversion', 'FLAT', 'warframe_utility', 3);

// ── Additional missing stat mappings ─────────────────────────────────────
// These are real stat names that appear in mod data but were not in the
// original hand-written map. Arranged by category for maintainability.

// Movement / Weapon conditionals
ENGINE_MAP['Movement Speed when Aiming']          = def('move_speed_aiming', 'MULTIPLIER', 'weapon_movement', 3);
ENGINE_MAP['Magazine Reloaded/s when Holstered']  = def('holster_reload', 'MULTIPLIER', 'weapon_utility', 3);
ENGINE_MAP['Bounce']                               = def('bounce', 'MULTIPLIER', 'weapon_utility', 3);
ENGINE_MAP['Final Status Chance']                  = def('status_chance', 'MULTIPLIER', 'weapon_status', 3);
ENGINE_MAP['Enemy Accuracy when targeting Warframe'] = def('enemy_accuracy_reduction', 'MULTIPLIER', 'warframe_survival', 1);
ENGINE_MAP['Energy from Health Orbs']              = def('energy_from_health_orbs', 'MULTIPLIER', 'warframe_energy', 3);
ENGINE_MAP['Chance to Resist Falls']               = def('resist_falls', 'MULTIPLIER', 'warframe_movement', 1);
ENGINE_MAP['Maximum Energy is filled on Spawn']    = def('energy_on_spawn', 'FLAT', 'warframe_energy', 3);
ENGINE_MAP['Energy Rate']                          = def('energy_regen', 'FLAT', 'warframe_energy', 3);

// Block / defensive conditionals
ENGINE_MAP['chance to Stagger on Block']           = def('stagger_on_block', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['chance to Stun on Block']              = def('stun_on_block', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['chance to reduce the Stagger effect from self-imposed Radial Attacks'] = def('self_stagger_reduction', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['Damage Resistance while Dodging']      = def('dodge_dr', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['Damage Resistance during Bullet Jump'] = def('bullet_jump_dr', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['chance to open enemies to Finisher Attacks after Warframe blocks Melee'] = def('finisher_on_block_chance', 'MULTIPLIER', 'warframe_block', 1);
ENGINE_MAP['Chance to deal Electrical Damage when shield struck by melee enemies.'] = def('shield_reflect_electric', 'MULTIPLIER', 'warframe_block', 1);

// Utility
ENGINE_MAP['chance to unlock locked lockers.']     = def('locker_chance', 'MULTIPLIER', 'warframe_utility', 3);

// Damage conversion (amalgam mods)
ENGINE_MAP['of Damage converted into Impact']      = def('damage_conversion_impact', 'FLAT', 'weapon_conversion', 3);
ENGINE_MAP['of Damage converted into Puncture']    = def('damage_conversion_puncture', 'FLAT', 'weapon_conversion', 3);
ENGINE_MAP['of Damage converted into Slash']       = def('damage_conversion_slash', 'FLAT', 'weapon_conversion', 3);

// Conditional: Reload Speed while Aim Gliding
ENGINE_MAP['Reload Speed while Aim Gliding']       = def('reload_speed_mult', 'MULTIPLIER', 'weapon_reload', 3);

// Compound stats — handled by splitStatBlob at runtime but added here
// so the generator map doesn't drop them.
ENGINE_MAP['Critical Chance and Damage when Aiming'] = def('crit_chance', 'MULTIPLIER', 'weapon_crit', 4);

// Operator / Amp stats (basic coverage)
ENGINE_MAP['Operator Health & Shields']           = def('operator_health_shields', 'MULTIPLIER', 'operator_base', 1);
ENGINE_MAP['Operator Shields']                    = def('operator_shields', 'MULTIPLIER', 'operator_base', 1);
ENGINE_MAP['Amp Multishot']                       = def('amp_multishot', 'MULTIPLIER', 'amp_base', 3);
ENGINE_MAP['Amp Critical Damage for each Zenurik School Mod'] = def('per_school_mod_bonus', 'MULTIPLIER', 'ability', 1);
ENGINE_MAP['Amp Energy Regen Rate for each Madurai School Mod'] = def('per_school_mod_bonus', 'MULTIPLIER', 'ability', 1);

// Companion stat sharing
ENGINE_MAP['Primary Weapon Critical Chance added to Companion'] = def('companion_shared_crit', 'MULTIPLIER', 'companion_stats', 3);
ENGINE_MAP['Primary Weapon Status Chance added to Companion'] = def('companion_shared_status', 'MULTIPLIER', 'companion_stats', 3);

// Melee specials
ENGINE_MAP['Melee Damage On Heavy Attack']         = def('heavy_damage', 'MULTIPLIER', 'weapon_heavy', 1);
ENGINE_MAP['Melee Damage On Heavy']                = def('heavy_damage', 'MULTIPLIER', 'weapon_heavy', 1);

// Movement
ENGINE_MAP['Velocity when falling']                = def('gravity_falling', 'MULTIPLIER', 'warframe_movement', 1);

// Conversion
ENGINE_MAP['Energy spent on abilities is converted to Shields.'] = def('energy_to_shields', 'FLAT', 'warframe_shields', 3);

// =========================================================================
// x-prefix mappings: "x1.05 Damage to Corpus" etc
// These are handled in detectAutoMap but also add direct entries for the
// stable stat names (without the multiplier factor).
const X_PREFIX_STATS = {
  'Damage to Sentients': 'faction_sentient',
  'Turret Damage vs Corpus': 'railjack_turret_corpus',
  'Turret Damage vs Sentients': 'railjack_turret_sentient',
  'Turret Damage vs Grineer': 'railjack_turret_grineer',
};
for (const [name, stat] of Object.entries(X_PREFIX_STATS)) {
  ENGINE_MAP[name] = def(stat, 'MULTIPLIER', 'faction_damage', 3);
}

// =========================================================================
// Pattern-based auto-detection: match stat names that FOLLOW known patterns
// but may not be in the exact map above.

// Detect "<value>% <StatName>" → check if the stat name is known
// This function handles things like "+17% Energy" which should map to 'energy'
// but isn't explicitly "Energy Maximum" or "Maximum Energy"

/**
 * stripUnitSuffix - Removes known unit suffixes from a stat name.
 * The regex catches patterns like:
 *   "m Enemy Radar" → "Enemy Radar"
 *   "s Combo Duration" → "Combo Duration"
 *   "m Beam Range" → "Beam Range"
 *   "s Companion Recovery Time" → "Companion Recovery Time"
 *   "° Damage" → "Damage" (unlikely but safe)
 */
function stripUnitSuffix(name) {
  return name.replace(/^(m|s|°|x)\s+/, '').trim();
}

function detectAutoMap(name) {
  const n = stripUnitSuffix(name.trim());

  // Damage type on bullet jump
  const bulletJumpMatch = n.match(/^(Heat|Cold|Electricity|Toxin|Impact|Puncture|Slash) on Bullet Jump$/);
  if (bulletJumpMatch) {
    const baseType = bulletJumpMatch[1];
    const elMap = {
      'Heat': 'elemental_heat', 'Cold': 'elemental_cold',
      'Electricity': 'elemental_electric', 'Toxin': 'elemental_toxin',
      'Impact': 'physical_impact', 'Puncture': 'physical_puncture', 'Slash': 'physical_slash',
    };
    const engineStat = elMap[baseType];
    if (engineStat) return def(engineStat, 'MULTIPLIER', 'weapon_elemental', 2);
  }

  // Percent-based Energy (not "Energy Maximum" but "Energy")
  if (n === 'Energy' || n === 'Max Energy') {
    return def('energy', 'MULTIPLIER', 'warframe_energy', 1);
  }

  // Combo Duration (already stripped of "s " prefix by stripUnitSuffix)
  if (n === 'Combo Duration') {
    return def('combo_duration', 'FLAT', 'weapon_combo', 3);
  }

  // Companion Recovery Time
  if (n === 'Companion Recovery Time') {
    return def('companion_recovery', 'FLAT', 'companion_base', 3);
  }

  // Companion Health Regen
  if (n.includes('Companion Health Regen')) {
    return def('companion_health_regen', 'FLAT', 'companion_base', 3);
  }

  // Enemy Radar / Loot Radar (after stripping "m " prefix)
  if (n === 'Enemy Radar') return def('enemy_radar', 'FLAT', 'warframe_utility', 3, false);
  if (n === 'Loot Radar') return def('loot_radar', 'FLAT', 'warframe_utility', 3, false);

  // Beam Range (after stripping "m " prefix)
  if (n === 'Beam Range') return def('beam_range', 'FLAT', 'weapon_range', 3);

  // Resist chance to specific status
  const resistStatusMatch = n.match(/^chance to resist a (\w+) Status effect\.?$/);
  if (resistStatusMatch) {
    return def(`resist_status_${resistStatusMatch[1].toLowerCase()}`, 'MULTIPLIER', 'warframe_resist_chance', 1);
  }

  // Energy from orbs / pickup
  if (n.includes('from Health Orbs')) {
    return def('energy_from_health_orbs', 'MULTIPLIER', 'warframe_energy', 3);
  }

  // Turret Damage (Railjack - out of scope but map anyway)
  if (n.startsWith('Turret Damage')) {
    return def('turret_damage', 'MULTIPLIER', 'railjack', 3);
  }

  // Railjack
  if (n.startsWith('Railjack')) {
    return def('railjack_speed', 'MULTIPLIER', 'railjack', 3);
  }
  if (n.startsWith('Forward Artillery')) {
    return def('railjack_artillery_damage', 'MULTIPLIER', 'railjack', 3);
  }
  if (n.startsWith('Ordnance')) {
    return def('railjack_ordnance', 'MULTIPLIER', 'railjack', 3);
  }
  if (n.startsWith('Forge')) {
    return def('railjack_forge', 'MULTIPLIER', 'railjack', 3);
  }
  if (n.startsWith('Omni')) {
    return def('railjack_omni', 'MULTIPLIER', 'railjack', 3);
  }
  if (n.startsWith('Hull')) {
    return def('railjack_hull', 'MULTIPLIER', 'railjack', 3);
  }

  // Additional combo count chance variants
  if (n.includes('Additional Combo Count Chance')) {
    return def('combo_chance', 'MULTIPLIER', 'weapon_combo', 3);
  }
  if (n.includes('Combo Count Chance while Blocking')) {
    return def('combo_chance', 'MULTIPLIER', 'weapon_combo', 3);
  }
  if (n.includes('Combo Count Chance on Lifted enemies')) {
    return def('combo_chance', 'MULTIPLIER', 'weapon_combo', 3);
  }

  // Status Chance on Lifted enemies
  if (n.includes('Status Chance on Lifted enemies')) {
    return def('status_chance', 'MULTIPLIER', 'weapon_status', 3);
  }

  // Fire Rate when Airborne / Crouching
  if (n.includes('Fire Rate when Airborne') || n.includes('Fire Rate when Crouching')) {
    return def('fire_rate', 'MULTIPLIER', 'weapon_fire_rate', 3);
  }

  // Accuracy while Airborne / Recoil while Airborne
  if (n.includes('Accuracy while Airborne') || n.includes('Accuracy when Aiming')) {
    return def('accuracy', 'MULTIPLIER', 'weapon_accuracy', 3);
  }
  if (n.includes('Weapon Recoil while Airborne')) {
    return def('weapon_recoil', 'MULTIPLIER', 'weapon_recoil', 3);
  }

  // Ammo Efficiency while Airborne
  if (n.includes('Ammo Efficiency while Airborne')) {
    return def('airborne_ammo_efficiency', 'FLAT', 'weapon_utility', 3);
  }

  // Overguard Damage
  if (n.includes('Overguard Damage')) {
    return def('overguard_damage', 'MULTIPLIER', 'weapon_conditional_damage', 1);
  }

  // "On Heavy Attack" or "on Heavy Attack" suffix
  if (/On Heavy Attack/i.test(n)) {
    return def('heavy_damage', 'MULTIPLIER', 'weapon_heavy', 1);
  }

  // Per-school-mod stacking — multiple variants
  if (n.includes('bonus for each ')) {
    return def('per_school_mod_bonus', 'MULTIPLIER', 'ability', 1);
  }
  if (n.includes('for each Mod from a unique School') || n.includes('for each Unairu School Mod')) {
    return def('per_school_mod_bonus', 'MULTIPLIER', 'ability', 1);
  }
  if (n.includes('Void Sling radius for each Mod from a unique School')) {
    return def('per_school_mod_bonus', 'MULTIPLIER', 'ability', 1);
  }
  if (n.includes('Movement Speed in Void Mode for each Naramon School Mod')) {
    return def('per_school_mod_bonus', 'MULTIPLIER', 'ability', 1);
  }

  // Syndicate effects ('Truth', 'Purity', etc.) — store as utility
  if (/^'\w+'$/.test(n)) {
    return def('syndicate_effect', 'FLAT', 'warframe_utility', 5);
  }

  // On Kill: variant — stat lines that start with "On Kill:" are
  // Galvanized-style (handled by detectCondition). Extract the base stat name
  // from the second part.
  const onKillMatch = n.match(/^On Kill:\s*(.+)/);
  if (onKillMatch) return detectAutoMap(onKillMatch[1]);
  const onHeadshotMatch = n.match(/^On Headshot Kill:\s*(.+)/);
  if (onHeadshotMatch) return detectAutoMap(onHeadshotMatch[1]);
  const onMeleeKillMatch = n.match(/^On Melee Kill:\s*(.+)/);
  if (onMeleeKillMatch) return detectAutoMap(onMeleeKillMatch[1]);

  // "When Damaged:" prefix
  const whenDamagedMatch = n.match(/^When Damaged:\s*(.+)/);
  if (whenDamagedMatch) return detectAutoMap(whenDamagedMatch[1]);

  // "Max Shields and Shield Recharge" etc - compound stats with "and"
  const compoundMatch = n.match(/^(Max Shields|Shield Recharge) and (Shield Recharge|Shield Recharge Delay)/);
  if (compoundMatch) {
    // These are descriptions for set bonus stats - map to first stat
    return def(compoundMatch[1] === 'Max Shields' ? 'shields' : 'shield_recharge', 'MULTIPLIER', 'warframe_shields', 1);
  }

  // "chance to reduce the Stagger effect from self-imposed Radial Attacks" 
  if (n.includes('Radial Attacks')) {
    return def('self_stagger_reduction', 'MULTIPLIER', 'warframe_block', 1);
  }

  // "Bonus Damage on final shot. Requires Magazine 6 or higher."
  if (n.includes('final shot')) {
    return def('final_shot_damage', 'MULTIPLIER', 'weapon_final_shot', 1);
  }

  // Companion Gather-Link (niche but real companion stat)
  if (n.includes('Companion Gather-Link')) {
    return def('companion_gather_range', 'FLAT', 'companion_base', 3);
  }

  // "chance to double Credit and Resource pickups" etc
  if (n.includes('chance to double')) {
    return def('double_pickup_chance', 'MULTIPLIER', 'warframe_utility', 3);
  }

  // "Chance to explode on Bounce (Disables Punch Through)"
  if (n.includes('Chance to explode on Bounce')) {
    return def('explode_chance', 'MULTIPLIER', 'weapon_utility', 3);
  }

  // "chance to apply X on Critical" — mod-specific, map to generic
  if (n.includes('chance to apply ') && n.includes(' on Critical')) {
    return def('on_crit_effect_chance', 'MULTIPLIER', 'weapon_utility', 3);
  }

  // "X% Damage taken is returned to the attacker"
  if (n.includes('Damage taken is returned')) {
    return def('thorns_damage', 'MULTIPLIER', 'warframe_survival', 1);
  }

  // Operator Void Mode
  if (n.includes('Void Mode')) {
    return def('operator_void_mode', 'MULTIPLIER', 'operator_base', 3);
  }
  if (n.includes('Void Sling')) {
    return def('operator_void_sling', 'MULTIPLIER', 'operator_base', 3);
  }

  // "health stolen each hit per stack of Slash" — niche
  if (n.includes('health stolen')) {
    return def('slash_lifesteal', 'MULTIPLIER', 'weapon_lifesteal', 3);
  }

  // "Full Shield Gate immunity duration"
  if (n.includes('Shield Gate')) {
    return def('shield_gate_duration', 'MULTIPLIER', 'warframe_shields', 1);
  }

  // "Energy Efficiency on Consecutive Void Slings"
  if (n.includes('Energy Efficiency on Consecutive Void')) {
    return def('operator_efficiency', 'MULTIPLIER', 'operator_base', 3);
  }

  // "Chance to apply a Magnetic status effect when inflicting an Impact status effect"
  if (n.includes('Chance to apply a Magnetic')) {
    return def('impact_to_magnetic_chance', 'MULTIPLIER', 'weapon_utility', 3);
  }

  // Reload Speed when Holstered variant
  if (n.includes('Magazine Reloaded')) {
    return def('holster_reload', 'MULTIPLIER', 'weapon_utility', 3);
  }

  return null;
}

// ── Main generator ────────────────────────────────────────────────────
async function main() {
  console.log('[generate-stat-map] Loading @wfcd/items...');
  const Items = require('@wfcd/items');
  const all = new Items();
  console.log('[generate-stat-map] Loaded', all.length, 'items');

  // Anchored regex patterns — each requires the line to START with
  // specific characters to avoid matching prose descriptions.
  //   STANDARD_RE: "+30% Damage" or "+3m Enemy Radar"
  //   NLD_RE:      "5% of Damage converted..." (no leading +/-)
  //   XP_RE:       "x1.05 Damage to Corpus"
  const STANDARD_RE = /^([+-]\d+(?:\.\d+)?)(%|m|s|°|x)?\s+(.+)/;
  const NLD_RE      = /^(\d+(?:\.\d+)?)(%|m|s|°|x)?\s+(.+)/;
  const XP_RE       = /^x(\d+(?:\.\d+)?)\s+(.+)/;
  const COLOR_TAG   = /<[^>]+>/g;

  const rawStatNames = new Map(); // name → { count, example, raw }

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

          let name = null;
          let raw_example = cleaned;

          const m1 = STANDARD_RE.exec(cleaned);
          if (m1) {
            // unit is m1[2] (%, m, s, °, x), but the name portion (m1[3])
            // already has the unit stripped by the regex split
            name = m1[3].trim();
          } else {
            const m2 = NLD_RE.exec(cleaned);
            if (m2) {
              name = m2[3].trim();
            } else {
              const m3 = XP_RE.exec(cleaned);
              if (m3) {
                name = m3[2].trim();
                raw_example = 'x-value: ' + cleaned; // mark as x-prefix
              }
            }
          }

          if (name) {
            if (!rawStatNames.has(name)) {
              rawStatNames.set(name, { count: 0, example: raw_example, raw });
            }
            rawStatNames.get(name).count++;
          }
        }
      }
    }
  }

  console.log('[generate-stat-map] Found', rawStatNames.size, 'unique stat names');

  // Generate mapping
  let mapped = 0;
  let unmapped = [];
  const generated = {};

  for (const [name, info] of rawStatNames) {
    // Check direct alias
    const aliased = STAT_ALIAS[name] || name;

    // Check engine map
    if (ENGINE_MAP[aliased]) {
      generated[name] = ENGINE_MAP[aliased];
      mapped++;
      continue;
    }

    // Try auto-detect
    const auto = detectAutoMap(aliased);
    if (auto) {
      generated[name] = auto;
      mapped++;
      continue;
    }

    // Compound stats: "X and Y" where X and Y each may be known.
    // Split on " and " and try to match either part.
    if (aliased.includes(' and ') && !aliased.includes('\n')) {
      const parts = aliased.split(/\s+and\s+/);
      let compoundMatch = false;
      for (const part of parts) {
        const partAliased = STAT_ALIAS[part] || part;
        if (ENGINE_MAP[partAliased]) {
          generated[name] = ENGINE_MAP[partAliased];
          mapped++;
          compoundMatch = true;
          break;
        }
        const autoPart = detectAutoMap(partAliased);
        if (autoPart) {
          generated[name] = autoPart;
          mapped++;
          compoundMatch = true;
          break;
        }
      }
      if (compoundMatch) continue;
    }

    // Multi-line stats: split by \n and check the stat part
    // This handles e.g. "Ability Strength\nSquadmates gain 10% Ability Strength"
    const lines = aliased.split('\n').map(l => l.trim()).filter(Boolean);
    let foundLine = false;
    for (const l of lines) {
      // Try each anchored regex
      let lineName = null;
      const m1 = STANDARD_RE.exec(l);
      if (m1) {
        lineName = m1[3].trim();
      } else {
        const m2 = NLD_RE.exec(l);
        if (m2) {
          lineName = m2[3].trim();
        } else {
          const m3 = XP_RE.exec(l);
          if (m3) {
            lineName = m3[2].trim();
          }
        }
      }
      if (lineName) {
        const lineAliased = STAT_ALIAS[lineName] || lineName;
        if (ENGINE_MAP[lineAliased]) {
          generated[name] = ENGINE_MAP[lineAliased];
          mapped++;
          foundLine = true;
          break;
        }
        const autoLine = detectAutoMap(lineAliased);
        if (autoLine) {
          generated[name] = autoLine;
          mapped++;
          foundLine = true;
          break;
        }
      }
    }
    if (foundLine) continue;

    unmapped.push({ name, count: info.count, example: info.example });
  }

  console.log('[generate-stat-map] Mapped:', mapped, '/', rawStatNames.size,
    '(' + (mapped / rawStatNames.size * 100).toFixed(1) + '%)');

  // Sort unmapped by frequency
  unmapped.sort((a, b) => b.count - a.count);

  console.log('[generate-stat-map] Unmapped count:', unmapped.length);
  if (unmapped.length > 0) {
    console.log('');
    console.log('=== TOP 30 UNMAPPED ===');
    for (const u of unmapped.slice(0, 30)) {
      console.log(`  ${String(u.count).padStart(6)}  ${u.example.slice(0, 80)}`);
    }
  }

  // ── Generate TypeScript output ─────────────────────────────────────
  let ts = `/**
 * AUTO-GENERATED STAT_MAP — do not edit manually.
 * Generated by: scripts/generate-stat-map.cjs
 * Source: @wfcd/items
 *
 * Maps every unique WFCD mod stat name to an engine-internal
 * bucket (stat, category, stackingGroup, priority).
 * 
 * Last generated: ${new Date().toISOString()}
 * Coverage: ${mapped}/${rawStatNames.size} (${(mapped / rawStatNames.size * 100).toFixed(1)}%)
 */
import type { StatMapping } from './wfcd-resolver';

export const GENERATED_STAT_MAP: Record<string, StatMapping> = {\n`;

  // Write generated entries sorted by name
  const sortedNames = [...Object.keys(generated)].sort();
  for (const name of sortedNames) {
    const entry = generated[name];
    // Escape single quotes and special chars in name
    const escapedName = name.replace(/'/g, "\\'");
    ts += `  '${escapedName}': { stat: '${entry.stat}', category: '${entry.category}', stackingGroup: '${entry.stackingGroup}', priority: ${entry.priority}, scaleByHundred: ${entry.scaleByHundred} },\n`;
  }

  ts += `};\n\n`;

  // Add STAT_ALIAS export
  ts += `export const GENERATED_STAT_ALIAS: Record<string, string> = {\n`;
  for (const [alias, target] of Object.entries(STAT_ALIAS).sort()) {
    const escapedAlias = alias.replace(/'/g, "\\'");
    const escapedTarget = target.replace(/'/g, "\\'");
    ts += `  '${escapedAlias}': '${escapedTarget}',\n`;
  }
  ts += `};\n`;

  // Write file
  const outPath = path.resolve(__dirname, '../src/data/generated-stat-map.ts');
  fs.writeFileSync(outPath, ts, 'utf-8');
  console.log('[generate-stat-map] Written to', outPath);
  console.log('[generate-stat-map] Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
