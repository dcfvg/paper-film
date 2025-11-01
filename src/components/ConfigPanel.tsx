import type { PrintOptions as PrintOptionsType } from '../types';
import PrintOptions from './PrintOptions';
import './ConfigPanel.css';

interface ConfigPanelProps {
  // Subtitle info
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
  subtitles,
  captureCount,
  onCaptureCountChange,
  timeOffset,
  onTimeOffsetChange,
  smoothPhrases,
  onSmoothPhrasesChange,
  printOptions,
  onPrintOptionsChange,
  onBack
}: ConfigPanelProps) {
  return (
    <div className="config-panel">
      <div className="config-header">
        <h2>Ciné-Roman</h2>
        <div className="config-actions">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              ← Retour
            </button>
          )}
        </div>
      </div>

      <div className="config-group">
        <h3>🎬 Captures</h3>

        <div className="config-control">
          <label htmlFor="capture-count">
            Nombre de captures: <strong>{captureCount}</strong>
          </label>
          <input
            id="capture-count"
            type="range"
            min="1"
            max={subtitles.length}
            value={captureCount}
            onChange={(e) => onCaptureCountChange(parseInt(e.target.value))}
            className="config-slider"
          />
          <div className="slider-labels">
            <span>1</span>
            <span>{subtitles.length}</span>
          </div>
        </div>

        <div className="config-control">
          <label htmlFor="time-offset">
            Décalage sous-titres:{' '}
            <strong>
              {timeOffset > 0 ? '+' : ''}
              {timeOffset}s
            </strong>
          </label>
          <input
            id="time-offset"
            type="range"
            min="-30"
            max="30"
            step="0.5"
            value={timeOffset}
            onChange={(e) => onTimeOffsetChange(parseFloat(e.target.value))}
            className="config-slider"
          />
          <div className="slider-labels">
            <span>-30s (en retard)</span>
            <span>+30s (en avance)</span>
          </div>
        </div>

        <div className="option-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={smoothPhrases}
              onChange={(e) => onSmoothPhrasesChange(e.target.checked)}
              className="option-checkbox"
            />
            <span>Texte fluide</span>
          </label>
        </div>
      </div>

      <div className="config-group">
        <h3>🖨️ Impression</h3>
        <PrintOptions options={printOptions} onChange={onPrintOptionsChange} />
      </div>
    </div>
  );
}
