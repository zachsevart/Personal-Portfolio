import type { EventItem } from './types';

// Add upcoming events here, e.g.:
// { id: 1, date: '2026-05-10', venue: 'Venue', city: 'City, ST', title: 'Title', description: 'Details', image: '/images/flyer.jpg' }
export const upcomingEvents: EventItem[] = [];

export const pastEvents: EventItem[] = [
  {
    id: 4,
    date: '2026-04-18',
    venue: 'AEPi — 1116 Indiana',
    city: 'Lawrence, KS',
    title: 'PiChella 2026',
    description: 'Spring music festival — live sets starting at 10 PM',
    image: '/images/IMG_9630.JPG',
  },
  {
    id: 3,
    date: '2026-04-11',
    venue: '1106 Louisiana St',
    city: 'Lawrence, KS',
    title: 'Casablanca Blackout',
    description: '"Before we go..." — blackout party',
    image: '/images/IMG_9633.JPG',
  },
  {
    id: 2,
    date: '2026-04-03',
    venue: 'AEPi — 1116 Indiana',
    city: 'Lawrence, KS',
    title: 'Y2K Night',
    description: 'Y2K themed party — dress Y2K, doors open at 9 PM',
    image: '/images/IMG_9631.JPG',
  },
  {
    id: 1,
    date: '2026-01-23',
    venue: 'Alpha Epsilon Pi',
    city: 'Lawrence, KS',
    title: 'RAVEPI',
    description: 'Back to school party — deep house and pop remixes',
    image: '/images/IMG_9632.JPG',
  },
];
