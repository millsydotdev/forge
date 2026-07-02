import React from 'react';
import { AssetImage } from '../../../components/ui/AssetImage';
import type { DetailRecord } from '../util/operator-stats-parser';
import type { OperatorStats } from '../calculators/operator-calc';

export function OpPartPreview({ detail }: { detail: DetailRecord }) {
  return (
    <div className="op-part-preview">
      <AssetImage className="op-part-img" imageName={detail.imageName} />
      <div style={{ fontWeight: 700, marginTop: 4 }}>{detail.name}</div>
      <div style={{ fontSize: 10, color: 'var(--wf-text-dim)' }}>
        {detail.health !== undefined && <div>HP: {detail.health}</div>}
        {detail.shield !== undefined && <div>Shield: {detail.shield}</div>}
        {detail.armor !== undefined && <div>Armor: {detail.armor}</div>}
      </div>
    </div>
  );
}

export function ArcanePreview({ detail }: { detail: DetailRecord }) {
  return (
    <div className="op-part-preview">
      <AssetImage className="op-part-img" imageName={detail.imageName} />
      <div style={{ fontWeight: 700, marginTop: 4 }}>{detail.name}</div>
      <div style={{ fontSize: 10, color: 'var(--wf-text-dim)' }}>
        School: {detail.school ?? '\u2014'}
      </div>
    </div>
  );
}

export function OperatorStatsPanel({ stats }: { stats: OperatorStats }) {
  return (
    <div style={{ marginTop: 24, padding: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--wf-border)' }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Operator Stats</div>
      <div style={{ fontSize: 11, lineHeight: '1.6' }}>
        <div>Health: {stats.health}</div>
        <div>Shield: {stats.shield}</div>
        <div>Armor: {stats.armor}</div>
        <div>Energy: {stats.energy}</div>
        <div>Sprint Speed: {stats.sprintSpeed.toFixed(2)}\u00D7</div>
        <div>Ability Strength: {(stats.abilityStrength * 100).toFixed(0)}%</div>
        <div>Ability Duration: {(stats.abilityDuration * 100).toFixed(0)}%</div>
        <div>Ability Range: {(stats.abilityRange * 100).toFixed(0)}%</div>
        <div>Ability Efficiency: {(stats.abilityEfficiency * 100).toFixed(0)}%</div>
        <div>Effective HP: {Math.round(stats.effectiveHealth)}</div>
      </div>
    </div>
  );
}
