import { motion } from 'motion/react';
import { Icon } from '../../components/Icon';
import { useMediaQuery } from '../../components/useMediaQuery';
import { MAX_QUANTITY } from '../cart/useCart';
import { formatMoney } from './products';
import type { Product } from './products';
import './catalog.css';

interface Props {
  products: Product[];
  quantities: Record<string, number>;
  onAdd: (id: string) => void;
}

export function Catalog({ products, quantities, onAdd }: Props) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <section className="catalog-section section" id="poeles" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">À VOUS DE CHOISIR</p>
          <h2 id="catalog-title">
            La sélection
            <br />
            onlyPoele.
          </h2>
        </div>
        <p>
          Votre prochaine poêle
          <br />
          trouvera sa place ici.
        </p>
      </div>
      {products.length === 0 ? (
        <div className="catalog-empty">
          <span className="empty-icon" aria-hidden="true">
            <Icon name="cooking" />
          </span>
          <div>
            <h3>La sélection se prépare.</h3>
            <p>
              Le catalogue n’est pas encore disponible.
              <br />
              Les poêles et leurs prix seront présentés ici.
            </p>
          </div>
          <span className="empty-label">À venir</span>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product, index) => (
            <motion.article
              className="product-card"
              id={`produit-${encodeURIComponent(product.id)}`}
              key={product.id}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: Math.min(index, 3) * 0.08 }}
            >
              <div className="product-image">
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  loading="lazy"
                  width="600"
                  height="600"
                />
              </div>
              <div className="product-info">
                <p className="eyebrow">{product.details}</p>
                <div className="product-title">
                  <h3>{product.name}</h3>
                  <p>{formatMoney(product.priceCents, product.currency)}</p>
                </div>
                <p>{product.description}</p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onAdd(product.id)}
                  disabled={(quantities[product.id] ?? 0) >= MAX_QUANTITY}
                  aria-label={`Ajouter ${product.name} au panier`}
                >
                  {(quantities[product.id] ?? 0) >= MAX_QUANTITY
                    ? 'Quantité maximale atteinte'
                    : 'Ajouter au panier'}
                  <Icon name="plus" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
