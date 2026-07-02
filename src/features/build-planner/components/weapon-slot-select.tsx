import React from 'react';
import type { ItemOption } from '../model';

export function WeaponSlotSelect({ slots, current, onChange, label }: {
  slots: ItemOption[]; current: string; onChange: (id: string) => void; label: string;
}) {
  return (
    <div className="canvas-header">
      <span className="slot-label">{label}</span>
      <select className="dex-select" value={current} onChange={e => onChange(e.target.value)}>
        <option value="">— None —</option>
        {slots.map(w => <option key={w.uniqueName} value={w.uniqueName}>{w.name}</option>)}
      </select>
    </div>
  );
}
