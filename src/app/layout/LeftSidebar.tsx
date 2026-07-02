import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useUiStore } from '../../store/uiStore';
import { StatsHUD } from '../../features/build-planner/components/stats-hud';
import { Button } from '../../components/ui';

interface LeftSidebarProps {
  activeSlot: string;
  result: any;
  calculating: boolean;
  weaponStates: Record<string, any>;
  curWeapon: any;
  primerSlot: string | null;
  resultWeapons: any;
}

export function LeftSidebar(props: LeftSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUiStore(useShallow(s => ({ sidebarCollapsed: s.sidebarCollapsed, toggleSidebar: s.toggleSidebar })));
  const { activeSlot, result, calculating, weaponStates, curWeapon, primerSlot, resultWeapons } = props;

  if (sidebarCollapsed) {
    return (
      <aside className="wb-left" role="complementary" aria-label="Stats rail" style={{ width: 40, minWidth: 40 }}>
        <div className="wb-left__header" style={{ flexDirection: 'column', padding: 4 }}>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} title="Expand stats" aria-label="Expand stats">▸</Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="wb-left" role="complementary" aria-label="Stats rail">
      <div className="wb-left__header">
        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 500, letterSpacing: 1, color: 'var(--wf-text-muted)', textTransform: 'uppercase' }}>
          Stats
        </span>
        <Button variant="ghost" size="sm" onClick={toggleSidebar} title="Collapse stats" aria-label="Collapse stats">◂</Button>
      </div>

      <div className="wb-left__body" style={{ padding: '8px', overflow: 'auto' }}>
        <StatsHUD
          result={result}
          activeSlot={activeSlot}
          curWeapon={curWeapon}
          primerSlot={primerSlot}
          weaponStates={weaponStates}
          resultWeapons={resultWeapons}
          calculating={calculating}
        />
      </div>
    </aside>
  );
}
