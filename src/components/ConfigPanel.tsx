import type { PrintOptions as PrintOptionsType } from '../types';
import PrintOptions from './PrintOptions';
import './ConfigPanel.css';

interface ConfigPanelProps {
  // Video and subtitle info
  videoFile: File;
  subtitles: Array<{ index: number; startTime: number; endTime: number; text: string }>;
  
  // Capture settings
  captureCount: number;
  onCaptureCountChange: (count: number) => void;
  timeOffset: number;
  onTimeOffsetChange: (offset: number) => void;
  smoothPhrases: boolean;
  onSmoothPhrasesChange: (enabled: boolean) => void;
  
  // Print options
  printOptions: PrintOptionsType;
  onPrintOptionsChange: (options: PrintOptionsType) => void;

  // Actions
  onBack?: () => void;
}

export function ConfigPanel({
  videoFile,
  subtitles,
  captureCount,
  onCaptureCountChange,
  timeOffset,
  onTimeOffsetChange,
  smoothPhrases,
  onSmoothPhrasesChange,
  printOptions,
  onPrintOptionsChange,
  onBack,
}: ConfigPanelProps) {
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="config-panel">
      <div className="config-header">
        <h2>Configuration</h2>
        <div className="config-actions">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              ← Retour
            </button>
          )}
          <button onClick={handlePrint} className="btn-primary">
            🖨️ Imprimer
          </button>
        </div>
      </div>

      <div className="config-section">
        <h3>📹 Fichiers</h3>
        <div className="file-info">
          <div className="file-item">
            <span className="file-label">Vidéo:</span>
            <span className="file-name">{videoFile.name}</span>
          </div>
          <div className="file-item">
            <span className="file-label">Sous-titres:</span>
            <span className="file-count">{subtitles.length} entrées</span>
          </div>
        </div>
      </div>

      <div className="config-section">
        <h3>🎬 Captures</h3>
        
        <div className="config-control">
          <label htmlFor="capture-count">
            Nombre de captures: <strong>{captureCount}</strong>
          </label>
          <input
            id="capture-count"
            type="range"
            min="6"
            max={subtitles.length}
            value={captureCount}
            onChange={(e) => onCaptureCountChange(parseInt(e.target.value))}
            className="config-slider"
          />
          <div className="slider-labels">
            <span>6</span>
            <span>{subtitles.length}</span>
          </div>
        </div>

        <div className="config-control">
          <label htmlFor="time-offset">
            Décalage temporel: <strong>{timeOffset > 0 ? '+' : ''}{timeOffset}s</strong>
          </label>
          <input
            id="time-offset"
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={timeOffset}
            onChange={(e) => onTimeOffsetChange(parseFloat(e.target.value))}
            className="config-slider"
          />
          <div className="slider-labels">
            <span>-5s</span>
            <span>+5s</span>
          </div>
        </div>

        <div className="config-control">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={smoothPhrases}
              onChange={(e) => onSmoothPhrasesChange(e.target.checked)}
              disabled={captureCount === subtitles.length}
            />
            <span>Phrases fluides (évite les coupures)</span>
          </label>
          {captureCount === subtitles.length && (
            <p className="help-text">
              Désactivé automatiquement car toutes les entrées sont sélectionnées
            </p>
          )}
        </div>
      </div>

      <div className="config-section">
        <h3>🖨️ Options d'impression</h3>
        <PrintOptions
          options={printOptions}
          onChange={onPrintOptionsChange}
        />
      </div>
    </div>
  );
}
