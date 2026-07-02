import React from 'react';
import { gameData } from '../../../data/game-data';

export interface BuffsState {
  focusSchool: 'none' | 'madurai' | 'zenurik' | 'naramon' | 'unairu' | 'vazarin';
  roarBuff: boolean;
  eclipseBuff: boolean;
  warcryBuff: boolean;
  xatasWhisper: boolean;
  vexArmor: boolean;
}

export const DEFAULT_BUFFS: BuffsState = {
  focusSchool: 'none',
  roarBuff: false,
  eclipseBuff: false,
  warcryBuff: false,
  xatasWhisper: false,
  vexArmor: false,
};

const FOCUS_SCHOOLS = [
  { value: 'none', label: 'None' },
  ...gameData.focusSchools.map(fs => {
    const desc = fs.passives.map(p => p.description).join(', ');
    return { value: fs.value, label: `${fs.label} (${desc})` };
  }),
];

const SQUAD_BUFFS: { key: 'roarBuff' | 'eclipseBuff' | 'warcryBuff' | 'xatasWhisper' | 'vexArmor'; label: string }[] = [
  { key: 'roarBuff', label: gameData.squadBuffs.find(b => b.name === 'Roar')?.description ?? 'Roar' },
  { key: 'eclipseBuff', label: gameData.squadBuffs.find(b => b.name === 'Eclipse')?.description ?? 'Eclipse' },
  { key: 'warcryBuff', label: gameData.squadBuffs.find(b => b.name === 'Warcry')?.description ?? 'Warcry' },
  { key: 'xatasWhisper', label: gameData.squadBuffs.find(b => b.name === "Xata's Whisper")?.description ?? "Xata's Whisper" },
  { key: 'vexArmor', label: gameData.squadBuffs.find(b => b.name === 'Vex Armor')?.description ?? 'Vex Armor' },
];

export function BuffsPanel({ buffs, onChange }: {
  buffs: BuffsState;
  onChange: (b: BuffsState) => void;
}) {
  return (
    <div className="loadout-section buffs-panel-section">
      <div className="section-topline"><span>Active Buffs</span><small>external modifiers</small></div>
      <div className="buffs-content">
        <div>
          <label className="buffs-label">Focus School</label>
          <select className="dex-select buffs-select" value={buffs.focusSchool}
            onChange={e => onChange({ ...buffs, focusSchool: e.target.value as BuffsState['focusSchool'] })}>
            {FOCUS_SCHOOLS.map(fs => (
              <option key={fs.value} value={fs.value}>{fs.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="buffs-label">Squad Buffs</label>
          <div className="buffs-grid">
            {SQUAD_BUFFS.map(b => (
              <label key={b.key} className="buffs-checkbox-label">
                <input type="checkbox" checked={buffs[b.key] ?? false} onChange={e => onChange({ ...buffs, [b.key]: e.target.checked })} className="buffs-checkbox" />
                {b.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
