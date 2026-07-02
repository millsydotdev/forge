import React from 'react';
import type { CapacityBreakdown } from '../../../engine/polarity';

export function CapacityBar({ cap }: { cap: CapacityBreakdown }) {
  const pct = cap.total > 0 ? Math.min(cap.used / cap.total, 1) : 0;
  const color = cap.overCap ? 'var(--wf-red)' : pct > 0.85 ? 'var(--wf-gold)' : 'var(--wf-teal)';
  return (
    <div className="cap-bar-wrap"
      role="progressbar"
      aria-label="Mod capacity"
      aria-valuenow={cap.used}
      aria-valuemin={0}
      aria-valuemax={cap.total}>
      <div className="cap-bar-track">
        <div className="cap-bar-fill" style={{ width: `${pct * 100}%`, background: color }} />
      </div>
      <span className="cap-bar-label" style={{ color: cap.overCap ? 'var(--wf-red)' : 'var(--wf-text-dim)' }}>{cap.used}/{cap.total}</span>
    </div>
  );
}
