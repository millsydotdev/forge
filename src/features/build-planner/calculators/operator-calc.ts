/**
 * Operator Calculator — computes operator stats based on base operator,
 * active focus nodes, and equipped arcanes.
 *
 * Data sourced from @wfcd/items via WfcdDataService.
 */

export interface OperatorStats {
  health: number;
  shield: number;
  armor: number;
  energy: number; // max energy
  sprintSpeed: number;
  // ability stats (base multipliers)
  abilityStrength: number; // % as decimal, e.g., 0.25 for +25%
  abilityDuration: number;
  abilityRange: number;
  abilityEfficiency: number;
  // derived
  effectiveHealth: number; // health + shield + armor*health/100? simplified
}

export interface OperatorInput {
  health?: number;
  shield?: number;
  armor?: number;
  power?: number;
  sprintSpeed?: number;
}

/**
 * Base operator stats from the operator definition (WfcdOperator).
 */
function getBaseOperator(op: OperatorInput): OperatorStats {
  return {
    health: op.health ?? 100,
    shield: op.shield ?? 100,
    armor: op.armor ?? 0,
    energy: op.power ?? 100,
    sprintSpeed: op.sprintSpeed ?? 1.0,
    abilityStrength: 0.0,
    abilityDuration: 0.0,
    abilityRange: 0.0,
    abilityEfficiency: 0.0,
    effectiveHealth: (op.health ?? 100) + (op.shield ?? 100), // simple
  };
}

/**
 * Apply focus node modifiers (from levelStat strings) to a stat.
 */
function applyFocusModifiers(base: number, nodes: string[]): number {
  let total = base;
  for (const node of nodes) {
    // In a real implementation we would look up the node's stat modifications.
    // For now we assume nodes are passed as pre‑parsed modifiers like "+0.1" etc.
    const match = node.match(/([+-]?\d+(?:\.\d+)?)%?/);
    if (match) {
      const val = parseFloat(match[1]);
      if (node.endsWith('%')) {
        total += base * (val / 100);
      } else {
        total += val;
      }
    }
  }
  return total;
}

/**
 * Apply arcane bonuses (simplified) – each arcane may give a flat % boost to a stat.
 */
function applyArcaneBonus(base: number, arcs: { stat: string; value: number }[]): number {
  let total = base;
  for (const a of arcs) {
    if (a.stat === 'abilityStrength') total += base * (a.value / 100);
    else if (a.stat === 'abilityDuration') total += base * (a.value / 100);
    else if (a.stat === 'abilityRange') total += base * (a.value / 100);
    else if (a.stat === 'abilityEfficiency') total += base * (a.value / 100);
    else if (a.stat === 'health') total += a.value;
    else if (a.stat === 'shield') total += a.value;
    else if (a.stat === 'armor') total += a.value;
    else if (a.stat === 'energy') total += a.value;
    else if (a.stat === 'sprintSpeed') total += a.value;
  }
  return total;
}

export function calculateOperatorStats(
  operator: OperatorInput,
  focusNodes: string[], // list of raw stat strings from selected nodes
  arcanes: { stat: string; value: number }[] // e.g. [{stat:'abilityStrength',value:15}]
): OperatorStats {
  const stats = getBaseOperator(operator);
  // Apply focus nodes to each relevant stat
  stats.abilityStrength = applyFocusModifiers(stats.abilityStrength, focusNodes);
  stats.abilityDuration = applyFocusModifiers(stats.abilityDuration, focusNodes);
  stats.abilityRange = applyFocusModifiers(stats.abilityRange, focusNodes);
  stats.abilityEfficiency = applyFocusModifiers(stats.abilityEfficiency, focusNodes);
  // For simplicity we also apply focus to core stats if nodes mention them
  // (in reality you'd map node->stat)
  // Apply arcane bonuses
  stats.abilityStrength = applyArcaneBonus(stats.abilityStrength, arcanes);
  stats.abilityDuration = applyArcaneBonus(stats.abilityDuration, arcanes);
  stats.abilityRange = applyArcaneBonus(stats.abilityRange, arcanes);
  stats.abilityEfficiency = applyArcaneBonus(stats.abilityEfficiency, arcanes);
  stats.health = applyArcaneBonus(stats.health, arcanes);
  stats.shield = applyArcaneBonus(stats.shield, arcanes);
  stats.armor = applyArcaneBonus(stats.armor, arcanes);
  stats.energy = applyArcaneBonus(stats.energy, arcanes);
  stats.sprintSpeed = applyArcaneBonus(stats.sprintSpeed, arcanes);
  // Re‑calc effective health (simple)
  stats.effectiveHealth = stats.health + stats.shield + (stats.armor * stats.health / 100);
  return stats;
}
