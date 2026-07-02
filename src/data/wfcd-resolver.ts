/**
 * ItemResolver implementation backed by WFCD static JSON.
 *
 * Each equipped item is looked up by its uniqueName in the
 * indexed data set, then its levelStats strings are parsed
 * to produce one or more Modifier objects.
 */

import type { Modifier } from '../engine/modifier';
import type { ItemResolver } from '../engine/stat-processor';
import type {
  EquippedMod,
  EquippedArcane,
  EquippedShard,
} from '../engine/build-core';
import type { IWfcdDataService } from './wfcd-service-interface';
import { gameData } from './game-data';
import { parseStatLine, splitStatBlob } from './stat-parser';
import { resolveStat, DAMAGE_TYPE_BY_INDEX } from './stat-mapping';
import { detectCondition } from './condition-detector';
export type { StatMapping } from './stat-mapping';

function getRankValue(
  levelStats: { stats: string[] }[],
  rank: number,
): { name: string; value: number; isPercent: boolean }[] {
  const idx = Math.min(rank, levelStats.length - 1);
  if (idx < 0) return [];
  const results: { name: string; value: number; isPercent: boolean }[] = [];
  for (const item of levelStats[idx].stats) {
    for (const line of splitStatBlob(item)) {
      const parsed = parseStatLine(line);
      if (parsed) results.push(parsed);
    }
  }
  return results;
}

export class WfcdResolver implements ItemResolver {
  constructor(private data: IWfcdDataService) {}

  resolveMod(mod: EquippedMod): Modifier[] {
    if (mod.rivenData) {
      const results: Modifier[] = [];
      for (const pos of mod.rivenData.positives) {
        const mapping = resolveStat(pos.stat);
        if (!mapping) continue;
        const isPercentStat = mapping.scaleByHundred;
        const scaledValue = isPercentStat ? pos.value / 100 : pos.value;
        results.push({
          stat: mapping.stat,
          category: mapping.category,
          value: scaledValue,
          stackingGroup: mapping.stackingGroup,
          source: 'Custom Riven',
          priority: mapping.priority,
        });
      }
      if (mod.rivenData.negative) {
        const neg = mod.rivenData.negative;
        const mapping = resolveStat(neg.stat);
        if (mapping) {
          const isPercentStat = mapping.scaleByHundred;
          const scaledValue = isPercentStat ? neg.value / 100 : neg.value;
          results.push({
            stat: mapping.stat,
            category: mapping.category,
            value: scaledValue,
            stackingGroup: mapping.stackingGroup,
            source: 'Custom Riven (negative)',
            priority: mapping.priority,
          });
        }
      }
      return results;
    }

    const entry = this.data.getMod(mod.id);
    if (!entry?.levelStats) return [];

    const results: Modifier[] = [];
    const rankValues = getRankValue(entry.levelStats, mod.rank);

    for (const { name, value, isPercent } of rankValues) {
      const mapping = resolveStat(name);
      if (!mapping) continue;
      const scaledValue = (isPercent && mapping.scaleByHundred) ? value / 100 : value;
      const condition = detectCondition(name);

      results.push({
        stat: mapping.stat,
        category: mapping.category,
        value: scaledValue,
        stackingGroup: mapping.stackingGroup,
        source: entry.name,
        priority: mapping.priority,
        condition: condition ?? undefined,
      });
    }

    return results;
  }

  resolveArcane(arcane: EquippedArcane): Modifier[] {
    const entry = this.data.getArcane(arcane.id) ??
      this.data.getMod(arcane.id);
    if (!entry) return [];

    const ls = (entry as unknown as { levelStats?: { stats: string[] }[] }).levelStats;
    if (!ls) return [];

    const results: Modifier[] = [];
    const rankValues = getRankValue(ls, arcane.rank);

    for (const { name, value, isPercent } of rankValues) {
      const mapping = resolveStat(name);
      if (!mapping) continue;
      const scaledValue = (isPercent && mapping.scaleByHundred) ? value / 100 : value;
      const condition = detectCondition(name);

      results.push({
        stat: mapping.stat,
        category: mapping.category,
        value: scaledValue,
        stackingGroup: mapping.stackingGroup,
        source: entry.name,
        priority: mapping.priority,
        condition: condition ?? undefined,
      });
    }

    return results;
  }

  resolveShard(shard: EquippedShard): Modifier[] {
    const def = gameData.getShardDef(shard.color);
    if (!def) return [];

    const tauMult = shard.isTau ? 1.5 : 1;
    return def.stats.map(s => ({
      stat: s.stat,
      category: s.category,
      value: s.value * tauMult,
      stackingGroup: s.group,
      source: `${def.label} Archon Shard (${shard.color})${shard.isTau ? ' Tauforged' : ''}`,
      priority: 0,
    }));
  }

  resolveWarframePassive(id: string): Modifier[] {
    const wf = this.data.getWarframe(id);
    if (!wf) return [];

    const results: Modifier[] = [];
    results.push({ stat: 'base_health', category: 'FLAT', value: wf.health, stackingGroup: 'warframe_base', source: `${wf.name} base health`, priority: 0 });
    results.push({ stat: 'base_shield', category: 'FLAT', value: wf.shield, stackingGroup: 'warframe_base', source: `${wf.name} base shield`, priority: 0 });
    results.push({ stat: 'base_armor', category: 'FLAT', value: wf.armor, stackingGroup: 'warframe_base', source: `${wf.name} base armor`, priority: 0 });
    results.push({ stat: 'sprint_speed', category: 'FLAT', value: wf.sprintSpeed, stackingGroup: 'warframe_base', source: `${wf.name} sprint speed`, priority: 0 });
    results.push({ stat: 'base_energy', category: 'FLAT', value: wf.power ?? 100, stackingGroup: 'warframe_base', source: `${wf.name} base energy`, priority: 0 });
    return results;
  }

  resolveCompanionPassive(id: string): Modifier[] {
    const comp = this.data.getCompanion(id);
    if (!comp) return [];

    const results: Modifier[] = [];
    results.push({ stat: 'companion_base_health', category: 'FLAT', value: comp.health, stackingGroup: 'companion_base', source: `${comp.name} base health`, priority: 0 });
    results.push({ stat: 'companion_base_shield', category: 'FLAT', value: comp.shield, stackingGroup: 'companion_base', source: `${comp.name} base shield`, priority: 0 });
    results.push({ stat: 'companion_base_armor', category: 'FLAT', value: comp.armor, stackingGroup: 'companion_base', source: `${comp.name} base armor`, priority: 0 });
    return results;
  }

  resolveOperator(id: string): Modifier[] {
    const op = this.data.getOperator(id);
    if (!op) return [];

    return [
      { stat: 'operator_base_health', category: 'FLAT', value: op.health ?? 100, stackingGroup: 'operator_base', source: `${op.name} base health`, priority: 0 },
      { stat: 'operator_base_shield', category: 'FLAT', value: op.shield ?? 100, stackingGroup: 'operator_base', source: `${op.name} base shield`, priority: 0 },
      { stat: 'operator_base_armor', category: 'FLAT', value: op.armor ?? 0, stackingGroup: 'operator_base', source: `${op.name} base armor`, priority: 0 },
      { stat: 'operator_base_energy', category: 'FLAT', value: op.power ?? 100, stackingGroup: 'operator_base', source: `${op.name} base energy`, priority: 0 },
      { stat: 'operator_sprint_speed', category: 'FLAT', value: op.sprintSpeed ?? 1, stackingGroup: 'operator_base', source: `${op.name} sprint speed`, priority: 0 },
    ];
  }

  getModSet(mod: EquippedMod): { modSetPath: string; setDef: { numUpgradesInSet: number; stats: string[]; name: string } | null } | null {
    const entry = this.data.getMod(mod.id);
    if (!entry?.modSet) return null;
    const setDef = this.data.getSetDef(entry.modSet);
    return {
      modSetPath: entry.modSet,
      setDef: setDef ? {
        numUpgradesInSet: setDef.numUpgradesInSet,
        stats: setDef.stats,
        name: setDef.name,
      } : null,
    };
  }

  resolveWeaponPassive(id: string): Modifier[] {
    const wp = this.data.getWeapon(id);
    if (!wp) return [];

    const results: Modifier[] = [];
    const baseDmg = wp.totalDamage ?? wp.damagePerShot?.[0] ?? 0;

    results.push({ stat: 'base_damage', category: 'FLAT', value: baseDmg, stackingGroup: 'weapon_base_damage', source: `${wp.name} base damage`, priority: 0 });
    results.push({ stat: 'multishot', category: 'FLAT', value: wp.multishot ?? 1, stackingGroup: 'weapon_multishot', source: `${wp.name} base multishot`, priority: 0 });
    results.push({ stat: 'crit_chance', category: 'FLAT', value: wp.criticalChance ?? 0, stackingGroup: 'weapon_crit', source: `${wp.name} base crit chance`, priority: 0 });
    results.push({ stat: 'crit_damage', category: 'FLAT', value: wp.criticalMultiplier ?? 2, stackingGroup: 'weapon_crit_damage', source: `${wp.name} base crit multiplier`, priority: 0 });
    results.push({ stat: 'fire_rate', category: 'FLAT', value: wp.fireRate ?? 1, stackingGroup: 'weapon_fire_rate', source: `${wp.name} fire rate`, priority: 0 });
    results.push({ stat: 'status_chance', category: 'FLAT', value: wp.procChance ?? 0, stackingGroup: 'weapon_status', source: `${wp.name} status chance`, priority: 0 });
    results.push({ stat: 'reload_speed', category: 'FLAT', value: wp.reloadTime ?? 2, stackingGroup: 'weapon_reload', source: `${wp.name} reload speed`, priority: 0 });

    const magazine = ((wp as unknown) as Record<string, number>).magazineSize ?? ((wp as unknown) as Record<string, number>).magazine ?? 0;
    if (magazine > 0) {
      results.push({ stat: 'magazine', category: 'FLAT', value: magazine, stackingGroup: 'weapon_magazine', source: `${wp.name} magazine`, priority: 0 });
    }

    // ── Melee-specific stats from WFCD ──────────────────
    const wpAny = wp as unknown as Record<string, unknown>;
    if (typeof wpAny.followThrough === 'number') {
      results.push({ stat: 'melee_follow_through', category: 'MULTIPLIER', value: wpAny.followThrough as number, stackingGroup: 'weapon_melee', source: `${wp.name} follow-through`, priority: 0 });
    }
    if (typeof wpAny.range === 'number') {
      results.push({ stat: 'melee_range', category: 'FLAT', value: wpAny.range as number, stackingGroup: 'weapon_range', source: `${wp.name} range`, priority: 0 });
    }
    if (typeof wpAny.windUp === 'number') {
      results.push({ stat: 'heavy_wind_up', category: 'FLAT', value: wpAny.windUp as number, stackingGroup: 'weapon_heavy', source: `${wp.name} wind-up`, priority: 0 });
    }
    if (typeof wpAny.comboDuration === 'number') {
      results.push({ stat: 'combo_duration', category: 'FLAT', value: wpAny.comboDuration as number, stackingGroup: 'weapon_combo', source: `${wp.name} combo duration`, priority: 0 });
    }
    if (typeof wpAny.blockingAngle === 'number') {
      const angle = wpAny.blockingAngle as number;
      results.push({ stat: 'parry_angle', category: 'FLAT', value: angle === 0 ? 180 : angle, stackingGroup: 'warframe_block', source: `${wp.name} blocking angle`, priority: 0 });
    }

    // ── Per-attack stats (falloff, alt-mode crit/status) ──
    if (wp.attacks && Array.isArray(wp.attacks) && wp.attacks.length > 0) {
      // Extract falloff data from first relevant attack
      const normalAttack = wp.attacks.find((a: any) =>
        a.name === 'Normal Attack' || a.name === 'Primary Fire',
      ) || wp.attacks[0];

      if (normalAttack?.falloff) {
        results.push({ stat: 'weapon_falloff_start', category: 'FLAT', value: normalAttack.falloff.start ?? 0, stackingGroup: 'weapon_falloff', source: `${wp.name} falloff start`, priority: 0 });
        results.push({ stat: 'weapon_falloff_end', category: 'FLAT', value: normalAttack.falloff.end ?? 0, stackingGroup: 'weapon_falloff', source: `${wp.name} falloff end`, priority: 0 });
        results.push({ stat: 'weapon_falloff_reduction', category: 'MULTIPLIER', value: 1 - (normalAttack.falloff.reduction ?? 0), stackingGroup: 'weapon_falloff', source: `${wp.name} falloff reduction`, priority: 0 });
      }

      // Incarnon or alt-attack: store alternate crit/status for mode switching
      const altAttack = wp.attacks.find((a: any) =>
        a.name.includes('Incarnon') || a.name.includes('Alt'),
      );
      if (altAttack) {
        if (altAttack.crit_chance != null) {
          results.push({ stat: 'alt_crit_chance', category: 'FLAT', value: altAttack.crit_chance / 100, stackingGroup: 'weapon_crit_alt', source: `${wp.name} alt crit chance`, priority: 0 });
        }
        if (altAttack.crit_mult != null) {
          results.push({ stat: 'alt_crit_damage', category: 'FLAT', value: altAttack.crit_mult, stackingGroup: 'weapon_crit_damage_alt', source: `${wp.name} alt crit multiplier`, priority: 0 });
        }
        if (altAttack.status_chance != null) {
          results.push({ stat: 'alt_status_chance', category: 'FLAT', value: altAttack.status_chance / 100, stackingGroup: 'weapon_status_alt', source: `${wp.name} alt status chance`, priority: 0 });
        }
        if (altAttack.speed != null) {
          results.push({ stat: 'alt_fire_rate', category: 'FLAT', value: altAttack.speed, stackingGroup: 'weapon_fire_rate_alt', source: `${wp.name} alt fire rate`, priority: 0 });
        }
      }
    }

    if (wp.damageTypes) {
      for (const [type, val] of Object.entries(wp.damageTypes)) {
        if (!val) continue;
        const normalized = type.toLowerCase();
        results.push({ stat: `damage_${normalized}`, category: 'FLAT', value: val as number, stackingGroup: 'weapon_damage_types', source: `${wp.name} ${type}`, priority: 0 });
      }
    } else if (wp.damagePerShot) {
      (wp.damagePerShot as number[]).forEach((val, index) => {
        if (!val) return;
        const normalized = DAMAGE_TYPE_BY_INDEX[index] ?? `type_${index}`;
        results.push({ stat: `damage_${normalized}`, category: 'FLAT', value: val, stackingGroup: 'weapon_damage_types', source: `${wp.name} ${normalized}`, priority: 0 });
      });
    }

    return results;
  }

  resolveSetBonusStat(rawStat: string, source: string): Modifier[] {
    const results: Modifier[] = [];
    for (const line of splitStatBlob(rawStat)) {
      const parsed = parseStatLine(line);
      if (!parsed) continue;
      const mapping = resolveStat(parsed.name);
      if (!mapping) continue;
      const scaledValue = (parsed.isPercent && mapping.scaleByHundred)
        ? parsed.value / 100
        : parsed.value;
      results.push({
        stat: mapping.stat,
        category: mapping.category,
        value: scaledValue,
        stackingGroup: mapping.stackingGroup,
        source,
        priority: mapping.priority,
      });
    }
    return results;
  }
}
