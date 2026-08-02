import { Link } from 'react-router-dom';
import { ClubScene } from './ClubScene';
import { ModeToggle } from './ModeToggle';

// Full-viewport club-mode shell: the 3D experience owns the whole screen, with a
// single minimal HUD control to return to the simple 2D site.
export function ClubApp() {
  return (
    <div className="relative w-full">
      {/* Real, crawlable/screen-reader content behind the canvas. The 3D scene is
          decorative; assistive tech and search engines get this instead. */}
      <main className="sr-only">
        <h1>zachtrax — DJ & Producer based in Seattle, WA</h1>
        <p>Mixing techno, house, and open format. Explore the immersive club, or jump to a section:</p>
        <nav aria-label="Sections">
          <ul>
            <li><Link to="/mixes">Mixes</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/booking">Booking</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>
      </main>

      <ClubScene />

      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
    </div>
  );
}
