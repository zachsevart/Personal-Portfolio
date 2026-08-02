import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useMediaQuery } from '@/app/components/ui/use-media-query';
import {
  clearStoredMode,
  computeDefaultMode,
  readStoredMode,
  writeStoredMode,
  type SiteMode,
} from '@/config/mode';

interface ModeContextValue {
  mode: SiteMode;
  /** True when the current mode came from an explicit user choice, not auto-detection. */
  isManual: boolean;
  prefersReducedMotion: boolean;
  setMode: (mode: SiteMode) => void;
  resetToAuto: () => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  // Club is gated to desktop-class widths (heavier than the 768px mobile breakpoint).
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [override, setOverride] = useState<SiteMode | null>(() => readStoredMode());

  // Explicit user choice wins; otherwise derive from device + motion preference.
  // (The club scene itself still freezes its animation under reduced-motion, so a
  // reduced-motion user who explicitly opts into club gets a static version.)
  const mode = override ?? computeDefaultMode(isDesktop, prefersReducedMotion);

  const setMode = useCallback((next: SiteMode) => {
    setOverride(next);
    writeStoredMode(next);
  }, []);

  const resetToAuto = useCallback(() => {
    setOverride(null);
    clearStoredMode();
  }, []);

  return (
    <ModeContext.Provider
      value={{ mode, isManual: override !== null, prefersReducedMotion, setMode, resetToAuto }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used within a ModeProvider');
  return ctx;
}
