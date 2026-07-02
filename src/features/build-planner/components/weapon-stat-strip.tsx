import React from 'react';
import type { WeaponStats } from '../../../engine/stat-processor';
import { visualManager } from '../../../services/visual-manager';

export function WeaponStatStrip({ stats, title, weaponImage }: { stats?: WeaponStats; title?: string; weaponImage?: string }) {
  if (!stats) return <div className="weapon-stat-strip muted">{title ? `No ${title} selected` : 'No weapon selected'}</div>;
  return (
    <div className="weapon-stat-strip">
      {/* Weapon image */}
      {weaponImage && (
        <div className="weapon-image weapon-image-wrap">
           <img src={visualManager.getImageUrl(weaponImage)} alt="" className="weapon-image-img" draggable={false} />
        </div>
      )}
      <div title="Burst DPS"><span>DPS</span><strong className="dps-value">{Math.round(stats.avgDps).toLocaleString()}</strong></div>
      <div title="Average damage per shot"><span>Shot</span><strong>{Math.round(stats.avgShotDamage).toLocaleString()}</strong></div>
      <div title="Total damage per shot"><span>Damage</span><strong>{Math.round(stats.totalDamage).toLocaleString()}</strong></div>
      <div title="Critical Chance"><span>Crit</span><strong className="crit-value">{(stats.critChance * 100).toFixed(0)}%</strong></div>
      <div title="Multishot"><span>Multi</span><strong>{stats.multishot.toFixed(2)}x</strong></div>
      {stats.dot?.totalDotDps > 0 && (
        <div title="Damage over Time DPS"><span>DoT</span><strong className="dot-value">{Math.round(stats.dot.totalDotDps).toLocaleString()}</strong></div>
      )}
    </div>
  );
}