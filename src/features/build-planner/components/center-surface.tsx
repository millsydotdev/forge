import React from 'react';
import type { CenterSurfaceProps } from './surfaces/surface-props';
import { FrameSurface } from './surfaces/frame-surface';
import { WeaponSurface } from './surfaces/weapon-surface';
import { ExaltedSurface } from './surfaces/exalted-surface';
import { CompanionSurface } from './surfaces/companion-surface';
import { PanelSurface } from './surfaces/panel-surface';

const WEAPON_SLOTS = ['primary', 'secondary', 'melee', 'arch-gun', 'arch-melee'];
const PANEL_SLOTS = new Set(['amp', 'railjack', 'kdrive', 'necramech', 'archwing', 'parazon', 'zaw', 'kitgun', 'operator']);

export function CenterSurface(props: CenterSurfaceProps) {
  const { activeSlot, compact } = props;

  if (compact) {
    return <FrameSurface {...props} />;
  }

  return (
    <div className="workspace">
      {activeSlot === 'warframe' && <FrameSurface {...props} />}
      {activeSlot === 'companion' && <CompanionSurface {...props} />}
      {activeSlot === 'exalted_weapon' && <ExaltedSurface {...props} />}
      {WEAPON_SLOTS.includes(activeSlot) && <WeaponSurface {...props} slot={activeSlot} />}
      {PANEL_SLOTS.has(activeSlot) && <PanelSurface {...props} />}
    </div>
  );
}

export type { CenterSurfaceProps };
