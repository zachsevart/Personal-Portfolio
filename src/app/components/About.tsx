import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Github, Linkedin, Mail, Music, X } from 'lucide-react';
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors2 } from '@/config/bubble-colors';

export function About() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImageModalOpen]);

  // Prevent body scroll when modal is open
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
      backgroundGradient="from-gray-900 to-slate-900"
    >
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h1 className="text-3xl mb-8 text-white drop-shadow-lg">About</h1>

        
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Text Section - 2xl width (672px) */}
          <div className="bg-black/20 rounded-lg p-4"> 

          <div className="w-full md:w-[672px] flex-shrink-0">
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
                I plan on being experimental with the design of the site. The focus is on user experience to showcase my projects and interests, but also to test new software or UI. 
              </p>
            </div>
          </div>
          </div>
          {/* Image Section - 2xl width (672px) */}
          <div className="w-full md:w-[672px] flex-shrink-0">
            <img 
              src="/images/IMG_5695.jpg" 
              alt="Profile" 
              className="w-1/2 h-auto object-cover rounded-lg drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer transition-transform hover:scale-105"
              onClick={() => setIsImageModalOpen(true)}
            />
          </div>
        </div>
        
        {/* Low opacity white rounded rectangle separator */}
        
        
        {/* Education Section */}
        <div className="pt-12 mt-12 border-t border-white/30">
        <div className="bg-black/20 rounded-lg p-4"> 
          <h2 className="text-2xl mb-6 text-white drop-shadow-md">Education</h2>
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 leading-relaxed">
            <div className="flex-1">
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">
                <a 
                  href="https://www.ku.edu/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-60 transition-opacity"
                >
                  The University of Kansas
                </a>
              </h3>
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
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">
                <a 
                  href="https://www.newcastle.edu.au/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-60 transition-opacity"
                >
                  The University of Newcastle
                </a>
              </h3>
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
        </div>

        {/* Experience Section */}
        <div className="pt-12 mt-12 border-t border-white/30">
        <div className="bg-black/20 rounded-lg p-4"> 
          <h2 className="text-2xl mb-6 text-white drop-shadow-md">Relevant Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 leading-relaxed">
            <div>
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">Data Analytics Intern</h3>
              <p className="text-white/90 text-xl mb-1">
                <a 
                  href="https://olsonkundig.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-60 transition-opacity"
                >
                  Olson Kundig
                </a>
              </p>
              <p className="text-sm text-white/70 mb-2">Summer 2025</p>
              <p className="text-white/90 text-xl">Job description and responsibilities</p>
              <ul className="text-sm text-white/70 list-disc list-inside space-y-1 ml-4"> 
              <li>Built a data driven Employee Baseball Card system that combined qualitative employee profiles with quantitative staffing data to improve how project teams were formed.</li>
              <li>Developed automated data pipelines using Python and SQL to transform raw Smartsheet form submissions into clean, reliable datasets for reporting and analysis.</li>
              <li>Created interactive dashboards in Power BI that allowed staffing managers to quickly search, filter, and compare employees, making data accessible for everyday decision making.</li>
              
              </ul>

            </div>
            <div>
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">IT Intern</h3>
              <p className="text-white/90 text-xl mb-1">
                <a 
                  href="https://www.spaceneedle.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-60 transition-opacity"
                >
                  Space Needle
                </a>
              </p>
              <p className="text-sm text-white/70 mb-2">Summer 2024</p>
              <p className="text-white/90 text-xl">Job description and responsibilities</p>
              <ul className="text-sm text-white/70 list-disc list-inside space-y-1 ml-4"> 
             <li>Supported internal technology systems by resolving service tickets, managing employee devices, and maintaining access to company databases and tools.</li>
             <li>Reviewed and tested website updates for the Space Needle’s public site, helping improve functionality and user experience.</li>
             <li>Worked alongside the IT team to follow and apply standard operating procedures, learning how technical systems support a large, customer facing operation.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl mb-2 text-white drop-shadow-sm">Admissions Team Member</h3>
              <p className="text-white/90 text-xl mb-1">
                <a 
                  href="https://www.spaceneedle.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-60 transition-opacity"
                >
                  Space Needle
                </a>
              </p>
              <p className="text-sm text-white/70 mb-2">July 2020 - July 2023</p>
              <p className="text-white/90 text-xl">Job description and responsibilities</p>
              <ul className="text-sm text-white/70 list-disc list-inside space-y-1 ml-4"> 
              
              <li>Provided front line support to thousands of visitors, handling ticket sales, guest questions, and special requests in a fast paced environment.</li>
              <li>Helped maintain a positive guest experience by working closely with team members to keep operations smooth during peak hours.</li>
              <li>Developed strong communication and problem solving skills while representing one of Seattle’s most visible attractions.</li>
              
              </ul>
            </div>
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
            {/* Close button */}
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

            {/* Expanded image */}
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
                alt="Profile"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BubbleBackground>
  );
}

