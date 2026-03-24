import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function useMediaQuery() {
  const setIsMobile = useAppStore((s) => s.setIsMobile);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setIsMobile]);
}
