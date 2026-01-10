import { AudioPlayer } from './AudioPlayer';
import { getAudioUrl } from '../../config/audio-urls';
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
      title: "Winter Warmup Mix",
      date: "2024-12-15",
      duration: "45 min",
      description: "Uplifting progressive house to get through the cold months",
      audioFile: "mixes/winter-warmup-mix.mp3" // Update this path to match your actual file
    },
    {
      id: 3,
      title: "Basement Tapes #12",
      date: "2024-11-22",
      duration: "58 min",
      description: "Experimental techno & ambient textures",
      audioFile: "mixes/basement-tapes-12.mp3" // Update this path to match your actual file
    },
    {
      id: 4,
      title: "Summer Solstice Set",
      date: "2024-06-21",
      duration: "90 min",
      description: "Peak time techno recorded at outdoor venue",
      audioFile: "mixes/summer-solstice-set.mp3" // Update this path to match your actual file
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6">
      <h1 className="text-4xl mb-8">DJ Mixes</h1>
      <div className="space-y-8">
        {mixes.map((mix) => {
          // Get blob URL if available, otherwise use local path
          const audioUrl = getAudioUrl(mix.audioFile);
          
          return (
            <article key={mix.id} className="border-b border-black pb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl">{mix.title}</h2>
                <span className="text-sm">{mix.duration}</span>
              </div>
              <div className="text-sm mb-3 opacity-60">{mix.date}</div>
              <p className="mb-4 leading-relaxed">{mix.description}</p>
              
              <AudioPlayer title={mix.title} audioUrl={audioUrl} />
            </article>
          );
        })}
      </div>
    </div>
  );
}