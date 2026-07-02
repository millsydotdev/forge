import React from 'react';
import { visualManager } from '../../services/visual-manager';
import type { Polarity } from '../../engine/build-core';
import { POLARITY_SYMBOL, POLARITY_COLOR } from '../../engine/polarity';

export type IconType =
  | { type: 'polarity'; polarity: Polarity }
  | { type: 'damage'; damage: string }
  | { type: 'cdn'; imageName: string }
  | { type: 'unicode'; symbol: string; color?: string };

interface IconProps {
  icon: IconType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ icon, size = 16, className, style }: IconProps) {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  };

  if (icon.type === 'polarity') {
    return (
      <span
        className={className}
        style={{
          ...baseStyle,
          color: POLARITY_COLOR[icon.polarity] ?? '#fff',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: size * 0.7,
          lineHeight: 1,
        }}
        aria-label={`Polarity: ${icon.polarity}`}
      >
        {POLARITY_SYMBOL[icon.polarity]}
      </span>
    );
  }

  if (icon.type === 'damage') {
    const url = visualManager.getDamageIcon(icon.damage);
    return (
      <img
        className={className}
        src={url}
        alt={icon.damage}
        style={baseStyle}
        draggable={false}
      />
    );
  }

  if (icon.type === 'cdn') {
    const url = visualManager.getImageUrl(icon.imageName);
    return (
      <img
        className={className}
        src={url}
        alt=""
        style={baseStyle}
        draggable={false}
      />
    );
  }

  if (icon.type === 'unicode') {
    return (
      <span
        className={className}
        style={{
          ...baseStyle,
          color: icon.color ?? 'var(--wf-text)',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1,
          fontSize: size * 0.7,
        }}
      >
        {icon.symbol}
      </span>
    );
  }

  return null;
}
