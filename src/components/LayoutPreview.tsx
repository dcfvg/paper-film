import type { PrintOptions } from '../types';
import './LayoutPreview.css';

interface LayoutPreviewProps {
  printOptions: PrintOptions;
  totalFrames: number;
}

export default function LayoutPreview({ printOptions, totalFrames }: LayoutPreviewProps) {
  const framesPerPage = printOptions.columns * printOptions.columns;
  const totalPages = Math.ceil(totalFrames / framesPerPage);
  
  // Limiter à 3 pages pour l'aperçu
  const pagesToShow = Math.min(totalPages, 3);
  
  return (
    <div className="layout-preview">
      <div className="layout-preview-header">
        <h3>📋 Aperçu de la mise en page</h3>
        <div className="layout-stats">
          <span className="stat">
            <strong>{totalFrames}</strong> captures
          </span>
          <span className="stat-separator">•</span>
          <span className="stat">
            <strong>{framesPerPage}</strong> par page
          </span>
          <span className="stat-separator">•</span>
          <span className="stat">
            <strong>{totalPages}</strong> page{totalPages > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div className="layout-preview-pages">
        {Array.from({ length: pagesToShow }).map((_, pageIndex) => {
          const startFrame = pageIndex * framesPerPage;
          const endFrame = Math.min(startFrame + framesPerPage, totalFrames);
          const framesInPage = endFrame - startFrame;
          
          return (
            <div
              key={pageIndex}
              className={`preview-page ${printOptions.orientation} ${printOptions.pageFormat}`}
            >
              <div className="preview-page-label">
                Page {pageIndex + 1}
              </div>
              <div 
                className={`preview-grid cols-${printOptions.columns}`}
              >
                {Array.from({ length: framesInPage }).map((_, frameIndex) => (
                  <div key={frameIndex} className="preview-frame">
                    <div className="preview-image">
                      <div className="preview-image-placeholder">
                        🎬
                      </div>
                    </div>
                    <div className="preview-text">
                      {printOptions.showTimecodes && (
                        <div className="preview-timecode">00:00:00</div>
                      )}
                      <div 
                        className="preview-subtitle"
                        style={{ fontSize: `${printOptions.subtitleFontSize * 0.5}pt` }}
                      >
                        Texte du sous-titre...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {totalPages > 3 && (
          <div className="preview-more">
            + {totalPages - 3} page{totalPages - 3 > 1 ? 's' : ''} supplémentaire{totalPages - 3 > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
