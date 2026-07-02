import React from 'react';
import type { CenterSurfaceProps } from './surface-props';
import { getPanel } from '../../panels/panel-registry';
import type { ItemOption } from '../../model';

export function PanelSurface({ activeSlot, panelStates, setPanelStates, allMods, placeModAtSlot, onAddRiven }: CenterSurfaceProps) {
  const panel = getPanel(activeSlot);
  if (!panel) {
    return <div className="empty-state">No panel for {activeSlot}</div>;
  }
  const PanelSurfaceComp = panel.Surface as React.ComponentType<{
    state: unknown;
    onChange: (updater: unknown | ((prev: unknown) => unknown)) => void;
    allMods: ItemOption[];
    placeMod: (uniqueName: string, index: number) => void;
    onAddRiven?: () => void;
  }>;
  return (
    <div className="workspace-body">
      <PanelSurfaceComp
        state={panelStates[activeSlot] ?? panel.initialState()}
        onChange={updater => {
          setPanelStates(prev => ({
            ...prev,
            [activeSlot]: typeof updater === 'function'
              ? updater(prev[activeSlot] ?? panel.initialState())
              : updater,
          }));
        }}
        allMods={allMods}
        placeMod={(uniqueName, index) => placeModAtSlot(activeSlot, index, { uniqueName, name: uniqueName, category: '' })}
        onAddRiven={onAddRiven}
      />
    </div>
  );
}
