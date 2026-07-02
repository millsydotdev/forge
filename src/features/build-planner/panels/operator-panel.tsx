import React, { useState, useEffect, useMemo } from 'react';
import { registerPanel, type PanelSurfaceProps } from './panel-registry';
import type { ItemOption } from '../model';
import { parseOperatorModLines, computeOperatorStats, type DetailRecord } from '../util/operator-stats-parser';
import { OpPartPreview, ArcanePreview, OperatorStatsPanel } from '../components/operator-preview';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

// ---------- Types ----------
export type OperatorPartType = 'operator';

export interface OperatorState {
  operator: string | null;
  focusNodes: string[];
  arcane: string | null;
  options: {
    operators: ItemOption[];
    focusNodes: ItemOption[];
    arcanes: ItemOption[];
  };
}

export function defaultOperatorState(): OperatorState {
  return {
    operator: null,
    focusNodes: [],
    arcane: null,
    options: { operators: [], focusNodes: [], arcanes: [] },
  };
}

// ---------- Data Loading ----------
async function loadOperatorData(): Promise<OperatorState['options']> {
  try {
    const ops: ItemOption[] = await window.forge.getItems?.('Operators') ?? [];
    const foci: ItemOption[] = await window.forge.getItems?.('Focus') ?? [];
    const arcs: ItemOption[] = await window.forge.getItems?.('OperatorArcanes') ?? [];
    return { operators: ops, focusNodes: foci, arcanes: arcs };
  } catch {
    return { operators: [], focusNodes: [], arcanes: [] };
  }
}

// ---------- Component ----------
function OperatorSurface({ state, onChange }: PanelSurfaceProps<OperatorState>) {
  const [loading, setLoading] = useState(true);
  const [opDetail, setOpDetail] = useState<DetailRecord | null>(null);
  const [focusDetailsMap, setFocusDetailsMap] = useState<Record<string, DetailRecord>>({});
  const [arcaneDetail, setArcaneDetail] = useState<DetailRecord | null>(null);

  useEffect(() => {
    loadOperatorData().then(data => {
      onChange(prev => ({ ...prev, options: data }));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.operator) {
      setTimeout(() => setOpDetail(null), 0);
      return;
    }
    const operatorId = state.operator;
    const fetch = async () => {
      try {
        const d = await window.forge.getItemDetail(operatorId);
        setOpDetail(d as unknown as DetailRecord | null);
      } catch {
        setOpDetail(null);
      }
    };
    fetch();
  }, [state.operator]);

  useEffect(() => {
    const load = async () => {
      if (state.focusNodes.length === 0) {
        setFocusDetailsMap({});
        return;
      }
      const map: Record<string, DetailRecord> = {};
      for (const id of state.focusNodes) {
        try {
          const d = await window.forge.getItemDetail(id);
          map[id] = d as unknown as DetailRecord;
        } catch {
          map[id] = {};
        }
      }
      setFocusDetailsMap(map);
    };
    load();
  }, [state.focusNodes]);

  useEffect(() => {
    if (!state.arcane) {
      setTimeout(() => setArcaneDetail(null), 0);
      return;
    }
    const arcaneId = state.arcane;
    const fetchArcane = async () => {
      try {
        const d = await window.forge.getItemDetail(arcaneId);
        setArcaneDetail(d as unknown as DetailRecord | null);
      } catch {
        setArcaneDetail(null);
      }
    };
    fetchArcane();
  }, [state.arcane]);

  const focusMods = useMemo(() => {
    const mods = { abilityStrength: 0, abilityDuration: 0, abilityRange: 0, abilityEfficiency: 0, health: 0, shield: 0, armor: 0, energy: 0, sprintSpeed: 0 };
    for (const id of state.focusNodes) {
      const det = focusDetailsMap[id];
      if (!det) continue;
      const parsed = parseOperatorModLines(det);
      mods.abilityStrength += parsed.abilityStrength;
      mods.abilityDuration += parsed.abilityDuration;
      mods.abilityRange += parsed.abilityRange;
      mods.abilityEfficiency += parsed.abilityEfficiency;
      mods.health += parsed.health;
      mods.shield += parsed.shield;
      mods.armor += parsed.armor;
      mods.energy += parsed.energy;
      mods.sprintSpeed += parsed.sprintSpeed;
    }
    return mods;
  }, [focusDetailsMap, state.focusNodes]);

  const arcaneMods = useMemo(() => parseOperatorModLines(arcaneDetail), [arcaneDetail]);

  const stats = useMemo(() => computeOperatorStats(opDetail, focusMods, arcaneMods), [opDetail, focusMods, arcaneMods]);

  if (loading) {
    return (
      <section className="surface-section selected">
        <div className="surface-header"><span>Operator Builder</span></div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <SkeletonLoader variant="rect" width={48} height={48} borderRadius={8} />
          <SkeletonLoader variant="line" width={160} height={12} />
          <SkeletonLoader variant="line" width={120} height={10} />
        </div>
      </section>
    );
  }

  const setOperator = (id: string | null) => onChange(prev => ({ ...prev, operator: id }));
  const toggleFocus = (id: string) => {
    onChange(prev => {
      const idx = prev.focusNodes.indexOf(id);
      if (idx >= 0) {
        const copy = [...prev.focusNodes];
        copy.splice(idx, 1);
        return { ...prev, focusNodes: copy };
      } else {
        return { ...prev, focusNodes: [...prev.focusNodes, id] };
      }
    });
  };
  const setArcane = (id: string | null) => onChange(prev => ({ ...prev, arcane: id }));

  return (
    <section className="surface-section selected">
      <div className="surface-header"><span>Operator Builder</span></div>

      <div style={{ marginBottom: 24 }}>
        <div className="op-section-label">OPERATOR</div>
        <select
          className="dex-select"
          value={state.operator ?? ''}
          onChange={e => setOperator(e.target.value || null)}
          style={{ maxWidth: 300 }}
        >
          <option value="">\u2014 None \u2014</option>
          {state.options.operators.map(o => (
            <option key={o.uniqueName} value={o.uniqueName}>{o.name}</option>
          ))}
        </select>
        {state.operator && opDetail && (
          <OpPartPreview detail={opDetail} />
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="op-section-label">FOCUS NODES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {state.options.focusNodes.map(node => {
            const selected = state.focusNodes.includes(node.uniqueName);
            return (
              <label key={node.uniqueName} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleFocus(node.uniqueName)}
                  style={{ marginRight: 6 }}
                />
                <span>{node.name}</span>
              </label>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: 'var(--wf-text-dim)', marginTop: 4 }}>
          Selected: {state.focusNodes.length} nodes
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="op-section-label">ARCANE</div>
        <select
          className="dex-select"
          value={state.arcane ?? ''}
          onChange={e => setArcane(e.target.value || null)}
          style={{ maxWidth: 300 }}
        >
          <option value="">\u2014 None \u2014</option>
          {state.options.arcanes.map(a => (
            <option key={a.uniqueName} value={a.uniqueName}>{a.name}</option>
          ))}
        </select>
        {state.arcane && arcaneDetail && (
          <ArcanePreview detail={arcaneDetail} />
        )}
      </div>

      {stats && <OperatorStatsPanel stats={stats} />}
    </section>
  );
}

// ---------- Register ----------
registerPanel<OperatorState>({
  slotKey: 'operator',
  label: 'OPERATOR',
  icon: 'OP',
  Surface: OperatorSurface,
  initialState: defaultOperatorState,
  order: 50,
});
