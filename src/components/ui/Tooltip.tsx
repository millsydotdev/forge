import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  color?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  title,
  color = 'var(--wf-teal)',
  position = 'top',
  delay = 200,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipWidth = 200; // Approximate or measure after render
        const tooltipHeight = 60;

        let top = 0, left = 0;

        switch (position) {
          case 'top':
            top = rect.top - tooltipHeight - 8;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - 8;
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.bottom + 8; // wait, rect.right
            left = rect.right + 8;
            break;
        }

        setCoords({ top, left });
        setVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <div 
      ref={triggerRef} 
      style={{ display: 'inline-block' }} 
      onMouseEnter={showTooltip} 
      onMouseLeave={hideTooltip}
    >
      {children}
      {visible && createPortal(
        <div style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: 'max-content',
          maxWidth: '300px',
          backgroundColor: 'var(--wf-surface-solid)',
          border: `1px solid ${color}`,
          borderRadius: '4px',
          padding: '8px 12px',
          color: 'var(--wf-text)',
          fontSize: '13px',
          zIndex: 'var(--z-dropdown)',
          pointerEvents: 'none',
          boxShadow: 'var(--elevation-3)',
          fontFamily: 'var(--font-body)',
        }}>
          {title && <div style={{ 
            fontWeight: 600, 
            color: color, 
            marginBottom: '4px', 
            fontFamily: 'var(--font-display)', 
            textTransform: 'uppercase', 
            fontSize: '11px' 
          }}>{title}</div>}
          <div style={{ lineHeight: '1.4' }}>{content}</div>
        </div>,
        document.body
      )}
    </div>
  );
};
