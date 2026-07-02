import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
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
    fontSize: '12px',
    color: 'var(--wf-text-dim)',
    fontWeight: 500,
  };

  const textAreaStyle: React.CSSProperties = {
    backgroundColor: 'var(--wf-surface-solid)',
    color: 'var(--wf-text)',
    border: `1px solid ${error ? 'var(--wf-red)' : 'var(--wf-border)'}`,
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '14px',
    transition: 'var(--transition-fast)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--wf-red)',
    marginTop: '2px',
  };

  return (
    <div style={containerStyle} className={`ui-textarea-container ${className}`}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        style={{ ...textAreaStyle, ...style }}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};
