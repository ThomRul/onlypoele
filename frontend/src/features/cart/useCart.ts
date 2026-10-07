import { useEffect, useState } from 'react';
import type { Product } from '../catalog/products';

const STORAGE_KEY = 'onlypoele.cart.v1';
export const MAX_QUANTITY = 99;
type Quantities = Record<string, number>;

export interface CartLine {
  product: Product;
  quantity: number;
}

function readQuantities(products: Product[]): Quantities {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    const entries = stored as Record<string, unknown>;
    return Object.fromEntries(
      products.flatMap(({ id }) => {
        const quantity = entries[id];
        return typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0
          ? [[id, Math.min(quantity, MAX_QUANTITY)]]
          : [];
      }),
    );
  } catch {
    return {};
  }
}

export function useCart(products: Product[]) {
  const [quantities, setQuantities] = useState(() => readQuantities(products));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
    } catch {
      // Le panier reste utilisable pour la visite si le stockage est indisponible.
    }
  }, [quantities]);

  const lines: CartLine[] = products.flatMap((product) =>
    quantities[product.id] ? [{ product, quantity: quantities[product.id] }] : [],
  );
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const totals = lines.reduce<Record<string, number>>((sums, { product, quantity }) => {
    sums[product.currency] = (sums[product.currency] ?? 0) + product.priceCents * quantity;
    return sums;
  }, {});

  function setQuantity(id: string, quantity: number) {
    if (!products.some((product) => product.id === id) || !Number.isInteger(quantity)) return;
    setQuantities((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(quantity, MAX_QUANTITY);
      return next;
    });
  }

  function add(id: string) {
    if (!products.some((product) => product.id === id)) return;
    setQuantities((current) => ({
      ...current,
      [id]: Math.min((current[id] ?? 0) + 1, MAX_QUANTITY),
    }));
  }

  return { lines, count, totals, add, setQuantity };
}
