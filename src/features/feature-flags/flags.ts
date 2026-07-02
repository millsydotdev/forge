// Feature flag definitions for TennoDex.
// All flags are enabled (true) by default except those we intentionally disable.
// Add new flags as needed; the type system ensures only known flags are used.
export const FeatureFlags = {
  // Controls the Overframe import modal and menu entry.
  // Set to true to enable the Overframe import feature.
  overframeImport: false,
} as const;

export type FeatureFlag = keyof typeof FeatureFlags;
