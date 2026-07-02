import React from 'react';
import type { CalcBreakdown } from '../../../../engine/calc-breakdown';
import { useUiStore } from '../../../../store/uiStore';

export const StatBreakdownRow = React.memo(function StatBreakdownRow({ statName, value, statKey, breakdown }: {
  statName: string; value: string; statKey: string; breakdown?: CalcBreakdown;
}) {
  const whyAvailable = !!breakdown;
  return (
    <div className="stat-breakdown-row" style={{
      display: 'flex', justifyContent: 'space-between', padding: '4px 0',
      borderBottom: '1px solid var(--wf-border)', cursor: 'pointer',
      transition: 'background var(--transition-fast)', borderRadius: 2,
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--wf-teal-soft)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      onClick={() => {
        const ui = useUiStore.getState();
        ui.setInspectorMode('stat', { stat: statKey, label: statName, value, breakdown });
      }} role="button" tabIndex={0}
      aria-label={`${statName}: ${value}. Click for breakdown.`}
      onKeyDown={e => {
        if (e.key === 'Enter') { const ui = useUiStore.getState(); ui.setInspectorMode('stat', { stat: statKey, label: statName, value, breakdown }); }
      }}>
      <span style={{ fontSize: 12, color: 'var(--wf-text)' }}>{statName}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--wf-teal)', fontFamily: 'var(--font-mono)' }}>{value}</span>
        {whyAvailable && (
          <span style={{ fontSize: 9, color: 'var(--wf-gold-dim)', fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>
            Why?
          </span>
        )}
      </div>
    </div>
  );
});
