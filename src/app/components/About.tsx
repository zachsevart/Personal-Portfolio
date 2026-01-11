import { Github, Linkedin, Mail, Music } from 'lucide-react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors2 } from '@/config/bubble-colors';

export function About() {
  return (
    <BubbleBackground 
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors2}
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl mb-8 text-white drop-shadow-lg">About</h1>
        
        <div className="space-y-6 leading-relaxed">
          <p className="text-white/90 text-xl">
            I'm a computer science student with a passion for creating things, whether that's 
            software, music, or a sourdough loaf. I still have yet to make the perfect loaf.
          </p>
          
          <p className="text-white/90 text-xl">
            By day, I'm building my SeattleSweet App with friends, while developing my skills as a software engineer. 
            By night (or day, whenever i feel like it), I'm on my DDJ FLX-10 mixing techno and house, 
            or learning about music production on Ableton Live 12.
          </p>

          <p className="text-white/90 text-xl">
            This site is a simple space to share my DJ mixes and document my various projects. 
            It's intentionally visually experimental, with a focus on user experience to showcase my projects and interests. 
          </p>
        </div>

        {/* Education Section */}
        <div className="pt-12 mt-12 border-t border-white/30">
          <h2 className="text-2xl mb-6 text-white drop-shadow-md">Education</h2>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 leading-relaxed">
            <div className="flex-1">
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">The University of Kansas</h3>
              <p className="text-sm text-white/70">Lawrence, Kansas</p>
              <br />
              <p className="text-white/90 text-xl mb-1">Computer Science</p>
              <p className="text-sm text-white/70">Expected Graduation: [May 2026]</p>
              <p className="text-sm text-white/70">Cumulative GPA: 3.62</p>
              <p className="text-sm text-white/70 mb-2">Relevant Coursework:</p>
              <ul className="text-sm text-white/70 list-disc list-inside space-y-1 ml-4">
                <li>Data Structures & Algorithms</li>
                <li>Introduction to AI</li>
                <li>Introduction to Machine Learning</li>
                <li>Data Mining</li>
                <li>Database Systems Fundamentals</li>
                <li>Operating Systems Fundamentals</li>
                <li>Computer Networks</li>
                <li>Computer Architecture</li>
                <li>Software Engineering I & II</li>
                <li>Web Development</li>
                <li>And more</li>
              </ul>
            </div>
            <div className="flex-1">
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">The University of Newcastle</h3>
              <p className="text-sm text-white/70">Newcastle, Australia</p>
              <br />
              <p className="text-white/90 text-xl mb-1">Computer Science (Study Abroad Program)</p>
              <p className="text-sm text-white/70">Dates: [February 2025 - June 2025]</p>
              <p className="text-sm text-white/70 mb-2">Relevant Coursework:</p>
              <ul className="text-sm text-white/70 list-disc list-inside space-y-1 ml-4">
                <li>Machine Intelligence</li>
                <li>Data Security</li>
                <li>Advanced Database Topics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="pt-12 mt-12 border-t border-white/30">
          <h2 className="text-2xl mb-6 text-white drop-shadow-md">Relevant Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 leading-relaxed">
            <div>
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">Data Analytics Intern</h3>
              <p className="text-white/90 text-xl mb-1">Olson Kundig</p>
              <p className="text-sm text-white/70 mb-2">Summer 2025</p>
              <p className="text-white/90 text-xl">Job description and responsibilities</p>
            </div>
            <div>
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">IT Intern</h3>
              <p className="text-white/90 text-xl mb-1">Space Needle</p>
              <p className="text-sm text-white/70 mb-2">Summer 2024</p>
              <p className="text-white/90 text-xl">Job description and responsibilities</p>
            </div>
            <div>
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">Admissions Team Member</h3>
              <p className="text-white/90 text-xl mb-1">Space Needle</p>
              <p className="text-sm text-white/70 mb-2">July 2020 - July 2023</p>
              <p className="text-white/90 text-xl">Job description and responsibilities</p>
            </div>
          </div>
        </div>

        {/* Connect Section */}
        <div className="pt-12 mt-12 border-t border-white/30">
          <h2 className="text-xl mb-4 text-white drop-shadow-md">Connect</h2>
            <div className="space-y-3">
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://soundcloud.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <Music size={20} />
                <span>SoundCloud</span>
              </a>
              <a 
                href="mailto:your.email@example.com" 
                className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
              >
                <Mail size={20} />
                <span>your.email@example.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </BubbleBackground>
  );
}

