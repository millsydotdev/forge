import type { ConditionalTriggerState } from '../build-core';
import type { Modifier } from '../modifier';

export function applyConditions(
  mods: Modifier[],
  triggers: ConditionalTriggerState | undefined,
): Modifier[] {
  if (!triggers) {
    return mods.filter(m => !m.condition);
  }

  const comboMult = 1 + Math.max(0, triggers.comboTier) * 0.5;

  const result: Modifier[] = [];
  for (const mod of mods) {
    if (!mod.condition) {
      result.push(mod);
      continue;
    }

    const { type, maxStacks } = mod.condition;
    let value = mod.value;
    let include = false;

    switch (type) {
      case 'galvanizedStacks':
        if (triggers.galvanizedStacks > 0) {
          const stacks = maxStacks
            ? Math.min(triggers.galvanizedStacks, maxStacks)
            : triggers.galvanizedStacks;
          value = mod.value * stacks;
          include = true;
        }
        break;
      case 'onHeadshot':
        if (triggers.onHeadshot) {
          if (maxStacks) {
            value = mod.value * Math.min(triggers.galvanizedStacks, maxStacks);
          }
          include = true;
        }
        break;
      case 'onHeadshotKill':
        if (triggers.onHeadshot) {
          const stacks = maxStacks
            ? Math.min(triggers.galvanizedStacks, maxStacks)
            : triggers.galvanizedStacks;
          value = mod.value * stacks;
          include = true;
        }
        break;
      case 'onKill':
        include = triggers.onKill;
        break;
      case 'onMeleeKill':
        include = triggers.onKill;
        if (include && maxStacks) {
          value = mod.value * Math.min(triggers.galvanizedStacks, maxStacks);
        }
        break;
      case 'onSlashProc':
        include = triggers.onSlashProc;
        break;
      case 'onAimGlide':
        include = triggers.onAimGlide;
        break;
      case 'onWallLatch':
        include = triggers.onWallLatch;
        break;
      case 'onSlide':
        include = triggers.onSlide;
        break;
      case 'onSpawn':
        include = triggers.onSpawn;
        break;
      case 'perComboMultiplier':
        if (comboMult > 1) {
          value = mod.value * comboMult;
          include = true;
        } else {
          include = false;
        }
        break;
      case 'onCriticalHit':
        include = triggers.onCriticalHit;
        break;
      case 'onStatusEffect':
        include = triggers.onStatusEffect;
        break;
      case 'airborne':
        include = triggers.airborne;
        break;
      case 'whenCrouching':
        include = triggers.crouching;
        break;
      case 'whenBlocking':
        include = triggers.blocking;
        break;
      case 'onLiftedEnemy':
        include = triggers.onLiftedEnemy;
        break;
      case 'whileInvisible':
        include = triggers.invisible;
        break;
      case 'perSchoolMod':
        if (triggers.perSchoolMod > 0) {
          value = mod.value * triggers.perSchoolMod;
          include = true;
        }
        break;
      case 'weakPoint':
        include = triggers.onWeakPoint;
        break;
      case 'finalShot':
        include = triggers.onFinalShot;
        break;
      case 'markedZone':
        include = triggers.markedZone;
        break;
      case 'onHealthPickup':
        include = triggers.onHealthPickup;
        break;
      case 'onEnergyPickup':
        include = triggers.onEnergyPickup;
        break;
      case 'onAmmoPickup':
        include = triggers.onAmmoPickup;
        break;
      case 'onMercy':
        include = triggers.onMercy;
        break;
      case 'onHacking':
        include = triggers.onHacking;
        break;
    }

    if (include) {
      result.push({ ...mod, value });
    }
  }

  return result;
}
