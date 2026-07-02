import React from 'react';
import type { Polarity } from '../../../engine/build-core';
import { POLARITY_COLOR, POLARITY_SYMBOL } from '../../../engine/polarity';
import type { ModSlot } from '../model';

export function SpecialBadge({ label, mod, slotPol, onRemove, onRankChange }: {
  label: string; mod: ModSlot | null; slotPol: Polarity;
  onRemove: () => void; onRankChange: (r: number) => void;
}) {
  if (!mod) return <div className="special-badge"><span className="pol-badge" style={{ color: POLARITY_COLOR[slotPol] }}>{POLARITY_SYMBOL[slotPol]}</span>{label}</div>;
  return (
    <div className="special-badge filled">
      <span className="pol-badge" style={{ color: POLARITY_COLOR[mod.polarity] }}>{POLARITY_SYMBOL[mod.polarity]}</span>
      <span className="special-badge-name">{mod.name}</span>
      <span className="mod-card-rank special-badge-rank">
        {Array.from({ length: mod.maxRank + 1 }, (_, i) => (
          <span key={i} className={'rank-dot special-badge-rank-dot' + (i <= mod.rank ? ' filled' : '')} onClick={() => onRankChange(i)} />
        ))}
      </span>
      <button type="button" className="mod-card-del special-badge-del" aria-label="Remove mod" onClick={onRemove}>×</button>
    </div>
  );
}
