import React, { useMemo } from 'react';

export function StatDelta({ current, previous, decimals = 0 }: {
  current: number;
  previous: number | undefined;
  decimals?: number;
}) {
  const { delta, visible } = useMemo(() => {
    if (previous === undefined || current === previous) return { delta: 0, visible: false };
    return { delta: current - previous, visible: true };
  }, [current, previous]);

  if (!visible || delta === 0) return null;

  const isPos = delta > 0;
  return (
    <span
      className="stat-delta"
      style={{
        color: isPos ? 'var(--wf-green, #4ade80)' : 'var(--wf-red, #f87171)',
        marginLeft: 4,
        fontSize: '0.85em',
        fontWeight: 700,
      }}
    >
      {isPos ? '▲' : '▼'} {Math.abs(delta).toFixed(decimals)}
    </span>
  );
}
