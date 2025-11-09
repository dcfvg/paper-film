import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker with vite-plugin-pwa
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New content available, prompting for update');
    // Dispatch a custom event that the PWAUpdatePrompt component can listen to
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  },
  onOfflineReady() {
    console.log('[PWA] App ready to work offline');
  },
  onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
    console.log('[PWA] Service worker registered:', swScriptUrl);

    // Check for updates periodically (every hour)
    if (registration) {
      setInterval(
        () => {
          registration.update();
        },
        60 * 60 * 1000
      );
    }
  },
  onRegisterError(error: Error) {
    console.error('[PWA] Service worker registration failed:', error);
  }
});

// Make updateSW available globally for PWA components
window.updateSW = updateSW;
