import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Github, Instagram, Linkedin, Mail, Music, X } from 'lucide-react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors2 } from '@/config/bubble-colors';

export function About() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImageModalOpen]);

  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen]);

  return (
    <BubbleBackground
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors2}
      backgroundGradient="from-black to-black"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h1 className="text-3xl mb-8 text-white drop-shadow-lg">About</h1>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 bg-black/20 rounded-lg p-6">
            <div className="space-y-6 leading-relaxed">
              <p className="text-white/90 text-xl">
                I'm zachtrax — a DJ based in Lawrence, KS mixing techno, house, and pop remixes.
                I play on a Pioneer DDJ FLX-10 and produce in Ableton Live 12.
              </p>

              <p className="text-white/90 text-xl">
                I've been performing at events around Lawrence and am always looking for new
                venues and collaborations. Check out my mixes or hit the booking page to get in touch.
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 md:shrink-0">
            <img
              src="/images/IMG_5695.jpg"
              alt="zachtrax"
              className="w-full h-auto object-cover rounded-lg drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer transition-transform hover:scale-105"
              onClick={() => setIsImageModalOpen(true)}
            />
          </div>
        </div>

        {/* Connect */}
        <div className="pt-12 mt-12 border-t border-white/30">
          <h2 className="text-xl mb-4 text-white drop-shadow-md">Connect</h2>
          <div className="space-y-3">
            <a
              href="https://instagram.com/zachtraxdj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Instagram size={20} />
              <span>@zachtraxdj</span>
            </a>
            <a
              href="https://soundcloud.com/zchisnice"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Music size={20} />
              <span>SoundCloud</span>
            </a>
            <a
              href="https://linkedin.com/in/zachsevart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/zachsevart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:zachsevart@ku.edu"
              className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
            >
              <Mail size={20} />
              <span>zachsevart@ku.edu</span>
            </a>
          </div>
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full hover:bg-white/10"
              aria-label="Close image"
            >
              <X size={32} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative max-w-[90vw] max-h-[90vh] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="/images/IMG_5695.jpg"
                alt="zachtrax"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BubbleBackground>
  );
}
