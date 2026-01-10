import { Github, Linkedin, Mail, Music } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl mb-8">About</h1>
        
        <div className="space-y-6 leading-relaxed">
          <p>
            I'm a computer science student with a passion for creating things—whether that's 
            software, music, or the perfect sourdough loaf.
          </p>
          
          <p>
            By day, I'm studying algorithms, data structures, and systems design. By night, 
            I'm behind the decks mixing techno and house, or experimenting with fermentation 
            in my kitchen.
          </p>

          <p>
            This site is a simple space to share my DJ mixes and document my various projects. 
            It's intentionally minimal—just text, links, and the occasional update about what 
            I'm working on.
          </p>

          <div className="pt-8 border-t border-black mt-8">
            <h2 className="text-xl mb-4">Connect</h2>
            <div className="space-y-3">
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-60 transition-opacity"
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-60 transition-opacity"
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://soundcloud.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-60 transition-opacity"
              >
                <Music size={20} />
                <span>SoundCloud</span>
              </a>
              <a 
                href="mailto:your.email@example.com" 
                className="flex items-center gap-3 hover:opacity-60 transition-opacity"
              >
                <Mail size={20} />
                <span>your.email@example.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}