import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { About } from './components/About';
import { Events } from './components/Events';
import { Booking } from './components/Booking';
import { ModeProvider, useMode } from './context/ModeContext';

// Split out so simple-mode visitors never download three.js / wavesurfer.
const ClubApp = lazy(() => import('./components/ClubApp').then((m) => ({ default: m.ClubApp })));
const DJMixes = lazy(() => import('./components/DJMixes').then((m) => ({ default: m.DJMixes })));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ width: '100%' }}
      >
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/mixes" element={<DJMixes />} />
            <Route path="/events" element={<Events />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function SimpleShell() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pb-24 relative overflow-x-clip">
        <AnimatedRoutes />
      </main>
      <footer className="border-t border-white/30 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm opacity-60">
          © 2026 — zachtrax
        </div>
      </footer>
    </div>
  );
}

function AppShell() {
  const { mode } = useMode();
  const location = useLocation();

  // Club mode takes over only the home route; the content routes (/mixes, /events,
  // /booking, /about) always render the 2D pages so they stay crawlable and shareable.
  if (mode === 'club' && location.pathname === '/') {
    return (
      <Suspense fallback={<div className="h-screen bg-[#040409]" />}>
        <ClubApp />
      </Suspense>
    );
  }
  return <SimpleShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ModeProvider>
        <AppShell />
      </ModeProvider>
    </BrowserRouter>
  );
}
