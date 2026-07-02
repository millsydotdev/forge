interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  variant?: 'line' | 'card' | 'circle' | 'rect';
  count?: number;
}

export function SkeletonLoader({
  width = '100%',
  height = 12,
  borderRadius = 3,
  variant = 'line',
  count = 1,
}: SkeletonLoaderProps) {
  const elements = [];
  for (let i = 0; i < count; i++) {
    const style: React.CSSProperties = {
      width: variant === 'circle' ? (height as number) : width,
      height: variant === 'circle' ? height : (variant === 'line' ? height : '100%'),
      borderRadius: variant === 'circle' ? '50%' : borderRadius,
      background: 'linear-gradient(90deg, var(--wf-panel) 25%, var(--wf-panel-high) 50%, var(--wf-panel) 75%)',
      backgroundSize: '200px 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      opacity: 0.5,
      marginBottom: count > 1 ? 4 : 0,
    };
    elements.push(<div key={i} className="skeleton-loader" style={style} />);
  }
  return <>{elements}</>;
}
