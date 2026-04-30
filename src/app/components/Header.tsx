import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-white/30 py-6 mb-12">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl tracking-tight hover:opacity-60 transition-opacity">
            zachtrax
          </Link>
          <div className="flex gap-8">
            <Link
              to="/mixes"
              className={`hover:underline ${isActive('/mixes') ? 'underline' : ''}`}
            >
              mixes
            </Link>
            <Link
              to="/events"
              className={`hover:underline ${isActive('/events') ? 'underline' : ''}`}
            >
              events
            </Link>
            <Link
              to="/booking"
              className={`hover:underline ${isActive('/booking') ? 'underline' : ''}`}
            >
              booking
            </Link>
            <Link
              to="/about"
              className={`hover:underline ${isActive('/about') ? 'underline' : ''}`}
            >
              about
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}