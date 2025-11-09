import type { CapturedFrame, PrintOptions as PrintOptionsType } from '../types';
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
  isSmoothForced?: boolean;
  frames: CapturedFrame[];
  isProcessing: boolean;
  onPrint: () => void;
  customTitle: string;
  onTitleChange: (value: string) => void;
  showTitle: boolean;
  onToggleTitle: () => void;

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
  isSmoothForced = false,
  printOptions,
  frames,
  isProcessing,
  onPrint,
  customTitle,
  onTitleChange,
  showTitle,
  onToggleTitle,
  onPrintOptionsChange,
  onBack
}: ConfigPanelProps) {
  const readyFrames = frames.filter((frame) => frame && !frame.isLoading).length;
  const logoSrc = `${import.meta.env.BASE_URL}paper-film-mark.svg`;

  const handleIdentityActivate = () => {
    if (onBack) onBack();
  };

  return (
    <div className="config-panel">
      <div className="config-header">
        <div
          className="app-identity"
          onClick={handleIdentityActivate}
          role={onBack ? 'button' : undefined}
          tabIndex={onBack ? 0 : -1}
          onKeyDown={(event) => {
            if (!onBack) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleIdentityActivate();
            }
          }}
        >
          <img src={logoSrc} className="app-logo" alt="Paper Film mark" />
          <div className="app-identity-text">
            <h2>Paper Film</h2>
            <p className="app-tagline">Contact sheets from video + subtitles.</p>
          </div>
        </div>
        <div className="config-actions" />
      </div>

      <div className="panel-hero">
        <div className="hero-stats">
          <div className="stat-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="6" width="16" height="10" rx="2" stroke="currentColor" fill="none" />
              <path
                d="M4 15l4-3 4 3 4-3 4 3"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <span>Frames ready</span>
              <strong>
                {readyFrames}/{frames.length || captureCount}
              </strong>
            </div>
          </div>
          <div className="stat-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8" stroke="currentColor" fill="none" />
              <path d="M12 8v5l3 2" stroke="currentColor" fill="none" strokeLinecap="round" />
            </svg>
            <div>
              <span>Status</span>
              <strong>{isProcessing ? 'Rendering…' : 'Idle'}</strong>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <div className="title-block">
            <label htmlFor="title-input">Title</label>
            <div className="title-controls-compact">
              <input
                id="title-input"
                type="text"
                value={customTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Session name"
              />
              <button
                type="button"
                className={`ghost-btn ${showTitle ? 'active' : ''}`}
                onClick={onToggleTitle}
                aria-pressed={showTitle}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  {showTitle ? (
                    <path
                      d="M2 12s4.5-7 10-7 10 7 10 7-4.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      fill="none"
                      stroke="currentColor"
                    />
                  ) : (
                    <>
                      <path
                        d="M2 12s4.5-7 10-7 10 7 10 7-4.5 7-10 7-10-7-10-7Z"
                        fill="none"
                        stroke="currentColor"
                      />
                      <line
                        x1="3"
                        y1="4"
                        x2="21"
                        y2="20"
                        stroke="currentColor"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" />
                    </>
                  )}
                </svg>
                <span className="sr-only">Toggle title visibility</span>
              </button>
            </div>
          </div>
          <button className="btn-primary print-btn" onClick={onPrint} disabled={isProcessing}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 9V3h12v6M6 15H4a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-2"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
              />
              <rect x="8" y="15" width="8" height="6" rx="1" stroke="currentColor" fill="none" />
            </svg>
            Print sheet
          </button>
        </div>
      </div>

      <div className="config-group">
        <h3>Frames</h3>

        <div className="config-control">
          <label htmlFor="capture-count">
            Number of frames: <strong>{captureCount}</strong>
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
            Subtitle offset:{' '}
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
            <span>-30s (late)</span>
            <span>+30s (early)</span>
          </div>
        </div>
      </div>

      <div className="config-group">
        <h3>Print setup</h3>
        <PrintOptions 
          options={printOptions} 
          onChange={onPrintOptionsChange}
          smoothPhrases={smoothPhrases}
          onSmoothPhrasesChange={onSmoothPhrasesChange}
          isSmoothForced={isSmoothForced}
        />
      </div>
    </div>
  );
}
