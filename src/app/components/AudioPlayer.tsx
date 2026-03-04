import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  title: string;
  audioUrl: string;
  precomputedPeaks?: { peaks: number[][]; duration: number };
}

function formatTime(time: number): string {
  if (!isFinite(time) || time < 0) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ title, audioUrl, precomputedPeaks }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(!precomputedPeaks);
  const [error, setError] = useState<string | null>(null);

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const hoverRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = useCallback(() => {
    const ws = wavesurferRef.current;
    if (!ws || error) return;
    ws.playPause();
  }, [error]);

  useEffect(() => {
    if (!waveformRef.current) return;

    // When pre-computed peaks are available, pass them directly so
    // wavesurfer renders the waveform instantly without fetching/decoding.
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 255, 255, 0.35)',
      progressColor: 'rgba(255, 255, 255, 0.92)',
      cursorColor: 'rgba(255, 255, 255, 0.6)',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 72,
      normalize: true,
      dragToSeek: true,
      url: audioUrl,
      ...(precomputedPeaks
        ? { peaks: precomputedPeaks.peaks, duration: precomputedPeaks.duration }
        : { fetchParams: { mode: 'cors' } }),
    });

    wavesurferRef.current = ws;

    if (precomputedPeaks) {
      setDuration(precomputedPeaks.duration);
      setIsLoading(false);
    }

    ws.on('decode', (dur) => {
      setDuration(dur);
      setIsLoading(false);
      setError(null);
    });

    ws.on('timeupdate', (time) => setCurrentTime(time));
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    ws.on('loading', () => {
      if (!precomputedPeaks) {
        setIsLoading(true);
        setError(null);
      }
    });

    ws.on('error', (err) => {
      setIsLoading(false);
      setError(err?.message || 'Failed to load audio');
    });

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl, precomputedPeaks]);

  // Hover effect — track pointer across the waveform container
  useEffect(() => {
    const container = waveformRef.current;
    const hover = hoverRef.current;
    if (!container || !hover) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      hover.style.width = `${x}px`;
    };

    const onPointerLeave = () => {
      hover.style.width = '0px';
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div className="audio-player-wrap">
      {error && (
        <div className="mb-3 px-3 py-2 bg-red-500/15 border border-red-400/30 rounded text-red-200 text-sm">
          <strong>Error:</strong> {error}
          <div className="mt-1 text-xs opacity-60 break-all">URL: {audioUrl}</div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={!!error || isLoading}
          className="audio-player-btn"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-sm font-medium text-white/90 truncate">{title}</span>
            <span className="audio-player-time shrink-0">
              {formatTime(currentTime)}<span className="opacity-40"> / </span>{formatTime(duration)}
            </span>
          </div>

          <div className="audio-player-waveform-wrap">
            {isLoading && !error && (
              <div className="audio-player-loading">
                <div className="audio-player-loading-bar" />
              </div>
            )}
            <div ref={waveformRef} className="audio-player-waveform" />
            <div ref={hoverRef} className="audio-player-hover" />
          </div>
        </div>
      </div>

      <style>{`
        .audio-player-wrap {
          position: relative;
        }
        .audio-player-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }
        .audio-player-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.92);
          color: black;
          border-color: transparent;
          transform: scale(1.06);
        }
        .audio-player-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .audio-player-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .audio-player-time {
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.03em;
          color: rgba(255, 255, 255, 0.55);
        }
        .audio-player-waveform-wrap {
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
        }
        .audio-player-waveform {
          position: relative;
          z-index: 1;
          cursor: pointer;
        }
        .audio-player-hover {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0;
          mix-blend-mode: overlay;
          background: rgba(255, 255, 255, 0.12);
          pointer-events: none;
          z-index: 2;
          transition: width 0.06s linear;
          border-right: 1px solid rgba(255, 255, 255, 0.25);
        }
        .audio-player-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          z-index: 3;
          padding: 0 12px;
        }
        .audio-player-loading-bar {
          height: 2px;
          width: 100%;
          border-radius: 1px;
          background: rgba(255, 255, 255, 0.12);
          position: relative;
          overflow: hidden;
        }
        .audio-player-loading-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.5);
          animation: ap-load 1.4s ease-in-out infinite;
          transform-origin: left;
        }
        @keyframes ap-load {
          0%   { transform: scaleX(0) translateX(0); }
          50%  { transform: scaleX(0.6) translateX(40%); }
          100% { transform: scaleX(0) translateX(100%); }
        }
      `}</style>
    </div>
  );
}
