import React from 'react';
import type { ItemOption } from '../model';

export function AccountInventoryPanel({ allMods, ownedModIds, loadoutCount, equippedCount, playerName }: {
  allMods: ItemOption[];
  ownedModIds: Set<string> | null;
  loadoutCount: number;
  equippedCount: number;
  playerName?: string | null;
}) {
  const ownedCount = ownedModIds ? ownedModIds.size : allMods.length;
  const missingCount = Math.max(0, allMods.length - ownedCount);
  return (
    <div className="account-panel">
      <div className="section-topline"><span>Inventory</span>{playerName && <span style={{ opacity: 0.6, fontSize: 11 }}>{playerName}</span>}</div>
      <div className="account-grid">
        <div><span>Tracked mods</span><strong>{ownedCount.toLocaleString()}</strong></div>
        <div><span>Missing</span><strong>{missingCount.toLocaleString()}</strong></div>
        <div><span>Equipped</span><strong>{equippedCount}</strong></div>
        <div><span>Builds</span><strong>{loadoutCount}</strong></div>
      </div>
      <div className="inventory-note">{ownedModIds ? (playerName ? `Linked — ${playerName}` : 'Inventory linked') : 'Full library'}</div>
    </div>
  );
}
