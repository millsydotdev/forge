import React from 'react';
import type { CalculatedStats } from '../../../engine/stat-processor';
import type { CalcBreakdown } from '../../../engine/calc-breakdown';
import { STAT_DISPLAY, formatStatValue, isStatModified, RESISTANCE_DISPLAY } from '../data/stat-display';
import { StatRow } from './stat-row';

export function DynamicStatsSection(stats: CalculatedStats, options?: { onStatClick?: (stat: string) => void }): React.JSX.Element | null {
  const entries: { key: string; def: import('../data/stat-display').StatDisplayDef; value: number }[] = [];
  const statsRecord = stats as unknown as Record<string, number | undefined>;

  for (const [key, def] of Object.entries(STAT_DISPLAY)) {
    if (def.group === 'weapon') continue;
    const value = statsRecord[key];
    if (isStatModified(value, def)) {
      entries.push({ key, def, value: value! });
    }
  }

  const resistancesRecord = stats as unknown as Record<string, Record<string, number> | undefined>;
  const resistances = resistancesRecord.resistances;
  const resistanceEntries: { key: string; value: number }[] = [];
  if (resistances) {
    for (const [rtype, rval] of Object.entries(resistances)) {
      if (Math.abs(rval) > 0.001) {
        resistanceEntries.push({ key: rtype, value: rval });
      }
    }
  }

  if (entries.length === 0 && resistanceEntries.length === 0) return null;

  const grouped = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = grouped.get(e.def.group) ?? [];
    list.push(e);
    grouped.set(e.def.group, list);
  }
  for (const [, list] of grouped) {
    list.sort((a, b) => (a.def.order ?? 99) - (b.def.order ?? 99));
  }

  const GROUP_LABELS: Record<string, string> = {
    movement: 'MOVEMENT', survival: 'SURVIVAL', block: 'BLOCK / PARRY',
    resistances: 'RESISTANCES',
  };

  const breakdownsRecord = stats.breakdowns as unknown as Record<string, CalcBreakdown | undefined> | undefined;

  return (
    <details open={false}>
      <summary className="hud-summary hud-title-margin">DETAILED STATS</summary>
      {Array.from(grouped.entries()).map(([group, items]) => (
        <div key={group}>
          <div className="hud-title">{GROUP_LABELS[group] ?? group.toUpperCase()}</div>
          <div className="hud-stat-box">
            {items.map(e => {
              const formatted = formatStatValue(e.value, e.def.format);
              const displayValue = e.def.suffix ? `${formatted}${e.def.suffix}` : formatted;
              const onClick = () => options?.onStatClick?.(e.key);
              return (
                <div key={e.key} onClick={onClick} style={{ cursor: 'pointer' }} title="Click to explore">
                  <StatRow
                    label={e.def.label}
                    symbol={e.def.symbol}
                    value={displayValue}
                    color={e.def.color}
                    breakdown={breakdownsRecord?.[e.key]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {resistanceEntries.length > 0 && (
        <div>
          <div className="hud-title">{GROUP_LABELS.resistances}</div>
          <div className="hud-stat-box">
            {resistanceEntries.map(e => {
              const rd = RESISTANCE_DISPLAY[e.key];
              return (
                <StatRow
                  key={e.key}
                  label={rd?.label ?? e.key}
                  symbol={rd?.symbol ?? '⊡'}
                  value={(e.value * 100).toFixed(0) + '%'}
                  color={rd?.color}
                />
              );
            })}
          </div>
        </div>
      )}
    </details>
  );
}
