import { Github, Instagram, Linkedin, Mail, Music } from 'lucide-react';
import type { SocialLink } from './types';

export const CONTACT_EMAIL = 'zachsevart@ku.edu';

// NOTE: the SoundCloud URL was inconsistent before consolidation —
// About used /zchisnice, Landing & Booking used /user-170634185.
// Using /zchisnice as canonical; update here if that's wrong.
export const SOUNDCLOUD_URL = 'https://soundcloud.com/zchisnice';

// Single source of truth for connect/social links (was duplicated across
// Landing, About, and Booking). `contexts` controls where each one shows.
export const socials: SocialLink[] = [
  {
    id: 'instagram',
    label: '@zachtraxdj',
    href: 'https://instagram.com/zachtraxdj',
    icon: Instagram,
    contexts: ['primary'],
  },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    href: SOUNDCLOUD_URL,
    icon: Music,
    contexts: ['primary', 'booking'],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/zachsevart',
    icon: Linkedin,
    contexts: ['primary'],
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/zachsevart',
    icon: Github,
    contexts: ['primary'],
  },
  {
    id: 'email',
    label: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: Mail,
    contexts: ['primary', 'booking'],
  },
];

export const primarySocials = socials.filter((s) => s.contexts.includes('primary'));
export const bookingSocials = socials.filter((s) => s.contexts.includes('booking'));
