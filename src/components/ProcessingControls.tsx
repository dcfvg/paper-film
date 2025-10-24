import { useState, useEffect } from 'react';
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
  const [timeOffset, setTimeOffset] = useState(0); // en millisecondes
  const [smoothPhrases, setSmoothPhrases] = useState(true);

  // Désactiver automatiquement smoothPhrases si frameCount === subtitles.length
  useEffect(() => {
    if (frameCount === subtitles.length) {
      setSmoothPhrases(false);
    }
  }, [frameCount, subtitles.length]);

  const handleStart = () => {
    const selected = selectSubtitles(subtitles, frameCount, smoothPhrases, timeOffset);
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
            max={subtitles.length}
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            disabled={isProcessing}
            className="slider"
          />
          <div className="range-labels">
            <span>6</span>
            <span>{subtitles.length}</span>
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="time-offset">
            Décalage temporel: <strong>{timeOffset > 0 ? '+' : ''}{timeOffset} ms</strong>
          </label>
          <input
            id="time-offset"
            type="range"
            min="-5000"
            max="5000"
            step="100"
            value={timeOffset}
            onChange={(e) => setTimeOffset(Number(e.target.value))}
            disabled={isProcessing}
            className="slider"
          />
          <div className="range-labels">
            <span>-5s</span>
            <span>0</span>
            <span>+5s</span>
          </div>
          <div className="control-hint">
            Ajustez si les sous-titres ne sont pas synchronisés avec la vidéo
          </div>
        </div>

        <div className="control-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={smoothPhrases}
              onChange={(e) => setSmoothPhrases(e.target.checked)}
              disabled={isProcessing || frameCount === subtitles.length}
              className="control-checkbox"
            />
            <span>
              <strong>Fluidifier les phrases</strong>
              <small>Évite de couper les citations, questions et phrases courtes</small>
            </span>
          </label>
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
