import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  title: string;
  audioUrl: string;
}

export function AudioPlayer({ title, audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Debug: Log the audio URL being used and check Content-Type
  useEffect(() => {
    console.log(`[AudioPlayer] Loading audio for "${title}":`, audioUrl);
    console.log(`[AudioPlayer] Test this URL in browser:`, audioUrl);
    
    // Validate URL format
    try {
      new URL(audioUrl);
      console.log(`[AudioPlayer] ✓ URL is valid`);
      
      // Check Content-Type header and response details
      fetch(audioUrl, { method: 'HEAD' })
        .then(response => {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          const cacheControl = response.headers.get('cache-control');
          
          console.log(`[AudioPlayer] Response Headers:`, {
            'Content-Type': contentType,
            'Content-Length': contentLength,
            'Cache-Control': cacheControl,
            'Status': response.status,
            'Status Text': response.statusText
          });
          
          if (!contentType || !contentType.includes('audio')) {
            console.error(`[AudioPlayer] ⚠️ WARNING: Content-Type is "${contentType}" but should be "audio/wav"`);
            console.error(`[AudioPlayer] CloudFront may not be forwarding the Content-Type from S3!`);
            console.error(`[AudioPlayer] Fix: Configure CloudFront to forward Content-Type header`);
          } else {
            console.log(`[AudioPlayer] ✓ Content-Type looks correct: ${contentType}`);
          }
          
          // Also check if file exists and is accessible
          if (response.status !== 200) {
            console.error(`[AudioPlayer] ⚠️ File returned status ${response.status}: ${response.statusText}`);
          }
        })
        .catch(err => {
          console.error(`[AudioPlayer] Could not check headers:`, err);
        });
      
      // Also try to load the audio and check for codec issues
      const testAudio = new Audio();
      testAudio.addEventListener('error', (e) => {
        const audioEl = e.target as HTMLAudioElement;
        if (audioEl.error) {
          console.error(`[AudioPlayer] Audio element error:`, {
            code: audioEl.error.code,
            message: audioEl.error.message,
            note: 'Code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED (format/codec issue)'
          });
          console.error(`[AudioPlayer] This might mean:`);
          console.error(`[AudioPlayer] 1. WAV codec is not supported by browser (try converting to MP3)`);
          console.error(`[AudioPlayer] 2. File is corrupted`);
          console.error(`[AudioPlayer] 3. Content-Type header not being forwarded by CloudFront`);
        }
      }, { once: true });
      
      testAudio.src = audioUrl;
    } catch (e) {
      console.error(`[AudioPlayer] ✗ Invalid URL format:`, e);
    }
  }, [audioUrl, title]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    
    const handleError = (e: Event) => {
      setIsLoading(false);
      const audioElement = e.target as HTMLAudioElement;
      let errorMessage = 'Failed to load audio';
      
      if (audioElement.error) {
        switch (audioElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - check CORS or URL';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decode error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
          default:
            errorMessage = `Audio error: ${audioElement.error.message || 'Unknown error'}`;
        }
      }
      
      setError(errorMessage);
      console.error(`[AudioPlayer] Error loading "${title}":`, errorMessage, audioUrl, audioElement.error);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, title]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate fake waveform bars for visualization
  const generateWaveform = () => {
    const bars = 100;
    return Array.from({ length: bars }, (_, i) => {
      const height = Math.random() * 60 + 20; // Random height between 20-80%
      const progress = duration ? currentTime / duration : 0;
      const isPassed = i / bars < progress;
      return { height, isPassed };
    });
  };

  const waveform = generateWaveform();

  return (
    <div className="border border-white/30 p-4">
      <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" preload="metadata" />
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
          <strong>Error:</strong> {error}
          <div className="mt-2 text-xs opacity-75 break-all">
            URL: {audioUrl}
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && !error && (
        <div className="mb-4 text-sm text-white/70">Loading audio...</div>
      )}
      
      {/* Debug info (only in development) */}
      {import.meta.env.DEV && (
        <div className="mb-2 text-xs text-white/50 break-all font-mono">
          Debug URL: {audioUrl}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlay}
          disabled={!!error || isLoading}
          className="w-12 h-12 border border-white/50 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-white">{title}</div>
          <div className="text-sm text-white/70">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Waveform visualization */}
      <div 
        className="h-20 flex items-end gap-[2px] cursor-pointer"
        onClick={handleProgressClick}
      >
        {waveform.map((bar, i) => (
          <div
            key={i}
            className={`flex-1 transition-colors ${
              bar.isPassed ? 'bg-white' : 'bg-white/30'
            }`}
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>

      {/* Progress bar underneath */}
      <div className="mt-2 h-1 bg-white/30 cursor-pointer" onClick={handleProgressClick}>
        <div 
          className="h-full bg-white transition-all"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
