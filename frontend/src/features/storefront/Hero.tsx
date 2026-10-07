import { motion } from 'motion/react';
import { Icon } from '../../components/Icon';
import { useMediaQuery } from '../../components/useMediaQuery';
import './hero.css';

export function Hero() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <section className="hero" aria-labelledby="hero-title">
      <motion.img
        className="hero-image"
        src="/media/hero-kitchen.png"
        alt=""
        width="1774"
        height="887"
        fetchPriority="high"
        initial={reduced ? false : { scale: 1.035 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="hero-copy">
        <h1 id="hero-title">
          {['Prenez goût', 'à la cuisine.'].map((line, index) => (
            <motion.span
              key={line}
              initial={reduced ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h1>
        <a className="button button-primary" href="#galerie">
          Explorer les poêles <Icon name="arrow" />
        </a>
      </div>
      <motion.div
        className="paper-sticker hero-sticker hero-sticker-top"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: -16 }}
        animate={{ opacity: 1, scale: 1, rotate: -8 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span>FAITES</span>
        <span>SAUTER !</span>
      </motion.div>
      <motion.div
        className="paper-sticker hero-sticker hero-sticker-bottom"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: 16 }}
        animate={{ opacity: 1, scale: 1, rotate: 8 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span>À VOS</span>
        <span>POÊLES.</span>
      </motion.div>
      <p className="art-caption">Visuel d’ambiance généré</p>
    </section>
  );
}
