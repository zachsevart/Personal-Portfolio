import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors3 } from '@/config/bubble-colors';

export function Events() {
  const upcomingEvents = [
    // Add upcoming events here:
    // { id: 1, date: "2026-05-10", venue: "Venue Name", city: "City, ST", title: "Event Title", description: "Details", image: "/images/flyer.jpg" },
  ];

  const pastEvents = [
    {
      id: 4,
      date: "2026-04-18",
      venue: "AEPi — 1116 Indiana",
      city: "Lawrence, KS",
      title: "PiChella 2026",
      description: "Spring music festival — live sets starting at 10 PM",
      image: "/images/IMG_9630.JPG",
    },
    {
      id: 3,
      date: "2026-04-11",
      venue: "1106 Louisiana St",
      city: "Lawrence, KS",
      title: "Casablanca Blackout",
      description: "\"Before we go...\" — blackout party",
      image: "/images/IMG_9633.JPG",
    },
    {
      id: 2,
      date: "2026-04-03",
      venue: "AEPi — 1116 Indiana",
      city: "Lawrence, KS",
      title: "Y2K Night",
      description: "Y2K themed party — dress Y2K, doors open at 9 PM",
      image: "/images/IMG_9631.JPG",
    },
    {
      id: 1,
      date: "2026-01-23",
      venue: "Alpha Epsilon Pi",
      city: "Lawrence, KS",
      title: "RAVEPI",
      description: "Back to school party — deep house and pop remixes",
      image: "/images/IMG_9632.JPG",
    },
  ];

  return (
    <BubbleBackground
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors3}
      backgroundGradient="from-black to-black"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h1 className="text-4xl mb-8 text-white drop-shadow-lg">Events</h1>

        {/* Upcoming */}
        <section className="mb-16">
          <h2 className="text-2xl mb-6 text-white/90">Upcoming</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-white/60">No upcoming events — check back soon.</p>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event: { id: number; date: string; venue: string; city: string; title: string; description: string; image?: string }) => (
                <div key={event.id} className="border border-white/20 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
                        <h3 className="text-xl text-white">{event.title}</h3>
                        <span className="text-sm text-white/60">{event.date}</span>
                      </div>
                      <p className="text-white/70 text-sm mb-1">{event.venue} — {event.city}</p>
                      <p className="text-white/80">{event.description}</p>
                    </div>
                    {event.image && (
                      <div className="sm:w-48 sm:shrink-0">
                        <img
                          src={event.image}
                          alt={`${event.title} flyer`}
                          className="w-full h-auto rounded-lg border border-white/20 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        <section>
          <h2 className="text-2xl mb-6 text-white/90 border-t border-white/30 pt-8">Past</h2>
          <div className="space-y-6">
            {pastEvents.map((event) => (
              <div key={event.id} className="border border-white/10 rounded-lg p-6 opacity-70">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
                      <h3 className="text-xl text-white">{event.title}</h3>
                      <span className="text-sm text-white/60">{event.date}</span>
                    </div>
                    <p className="text-white/70 text-sm mb-1">{event.venue} — {event.city}</p>
                    <p className="text-white/80">{event.description}</p>
                  </div>
                  {event.image && (
                    <div className="sm:w-48 sm:shrink-0">
                      <img
                        src={event.image}
                        alt={`${event.title} flyer`}
                        className="w-full h-auto rounded-lg border border-white/20 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </BubbleBackground>
  );
}
