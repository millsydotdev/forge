import React from 'react';

export interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className = '',
  style,
}) => {
  const scrollStyle: React.CSSProperties = {
    overflow: 'auto',
    display: 'block',
    ...style,
  };

  return (
    <div 
      style={scrollStyle} 
      className={`ui-scroll-area ${className}`}
    >
      {children}
      <style>{`
        .ui-scroll-area::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .ui-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .ui-scroll-area::-webkit-scrollbar-thumb {
          background: var(--wf-border);
          border-radius: 3px;
        }
        .ui-scroll-area::-webkit-scrollbar-thumb:hover {
          background: var(--wf-text-muted);
        }
      `}</style>
    </div>
  );
};
