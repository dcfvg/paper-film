import type { CapturedFrame, PrintOptions } from '../types';
import { formatTimestamp } from '../utils/videoCapture';
import PrintOptionsComponent from './PrintOptions';
import LayoutPreview from './LayoutPreview';
import './ContactSheet.css';

interface ContactSheetProps {
  frames: CapturedFrame[];
  onBack: () => void;
  videoFileName?: string;
  printOptions: PrintOptions;
  onPrintOptionsChange: (options: PrintOptions) => void;
}

export default function ContactSheet({ 
  frames, 
  onBack, 
  videoFileName, 
  printOptions, 
  onPrintOptionsChange 
}: ContactSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  // Apply print options to CSS variables
  const gridStyle = {
    '--columns': printOptions.columns,
    '--subtitle-font-size': `${printOptions.subtitleFontSize}pt`,
  } as React.CSSProperties;

  return (
    <div 
      className={`contact-sheet-container 
        cols-${printOptions.columns} 
        ${printOptions.orientation} 
        ${printOptions.pageFormat}
        ${printOptions.showTimecodes ? 'show-timecodes' : 'hide-timecodes'}`}
      style={gridStyle}
    >
      <div className="contact-sheet-header no-print">
        <div className="header-controls">
          <button onClick={onBack} className="btn btn-secondary">
            ← Retour
          </button>
          <h2>Planche de contact - {videoFileName}</h2>
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ Imprimer
          </button>
        </div>

        <div className="header-layout">
          <div className="header-options">
            <PrintOptionsComponent 
              options={printOptions} 
              onChange={onPrintOptionsChange} 
            />
          </div>
          
          <div className="header-preview">
            <LayoutPreview 
              printOptions={printOptions}
              totalFrames={frames.length}
            />
          </div>
        </div>
      </div>

      <div className="contact-sheet-grid" style={gridStyle}>
        {frames.map((frame, index) => (
          <div key={index} className="frame-card">
            <div className="frame-image-container">
              {frame.isLoading ? (
                <div className="frame-loading">
                  <div className="spinner"></div>
                  <p>Capture en cours...</p>
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
                  <p>En attente...</p>
                </div>
              )}
            </div>
            
            <div className="frame-info">
              {printOptions.showTimecodes && (
                <div className="frame-timestamp">
                  {formatTimestamp(frame.timestamp)}
                </div>
              )}
              <div className="frame-subtitle">
                {frame.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-sheet-footer no-print">
        <p>
          {frames.filter(f => !f.isLoading).length} / {frames.length} captures prêtes
        </p>
      </div>
    </div>
  );
}
