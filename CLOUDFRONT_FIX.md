# Fixing CloudFront Audio Issues

The error "media resource was not suitable" usually means one of these:

## Issue 1: Content-Type Header Missing/Wrong

CloudFront needs to serve `.wav` files with the correct `Content-Type: audio/wav` header.

### Fix in CloudFront:

1. Go to AWS CloudFront Console
2. Select your distribution: `dibqjqvon2mzi.cloudfront.net`
3. Go to **Behaviors** tab
4. Click on your behavior (or create one if missing)
5. Scroll to **Cache key and origin requests**
6. Under **Headers**, make sure to forward:
   - `Content-Type`
   - `Accept`
7. Click **Save changes**

### Fix in S3 (Alternative):

1. Go to S3 Console → Your bucket
2. Select a `.wav` file
3. Go to **Properties** tab
4. Scroll to **Metadata**
5. Click **Edit**
6. Add metadata:
   - Key: `Content-Type`
   - Value: `audio/wav`
7. Click **Save changes**
8. Repeat for all `.wav` files

**OR use S3 CLI to batch update:**
```bash
aws s3 cp s3://personal-portfolio-music/audio/ s3://personal-portfolio-music/audio/ \
  --recursive \
  --metadata-directive REPLACE \
  --content-type "audio/wav" \
  --exclude "*" \
  --include "*.wav"
```

## Issue 2: File Path Doesn't Match

Check the console logs - you'll see the generated URL. Test it directly:

**Expected URL format:**
```
https://dibqjqvon2mzi.cloudfront.net/audio/halloween/01%20Halloween_1outof4.wav
```

**Verify in S3:**
- File should be at: `s3://personal-portfolio-music/audio/halloween/01 Halloween_1outof4.wav`
- Path in code: `"halloween/01 Halloween_1outof4.wav"`
- Prefix: `audio`

## Issue 3: CloudFront Not Updated

After changing S3 files or CloudFront settings:

1. Go to CloudFront Console
2. Select your distribution
3. Click **Invalidations** tab
4. Click **Create invalidation**
5. Enter: `/*` (to invalidate all)
6. Click **Create invalidation**
7. Wait 2-5 minutes for it to complete

## Quick Test:

1. Open browser console (F12)
2. Look for logs showing the generated URL
3. Copy the URL from console
4. Paste it directly in browser address bar
5. If it downloads/plays → URL is correct, issue is with audio element
6. If 404 → File path is wrong
7. If 403 → Permissions issue
8. If loads but won't play → Content-Type issue

## Test URLs Manually:

Try these in your browser (replace with actual file names):

```
https://dibqjqvon2mzi.cloudfront.net/audio/halloween/01%20Halloween_1outof4.wav
https://dibqjqvon2mzi.cloudfront.net/audio/ mixes/01%20mix006.wav
```

If these work in browser but not in player → It's a Content-Type or CORS issue.

## Check Response Headers:

1. Open browser DevTools → Network tab
2. Try to play audio
3. Click on the failed request
4. Check **Response Headers**:
   - Should have: `Content-Type: audio/wav`
   - Should have: `Access-Control-Allow-Origin: *` (or your domain)

If `Content-Type` is missing or wrong → Fix CloudFront/S3 metadata
If CORS headers missing → Add CORS to S3 bucket
