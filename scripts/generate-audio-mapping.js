#!/usr/bin/env node

/**
 * Auto-generate audio-urls.ts from blob-upload-results.json
 * 
 * Run this after npm run upload-audio to automatically update the mapping
 */

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const RESULTS_FILE = join(PROJECT_ROOT, 'blob-upload-results.json');
const OUTPUT_FILE = join(PROJECT_ROOT, 'src/config/audio-urls.ts');

async function main() {
  try {
    // Read upload results
    const resultsData = await readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(resultsData);

    // Build mapping
    const map = {};
    results.forEach(result => {
      if (result && result.originalPath && result.blobUrl) {
        // Remove 'audio/' prefix from path
        const key = result.originalPath.replace(/^audio\//, '');
        map[key] = result.blobUrl;
      }
    });

    // Generate TypeScript file
    const content = `/**
 * Audio file URLs from Vercel Blob Storage
 * 
 * Auto-generated from blob-upload-results.json
 * Last updated: ${new Date().toISOString()}
 * 
 * To regenerate: node scripts/generate-audio-mapping.js
 */

export const audioUrlMap: Record<string, string> = ${JSON.stringify(map, null, 2)};

/**
 * Get audio URL from blob storage
 * Falls back to local path if not found in map
 */
export function getAudioUrl(localPath: string): string {
  // Remove leading slash or 'public/' prefix
  const cleanPath = localPath
    .replace(/^\\/?public\\/?/, '')
    .replace(/^audio\\//, '');
  
  // Check if we have a blob URL for this file
  if (audioUrlMap[cleanPath]) {
    return audioUrlMap[cleanPath];
  }
  
  // Fallback to local path (for development)
  return localPath.startsWith('/') ? localPath : \`/\${localPath}\`;
}
`;

    await writeFile(OUTPUT_FILE, content, 'utf-8');
    
    console.log(`✅ Generated audio URL mapping:`);
    console.log(`   Files mapped: ${Object.keys(map).length}`);
    console.log(`   Output: ${OUTPUT_FILE}`);
    
  } catch (error) {
    if (error.code === 'ENOENT' && error.path === RESULTS_FILE) {
      console.error('❌ blob-upload-results.json not found!');
      console.error('   Run "npm run upload-audio" first to upload your files.');
      process.exit(1);
    }
    console.error('❌ Error generating mapping:', error.message);
    process.exit(1);
  }
}

main();
