import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useBuildStore } from '../../store/buildStore';
import { useUiStore } from '../../store/uiStore';

interface Command {
  id: string;
  label: string;
  description: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const b = useBuildStore.getState();
    const u = useUiStore.getState();
    return [
      { id: 'save', label: 'Save Build', description: 'Save the current build', category: 'Build', shortcut: 'Ctrl+S', action: () => { u.setToast?.({ message: 'Build saved', type: 'success' }); onClose(); } },
      { id: 'new', label: 'New Build', description: 'Reset to empty build', category: 'Build', shortcut: '', action: () => { b.resetBuild(); onClose(); } },
      { id: 'export', label: 'Export Build Code', description: 'Copy build code to clipboard', category: 'Build', shortcut: '', action: () => { onClose(); } },
      { id: 'import', label: 'Import Build Code', description: 'Import a build from clipboard', category: 'Build', shortcut: '', action: () => { u.setShowImport(true); onClose(); } },
      { id: 'focus-warframe', label: 'Focus: Warframe', description: 'Switch to warframe modding', category: 'Navigation', shortcut: '1', action: () => { u.setActiveSlot('warframe'); onClose(); } },
      { id: 'focus-primary', label: 'Focus: Primary', description: 'Switch to primary weapon', category: 'Navigation', shortcut: '2', action: () => { u.setActiveSlot('primary'); onClose(); } },
      { id: 'focus-secondary', label: 'Focus: Secondary', description: 'Switch to secondary weapon', category: 'Navigation', shortcut: '3', action: () => { u.setActiveSlot('secondary'); onClose(); } },
      { id: 'focus-melee', label: 'Focus: Melee', description: 'Switch to melee weapon', category: 'Navigation', shortcut: '4', action: () => { u.setActiveSlot('melee'); onClose(); } },
      { id: 'focus-companion', label: 'Focus: Companion', description: 'Switch to companion', category: 'Navigation', shortcut: '5', action: () => { u.setActiveSlot('companion'); onClose(); } },
      { id: 'toggle-sidebar', label: 'Toggle Sidebar', description: 'Show/hide left sidebar', category: 'Layout', shortcut: 'Ctrl+B', action: () => { u.setSidebarCollapsed(!u.sidebarCollapsed); onClose(); } },
      { id: 'toggle-inspector', label: 'Toggle Inspector', description: 'Show/hide right inspector', category: 'Layout', shortcut: 'Ctrl+`', action: () => { u.setInspectorCollapsed(!u.inspectorCollapsed); onClose(); } },
      { id: 'toggle-drawer', label: 'Toggle Drawer', description: 'Show/hide bottom drawer', category: 'Layout', shortcut: 'Ctrl+J', action: () => { u.setDrawerCollapsed(!u.drawerCollapsed); onClose(); } },
      { id: 'layout-balanced', label: 'Layout: Balanced', description: 'Default balanced layout', category: 'Layout', shortcut: '', action: () => { u.setLayoutPreset('balanced'); onClose(); } },
      { id: 'layout-wide', label: 'Layout: Wide', description: 'Maximize workspace', category: 'Layout', shortcut: '', action: () => { u.setLayoutPreset('wide'); onClose(); } },
      { id: 'layout-compact', label: 'Layout: Compact', description: 'Compact mode', category: 'Layout', shortcut: '', action: () => { u.setLayoutPreset('compact'); onClose(); } },
      { id: 'inspector-stats', label: 'Inspector: Stats', description: 'Show stat breakdown', category: 'Inspector', shortcut: 'W', action: () => { u.setInspectorMode('stat'); onClose(); } },
      { id: 'inspector-idle', label: 'Inspector: Overview', description: 'Show overview', category: 'Inspector', shortcut: '', action: () => { u.setInspectorMode('idle'); onClose(); } },
      { id: 'open-search', label: 'Global Search', description: 'Search items, mods, arcanes', category: 'Navigation', shortcut: 'Ctrl+K', action: () => { u.setSearchOpen(true); onClose(); } },
      { id: 'history', label: 'Build History', description: 'View build history', category: 'Build', shortcut: '', action: () => { u.setShowHistory(true); onClose(); } },
      { id: 'compare', label: 'Compare Builds', description: 'Side-by-side build comparison', category: 'Build', shortcut: '', action: () => { u.setShowCompare(true); onClose(); } },
    ];
  }, [onClose]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
    );
  }, [query, commands]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filtered, selectedIndex, onClose]);

  const categoryOrder = ['Navigation', 'Build', 'Layout', 'Inspector'];

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette__input-wrap">
          <span className="command-palette__prefix">⌘</span>
          <input
            ref={inputRef}
            className="command-palette__input"
            type="text"
            placeholder="Type a command…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="command-palette__results">
          {filtered.length === 0 && (
            <div className="command-palette__empty">No commands found</div>
          )}
          {categoryOrder.filter(cat => filtered.some(c => c.category === cat)).map(cat => (
            <div key={cat} className="command-palette__group">
              <div className="command-palette__group-label">{cat}</div>
              {filtered.filter(c => c.category === cat).map((cmd, _idx) => {
                const globalIdx = filtered.indexOf(cmd);
                return (
                  <button
                    key={cmd.id}
                    className={`command-palette__item ${globalIdx === selectedIndex ? 'command-palette__item--selected' : ''}`}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <div className="command-palette__item-info">
                      <span className="command-palette__item-label">{cmd.label}</span>
                      <span className="command-palette__item-desc">{cmd.description}</span>
                    </div>
                    {cmd.shortcut && (
                      <kbd className="command-palette__shortcut">{cmd.shortcut}</kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
