import { useState} from 'react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors3 } from '@/config/bubble-colors';

export function Updates() {
  const mediaBaseUrl = "https://pub-8c8c1854d91a4bc381840a168a546fd3.r2.dev";
  
  const [lightbox, setLightbox] = useState<null | { src: string; alt?: string }>(null);
  const updates = [
    {
      id: 1,
      date: "2024-12-22",
      category: "programming",
      title: "Contributing to open source",
      content: "Submitted my first PR to a package I use regularly. Just documentation improvements, but it's a start. Maintainer was super helpful with feedback."
    },
    {
      id: 2,
      date: "2025-01-08",
      category: "programming",
      title: "Built a CLI tool for managing dev environments",
      content: "Finished a small Rust CLI that helps me quickly spin up Docker containers with my preferred dev stack. Might open source it once I clean up the code."
    },
    {
      id: 3,
      date: "2025-01-05",
      category: "sourdough",
      title: "Starter maintenance notes",
      content: "Switched to a 1:5:5 feeding ratio and it's much more predictable now. Peaks around 5-6 hours at room temp. Smell is much better too—less vinegary, more fruity."
    },
    {
      id: 4,
      date: "2025-01-03",
      category: "programming",
      title: "Data structures study log",
      content: "Spent the week reviewing tree algorithms. Implemented AVL trees from scratch without looking at docs. Balance factor logic finally clicked."
    },
    {
      id: 5,
      date: "2024-12-28",
      category: "sourdough",
      title: "Discard pancakes discovery",
      content: "Made pancakes with sourdough discard. Way better than regular pancakes. Slight tang, fluffy texture. Recipe: 1 cup discard, 1 egg, 2 tbsp sugar, pinch of salt, 1/2 tsp baking soda."
    },
    {
      id: 6,
      date: "2025-12-15",
      category: "programming",
      title: "New App initialization",
      content: "Over my final winter break at KU, I started a new app with friends to integrate Seattle's food and drink scene into a single app through Yelp's Places and Reviews API, Youtube's video API, and simple card swiping to save places, or skip places.."
    },
    {
      id: 7,
      date: "2026-01-20",
      category: "sourdough",
      title: "Sourdough revival after feedless month",
      content: "I just returned to school after a month of break, and I was wondering what would happen to my starter while I was gone. It was fed before being placed in the fridge for a month to slow fermentation. On first glance, there was no black layer of acidic fluid, called \"flem\", but there was a foul odor. I emptied out the starter and saved 50g, and i then fed it another 50-50 of water and flour. It' going to be tough to save, but not impossible. "
    },
    {

      id: 8,
      date: "2026-01-23",
      category: "DJing",
      title: "Gig at Alpha Epsilon Pi Fraternity at KU",
      content: "Performed for AEPi's back to school RAVEPI party. Mix will be posted on mixes page soon.",
      media: [{ type: "image", path: "RAVEPI.jpg", alt: "AEPi RAVEPI flyer"}]
    }
  ];

  return (
    <BubbleBackground 
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors3}
      backgroundGradient="from-gray-900 to-slate-900"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <p className="text-white/70">
            A running log of bread bakes and programming experiments
          </p>
        </div>

        <div className="space-y-8">
          {updates
            .slice()
            .sort((a, b) => b.id - a.id)
            .map((update) => (
            <article key={update.id} className="border-b border-white/30 pb-8">
              <div className="flex gap-4 items-baseline mb-2">
                <span className="text-sm text-white/70">{update.date}</span>
                <span className="text-xs px-2 py-1 border border-white/50 text-white/90">
                  {update.category}
                </span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="sm:flex-1">
                  <h2 className="text-xl mb-3 text-white drop-shadow-md">{update.title}</h2>
                  <p className="leading-relaxed text-white/90">{update.content}</p>
                </div>
                {update.media?.length ? (
                  <div className="sm:w-56 sm:shrink-0 sm:ml-6">
                    <div className="grid gap-3">
                      {update.media.map((item) => {
                        const src = `${mediaBaseUrl.replace(/\/$/, '')}/${item.path}`;
                        return (
                          <button
                            key={`${update.id}-${item.path}`}
                            type="button"
                            className="relative block text-left"
                            onClick={() => setLightbox({ src, alt: item.alt || update.title })}
                          >
                            <img
                              className="w-full max-h-48 rounded-lg border border-white/20 object-cover brightness-60 transition hover:brightness-75"
                              src={src}
                              alt={item.alt || update.title}
                              loading="lazy"
                            />
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs uppercase tracking-wider text-white/80">
                              View Images/Media
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <img
            className="max-h-[80vh] max-w-[90vw] rounded-lg border border-white/20"
            src={lightbox.src}
            alt={lightbox.alt || 'Expanded media'}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </BubbleBackground>
  );
}
