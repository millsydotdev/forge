import React, { useRef, useState } from 'react';

export function RichTooltip({ children, title, content, color = '#d6a43e' }: {
  children: React.ReactNode;
  title: string;
  content: React.ReactNode;
  color?: string;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="rich-tooltip-trigger"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="rich-tooltip-popup" style={{
          border: `1px solid ${color}40`,
          boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 8px ${color}20`,
        }}>
          <div className="rich-tooltip-title" style={{ color }}>{title}</div>
          <div className="rich-tooltip-content">{content}</div>
          <div className="rich-tooltip-arrow" style={{ borderTop: `5px solid ${color}40` }} />
        </div>
      )}
    </div>
  );
}