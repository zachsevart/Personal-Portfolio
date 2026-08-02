import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';
import { activeColors2 } from '@/config/bubble-colors';
import { bio } from '@/content/bio';
import { primarySocials } from '@/content/socials';
import { ConnectList } from './ConnectList';

export function About() {
  return (
    <BubbleBackground
      className="min-h-[calc(100vh-200px)] w-full py-12"
      interactive={true}
      colors={activeColors2}
      backgroundGradient="from-black to-black"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h1 className="text-3xl mb-8 text-white drop-shadow-lg">About</h1>

        <div className="bg-black/20 rounded-lg p-6">
          <div className="space-y-6 leading-relaxed">
            {bio.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-white/90 text-xl">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Connect */}
        <div className="pt-12 mt-12 border-t border-white/30">
          <h2 className="text-xl mb-4 text-white drop-shadow-md">Connect</h2>
          <ConnectList links={primarySocials} />
        </div>
      </div>
    </BubbleBackground>
  );
}
