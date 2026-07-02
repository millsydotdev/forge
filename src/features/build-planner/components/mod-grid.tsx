import React, { memo, useState } from 'react';
import type { Polarity } from '../../../engine/build-core';
import { POLARITY_COLOR, POLARITY_SYMBOL } from '../../../engine/polarity';
import { DEFAULT_POLARITY } from '../model';
import type { ItemOption, ModSlot } from '../model';
import { FullModCard } from './full-mod-card';
import { SlotPopup } from './slot-popup';

export const ModGrid = memo(function ModGrid({ mods, slotPols, onRemove, onRankChange, onSlotPolChange, onEmptyClick, maxSize, label, allMods }: {
  mods: ModSlot[]; slotPols: Polarity[]; onRemove: (i: number) => void;
  onRankChange: (i: number, r: number) => void; onSlotPolChange?: (i: number, p: Polarity) => void;
  onEmptyClick?: (i: number, m: ItemOption) => void; maxSize: number; label?: string; allMods?: ItemOption[];
}) {
  const [searchSlot, setSearchSlot] = useState<number | null>(null);
  const slots = Array.from({ length: maxSize }, (_, i) => i);
  return (
    <>
      {label && <div className="section-label">{label}</div>}
      <div className="mod-grid">
        {slots.map(i => {
          if (i < mods.length) {
            const m = mods[i];
            return <FullModCard key={m.uniqueName + i} mod={m} slotPol={slotPols[i] ?? DEFAULT_POLARITY}
                     onRemove={() => onRemove(i)} onRankChange={r => onRankChange(i, r)}
                     onSlotPolChange={onSlotPolChange ? (p => onSlotPolChange(i, p)) : undefined} />;
          }
          return (
            <div key={'e-' + i} className="mod-card empty" onClick={() => setSearchSlot(searchSlot === i ? null : i)}>
               <div className="mod-card-empty-content">
                 <div className="mod-card-pol slot-pol" style={{ color: POLARITY_COLOR[slotPols[i] ?? DEFAULT_POLARITY], borderColor: POLARITY_COLOR[slotPols[i] ?? DEFAULT_POLARITY] }}>
                  {POLARITY_SYMBOL[slotPols[i] ?? DEFAULT_POLARITY]}
                </div>
                <span className="mod-card-plus">+</span>
              </div>
              {searchSlot === i && allMods && (
                <SlotPopup allMods={allMods} onSelect={m => onEmptyClick?.(i, m)} onClose={() => setSearchSlot(null)} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
});
