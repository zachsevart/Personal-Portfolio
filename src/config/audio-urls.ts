/**
 * Audio file URLs from Vercel Blob Storage
 * 
 * This file is auto-generated after running: npm run upload-audio
 * 
 * After uploading your audio files to Vercel Blob, copy the URLs from
 * blob-upload-results.json into this mapping.
 */

export const audioUrlMap: Record<string, string> = {
  // Map your audio file paths to Vercel Blob URLs
  'halloween/01 Halloween_1outof4.wav': 'https://yfpfs8e2jwrpj9bm.public.blob.vercel-storage.com/01%20Halloween_1outof4.wav',
  // Example:
  // 'mixes/01 mix004.wav': 'https://[your-store].public.blob.vercel-storage.com/audio/mixes/01%20mix004.wav',
};

/**
 * Get audio URL from blob storage
 * Falls back to local path if not found in map
 */
export function getAudioUrl(localPath: string): string {
  // Remove leading slash or 'public/' prefix
  const cleanPath = localPath
    .replace(/^\/?public\/?/, '')
    .replace(/^audio\//, '');
  
  // Check if we have a blob URL for this file
  if (audioUrlMap[cleanPath]) {
    return audioUrlMap[cleanPath];
  }
  
  // Fallback to local path (for development)
  return localPath.startsWith('/') ? localPath : `/${localPath}`;
}
