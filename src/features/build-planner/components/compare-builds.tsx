import React, { useEffect, useState, useMemo } from 'react';
import type { CalculatedStats } from '../../../engine/stat-processor';
import { readLoadouts } from '../../../store/buildStore';
import { decodeToBuildCore } from '../services/build-codec';

export interface CompareEntry {
  name: string;
  dps: number;
  sustainedDps: number;
  damage: number;
  critChance: number;
  critMultiplier: number;
  statusChance: number;
  multishot: number;
  fireRate: number;
  reloadSpeed: number;
  magazine: number;
  ehp: number;
}

function entryFromResult(name: string, result: CalculatedStats | null): CompareEntry {
  const currentWeapon = result?.weapons?.['primary'] ?? result?.weapons?.['secondary'] ?? result?.weapons?.['melee'];
  return {
    name,
    dps: currentWeapon?.avgDps ?? 0,
    sustainedDps: currentWeapon?.sustainedDps ?? 0,
    damage: currentWeapon?.totalDamage ?? 0,
    critChance: currentWeapon?.critChance ?? 0,
    critMultiplier: currentWeapon?.critMultiplier ?? 0,
    statusChance: currentWeapon?.statusChance ?? 0,
    multishot: currentWeapon?.multishot ?? 0,
    fireRate: currentWeapon?.fireRate ?? 0,
    reloadSpeed: currentWeapon?.reloadSpeed ?? 0,
    magazine: currentWeapon?.magazine ?? 0,
    ehp: result?.ehp ?? 0,
  };
}

function DiffIndicator({ current, base }: { current: number; base: number }) {
  if (base === 0 || current === base) return null;
  const diff = ((current - base) / base) * 100;
  const isPos = diff > 0;
  return (
    <span style={{
      fontSize: 9, marginLeft: 4,
      color: isPos ? 'var(--wf-green)' : 'var(--wf-red)',
      animation: isPos ? 'stat-change-up 0.4s ease-out' : 'stat-change-down 0.4s ease-out',
    }}>
      {isPos ? '▲' : '▼'} {Math.abs(diff).toFixed(0)}%
    </span>
  );
}

export function CompareBuilds({ currentResult, onClose }: {
  currentResult: CalculatedStats | null;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<CompareEntry[]>([]);

  useEffect(() => {
    const loadouts = readLoadouts();
    const builds: Promise<CompareEntry>[] = [];

    for (const [name, code] of Object.entries(loadouts)) {
      builds.push(
        (async () => {
          try {
            const build = decodeToBuildCore(code, 0);
            if (!build) return entryFromResult(name, null);
            const ipc = await window.forge.calculateBuild(build);
            const result = ipc.ok ? ipc.data : null;
            return entryFromResult(name, result);
          } catch {
            return entryFromResult(name, null);
          }
        })()
      );
    }

    Promise.all(builds).then(savedEntries => {
      const all: CompareEntry[] = [];
      if (currentResult) all.push(entryFromResult('Current Build', currentResult));
      all.push(...savedEntries);
      setEntries(all);
    });
  }, [currentResult]);

  const currentEntry = useMemo(() => entries.find(e => e.name === 'Current Build'), [entries]);

  const rows = [
    { label: 'Burst DPS', key: 'dps' as const, fmt: (v: number) => Math.round(v).toLocaleString(), color: '#d94b4b' },
    { label: 'Sustained DPS', key: 'sustainedDps' as const, fmt: (v: number) => Math.round(v).toLocaleString(), color: '#e87a30' },
    { label: 'Damage', key: 'damage' as const, fmt: (v: number) => Math.round(v).toLocaleString(), color: '#fff' },
    { label: 'Multishot', key: 'multishot' as const, fmt: (v: number) => v.toFixed(2) + 'x', color: '#4eb5b5' },
    { label: 'Crit Chance', key: 'critChance' as const, fmt: (v: number) => (v * 100).toFixed(1) + '%', color: '#d6a43e' },
    { label: 'Crit Multiplier', key: 'critMultiplier' as const, fmt: (v: number) => v.toFixed(2) + 'x', color: '#d6a43e' },
    { label: 'Status Chance', key: 'statusChance' as const, fmt: (v: number) => (v * 100).toFixed(1) + '%', color: '#4ad94a' },
    { label: 'Fire Rate', key: 'fireRate' as const, fmt: (v: number) => v.toFixed(1) + '/s', color: 'var(--wf-text-dim)' },
    { label: 'Reload', key: 'reloadSpeed' as const, fmt: (v: number) => v.toFixed(1) + 's', color: '#d6a43e' },
    { label: 'Magazine', key: 'magazine' as const, fmt: (v: number) => String(Math.round(v)), color: '#b347ff' },
    { label: 'EHP', key: 'ehp' as const, fmt: (v: number) => Math.round(v).toLocaleString(), color: '#d94b4b' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-box compare-builds compare-builds-modal" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--wf-surface)', border: '1px solid var(--wf-border)', borderRadius: 8, padding: 16, width: 700, maxWidth: '95vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--elevation-4)' }}>
        <div className="modal-title" style={{ fontSize: 14, color: 'var(--wf-gold)', fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Compare Builds
        </div>
        {entries.length === 0 ? (
          <div className="empty-state compare-empty" style={{ textAlign: 'center', color: 'var(--wf-text-muted)', padding: 32, fontSize: 12 }}>
            No saved builds to compare. Save a build first.
          </div>
        ) : (
          <div className="compare-table-wrap" style={{ flex: 1, overflow: 'auto' }}>
            <table className="compare-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--wf-text-dim)', borderBottom: '1px solid var(--wf-border)', position: 'sticky', top: 0, background: 'var(--wf-surface)' }}>
                    Metric
                  </th>
                  {entries.map(e => (
                    <th key={e.name} style={{
                      textAlign: 'right', padding: '4px 8px', color: 'var(--wf-text-dim)',
                      borderBottom: '1px solid var(--wf-border)',
                      fontFamily: e.name === 'Current Build' ? 'var(--font-display)' : undefined,
                      position: 'sticky', top: 0, background: 'var(--wf-surface)',
                    }}>
                      {e.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const values = entries.map(e => e[row.key] as number);
                  const maxVal = Math.max(...values);
                  return (
                    <tr key={row.key}>
                      <td className="compare-table td-label" style={{ padding: '4px 8px', color: 'var(--wf-text-muted)', borderBottom: '1px solid var(--wf-border)' }}>
                        {row.label}
                      </td>
                      {entries.map((e, _i) => {
                        const v = e[row.key] as number;
                        const isMax = v === maxVal && maxVal > 0;
                        const baseVal = currentEntry ? currentEntry[row.key] as number : 0;
                        const isCurrent = e.name === 'Current Build';
                        return (
                          <td key={e.name} style={{
                            textAlign: 'right', padding: '4px 8px',
                            color: isMax ? row.color : 'var(--wf-text-dim)',
                            fontWeight: isMax ? 700 : 400,
                            borderBottom: '1px solid var(--wf-border)',
                            whiteSpace: 'nowrap',
                          }}>
                            {row.fmt(v)}
                            {!isCurrent && currentEntry && <DiffIndicator current={v} base={baseVal} />}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-actions" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="modal-btn primary" onClick={onClose}
            style={{ padding: '3px 10px', border: '1px solid var(--wf-border)', borderRadius: 3, background: 'var(--wf-panel)', color: 'var(--wf-text)', cursor: 'pointer', fontSize: 12 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
