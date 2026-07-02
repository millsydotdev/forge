import React, { memo } from 'react';
import type { ModSlot } from '../model';
import type { Polarity } from '../../../engine/build-core';
import { POLARITY_COLOR, POLARITY_SYMBOL } from '../../../engine/polarity';
import { calcModCost } from '../model';
import { useModCardImage } from '../hooks/use-mod-card-image';

export const FullModCard = memo(function FullModCard({ mod, slotPol, onRemove, onRankChange, onSlotPolChange }: {
  mod: ModSlot;
  slotPol: Polarity;
  onRemove: () => void;
  onRankChange: (r: number) => void;
  onSlotPolChange?: (p: Polarity) => void;
}) {
  const cost = calcModCost(mod, slotPol);
  const rarity = mod.rarity ?? 'Common';

  const cardSrc = useModCardImage({
    uniqueName: mod.uniqueName,
    displayName: mod.name,
    rarity,
    polarity: mod.polarity.toLowerCase(),
    baseDrain: mod.baseDrain ?? 6,
    fusionLimit: mod.maxRank,
    iconName: mod.imageName,
    compatName: mod.compatName,
    modSet: mod.modSet,
  }, mod.rank, 'expanded');

  return (
    <div className={`mod-card rarity-${rarity}`}
      style={cardSrc ? { backgroundImage: `url(${cardSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      role="group" aria-label={`${mod.name} — ${rarity}, drain ${cost}, rank ${mod.rank}/${mod.maxRank}`}>
      <div className="mod-card-top">
        <div className="mod-card-pol-wrap"
          title={onSlotPolChange ? 'Set slot polarity to match mod' : undefined}
          onClick={onSlotPolChange ? () => onSlotPolChange(mod.polarity) : undefined}
          style={onSlotPolChange ? { cursor: 'pointer' } : undefined}
          role={onSlotPolChange ? 'button' : undefined}
          tabIndex={onSlotPolChange ? 0 : undefined}
          aria-label={onSlotPolChange ? `Set slot polarity to ${mod.polarity}` : undefined}
          onKeyDown={onSlotPolChange ? (e: React.KeyboardEvent) => { if (e.key === 'Enter') onSlotPolChange(mod.polarity); } : undefined}>
          <div className="mod-card-pol" style={{ color: POLARITY_COLOR[slotPol], borderColor: POLARITY_COLOR[slotPol] }}>
            {POLARITY_SYMBOL[slotPol]}
          </div>
        </div>
        <div className="mod-card-drain" aria-label={`Drain: ${cost}`}>{cost}</div>
      </div>
      <div className="mod-card-rank" role="group" aria-label={`Rank ${mod.rank} of ${mod.maxRank}`}>
        {Array.from({ length: mod.maxRank + 1 }, (_, i) => (
          <span key={i} className={`rank-dot${i <= mod.rank ? ' filled' : ''}`} onClick={() => onRankChange(i)}
            role="button" tabIndex={0}
            aria-label={`Set rank ${i}`}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') onRankChange(i); }} />
        ))}
      </div>
      <div className="mod-card-name">{mod.name}</div>
      <button type="button" className="mod-card-del" aria-label={`Remove ${mod.name}`} onClick={onRemove}>×</button>
    </div>
  );
});
