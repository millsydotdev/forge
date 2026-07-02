import React from 'react';
import type { HelminthState, ItemOption } from '../model';
import { gameData } from '../../../data/game-data';

export function HelminthPanel({ helminth, allFrames, onToggle, onDonorChange, onSlotChange }: {
  helminth: HelminthState; allFrames: ItemOption[];
  onToggle: () => void; onDonorChange: (id: string) => void; onSlotChange: (s: number) => void;
}) {
  const donorAbility = helminth.enabled && helminth.donorId
    ? gameData.getHelminthByDonor(helminth.donorId)
    : undefined;

  return (
    <div className="loadout-section helminth-panel-section">
      <div className="section-topline">
        <span>Helminth</span>
        <label className="helminth-toggle">
          <input type="checkbox" checked={helminth.enabled} onChange={onToggle} />
          <span>{helminth.enabled ? 'On' : 'Off'}</span>
        </label>
      </div>
      {helminth.enabled && (
        <div className="helminth-controls">
          <div className="helminth-row">
            <span className="helminth-label">Donor</span>
            <select className="dex-select" value={helminth.donorId} onChange={e => onDonorChange(e.target.value)}>
              <option value="">Select donor...</option>
              {allFrames.map(f => {
                const hasAbility = gameData.getHelminthByDonor(f.uniqueName);
                return (
                  <option key={f.uniqueName} value={f.uniqueName}>
                    {f.name}{hasAbility ? ` (${hasAbility.abilityName})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          {donorAbility && (
            <div className="helminth-row">
              <span className="helminth-label">Ability</span>
              <span className="helminth-ability-name">
                {donorAbility.abilityName}
                {donorAbility.baseDamage > 0 && ` (${donorAbility.baseDamage} ${donorAbility.damageType})`}
              </span>
            </div>
          )}
          <div className="helminth-row">
            <span className="helminth-label">Replace Slot</span>
            <div className="helminth-slot-select">
              {[1, 2, 3, 4].map(i => (
                <button key={i}
                  className={'helminth-slot-btn' + (helminth.slotIndex === i - 1 ? ' active' : '')}
                  onClick={() => onSlotChange(i - 1)}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
