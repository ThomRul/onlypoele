import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AccordionGallery from './AccordionGallery';

const items = ['Vue de face', 'Vue de dessus', 'Vue du manche'].map((label, index) => ({
  label,
  image: `/image-${index}.svg`,
}));

describe('galerie accordéon', () => {
  it('ouvre la vue choisie au clic et conserve les autres commandes accessibles', async () => {
    const user = userEvent.setup();
    render(<AccordionGallery items={items} defaultIndex={1} trigger="click" />);
    expect(screen.getByRole('button', { name: 'Vue de dessus' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Vue du manche' }));
    expect(screen.getByRole('button', { name: 'Vue du manche' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Vue de dessus' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('déplace le focus et la vue avec les flèches, Home et End', async () => {
    const user = userEvent.setup();
    render(<AccordionGallery items={items} trigger="click" />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Vue de face' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Vue de dessus' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Vue de dessus' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Vue du manche' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Vue de face' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Vue de face' })).toHaveFocus();
  });
});
