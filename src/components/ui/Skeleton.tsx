import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--wf-panel) 25%, rgba(255,255,255,0.06) 50%, var(--wf-panel) 75%)',
        backgroundSize: '200% 100%',
        animation: 'wb-shimmer 1.5s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({
  width = 160,
  height = 220,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: 6,
        background: 'var(--wf-panel)',
        border: '1px solid var(--wf-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        gap: 6,
        ...style,
      }}
    >
      <Skeleton height={80} borderRadius={4} />
      <Skeleton height={12} width="60%" />
      <Skeleton height={10} width="40%" />
      <div style={{ marginTop: 'auto', display: 'flex', gap: 4 }}>
        <Skeleton height={6} width={12} borderRadius={3} />
        <Skeleton height={6} width={12} borderRadius={3} />
        <Skeleton height={6} width={12} borderRadius={3} />
      </div>
    </div>
  );
}

export function SkeletonLine({
  width = '100%',
  height = 12,
  className,
  style,
}: SkeletonProps) {
  return (
    <Skeleton width={width} height={height} borderRadius={3} className={className} style={style} />
  );
}
