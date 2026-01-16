# Audio Troubleshooting Guide

If your audio files aren't playing, follow these steps to identify and fix the issue.

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Look for error messages or debug logs

You should see logs like:
```
[getAudioUrl] Input path: halloween/01 Halloween_1outof4.wav
[getAudioUrl] Clean path: halloween/01 Halloween_1outof4.wav
[getAudioUrl] S3 Config: { enabled: true, baseUrl: "https://...", ... }
[getAudioUrl] Generated S3 URL: https://...
[AudioPlayer] Loading audio for "...": https://...
```

## Step 2: Check Network Tab

1. In Developer Tools, go to the **Network** tab
2. Try to play an audio file
3. Look for requests to your audio files
4. Check the status code:
   - **200 OK**: File found, but might have CORS issues
   - **404 Not Found**: File path is wrong
   - **403 Forbidden**: File not publicly accessible
   - **CORS error**: Cross-origin issue

## Step 3: Verify Environment Variables

Check that your `.env.local` file has:
```bash
VITE_S3_BASE_URL=https://dibqjqvon2mzi.cloudfront.net
VITE_USE_S3=true
```

**Important**: 
- Restart your dev server after changing `.env.local`
- For production (Vercel), add these as environment variables in Vercel dashboard

## Step 4: Test the URL Directly

Copy the URL from the console logs and paste it directly in your browser. For example:
```
https://dibqjqvon2mzi.cloudfront.net/audio/halloween/01%20Halloween_1outof4.wav
```

**If the URL works in browser but not in player:**
- Likely a CORS issue
- Check CloudFront/S3 CORS settings

**If the URL doesn't work in browser:**
- File path is wrong
- File doesn't exist at that location
- File permissions issue

## Step 5: Verify S3/CloudFront File Structure

Your files in S3 should be organized like:
```
s3://your-bucket/
  audio/
    halloween/
      01 Halloween_1outof4.wav
     mixes/
      01 mix006.wav
```

**Check:**
1. Go to AWS S3 Console
2. Navigate to your bucket
3. Verify the folder structure matches your `DJMixes.tsx` paths
4. Make sure files are publicly accessible

## Step 6: Common Issues & Fixes

### Issue: "Network error - check CORS or URL"

**Fix CORS on S3:**
1. Go to S3 Console → Your Bucket → Permissions
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Add this configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

**Fix CORS on CloudFront:**
1. Go to CloudFront Console → Your Distribution
2. Go to **Behaviors** tab
3. Edit the behavior
4. Under **Cache key and origin requests**, ensure CORS headers are forwarded

### Issue: "404 Not Found"

**Check:**
1. File path in `DJMixes.tsx` matches S3 structure
2. `VITE_S3_PREFIX` matches your S3 folder (default is `audio`)
3. File names match exactly (case-sensitive, including spaces)

**Example:**
- If file is at: `s3://bucket/audio/halloween/01 Halloween_1outof4.wav`
- Path in DJMixes.tsx: `"halloween/01 Halloween_1outof4.wav"`
- VITE_S3_PREFIX: `audio` (default)

### Issue: "403 Forbidden"

**Make S3 bucket/objects public:**
1. S3 Console → Your Bucket → Permissions
2. Uncheck "Block all public access" (if needed)
3. Add bucket policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### Issue: URL encoding problems

The code automatically encodes spaces and special characters. If you see `%20` in URLs, that's correct (space = `%20`).

If files have special characters, make sure they're properly encoded in the path.

### Issue: Environment variables not working

**For local development:**
- File must be named `.env.local` (not `.env`)
- Restart dev server after changes
- Check that variables start with `VITE_`

**For Vercel production:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add `VITE_S3_BASE_URL` and `VITE_USE_S3`
- Redeploy after adding variables

## Step 7: Debug Checklist

- [ ] Console shows correct S3 URL being generated
- [ ] URL works when pasted directly in browser
- [ ] Environment variables are set correctly
- [ ] Dev server restarted after changing `.env.local`
- [ ] S3 bucket structure matches code paths
- [ ] Files are publicly accessible
- [ ] CORS is configured on S3/CloudFront
- [ ] Network tab shows 200 status (not 404/403)
- [ ] No CORS errors in console

## Step 8: Test with a Simple URL

If nothing works, try adding a direct URL mapping in `audio-urls.ts`:

```typescript
export const audioUrlMap: Record<string, string> = {
  'halloween/01 Halloween_1outof4.wav': 'https://dibqjqvon2mzi.cloudfront.net/audio/halloween/01%20Halloween_1outof4.wav',
  ' mixes/01 mix006.wav': 'https://dibqjqvon2mzi.cloudfront.net/audio/ mixes/01%20mix006.wav',
};
```

This bypasses S3 URL generation and uses direct URLs. If this works, the issue is with the S3 URL generation logic.

## Still Not Working?

1. Check the exact error message in browser console
2. Check the exact URL being generated (shown in console logs)
3. Verify the URL works in browser directly
4. Check S3/CloudFront access logs if available
