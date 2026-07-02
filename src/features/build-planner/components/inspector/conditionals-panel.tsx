import React from 'react';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import type { ConditionalTriggers } from '../../model';
import { TRIGGER_LABELS } from '../../model';

type ConditionalsPanelProps = {
  state: BuildPlannerStoreState;
};

export function ConditionalsPanel({ state }: ConditionalsPanelProps) {
  const { conditionalTriggers, setConditionalTriggers } = state;

  const toggleBool = (key: keyof ConditionalTriggers) => {
    if (typeof conditionalTriggers[key] === 'boolean') {
      setConditionalTriggers({ ...conditionalTriggers, [key]: !conditionalTriggers[key] } as any);
    }
  };

  return (
    <div className="conditionals-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 0' }}>
      {(Object.keys(TRIGGER_LABELS) as (keyof ConditionalTriggers)[]).map(k => {
        const val = conditionalTriggers[k];
        const label = TRIGGER_LABELS[k];
        if (!label) return null;
        if (typeof val === 'boolean') {
          return (
            <label key={k} className="conditional-toggle" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--wf-text-dim)', cursor: 'pointer' }}>
              <input type="checkbox" checked={val} onChange={() => toggleBool(k as any)} style={{ accentColor: 'var(--wf-teal)' }} />
              <span>{label}</span>
            </label>
          );
        }
        if (typeof val === 'number') {
          return (
            <label key={k} className="conditional-toggle conditional-number" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--wf-text-dim)' }}>
              <span>{label}</span>
              <input type="number" min={0} max={k === 'comboTier' ? 12 : 40} value={val}
                onChange={e => setConditionalTriggers({ ...conditionalTriggers, [k]: +e.target.value } as any)}
                className="wb-bottom__search" style={{ width: 48 }}
              />
            </label>
          );
        }
        return null;
      })}
    </div>
  );
}
