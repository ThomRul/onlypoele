import { useState } from 'react';
import { motion } from 'motion/react';
import AccordionGallery from './components/AccordionGallery';
import type { GalleryItem } from './components/AccordionGallery';
import { Icon } from './components/Icon';
import { useMediaQuery } from './components/useMediaQuery';
import { products } from './features/catalog/products';
import { Catalog } from './features/catalog/Catalog';
import { CartDialog } from './features/cart/CartDialog';
import { useCart } from './features/cart/useCart';
import { Hero } from './features/storefront/Hero';
import './features/storefront/storefront.css';

const illustrations: GalleryItem[] = [
  {
    image: '/illustrations/pan-peach.svg',
    label: 'Sous tous les angles',
    alt: 'Illustration d’une poêle sur un fond pêche',
  },
  {
    image: '/illustrations/pan-lilac.svg',
    label: 'Place à la cuisine',
    alt: 'Illustration d’une poêle avec des œufs au plat sur un fond lilas',
  },
  {
    image: '/illustrations/pan-blue.svg',
    label: 'À vous de jouer',
    alt: 'Illustration d’une poêle sur un fond bleu',
  },
];

export default function App() {
  const cart = useCart(products);
  const [cartOpen, setCartOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const gallery = products.length
    ? products.map((product) => ({
        image: product.image,
        label: product.name,
        alt: product.imageAlt,
        link: `#produit-${encodeURIComponent(product.id)}`,
      }))
    : illustrations;

  function add(id: string) {
    cart.add(id);
    const name = products.find((product) => product.id === id)?.name;
    setAnnouncement(`${name} ajouté au panier.`);
  }

  function setQuantity(id: string, quantity: number) {
    cart.setQuantity(id, quantity);
    const name = products.find((product) => product.id === id)?.name;
    setAnnouncement(quantity ? `${name} : quantité ${quantity}.` : `${name} retiré du panier.`);
  }

  return (
    <div className="storefront" id="top">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <div className="top-note">À vos poêles, prêts, cuisinez.</div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="onlyPoele, accueil">
          onlyPoele<span aria-hidden="true">✳</span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#galerie">L’univers</a>
          <a href="#poeles">Les poêles</a>
        </nav>
        <button
          type="button"
          className="button cart-toggle"
          onClick={() => setCartOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Panier, ${cart.count} article${cart.count === 1 ? '' : 's'}`}
        >
          <Icon name="bag" />
          <span>Panier</span>
          <span className="cart-count">{cart.count}</span>
        </button>
      </header>
      <main id="contenu">
        <Hero />
        <div className="brand-strip" aria-hidden="true">
          <span>POÊLES À FRIRE</span>
          <Icon name="spark" />
          <span>ENVIE DE CUISINER</span>
          <Icon name="spark" />
          <span>onlyPoele</span>
        </div>
        <section className="gallery-section section" id="galerie" aria-labelledby="gallery-title">
          <motion.div
            className="section-heading"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <p className="eyebrow">LE PLAISIR COMMENCE ICI</p>
              <h2 id="gallery-title">
                La poêle au
                <br />
                <span>premier plan.</span>
              </h2>
            </div>
            <div className="gallery-intro">
              <p>
                Un petit tour en cuisine.
                <br />
                Explorez les vues, à votre rythme.
              </p>
              <a className="text-link" href="#poeles">
                Voir les poêles <Icon name="arrow" />
              </a>
            </div>
          </motion.div>
          <AccordionGallery
            items={gallery}
            defaultIndex={1}
            height={500}
            gap={16}
            radius={24}
            expandRatio={0.52}
            accentColor="#ffe276"
            overlayColor="#133b71"
            textColor="#fff6eb"
            trigger="click"
            tilt={3}
            parallax={0.3}
            duration={0.75}
            grayscale={false}
          />
          <div className="gallery-caption">
            <p>
              {products.length
                ? 'Sélectionnez une vue pour l’agrandir.'
                : 'Illustrations de présentation · catalogue à venir'}
            </p>
            <span>{String(gallery.length).padStart(2, '0')} VUES</span>
          </div>
        </section>
        <Catalog
          products={products}
          onAdd={add}
          quantities={Object.fromEntries(
            cart.lines.map((line) => [line.product.id, line.quantity]),
          )}
        />
      </main>
      <footer className="site-footer">
        <div>
          <p>On se retrouve en cuisine.</p>
          <a href="#top">
            Retour en haut <Icon name="arrow" />
          </a>
        </div>
        <p className="footer-wordmark" aria-label="onlyPoele">
          onlyPoele<span aria-hidden="true">✳</span>
        </p>
        <p className="footer-caption">La boutique de poêles à frire.</p>
      </footer>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      {cartOpen && (
        <CartDialog
          lines={cart.lines}
          totals={cart.totals}
          onQuantity={setQuantity}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}
