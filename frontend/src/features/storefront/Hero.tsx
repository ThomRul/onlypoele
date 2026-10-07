import { motion } from 'motion/react';
import { Icon } from '../../components/Icon';
import { useMediaQuery } from '../../components/useMediaQuery';
import { PanScene } from './PanScene';
import './hero.css';

export function Hero() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <motion.p
          className="eyebrow"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          LA BOUTIQUE QUI A LA POÊLE
        </motion.p>
        <h1 id="hero-title">
          {['Ça va', 'chauffer.'].map((line, index) => (
            <motion.span
              key={line}
              initial={reduced ? false : { opacity: 0, y: 35, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.65, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h1>
        <p className="hero-description">
          Une boutique dédiée aux poêles à frire.
          <br />
          Et à tout ce que vous allez y faire sauter.
        </p>
        <a className="button button-primary" href="#galerie">
          Découvrir l’univers <Icon name="arrow" />
        </a>
      </div>
      <div className="hero-art">
        <span className="hero-sticker">
          À vos
          <br />
          <strong>poêles !</strong>
        </span>
        <PanScene />
        <p className="art-caption">Illustration de présentation</p>
        <span className="hero-spark" aria-hidden="true">
          <Icon name="spark" />
        </span>
      </div>
    </section>
  );
}
