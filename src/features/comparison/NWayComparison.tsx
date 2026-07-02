import { useState, useMemo, useCallback } from 'react';
import { workspaceManager } from '../../services/workspace-manager';
import type { BuildDocument } from '../../services/build-serializer';

const COMPARISON_STATS = [
  { key: 'health', label: 'Health', color: 'var(--wf-green)' },
  { key: 'shields', label: 'Shields', color: 'var(--wf-blue)' },
  { key: 'armor', label: 'Armor', color: 'var(--wf-orange)' },
  { key: 'energy', label: 'Energy', color: 'var(--wf-teal)' },
  { key: 'ehp', label: 'EHP', color: 'var(--wf-gold)' },
  { key: 'strength', label: 'STR', color: 'var(--wf-red)' },
  { key: 'duration', label: 'DUR', color: 'var(--wf-blue)' },
  { key: 'range', label: 'RNG', color: 'var(--wf-green)' },
  { key: 'efficiency', label: 'EFF', color: 'var(--wf-teal)' },
];

export function NWayComparison() {
  const [openDocs, setOpenDocs] = useState<BuildDocument[]>(() => workspaceManager.documents.getAll());
  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Subscribe to document changes
  useState(() => {
    const unsub = workspaceManager.events.on('document-opened', () => {
      setOpenDocs(workspaceManager.documents.getAll());
    });
    return unsub;
  });

  const toggleDoc = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleDocs = useMemo(() => {
    return openDocs.filter(d => selectedIds.has(d.id));
  }, [openDocs, selectedIds]);

  // If less than 2 selected, show selection UI
  if (openDocs.length < 1) {
    return (
      <div className="comparison-empty">
        <div className="comparison-empty__icon">⇄</div>
        <div className="comparison-empty__title">No Documents to Compare</div>
        <div className="comparison-empty__text">Open at least two builds to compare them side by side.</div>
      </div>
    );
  }

  if (visibleDocs.length < 2) {
    return (
      <div className="comparison-panel">
        <div className="comparison-panel__header">N-Way Comparison</div>
        <div className="comparison-panel__select">
          <div className="comparison-panel__label">Select builds to compare (select at least 2):</div>
          {openDocs.map(doc => (
            <label key={doc.id} className="comparison-doc-select">
              <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleDoc(doc.id)} />
              <span>{doc.name || doc.slug}</span>
              {doc.dirty && <span className="comparison-doc-dirty"> (unsaved)</span>}
            </label>
          ))}
          {selectedIds.size >= 2 && (
            <button className="comparison-panel__compare-btn" onClick={() => {}}>Compare</button>
          )}
        </div>
      </div>
    );
  }

  // Full comparison matrix
  return (
    <div className="comparison-panel">
      <div className="comparison-panel__header">
        <span>N-Way Comparison</span>
        <span className="comparison-panel__count">{visibleDocs.length} builds</span>
      </div>

      <div className="comparison-matrix">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="comparison-table__label">Stat</th>
              {visibleDocs.map(doc => (
                <th key={doc.id} className={`comparison-table__header ${doc.id === baselineId ? 'comparison-table__header--baseline' : ''}`}>
                  <div className="comparison-table__name">{doc.name || doc.slug}</div>
                  <button
                    className="comparison-table__baseline-btn"
                    onClick={() => setBaselineId(doc.id)}
                  >
                    {doc.id === baselineId ? '★ Baseline' : '☆ Set Baseline'}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_STATS.map(stat => {
              const baseline = baselineId ? visibleDocs.find(d => d.id === baselineId) : null;
              const baselineVal = baseline ? (baseline as any)[stat.key] : null;
              return (
                <tr key={stat.key}>
                  <td className="comparison-table__label" style={{ color: stat.color }}>{stat.label}</td>
                  {visibleDocs.map(doc => {
                    const value = (doc as any)[stat.key];
                    const display = typeof value === 'number' ? (value > 1000 ? value.toFixed(0) : value.toFixed(1)) : '—';
                    let delta = '';
                    let deltaClass = '';
                    if (baselineVal !== null && baselineVal !== undefined && typeof value === 'number') {
                      const diff = value - baselineVal;
                      if (Math.abs(diff) > 0.01) {
                        delta = (diff > 0 ? '+' : '') + (typeof value === 'number' ? (Math.abs(diff) > 1000 ? diff.toFixed(0) : diff.toFixed(1)) : '');
                        deltaClass = diff > 0 ? 'comparison-delta--pos' : 'comparison-delta--neg';
                      }
                    }
                    return (
                      <td key={doc.id} className={`comparison-table__cell ${doc.id === baselineId ? 'comparison-table__cell--baseline' : ''}`}>
                        <span className="comparison-table__value">{display}</span>
                        {delta && <span className={`comparison-delta ${deltaClass}`}>{delta}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="comparison-panel__footer">
        {baselineId ? 'All deltas relative to baseline (★)' : 'Click "Set Baseline" on a column to see deltas.'}
      </div>
    </div>
  );
}
