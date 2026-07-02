import type { Modifier } from '../../../engine/modifier';
import type { BuffsState } from '../components/buffs-panel';
import { gameData } from '../../../data/game-data';

export function buildBuffMods(buffs: BuffsState): Modifier[] {
  const buffMods: Modifier[] = [];

  if (buffs.focusSchool !== 'none') {
    const school = gameData.focusSchools.find(s => s.value === buffs.focusSchool);
    if (school) {
      for (const passive of school.passives) {
        const isFlat = passive.value >= 50 && /^armor|health$/i.test(passive.stat);
        buffMods.push({
          stat: passive.stat,
          category: isFlat ? 'FLAT' : 'MULTIPLIER',
          value: passive.value,
          stackingGroup: passive.stat === 'strength' ? 'ability'
                     : passive.stat === 'efficiency' ? 'ability'
                     : passive.stat === 'duration' ? 'ability'
                     : passive.stat === 'range' ? 'ability'
                     : passive.stat === 'armor' ? 'warframe_armor'
                     : passive.stat === 'health' ? 'warframe_health'
                     : 'weapon_base_damage',
          source: `${school.label} Focus`,
          priority: 1,
        });
      }
    }
  }

  const enabledBuffs: { key: keyof BuffsState; name: string }[] = [
    { key: 'roarBuff', name: 'Roar' },
    { key: 'eclipseBuff', name: 'Eclipse' },
    { key: 'warcryBuff', name: 'Warcry' },
    { key: 'xatasWhisper', name: "Xata's Whisper" },
    { key: 'vexArmor', name: 'Vex Armor' },
  ];
  for (const { key, name } of enabledBuffs) {
    if (!buffs[key]) continue;
    const def = gameData.squadBuffs.find(b => b.name === name);
    if (!def) continue;
    for (const m of def.modifiers) {
      const stackingGroup =
        m.stat === 'faction_damage_all' ? 'faction_damage'
        : m.stat === 'base_damage' ? 'weapon_base_damage'
        : m.stat === 'armor' ? 'warframe_armor'
        : m.stat === 'attack_speed' ? 'weapon_attack_speed'
        : m.stat === 'elemental_void' ? 'weapon_elemental'
        : 'ability';
      buffMods.push({
        stat: m.stat,
        category: m.type,
        value: m.value,
        stackingGroup,
        source: def.name,
        priority: 1,
      });
    }
  }

  return buffMods;
}
