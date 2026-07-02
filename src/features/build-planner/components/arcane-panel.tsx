import React from 'react';
import type { ArcaneSlot, ItemOption } from '../model';

export function ArcanePanel({ arcanes, arcanePool, onSelect, onRemove, slots = 2 }: {
  arcanes: [ArcaneSlot | null, ArcaneSlot | null];
  arcanePool: ItemOption[];
  onSelect: (idx: number, m: ItemOption) => void;
  onRemove: (idx: number) => void;
  slots?: number;
}) {
  if (slots === 0) return null;
  return (
    <div className="loadout-section arcane-panel-section">
      <div className="section-topline"><span>Arcanes</span></div>
      <div className="arcane-grid">
        {Array.from({ length: slots }, (_, idx) => {
          const arc = arcanes[idx];
          if (arc) {
            return (
              <div key={idx} className="arcane-card filled">
                <span className="arcane-name">{arc.name}</span>
                <span className="arcane-rank">{'●'.repeat(arc.rank)}{'○'.repeat(arc.maxRank - arc.rank)}</span>
                <button type="button" className="mod-card-del" aria-label={`Remove ${arc.name}`} onClick={() => onRemove(idx)}>×</button>
              </div>
            );
          }
          return (
            <div key={idx} className="arcane-card empty">
              <span className="arcane-label">Arcane {idx + 1}</span>
              <select className="dex-select arcane-select" defaultValue="" onChange={e => {
                const found = arcanePool.find(a => a.uniqueName === e.target.value);
                if (found) onSelect(idx, found);
              }}>
                <option value="" disabled>Select...</option>
                {arcanePool.map(a => (
                  <option key={a.uniqueName} value={a.uniqueName}>{a.name}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
