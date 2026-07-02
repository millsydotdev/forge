/**
 * Runtime Effect Engine
 *
 * Processes Effect definitions through the pipeline:
 *   Source → Effect → Condition Check → Resolution → Modifier
 *
 * The Effect Engine sits between game data (static Effect definitions)
 * and the Modifier system (runtime atomic stat changes).
 * It handles dynamic state (stacks, duration, ICD, refresh) that
 * the simpler Modifier pipeline cannot manage alone.
 */

import type { Modifier } from '../modifier';
import type {
  Effect,
  EffectInstance,
  EffectTrigger,
  GameState,
  ArcaneState,
  StackingRule,
} from './effect-types';

export interface EffectEngineState {
  instances: Map<string, EffectInstance[]>;
  activeArcanes: Map<string, ArcaneState>;
  lastTickTime: number;
}

export function createEffectEngineState(): EffectEngineState {
  return {
    instances: new Map(),
    activeArcanes: new Map(),
    lastTickTime: Date.now(),
  };
}

export interface EffectResolutionResult {
  modifiers: Modifier[];
  engineState: EffectEngineState;
  triggered: string[];
}

function isTriggerActive(
  trigger: EffectTrigger,
  state: GameState,
): boolean {
  switch (trigger) {
    case 'always': return true;
    case 'on_kill': return state.warframe.comboCount > 0;
    case 'on_headshot': return state.weapons.primary?.incarnonCharge !== undefined;
    case 'on_critical_hit': return state.warframe.comboMultiplier > 1;
    case 'on_status_effect': return state.warframe.statusEffects.size > 0;
    case 'on_damage_taken': return state.warframe.adaptationStacks.size > 0;
    case 'on_ability_cast': return state.warframe.energy > 0;
    case 'when_airborne': return state.warframe.isAirborne;
    case 'when_crouching': return state.warframe.isCrouching;
    case 'when_blocking': return state.warframe.isBlocking;
    case 'when_invisible': return state.warframe.isInvisible;
    case 'when_invulnerable': return state.warframe.isInvulnerable;
    case 'when_shield_broken': return state.warframe.isShieldBroken;
    case 'when_shield_gated': return state.warframe.isShieldGated;
    case 'when_reloading': return state.warframe.isReloading;
    case 'when_aiming': return state.warframe.isAiming;
    case 'when_sliding': return state.warframe.isSliding;
    case 'when_bullet_jumping': return state.warframe.isBulletJumping;
    case 'when_overguard_active': return state.warframe.overguard > 0;
    case 'on_heavy_attack': return state.warframe.comboCount > 0;
    case 'on_slam': return state.warframe.comboCount > 0;
    case 'on_finisher': return state.warframe.comboCount > 0;
    case 'on_stealth_kill': return state.warframe.isInvisible;
    case 'on_weakpoint': return state.warframe.comboMultiplier > 1;
    default: return false;
  }
}

function calculateEffectValue(effect: Effect, stacks: number): number {
  const base = effect.baseValue;
  if (!effect.scaling) return base;
  const s = effect.scaling;
  const effectiveStacks = s.maxStacks ? Math.min(stacks, s.maxStacks) : stacks;
  switch (s.type) {
    case 'linear': return base + s.factor * effectiveStacks;
    case 'exponential': return base * Math.pow(s.factor, effectiveStacks);
    case 'diminishing': return base * (1 - Math.pow(1 - s.factor, effectiveStacks));
    default: return base;
  }
}

function resolveStacking(
  instances: EffectInstance[],
  rule: StackingRule,
): EffectInstance[] {
  if (instances.length === 0) return [];
  switch (rule) {
    case 'additive': {
      const total = instances.reduce((sum, i) => sum + i.currentValue, 0);
      return [{ ...instances[0], currentValue: total }];
    }
    case 'multiplicative': {
      const product = instances.reduce((p, i) => p * i.currentValue, 1);
      return [{ ...instances[0], currentValue: product }];
    }
    case 'highest_only': {
      const best = instances.reduce((a, b) => a.currentValue > b.currentValue ? a : b);
      return [best];
    }
    case 'refreshes': {
      const best = instances.reduce((a, b) =>
        a.remainingDuration > b.remainingDuration ? a : b,
      );
      return [{ ...best, remainingDuration: best.effect.duration ?? 0 }];
    }
    case 'replaces': {
      return [instances[instances.length - 1]];
    }
    case 'unique': {
      return instances.slice(0, 1);
    }
    case 'mutually_exclusive': {
      return [instances[0]];
    }
    default: return instances;
  }
}

/**
 * Resolve a set of effects against the current game state.
 * Returns Modifiers that can be fed into the stat processor pipeline,
 * plus the updated engine state for next tick.
 */
export function resolveEffects(
  effects: Effect[],
  state: GameState,
  engineState: EffectEngineState,
  dt: number,
): EffectResolutionResult {
  const newEngineState = createEffectEngineState();
  const modifiers: Modifier[] = [];
  const triggered: string[] = [];

  const sourceBuckets = new Map<string, Map<string, { flat: number; mult: number; count: number }>>();

  for (const effect of effects) {
    const targetIds = Array.isArray(effect.target) ? effect.target : [effect.target];

    let instances = engineState.instances.get(effect.id) ?? [];
    instances = instances.filter(inst => {
      if (inst.effect.duration) {
        inst.remainingDuration -= dt;
        return inst.remainingDuration > 0;
      }
      if (inst.effect.condition?.duration) {
        inst.remainingDuration -= dt;
        return inst.remainingDuration > 0;
      }
      return true;
    });

    const triggerActive = effect.condition
      ? isTriggerActive(effect.condition.trigger, state)
      : true;

    if (!triggerActive) {
      newEngineState.instances.set(effect.id, instances);
      continue;
    }

    const icd = effect.condition?.icd ?? 0;
    const canTrigger = instances.every(inst => inst.timeSinceLastTrigger >= icd);

    const currentStacks = instances.length > 0
      ? instances[instances.length - 1].currentStacks
      : 0;

    const newStacks = canTrigger ? currentStacks + 1 : currentStacks;
    const currentValue = calculateEffectValue(effect, newStacks);

    const newInstance: EffectInstance = {
      effect,
      currentValue,
      currentStacks: newStacks,
      remainingDuration: effect.duration ?? 0,
      timeSinceLastTrigger: 0,
      active: true,
    };

    if (canTrigger && effect.condition?.trigger !== 'always') {
      triggered.push(effect.id);
    }

    if (effect.duration) {
      instances = instances.filter(inst => inst.remainingDuration > 0);
      instances.push(newInstance);
    }

    const resolved = effect.stackingGroup
      ? resolveStacking(instances, 'additive')
      : instances;

    newEngineState.instances.set(effect.id, resolved);

    for (const targetId of targetIds) {
      if (!sourceBuckets.has(targetId)) {
        sourceBuckets.set(targetId, new Map());
      }
      const buckets = sourceBuckets.get(targetId)!;
      const key = `${effect.stat}::${effect.stackingGroup || effect.id}`;
      const bucket = buckets.get(key) ?? { flat: 0, mult: 0, count: 0 };
      if (effect.category === 'flat') {
        bucket.flat += currentValue;
      } else if (effect.category === 'multiplicative') {
        bucket.mult += currentValue - 1;
      } else if (effect.category === 'percentage') {
        bucket.mult += currentValue;
      }
      bucket.count++;
      buckets.set(key, bucket);
    }

    for (const [, buckets] of sourceBuckets) {
      for (const [key, bucket] of buckets) {
        const [stat, group] = key.split('::');
        modifiers.push({
          stat,
          category: effect.category === 'flat' ? 'FLAT' : 'MULTIPLIER',
          value: bucket.flat > 0 ? bucket.flat : 1 + bucket.mult,
          stackingGroup: group || 'effect',
          source: effect.source,
          priority: effect.priority,
        });
      }
    }
  }

  return { modifiers, engineState: newEngineState, triggered };
}
