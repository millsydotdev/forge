import React, { useState } from 'react';
import type { Polarity } from '../../../engine/build-core';
import { POLARITY_COLOR, POLARITY_SYMBOL, polarityMatches } from '../../../engine/polarity';
import { calcModCost } from '../model';
import type { ModSlot } from '../model';
import { useModCardImage } from '../hooks/use-mod-card-image';

const POL_CYCLE: Polarity[] = ['UNIVERSAL', 'MADURAI', 'VAZARIN', 'NAIRU', 'UMBRA', 'PENJAGA'] as Polarity[];
function cyclePolarity(p: Polarity): Polarity {
  const idx = POL_CYCLE.indexOf(p);
  return POL_CYCLE[(idx + 1) % POL_CYCLE.length];
}

export function ModCard({ mod, slotPol, onRemove, onRankChange, onSlotPolChange }: {
  mod: ModSlot; slotPol: Polarity;
  onRemove: () => void;
  onRankChange: (r: number) => void; onSlotPolChange?: (p: Polarity) => void;
}) {
  const cost = calcModCost(mod, slotPol);
  const match = polarityMatches(mod.polarity, slotPol);
  const rarity = mod.rarity ?? 'Common';
  const [showTooltip, setShowTooltip] = useState(false);

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
  }, mod.rank, 'collapsed');

  return (
    <div className={'mod-card rarity-' + rarity + (match ? '' : ' mismatch')}
      style={cardSrc ? { backgroundImage: `url(${cardSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}>
      <div className="mod-card-top">
        <div className="mod-card-pol-wrap" onClick={() => onSlotPolChange && onSlotPolChange(cyclePolarity(slotPol))}>
          <div className="mod-card-pol" style={{ color: POLARITY_COLOR[slotPol], borderColor: POLARITY_COLOR[slotPol] }}>
            {POLARITY_SYMBOL[slotPol]}
          </div>
        </div>
        <div className="mod-card-drain" style={{ color: match ? '#4eb5b5' : '#d94b4b' }}>{cost}</div>
      </div>
      <div className="mod-card-rank">
        {Array.from({ length: mod.maxRank + 1 }, (_, i) => (
          <span key={i} className={'rank-dot' + (i <= mod.rank ? ' filled' : '')} onClick={() => onRankChange(i)} />
        ))}
      </div>
      <div className="mod-card-name">{mod.name}</div>
      <button className="mod-card-del" onClick={onRemove}>×</button>

      {showTooltip && (
        <div className="mod-card-tooltip">
          <div className="mod-card-tooltip-name" style={{ color: '#c8a45e' }}>{mod.name}</div>
          <div className="mod-card-tooltip-row">
            Rarity: <span style={{ color: '#c8a45e' }}>{rarity}</span>
          </div>
          <div className="mod-card-tooltip-row">
            Drain: <span style={{ color: match ? '#4eb5b5' : '#d94b4b' }}>{cost}</span>
            {match ? ' (matched)' : ' (mismatch)'}
          </div>
          <div className="mod-card-tooltip-row">
            Rank: <span style={{ color: '#e8e8e8' }}>{mod.rank}/{mod.maxRank}</span>
          </div>
          <div className="mod-card-tooltip-row">
            Polarity: <span style={{ color: POLARITY_COLOR[mod.polarity] }}>{POLARITY_SYMBOL[mod.polarity]}</span>
          </div>
          <div className="mod-card-tooltip-arrow" />
        </div>
      )}
    </div>
  );
}

export function EmptyModCard({ slotPol, onClick }: { slotPol: Polarity; onClick: () => void }) {
  return (
    <div className="mod-card empty" onClick={onClick}>
      <div className="mod-card-pol slot-pol" style={{ color: POLARITY_COLOR[slotPol], borderColor: POLARITY_COLOR[slotPol] }}>
        {POLARITY_SYMBOL[slotPol]}
      </div>
      <span className="mod-card-plus">+</span>
    </div>
  );
}
