import { useEffect } from 'react';
import type { CapturedFrame, PrintOptions, SubtitleEntry } from '../types';
import { formatTimestamp } from '../utils/videoCapture';
import PrintOptionsComponent from './PrintOptions';
import './ContactSheet.css';

interface ContactSheetProps {
  frames: CapturedFrame[];
  onBack: () => void;
  onGenerate: () => void;
  videoFileName?: string;
  subtitles: SubtitleEntry[];
  captureCount: number;
  onCaptureCountChange: (count: number) => void;
  timeOffset: number;
  onTimeOffsetChange: (offset: number) => void;
  smoothPhrases: boolean;
  onSmoothPhrasesChange: (smooth: boolean) => void;
  isProcessing: boolean;
  progress: number;
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
}

export default function ContactSheet({
  frames,
  onBack,
  onGenerate,
  videoFileName,
  subtitles,
  captureCount,
  onCaptureCountChange,
  timeOffset,
  onTimeOffsetChange,
  smoothPhrases,
  onSmoothPhrasesChange,
  isProcessing,
  progress,
  printOptions,
  onPrintOptionsChange
}: ContactSheetProps) {
  // Force smooth phrases when there are more subtitles than frames
  const isSmoothForced = subtitles.length > 0 && captureCount < subtitles.length;

  const handlePrint = () => {
    window.print();
  };

  // Désactiver automatiquement smoothPhrases si captureCount === subtitles.length
  useEffect(() => {
    if (captureCount === subtitles.length) {
      onSmoothPhrasesChange(false);
    }
  }, [captureCount, subtitles.length, onSmoothPhrasesChange]);

  // Apply print options to CSS variables
  const gridStyle = {
    '--columns': printOptions.columns,
    '--subtitle-font-size': `${printOptions.subtitleFontSize}pt`
  } as React.CSSProperties;

  return (
    <div
      className={`contact-sheet-container 
        cols-${printOptions.columns} 
        ${printOptions.showTimecodes ? 'show-timecodes' : 'hide-timecodes'}`}
      style={gridStyle}
    >
      <div className="contact-sheet-header-fixed no-print">
        <div className="header-compact">
          <div className="header-top">
            <button onClick={onBack} className="btn btn-secondary btn-sm">
              ← Back
            </button>
            <h2 className="header-title">{videoFileName}</h2>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              🖨️ Print
            </button>
          </div>

          <div className="header-main">
            <div className="header-left">
              <div className="controls-section">
                <h3 className="section-title">⚙️ Setup</h3>

                <div className="control-row">
                  <label htmlFor="frame-count" className="control-label">
                    Frames: <strong>{captureCount}</strong>
                  </label>
                  <input
                    id="frame-count"
                    type="range"
                    min="6"
                    max={subtitles.length}
                    value={captureCount}
                    onChange={(e) => onCaptureCountChange(Number(e.target.value))}
                    disabled={isProcessing}
                    className="control-slider"
                  />
                  <div className="control-range-labels">
                    <span>6</span>
                    <span>{subtitles.length}</span>
                  </div>
                </div>

                <div className="control-row">
                  <label htmlFor="time-offset" className="control-label">
                    Offset:{' '}
                    <strong>
                      {timeOffset > 0 ? '+' : ''}
                      {timeOffset}ms
                    </strong>
                  </label>
                  <input
                    id="time-offset"
                    type="range"
                    min="-5000"
                    max="5000"
                    step="100"
                    value={timeOffset}
                    onChange={(e) => onTimeOffsetChange(Number(e.target.value))}
                    disabled={isProcessing}
                    className="control-slider"
                  />
                  <div className="control-range-labels">
                    <span>-5s</span>
                    <span>+5s</span>
                  </div>
                </div>

                <div className="control-row">
                  <label className="control-checkbox-label">
                    <input
                      type="checkbox"
                      checked={smoothPhrases}
                      onChange={(e) => onSmoothPhrasesChange(e.target.checked)}
                      disabled={isProcessing || captureCount === subtitles.length}
                      className="control-checkbox"
                    />
                    <span>Smooth text</span>
                  </label>
                </div>

                <div className="control-actions">
                  {isProcessing ? (
                    <div className="progress-inline">
                      <div className="progress-bar-inline">
                        <div className="progress-fill-inline" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="progress-text-inline">{Math.round(progress)}%</span>
                    </div>
                  ) : (
                    <button onClick={onGenerate} className="btn btn-primary btn-block">
                      🎬 Generate {captureCount} frames
                    </button>
                  )}
                </div>
              </div>

              <div className="options-section">
                <PrintOptionsComponent
                  options={printOptions}
                  onChange={onPrintOptionsChange}
                  smoothPhrases={smoothPhrases}
                  onSmoothPhrasesChange={onSmoothPhrasesChange}
                  isSmoothForced={isSmoothForced}
                />
              </div>
            </div>

            <div className="header-right">
              <PrintOptionsComponent
                options={printOptions}
                onChange={onPrintOptionsChange}
                smoothPhrases={smoothPhrases}
                onSmoothPhrasesChange={onSmoothPhrasesChange}
                isSmoothForced={isSmoothForced}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="contact-sheet-content">
        <div className="contact-sheet-grid" style={gridStyle}>
          {frames.map((frame, index) => (
            <div key={index} className="frame-card">
              <div className="frame-image-container">
                {frame.isLoading ? (
                  <div className="frame-loading">
                    <div className="spinner"></div>
                    <p>Capturing frame…</p>
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
                    <p>Waiting…</p>
                  </div>
                )}
              </div>

              <div className="frame-info">
                {printOptions.showTimecodes && (
                  <div className="frame-timestamp">{formatTimestamp(frame.timestamp)}</div>
                )}
                <div
                  className="frame-subtitle"
                  style={{
                    textAlign: printOptions.subtitleAlignment,
                    fontFamily: printOptions.subtitleFontFamily
                  }}
                >
                  {frame.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-sheet-footer">
          <p>
            {frames.filter((f) => f && !f.isLoading).length} / {frames.length} frames ready
          </p>
        </div>
      </div>
    </div>
  );
}
