import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { useMediaQuery } from '../../components/useMediaQuery';
import type { PanSceneController } from './createPanScene';

export function PanScene() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<PanSceneController | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [available, setAvailable] = useState(false);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let started = false;
    const load = () => {
      if (started || cancelled) return;
      started = true;
      import('./createPanScene')
        .then(({ createPanScene }) => {
          if (cancelled || !host.current) return;
          controller.current = createPanScene(host.current, () => setAvailable(false));
          controller.current.setPaused(pausedRef.current);
          setAvailable(true);
        })
        .catch(() => {
          // L'illustration SVG reste visible si WebGL ou le chargement échoue.
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
      controller.current?.dispose();
      controller.current = null;
    };
  }, [reduced]);

  function toggle() {
    const next = !paused;
    pausedRef.current = next;
    controller.current?.setPaused(next);
    setPaused(next);
  }

  return (
    <div className="pan-scene-wrap">
      <div
        className="pan-scene"
        ref={host}
        role="img"
        aria-label="Illustration d'une poêle et de deux œufs au plat"
      >
        <img src="/illustrations/hero-pan.svg" alt="" width="760" height="680" loading="lazy" />
      </div>
      {available && !reduced && (
        <button type="button" className="scene-control" onClick={toggle} aria-pressed={paused}>
          <Icon name={paused ? 'play' : 'pause'} />
          {paused ? 'Reprendre l’animation' : 'Mettre en pause'}
        </button>
      )}
    </div>
  );
}
