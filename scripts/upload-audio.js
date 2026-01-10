#!/usr/bin/env node

/**
 * Script to upload audio files to Vercel Blob Storage
 * 
 * Usage:
 * 1. Set BLOB_READ_WRITE_TOKEN environment variable
 *    export BLOB_READ_WRITE_TOKEN="your-token-here"
 * 2. Run: node scripts/upload-audio.js
 */

import { put } from '@vercel/blob';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const AUDIO_DIR = join(PROJECT_ROOT, 'public/audio');

if (!BLOB_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN environment variable is required');
  console.error('');
  console.error('To get your token:');
  console.error('  1. Go to https://vercel.com/dashboard');
  console.error('  2. Select your project → Storage → Blob Store');
  console.error('  3. Copy the BLOB_READ_WRITE_TOKEN');
  console.error('  4. Run: export BLOB_READ_WRITE_TOKEN="your-token-here"');
  console.error('');
  process.exit(1);
}

async function uploadFile(filePath, blobPath) {
  try {
    const stats = statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`📤 Uploading: ${blobPath} (${fileSizeMB} MB)...`);
    
    const blob = await put(blobPath, createReadStream(filePath), {
      access: 'public',
      token: BLOB_TOKEN,
      contentType: getContentType(filePath),
    });
    
    console.log(`✅ Uploaded: ${blob.url}`);
    return {
      originalPath: blobPath,
      blobUrl: blob.url,
      pathname: blob.pathname,
      size: stats.size,
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${blobPath}:`, error.message);
    return null;
  }
}

function getContentType(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const types = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    cue: 'text/plain',
  };
  return types[ext] || 'application/octet-stream';
}

async function uploadDirectory(dir, basePath = 'audio') {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(AUDIO_DIR, fullPath);
    const blobPath = `${basePath}/${relativePath.replace(/\\/g, '/')}`;

    if (entry.isDirectory()) {
      const subResults = await uploadDirectory(fullPath, basePath);
      results.push(...subResults);
    } else if (entry.isFile() && /\.(wav|mp3|m4a|cue)$/i.test(entry.name)) {
      const result = await uploadFile(fullPath, blobPath);
      if (result) {
        results.push(result);
      }
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

async function main() {
  console.log('🚀 Starting audio file upload to Vercel Blob Storage...\n');
  console.log(`📁 Source directory: ${AUDIO_DIR}\n`);
  
  try {
    const results = await uploadDirectory(AUDIO_DIR);
    
    const successful = results.filter(r => r !== null);
    const failed = results.length - successful.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Upload Summary:');
    console.log('='.repeat(60));
    console.log(`   Total files processed: ${results.length}`);
    console.log(`   ✅ Successful: ${successful.length}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    if (successful.length > 0) {
      const totalSizeMB = (successful.reduce((sum, r) => sum + (r.size || 0), 0) / (1024 * 1024)).toFixed(2);
      console.log(`   📦 Total size uploaded: ${totalSizeMB} MB`);
    }
    
    // Save results to JSON file for reference
    const resultsPath = join(PROJECT_ROOT, 'blob-upload-results.json');
    await writeFile(
      resultsPath,
      JSON.stringify(successful, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 Results saved to: blob-upload-results.json`);
    console.log('\n✅ Upload complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review blob-upload-results.json for all uploaded URLs');
    console.log('   2. Update DJMixes.tsx with the blob URLs');
    console.log('   3. Remove audio files from git: git rm -r --cached public/audio');
    console.log('   4. Commit and deploy to Vercel\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
