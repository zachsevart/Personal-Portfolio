import { AudioPlayer } from './AudioPlayer';
import { getAudioUrl } from '../../config/audio-urls';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors4 } from '@/config/bubble-colors';
import audioPeaks from '@/config/audio-peaks.json';
import { mixes } from '@/content/mixes';

export function DJMixes() {
  return (
    <BubbleBackground
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors4}
      backgroundGradient="from-black to-black"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h1 className="text-4xl mb-8 text-white drop-shadow-lg">DJ Mixes</h1>
      <div className="space-y-8">
        {mixes.map((mix) => {
          const audioUrl = getAudioUrl(mix.audioFile);

          return (
            <div key={mix.id} className="bg-black/20 rounded-lg p-4">
            <article className="border-b border-white/30 pb-8">
              {mix.image && (
                <img src={mix.image} alt={mix.title} className="w-32 h-32 rounded-lg object-cover mb-4" />
              )}
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl text-white drop-shadow-md">{mix.title}</h2>
                <span className="text-sm text-white/90">{mix.duration}</span>
              </div>
              <div className="text-sm mb-3 text-white/70">{mix.date}</div>
              <p className="mb-4 leading-relaxed text-white/90">{mix.description}</p>

              <AudioPlayer
                title={mix.title}
                audioUrl={audioUrl}
                precomputedPeaks={(audioPeaks as Record<string, { peaks: number[][]; duration: number }>)[mix.audioFile]}
              />
            </article>
            </div>
          );
        })}
      </div>
      </div>
    </BubbleBackground>
  );
}
