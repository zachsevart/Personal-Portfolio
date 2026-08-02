import { useEffect, useState, type RefObject } from 'react';

/** Tracks page visibility so canvases can pause their render loop when the tab
 * is hidden (switched away / minimized) — not just when scrolled off-screen. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onChange = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

/**
 * Tracks whether an element is within (or near) the viewport so expensive WebGL
 * canvases can pause their render loop when scrolled off-screen. Defaults to true
 * so content renders before the observer's first async callback.
 */
export function useInView(ref: RefObject<HTMLElement | null>, rootMargin = '200px') {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
