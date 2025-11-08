import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully');

        // Check for updates on page load
        registration.update();

        // Handle waiting service worker
        if (registration.waiting) {
          console.log('[PWA] Service Worker is waiting');
        }

        // Handle update found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          console.log('[PWA] New Service Worker found, installing...');

          newWorker.addEventListener('statechange', () => {
            console.log(`[PWA] Service Worker state: ${newWorker.state}`);

            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New content is available; update prompt will be shown');
            }
          });
        });

        // Periodic update check (every 1 hour)
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        );
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });

  // Handle when the service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] Service Worker controller changed');
  });
}
