import React from 'react';
import { SHARD_COLORS, SHARD_STAT_LABEL } from '../model';
import type { ShardColor, ShardSlot } from '../model';
import { visualManager } from '../../../services/visual-manager';

const SHARD_HEX: Record<ShardColor, string> = {
  crimson: '#f44336', azure: '#00aeff', amber: '#ff9800',
  violet: '#a050e0', topaz: '#c8a45e', emerald: '#41dc78',
};

export function ShardPanel({ shards, onChange, onTauToggle }: {
  shards: ShardSlot[];
  onChange: (idx: number, color: ShardColor | null) => void;
  onTauToggle: (idx: number, isTau: boolean) => void;
}) {
  const filled = shards.filter(s => s.color).length;
  return (
    <div className="loadout-section shard-panel-section">
      <div className="section-topline">
        <span>Archon Shards</span>
        <small>{filled}/5</small>
      </div>
      <div className="shard-grid shard-grid-rows">
        {shards.map((slot, i) => {
          const s = slot.color;
          const hex = s ? SHARD_HEX[s] : null;
          return (
            <div key={i} className={'shard-socket-card' + (s ? ` shard-${s}` : '') + (slot.isTau ? ' tauforged' : '')}
              style={{
                background: s ? 'linear-gradient(135deg, #0f0a14 0%, #1a1420 100%)' : 'var(--wf-surface-solid)',
                border: `1px solid ${hex ? hex + '60' : 'var(--wf-border)'}`,
                boxShadow: hex ? `0 0 12px ${hex}80` : 'none',
              }}>
              <div className="shard-icon-frame">
                {s ? (
                  <img src={visualManager.getShardImage(s, slot.isTau)} alt="" draggable={false} className="shard-icon-img" />
                ) : (
                  <div className="shard-icon-empty">∅</div>
                )}
              </div>

              <div className="shard-info">
                <select className="dex-select shard-select" value={s ?? ''} aria-label={`Shard ${i + 1} color`}
                                     onChange={e => onChange(i, (e.target.value || null) as ShardColor | null)}>
                  <option value="">Empty</option>
                  {SHARD_COLORS.map(sc => (
                    <option key={sc.value} value={sc.value}>{sc.label}</option>
                  ))}
                </select>
                <small className="shard-stat" style={{ color: hex ?? 'var(--wf-text-muted)' }}>
                  {s ? SHARD_STAT_LABEL[s] : 'No shard equipped'}
                  {slot.isTau && s ? ' (Tauforged)' : ''}
                </small>
              </div>

              {s && (
                <label className="shard-tau-label"
                  style={{
                    background: slot.isTau ? 'rgba(200,164,94,0.12)' : 'transparent',
                    border: `1px solid ${slot.isTau ? 'var(--wf-gold)' : 'var(--wf-border)'}`,
                  }}>
                  <input type="checkbox" checked={slot.isTau} onChange={e => onTauToggle(i, e.target.checked)}
                    className="shard-tau-checkbox" />
                  Tau
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
