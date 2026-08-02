import type { LucideIcon } from 'lucide-react';

// Canonical content types, consumed by both the 2D pages and the 3D club panels.

export interface Mix {
  id: number;
  title: string;
  date: string;
  duration: string;
  description: string;
  audioFile: string;
  image?: string;
}

export interface EventItem {
  id: number;
  date: string;
  venue: string;
  city: string;
  title: string;
  description: string;
  image?: string;
}

/** Where a social link is surfaced. Lets Booking show a smaller subset. */
export type SocialContext = 'primary' | 'booking';

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  contexts: SocialContext[];
}

export interface BioContent {
  paragraphs: string[];
}
