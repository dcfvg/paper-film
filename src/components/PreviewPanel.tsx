import { useRef, useState } from 'react';
import type { CapturedFrame, PrintOptions } from '../types';
import './PreviewPanel.css';

interface PreviewPanelProps {
  frames: CapturedFrame[];
  printOptions: PrintOptions;
  isProcessing: boolean;
  videoFileName: string; // Nom du fichier vidéo
}

export function PreviewPanel({
  frames,
  printOptions,
  isProcessing,
  videoFileName
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [customTitle, setCustomTitle] = useState(videoFileName);
  const [showTitle, setShowTitle] = useState(true);

  // Format timestamp for display
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hrs > 0) {
      return `${hrs}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const colsClass = `cols-${printOptions.columns}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="preview-panel" ref={containerRef}>
      <div className="preview-header">
        <div className="preview-header-content">
          <div className="preview-title-section">
            <div className="title-controls">
              <button
                onClick={() => setShowTitle(!showTitle)}
                className="btn-toggle-title-icon"
                title={showTitle ? 'Cacher le titre' : 'Afficher le titre'}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {showTitle ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="title-input-inline"
                style={{
                  fontSize: `${printOptions.subtitleFontSize}pt`,
                  fontWeight: 'bold'
                }}
                placeholder="Titre du film"
              />
            </div>
            <div className="preview-stats">
              <span className="stat-badge">
                🎬 {frames.length} capture{frames.length > 1 ? 's' : ''}
              </span>
              {isProcessing && (
                <span className="stat-badge processing-badge">
                  <div className="spinner-small" />
                  Génération en cours... {frames.filter((f) => !f.isLoading).length}/{frames.length}
                </span>
              )}
              <button onClick={handlePrint} className="btn-print">
                🖨️ Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="preview-content">
        <div className={`contact-sheet-grid ${colsClass}`}>
          {showTitle && customTitle.trim() && (
            <div className="title-card">
              <h1
                className="title-card-text"
                style={{
                  fontSize: `${printOptions.subtitleFontSize}pt`,
                  fontWeight: 'bold'
                }}
              >
                {customTitle}
              </h1>
            </div>
          )}
          {frames.map((frame, frameIndex) => (
            <div key={frameIndex} className="capture-item">
              <div className="capture-image-wrapper">
                {frame.isLoading ? (
                  <div className="capture-loading">
                    <div className="spinner" />
                    <span>Capture en cours...</span>
                  </div>
                ) : frame.error ? (
                  <div className="capture-error">
                    <span>❌ Erreur</span>
                  </div>
                ) : frame.imageUrl ? (
                  <img
                    src={frame.imageUrl}
                    alt={`Capture ${frameIndex + 1}`}
                    className="capture-image"
                  />
                ) : (
                  <div className="capture-placeholder">
                    <span>En attente...</span>
                  </div>
                )}
              </div>

              <div className="capture-subtitle">
                {printOptions.showTimecodes && (
                  <div
                    className="capture-timecode"
                    style={{ fontSize: `${printOptions.subtitleFontSize * 0.7}pt` }}
                  >
                    {formatTimestamp(frame.timestamp)}
                  </div>
                )}
                <div
                  className="capture-text"
                  style={{
                    fontSize: `${printOptions.subtitleFontSize}pt`,
                    textAlign: printOptions.subtitleAlignment
                  }}
                >
                  {frame.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
