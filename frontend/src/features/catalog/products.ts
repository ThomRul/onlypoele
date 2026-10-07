export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  image: string;
  imageAlt: string;
  details: string;
}

// Les références et prix réels seront fournis par l'utilisateur.
export const products: Product[] = [];

export function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
