import React from 'react';

export interface StatRowProps {
  label: string;
  value: string | number;
  delta?: number; // Percentage increase/decrease
  maxValue?: number; // For the fill bar
  className?: string;
  style?: React.CSSProperties;
}

export const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  delta,
  maxValue,
  className = '',
  style,
}) => {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
    gap: '12px',
    fontFamily: 'var(--font-body)',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--wf-text-dim)',
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--wf-text)',
    fontFamily: 'var(--font-body)',
    textAlign: 'right',
  };

  const barContainerStyle: React.CSSProperties = {
    flex: 1,
    height: '4px',
    backgroundColor: 'var(--wf-border)',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
  };

  const barFillStyle: React.CSSProperties = {
    height: '100%',
    width: maxValue ? `${Math.min(100, (Number(value) / maxValue) * 100)}%` : '0%',
    backgroundColor: 'var(--wf-teal)',
    transition: 'width var(--transition-normal)',
  };

  const deltaStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 600,
    color: delta && delta > 0 ? 'var(--wf-teal)' : 'var(--wf-red)',
    fontFamily: 'var(--font-mono)',
  };

  return (
    <div style={rowStyle} className={`ui-stat-row ${className}`}>
      <span style={labelStyle}>{label}</span>
      {maxValue && (
        <div style={barContainerStyle}>
          <div style={barFillStyle} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {delta !== undefined && (
          <span style={deltaStyle}>
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
        <span style={valueStyle}>{value}</span>
      </div>
    </div>
  );
};
