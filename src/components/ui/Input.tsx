import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  style,
  ...props
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: 'var(--font-body)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--wf-text-dim)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--wf-surface-solid)',
    color: 'var(--wf-text)',
    border: 'none',
    borderBottom: `2px solid ${error ? 'var(--wf-red)' : 'var(--wf-teal)'}`,
    borderRadius: '0',
    padding: '8px 0',
    fontSize: '14px',
    transition: 'var(--transition-fast)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--wf-red)',
    marginTop: '2px',
  };

  return (
    <div style={containerStyle} className={`ui-input-container ${className}`}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        style={{ ...inputStyle, ...style }}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
      <style>{`
        .ui-input-container input:focus {
          text-shadow: 0 0 8px var(--wf-teal-glow);
          border-bottom-color: var(--wf-teal-ui);
        }
      `}</style>
    </div>
  );
};
