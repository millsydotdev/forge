import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  style,
}) => {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    ...getVariantStyles(variant),
    ...style,
  };

  return (
    <span style={badgeStyle} className={`ui-badge ui-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

function getVariantStyles(variant: BadgeVariant): React.CSSProperties {
  switch (variant) {
    case 'success':
      return { backgroundColor: 'var(--wf-green-soft)', color: 'var(--wf-green-ui)' };
    case 'warning':
      return { backgroundColor: 'var(--wf-orange-soft)', color: 'var(--wf-orange)' }; // using orange as warning
    case 'danger':
      return { backgroundColor: 'var(--wf-red-soft)', color: 'var(--wf-red-ui)' };
    case 'info':
      return { backgroundColor: 'var(--wf-teal-soft)', color: 'var(--wf-teal-ui)' };
    case 'gold':
      return { backgroundColor: 'var(--wf-gold-glow)', color: 'var(--wf-gold)' };
    default:
      return { backgroundColor: 'var(--wf-border)', color: 'var(--wf-text)' };
  }
}
