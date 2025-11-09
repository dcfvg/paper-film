import { useEffect, useState } from 'react';
import './PWAUpdatePrompt.css';

export default function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for the custom event dispatched from main.tsx
    const handleUpdateAvailable = () => {
      console.log('[PWA] Update prompt shown');
      setShowUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
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
