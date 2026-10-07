import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { Catalog } from '../features/catalog/Catalog';

vi.mock('../features/catalog/products', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../features/catalog/products')>();
  return {
    ...actual,
    products: [
      {
        id: 'test-pan',
        name: 'Poêle de test',
        description: 'Donnée réservée aux tests',
        priceCents: 2499,
        currency: 'EUR',
        image: '/test.svg',
        imageAlt: 'Poêle de test',
        details: 'Test',
      },
    ],
  };
});

describe('parcours de la boutique', () => {
  it('ajoute une poêle, modifie sa quantité et la retire depuis le panier', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajouter Poêle de test au panier' }));
    await user.click(screen.getByRole('button', { name: 'Panier, 1 article' }));
    const dialog = screen.getByRole('dialog', { name: 'Votre panier' });
    await user.click(
      within(dialog).getByRole('button', { name: 'Augmenter la quantité de Poêle de test' }),
    );
    expect(within(dialog).getByText('Total du panier').parentElement).toHaveTextContent('49,98');
    expect(
      within(dialog).getByRole('status', { name: 'Quantité de Poêle de test' }),
    ).toHaveTextContent('2');
    await user.click(
      within(dialog).getByRole('button', { name: 'Retirer Poêle de test du panier' }),
    );
    expect(within(dialog).getByText('Ça sent le panier vide.')).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Continuer la visite' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Panier, 0 articles' })).toBeVisible();
  });

  it('conserve le panier entre deux visites', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajouter Poêle de test au panier' }));
    first.unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: 'Panier, 1 article' })).toBeVisible();
  });

  it('présente un état vide honnête lorsque les produits ne sont pas fournis', () => {
    render(<Catalog products={[]} quantities={{}} onAdd={vi.fn()} />);
    expect(screen.getByText(/Le catalogue n’est pas encore disponible\./)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Ajouter/ })).not.toBeInTheDocument();
  });

  it('utilise l’illustration statique quand les animations sont réduites', () => {
    const { container } = render(<App />);
    expect(
      screen.getByRole('img', {
        name: 'Huit poêles empilées, avec deux œufs au plat sur la dernière',
      }),
    ).toBeVisible();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
    const stage = container.querySelector('.cooking-stage')!;
    expect(stage.querySelector('button')).not.toBeInTheDocument();
    expect(stage.querySelector('.pan-scene img')).toHaveAttribute(
      'src',
      '/illustrations/pan-stack.png',
    );
  });
});
