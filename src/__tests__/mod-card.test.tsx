import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModCard, EmptyModCard } from '../features/build-planner/components/mod-card';
import type { ModSlot } from '../features/build-planner/model';

vi.mock('../features/build-planner/hooks/use-mod-card-image', () => ({
  useModCardImage: () => null,
}));

function baseMod(overrides?: Partial<ModSlot>): ModSlot {
  return {
    uniqueName: '/Lotus/Mods/test/Mod',
    name: 'Test Mod',
    rank: 3,
    maxRank: 5,
    baseDrain: 6,
    polarity: 'MADURAI',
    ...overrides,
  };
}

describe('ModCard', () => {
  it('renders mod name', () => {
    render(<ModCard mod={baseMod()} slotPol="MADURAI" onRemove={() => {}} onRankChange={() => {}} />);
    expect(screen.getByText('Test Mod')).toBeInTheDocument();
  });

  it('renders drain cost', () => {
    render(<ModCard mod={baseMod({ baseDrain: 6, rank: 3 })} slotPol="MADURAI" onRemove={() => {}} onRankChange={() => {}} />);
    const drain = document.querySelector('.mod-card-drain');
    expect(drain).toBeTruthy();
    expect(drain?.textContent).toBeTruthy();
  });

  it('renders rank dots equal to maxRank + 1', () => {
    const { container } = render(<ModCard mod={baseMod({ maxRank: 5 })} slotPol="MADURAI" onRemove={() => {}} onRankChange={() => {}} />);
    expect(container.querySelectorAll('.rank-dot')).toHaveLength(6);
  });

  it('filled rank dots match current rank', () => {
    const { container } = render(<ModCard mod={baseMod({ rank: 3, maxRank: 5 })} slotPol="MADURAI" onRemove={() => {}} onRankChange={() => {}} />);
    const filled = container.querySelectorAll('.rank-dot.filled');
    expect(filled).toHaveLength(4);
  });

  it('calls onRankChange when rank dot clicked', () => {
    const fn = vi.fn();
    const { container } = render(<ModCard mod={baseMod()} slotPol="MADURAI" onRemove={() => {}} onRankChange={fn} />);
    const dots = container.querySelectorAll('.rank-dot');
    fireEvent.click(dots[4]);
    expect(fn).toHaveBeenCalledWith(4);
  });

  it('calls onRemove when remove button clicked', () => {
    const fn = vi.fn();
    render(<ModCard mod={baseMod()} slotPol="MADURAI" onRemove={fn} onRankChange={() => {}} />);
    fireEvent.click(screen.getByText('×'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('shows tooltip on hover', () => {
    render(<ModCard mod={baseMod({ name: 'Primed Test', rarity: 'Legendary' })} slotPol="VAZARIN" onRemove={() => {}} onRankChange={() => {}} />);
    fireEvent.mouseEnter(screen.getByText('Primed Test').closest('.mod-card')!);
    expect(screen.getByText(/Rarity/)).toBeInTheDocument();
    expect(screen.getByText(/Legendary/)).toBeInTheDocument();
  });
});

describe('EmptyModCard', () => {
  it('renders polarity symbol and plus sign', () => {
    render(<EmptyModCard slotPol="MADURAI" onClick={() => {}} />);
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const fn = vi.fn();
    render(<EmptyModCard slotPol="NAIRU" onClick={fn} />);
    fireEvent.click(screen.getByText('+'));
    expect(fn).toHaveBeenCalledOnce();
  });
});
