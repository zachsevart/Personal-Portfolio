#!/usr/bin/env node

/**
 * Pre-compute waveform peaks for all DJ mixes.
 *
 * Fetches each WAV from Cloudflare R2, decodes PCM samples,
 * downsamples to ~1000 data-points, and writes the result to
 * src/config/audio-peaks.json so the front-end never has to decode.
 *
 * Usage:
 *   node scripts/generate-peaks.js
 *
 * Re-run whenever you add or change an audio file.
 */

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'src', 'config', 'audio-peaks.json');

const R2_BASE = 'https://pub-8c8c1854d91a4bc381840a168a546fd3.r2.dev';

// Must match the audioFile values in DJMixes.tsx
const FILES = [
  'Cdne Crzy .wav',
  '01 REC-2026-05-18.wav',
  '01 mix5-6-26.wav',
  '01 Halloween_1outof4.wav',
  '01 mix006.wav',
  '01 mix007.wav',
  '01 mix009.wav',
  'finishedjudah3.wav',
];

const PEAK_COUNT = 1000; // number of peaks per channel

// ── WAV parser (handles standard PCM WAV) ────────────────────────────

function parseWav(buffer) {
  const view = new DataView(buffer);

  // Verify RIFF header
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') throw new Error('Not a WAV file');

  // Find "fmt " chunk
  let offset = 12;
  let fmtFound = false;
  let numChannels, sampleRate, bitsPerSample;

  while (offset < view.byteLength - 8) {
    const id = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3),
    );
    const size = view.getUint32(offset + 4, true);

    if (id === 'fmt ') {
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
      fmtFound = true;
    }

    if (id === 'data') {
      if (!fmtFound) throw new Error('data chunk before fmt chunk');
      const dataStart = offset + 8;
      const dataEnd = dataStart + size;
      return { numChannels, sampleRate, bitsPerSample, dataStart, dataEnd, buffer };
    }

    offset += 8 + size;
    if (size % 2 !== 0) offset++; // chunks are word-aligned
  }

  throw new Error('Could not find data chunk');
}

function extractPeaks(wav) {
  const { numChannels, sampleRate, bitsPerSample, dataStart, dataEnd, buffer } = wav;
  const bytesPerSample = bitsPerSample / 8;
  const totalSamples = (dataEnd - dataStart) / (bytesPerSample * numChannels);
  const duration = totalSamples / sampleRate;
  const view = new DataView(buffer);

  const samplesPerPeak = Math.floor(totalSamples / PEAK_COUNT);
  // We'll produce a single-channel (mono-mixed) peak array
  const peaks = new Float32Array(PEAK_COUNT);

  for (let p = 0; p < PEAK_COUNT; p++) {
    let max = 0;
    const startSample = p * samplesPerPeak;
    const endSample = Math.min(startSample + samplesPerPeak, totalSamples);

    for (let s = startSample; s < endSample; s++) {
      let monoVal = 0;
      for (let ch = 0; ch < numChannels; ch++) {
        const byteOffset = dataStart + (s * numChannels + ch) * bytesPerSample;
        if (byteOffset + bytesPerSample > buffer.byteLength) break;

        let sample;
        if (bitsPerSample === 16) {
          sample = view.getInt16(byteOffset, true) / 32768;
        } else if (bitsPerSample === 24) {
          const b0 = view.getUint8(byteOffset);
          const b1 = view.getUint8(byteOffset + 1);
          const b2 = view.getUint8(byteOffset + 2);
          let val = (b2 << 16) | (b1 << 8) | b0;
          if (val >= 0x800000) val -= 0x1000000;
          sample = val / 8388608;
        } else if (bitsPerSample === 32) {
          sample = view.getFloat32(byteOffset, true);
        } else {
          sample = view.getInt16(byteOffset, true) / 32768;
        }
        monoVal += Math.abs(sample);
      }
      monoVal /= numChannels;
      if (monoVal > max) max = monoVal;
    }

    peaks[p] = max;
  }

  // Normalize to [-1, 1] range (wavesurfer expects this)
  let globalMax = 0;
  for (let i = 0; i < peaks.length; i++) {
    if (peaks[i] > globalMax) globalMax = peaks[i];
  }
  if (globalMax > 0) {
    for (let i = 0; i < peaks.length; i++) {
      peaks[i] = peaks[i] / globalMax;
    }
  }

  // Round to 3 decimal places to keep JSON small
  const rounded = Array.from(peaks).map((v) => Math.round(v * 1000) / 1000);
  return { peaks: [rounded], duration: Math.round(duration * 100) / 100 };
}

// ── Main ─────────────────────────────────────────────────────────────

async function processFile(filename) {
  const url = `${R2_BASE}/${encodeURIComponent(filename)}`;
  console.log(`  Fetching: ${filename}...`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

  const arrayBuffer = await res.arrayBuffer();
  console.log(`  Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)} MB, decoding...`);

  const wav = parseWav(arrayBuffer);
  const result = extractPeaks(wav);
  console.log(`  → ${result.duration}s, ${result.peaks[0].length} peaks`);
  return result;
}

async function main() {
  console.log('Generating waveform peaks...\n');
  const output = {};

  for (const file of FILES) {
    try {
      output[file] = await processFile(file);
    } catch (err) {
      console.error(`  ✗ Failed: ${file} — ${err.message}`);
    }
    console.log('');
  }

  await writeFile(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
