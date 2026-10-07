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
import { StoreHeader } from './features/storefront/StoreHeader';
import { CookingStage } from './features/storefront/CookingStage';
import './features/storefront/storefront.css';

const illustrations: GalleryItem[] = [
  {
    image: '/media/gallery-breakfast.png',
    label: 'Du matin…',
    alt: 'Une poêle avec deux œufs au plat sur un fond abricot',
  },
  {
    image: '/media/gallery-cooking.png',
    label: '…au dîner.',
    alt: 'Une poêle avec un plat cuisiné sur un fond lilas',
  },
  {
    image: '/media/gallery-vegetables.png',
    label: 'Et selon vos envies.',
    alt: 'Une poêle de légumes sur un plan de travail menthe',
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
      <StoreHeader count={cart.count} onOpenCart={() => setCartOpen(true)} />
      <main id="contenu">
        <Hero />
        <div className="brand-strip" aria-hidden="true">
          <span>POÊLES À FRIRE</span>
          <Icon name="utensils" />
          <span>ENVIE DE CUISINER</span>
          <Icon name="cooking" />
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
              <p className="eyebrow">LES POÊLES EN BONNE COMPAGNIE</p>
              <h2 id="gallery-title">
                De quoi vous
                <br />
                <span>mettre en appétit.</span>
              </h2>
            </div>
            <div className="gallery-intro">
              <a className="text-link" href="#poeles">
                Voir les poêles <Icon name="arrow" />
              </a>
            </div>
          </motion.div>
          <AccordionGallery
            items={gallery}
            defaultIndex={1}
            height={590}
            gap={16}
            radius={18}
            expandRatio={0.52}
            accentColor="#fff6eb"
            overlayColor="#00559b"
            textColor="#fff6eb"
            trigger="click"
            tilt={3}
            parallax={0.3}
            duration={0.75}
            grayscale={false}
          />
          <div className="gallery-caption">
            <p>{products.length ? 'Sélectionnez une vue pour l’agrandir.' : 'Catalogue à venir'}</p>
            <span>{String(gallery.length).padStart(2, '0')} VUES</span>
          </div>
        </section>
        <CookingStage />
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
          onlyPoele
          <span aria-hidden="true">
            <Icon name="utensils" />
          </span>
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
