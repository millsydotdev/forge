import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'holographic' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: '0.25rem',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-fast)',
    border: '1px solid transparent',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    ...getVariantStyles(variant),
    ...getSizeStyles(size),
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={styles}
      className={`ui-button ui-button-${variant} ${className}`}
      {...props}
    >
      {isLoading ? <span className="ui-button-loader" /> : children}
      <style>{`
        .ui-button-holographic:hover:not(:disabled) {
          background-color: rgba(0, 242, 255, 0.1) !important;
          box-shadow: 0 0 10px var(--wf-teal-glow);
        }
      `}</style>
    </button>
  );
};

function getVariantStyles(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: 'var(--wf-gold)',
        color: 'var(--wf-bg)',
        borderColor: 'var(--wf-gold)',
      };
    case 'secondary':
      return {
        backgroundColor: 'var(--wf-surface-solid)',
        color: 'var(--wf-text)',
        borderColor: 'var(--wf-border)',
      };
    case 'holographic':
      return {
        backgroundColor: 'transparent',
        color: 'var(--wf-teal)',
        borderColor: 'var(--wf-teal)',
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: 'var(--wf-text-dim)',
        borderColor: 'transparent',
      };
    case 'danger':
      return {
        backgroundColor: 'var(--wf-red)',
        color: 'var(--wf-bg)',
        borderColor: 'var(--wf-red)',
      };
  }
}

function getSizeStyles(size: ButtonSize): React.CSSProperties {
  switch (size) {
    case 'sm':
      return { padding: '4px 12px', fontSize: '11px' };
    case 'md':
      return { padding: '8px 16px', fontSize: '13px' };
    case 'lg':
      return { padding: '12px 24px', fontSize: '15px' };
  }
}
