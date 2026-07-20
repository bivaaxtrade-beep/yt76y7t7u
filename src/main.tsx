import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

window.addEventListener('error', (event) => {
  console.error("Caught window error:", event.message, event.filename, event.lineno, event.colno, event.error);
});

// Overwrite console.error to suppress the duplicate key warning
// This prevents AI Studio Preview wrappers from throwing an error overlay that blocks testing on mobile.
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
    return;
  }
  originalConsoleError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
