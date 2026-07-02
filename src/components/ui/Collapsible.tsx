import React, { useState } from 'react';

export interface CollapsibleProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  label,
  children,
  defaultOpen = true,
  className = '',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerStyle: React.CSSProperties = {
    cursor: 'pointer',
    padding: '6px 0',
    fontSize: '11px',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.05em',
    color: isOpen ? 'var(--wf-teal)' : 'var(--wf-text-dim)',
    textTransform: 'uppercase',
    transition: 'color var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    userSelect: 'none',
  };

  const contentStyle: React.CSSProperties = {
    animation: 'wb-fade-in var(--transition-normal)',
    paddingBottom: '8px',
  };

  return (
    <div className={`ui-collapsible ${className}`} style={{ borderBottom: '1px solid var(--wf-border)', marginBottom: '4px', ...style }}>
      <div 
        style={headerStyle} 
        onClick={() => setIsOpen(!isOpen)} 
        role="button" 
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') setIsOpen(!isOpen); }}
      >
        <span style={{ fontSize: '10px', transition: 'transform var(--transition-fast)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        {label}
      </div>
      {isOpen && <div style={contentStyle}>{children}</div>}
    </div>
  );
};
