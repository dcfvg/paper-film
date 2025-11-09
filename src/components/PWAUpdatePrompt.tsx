import { useEffect, useState } from 'react';
import './PWAUpdatePrompt.css';

const UPDATE_EVENT = 'paper-film:pwa-refresh';

export default function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      console.log('[PWA] Update prompt shown');
      setShowUpdate(true);
    };

    const cleanupFns: Array<() => void> = [];

    // Listen for the custom event dispatched from main.tsx whenever the SW needs a refresh
    window.addEventListener(UPDATE_EVENT, handleUpdateAvailable);
    cleanupFns.push(() => window.removeEventListener(UPDATE_EVENT, handleUpdateAvailable));

    // Fallback: also listen to native service worker signals in case the custom event fails
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const handleUpdateFound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          const handleStateChange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdateAvailable();
            }

            if (
              newWorker.state === 'redundant' ||
              newWorker.state === 'activated' ||
              newWorker.state === 'installed'
            ) {
              newWorker.removeEventListener('statechange', handleStateChange);
            }
          };

          newWorker.addEventListener('statechange', handleStateChange);
        };

        registration.addEventListener('updatefound', handleUpdateFound);
        cleanupFns.push(() => registration.removeEventListener('updatefound', handleUpdateFound));
      });

      const handleControllerChange = () => {
        console.log('[PWA] Controller changed, reloading page');
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      cleanupFns.push(() =>
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      );
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  const handleUpdate = async () => {
    setShowUpdate(false);

    if (window.updateSW) {
      await window.updateSW(true);
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="pwa-update-prompt">
      <div className="pwa-update-content">
        <div className="pwa-update-icon">🔄</div>
        <div className="pwa-update-text">
          <h3>Update Available</h3>
          <p>A new version of Paper Film is ready to install</p>
        </div>
        <div className="pwa-update-actions">
          <button onClick={handleUpdate} className="pwa-update-button" type="button">
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-button"
            type="button"
            aria-label="Dismiss update prompt"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
