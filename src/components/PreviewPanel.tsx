import { useRef, useEffect } from 'react';
import type { CapturedFrame, PrintOptions } from '../types';
import './PreviewPanel.css';

interface PreviewPanelProps {
  frames: CapturedFrame[];
  printOptions: PrintOptions;
  scale: number;
  onScaleChange: (scale: number) => void;
  isProcessing: boolean;
  timeOffset: number; // en secondes
}

export function PreviewPanel({
  frames,
  printOptions,
  scale,
  onScaleChange,
  isProcessing,
  timeOffset
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Format timestamp for display (avec application du timeOffset)
  const formatTimestamp = (seconds: number): string => {
    const adjustedSeconds = seconds + timeOffset;
    const hrs = Math.floor(adjustedSeconds / 3600);
    const mins = Math.floor((adjustedSeconds % 3600) / 60);
    const secs = Math.floor(adjustedSeconds % 60);
    const ms = Math.floor((adjustedSeconds % 1) * 1000);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Calculate how many frames fit per page based on columns and estimated rows
  // This is an approximation - in print, it will adjust naturally with grid auto-rows
  const estimatedRowsPerPage = printOptions.orientation === 'portrait' ? 6 : 4;
  const framesPerPage = printOptions.columns * estimatedRowsPerPage;
  const totalPages = Math.ceil(frames.length / framesPerPage);

  // Group frames into pages
  const pages: CapturedFrame[][] = [];
  for (let i = 0; i < frames.length; i += framesPerPage) {
    pages.push(frames.slice(i, i + framesPerPage));
  }

  // Auto-scroll to bottom when new frames are added
  useEffect(() => {
    if (isProcessing && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [frames.length, isProcessing]);

  const orientationClass = printOptions.orientation === 'landscape' ? 'landscape' : 'portrait';
  const formatClass = `format-${printOptions.pageFormat}`;
  const colsClass = `cols-${printOptions.columns}`;

  return (
    <div className="preview-panel" ref={containerRef}>
      <div className="preview-header">
        <div className="preview-header-top">
          <h2>Aperçu de l'impression</h2>
          <div className="preview-stats">
            <span className="stat-badge">
              📄 {totalPages} page{totalPages > 1 ? 's' : ''}
            </span>
            <span className="stat-badge">
              🎬 {frames.length} capture{frames.length > 1 ? 's' : ''}
            </span>
            <span className="stat-badge">
              📐 {printOptions.pageFormat.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="preview-zoom-control">
          <label htmlFor="preview-scale">
            Échelle: <strong>{Math.round(scale * 100)}%</strong>
          </label>
          <input
            id="preview-scale"
            type="range"
            min="0.25"
            max="1"
            step="0.05"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
            className="zoom-slider"
          />
          <div className="slider-labels">
            <span>25%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div 
        className="preview-pages"
        style={{ 
          '--preview-scale': scale,
        } as React.CSSProperties}
      >
        {pages.map((pageFrames, pageIndex) => (
          <div 
            key={pageIndex}
            className={`preview-page ${orientationClass} ${formatClass}`}
          >
            <div className="page-number">Page {pageIndex + 1}</div>
            
            <div className={`contact-sheet-grid ${colsClass}`}>
              {pageFrames.map((frame, frameIndex) => {
                const globalIndex = pageIndex * framesPerPage + frameIndex;
                return (
                  <div key={globalIndex} className="capture-item">
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
                          alt={`Capture ${globalIndex + 1}`}
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
                        style={{ fontSize: `${printOptions.subtitleFontSize}pt` }}
                      >
                        {frame.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-message">
            <div className="spinner-large" />
            <p>Génération des captures en cours...</p>
            <p className="processing-count">
              {frames.filter(f => !f.isLoading).length} / {frames.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
