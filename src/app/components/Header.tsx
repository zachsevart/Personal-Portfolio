import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-black py-6 mb-12">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-xl tracking-tight hover:opacity-60 transition-opacity">
            Zach Sevart | Personal Portfolio
          </Link>
          <div className="flex gap-8">
            <Link 
              to="/mixes" 
              className={`hover:underline ${isActive('/mixes') ? 'underline' : ''}`}
            >
              mixes
            </Link>
            <Link 
              to="/about" 
              className={`hover:underline ${isActive('/about') ? 'underline' : ''}`}
            >
              about
            </Link>
            <Link 
              to="/updates" 
              className={`hover:underline ${isActive('/updates') ? 'underline' : ''}`}
            >
              updates
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}