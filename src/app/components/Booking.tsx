import { useState } from 'react';
import { Mail, Music } from 'lucide-react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors2 } from '@/config/bubble-colors';

export function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventDate: '',
    venue: '',
    eventType: '',
    details: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Booking Inquiry — ${formData.eventType || 'Event'} on ${formData.eventDate || 'TBD'}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nDate: ${formData.eventDate}\nVenue: ${formData.venue}\nEvent Type: ${formData.eventType}\n\nDetails:\n${formData.details}`
    );
    window.location.href = `mailto:zachsevart@ku.edu?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <BubbleBackground
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors2}
      backgroundGradient="from-black to-black"
    >
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <h1 className="text-4xl mb-4 text-white drop-shadow-lg">Booking</h1>
        <p className="text-white/70 mb-10 text-lg">
          Available for club nights, private events, and house parties. Fill out the form below or email me directly.
        </p>

        {submitted ? (
          <div className="border border-white/20 rounded-lg p-8 text-center">
            <p className="text-white text-xl mb-2">Your email client should have opened.</p>
            <p className="text-white/60">If it didn't, send your inquiry to{' '}
              <a href="mailto:zachsevart@ku.edu" className="text-white underline">zachsevart@ku.edu</a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm text-white/70 mb-2">Event Date</label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="venue" className="block text-sm text-white/70 mb-2">Venue / Location</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm text-white/70 mb-2">Event Type</label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors"
              >
                <option value="" className="bg-black">Select type</option>
                <option value="Club Night" className="bg-black">Club Night</option>
                <option value="House Party" className="bg-black">House Party</option>
                <option value="Private Event" className="bg-black">Private Event</option>
                <option value="Festival" className="bg-black">Festival</option>
                <option value="Corporate" className="bg-black">Corporate</option>
                <option value="Other" className="bg-black">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="details" className="block text-sm text-white/70 mb-2">Details</label>
              <textarea
                id="details"
                name="details"
                rows={4}
                value={formData.details}
                onChange={handleChange}
                placeholder="Tell me about your event — vibe, crowd size, set length, anything else"
                className="w-full bg-white/5 border border-white/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="border-2 border-white text-white px-8 py-3 text-lg hover:bg-white hover:text-black transition-colors"
            >
              Send Inquiry →
            </button>
          </form>
        )}

        <div className="mt-16 pt-8 border-t border-white/30">
          <h2 className="text-xl mb-4 text-white">Or reach out directly</h2>
          <div className="space-y-3">
            <a
              href="mailto:zachsevart@ku.edu"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Mail size={20} />
              <span>zachsevart@ku.edu</span>
            </a>
            <a
              href="https://soundcloud.com/user-170634185"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Music size={20} />
              <span>SoundCloud</span>
            </a>
          </div>
        </div>
      </div>
    </BubbleBackground>
  );
}
