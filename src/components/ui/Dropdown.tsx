import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItemProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItemProps[];
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    [align === 'left' ? 'left' : 'right']: 0,
    zIndex: 'var(--z-dropdown)',
    minWidth: '160px',
    backgroundColor: 'var(--wf-surface-solid)',
    border: '1px solid var(--wf-border)',
    borderRadius: '4px',
    padding: '4px',
    boxShadow: 'var(--elevation-3)',
    display: isOpen ? 'block' : 'none',
  };

  const itemStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    color: disabled ? 'var(--wf-text-muted)' : 'var(--wf-text)',
    fontSize: '13px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: '2px',
    transition: 'var(--transition-fast)',
    fontFamily: 'var(--font-body)',
    opacity: disabled ? 0.5 : 1,
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      <div style={menuStyle}>
        {items.map((item, idx) => (
          <button
            key={idx}
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              setIsOpen(false);
            }}
            style={itemStyle(item.disabled || false)}
            className="ui-dropdown-item"
          >
            {item.label}
          </button>
        ))}
      </div>
      <style>{`
        .ui-dropdown-item:hover:not(:disabled) {
          background-color: var(--wf-panel-active) !important;
          color: var(--wf-teal) !important;
        }
      `}</style>
    </div>
  );
};
