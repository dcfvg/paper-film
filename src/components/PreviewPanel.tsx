import { useRef } from 'react';
import type { CapturedFrame, PrintOptions, SubtitleEntry } from '../types';
import { selectSubtitles } from '../utils/subtitleParser';
import './PreviewPanel.css';

interface PreviewPanelProps {
  frames: CapturedFrame[];
  printOptions: PrintOptions;
  isProcessing: boolean;
  timeOffset: number; // en secondes
  allSubtitles: SubtitleEntry[]; // Pour retrouver les sous-titres décalés
  smoothPhrases: boolean; // Pour la répartition harmonieuse
  captureCount: number; // Pour recalculer la sélection
  videoFileName: string; // Nom du fichier vidéo
}

export function PreviewPanel({
  frames,
  printOptions,
  isProcessing,
  timeOffset,
  allSubtitles,
  smoothPhrases,
  captureCount,
  videoFileName
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
        (sub) => adjustedTime >= sub.startTime && adjustedTime <= sub.endTime
      );

      return subtitle?.text || ''; // Peut être vide si décalage important
    }

    return '';
  };

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
            <h2>{videoFileName}</h2>
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
            </div>
          </div>

          <button onClick={handlePrint} className="btn-print">
            🖨️ Imprimer
          </button>
        </div>
      </div>

      <div className="preview-content">
        <div className={`contact-sheet-grid ${colsClass}`}>
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
                  style={{ fontSize: `${printOptions.subtitleFontSize}pt` }}
                >
                  {findSubtitleForTimestamp(frameIndex)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
