import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCart } from './useCart';
import type { Product } from '../catalog/products';

const products: Product[] = [
  {
    id: 'test-pan',
    name: 'Poêle de test',
    description: 'Donnée de test',
    priceCents: 2499,
    currency: 'EUR',
    image: '/test.svg',
    imageAlt: 'Test',
    details: '',
  },
];

describe('panier', () => {
  it('additionne les quantités, calcule le prix en centimes et retire une référence', () => {
    const { result } = renderHook(() => useCart(products));
    act(() => {
      result.current.add('test-pan');
      result.current.add('test-pan');
    });
    expect(result.current.count).toBe(2);
    expect(result.current.totals.EUR).toBe(4998);
    act(() => result.current.setQuantity('test-pan', 0));
    expect(result.current.lines).toEqual([]);
  });

  it('restaure les quantités, en utilisant les prix actuels du catalogue', () => {
    const first = renderHook(() => useCart(products));
    act(() => first.result.current.setQuantity('test-pan', 3));
    first.unmount();
    const second = renderHook(() => useCart([{ ...products[0], priceCents: 1999 }]));
    expect(second.result.current.count).toBe(3);
    expect(second.result.current.totals.EUR).toBe(5997);
  });

  it('ignore les références inconnues et les quantités invalides du stockage', () => {
    window.localStorage.setItem(
      'onlypoele.cart.v1',
      JSON.stringify({ 'test-pan': -2, unknown: 8 }),
    );
    const { result } = renderHook(() => useCart(products));
    expect(result.current.count).toBe(0);
    act(() => {
      result.current.add('unknown');
      result.current.setQuantity('test-pan', 1.5);
    });
    expect(result.current.count).toBe(0);
  });

  it('reste utilisable lorsque le stockage est corrompu ou interdit', () => {
    window.localStorage.setItem('onlypoele.cart.v1', '{invalid');
    vi.spyOn(window.Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Stockage interdit');
    });
    const { result } = renderHook(() => useCart(products));
    act(() => result.current.add('test-pan'));
    expect(result.current.count).toBe(1);
  });

  it('limite les quantités restaurées et saisies à 99', () => {
    window.localStorage.setItem('onlypoele.cart.v1', '{"test-pan":1000}');
    const { result } = renderHook(() => useCart(products));
    expect(result.current.count).toBe(99);
    act(() => result.current.add('test-pan'));
    expect(result.current.count).toBe(99);
  });
});
