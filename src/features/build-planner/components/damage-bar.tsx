import React from 'react';

export function DamageBar({ label, pct, color, iconUrl }: { label: string; pct: number; color: string; iconUrl?: string }) {
  return (
    <div className="hud-bar-row damage-bar-row">
      <span className="hud-bar-label damage-bar-label">
        {iconUrl && <img src={iconUrl} alt={label} className="inline-block damage-bar-icon" />}
        {label}
      </span>
      <div className="hud-bar-track"><div className="hud-bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}
