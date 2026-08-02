import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors3 } from '@/config/bubble-colors';
import { upcomingEvents, pastEvents } from '@/content/events';

export function Events() {
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
              {upcomingEvents.map((event) => (
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
