import type { SocialLink } from '@/content/types';

// Presentational list of connect/social links. Replaces the JSX that was
// duplicated across Landing, About, and Booking. Reused in the club Connect section.
export function ConnectList({ links }: { links: SocialLink[] }) {
  return (
    <div className="space-y-3">
      {links.map((s) => {
        const Icon = s.icon;
        const external = s.href.startsWith('http');
        return (
          <a
            key={s.id}
            href={s.href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
          >
            <Icon size={20} />
            <span>{s.label}</span>
          </a>
        );
      })}
    </div>
  );
}
