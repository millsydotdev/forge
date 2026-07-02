import React from 'react';
import type { CalcBreakdown } from '../../../engine/calc-breakdown';

export function WhyTree({ breakdown, statName }: { breakdown: CalcBreakdown | undefined; statName: string }) {
  if (!breakdown) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--wf-text-muted)', padding: 16, fontSize: 12 }}>
        No breakdown data available for this stat.
      </div>
    );
  }

  const hasFlats = breakdown.flats.length > 0;
  const hasMults = breakdown.multipliers.length > 0;
  const hasDetail = hasFlats || hasMults;

  return (
    <div style={{ padding: 8, animation: 'wb-fade-in var(--transition-normal)' }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--wf-text)', fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>
          {statName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--wf-text-muted)' }}>Calculation Breakdown</div>
      </div>

      {/* Base value */}
      <div className="why-section">
        <div className="why-section-title" style={sectionTitleStyle}>BASE</div>
        <div className="why-contribution" style={contributionStyle}>
          <span style={{ color: 'var(--wf-text)', fontSize: 12 }}>{breakdown.baseSource}</span>
          <span style={{ color: 'var(--wf-gold)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {formatNum(breakdown.base)}
          </span>
        </div>
      </div>

      {/* Flat additions */}
      {hasFlats && (
        <div className="why-section" style={{ marginTop: 6 }}>
          <div className="why-section-title" style={{ ...sectionTitleStyle, color: 'var(--wf-teal)' }}>
            + FLAT ADDITIONS
          </div>
          {breakdown.flats.map((f, i) => (
            <div key={i} className="why-contribution" style={contributionStyle}>
              <span style={{ fontSize: 11, color: 'var(--wf-text-dim)' }}>{f.source}</span>
              <span style={{ fontSize: 11, color: 'var(--wf-teal)', fontFamily: 'var(--font-mono)' }}>
                +{formatNum(f.value)}
              </span>
            </div>
          ))}
          <div className="why-sum" style={sumStyle}>
            <span style={{ fontSize: 11, color: 'var(--wf-text-muted)' }}>Flat Sum</span>
            <span style={{ fontSize: 11, color: 'var(--wf-teal)', fontFamily: 'var(--font-mono)' }}>
              +{formatNum(breakdown.flatSum - breakdown.base)}
            </span>
          </div>
        </div>
      )}

      {/* Multipliers */}
      {hasMults && (
        <div className="why-section" style={{ marginTop: 6 }}>
          <div className="why-section-title" style={{ ...sectionTitleStyle, color: 'var(--wf-green)' }}>
            × MULTIPLIERS
          </div>
          {breakdown.multipliers.map((m, i) => (
            <div key={i} className="why-contribution" style={contributionStyle}>
              <span style={{ fontSize: 11, color: 'var(--wf-text-dim)' }}>{m.source}</span>
              <span style={{ fontSize: 11, color: 'var(--wf-green)', fontFamily: 'var(--font-mono)' }}>
                {m.value >= 0 ? '+' : ''}{(m.value * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          <div className="why-sum" style={sumStyle}>
            <span style={{ fontSize: 11, color: 'var(--wf-text-muted)' }}>Mult Total</span>
            <span style={{ fontSize: 11, color: 'var(--wf-green)', fontFamily: 'var(--font-mono)' }}>
              ×{(1 + breakdown.multiplierSum).toFixed(3)}
            </span>
          </div>
        </div>
      )}

      {/* Formula */}
      {hasDetail && (
        <div style={{
          marginTop: 8, padding: '6px 8px',
          background: 'rgba(0,0,0,0.2)', borderRadius: 3,
          border: '1px solid var(--wf-border)',
          fontSize: 10, color: 'var(--wf-text-muted)',
          fontFamily: 'var(--font-mono)',
          wordBreak: 'break-all',
        }}>
          {breakdown.formula}
        </div>
      )}

      {/* Final value */}
      <div className="why-final" style={{
        marginTop: 8, padding: '6px 8px',
        background: 'rgba(200, 164, 94, 0.08)',
        border: '1px solid var(--wf-gold-dim)',
        borderRadius: 3,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--wf-gold)', fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
          FINAL
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--wf-gold)', fontFamily: 'var(--font-mono)' }}>
          {formatNum(breakdown.final)}
        </span>
      </div>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
  color: 'var(--wf-gold)', textTransform: 'uppercase',
  marginBottom: 4, fontFamily: 'var(--font-display)',
};

const contributionStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  padding: '2px 0', borderBottom: '1px solid rgba(100,120,140,0.1)',
};

const sumStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  padding: '3px 0', marginTop: 2,
  borderTop: '1px dashed var(--wf-border)',
};

function formatNum(n: number): string {
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  if (Math.abs(n) >= 10) return n.toFixed(1);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(3);
}
