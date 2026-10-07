import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/archivo-black/latin-400.css';
import '@fontsource/barlow-condensed/latin-800.css';
import './styles.css';

// Chaque ouverture ou actualisation commence sur le hero, avant le montage React.
window.history.scrollRestoration = 'manual';
if (window.location.hash) {
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.search,
  );
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

const root = document.getElementById('root');
if (!root) throw new Error('Point de montage absent');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
