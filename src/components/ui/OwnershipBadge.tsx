import type { OwnershipState } from '../../features/build-planner/model';

interface OwnershipBadgeProps {
  state: OwnershipState;
  size?: 'sm' | 'md';
  className?: string;
}

const BADGE_CONFIG: Record<OwnershipState, { symbol: string; color: string; label: string }> = {
  owned: { symbol: '✓', color: 'var(--wf-green)', label: 'Owned' },
  missing: { symbol: '○', color: 'var(--wf-text-muted)', label: 'Missing' },
  wishlisted: { symbol: '▲', color: 'var(--wf-gold)', label: 'Wishlisted' },
  favorite: { symbol: '★', color: 'var(--wf-gold)', label: 'Favorite' },
  upgradeable: { symbol: '⬆', color: 'var(--wf-orange)', label: 'Upgrade Available' },
  unknown: { symbol: '?', color: 'var(--wf-text-muted)', label: 'Unknown' },
};

export function OwnershipBadge({ state, size = 'sm', className }: OwnershipBadgeProps) {
  if (state === 'unknown' || state === 'missing') return null;

  const cfg = BADGE_CONFIG[state];
  const dimPx = size === 'sm' ? 14 : 18;

  return (
    <span
      className={`ownership-badge ownership-badge--${state} ${className ?? ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimPx,
        height: dimPx,
        borderRadius: '50%',
        fontSize: size === 'sm' ? 8 : 10,
        fontWeight: 700,
        color: cfg.color,
        background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${cfg.color} 30%, transparent)`,
        lineHeight: 1,
      }}
      title={cfg.label}
    >
      {cfg.symbol}
    </span>
  );
}

export function getOwnershipDisplay(state: OwnershipState): { symbol: string; color: string; label: string } {
  return BADGE_CONFIG[state] ?? BADGE_CONFIG.unknown;
}
