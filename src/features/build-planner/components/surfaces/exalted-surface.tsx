import React from 'react';
import type { CenterSurfaceProps } from './surface-props';
import { ModGrid } from '../mod-grid';
import type { Polarity } from '../../../../engine/build-core';

export function ExaltedSurface({ weaponStates, setWeaponStates, result, allMods, placeModAtSlot, primerSlot, setPrimerSlot, exaltedDef }: CenterSurfaceProps) {
  if (!exaltedDef) return null;

  const ws = weaponStates['exalted_weapon'] ?? { id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(8).fill('UNIVERSAL' as Polarity) };
  const ewStats = result?.weapons?.exalted_weapon;

  return (
    <>
      <div className="workspace-header">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wf-text)' }}>
          {exaltedDef.name}
        </span>
        <div className="workspace-header-actions">
          <span className="incarnon-badge" style={{ borderColor: 'var(--wf-purple)', color: 'var(--wf-purple)' }}>Exalted</span>
          <button
            className={'primer-toggle' + (primerSlot === 'exalted_weapon' ? ' active' : '')}
            onClick={() => setPrimerSlot(primerSlot === 'exalted_weapon' ? null : 'exalted_weapon')}
          >
            Primer
          </button>
        </div>
      </div>
      <div className="workspace-body">
        {ewStats && (
          <div className="weapon-strip">
            <div><span>DPS</span><strong>{Math.round(ewStats.burstDps ?? 0).toLocaleString()}</strong></div>
            <div><span>Fire Rate</span><strong>{(ewStats.fireRate ?? 0).toFixed(1)}</strong></div>
            <div><span>Mag</span><strong>{ewStats.magazine ?? '—'}</strong></div>
            <div><span>Reload</span><strong>{(ewStats.reloadSpeed ?? 0).toFixed(1)}s</strong></div>
            <div><span>Status</span><strong>{((ewStats.statusChance ?? 0) * 100).toFixed(0)}%</strong></div>
          </div>
        )}
        <ModGrid mods={ws.mods} slotPols={ws.slotPolarities.slice(0, 8)} label={`${exaltedDef.name} Mods`}
          onRemove={i => setWeaponStates(p => {
            const existing = p['exalted_weapon'] ?? { id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(8).fill('UNIVERSAL' as Polarity) };
            return { ...p, exalted_weapon: { ...existing, mods: existing.mods.filter((_, j) => j !== i) } };
          })}
          onRankChange={(i, r) => setWeaponStates(p => {
            const existing = p['exalted_weapon'] ?? { id: '', mods: [], exilus: null, arcanes: [null, null], slotPolarities: Array(8).fill('UNIVERSAL' as Polarity) };
            return { ...p, exalted_weapon: { ...existing, mods: existing.mods.map((m, j) => j === i ? { ...m, rank: r } : m) } };
          })}
          onEmptyClick={(i, m) => placeModAtSlot('exalted_weapon', i, m)}
          allMods={allMods} maxSize={8} />
      </div>
    </>
  );
}
