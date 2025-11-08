import { useRef } from 'react';
import type { CapturedFrame, PrintOptions } from '../types';
import './PreviewPanel.css';

interface PreviewPanelProps {
  frames: CapturedFrame[];
  printOptions: PrintOptions;
  isProcessing: boolean;
  customTitle: string;
  showTitle: boolean;
}

export function PreviewPanel({
  frames,
  printOptions,
  isProcessing,
  customTitle,
  showTitle
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="preview-panel" ref={containerRef}>
      <div className="preview-content">
        <div className="sheet-wrapper">
          <div className={`paper-sheet${isProcessing ? ' sheet-rendering' : ''}`}>
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
                        <span>Capturing frame…</span>
                      </div>
                    ) : frame.error ? (
                      <div className="capture-error">
                        <span>Error</span>
                      </div>
                    ) : frame.imageUrl ? (
                      <img
                        src={frame.imageUrl}
                        alt={`Frame ${frameIndex + 1}`}
                        className="capture-image fade-in"
                      />
                    ) : (
                      <div className="capture-placeholder">
                        <span>Waiting…</span>
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
      </div>
    </div>
  );
}
