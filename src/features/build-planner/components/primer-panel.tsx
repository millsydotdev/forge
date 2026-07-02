import React from 'react';
import type { WeaponStats } from '../../../engine/stat-processor';
import { countUniqueStatusTypes, SLOT_LABEL } from '../model';

export interface PrimerCandidate {
  slot: string;
  label: string;
  weaponName: string;
}

export function PrimerPanel({
  primerSlot, primerStats, candidates, onSetPrimer,
}: {
  primerSlot: string | null;
  primerStats?: WeaponStats;
  candidates: PrimerCandidate[];
  onSetPrimer: (slot: string | null) => void;
}) {
  const enabled = primerSlot !== null;

  const statusTypes = countUniqueStatusTypes(primerStats);
  const coMult = 1 + statusTypes * 0.8;
  const gsMult = 1 + statusTypes * 0.4;
  const statusPerSec = primerStats ? primerStats.statusChance * primerStats.fireRate * primerStats.multishot : 0;
  const primerScore = Math.round(statusPerSec * statusTypes * (primerStats?.multishot ?? 1));
  const hasViral = (primerStats?.damagePerType?.viral ?? 0) > 0;

  return (
    <div className="primer-panel">
      <div className="section-topline">
        <label className="primer-toggle-label" style={{ color: enabled ? '#4ad94a' : 'var(--wf-gray-light)' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => onSetPrimer(e.target.checked ? (candidates[0]?.slot ?? null) : null)}
            className="primer-checkbox"
          />
          <span>Primer / Status</span>
        </label>
      </div>

      {enabled && (
        <div className="primer-content">
          {candidates.length === 0 ? (
            <div className="primer-message">Equip a weapon first to pick a primer.</div>
          ) : (
            <div className="primer-column">
              <label className="primer-label">Primer weapon</label>
              <select
                className="dex-select primer-select"
                value={primerSlot ?? ''}
                onChange={e => onSetPrimer(e.target.value || null)}
              >
                {candidates.map(c => (
                  <option key={c.slot} value={c.slot}>
                    {c.label}{c.weaponName ? ` — ${c.weaponName}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {primerSlot && primerStats ? (
            <div className="primer-grid">
              <div><span>Status types</span><strong>{statusTypes}</strong></div>
              <div><span>Status/sec</span><strong>{statusPerSec.toFixed(1)}</strong></div>
              <div><span>Primer score</span><strong className="primer-score">{primerScore.toLocaleString()}</strong></div>
              <div><span>CO / melee</span><strong>{coMult.toFixed(1)}x</strong></div>
              <div><span>Galv. Shot</span><strong>{gsMult.toFixed(1)}x</strong></div>
              {hasViral && <div><span>Viral bonus</span><strong className="primer-viral">+100% DoT</strong></div>}
            </div>
          ) : (
            primerSlot && <div className="primer-message">No stats yet for {SLOT_LABEL[primerSlot as keyof typeof SLOT_LABEL] ?? primerSlot}.</div>
          )}
        </div>
      )}

      {!enabled && (
        <div className="primer-empty-state">
          Tick the box to mark a weapon as primer and track status scaling.
        </div>
      )}
    </div>
  );
}
