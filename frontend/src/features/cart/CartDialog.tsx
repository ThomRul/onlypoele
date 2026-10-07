import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/Icon';
import { useMediaQuery } from '../../components/useMediaQuery';
import { formatMoney } from '../catalog/products';
import { MAX_QUANTITY } from './useCart';
import type { CartLine } from './useCart';
import './cart.css';

interface Props {
  lines: CartLine[];
  totals: Record<string, number>;
  onQuantity: (id: string, quantity: number) => void;
  onClose: () => void;
}

export function CartDialog({ lines, totals, onQuantity, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  function remove(line: CartLine, index: number) {
    onQuantity(line.product.id, 0);
    window.requestAnimationFrame(() => {
      const remaining = list.current?.querySelectorAll<HTMLButtonElement>('.remove-button');
      const target = remaining?.[Math.min(index, remaining.length - 1)];
      (target ?? heading.current)?.focus();
    });
  }

  return (
    <dialog className="cart-dialog" ref={dialog} aria-labelledby="cart-title" onClose={onClose}>
      <motion.div
        className="cart-content"
        initial={reduced ? false : { opacity: 0, x: 35 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="cart-header">
          <h2 id="cart-title" ref={heading} tabIndex={-1}>
            Votre panier
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer le panier"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <Icon name="close" />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="cart-empty">
            <Icon name="bag" />
            <h3>Ça sent le panier vide.</h3>
            <p>
              Vos poêles s’afficheront ici
              <br />
              quand vous les aurez choisies.
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => dialog.current?.close()}
            >
              Continuer la visite <Icon name="arrow" />
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines" ref={list}>
              {lines.map((line, index) => (
                <li className="cart-item" key={line.product.id}>
                  <img src={line.product.image} alt="" width="96" height="96" />
                  <div className="cart-item-info">
                    <h3>{line.product.name}</h3>
                    <p>{formatMoney(line.product.priceCents, line.product.currency)}</p>
                    <div
                      className="quantity-control"
                      role="group"
                      aria-label={`Quantité de ${line.product.name}`}
                    >
                      <button
                        type="button"
                        aria-label={`Diminuer la quantité de ${line.product.name}`}
                        disabled={line.quantity === 1}
                        onClick={() => onQuantity(line.product.id, line.quantity - 1)}
                      >
                        <Icon name="minus" />
                      </button>
                      <output aria-label={`Quantité de ${line.product.name}`}>
                        {line.quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`Augmenter la quantité de ${line.product.name}`}
                        disabled={line.quantity >= MAX_QUANTITY}
                        onClick={() => onQuantity(line.product.id, line.quantity + 1)}
                      >
                        <Icon name="plus" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => remove(line, index)}
                      aria-label={`Retirer ${line.product.name} du panier`}
                    >
                      Retirer
                    </button>
                  </div>
                  <p className="line-total">
                    {formatMoney(line.product.priceCents * line.quantity, line.product.currency)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <span>Total du panier</span>
              <div>
                {Object.entries(totals).map(([currency, cents]) => (
                  <strong key={currency}>{formatMoney(cents, currency)}</strong>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() => dialog.current?.close()}
            >
              Continuer la visite <Icon name="arrow" />
            </button>
          </>
        )}
      </motion.div>
    </dialog>
  );
}
