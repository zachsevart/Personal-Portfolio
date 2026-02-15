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
      audioFile: "01 Halloween_1outof4.wav"
    },
    {
      id: 2,
      title: "Random Mix",
      date: "2024-12-15",
      duration: "40 min",
      description: "Some deep cuts and other stuff i liked",
      audioFile: "01 mix006.wav"
    },
    {
      id: 3,
      title: "Australia Mix 2",
      date: "2025-05-22",
      duration: "44 min",
      description: "Random deep cuts i liked",
      audioFile: "01 mix007.wav"
    },
    {
      id: 4,
      title: "Australia Mix 1",
      date: "2025-04-29",
      duration: "32 min",
      description: "Peak time tech recorded at Lass O'Gowrie open decks",
      audioFile: "01 mix009.wav"
    },
    {
      id: 5,
      title: "Song Demo",
      date: "2026-02-15",
      duration: "3 min",
      description: "First song I have made, start to finish",
      audioFile: "finishedjudah3.wav"
    }
  ];

  return (
    <BubbleBackground 
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors4}
      backgroundGradient="from-gray-900 to-slate-900"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h1 className="text-4xl mb-8 text-white drop-shadow-lg">DJ Mixes</h1>
      <div className="space-y-8">
        {mixes.map((mix) => {
          const audioUrl = getAudioUrl(mix.audioFile);
          
          return (
            <div className="bg-black/20 rounded-lg p-4"> 
            <article key={mix.id} className="border-b border-white/30 pb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl text-white drop-shadow-md">{mix.title}</h2>
                <span className="text-sm text-white/90">{mix.duration}</span>
              </div>
              <div className="text-sm mb-3 text-white/70">{mix.date}</div>
              <p className="mb-4 leading-relaxed text-white/90">{mix.description}</p>
              
              <AudioPlayer title={mix.title} audioUrl={audioUrl} />
            </article>
            </div>
          );
        })}
      </div>
      </div>
    </BubbleBackground>
  );
}