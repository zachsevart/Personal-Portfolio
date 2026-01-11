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
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

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
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 border border-white/50 flex items-center justify-center hover:bg-white hover:text-black text-white transition-colors flex-shrink-0"
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
