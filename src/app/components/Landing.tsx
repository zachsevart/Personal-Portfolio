import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Music } from 'lucide-react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { DJDeck } from './DJDeck';

export function Landing() {
  return (
    <BubbleBackground 
      className="min-h-[calc(100vh-200px)] w-full"
      interactive={true}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="min-h-[70vh] flex flex-col justify-center">
          <div className="flex items-center gap-8 mb-8 flex-wrap">
            <h1 className="text-6xl md:text-7xl lg:text-8xl leading-tight text-white drop-shadow-lg flex-1 min-w-[300px]">
              Hi, I'm Zach <br />
            </h1>
            <div className="flex-shrink-0">
              <DJDeck />
            </div>
          </div>
          
          <div className="text-xl md:text-2xl lg:text-3xl space-y-6 mb-12 max-w-3xl leading-relaxed text-white/90 drop-shadow-md">
            <p>
              Computer Science @ The University of Kansas <br />
              DJ and Producer
            </p>
          </div>
          <div className="text-lg md:text-xl lg:text-2xl space-y-6 mb-12 max-w-3xl leading-relaxed text-white/80 drop-shadow-md">
            <p>
              Building software by day, mixing techno by night, and baking sourdough whenever I have time.
            </p>
            <p>
              This is where I share my music, document my projects, and keep track of things I'm learning.
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
              to="/updates" 
              className="text-lg border-2 border-white text-white px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              Read Updates →
            </Link>
          </div>

          <div className="flex gap-6 items-center pt-8 border-t border-white/30">
            <span className="text-sm text-white/70">Connect:</span>
            <a 
              href="https://github.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:opacity-60 transition-opacity"
              aria-label="GitHub"
            >
              <Github size={24} />
            </a>
            <a 
              href="https://linkedin.com/in/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:opacity-60 transition-opacity"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} />
            </a>
            <a 
              href="https://soundcloud.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:opacity-60 transition-opacity"
              aria-label="SoundCloud"
            >
              <Music size={24} />
            </a>
            <a 
              href="mailto:your.email@example.com" 
              className="text-white hover:opacity-60 transition-opacity"
              aria-label="Email"
            >
              <Mail size={24} />
            </a>
          </div>
        </div>
      </div>
    </BubbleBackground>
  );
}
