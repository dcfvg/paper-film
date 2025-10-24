import { useRef } from 'react';
import type { CapturedFrame, PrintOptions, SubtitleEntry } from '../types';
import { selectSubtitles } from '../utils/subtitleParser';
import './PreviewPanel.css';

interface PreviewPanelProps {
  frames: CapturedFrame[];
  printOptions: PrintOptions;
  scale: number;
  onScaleChange: (scale: number) => void;
  isProcessing: boolean;
  timeOffset: number; // en secondes
  allSubtitles: SubtitleEntry[]; // Pour retrouver les sous-titres décalés
  smoothPhrases: boolean; // Pour la répartition harmonieuse
  captureCount: number; // Pour recalculer la sélection
}

export function PreviewPanel({
  frames,
  printOptions,
  scale,
  onScaleChange,
  isProcessing,
  timeOffset,
  allSubtitles,
  smoothPhrases,
  captureCount
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Recalculer la sélection des sous-titres avec smoothPhrases et timeOffset
  // Cela NE génère PAS de nouvelles images, juste répartit le texte différemment
  const selectedSubtitles = selectSubtitles(allSubtitles, captureCount, smoothPhrases, 0);

  // Trouve le sous-titre qui correspond à un timestamp donné (avec offset)
  // Utilise selectedSubtitles pour la répartition harmonieuse
  const findSubtitleForTimestamp = (frameIndex: number): string => {
    // Si on a le sous-titre correspondant dans selectedSubtitles (sans offset)
    if (frameIndex < selectedSubtitles.length) {
      const baseSubtitle = selectedSubtitles[frameIndex];
      
      // Si timeOffset === 0, utiliser directement le sous-titre calculé
      if (timeOffset === 0) {
        return baseSubtitle.text;
      }
      
      // Sinon, chercher avec le décalage temporel
      const adjustedTime = frames[frameIndex]?.timestamp + timeOffset;
      const subtitle = allSubtitles.find(
        sub => adjustedTime >= sub.startTime && adjustedTime <= sub.endTime
      );
      
      return subtitle?.text || ''; // Peut être vide si décalage important
    }
    
    return '';
  };

  // Format timestamp for display
  const formatTimestamp = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
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

  const orientationClass = printOptions.orientation === 'landscape' ? 'landscape' : 'portrait';
  const formatClass = `format-${printOptions.pageFormat}`;
  const colsClass = `cols-${printOptions.columns}`;

  return (
    <div className="preview-panel" ref={containerRef}>
      <div className="preview-header">
        <div className="preview-header-top">
          <div className="preview-title-stats">
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
              {isProcessing && (
                <span className="stat-badge processing-badge">
                  <div className="spinner-small" />
                  Génération en cours... {frames.filter(f => !f.isLoading).length}/{frames.length}
                </span>
              )}
            </div>
          </div>
          
          <div className="preview-zoom-control">
            <label htmlFor="preview-scale">
              <strong>{Math.round(scale * 100)}%</strong>
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
                        {findSubtitleForTimestamp(globalIndex)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
