import { useNavigate } from 'react-router-dom';
import { useMode } from '@/app/context/ModeContext';
import type { SiteMode } from '@/config/mode';

// Segmented Club / Simple switch. Used in the Header (simple mode) and the club HUD.
export function ModeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useMode();
  const navigate = useNavigate();

  const select = (value: SiteMode) => {
    setMode(value);
    // The club scene only mounts on the home route (see AppShell in App.tsx), so
    // choosing Club from a content page (/mixes, /about, …) has to navigate home
    // for the switch to be visible — otherwise you stay on the 2D page.
    if (value === 'club') navigate('/');
  };

  const option = (value: SiteMode, label: string) => {
    const active = mode === value;
    return (
      <button
        type="button"
        onClick={() => select(value)}
        aria-pressed={active}
        className={`px-3 py-1 rounded-full transition-colors ${
          active ? 'bg-white text-black' : 'text-white/70 hover:text-white'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/40 p-0.5 text-xs backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Site mode"
    >
      {option('club', 'Club')}
      {option('simple', 'Simple')}
    </div>
  );
}
