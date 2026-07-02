import { useCallback, type ReactNode } from 'react';

export interface DockPanelDef<T = any> {
  id: string;
  label: string;
  icon?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  render: (props: T) => ReactNode;
}

interface PanelDockProps {
  side: 'left' | 'right';
  panels: DockPanelDef[];
  activePanelId: string | null;
  onPanelChange: (id: string | null) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  width: number;
  panelProps?: Record<string, any>;
}

export function PanelDock({
  side, panels, activePanelId, onPanelChange,
  collapsed, onToggleCollapse, width, panelProps,
}: PanelDockProps) {
  const activePanel = panels.find(p => p.id === activePanelId);

  const handleTabClick = useCallback((id: string) => {
    if (id === activePanelId) {
      onPanelChange(null);
    } else {
      onPanelChange(id);
    }
  }, [activePanelId, onPanelChange]);

  if (collapsed) {
    return (
      <div className={`panel-dock panel-dock--collapsed panel-dock--${side}`}>
        {panels.map(p => (
          <button
            key={p.id}
            className={`panel-dock__tab ${p.id === activePanelId ? 'panel-dock__tab--active' : ''}`}
            onClick={() => handleTabClick(p.id)}
            title={p.label}
          >
            {p.icon || p.label[0]}
          </button>
        ))}
        {onToggleCollapse && (
          <button className="panel-dock__expand" onClick={onToggleCollapse} title="Expand panel">
            ◀
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`panel-dock panel-dock--${side}`} style={{ width }}>
      <div className="panel-dock__header">
        <div className="panel-dock__tabs">
          {panels.map(p => (
            <button
              key={p.id}
              className={`panel-dock__tab ${p.id === activePanelId ? 'panel-dock__tab--active' : ''}`}
              onClick={() => handleTabClick(p.id)}
            >
              {p.icon && <span className="panel-dock__tab-icon">{p.icon}</span>}
              <span className="panel-dock__tab-label">{p.label}</span>
            </button>
          ))}
        </div>
        {onToggleCollapse && (
          <button className="panel-dock__collapse" onClick={onToggleCollapse} title="Collapse panel">
            ▶
          </button>
        )}
      </div>
      <div className="panel-dock__body">
        {activePanel ? activePanel.render(panelProps?.[activePanel.id] ?? {}) : (
          <div className="panel-dock__empty">Select a panel</div>
        )}
      </div>
    </div>
  );
}
