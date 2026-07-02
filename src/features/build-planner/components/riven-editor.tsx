import React, { useMemo, useState } from 'react';
import { Polarity } from '../../../engine/build-core';
import { POLARITY_SYMBOL } from '../../../engine/polarity';

const RANGED_POSITIVE_STATS = [
  'Damage', 'Multishot', 'Critical Chance', 'Critical Damage',
  'Fire Rate', 'Status Chance', 'Status Duration',
  'Heat', 'Cold', 'Electricity', 'Toxin',
  'Impact', 'Puncture', 'Slash',
  'Magazine Capacity', 'Reload Speed', 'Max Ammo',
  'Punch Through', 'Projectile Speed', 'Zoom',
  'Damage to Grineer', 'Damage to Corpus', 'Damage to Infested',
];

const MELEE_POSITIVE_STATS = [
  'Melee Damage', 'Critical Chance', 'Critical Damage',
  'Attack Speed', 'Status Chance', 'Status Duration',
  'Heat', 'Cold', 'Electricity', 'Toxin',
  'Impact', 'Puncture', 'Slash',
  'Melee Range', 'Combo Duration', 'Combo Count Chance',
  'Initial Combo', 'Heavy Attack Efficiency', 'Heavy Attack Wind Up Speed',
  'Finisher Damage', 'Slam Attack', 'Slide Attack',
  'Damage to Grineer', 'Damage to Corpus', 'Damage to Infested',
];

const RANGED_NEGATIVE_STATS = [
  'Damage', 'Multishot', 'Critical Chance', 'Critical Damage',
  'Fire Rate', 'Status Chance', 'Magazine Capacity', 'Reload Speed',
  'Heat', 'Cold', 'Electricity', 'Toxin',
  'Impact', 'Puncture', 'Slash',
  'Ammo Maximum', 'Zoom',
  'Damage to Grineer', 'Damage to Corpus', 'Damage to Infested',
];

const MELEE_NEGATIVE_STATS = [
  'Damage', 'Critical Chance', 'Critical Damage',
  'Attack Speed', 'Status Chance',
  'Heat', 'Cold', 'Electricity', 'Toxin',
  'Impact', 'Puncture', 'Slash',
  'Melee Range', 'Combo Duration',
  'Damage to Grineer', 'Damage to Corpus', 'Damage to Infested',
];

const POLARITY_OPTIONS = [
  { value: Polarity.MADURAI, label: 'Madurai (V)', color: '#d6a43e' },
  { value: Polarity.VAZARIN, label: 'Vazarin (D)', color: '#4eb5b5' },
  { value: Polarity.NAIRU, label: 'Nairu (-)', color: '#4ad94a' },
];

export interface RivenData {
  name: string;
  positives: { stat: string; value: number }[];
  negative: { stat: string; value: number } | null;
  polarity: Polarity;
  rank: number;
}

function formatStatValue(stat: string, val: number): string {
  const isPercent = !['Punch Through', 'Magazine Capacity', 'Max Ammo', 'Initial Combo'].includes(stat);
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}${val}${isPercent ? '%' : ''}`;
}

const DEFAULT_VALUES: Record<string, number> = {
  'Damage': 165, 'Multishot': 120, 'Critical Chance': 100, 'Critical Damage': 80,
  'Fire Rate': 60, 'Status Chance': 90, 'Status Duration': 60,
  'Melee Damage': 165, 'Attack Speed': 60,
  'Heat': 90, 'Cold': 90, 'Electricity': 90, 'Toxin': 90,
  'Impact': 120, 'Puncture': 120, 'Slash': 120,
  'Magazine Capacity': 40, 'Reload Speed': 40, 'Max Ammo': 50,
  'Punch Through': 2, 'Projectile Speed': 60, 'Zoom': 40,
  'Melee Range': 50, 'Combo Duration': 50, 'Combo Count Chance': 60,
  'Initial Combo': 20, 'Heavy Attack Efficiency': 40, 'Heavy Attack Wind Up Speed': 40,
  'Finisher Damage': 60, 'Slam Attack': 60, 'Slide Attack': 60,
  'Damage to Grineer': 55, 'Damage to Corpus': 55, 'Damage to Infested': 55,
  'Ammo Maximum': -50,
};

export function RivenEditor({ onSave, onClose, weaponCategory, disposition, mr }: {
  onSave: (riven: RivenData) => void;
  onClose: () => void;
  weaponCategory?: string;
  disposition?: number;
  mr?: number;
}) {
  const isMelee = weaponCategory === 'Melee';
  const positivePool = isMelee ? MELEE_POSITIVE_STATS : RANGED_POSITIVE_STATS;
  const negativePool = isMelee ? MELEE_NEGATIVE_STATS : RANGED_NEGATIVE_STATS;
  const dispMult = disposition ? (disposition / 3) : 1;

  const [name, setName] = useState('');
  const [pos1, setPos1] = useState({ stat: '', value: 0 });
  const [pos2, setPos2] = useState({ stat: '', value: 0 });
  const [pos3, setPos3] = useState({ stat: '', value: 0 });
  const [neg, setNeg] = useState<{ stat: string; value: number } | null>(null);
  const [polarity, setPolarity] = useState<Polarity>(Polarity.MADURAI);
  const [rank, setRank] = useState(0);

  const rivenDrain = (mr ?? 0) + 2 + rank;

  const positives = [pos1, pos2, pos3].filter(p => p.stat);

  const handleStatSelect = (setter: typeof setPos1, prev: typeof pos1, stat: string) => {
    const def = DEFAULT_VALUES[stat] ?? 0;
    setter({ ...prev, stat, value: def });
  };

  const polColor = POLARITY_OPTIONS.find(p => p.value === polarity)?.color ?? '#d6a43e';

  const previewLines = useMemo(() => {
    const lines: { text: string; color: string }[] = [];
    for (const p of positives) {
      if (p.stat) {
        const scaledVal = Math.round(p.value * dispMult * 10) / 10;
        lines.push({ text: formatStatValue(p.stat, scaledVal) + ' ' + p.stat, color: 'var(--wf-text)' });
      }
    }
    if (neg && neg.stat) {
      const scaledVal = Math.round(neg.value * dispMult * 10) / 10;
      lines.push({ text: formatStatValue(neg.stat, scaledVal) + ' ' + neg.stat, color: '#d94b4b' });
    }
    return lines;
  }, [neg, dispMult, positives]);

  function handleSave() {
    if (positives.length < 2) return;
    onSave({
      name: name || 'Custom Riven',
      positives: positives.map(p => ({ stat: p.stat, value: Math.round(p.value * dispMult * 10) / 10 })),
      negative: neg && neg.stat ? { stat: neg.stat, value: Math.round(neg.value * dispMult * 10) / 10 } : null,
      polarity,
      rank,
    });
  }

  function statOpts(used: string[], pool: string[]) {
    return pool.filter(s => !used.includes(s) || s === '').map(s => (
      <option key={s} value={s}>{s}</option>
    ));
  }

  const allUsedPositive = [pos1, pos2, pos3].filter(p => p.stat).map(p => p.stat);
  const negUsed = neg?.stat ? [neg.stat] : [];

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div className="riven-editor" role="dialog" aria-modal="true" aria-label="Custom Riven Mod" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--wf-surface)', border: '1px solid var(--wf-border)', borderRadius: 8, padding: 16, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--elevation-4)' }}>
        <div style={{ fontSize: 14, color: 'var(--wf-gold)', fontFamily: 'var(--font-display)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Custom Riven Mod
        </div>

        {weaponCategory && (
          <div style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 10, fontFamily: 'var(--font-body)' }}>
            Weapon: {weaponCategory} | Disposition: {disposition ?? '—'} ({(dispMult * 100).toFixed(0)}%) | Drain: {rivenDrain}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 10, color: 'var(--wf-text-muted)', display: 'block', marginBottom: 2 }}>Riven Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Custom Riven"
                className="wb-bottom__search" style={{ width: '100%' }} />
            </div>

            <div style={{ fontSize: 10, color: 'var(--wf-teal)', fontFamily: 'var(--font-display)', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>
              Positive Stats (up to 3)
            </div>
            {[pos1, pos2, pos3].map((pos, i) => {
              const setter = [setPos1, setPos2, setPos3][i];
              return (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  <select className="wb-bottom__search" value={pos.stat}
                    onChange={e => handleStatSelect(setter as any, pos, e.target.value)}
                    style={{ flex: 1 }}>
                    <option value="">-- Select --</option>
                    {statOpts(allUsedPositive.filter(s => s !== pos.stat), positivePool)}
                  </select>
                  {pos.stat && (
                    <input type="number" min={1} max={500} value={pos.value}
                      onChange={e => setter({ ...pos, value: +e.target.value })}
                      className="wb-bottom__search" style={{ width: 64, textAlign: 'right' }} />
                  )}
                </div>
              );
            })}

            <div style={{ fontSize: 10, color: 'var(--wf-red)', fontFamily: 'var(--font-display)', letterSpacing: 1, marginTop: 8, marginBottom: 4, textTransform: 'uppercase' }}>
              Negative Stat (optional)
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              <select className="wb-bottom__search" value={neg?.stat ?? ''}
                onChange={e => setNeg(e.target.value ? { stat: e.target.value, value: DEFAULT_VALUES[e.target.value] ?? -50 } : null)}
                style={{ flex: 1 }}>
                <option value="">-- None --</option>
                {statOpts(negUsed, negativePool)}
              </select>
              {neg?.stat && (
                <input type="number" min={-200} max={-1} value={neg.value}
                  onChange={e => setNeg({ ...neg, value: +e.target.value })}
                  className="wb-bottom__search" style={{ width: 64, textAlign: 'right' }} />
              )}
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 4 }}>Polarity</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {POLARITY_OPTIONS.map(po => (
                  <button type="button" key={po.value}
                    onClick={() => setPolarity(po.value)}
                    style={{
                      padding: '2px 8px', fontSize: 11,
                      background: polarity === po.value ? `${po.color}20` : 'transparent',
                      border: `1px solid ${polarity === po.value ? po.color : 'var(--wf-border)'}`,
                      borderRadius: 3, color: polarity === po.value ? po.color : 'var(--wf-text-muted)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}>
                    {po.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 4 }}>Rank</div>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 9 }, (_, i) => (
                  <button key={i} type="button"
                    onClick={() => setRank(i)}
                    style={{
                      width: 24, height: 24, fontSize: 9,
                      background: rank >= i ? 'rgba(200,164,94,0.15)' : 'transparent',
                      border: `1px solid ${rank >= i ? 'var(--wf-gold-dim)' : 'var(--wf-border)'}`,
                      borderRadius: 2, color: rank >= i ? 'var(--wf-gold)' : 'var(--wf-text-muted)',
                      cursor: 'pointer',
                    }}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview card */}
          <div style={{ width: 160, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--wf-text-muted)', marginBottom: 6, textAlign: 'center' }}>Preview</div>
            <div style={{
              border: `1px solid ${polColor}60`, borderRadius: 6,
              background: 'linear-gradient(180deg, rgba(30,20,40,0.9) 0%, rgba(10,5,15,0.95) 100%)',
              boxShadow: `0 2px 12px rgba(0,0,0,0.5), inset 0 0 20px ${polColor}10`,
              padding: 8, fontFamily: 'var(--font-body)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{
                  width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${polColor}`, color: polColor, borderRadius: '50%',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {POLARITY_SYMBOL[polarity]}
                </div>
                <div style={{ color: polColor, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {rivenDrain}
                </div>
              </div>
              <div style={{ color: polColor, fontSize: 11, fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>
                {name || 'Custom Riven'}
              </div>
              <div>
                {previewLines.map((line, i) => (
                  <div key={i} style={{ color: line.color, fontSize: 10, lineHeight: '1.5' }}>{line.text}</div>
                ))}
                {previewLines.length === 0 && (
                  <div style={{ color: 'var(--wf-text-muted)', fontSize: 10, fontStyle: 'italic' }}>No stats configured</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: i <= rank ? polColor : 'rgba(42,32,48,0.8)',
                    border: `1px solid ${i <= rank ? polColor : 'rgba(58,48,64,0.5)'}`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" onClick={onClose}
            style={{ padding: '3px 10px', border: '1px solid var(--wf-border)', borderRadius: 3, background: 'var(--wf-panel)', color: 'var(--wf-text)', cursor: 'pointer', fontSize: 12 }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={positives.length < 2}
            style={{
              padding: '3px 10px', border: '1px solid var(--wf-gold-dim)', borderRadius: 3,
              background: positives.length >= 2 ? 'rgba(200,164,94,0.15)' : 'var(--wf-panel)',
              color: positives.length >= 2 ? 'var(--wf-gold)' : 'var(--wf-text-muted)',
              cursor: positives.length >= 2 ? 'pointer' : 'not-allowed', fontSize: 12,
            }}>
            Add Riven
          </button>
        </div>
        {positives.length < 2 && (
          <div style={{ fontSize: 10, color: 'var(--wf-red)', textAlign: 'center', marginTop: 4 }}>
            Select at least 2 positive stats.
          </div>
        )}
      </div>
    </div>
  );
}
