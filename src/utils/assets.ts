// src/utils/assets.ts
// Helper functions for constructing Warframe CDN image URLs.
// All images are hosted at https://cdn.warframestat.us/img/.
// Functions return a full URL string; callers can use it directly in <img src>.
// Simple fallback URLs are provided for missing data.

const CDN_BASE = "https://cdn.warframestat.us/img/";

/**
 * Returns the absolute CDN URL for a given image name.
 * If `imageName` is missing or empty, returns a placeholder URL.
 */
export function getImageUrl(imageName?: string): string {
  if (!imageName) return `${CDN_BASE}placeholder.png`;
  // Ensure the image name is safely URL‑encoded.
  return `${CDN_BASE}${encodeURIComponent(imageName)}`;
}

/** Build a URL for a mod card image. */
export function getModImage(mod: { imageName?: string }): string {
  return getImageUrl(mod.imageName);
}

/** Warframe portrait – large portrait used in top bar. */
export function getWarframePortrait(frame: { imageName?: string }): string {
  // Portraits use the same image name as warframe items.
  return getImageUrl(frame.imageName);
}

/** Ability icon URL. */
export function getAbilityIcon(ability: { imageName?: string }): string {
  return getImageUrl(ability.imageName);
}

/** Shard image based on color and optionally Tau‑forged. */
export function getShardImage(color: string, isTau: boolean = false): string {
  // Shard images are named like "Shard_Amber.png" etc. Tau‑forged shards have a suffix "_Tau".
  const base = `Shard_${capitalize(color)}`;
  const name = isTau ? `${base}_Tau.png` : `${base}.png`;
  return `${CDN_BASE}${name}`;
}

/** Weapon image – uses the weapon's imageName field. */
export function getWeaponImage(weapon: { imageName?: string }): string {
  return getImageUrl(weapon.imageName);
}

/** Arcane card image. */
export function getArcaneImage(arcane: { imageName?: string }): string {
  return getImageUrl(arcane.imageName);
}

/** Enemy image – some enemies have an imageName; fallback to placeholder. */
export function getEnemyImage(enemy: { imageName?: string }): string {
  return getImageUrl(enemy.imageName);
}

/** Damage type icon (Heat, Slash, etc.). */
export function getDamageIcon(type: string): string {
  // Types are capitalised in the CDN (e.g., "Heat.png").
  const clean = capitalize(type.trim());
  return `${CDN_BASE}${clean}.png`;
}

/** Polarity symbol image. */
export function getPolarityIcon(polarity: string): string {
  // Polarity icons follow the pattern "Polarity_Vazarin.png" etc.
  const clean = polarity.charAt(0).toUpperCase() + polarity.slice(1).toLowerCase();
  return `${CDN_BASE}Polarity_${clean}.png`;
}

/** Capitalise first letter, lower‑case the rest. */
function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Export a namespace for convenient imports.
export const assets = {
  getImageUrl,
  getModImage,
  getWarframePortrait,
  getAbilityIcon,
  getShardImage,
  getWeaponImage,
  getArcaneImage,
  getEnemyImage,
  getDamageIcon,
  getPolarityIcon,
};
