# Quick Start: Moving Audio to Vercel Blob Storage

## Step 1: Create Blob Store on Vercel

1. Go to https://vercel.com/dashboard
2. Navigate to **Storage** → **Create Database** → **Blob**
3. Name it (e.g., "audio-storage")
4. Select region (choose closest to your users)
5. Click **Create**

## Step 2: Get Your Token

1. In Vercel Dashboard → Your Project → **Storage** → Your Blob Store
2. Go to **Settings** → Copy the `BLOB_READ_WRITE_TOKEN`
3. Export it locally:
   ```bash
   export BLOB_READ_WRITE_TOKEN="your-token-here"
   ```

## Step 3: Upload Audio Files

```bash
# Make sure you've exported the token
export BLOB_READ_WRITE_TOKEN="your-token-here"

# Run the upload script
npm run upload-audio
```

This will:
- Upload all `.wav`, `.mp3`, `.m4a`, and `.cue` files from `public/audio/`
- Show progress for each file
- Generate `blob-upload-results.json` with all URLs

## Step 4: Update Your Code

After upload completes, you'll get a `blob-upload-results.json` file. 

**Option A: Manual Update (Simplest)**
1. Open `blob-upload-results.json`
2. Copy URLs to `src/config/audio-urls.ts`
3. Update `DJMixes.tsx` to use `getAudioUrl()` function

**Option B: Auto-generate (Recommended)**
Run this command to auto-generate the mapping:
```bash
node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('blob-upload-results.json', 'utf8'));
const map = {};
results.forEach(r => {
  const key = r.originalPath.replace(/^audio\//, '');
  map[key] = r.blobUrl;
});
const content = 'export const audioUrlMap: Record<string, string> = ' + 
  JSON.stringify(map, null, 2) + ';';
fs.writeFileSync('src/config/audio-urls.ts', 
  'export const audioUrlMap: Record<string, string> = ' + 
  JSON.stringify(map, null, 2) + ';' + 
  '\\n\\nexport function getAudioUrl(localPath: string): string {\\n' +
  '  const cleanPath = localPath.replace(/^\\/?public\\/?/, \\'\\').replace(/^audio\\//, \\'\\');\\n' +
  '  return audioUrlMap[cleanPath] || (localPath.startsWith(\\'/\\') ? localPath : `/${localPath}`);\\n' +
  '}\\n'
);
console.log('✅ Updated src/config/audio-urls.ts');
"
```

## Step 5: Update DJMixes Component

The component has been updated to use blob URLs. Just make sure `audio-urls.ts` is populated with your blob URLs.

## Step 6: Remove Audio Files from Git

```bash
# Remove from git (files stay on your computer)
git rm -r --cached public/audio/*.wav public/audio/*.mp3 public/audio/*.m4a

# Update .gitignore (already done)
# public/audio/**/*.wav
# public/audio/**/*.mp3

# Commit
git commit -m "Remove large audio files - using Vercel Blob Storage"
```

## Step 7: Deploy to Vercel

1. Push your code: `git push`
2. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
3. Add: `BLOB_READ_WRITE_TOKEN` = (your token)
4. Redeploy

## Troubleshooting

**"BLOB_READ_WRITE_TOKEN not found"**
- Make sure you've exported the token: `export BLOB_READ_WRITE_TOKEN="..."`
- Check it's set: `echo $BLOB_READ_WRITE_TOKEN`

**"Upload failed"**
- Check your internet connection
- Verify the token is correct
- Check file size limits (Vercel Blob supports large files)

**"Audio not playing in production"**
- Make sure `audio-urls.ts` has the correct URLs
- Check CORS settings (public blobs should work)
- Verify the blob store is connected to your Vercel project

## Cost Notes

- **Free tier**: 1GB storage, 100GB bandwidth/month
- **Pro tier**: $0.15/GB storage, $0.40/GB bandwidth
- **Your 6.3GB**: ~$0.95/month storage + bandwidth costs

For 6.3GB, consider Cloudflare R2 (free tier: 10GB, unlimited egress) as an alternative.
