/**
 * Audio file URLs configuration
 * Uses Cloudflare R2 storage in production, local files in development
 */

// Get the base URL from environment variable (set in Vercel)
const AUDIO_BASE_URL = import.meta.env.VITE_PUBLIC_AUDIO_BASE_URL || '';

/**
 * Get audio URL for a given filename
 * Uses Cloudflare R2 URL if configured, otherwise falls back to local path
 */
export function getAudioUrl(filename: string): string {
  // Clean the filename - remove any path prefixes
  const cleanFilename = filename
    .replace(/^\/?public\/?/, '')
    .replace(/^audio\//, '');

  // Encode the filename for URL (handles spaces and special characters)
  const encodedFilename = encodeURIComponent(cleanFilename);

  // If base URL is configured, use Cloudflare R2
  if (AUDIO_BASE_URL) {
    const base = AUDIO_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    return `${base}/${encodedFilename}`;
  }

  // Fallback to local path for development
  return `/audio/${cleanFilename}`;
}
