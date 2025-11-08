import { useEffect, useState } from 'react';
import './PWAUpdatePrompt.css';

export default function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for update events from the service worker
    const handleNeedRefresh = () => {
      console.log('[PWA] Update prompt shown');
      setShowUpdate(true);
    };

    // Check if vite-plugin-pwa exposed the event
    if (window.updateSW) {
      // The registration callback in main.tsx already calls onNeedRefresh
      // We just need to listen for it
      const checkForUpdates = setInterval(() => {
        if (showUpdate) {
          clearInterval(checkForUpdates);
        }
      }, 1000);

      return () => clearInterval(checkForUpdates);
    }

    // Fallback to manual service worker detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleNeedRefresh();
            }
          });
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Controller changed, reloading page');
        window.location.reload();
      });
    }
  }, [showUpdate]);

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
