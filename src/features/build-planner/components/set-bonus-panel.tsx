import React from 'react';
import type { SetBonusInfo } from '../../../engine/stat-processor';

export function SetBonusPanel({ setBonuses }: { setBonuses: SetBonusInfo[] | undefined }) {
  if (!setBonuses || setBonuses.length === 0) return null;

  return (
    <section className="loadout-section set-bonus-section">
      <div className="section-topline"><span>Mod Set Bonuses</span></div>
      <div className="set-bonus-list">
        {setBonuses.map(sb => (
          <div key={sb.label} className="set-bonus-item">
            <div className="set-bonus-item-header">
              <span className="set-bonus-item-label">{sb.label}</span>
              <span className="set-bonus-item-count" style={{ color: sb.count >= sb.maxPieces ? '#4ad94a' : '#d6a43e' }}>{sb.count}/{sb.maxPieces}</span>
            </div>
            <div className="set-bonus-item-desc">
              {sb.activeBonus.replace(/<[^>]+>/g, '').trim()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
