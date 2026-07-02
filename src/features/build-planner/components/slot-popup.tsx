import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { parsePolarity, POLARITY_COLOR, POLARITY_SYMBOL } from '../../../engine/polarity';
import type { ItemOption } from '../model';
import { AssetImage } from '../../../components/ui/AssetImage';

export function SlotPopup({ allMods, onSelect, onClose }: { allMods: ItemOption[]; onSelect: (m: ItemOption) => void; onClose: () => void }) {
  const [sq, setSq] = useState('');
  const [cat, setCat] = useState('All');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = useMemo(() => {
    let list = allMods;
    if (cat !== 'All') {
      const cLower = cat.toLowerCase();
      list = list.filter(m => (m.type ?? '').toLowerCase().includes(cLower) || m.category.toLowerCase().includes(cLower));
    }
    if (sq.trim()) {
      const q = sq.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    return list.slice(0, 48);
  }, [allMods, sq, cat]);

  return ReactDOM.createPortal(
    <div className="slot-popup-overlay">
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Select mod" className="slot-popup-dialog">
        <div className="slot-popup-header">
          <div className="slot-popup-title">Select Mod Card</div>
          <button type="button" onClick={onClose} aria-label="Close" className="slot-popup-close">×</button>
        </div>
        <div className="slot-popup-filters">
          <input value={sq} onChange={e => setSq(e.target.value)} placeholder="Type mod name..." autoFocus
                 className="slot-popup-search" />
          {['All', 'Warframe', 'Primary', 'Shotgun', 'Secondary', 'Melee', 'Stance', 'Companion'].map(tab => (
            <button type="button" key={tab} onClick={() => setCat(tab)}
                    className={'palette-tab' + (cat === tab ? ' active' : '')}>
              {tab}
            </button>
          ))}
        </div>
        <div className="slot-popup-content">
          {filtered.length === 0 ? (
            <div className="empty-state">No matching mods found</div>
          ) : (
            <div className="slot-popup-grid">
              {filtered.map(m => {
                const rarity = m.rarity ?? 'Common';
                const polarity = parsePolarity(m.polarity ?? 'universal');
                const drain = m.baseDrain ?? 6;
                return (
                  <div key={m.uniqueName} role="button" tabIndex={0} onClick={() => { onSelect(m); onClose(); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(m); onClose(); } }} className={'mod-card rarity-' + rarity + ' slot-popup-card'}>
                    <AssetImage className="mod-card-art" imageName={m.imageName} />
                    {m.imageName && <div className="mod-card-art-bg" />}
                    <div className="mod-card-top">
                      <div className="mod-card-pol" style={{ color: POLARITY_COLOR[polarity], borderColor: POLARITY_COLOR[polarity] }}>
                        {POLARITY_SYMBOL[polarity]}
                      </div>
                      <div className="mod-card-drain">{drain}</div>
                    </div>
                    <div className="slot-popup-spacer" />
                    <div className="mod-card-name slot-popup-name">{m.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
