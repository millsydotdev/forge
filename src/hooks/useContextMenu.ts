import { useState, useCallback, useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: string;
}

export function useContextMenu() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalClick = () => setVisible(false);
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const open = useCallback((e: React.MouseEvent, _customItems?: ContextMenuItem[]) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  return {
    visible,
    pos,
    open,
    close,
    menuRef,
  };
}
