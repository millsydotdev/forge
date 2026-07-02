import React, { useState, useRef, useEffect } from 'react';
import { useAssetUrl } from '../../hooks/useAssetUrl';
import { visualManager } from '../../services/visual-manager';
import { logger } from '../../utils/logger';

/** LRU memory cache for decoded image blobs (max 50 entries) */
const imageMemoryCache = new Map<string, string>();
const MAX_MEMORY_CACHE = 50;

export function AssetImage({
  imageName,
  className,
  style,
  alt = '',
}: {
  imageName?: string;
  className: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const src = useAssetUrl(imageName);
  const [failed, setFailed] = useState(false);
  const loadStartRef = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageName && src) {
      // Check memory cache
      const cached = imageMemoryCache.get(src);
      if (cached && imgRef.current) {
        imgRef.current.src = cached;
        return;
      }
      loadStartRef.current = performance.now();
      logger.mark(`img-start-${imageName}`);
    }
  }, [imageName, src]);

  if (!imageName) return null;

  const resolved = failed ? visualManager.getPlaceholder('item') : src;

  const handleLoad = () => {
    if (loadStartRef.current > 0 && imageName) {
      logger.mark(`img-end-${imageName}`);
      logger.measure(`image-load-${imageName}`, `img-start-${imageName}`, `img-end-${imageName}`);

      // Add to memory cache
      if (imgRef.current?.src && !imageMemoryCache.has(src)) {
        imageMemoryCache.set(src, imgRef.current.src);
        if (imageMemoryCache.size > MAX_MEMORY_CACHE) {
          const firstKey = imageMemoryCache.keys().next().value;
          if (firstKey) imageMemoryCache.delete(firstKey);
        }
      }
      loadStartRef.current = 0;
    }
  };

  const handleError = () => {
    setFailed(true);
    // Cache the failure to avoid repeated attempts
    if (src) imageMemoryCache.set(src, '');
  };

  return (
    <img
      ref={imgRef}
      className={className}
      src={resolved}
      alt={alt}
      draggable={false}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
