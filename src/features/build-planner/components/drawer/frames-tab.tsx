import React, { useState, useMemo } from 'react';
import type { BuildPlannerStoreState } from '../../../../hooks/useBuildPlannerStore';
import { Input } from '../../../../components/ui/Input';
import { AssetImage } from '../../../../components/ui/AssetImage';
import { RichTooltip } from '../../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../../components/ui/PresentationModel';

export function FramesTab({ state, onSelect }: { state: BuildPlannerStoreState; onSelect: (m: any) => void }) {
  const { warframes } = state;
  const [query, setQuery] = useState('');
  const list = warframes.filter((f: any) => !query.trim() || f.name.toLowerCase().includes(query.toLowerCase()));
  const models = useMemo(() => list.map((f: any) => buildPresentationModel(f, 'warframe')), [list]);
  return (
    <div className="drawer-tab-content" style={{ padding: 'var(--pad)' }}>
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search warframes…"
        aria-label="Search warframes"
        style={{ marginBottom: 8 }}
      />
      <div className="drawer-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {list.map((f: any, i: number) => (
          <RichTooltip key={f.uniqueName} tooltip={models[i]?.tooltip}>
            <div className="lib-card" role="button" tabIndex={0}
              onClick={() => onSelect(f)} onKeyDown={e => { if (e.key === 'Enter') onSelect(f); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid var(--wf-border)', borderRadius: 3, cursor: 'pointer', fontSize: 12, color: 'var(--wf-text-dim)', transition: 'border-color var(--transition-fast), color var(--transition-fast)' }}>
              <AssetImage className="lib-card-img" imageName={f.imageName} style={{ width: 24, height: 24, objectFit: 'contain' }} />
              <span>{f.name}</span>
            </div>
          </RichTooltip>
        ))}
        {list.length === 0 && (
          <div style={{ width: '100%', textAlign: 'center', color: 'var(--wf-text-muted)', padding: 24 }}>
            <div style={{ fontSize: 24, opacity: 0.5, marginBottom: 8 }}>◇</div>
            No warframes found
          </div>
        )}
      </div>
    </div>
  );
}
