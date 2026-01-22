/**
 * Audio file URLs configuration
 * 
 * Supports multiple storage backends:
 * - S3 (AWS S3 or CloudFront CDN)
 * - Vercel Blob Storage
 * - Direct URL mappings
 */

// Public audio configuration (Cloudflare R2, S3, or CDN)
// Option 1: Use a public CDN/custom domain (recommended)
const PUBLIC_AUDIO_CONFIG = {
  baseUrl:
    import.meta.env.VITE_PUBLIC_AUDIO_BASE_URL ||
    import.meta.env.VITE_S3_BASE_URL ||
    '',

  // Optional: If generating S3-style URLs directly
  bucketName: import.meta.env.VITE_S3_BUCKET_NAME || '',
  region: import.meta.env.VITE_S3_REGION || 'us-east-1',

  // Prefix path in storage (e.g., 'audio' if files are under /audio/)
  prefix:
    import.meta.env.VITE_PUBLIC_AUDIO_PREFIX ||
    import.meta.env.VITE_S3_PREFIX ||
    '',

  // Enable public URL generation
  enabled:
    import.meta.env.VITE_PUBLIC_AUDIO_ENABLED === 'true' ||
    import.meta.env.VITE_USE_S3 === 'true' ||
    false,
};

// Direct URL mappings (for files with custom URLs or Vercel Blob)
// These take priority over S3 URL generation
// Using direct CloudFront URLs as fallback until env vars are set in Vercel
export const audioUrlMap: Record<string, string> = {
  // Keep empty unless you need per-file overrides.
};

/**
 * Generate public URL for an audio file
 */
function getPublicUrl(localPath: string): string {
  // Remove leading slash or 'public/' prefix
  const cleanPath = localPath
    .replace(/^\/?public\/?/, '')
    .replace(/^audio\//, '');
  
  // Encode the path for URL (handles spaces and special characters)
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  if (PUBLIC_AUDIO_CONFIG.baseUrl) {
    // Use public CDN/custom domain or direct R2/S3 URL
    const base = PUBLIC_AUDIO_CONFIG.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const prefix = PUBLIC_AUDIO_CONFIG.prefix ? `${PUBLIC_AUDIO_CONFIG.prefix}/` : '';
    return `${base}/${prefix}${encodedPath}`;
  } else if (PUBLIC_AUDIO_CONFIG.bucketName) {
    // Generate S3 URL from bucket name and region
    const prefix = PUBLIC_AUDIO_CONFIG.prefix ? `${PUBLIC_AUDIO_CONFIG.prefix}/` : '';
    return `https://${PUBLIC_AUDIO_CONFIG.bucketName}.s3.${PUBLIC_AUDIO_CONFIG.region}.amazonaws.com/${prefix}${encodedPath}`;
  }
  
  return '';
}

/**
 * Get audio URL - supports S3, direct mappings, and local fallback
 */
export function getAudioUrl(localPath: string): string {
  // Remove leading slash or 'public/' prefix
  const cleanPath = localPath
    .replace(/^\/?public\/?/, '')
    .replace(/^audio\//, '');
  
  // Debug logging (enable in production too for troubleshooting)
  console.log('[getAudioUrl] Input path:', localPath);
  console.log('[getAudioUrl] Clean path:', cleanPath);
  console.log('[getAudioUrl] Public audio config:', {
    enabled: PUBLIC_AUDIO_CONFIG.enabled,
    baseUrl: PUBLIC_AUDIO_CONFIG.baseUrl,
    prefix: PUBLIC_AUDIO_CONFIG.prefix,
    bucketName: PUBLIC_AUDIO_CONFIG.bucketName,
  });
  
  // 1. Check direct URL mappings first (highest priority)
  if (audioUrlMap[cleanPath]) {
    const url = audioUrlMap[cleanPath];
    console.log('[getAudioUrl] Using direct mapping:', url);
    return url;
  }
  
  // 2. Generate public URL if enabled
  if (PUBLIC_AUDIO_CONFIG.enabled) {
    const publicUrl = getPublicUrl(localPath);
    if (publicUrl) {
      console.log('[getAudioUrl] Generated public URL:', publicUrl);
      return publicUrl;
    }
  }
  
  // 3. Fallback to local path (for development)
  const fallbackUrl = localPath.startsWith('/') 
    ? (localPath.startsWith('/audio/') ? localPath : `/audio${localPath}`)
    : `/audio/${localPath}`;
  
  console.log('[getAudioUrl] Using fallback URL:', fallbackUrl);
  return fallbackUrl;
}
