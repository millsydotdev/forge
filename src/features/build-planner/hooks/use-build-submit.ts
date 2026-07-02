import { useEffect } from 'react';
import type { CalculatedStats } from '../../../engine/stat-processor';
import type { EnemyTargetState } from '../../../engine/build-core';
import { toBuildCore } from '../services/build-core-mapper';
import type { BuffsState } from '../components/buffs-panel';
import type { ConditionalTriggers, WarframeState, WeaponState, CompanionState, HelminthState } from '../model';
import { buildBuffMods } from '../util/buff-assembly';
import { logger } from '../../../utils/logger';

export function useBuildSubmit(
  wf: WarframeState,
  weaponStates: Record<string, WeaponState>,
  comp: CompanionState,
  helminth: HelminthState,
  targetFaction: string,
  isAiming: boolean,
  activeStatuses: number,
  buffs: BuffsState,
  conditionalTriggers: ConditionalTriggers,
  enemyEnabled: boolean,
  enemyState: EnemyTargetState,
  operatorId: string | null,
  focusNodes: string[],
  arcane: string | null,
  setResult: (result: CalculatedStats | null) => void,
  setCalculating?: (v: boolean) => void,
  onCalcError?: (message: string) => void,
) {
  useEffect(() => {
    if (!wf.id && !weaponStates.primary.id && !weaponStates.secondary.id && !weaponStates.melee.id && !weaponStates['arch-gun']?.id && !weaponStates['arch-melee']?.id) {
      setTimeout(() => setResult(null), 0); return;
    }
    const build = toBuildCore(wf, weaponStates, comp, helminth, targetFaction, isAiming, activeStatuses, operatorId, focusNodes, arcane);
    const ewWeaponState = weaponStates['exalted_weapon'];
    if (wf.id && ewWeaponState && ewWeaponState.mods.length > 0) {
      if (build.warframe.exaltedWeapon) {
        build.warframe.exaltedWeapon.normalMods = ewWeaponState.mods.map(m => ({
          id: m.uniqueName,
          rank: m.rank,
          slotPolarity: m.polarity,
          polarityMatch: true,
        }));
      }
    }

    const buffMods = buildBuffMods(buffs);
    build.buffs = buffMods;

    let effectiveStatuses = activeStatuses;
    if (conditionalTriggers.galvanizedStacks > 0) {
      effectiveStatuses = Math.max(effectiveStatuses, conditionalTriggers.galvanizedStacks);
    }
    build.activeStatuses = effectiveStatuses;
    build.conditionalTriggers = { ...conditionalTriggers };
    if (enemyEnabled) {
      build.enemy = enemyState;
    } else {
      build.enemy = undefined;
    }
    logger.info('[BuildPlanner] calculating build with conditions...');
    setCalculating?.(true);
    window.forge.calculateBuild(build).then(r => {
      if (!r.ok) {
        logger.error('[BuildPlanner] calculateBuild failed:', r.error);
        onCalcError?.(r.error);
        setResult(null);
        return;
      }
      logger.info('[BuildPlanner] build result received');
      setResult(r.data);
    }).catch(e => {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error('[BuildPlanner] calculateBuild failed:', e);
      onCalcError?.(msg);
    })
    .finally(() => setCalculating?.(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wf, weaponStates, comp, helminth, targetFaction, isAiming, activeStatuses, buffs, conditionalTriggers, enemyEnabled, enemyState, operatorId, focusNodes, arcane, setResult]);
}
