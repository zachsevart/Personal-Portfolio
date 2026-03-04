# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Zach Sevart — a React SPA showcasing DJ mixes, project updates, and personal info. Deployed on Vercel with audio files served from Cloudflare R2.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build (outputs to `dist/`)
- `npm run upload-audio` — Upload audio files from `public/audio/` to Vercel Blob Storage (requires `BLOB_READ_WRITE_TOKEN` env var), then regenerates the audio mapping

No test framework or linter is configured.

## Architecture

**Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (new-york style), Motion (framer-motion successor), react-router-dom v7

**Routing:** BrowserRouter with animated route transitions (AnimatePresence) in `src/app/App.tsx`. Routes: `/` (Landing), `/mixes` (DJMixes), `/about` (About), `/updates` (Updates). Vercel rewrites all paths to `index.html` for SPA support.

**Path alias:** `@` maps to `./src` (configured in `vite.config.ts`)

**Key directories:**
- `src/app/components/` — Page components and custom components (Header, AudioPlayer, DJDeck, etc.)
- `src/app/components/ui/` — shadcn/ui primitives (do not edit manually; managed by shadcn CLI)
- `src/components/animate-ui/` — Animated background components (BubbleBackground)
- `src/config/` — Configuration files for bubble color themes (`bubble-colors.ts`) and audio URL resolution (`audio-urls.ts`)
- `src/styles/` — CSS entry points (fonts, theme, Tailwind)
- `scripts/` — Node scripts for audio upload and mapping generation
- `r2-worker/` — Cloudflare Worker for R2 storage (separate package with its own `package.json` and Wrangler config)

**Audio pipeline:** Audio files live in `public/audio/` for local dev. In production, `VITE_PUBLIC_AUDIO_BASE_URL` env var points to Cloudflare R2. The `getAudioUrl()` helper in `src/config/audio-urls.ts` handles the resolution.

**Bubble backgrounds:** Each page uses `BubbleBackground` with a different color preset from `src/config/bubble-colors.ts`. To change a page's color scheme, update the imported `activeColors` variant.

**Component library:** shadcn/ui components are installed via `npx shadcn@latest add <component>`. Config is in `components.json`. The animate-ui registry is also configured at `https://animate-ui.com/r/{name}.json`.

## Adding Content

**New DJ mix:** Add an entry to the `mixes` array in `src/app/components/DJMixes.tsx` with `id`, `title`, `date`, `duration`, `description`, and `audioFile` (filename only, no path). Place the audio file in `public/audio/` for local dev, then run `npm run upload-audio` to push to R2.

**New update post:** Add an entry to the `updates` array in `src/app/components/Updates.tsx`. Media URLs use the `mediaBaseUrl` constant defined at the top of that file.
