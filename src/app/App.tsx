import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { DJMixes } from './components/DJMixes';
import { About } from './components/About';
import { Events } from './components/Events';
import { Booking } from './components/Booking';

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
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/mixes" element={<DJMixes />} />
          <Route path="/events" element={<Events />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="pb-24 relative overflow-hidden">
          <AnimatedRoutes />
        </main>
        <footer className="border-t border-white/30 py-8">
          <div className="max-w-5xl mx-auto px-6 text-center text-sm opacity-60">
            © 2026 — zachtrax
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}