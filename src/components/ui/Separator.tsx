import React from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className = '',
  style,
}) => {
  const separatorStyle: React.CSSProperties = {
    backgroundColor: 'var(--wf-border)',
    ... (orientation === 'horizontal' 
      ? { height: '1px', width: '100%' }
      : { width: '1px', height: '100%' }),
    ...style,
  };

  return <div style={separatorStyle} className={`ui-separator ${className}`} />;
};
