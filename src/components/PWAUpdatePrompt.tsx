import { useEffect, useState } from 'react';
import './PWAUpdatePrompt.css';

export default function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      console.log('[PWA] Update available');
      setRegistration(reg);
      setShowUpdate(true);
    };

    // Check for updates
    navigator.serviceWorker.ready.then((reg) => {
      // Check for updates every hour
      setInterval(
        () => {
          reg.update();
        },
        60 * 60 * 1000
      );

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleUpdate(reg);
          }
        });
      });

      // Check immediately
      reg.update();
    });

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Controller changed, reloading page');
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (!registration || !registration.waiting) return;

    // Send message to service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    setShowUpdate(false);
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
