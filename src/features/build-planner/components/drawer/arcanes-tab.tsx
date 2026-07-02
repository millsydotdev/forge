import React, { useState, useMemo } from 'react';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import { Input } from '../../../../components/ui/Input';
import { RichTooltip } from '../../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../../components/ui/PresentationModel';

export function ArcanesTab({ state, onSelect }: { state: BuildPlannerStoreState; onSelect: (m: any) => void }) {
  const { allArcanes } = state;
  const [query, setQuery] = useState('');
  const list = allArcanes.filter(a => !query.trim() || a.name.toLowerCase().includes(query.toLowerCase()));
  const models = useMemo(() => list.map((a: any) => buildPresentationModel(a, 'arcane')), [list]);
  return (
    <div className="drawer-tab-content" style={{ padding: 'var(--pad)' }}>
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search arcanes…"
        aria-label="Search arcanes"
        style={{ marginBottom: 8 }}
      />
      <div className="drawer-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {list.map((a, i) => (
          <RichTooltip key={a.uniqueName} tooltip={models[i]?.tooltip}>
            <div className="lib-card" role="button" tabIndex={0}
              onClick={() => onSelect(a)} onKeyDown={e => { if (e.key === 'Enter') onSelect(a); }}
              style={{ padding: '4px 10px', border: '1px solid var(--wf-border)', borderRadius: 3, cursor: 'pointer', fontSize: 12, color: 'var(--wf-text-dim)', transition: 'border-color var(--transition-fast), color var(--transition-fast)' }}>
              {a.name}
            </div>
          </RichTooltip>
        ))}
        {list.length === 0 && (
          <div style={{ width: '100%', textAlign: 'center', color: 'var(--wf-text-muted)', padding: 24 }}>
            <div style={{ fontSize: 24, opacity: 0.5, marginBottom: 8 }}>◇</div>
            No arcanes found
          </div>
        )}
      </div>
    </div>
  );
}
