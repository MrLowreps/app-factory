import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@app-factory/design-tokens/tokens.css';
import '@app-factory/design-tokens/base.css';
import './theme.css';
import './app.css';
import { App } from './App';
import { applyTheme, readTheme } from './screens/Settings';

applyTheme(readTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
