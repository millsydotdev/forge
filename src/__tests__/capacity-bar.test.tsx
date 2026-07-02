import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CapacityBar } from '../features/build-planner/components/capacity-bar';
import type { CapacityBreakdown } from '../engine/polarity';

function makeCap(overrides?: Partial<CapacityBreakdown>): CapacityBreakdown {
  return { used: 18, total: 30, remaining: 12, overCap: false, ...overrides };
}

describe('CapacityBar', () => {
  it('renders used/total label', () => {
    render(<CapacityBar cap={makeCap()} />);
    expect(screen.getByText('18/30')).toBeInTheDocument();
  });

  it('applies progressbar ARIA attributes', () => {
    render(<CapacityBar cap={makeCap()} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '18');
    expect(bar).toHaveAttribute('aria-valuemax', '30');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
  });

  it('shows red label when over capacity', () => {
    render(<CapacityBar cap={makeCap({ used: 32, total: 30, overCap: true })} />);
    const label = screen.getByText('32/30');
    expect(label).toHaveStyle('color: var(--wf-red)');
  });

  it('renders fill with correct width percentage', () => {
    const { container } = render(<CapacityBar cap={makeCap({ used: 15, total: 30 })} />);
    const fill = container.querySelector('.cap-bar-fill');
    expect(fill).toHaveStyle('width: 50%');
  });

  it('caps fill at 100% when used exceeds total', () => {
    const { container } = render(<CapacityBar cap={makeCap({ used: 60, total: 30, overCap: true })} />);
    const fill = container.querySelector('.cap-bar-fill');
    expect(fill).toHaveStyle('width: 100%');
  });

  it('shows 0% fill when total is 0', () => {
    const { container } = render(<CapacityBar cap={makeCap({ used: 0, total: 0 })} />);
    const fill = container.querySelector('.cap-bar-fill');
    expect(fill).toHaveStyle('width: 0%');
  });
});
