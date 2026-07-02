import React from 'react';

export type PanelVariant = 'default' | 'high' | 'active' | 'solid';

export interface PanelProps {
  children: React.ReactNode;
  variant?: PanelVariant;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  childrenStyle?: React.CSSProperties;
}

export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'default',
  title,
  className = '',
  style,
  childrenStyle,
}) => {
  const panelStyle: React.CSSProperties = {
    backgroundColor: getVariantBg(variant),
    border: '1px solid var(--wf-border)',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'var(--transition-normal)',
    boxShadow: 'var(--elevation-1)',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: title ? '1px solid var(--wf-border)' : 'none',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--wf-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: 'var(--font-display)',
  };

  const contentStyle: React.CSSProperties = {
    padding: '12px',
    ...childrenStyle,
  };

  return (
    <div style={panelStyle} className={`ui-panel ui-panel-${variant} ${className}`}>
      {title && <div style={headerStyle}>{title}</div>}
      <div style={contentStyle}>{children}</div>
    </div>
  );
};

function getVariantBg(variant: PanelVariant): string {
  switch (variant) {
    case 'high': return 'var(--wf-panel-high)';
    case 'active': return 'var(--wf-panel-active)';
    case 'solid': return 'var(--wf-surface-solid)';
    default: return 'var(--wf-panel)';
  }
}
