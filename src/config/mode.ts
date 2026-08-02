// Site mode: the immersive 3D club vs the conventional 2D site.
export type SiteMode = 'club' | 'simple';

export const MODE_STORAGE_KEY = 'zachtrax:mode';

/**
 * Auto default when the user hasn't made an explicit choice.
 * Club is desktop-only and skipped for reduced-motion users.
 */
export function computeDefaultMode(isDesktop: boolean, prefersReducedMotion: boolean): SiteMode {
  if (prefersReducedMotion) return 'simple';
  return isDesktop ? 'club' : 'simple';
}

export function readStoredMode(): SiteMode | null {
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY);
    return v === 'club' || v === 'simple' ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredMode(mode: SiteMode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore (private mode / disabled storage) */
  }
}

export function clearStoredMode(): void {
  try {
    localStorage.removeItem(MODE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
