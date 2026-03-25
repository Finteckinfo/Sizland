import { useEffect, useState } from 'react';

/**
 * Pixel height for MapLibre containers at breakpoints (matches Tailwind sm / lg).
 * Defaults to `tablet` on SSR to reduce layout shift after mount.
 */
export function useResponsiveMapHeight(mobile: number, tablet: number, desktop: number) {
  const [h, setH] = useState(tablet);

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      if (w < 640) setH(mobile);
      else if (w < 1024) setH(tablet);
      else setH(desktop);
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [mobile, tablet, desktop]);

  return h;
}

/** One resize listener for land admin / browse pages (form, modal, card preview). */
export function useLandPageMapHeights() {
  const [tier, setTier] = useState<'sm' | 'md' | 'lg'>('md');

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      setTier(w < 640 ? 'sm' : w < 1024 ? 'md' : 'lg');
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  return {
    form: tier === 'sm' ? 172 : tier === 'md' ? 224 : 264,
    modal: tier === 'sm' ? 210 : tier === 'md' ? 272 : 320,
    cardPreview: tier === 'sm' ? 118 : tier === 'md' ? 132 : 140,
  };
}
