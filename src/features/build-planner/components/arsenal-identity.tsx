import React from 'react';
import { SLOT_LABEL } from '../model';
import type { CompanionState, ItemOption, WarframeDetail, WeaponState } from '../model';
import { AssetImage } from '../../../components/ui/AssetImage';

export function ArsenalIdentity({ frame, activeSlot, weapons, comp, warframes, onSelectFrame }: {
  frame: WarframeDetail | null;
  activeSlot: string;
  weapons: Record<string, WeaponState>;
  comp: CompanionState;
  warframes: ItemOption[];
  onSelectFrame: (id: string) => void;
}) {
  const selectedWeapon = activeSlot !== 'warframe' && activeSlot !== 'companion' ? weapons[activeSlot]?.id : '';
  return (
    <div className="arsenal-identity">
      <div className="identity-art-wrap" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => {
        const sel = document.getElementById('warframe-selector') as HTMLSelectElement;
        if (sel) { sel.focus(); sel.click(); }
      }}>
        <AssetImage className="identity-art" imageName={frame?.imageName} />
        {!frame?.imageName && <div className="identity-sigil">TD</div>}
        <select id="warframe-selector" className="identity-frame-select"
          value={frame?.uniqueName ?? ''}
          onChange={e => { if (e.target.value) onSelectFrame(e.target.value); }}
          onClick={e => e.stopPropagation()}>
          <option value="">— Select Warframe —</option>
          {warframes.map(w => <option key={w.uniqueName} value={w.uniqueName}>{w.name}</option>)}
        </select>
      </div>
      <div className="identity-copy">
        <span className="identity-kicker">Arsenal Build</span>
        <strong>{frame?.name ?? 'Select Warframe'}</strong>
        <span>{frame?.description ?? 'Configure the complete loadout.'}</span>
      </div>
      <div className="identity-loadout">
        <span>{weapons.primary.id ? 'Primary set' : 'Primary empty'}</span>
        <span>{weapons.secondary.id ? 'Secondary set' : 'Secondary empty'}</span>
        <span>{weapons.melee.id ? 'Melee set' : 'Melee empty'}</span>
        <span>{comp.id ? 'Companion set' : 'Companion empty'}</span>
        {selectedWeapon && <span className="active-pill">Editing {SLOT_LABEL[activeSlot as keyof typeof SLOT_LABEL]}</span>}
      </div>
    </div>
  );
}
