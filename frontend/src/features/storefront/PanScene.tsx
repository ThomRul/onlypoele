import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../../components/useMediaQuery';
import type { PanSceneController } from './createPanScene';

export function PanScene() {
  const host = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (reduced || hasPlayed.current) return;
    let cancelled = false;
    let loading = false;
    let controller: PanSceneController | undefined;
    const load = () => {
      if (loading || cancelled) return;
      loading = true;
      import('./createPanScene')
        .then(({ createPanScene }) => {
          if (cancelled || !host.current) return;
          controller = createPanScene(host.current);
          hasPlayed.current = true;
        })
        .catch(() => {
          // L'image de la pile reste affichée si WebGL n'est pas disponible.
        });
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                observer?.disconnect();
                load();
              }
            },
            { rootMargin: '100px' },
          );
    if (host.current && observer) observer.observe(host.current);
    else load();
    return () => {
      cancelled = true;
      observer?.disconnect();
      controller?.dispose();
    };
  }, [reduced]);

  return (
    <div className="pan-scene-wrap">
      <div
        className="pan-scene"
        ref={host}
        role="img"
        aria-label="Huit poêles empilées, avec deux œufs au plat sur la dernière"
      >
        <img src="/illustrations/pan-stack.png" alt="" width="800" height="540" loading="lazy" />
      </div>
    </div>
  );
}
