import React, { useMemo } from 'react';
import type { CenterSurfaceProps } from './surface-props';
import { CapacityBar } from '../capacity-bar';
import { ModGrid } from '../mod-grid';
import { RichTooltip } from '../../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../../components/ui/PresentationModel';
import { COMPANION_HAS_WEAPON, matchesCompType } from '../../model';
import type { Polarity } from '../../../../engine/build-core';

function CompanionMods({ comp, setComp, allMods, placeModAtSlot }: CenterSurfaceProps) {
  return (
    <div className="workspace-body">
      <ModGrid mods={comp.mods} slotPols={comp.slotPolarities.slice(0, 8)} label="Companion Mods"
        onRemove={i => setComp(p => ({ ...p, mods: p.mods.filter((_, j) => j !== i) }))}
        onRankChange={(i, r) => setComp(p => ({ ...p, mods: p.mods.map((m, j) => j === i ? { ...m, rank: r } : m) }))}
        onSlotPolChange={(i, p) => setComp(prev => ({ ...prev, slotPolarities: prev.slotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[] }))}
        onEmptyClick={(i, m) => placeModAtSlot('companion', i, m)}
        allMods={allMods} maxSize={8} />
    </div>
  );
}

export function CompanionSurface({ comp, setComp, companions, companionWeapons, result, compCapacity, allMods, placeModAtSlot, primerSlot, setPrimerSlot }: CenterSurfaceProps) {
  const companionData = useMemo(() => comp.id ? companions.find(c => c.uniqueName === comp.id) ?? null : null, [comp.id, companions]);
  const companionModel = useMemo(() => companionData ? buildPresentationModel(companionData, 'companion') : null, [companionData]);
  return (
    <>
      <div className="workspace-header">
        <RichTooltip tooltip={companionModel?.tooltip ?? { title: 'No Companion', subtitle: 'Select a companion from the dropdown', sections: [] }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wf-text)' }}>
            {companionData?.name || 'Companion'}
          </span>
        </RichTooltip>
        <div className="workspace-header-actions">
          {compCapacity && <CapacityBar cap={compCapacity} />}
        </div>
      </div>
      <div className="workspace-body">
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <select className="select" value={comp.compType}
            onChange={e => setComp(p => ({ ...p, compType: e.target.value, id: '', weaponId: '' }))}>
            {['sentinel', 'beast', 'moa', 'hound', 'predasite', 'vulpaphyla'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="select" style={{ flex: 1 }} value={comp.id}
            onChange={e => setComp(p => ({ ...p, id: e.target.value }))}>
            <option value="">None</option>
            {companions.filter(c => matchesCompType(c.name, comp.compType)).map(c => <option key={c.uniqueName} value={c.uniqueName}>{c.name}</option>)}
          </select>
        </div>

        {result?.companion && comp.id && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, marginBottom: 6 }}>
            {[
              { label: 'Health', value: Math.round(result.companion.health).toLocaleString(), color: 'var(--wf-teal-ui)' },
              { label: 'Shields', value: Math.round(result.companion.shields).toLocaleString(), color: 'var(--wf-blue)' },
              { label: 'Armor', value: Math.round(result.companion.armor).toLocaleString(), color: 'var(--wf-gold-accent)' },
              { label: 'EHP', value: Math.round(result.companion.ehp).toLocaleString(), color: 'var(--wf-red-ui)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.06)', padding: 4, borderRadius: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--wf-text-muted)' }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        <CompanionMods
          activeSlot="companion"
          wf={{ id:'', aura:null, exilus:null, mods:[], arcanes:[null,null], shards:[], slotPolarities:[], exaltedWeapon:null }}
          setWf={() => {}}
          weaponStates={{}}
          setWeaponStates={() => {}}
          warframes={[]}
          weapons={{}}
          companions={[]}
          companionWeapons={[]}
          comp={comp}
          setComp={setComp}
          result={null}
          wfCapacity={null}
          weaponCapFor={() => null}
          compCapacity={null}
          primerSlot={null}
          setPrimerSlot={() => {}}
          allMods={allMods}
          placeModAtSlot={placeModAtSlot}
          onAddRiven={() => {}}
          exaltedDef={undefined}
          panelStates={{}}
          setPanelStates={() => {}}
        />

        {COMPANION_HAS_WEAPON.has(comp.compType) && (
          <div style={{ marginTop: 8 }}>
            <div className="workspace-header" style={{ borderTop: '1px solid rgba(200,164,94,0.08)', margin: '0 -8px', borderRadius: 0 }}>
              <span>Companion Weapon</span>
              <div className="workspace-header-actions">
                {comp.weaponId && (
                  <button
                    className={'primer-toggle' + (primerSlot === 'companion_weapon' ? ' active' : '')}
                    onClick={() => setPrimerSlot(primerSlot === 'companion_weapon' ? null : 'companion_weapon')}
                  >
                    Primer
                  </button>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <select className="select" style={{ width: '100%' }} value={comp.weaponId}
                onChange={e => setComp(p => ({ ...p, weaponId: e.target.value }))}>
                <option value="">None</option>
                {companionWeapons.map(w => <option key={w.uniqueName} value={w.uniqueName}>{w.name}</option>)}
              </select>
            </div>
            {comp.weaponId && (
              <ModGrid mods={comp.weaponMods} slotPols={comp.weaponSlotPolarities.slice(0, 8)} label="Companion Weapon Mods"
                onRemove={i => setComp(p => ({ ...p, weaponMods: p.weaponMods.filter((_, j) => j !== i) }))}
                onRankChange={(i, r) => setComp(p => ({ ...p, weaponMods: p.weaponMods.map((m, j) => j === i ? { ...m, rank: r } : m) }))}
                onSlotPolChange={(i, p) => setComp(prev => ({ ...prev, weaponSlotPolarities: prev.weaponSlotPolarities.map((sp, j) => j === i ? p : sp) as Polarity[] }))}
                onEmptyClick={(i, m) => placeModAtSlot('companion_weapon', i, m)}
                allMods={allMods} maxSize={8} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
