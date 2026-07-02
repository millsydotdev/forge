import React from 'react';

export function Icon({ name, size = 20, fill = false, className = '' }: {
  name: string;
  size?: number;
  fill?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    >
      {name}
    </span>
  );
}
