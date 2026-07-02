import React from 'react';

export interface ContextMenuProps {
  visible: boolean;
  pos: { x: number; y: number };
  items: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: string;
  }[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  pos,
  items,
  onClose,
}) => {
  if (!visible) return null;

  const itemStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    <div
      style={{
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        zIndex: 'var(--z-dropdown)',
        minWidth: '160px',
        backgroundColor: 'var(--wf-surface-solid)',
        border: '1px solid var(--wf-border)',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: 'var(--elevation-3)',
      }}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          disabled={item.disabled}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          style={itemStyle(item.disabled || false)}
          className="ui-ctx-menu-item"
        >
          {item.icon && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{item.icon}</span>}
          {item.label}
        </button>
      ))}
      <style>{`
        .ui-ctx-menu-item:hover:not(:disabled) {
          background-color: var(--wf-panel-active) !important;
          color: var(--wf-teal) !important;
        }
      `}</style>
    </div>
  );
};
