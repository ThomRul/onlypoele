import { useSyncExternalStore } from 'react';
import { Icon } from '../../components/Icon';
import './header.css';

function subscribeScroll(notify: () => void) {
  window.addEventListener('scroll', notify, { passive: true });
  return () => window.removeEventListener('scroll', notify);
}

export function StoreHeader({ count, onOpenCart }: { count: number; onOpenCart: () => void }) {
  const solid = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 30,
    () => false,
  );
  return (
    <header className="site-header" data-solid={solid}>
      <nav aria-label="Navigation principale">
        <a href="#poeles">Les poêles</a>
        <a href="#galerie">L’univers</a>
      </nav>
      <a className="wordmark" href="#top" aria-label="onlyPoele, accueil">
        onlyPoele
      </a>
      <button
        type="button"
        className="button cart-toggle"
        onClick={onOpenCart}
        aria-haspopup="dialog"
        aria-label={`Panier, ${count} article${count === 1 ? '' : 's'}`}
      >
        <Icon name="bag" />
        <span>Panier</span>
        <span className="cart-count">{count}</span>
      </button>
    </header>
  );
}
