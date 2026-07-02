import { useState, useMemo } from 'react';


interface AuditCheck {
  name: string;
  category: string;
  pass: boolean;
  detail?: string;
}

export function VisualAudit({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<AuditCheck[]>([]);
  const [running, setRunning] = useState(false);

  const runAudit = () => {
    setRunning(true);
    const checks: AuditCheck[] = [];

    // Typography
    checks.push(checkTypography());
    checks.push(...checkFontSizes());

    // Spacing
    checks.push(...checkSpacing());

    // Radius
    checks.push(...checkRadius());

    // Artwork
    checks.push(...checkArtwork());

    // Colors
    checks.push(...checkHardcodedColors());

    setResults(checks);
    setRunning(false);
  };

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const passed = results.filter(r => r.pass).length;
    return {
      total: results.length,
      passed,
      failed: results.length - passed,
      percent: Math.round((passed / results.length) * 100),
    };
  }, [results]);

  return (
    <div className="diag-overlay" onClick={onClose}>
      <div className="diag-panel" onClick={e => e.stopPropagation()} style={{ width: 700 }}>
        <div className="diag-header">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--wf-teal)' }}>
            🎨 Visual Audit
          </span>
          <button className="diag-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          <button
            onClick={runAudit}
            disabled={running}
            style={{
              padding: '6px 16px', border: '1px solid var(--wf-teal-dim)',
              borderRadius: 4, background: 'transparent', color: 'var(--wf-teal)',
              cursor: 'pointer', marginBottom: 12,
            }}
          >
            {running ? 'Running...' : 'Run Audit'}
          </button>

          {stats && (
            <div style={{
              padding: 8, marginBottom: 8, borderRadius: 4,
              background: stats.percent >= 95 ? 'rgba(80,208,128,0.1)' : 'rgba(232,122,48,0.1)',
              border: `1px solid ${stats.percent >= 95 ? 'var(--wf-green)' : 'var(--wf-orange)'}`,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: stats.percent >= 95 ? 'var(--wf-green)' : 'var(--wf-orange)' }}>
                {stats.percent}%
              </span>
              <span style={{ fontSize: 11, color: 'var(--wf-text-muted)', marginLeft: 8 }}>
                {stats.passed}/{stats.total} passed · {stats.failed} failed
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflow: 'auto' }}>
            {results.length === 0 && !running && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--wf-text-muted)', fontSize: 12 }}>
                Click &ldquo;Run Audit&rdquo; to check visual consistency.
              </div>
            )}
            {results.map((check, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 8px', fontSize: 11,
                background: check.pass ? 'transparent' : 'rgba(255,180,171,0.05)',
                borderRadius: 2,
              }}>
                <span style={{ color: check.pass ? 'var(--wf-green)' : 'var(--wf-red)' }}>
                  {check.pass ? '✓' : '✗'}
                </span>
                <span style={{ color: 'var(--wf-text-dim)', width: 100, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {check.category}
                </span>
                <span style={{ color: 'var(--wf-text)' }}>{check.name}</span>
                {check.detail && <span style={{ color: 'var(--wf-text-muted)', marginLeft: 'auto', fontSize: 10 }}>{check.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Audit Check Implementations ─────────────────────

function checkTypography(): AuditCheck {
  const bodyFont = getComputedStyle(document.body).fontFamily;
  const hasInter = bodyFont.includes('Inter');
  return {
    name: 'Body font is Inter',
    category: 'Typography',
    pass: hasInter,
    detail: hasInter ? bodyFont.substring(0, 40) : `Found: ${bodyFont.substring(0, 40)}`,
  };
}

function checkFontSizes(): AuditCheck[] {
  const texts = document.querySelectorAll('p, span, div, label, button');
  let smallCount = 0;
  texts.forEach(el => {
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size > 0 && size < 8) smallCount++;
  });
  return [{
    name: `Font sizes below 8px: ${smallCount}`,
    category: 'Typography',
    pass: smallCount === 0,
    detail: smallCount > 0 ? `${smallCount} elements found` : undefined,
  }];
}

function checkSpacing(): AuditCheck[] {
  const panels = document.querySelectorAll('.wb-shell, .wb-topbar, .wb-left, .wb-right, .wb-bottom');
  let inconsistent = 0;
  panels.forEach(el => {
    const pad = parseFloat(getComputedStyle(el).paddingLeft || '0');
    if (pad > 0 && pad !== 10 && pad !== 12 && pad !== 16) inconsistent++;
  });
  return [{
    name: 'Panel padding consistency',
    category: 'Spacing',
    pass: inconsistent === 0,
    detail: inconsistent > 0 ? `${inconsistent} panels with non-standard padding` : undefined,
  }];
}

function checkRadius(): AuditCheck[] {
  const cards = document.querySelectorAll('.mod-card, .project-card, .explorer__card, .lib-card');
  let nonStandard = 0;
  cards.forEach(el => {
    const r = parseFloat(getComputedStyle(el).borderRadius || '0');
    if (r > 0 && r !== 4 && r !== 6 && r !== 8) nonStandard++;
  });
  return [{
    name: 'Card border radius consistency',
    category: 'Radius',
    pass: nonStandard === 0,
    detail: nonStandard > 0 ? `${nonStandard} cards with non-standard radius` : undefined,
  }];
}

function checkArtwork(): AuditCheck[] {
  const imgs = document.querySelectorAll('img[src*="cdn.warframestat.us"]');
  let broken = 0;
  imgs.forEach(img => {
    if ((img as HTMLImageElement).naturalWidth === 0) broken++;
  });
  return [{
    name: 'Broken CDN images',
    category: 'Artwork',
    pass: broken === 0,
    detail: broken > 0 ? `${broken} images failed to load` : undefined,
  }];
}

function checkHardcodedColors(): AuditCheck[] {
  const allElements = document.querySelectorAll('*');
  let hardcoded = 0;
  const hexColor = /#[0-9a-fA-F]{6}/;
  allElements.forEach(el => {
    const style = (el as HTMLElement).style;
    if (style.color && hexColor.test(style.color)) hardcoded++;
    if (style.backgroundColor && hexColor.test(style.backgroundColor)) hardcoded++;
  });
  return [{
    name: 'Hardcoded hex colors (inline styles)',
    category: 'Colors',
    pass: hardcoded === 0,
    detail: hardcoded > 0 ? `${hardcoded} elements with hex inline colors` : undefined,
  }];
}
