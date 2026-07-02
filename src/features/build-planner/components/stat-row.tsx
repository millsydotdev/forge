import React from 'react';
import type { CalcBreakdown } from '../../../engine/calc-breakdown';
import { CalcTreeTooltip } from './calc-tree-tooltip';
import { resolveSymbol } from '../data/stat-display';

const _prev = new Map<string, string>();

export function StatRow({ label, value, color, suffix, breakdown, symbol, onClick }: {
  label: string;
  value: string;
  color?: string;
  suffix?: string;
  breakdown?: CalcBreakdown;
  symbol?: string;
  onClick?: () => void;
}) {
  const sym = symbol ?? resolveSymbol(label);
  const prevValue = _prev.get(label);
  _prev.set(label, value);
  const changed = prevValue !== undefined && prevValue !== value;
  const isPos = changed && +value > +(prevValue!.replace(/[^0-9.-]/g, '') || 0);

  return (
    <div className="hud-stat" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined} title={onClick ? 'Click to explore calculation' : undefined}>
      <span className="hud-stat-label">{sym && <span className="hud-stat-symbol">{sym}</span>}{label}</span>
      <CalcTreeTooltip breakdown={breakdown} color={color}>
        <span key={value} className="hud-stat-value" style={color ? { color } : undefined}>
          {value}{suffix}
          {changed && (
            <span className={`stat-delta-${isPos ? 'pos' : 'neg'}`}>
              {isPos ? ' ▲' : ' ▼'}
            </span>
          )}
        </span>
      </CalcTreeTooltip>
    </div>
  );
}
