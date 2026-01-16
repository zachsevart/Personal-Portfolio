/**
 * Audio file URLs configuration
 * 
 * Supports multiple storage backends:
 * - S3 (AWS S3 or CloudFront CDN)
 * - Vercel Blob Storage
 * - Direct URL mappings
 */

// S3 Configuration
// Option 1: Use CloudFront CDN (recommended for better performance)
const S3_CONFIG = {
  // Set this to your CloudFront distribution URL (e.g., 'https://d1234567890.cloudfront.net')
  // OR use direct S3 bucket URL (e.g., 'https://your-bucket.s3.region.amazonaws.com')
  baseUrl: import.meta.env.VITE_S3_BASE_URL || '',
  
  // If using S3 directly, specify bucket name and region
  // If using CloudFront, leave these empty
  bucketName: import.meta.env.VITE_S3_BUCKET_NAME || '',
  region: import.meta.env.VITE_S3_REGION || 'us-east-1',
  
  // Prefix path in S3 bucket (e.g., 'audio' if files are in s3://bucket/audio/)
  prefix: import.meta.env.VITE_S3_PREFIX || 'audio',
  
  // Enable S3 URL generation
  enabled: import.meta.env.VITE_USE_S3 === 'true' || false,
};

// Direct URL mappings (for files with custom URLs or Vercel Blob)
export const audioUrlMap: Record<string, string> = {
  // Map your audio file paths to direct URLs
  // 'halloween/01 Halloween_1outof4.wav': 'https://your-custom-url.com/audio/halloween/01%20Halloween_1outof4.wav',
  // ' mixes/01 mix006.wav': 'https://your-custom-url.com/audio/ mixes/01%20mix006.wav',
};

/**
 * Generate S3 URL for an audio file
 */
function getS3Url(localPath: string): string {
  // Remove leading slash or 'public/' prefix
  const cleanPath = localPath
    .replace(/^\/?public\/?/, '')
    .replace(/^audio\//, '');
  
  // Encode the path for URL (handles spaces and special characters)
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  if (S3_CONFIG.baseUrl) {
    // Use CloudFront or direct S3 URL
    const base = S3_CONFIG.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const prefix = S3_CONFIG.prefix ? `${S3_CONFIG.prefix}/` : '';
    return `${base}/${prefix}${encodedPath}`;
  } else if (S3_CONFIG.bucketName) {
    // Generate S3 URL from bucket name and region
    const prefix = S3_CONFIG.prefix ? `${S3_CONFIG.prefix}/` : '';
    return `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${prefix}${encodedPath}`;
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
  console.log('[getAudioUrl] S3 Config:', {
    enabled: S3_CONFIG.enabled,
    baseUrl: S3_CONFIG.baseUrl,
    prefix: S3_CONFIG.prefix,
    bucketName: S3_CONFIG.bucketName,
  });
  
  // 1. Check direct URL mappings first (highest priority)
  if (audioUrlMap[cleanPath]) {
    const url = audioUrlMap[cleanPath];
    console.log('[getAudioUrl] Using direct mapping:', url);
    return url;
  }
  
  // 2. Generate S3 URL if enabled
  if (S3_CONFIG.enabled) {
    const s3Url = getS3Url(localPath);
    if (s3Url) {
      console.log('[getAudioUrl] Generated S3 URL:', s3Url);
      return s3Url;
    }
  }
  
  // 3. Fallback to local path (for development)
  const fallbackUrl = localPath.startsWith('/') 
    ? (localPath.startsWith('/audio/') ? localPath : `/audio${localPath}`)
    : `/audio/${localPath}`;
  
  console.log('[getAudioUrl] Using fallback URL:', fallbackUrl);
  return fallbackUrl;
}
