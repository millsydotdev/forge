import React, { useState } from 'react';
import { CenterSurface } from '../../features/build-planner/components/center-surface';
import type { BuildPlannerState } from './types';
import { EXALTED_WEAPONS, NAV_CATEGORIES } from '../../features/build-planner/model';
import { Button, Panel } from '../../components/ui';

const CORE_SLOTS = ['warframe', 'primary', 'secondary', 'melee', 'companion'] as const;
const EXTRA_SLOTS = ['arch-gun', 'arch-melee', 'companion_weapon'];

function SlotSwitcher({ activeSlot, onSelect, hasExalted }: {
  activeSlot: string;
  onSelect: (slot: string) => void;
  hasExalted: boolean;
}) {
  const core = NAV_CATEGORIES.filter(c => (CORE_SLOTS as readonly string[]).includes(c.key));
  const extra = NAV_CATEGORIES.filter(c => EXTRA_SLOTS.includes(c.key));
  const exalted = hasExalted ? [{ key: 'exalted_weapon' as string, icon: 'auto_awesome', label: 'Exalted' }] : [];

  const renderSlot = (key: string, icon: string, label: string) => (
    <Button
      key={key}
      variant={activeSlot === key ? 'secondary' : 'ghost'}
      size="sm"
      onClick={() => onSelect(key)}
      title={label}
      style={{ padding: '4px 8px', fontSize: 11, gap: 4 }}
    >
      {label}
    </Button>
  );

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      {core.map(c => renderSlot(c.key, c.icon, c.label))}
      {extra.length > 0 && (
        <div style={{ display: 'flex', gap: 2, marginLeft: 4, paddingLeft: 4, borderLeft: '1px solid var(--wf-border)' }}>
          {extra.map(c => renderSlot(c.key, c.icon, c.label))}
        </div>
      )}
      {exalted.length > 0 && (
        <div style={{ display: 'flex', gap: 2, marginLeft: 4, paddingLeft: 4, borderLeft: '1px solid var(--wf-border)' }}>
          {exalted.map(s => renderSlot(s.key, s.icon, s.label))}
        </div>
      )}
    </div>
  );
}

export function CenterWorkspace({ state, onAddRiven }: {
  state: BuildPlannerState;
  onAddRiven: () => void;
}) {
  const {
    activeSlot, setActiveSlot,
    wf, setWf, weaponStates, setWeaponStates, comp, setComp,
    warframes, weapons, companions, companionWeapons, allMods,
    result, wfCapacity, weaponCapFor, compCapacity,
    primerSlot, setPrimerSlot, placeModAtSlot,
  } = state;

  const [panelStates, setPanelStates] = useState<Record<string, unknown>>({});

  const exaltedDef = wf.id ? EXALTED_WEAPONS[wf.id] : undefined;
  const hasExalted = !!exaltedDef;

  return (
    <section className="center-workspace" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Panel variant="default" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CenterSurface
          activeSlot={activeSlot}
          wf={wf} setWf={setWf}
          weaponStates={weaponStates} setWeaponStates={setWeaponStates}
          comp={comp} setComp={setComp}
          warframes={warframes} weapons={weapons}
          companions={companions} companionWeapons={companionWeapons}
          allMods={allMods}
          result={result}
          wfCapacity={wfCapacity}
          weaponCapFor={weaponCapFor}
          compCapacity={compCapacity}
          primerSlot={primerSlot}
          setPrimerSlot={setPrimerSlot}
          placeModAtSlot={placeModAtSlot}
          onAddRiven={onAddRiven}
          exaltedDef={exaltedDef ? { name: exaltedDef.name, slot: exaltedDef.slot } : undefined}
          panelStates={panelStates}
          setPanelStates={setPanelStates}
        />
      </Panel>

      {/* Configuration selector bar — replaces OtherSlotsStrip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderTop: '1px solid var(--wf-border)',
        backgroundColor: 'var(--wf-surface)',
      }}>
        <span style={{ fontSize: 10, color: 'var(--wf-text-muted)', fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Slot:
        </span>
        <SlotSwitcher activeSlot={activeSlot} onSelect={setActiveSlot} hasExalted={hasExalted} />
      </div>
    </section>
  );
}
