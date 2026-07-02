import { useState, useCallback, useRef } from 'react';
import { workspaceManager } from '../../services/workspace-manager';

export function BuildTabs() {
  const [tabs, setTabs] = useState(() => workspaceManager.tabs.getTabs());
  const [activeId, setActiveId] = useState(() => workspaceManager.tabs.getActiveTabId());
  const dragRef = useRef<{ index: number } | null>(null);

  // Subscribe to tab changes via event bus
  useState(() => {
    const unsub1 = workspaceManager.events.on('tab-activated', () => {
      setTabs(workspaceManager.tabs.getTabs());
      setActiveId(workspaceManager.tabs.getActiveTabId());
    });
    const unsub2 = workspaceManager.events.on('tab-closed', () => {
      setTabs(workspaceManager.tabs.getTabs());
      setActiveId(workspaceManager.tabs.getActiveTabId());
    });
    const unsub3 = workspaceManager.events.on('document-closed', () => {
      setTabs(workspaceManager.tabs.getTabs());
      setActiveId(workspaceManager.tabs.getActiveTabId());
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  });

  const handleTabClick = useCallback((buildId: string) => {
    workspaceManager.tabs.activate(buildId);
    setActiveId(buildId);
  }, []);

  const handleTabClose = useCallback((e: React.MouseEvent, buildId: string) => {
    e.stopPropagation();
    const doc = workspaceManager.documents.get(buildId);
    if (doc?.dirty) {
      workspaceManager.documents.markClean(buildId);
    }
    workspaceManager.tabs.close(buildId);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, _buildId: string) => {
    e.preventDefault();
    // Basic context menu handled by browser default for now
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    dragRef.current = { index };
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragRef.current && dragRef.current.index !== index) {
      workspaceManager.tabs.reorder(dragRef.current.index, index);
      setTabs(workspaceManager.tabs.getTabs());
      dragRef.current.index = index;
    }
  }, []);

  if (tabs.length === 0) return null;

  return (
    <div className="build-tabs">
      <div className="build-tabs__scroll">
        {tabs.map((tab, idx) => {
          const doc = workspaceManager.documents.get(tab.buildId);
          const isActive = tab.buildId === activeId;
          return (
            <div
              key={tab.buildId}
              className={`build-tab ${isActive ? 'build-tab--active' : ''} ${doc?.dirty ? 'build-tab--dirty' : ''}`}
              onClick={() => handleTabClick(tab.buildId)}
              onContextMenu={e => handleContextMenu(e, tab.buildId)}
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              title={tab.title || doc?.name || 'Build'}
            >
              <span className="build-tab__title">{tab.title || doc?.name || 'Build'}</span>
              {doc?.dirty && <span className="build-tab__dirty">●</span>}
              <button
                className="build-tab__close"
                onClick={e => handleTabClose(e, tab.buildId)}
                title="Close"
              >×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
