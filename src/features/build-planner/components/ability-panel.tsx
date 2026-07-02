import React, { useMemo } from 'react';
import type { CalculatedStats } from '../../../engine/stat-processor';
import { estimateAbilityDps } from '../../../engine/ability-dps';
import type { WarframeDetail } from '../model';
import { HELMINTH_ABILITIES } from '../../../engine/ability-dps';
import { gameData } from '../../../data/game-data';
import { AssetImage } from '../../../components/ui/AssetImage';
import { RichTooltip } from '../../../components/ui/RichTooltip';
import { buildPresentationModel } from '../../../components/ui/PresentationModel';
import type { HelminthState } from '../model';

const ABILITY_KEYS = ['strength', 'duration', 'range', 'efficiency'] as const;
const ABILITY_COLORS: Record<string, string> = {
  strength: 'var(--wf-red-ui)',
  duration: 'var(--wf-teal-ui)',
  range: 'var(--wf-green-ui)',
  efficiency: 'var(--wf-gold-accent)',
};
const DMG_TYPE_COLORS: Record<string, string> = {
  Slash: 'var(--wf-red-ui)', Heat: 'var(--wf-orange)', Toxin: 'var(--wf-green)', Electric: 'var(--wf-gold)',
  Cold: 'var(--wf-blue)', Blast: 'var(--wf-orange)', Radiation: 'var(--wf-green)', Viral: 'var(--wf-purple)',
  Corrosive: 'var(--wf-green)', Gas: 'var(--wf-green)', Magnetic: 'var(--wf-blue)', Void: 'var(--wf-gold)',
  True: 'var(--wf-red)', Buff: 'var(--wf-gray-muted)', CC: 'var(--wf-gray-muted)', Utility: 'var(--wf-gray-muted)',
  Shield: 'var(--wf-blue)',
};

const HELMINTH_OPTIONS = gameData.helminthAbilities.map(h => ({
  value: h.donorUniqueName,
  label: `${h.donorName} — ${h.abilityName}`,
}));

export function AbilityPanel({ frame, result, helminth, onHelminthChange }: {
  frame: WarframeDetail | null;
  result: CalculatedStats | null;
  helminth?: HelminthState;
  onHelminthChange?: (h: HelminthState) => void;
}) {
  const abilities = useMemo(() => frame?.abilities?.slice(0, 4) ?? [], [frame]);

  const abilityStats = useMemo(() => result ? {
    strength: result.strength,
    duration: result.duration,
    range: result.range,
    efficiency: result.efficiency,
  } : null, [result]);

  const abilityDpsResults = useMemo(() => {
    if (!abilityStats) return [];
    return abilities.map((a, i) => {
      const isHelminth = helminth?.enabled && helminth.slotIndex === i;
      const name = isHelminth
        ? (HELMINTH_ABILITIES[helminth?.donorId ?? '']?.abilityName ?? a.name)
        : a.name;
      const dps = estimateAbilityDps(name, abilityStats.strength, abilityStats.duration,
        abilityStats.efficiency, abilityStats.range);
      return {
        originalName: a.name,
        displayName: name,
        slotIndex: i,
        isHelminth: !!isHelminth,
        dps,
        helminthDonor: isHelminth ? helminth?.donorId : undefined,
      };
    });
  }, [abilities, abilityStats, helminth]);

  const abilityModels = useMemo(() =>
    abilities.map(a => buildPresentationModel({ ...a, description: a.description || 'No description available.' }, 'warframe')),
    [abilities],
  );

  const totalAbilityDps = useMemo(() =>
    abilityDpsResults.reduce((sum, a) => sum + (a.dps?.dps ?? 0), 0),
    [abilityDpsResults]);

  return (
    <div className="ability-panel">
      <div className="section-topline">
        <span>Abilities</span>
        {result && (
            <div className="ability-header-stats">
            {ABILITY_KEYS.map(k => (
              <span key={k} style={{ color: ABILITY_COLORS[k] }}>
                {k === 'strength' ? 'STR' : k === 'duration' ? 'DUR' : k === 'range' ? 'RNG' : 'EFF'} {Math.round((result?.[k] ?? 1) * 100)}%
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="ability-grid">
        {abilities.length > 0 ? abilities.map((ability, index) => {
          const info = abilityDpsResults[index];
          const isHelminth = info?.isHelminth;
          const dpsInfo = info?.dps;
          const mt = abilityModels[index];
          return (
            <RichTooltip key={ability.uniqueName ?? ability.name} tooltip={mt?.tooltip}>
            <div className={`ability-card${isHelminth ? ' helminth-subsumed' : ''}`}>
              <AssetImage className="ability-icon" imageName={ability.imageName} />
                <div className="ability-card-body">
                <div className="ability-card-header">
                  <span className="ability-num">{index + 1}</span>
                  <strong style={{ fontSize: 11, color: isHelminth ? 'var(--wf-green)' : 'var(--wf-gray-light)' }}>
                    {info?.displayName ?? ability.name}
                  </strong>
                  {isHelminth && <span className="ability-helminth-badge">HELMINTH</span>}
                </div>
                <p className="ability-description">
                  {ability.description || ''}
                </p>
                {dpsInfo && (
                    <div className="ability-dps-row">
                    <span style={{ color: DMG_TYPE_COLORS[dpsInfo.damageType] ?? 'var(--wf-gold-accent)' }}>
                      {dpsInfo.damagePerCast.toLocaleString()} {dpsInfo.damageType}
                    </span>
                    <span style={{ color: 'var(--wf-red-ui)' }}>
                      {dpsInfo.dps.toLocaleString()} dps
                    </span>
                    {dpsInfo.cost > 0 && <span style={{ color: 'var(--wf-purple)' }}>{dpsInfo.cost} energy</span>}
                    {dpsInfo.range > 0 && <span style={{ color: 'var(--wf-green-ui)' }}>{dpsInfo.range.toFixed(1)}m</span>}
                  </div>
                )}
              </div>
              {/* Helminth replacement button */}
              {onHelminthChange && !isHelminth && (
                <button className="ability-helminth-btn" title="Subsume Helminth ability"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHelminthChange({ enabled: true, slotIndex: index, donorId: HELMINTH_OPTIONS[0]?.value ?? '' });
                  }}
>
                  ⊕
                </button>
              )}
              {isHelminth && onHelminthChange && (
                <select className="dex-select ability-helminth-select"
                  value={helminth?.donorId ?? ''}
                  onChange={e => onHelminthChange({ enabled: true, slotIndex: index, donorId: e.target.value })}
                  onClick={e => e.stopPropagation()}>
                  {HELMINTH_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>
            </RichTooltip>
          );
        }) : [1, 2, 3, 4].map(index => (
          <div key={index} className="ability-card empty-ability">
            <div className="ability-icon placeholder-icon">{index}</div>
            <div><strong>Ability {index}</strong><p>Select a Warframe.</p></div>
          </div>
        ))}
      </div>
      {totalAbilityDps > 0 && (
        <div className="ability-total-dps">
          <span style={{ color: 'var(--wf-red-ui)', fontWeight: 600 }}>Ability DPS</span>
          <span style={{ color: 'var(--wf-red)', fontWeight: 700 }}>{totalAbilityDps.toLocaleString()}</span>
        </div>
      )}
      {frame?.passiveDescription && (
        <div className="passive-row">
          <span>Passive</span>{frame.passiveDescription}
        </div>
      )}
    </div>
  );
}
