import React, { useCallback, useRef, useEffect } from 'react';

interface DragHandleProps {
  direction: 'vertical' | 'horizontal';
  cssVar: string;
  minPx: number;
  maxPx: number;
  defaultPx: number;
  storageKey: string;
  onResize?: (px: number) => void;
}

export function DragHandle({ direction, cssVar, minPx, maxPx, defaultPx, storageKey, onResize }: DragHandleProps) {
  const dragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const loadSaved = useCallback((): number => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const v = parseInt(saved, 10);
        if (!isNaN(v) && v >= minPx && v <= maxPx) return v;
      }
    } catch (e) { console.warn('[DragHandle] loadSaved failed:', e); } // eslint-disable-line no-console
    return defaultPx;
  }, [storageKey, minPx, maxPx, defaultPx]);

  const setSize = useCallback((px: number) => {
    const clamped = Math.max(minPx, Math.min(maxPx, px));
    document.documentElement.style.setProperty(cssVar, clamped + 'px');
    try { localStorage.setItem(storageKey, String(clamped)); } catch (e) { console.warn('[DragHandle] localStorage set failed:', e); } // eslint-disable-line no-console
    onResize?.(clamped);
  }, [cssVar, minPx, maxPx, storageKey, onResize]);

  useEffect(() => {
    setSize(loadSaved());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (direction === 'vertical' && e.clientX < 3) return;
    e.preventDefault();
    dragging.current = true;
    startPos.current = direction === 'vertical' ? e.clientX : e.clientY;
    const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || defaultPx;
    startSize.current = current;
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, cssVar, defaultPx]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = (direction === 'vertical' ? e.clientX : e.clientY) - startPos.current;
      setSize(startSize.current + delta);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [direction, setSize]);

  return (
    <div
      className="wb-drag-handle"
      style={{
        width: direction === 'vertical' ? 6 : '100%',
        height: direction === 'vertical' ? '100%' : 6,
        left: direction === 'vertical' ? -2 : 0,
        cursor: direction === 'vertical' ? 'col-resize' : 'ns-resize',
      }}
      onMouseDown={e => {
        if (direction === 'vertical' && e.clientX < 2) return;
        onMouseDown(e);
      }}
      role="separator"
      aria-orientation={direction === 'vertical' ? 'vertical' : 'horizontal'}
      aria-label="Resize panel"
      tabIndex={0}
      onKeyDown={e => {
        const step = e.shiftKey ? 10 : 1;
        const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(cssVar)) || defaultPx;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setSize(current - step); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setSize(current + step); }
      }}
    />
  );
}
