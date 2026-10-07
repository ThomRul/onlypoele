import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/archivo-black/latin-400.css';
import '@fontsource/barlow-condensed/latin-800.css';
import './styles.css';
const root = document.getElementById('root');
if (!root) throw new Error('Point de montage absent');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
