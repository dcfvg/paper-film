import { useState } from 'react';
import type { SubtitleEntry } from '../types';
import { selectSubtitles } from '../utils/subtitleParser';
import './ProcessingControls.css';

interface ProcessingControlsProps {
  subtitles: SubtitleEntry[];
  onStart: (selectedSubtitles: SubtitleEntry[]) => void;
  onCancel: () => void;
  isProcessing: boolean;
  progress: number;
}

export default function ProcessingControls({
  subtitles,
  onStart,
  onCancel,
  isProcessing,
  progress
}: ProcessingControlsProps) {
  const [frameCount, setFrameCount] = useState(Math.min(24, subtitles.length));

  const handleStart = () => {
    const selected = selectSubtitles(subtitles, frameCount);
    onStart(selected);
  };

  return (
    <div className="processing-controls">
      <div className="controls-content">
        <h2>Configuration de la planche</h2>
        
        <div className="control-group">
          <label htmlFor="frame-count">
            Nombre de captures: <strong>{frameCount}</strong>
          </label>
          <input
            id="frame-count"
            type="range"
            min="6"
            max={Math.min(100, subtitles.length)}
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            disabled={isProcessing}
            className="slider"
          />
          <div className="range-labels">
            <span>6</span>
            <span>{Math.min(100, subtitles.length)}</span>
          </div>
        </div>

        <div className="info-box">
          <p>
            📊 <strong>{subtitles.length}</strong> sous-titres détectés
          </p>
          <p>
            🎬 <strong>{frameCount}</strong> captures seront générées
          </p>
        </div>

        {isProcessing && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-text">
              Capture en cours... {Math.round(progress)}%
            </p>
          </div>
        )}

        <div className="button-group">
          {!isProcessing ? (
            <>
              <button onClick={onCancel} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={handleStart} className="btn btn-primary">
                Générer la planche
              </button>
            </>
          ) : (
            <button onClick={onCancel} className="btn btn-secondary">
              Annuler le traitement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
