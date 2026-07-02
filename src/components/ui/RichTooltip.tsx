import React, { useRef, useState } from 'react';
import type { PresentationTooltip } from './PresentationModel';
import { visualManager } from '../../services/visual-manager';

interface RichTooltipProps {
  children: React.ReactNode;
  tooltip: PresentationTooltip;
  color?: string;
  delay?: number;
}

export function RichTooltip({ children, tooltip, color = '#d6a43e', delay = 400 }: RichTooltipProps) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    timer.current = setTimeout(() => setShow(true), delay);
  };
  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <div
      className="rich-tooltip-trigger"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {show && (
        <div className="rich-tooltip-popup" style={{ borderColor: color }}>
          {/* Header */}
          <div className="rich-tooltip-header" style={{ color }}>
            {tooltip.artwork && (
              <img
                src={visualManager.getImageUrl(tooltip.artwork)}
                alt={tooltip.title}
                className="rich-tooltip-artwork"
                onError={e => { if (tooltip.artwork) visualManager.markFailed(tooltip.artwork, 'tooltip'); (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="rich-tooltip-title">{tooltip.title}</div>
            {tooltip.subtitle && <div className="rich-tooltip-subtitle">{tooltip.subtitle}</div>}
          </div>

          {/* Stat sections */}
          {tooltip.sections.length > 0 && (
            <div className="rich-tooltip-sections">
              {tooltip.sections.map((s, i) => (
                <div key={i} className="rich-tooltip-row">
                  <span className="rich-tooltip-label">{s.label}</span>
                  <span className="rich-tooltip-value" style={s.color ? { color: s.color } : undefined}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Drop locations */}
          {tooltip.drops && tooltip.drops.length > 0 && (
            <div className="rich-tooltip-drops">
              <div className="rich-tooltip-drops-title">Drops</div>
              {tooltip.drops.map((d, i) => (
                <div key={i} className="rich-tooltip-drop-row">
                  <span className="rich-tooltip-drop-loc">{d.location}</span>
                  <span className="rich-tooltip-drop-chance">{d.chance.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="rich-tooltip-links">
            {tooltip.wikiUrl && <a href={tooltip.wikiUrl} className="rich-tooltip-link" target="_blank" rel="noreferrer">Wiki</a>}
            {tooltip.kbRef && <span className="rich-tooltip-link">{tooltip.kbRef}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
