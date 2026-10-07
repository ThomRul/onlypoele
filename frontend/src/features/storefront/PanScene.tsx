import { useEffect, useRef, useState } from 'react';
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
    return () => {
      cancelled = true;
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
        <img
          src="/illustrations/hero-pan.svg"
          alt=""
          width="760"
          height="680"
          fetchPriority="high"
        />
      </div>
      {available && !reduced && (
        <button type="button" className="scene-control" onClick={toggle} aria-pressed={paused}>
          <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
          {paused ? 'Reprendre l’animation' : 'Mettre en pause'}
        </button>
      )}
    </div>
  );
}
