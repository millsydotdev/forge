import { FeatureFlags, FeatureFlag } from './flags';

/**
 * Simple hook to read a static feature flag.
 * Currently flags are static compile‑time values, but this hook provides a single place to
 * add runtime override logic later (e.g., reading a JSON config file).
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return FeatureFlags[flag];
}
