import React, { useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';

const SLOT_KEYS = ['warframe', 'primary', 'secondary', 'melee', 'arch-gun', 'arch-melee', 'companion'];

interface ShortcutProviderProps {
  children: React.ReactNode;
  onSave?: () => void;
  onCommandPalette?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function ShortcutProvider({ children, onSave, onCommandPalette, onUndo, onRedo }: ShortcutProviderProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ui = useUiStore.getState();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (ctrl && e.key === 's') { e.preventDefault(); onSave?.(); return; }
      if (ctrl && e.key === 'z' && !shift) { e.preventDefault(); onUndo?.(); return; }
      if (ctrl && e.key === 'z' && shift) { e.preventDefault(); onRedo?.(); return; }
      if (ctrl && shift && e.key === 'Z') { e.preventDefault(); onRedo?.(); return; }
      if (ctrl && e.key === 'b') { e.preventDefault(); ui.toggleSidebar(); return; }
      if (ctrl && e.key === 'j') { e.preventDefault(); ui.toggleDrawer(); return; }
      if (ctrl && e.key === '`') { e.preventDefault(); ui.toggleInspector(); return; }
      if (ctrl && e.key === 'f') { e.preventDefault(); ui.setSearchOpen(!ui.searchOpen); return; }
      if (ctrl && e.key === 'p') { e.preventDefault(); onCommandPalette?.(); return; }
      if (ctrl && shift && e.key === 'P') { e.preventDefault(); onCommandPalette?.(); return; }
      if (ctrl && e.key === 'k') { e.preventDefault(); onCommandPalette?.(); return; }

      if (e.key === 'Escape') {
        if (ui.searchOpen) { ui.setSearchOpen(false); return; }
        if (ui.inspectorMode !== 'idle') { ui.setInspectorMode('idle', null); return; }
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9 && !ctrl && !shift) {
        const idx = num - 1;
        if (idx < SLOT_KEYS.length) {
          e.preventDefault();
          ui.setActiveSlot(SLOT_KEYS[idx]);
          return;
        }
      }

      if (!ctrl && !shift && e.key === 'w') {
        ui.setInspectorMode('stat', null);
        return;
      }
      if (!ctrl && !shift && e.key === 'e') {
        if (ui.drawerCollapsed) ui.toggleDrawer();
        ui.setLibraryTab('enemies');
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSave, onCommandPalette, onUndo, onRedo]);

  return <>{children}</>;
}
