import { AudioPlayer } from './AudioPlayer';
import { getAudioUrl } from '../../config/audio-urls';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors4 } from '@/config/bubble-colors';

export function DJMixes() {
  const mixes = [
    {
      id: 1,
      title: "AEPI Halloween MIX",
      date: "2025-01-08",
      duration: "55 min",
      description: "A mix of Deep house and pop remixes so that the people dont get upset",
      // This will use blob URL if available, otherwise fallback to local path
      audioFile: "halloween/01 Halloween_1outof4.wav"
    },
    {
      id: 2,
      title: "Random Mix",
      date: "2024-12-15",
      duration: "40 min",
      description: "Some deep cuts and other stuff i liked",
      audioFile: " mixes/01 mix006.wav" // Note: folder name has leading space
    },
    {
      id: 3,
      title: "Australia Mix 2",
      date: "2025-05-22",
      duration: "44 min",
      description: "Random deep cuts i liked",
      audioFile: "Unknown Album(2)/01 mix007.wav" // Update this path to match your actual file
    },
    {
      id: 4,
      title: "Australia Mix 1",
      date: "2024-04-29",
      duration: "32 min",
      description: "Peak time tech recorded at Lass O'Gowrie open decks",
      audioFile: "Unknown Album(4)/01 mix009.wav" // Update this path to match your actual file
    }
  ];

  return (
    <BubbleBackground 
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors4}
      backgroundGradient="from-red-900 to-amber-900"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h1 className="text-4xl mb-8 text-white drop-shadow-lg">DJ Mixes</h1>
      <div className="space-y-8">
        {mixes.map((mix) => {
          // Get blob URL if available, otherwise use local path
          const audioUrl = getAudioUrl(mix.audioFile);
          
          return (
            <article key={mix.id} className="border-b border-white/30 pb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl text-white drop-shadow-md">{mix.title}</h2>
                <span className="text-sm text-white/90">{mix.duration}</span>
              </div>
              <div className="text-sm mb-3 text-white/70">{mix.date}</div>
              <p className="mb-4 leading-relaxed text-white/90">{mix.description}</p>
              
              <AudioPlayer title={mix.title} audioUrl={audioUrl} />
            </article>
          );
        })}
      </div>
      </div>
    </BubbleBackground>
  );
}