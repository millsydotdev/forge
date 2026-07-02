import React from 'react';
import type { HelminthState, ItemOption } from '../model';

export function HelminthBadge({ helminth, allFrames, onToggle, onDonorChange, onSlotChange }: {
  helminth: HelminthState; allFrames: ItemOption[];
  onToggle: () => void; onDonorChange: (id: string) => void; onSlotChange: (s: number) => void;
}) {
  return (
    <div className="special-badge helminth-badge-container" style={{ borderColor: helminth.enabled ? '#4eb5b5' : undefined }}>
      <span onClick={onToggle} className="helminth-badge-toggle" style={{ color: helminth.enabled ? '#4eb5b5' : '#505560' }}>
        {helminth.enabled ? '◆ Helminth' : '◇ Helminth'}
      </span>
      {helminth.enabled && (
        <>
          <select value={helminth.donorId} onChange={e => onDonorChange(e.target.value)}
                  className="helminth-badge-select">
            <option value="">Donor…</option>
            {allFrames.map(f => <option key={f.uniqueName} value={f.uniqueName}>{f.name}</option>)}
          </select>
          <select value={helminth.slotIndex} onChange={e => onSlotChange(+e.target.value)}
                  className="helminth-badge-slot-select">
            {[0, 1, 2, 3].map(i => <option key={i} value={i}>{i + 1}</option>)}
          </select>
        </>
      )}
    </div>
  );
}
