import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Music } from 'lucide-react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { DJDeck } from './DJDeck';
import { activeColors } from '@/config/bubble-colors';

export function Landing() {
  return (
    <BubbleBackground
      className="min-h-[calc(100vh-200px)] w-full"
      interactive={true}
      colors={activeColors}
      backgroundGradient="from-black to-black"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="min-h-[70vh] flex flex-col justify-center">
          <div className="flex items-center gap-8 mb-8 flex-wrap">
            <h1 className="text-6xl md:text-7xl lg:text-8xl leading-tight text-white drop-shadow-lg flex-1 min-w-[300px]">
              zachtrax
            </h1>
            <div className="flex-shrink-0">
              <DJDeck />
            </div>
          </div>
          
          <div className="text-xl md:text-2xl lg:text-3xl space-y-6 mb-12 max-w-3xl leading-relaxed text-white/90 drop-shadow-md">
            <p>
              DJ and Producer based in Kansas City
            </p>
          </div>
          <div className="text-lg md:text-xl lg:text-2xl space-y-6 mb-12 max-w-3xl leading-relaxed text-white/80 drop-shadow-md">
            <p>
              Mixing techno, house, and everything in between.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 mb-12">
            <Link
              to="/mixes"
              className="text-lg border-2 border-white text-white px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Listen to Mixes →
            </Link>
            <Link
              to="/events"
              className="text-lg border-2 border-white text-white px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Upcoming Events →
            </Link>
            <Link
              to="/booking"
              className="text-lg border-2 border-white text-white px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Book Me →
            </Link>
          </div>

          <div className="pt-8 mt-8 border-t border-white/30">
            <h2 className="text-xl mb-4 text-white drop-shadow-md">Connect</h2>
            <div className="space-y-3">
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
                href="https://linkedin.com/in/zachsevart/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
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
      </div>
    </BubbleBackground>
  );
}
