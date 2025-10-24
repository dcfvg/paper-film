import type { CapturedFrame } from '../types';
import { formatTimestamp } from '../utils/videoCapture';
import './ContactSheet.css';

interface ContactSheetProps {
  frames: CapturedFrame[];
  onBack: () => void;
  videoFileName?: string;
}

export default function ContactSheet({ frames, onBack, videoFileName }: ContactSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="contact-sheet-container">
      <div className="contact-sheet-controls no-print">
        <button onClick={onBack} className="btn btn-secondary">
          ← Retour
        </button>
        <h2>Planche de contact - {videoFileName}</h2>
        <button onClick={handlePrint} className="btn btn-primary">
          🖨️ Imprimer
        </button>
      </div>

      <div className="contact-sheet-grid">
        {frames.map((frame, index) => (
          <div key={index} className="frame-card">
            <div className="frame-image-container">
              {frame.isLoading ? (
                <div className="frame-loading">
                  <div className="spinner"></div>
                  <p>Capture en cours...</p>
                </div>
              ) : frame.error ? (
                <div className="frame-error">
                  <p>❌ {frame.error}</p>
                </div>
              ) : frame.imageUrl ? (
                <img 
                  src={frame.imageUrl} 
                  alt={`Frame at ${formatTimestamp(frame.timestamp)}`}
                  className="frame-image"
                />
              ) : (
                <div className="frame-placeholder">
                  <p>En attente...</p>
                </div>
              )}
            </div>
            
            <div className="frame-info">
              <div className="frame-timestamp">
                {formatTimestamp(frame.timestamp)}
              </div>
              <div className="frame-subtitle">
                {frame.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-sheet-footer no-print">
        <p>
          {frames.filter(f => !f.isLoading).length} / {frames.length} captures prêtes
        </p>
      </div>
    </div>
  );
}
