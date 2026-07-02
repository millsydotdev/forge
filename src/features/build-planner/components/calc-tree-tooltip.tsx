import React, { useRef, useState } from 'react';
import type { CalcBreakdown } from '../../../engine/calc-breakdown';

/**
 * PoB-style calculation tree tooltip.
 *
 * Renders the full math tree for a computed stat:
 *   Base value (source)
 *   + Flat additions (each with source)
 *   × (1 + Multiplier sum) (each with source)
 *   = Final value
 *
 * Color-coded by contribution type:
 *   Base   — gold (passive / weapon base)
 *   Flat   — teal (flat additions)
 *   Mult   — green (multiplier bonuses)
 *   Final  — gold-bright (result)
 */
export function CalcTreeTooltip({ children, breakdown, color = '#d6a43e' }: {
  children: React.ReactNode;
  breakdown: CalcBreakdown | undefined;
  color?: string;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!breakdown) return <>{children}</>;

  const hasFlats = breakdown.flats.length > 0;
  const hasMults = breakdown.multipliers.length > 0;
  const hasDetail = hasFlats || hasMults;

  return (
    <div
      ref={ref}
      className="calc-tooltip-trigger"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="calc-tooltip-popup" style={{
          border: `1px solid ${color}50`,
          boxShadow: `0 6px 24px rgba(0,0,0,0.7), 0 0 12px ${color}25`,
        }}>
          {/* Header */}
          <div className="calc-tooltip-header" style={{
            background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`,
            borderBottom: `1px solid ${color}30`,
            color,
          }}>
            {breakdown.label}
          </div>

          <div className="calc-tooltip-body">
            {/* Base value */}
            <div className="calc-tooltip-row">
              <span className="calc-tooltip-base-label">Base</span>
              <span className="calc-tooltip-base-label">{formatNum(breakdown.base)}</span>
            </div>
            <div className="calc-tooltip-base-source">
              {breakdown.baseSource}
            </div>

            {/* Flat additions */}
            {hasFlats && (
              <>
                <div className="calc-tooltip-section-header" style={{ borderTop: `1px solid ${color}20`, color: '#50b0e8' }}>
                  + FLAT ADDITIONS
                </div>
                {breakdown.flats.map((f, i) => (
                  <div key={i} className="calc-tooltip-row">
                    <span className="calc-tooltip-source calc-tooltip-source-wide">
                      {f.source}
                    </span>
                    <span className="calc-tooltip-flat-value">+{formatNum(f.value)}</span>
                  </div>
                ))}
                <div className="calc-tooltip-row-margin">
                  <span className="calc-tooltip-flat-sum">Flat Sum</span>
                  <span className="calc-tooltip-flat-sum">+{formatNum(breakdown.flatSum - breakdown.base)}</span>
                </div>
              </>
            )}

            {/* Multipliers */}
            {hasMults && (
              <>
                <div className="calc-tooltip-section-header" style={{ borderTop: `1px solid ${color}20`, color: '#50d080' }}>
                  × MULTIPLIERS
                </div>
                {breakdown.multipliers.map((m, i) => (
                  <div key={i} className="calc-tooltip-row">
                    <span className="calc-tooltip-source calc-tooltip-source-narrow">
                      {m.source}
                    </span>
                    <span className="calc-tooltip-mult-value">
                      {m.value >= 0 ? '+' : ''}{(m.value * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
                <div className="calc-tooltip-row-margin">
                  <span className="calc-tooltip-mult-sum">Mult Sum</span>
                  <span className="calc-tooltip-mult-sum">
                    ×{(1 + breakdown.multiplierSum).toFixed(3)}
                  </span>
                </div>
              </>
            )}

            {/* Formula line */}
            {hasDetail && (
              <div className="calc-tooltip-formula" style={{ borderTop: `1px solid ${color}20` }}>
                {breakdown.formula}
              </div>
            )}

            {/* Final value */}
            <div className="calc-tooltip-final-row" style={{ borderTop: `1px solid ${color}40` }}>
              <span className="calc-tooltip-final-label" style={{ color }}>FINAL</span>
              <span className="calc-tooltip-final-value" style={{ color }}>{formatNum(breakdown.final)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  if (Math.abs(n) >= 10) return n.toFixed(1);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(3);
}
