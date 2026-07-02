import type { StatMapping } from './stat-mapping';

export function classifyUnknownStat(parsedName: string): StatMapping | null {
  const name = parsedName.trim();
  if (!name) return null;

  const lowerName = name.toLowerCase();

  // ===== WARFRAME STATS =====
  if (/(health|shield|armor|energy)\s*(max|capacity)?/i.test(lowerName)) {
    if (/health/i.test(lowerName)) {
      return { stat: 'health', category: 'MULTIPLIER', stackingGroup: 'warframe_health', priority: 1, scaleByHundred: true };
    }
    if (/shield/i.test(lowerName)) {
      if (/max|capacity/i.test(lowerName)) return { stat: 'shields', category: 'MULTIPLIER', stackingGroup: 'warframe_shields', priority: 1, scaleByHundred: true };
      if (/regen|rate/i.test(lowerName)) return { stat: 'shields', category: 'MULTIPLIER', stackingGroup: 'warframe_shields', priority: 1, scaleByHundred: true };
      return { stat: 'shields', category: 'MULTIPLIER', stackingGroup: 'warframe_shields', priority: 1, scaleByHundred: true };
    }
    if (/armor/i.test(lowerName)) return { stat: 'armor', category: 'MULTIPLIER', stackingGroup: 'warframe_armor', priority: 1, scaleByHundred: true };
    if (/energy/i.test(lowerName)) {
      if (/max|capacity/i.test(lowerName)) return { stat: 'energy', category: 'MULTIPLIER', stackingGroup: 'warframe_energy', priority: 1, scaleByHundred: true };
      if (/regen|rate/i.test(lowerName)) return { stat: 'energy', category: 'MULTIPLIER', stackingGroup: 'warframe_energy', priority: 1, scaleByHundred: true };
      return { stat: 'energy', category: 'MULTIPLIER', stackingGroup: 'warframe_energy', priority: 1, scaleByHundred: true };
    }
  }

  // ===== COMBAT STATS =====
  if (/critical\s*chance/i.test(lowerName)) {
    if (/slide/i.test(lowerName)) return { stat: 'slide_crit_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_crit', priority: 4, scaleByHundred: true };
    if (/(x2|for\s*heavy\s*attacks)/i.test(lowerName)) return { stat: 'heavy_crit_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_crit', priority: 4, scaleByHundred: true };
    if (/(when\s*aiming|aiming)/i.test(lowerName)) return { stat: 'aiming_crit_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_crit', priority: 4, scaleByHundred: true };
    if (/combo/i.test(lowerName)) return { stat: 'crit_chance_combo', category: 'MULTIPLIER', stackingGroup: 'weapon_crit', priority: 4, scaleByHundred: true };
    if (/weak\s*point/i.test(lowerName)) return { stat: 'weakpoint_crit_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_crit', priority: 4, scaleByHundred: true };
    return { stat: 'crit_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_crit', priority: 4, scaleByHundred: true };
  }

  if (/critical\s*damage/i.test(lowerName)) {
    if (/(when\s*aiming|aiming)/i.test(lowerName)) return { stat: 'aiming_crit_dmg', category: 'MULTIPLIER', stackingGroup: 'weapon_crit_damage', priority: 4, scaleByHundred: true };
    return { stat: 'crit_damage', category: 'MULTIPLIER', stackingGroup: 'weapon_crit_damage', priority: 4, scaleByHundred: true };
  }

  if (/status\s*chance/i.test(lowerName)) {
    if (/(when\s*aiming|aiming)/i.test(lowerName)) return { stat: 'aiming_status_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
    if (/lifted|on\s*lifted/i.test(lowerName)) return { stat: 'status_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
    if (/combo/i.test(lowerName)) return { stat: 'status_chance_combo', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
    if (/final/i.test(lowerName)) return { stat: 'status_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
    return { stat: 'status_chance', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
  }

  if (/status\s*duration/i.test(lowerName)) return { stat: 'status_duration', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
  if (/status\s*damage/i.test(lowerName)) return { stat: 'status_damage', category: 'MULTIPLIER', stackingGroup: 'weapon_status', priority: 3, scaleByHundred: true };
  if (/attack\s*speed/i.test(lowerName)) return { stat: 'attack_speed', category: 'MULTIPLIER', stackingGroup: 'weapon_attack_speed', priority: 3, scaleByHundred: true };

  if (/fire\s*rate/i.test(lowerName)) {
    if (/when\s*aiming/i.test(lowerName)) return { stat: 'aiming_fire_rate', category: 'MULTIPLIER', stackingGroup: 'weapon_fire_rate', priority: 3, scaleByHundred: true };
    if (/when\s*airborne/i.test(lowerName)) return { stat: 'fire_rate', category: 'MULTIPLIER', stackingGroup: 'weapon_fire_rate', priority: 3, scaleByHundred: true };
    if (/when\s*crouching/i.test(lowerName)) return { stat: 'fire_rate', category: 'MULTIPLIER', stackingGroup: 'weapon_fire_rate', priority: 3, scaleByHundred: true };
    if ( /\(x2\s*for\s*bows\)/i.test(lowerName) ) return { stat: 'fire_rate', category: 'MULTIPLIER', stackingGroup: 'weapon_fire_rate', priority: 3, scaleByHundred: true };
    return { stat: 'fire_rate', category: 'MULTIPLIER', stackingGroup: 'weapon_fire_rate', priority: 3, scaleByHundred: true };
  }

  if (/reload\s*speed/i.test(lowerName)) return { stat: 'reload_speed_mult', category: 'MULTIPLIER', stackingGroup: 'weapon_reload', priority: 3, scaleByHundred: true };
  if (/multishot/i.test(lowerName)) {
    if (/amp/i.test(lowerName)) return { stat: 'amp_multishot', category: 'MULTIPLIER', stackingGroup: 'amp_base', priority: 3, scaleByHundred: true };
    return { stat: 'multishot', category: 'MULTIPLIER', stackingGroup: 'weapon_multishot', priority: 3, scaleByHundred: true };
  }
  if (/punch\s*through/i.test(lowerName)) return { stat: 'punch_through', category: 'FLAT', stackingGroup: 'weapon_utility', priority: 3, scaleByHundred: false };

  if ( /range/i.test(lowerName) ) {
    if (/melee/i.test(lowerName)) return { stat: 'melee_range', category: 'MULTIPLIER', stackingGroup: 'weapon_range', priority: 3, scaleByHundred: true };
    return { stat: 'range', category: 'MULTIPLIER', stackingGroup: 'weapon_range', priority: 3, scaleByHundred: true };
  }

  if ( /zoom/i.test(lowerName) ) return { stat: 'zoom', category: 'MULTIPLIER', stackingGroup: 'weapon_zoom', priority: 3, scaleByHundred: true };
  if ( /recoil/i.test(lowerName) ) return { stat: 'weapon_recoil', category: 'MULTIPLIER', stackingGroup: 'weapon_weapon_recoil', priority: 3, scaleByHundred: true };

  if ( /accuracy/i.test(lowerName) ) {
    if (/(when\s*aiming|aiming)/i.test(lowerName)) return { stat: 'aiming_accuracy', category: 'MULTIPLIER', stackingGroup: 'weapon_accuracy', priority: 3, scaleByHundred: true };
    if (/when\s*airborne/i.test(lowerName)) return { stat: 'accuracy', category: 'MULTIPLIER', stackingGroup: 'weapon_accuracy', priority: 3, scaleByHundred: true };
    return { stat: 'accuracy', category: 'MULTIPLIER', stackingGroup: 'weapon_accuracy', priority: 3, scaleByHundred: true };
  }

  if ( /beam\s*range/i.test(lowerName) ) return { stat: 'beam_range', category: 'FLAT', stackingGroup: 'weapon_range', priority: 3, scaleByHundred: true };
  if ( /blast\s*radius/i.test(lowerName) ) return { stat: 'blast_radius', category: 'MULTIPLIER', stackingGroup: 'weapon_utility', priority: 3, scaleByHundred: true };
  if ( /friction/i.test(lowerName) ) return { stat: 'friction', category: 'MULTIPLIER', stackingGroup: 'warframe_movement', priority: 1, scaleByHundred: true };

  return null;
}
