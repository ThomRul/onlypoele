import { motion } from 'motion/react';
import { PanScene } from './PanScene';
import { useMediaQuery } from '../../components/useMediaQuery';
import './cooking-stage.css';

export function CookingStage() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <section className="cooking-stage" aria-labelledby="stage-title">
      <p className="eyebrow">ONLYPOELE, EN MOUVEMENT</p>
      <h2 id="stage-title">
        Faites sauter
        <br />
        le quotidien.
      </h2>
      <div className="stage-composition">
        <motion.div
          className="paper-sticker stage-sticker stage-sticker-left"
          initial={reduced ? false : { opacity: 0, y: 35, rotate: -14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0, rotate: -8 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>À VOS</span>
          <span>POÊLES !</span>
        </motion.div>
        <PanScene />
        <motion.div
          className="paper-sticker stage-sticker stage-sticker-right"
          initial={reduced ? false : { opacity: 0, y: 35, rotate: 14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0, rotate: 8 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>À VOUS</span>
          <span>DE JOUER.</span>
        </motion.div>
      </div>
      <p className="stage-caption">Illustration 3D de présentation</p>
    </section>
  );
}
