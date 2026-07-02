import type { ModifierCondition } from '../engine/modifier';

export function detectCondition(rawName: string): ModifierCondition | null {
  const hasDuration = /for \d+s/i.test(rawName);
  const stackMatch = /Stacks up to (\d+)x/i.exec(rawName);
  const maxStacks = stackMatch ? parseInt(stackMatch[1], 10) : undefined;

  if (hasDuration && /when Aiming/i.test(rawName)) {
    return { type: 'onHeadshot', maxStacks };
  }

  if (hasDuration) {
    if (/on Melee Kill/i.test(rawName)) return { type: 'onMeleeKill', maxStacks };
    return { type: 'galvanizedStacks', maxStacks };
  }

  if (/on Melee Kill/i.test(rawName)) return { type: 'onMeleeKill' };
  if (/on Headshot Kill/i.test(rawName)) return { type: 'onHeadshotKill', maxStacks };
  if (/on Kill/i.test(rawName)) return { type: 'onKill' };
  if (/on Headshot/i.test(rawName)) return { type: 'onHeadshot' };
  if (/on Slash Proc/i.test(rawName)) return { type: 'onSlashProc' };
  if (/on Critical Hit/i.test(rawName)) return { type: 'onCriticalHit' };
  if (/on Status Effect/i.test(rawName)) return { type: 'onStatusEffect' };
  if (/while.*Aim Glide/i.test(rawName)) return { type: 'onAimGlide' };
  if (/while.*Wall Latch/i.test(rawName)) return { type: 'onWallLatch' };
  if (/while.*Sliding/i.test(rawName)) return { type: 'onSlide' };
  if (/on Spawn/i.test(rawName)) return { type: 'onSpawn' };
  if (/while Airborne|when Airborne/i.test(rawName)) return { type: 'airborne' };
  if (/when Crouching/i.test(rawName)) return { type: 'whenCrouching' };
  if (/while Blocking/i.test(rawName)) return { type: 'whenBlocking' };
  if (/on Lifted enemies/i.test(rawName)) return { type: 'onLiftedEnemy' };
  if (/while Invisible/i.test(rawName)) return { type: 'whileInvisible' };
  if (/per Combo Multiplier|stacks with Combo Multiplier/i.test(rawName)) return { type: 'perComboMultiplier' };
  if (/for each \w+ School Mod|for each Mod from a unique School/i.test(rawName)) return { type: 'perSchoolMod' };
  if (/Weak Point/i.test(rawName)) return { type: 'weakPoint' };
  if (/final shot|first shot/i.test(rawName)) return { type: 'finalShot' };
  if (/Marked Zone/i.test(rawName)) return { type: 'markedZone' };
  if (/on Health/i.test(rawName)) return { type: 'onHealthPickup' };
  if (/on Energy/i.test(rawName)) return { type: 'onEnergyPickup' };
  if (/on Ammo/i.test(rawName)) return { type: 'onAmmoPickup' };
  if (/after a Mercy/i.test(rawName)) return { type: 'onMercy' };
  if (/after Hacking/i.test(rawName)) return { type: 'onHacking' };

  return null;
}
