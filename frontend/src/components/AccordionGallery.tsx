// Adapté de la source React Bits AccordionGallery fournie par l'utilisateur.
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import { useMediaQuery } from './useMediaQuery';
import './AccordionGallery.css';

export interface GalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
}

interface Props {
  items: GalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function AccordionGallery({
  items,
  defaultIndex = 2,
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = '',
  ariaLabel = 'Galerie de présentation',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const controlRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const firstRun = useRef(true);
  const mediaSize = useRef(320);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const compact = useMediaQuery('(max-width: 600px)');
  const vertical = orientation === 'vertical' || compact;
  const count = items.length;
  const [selected, setSelected] = useState(
    Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)),
  );
  const active = Math.min(selected, Math.max(count - 1, 0));

  const applyLayout = useCallback(
    (animate: boolean) => {
      const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
      const dur = animate && !reduced ? duration : 0;
      timeline.current?.kill();
      const next = gsap.timeline();

      panelRefs.current.slice(0, count).forEach((panel, index) => {
        if (!panel) return;
        const open = index === active;
        const rotation = open || reduced ? 0 : index < active ? tilt : -tilt;
        next.to(
          panel,
          {
            flexGrow: open ? grow : 1,
            ...(vertical ? { rotateX: -rotation, rotateY: 0 } : { rotateY: rotation, rotateX: 0 }),
            duration: dur,
            ease,
          },
          0,
        );

        const media = mediaRefs.current[index];
        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - index));
          const shift = open || reduced ? 0 : drift * parallax * mediaSize.current * 0.06;
          next.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : shift,
              y: vertical ? shift : 0,
              '--ag-gray': grayscale && !open ? 1 : 0,
              duration: dur,
              ease,
            },
            0,
          );
        }
        const bar = barRefs.current[index];
        const text = textRefs.current[index];
        if (showLabels && bar && text) {
          next.to(
            [bar, text],
            {
              opacity: open ? 1 : 0,
              x: open ? 0 : -14,
              duration: open ? dur : dur * 0.6,
              ease,
              stagger: reduced ? 0 : stagger,
            },
            0,
          );
        }
      });
      timeline.current = next;
    },
    [
      active,
      count,
      expandRatio,
      reduced,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
    ],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const bounds = root.getBoundingClientRect();
      const total = vertical ? bounds.height : bounds.width;
      const usable = Math.max(total - gap * Math.max(count - 1, 0), 120);
      mediaSize.current = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      root.style.setProperty('--ag-media-size', `${mediaSize.current}px`);
      applyLayout(!firstRun.current);
      firstRun.current = false;
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(root);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      timeline.current?.kill();
    };
  }, [applyLayout, count, expandRatio, gap, vertical]);

  function moveFocus(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    controlRefs.current[next]?.focus();
  }

  const style = {
    '--ag-accent': accentColor,
    '--ag-overlay': overlayColor,
    '--ag-text': textColor,
    '--ag-gap': `${gap}px`,
    '--ag-radius': `${radius}px`,
    height: compact ? 580 : vertical ? Math.round(height * 1.6) : height,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''} ${className}`}
      style={style}
      role="list"
      aria-label={ariaLabel}
    >
      {count === 0 && <p>Aucun visuel disponible pour le moment.</p>}
      {items.map((item, index) => {
        const open = index === active;
        return (
          <div
            key={`${item.image}-${index}`}
            ref={(node) => {
              panelRefs.current[index] = node;
            }}
            className={`ag-panel${open ? ' ag-panel--active' : ''}`}
            role="listitem"
          >
            <button
              type="button"
              className="ag-panel__control"
              ref={(node) => {
                controlRefs.current[index] = node;
              }}
              aria-label={item.label || item.alt || `Vue ${index + 1}`}
              aria-pressed={open}
              onClick={() => setSelected(index)}
              onFocus={() => setSelected(index)}
              onMouseEnter={() => {
                if (trigger === 'hover' && window.matchMedia?.('(hover: hover)').matches)
                  setSelected(index);
              }}
              onKeyDown={(event) => moveFocus(index, event)}
            >
              <span className="ag-panel__frame">
                <span
                  className="ag-panel__media"
                  ref={(node) => {
                    mediaRefs.current[index] = node;
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.alt ?? ''}
                    draggable="false"
                    loading="lazy"
                    width="700"
                    height="800"
                  />
                </span>
                <span className="ag-panel__overlay" aria-hidden="true" />
              </span>
              {showLabels && (
                <span className="ag-panel__label" aria-hidden="true">
                  <span
                    className="ag-panel__bar"
                    ref={(node) => {
                      barRefs.current[index] = node;
                    }}
                  />
                  <span
                    className="ag-panel__text"
                    ref={(node) => {
                      textRefs.current[index] = node;
                    }}
                  >
                    {item.label}
                  </span>
                </span>
              )}
            </button>
            {item.link && (
              <a className="ag-panel__link" href={item.link} tabIndex={open ? 0 : -1}>
                Voir {item.label || 'le produit'} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
