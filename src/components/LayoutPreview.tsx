import { useState, useEffect, useRef } from 'react';
import type { PrintOptions, SubtitleEntry } from '../types';
import { selectSubtitles } from '../utils/subtitleParser';
import './LayoutPreview.css';

interface LayoutPreviewProps {
  printOptions: PrintOptions;
  totalFrames: number;
  videoFile: File | null;
  subtitles: SubtitleEntry[];
  captureCount: number;
  timeOffset: number;
  smoothPhrases: boolean;
}

interface PreviewFrame {
  index: number;
  imageUrl: string | null;
  status: 'queued' | 'loading' | 'loaded' | 'error';
  subtitle: string;
  timestamp: number;
}

export default function LayoutPreview({ 
  printOptions, 
  totalFrames,
  videoFile,
  subtitles,
  captureCount,
  timeOffset,
  smoothPhrases
}: LayoutPreviewProps) {
  const [previewFrames, setPreviewFrames] = useState<PreviewFrame[]>([]);
  const [renderQueue, setRenderQueue] = useState<number[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Créer les frames de preview quand captureCount change
  useEffect(() => {
    // Annuler le rendu en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Sélectionner les sous-titres selon les paramètres
    const selected = selectSubtitles(subtitles, captureCount, smoothPhrases, timeOffset);
    
    // Créer les frames en status 'queued'
    const frames: PreviewFrame[] = selected.map((sub, index) => ({
      index,
      imageUrl: null,
      status: 'queued',
      subtitle: sub.text,
      timestamp: sub.startTime
    }));
    
    setPreviewFrames(frames);
    setRenderQueue(frames.map((_, i) => i));
    setIsRendering(false);
  }, [captureCount, timeOffset, smoothPhrases, subtitles]);

  // Rendu progressif des frames
  useEffect(() => {
    if (!videoFile || renderQueue.length === 0 || isRendering) return;

    const renderNextFrame = async () => {
      setIsRendering(true);
      const frameIndex = renderQueue[0];
      const frame = previewFrames[frameIndex];
      
      if (!frame) {
        setIsRendering(false);
        return;
      }

      // Marquer comme loading
      setPreviewFrames(prev => 
        prev.map(f => f.index === frameIndex ? { ...f, status: 'loading' as const } : f)
      );

      try {
        // Créer un AbortController pour ce rendu
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Charger la vidéo si nécessaire
        if (!videoRef.current) {
          const video = document.createElement('video');
          video.src = URL.createObjectURL(videoFile);
          video.muted = true;
          await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = reject;
            if (controller.signal.aborted) reject(new Error('Aborted'));
          });
          videoRef.current = video;
        }

        const video = videoRef.current;

        // Chercher le timestamp
        video.currentTime = frame.timestamp;
        await new Promise((resolve, reject) => {
          video.onseeked = resolve;
          video.onerror = reject;
          if (controller.signal.aborted) reject(new Error('Aborted'));
          setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        if (controller.signal.aborted) {
          throw new Error('Aborted');
        }

        // Capturer l'image (très petite pour preview)
        const canvas = document.createElement('canvas');
        const targetWidth = 200; // Petite taille pour preview
        const aspectRatio = video.videoHeight / video.videoWidth;
        canvas.width = targetWidth;
        canvas.height = Math.floor(targetWidth * aspectRatio);
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Mettre à jour avec l'image
          setPreviewFrames(prev => 
            prev.map(f => f.index === frameIndex 
              ? { ...f, imageUrl, status: 'loaded' as const }
              : f
            )
          );
        }
      } catch (error) {
        if ((error as Error).message !== 'Aborted') {
          console.error('Error rendering preview:', error);
          setPreviewFrames(prev => 
            prev.map(f => f.index === frameIndex 
              ? { ...f, status: 'error' as const }
              : f
            )
          );
        }
      } finally {
        // Retirer de la queue et continuer
        setRenderQueue(prev => prev.slice(1));
        setIsRendering(false);
      }
    };

    renderNextFrame();
  }, [renderQueue, isRendering, videoFile, previewFrames]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (videoRef.current) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, []);
  const framesPerPage = printOptions.columns * printOptions.columns;
  const totalPages = Math.ceil((previewFrames.length || totalFrames) / framesPerPage);
  const pagesToShow = Math.min(totalPages, 3);
  
  // Calculer le nombre de frames en cours de rendu
  const queuedCount = previewFrames.filter(f => f.status === 'queued').length;
  const loadingCount = previewFrames.filter(f => f.status === 'loading').length;
  const loadedCount = previewFrames.filter(f => f.status === 'loaded').length;
  
  return (
    <div className="layout-preview">
      <div className="layout-preview-header-row">
        <h3>📋 Aperçu de la mise en page</h3>
        <div className="layout-stats">
          <div className="stat-item">
            <span className="stat-label">Captures:</span>
            <strong className="stat-value">{previewFrames.length || totalFrames}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Par page:</span>
            <strong className="stat-value">{framesPerPage}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pages:</span>
            <strong className="stat-value">{totalPages}</strong>
          </div>
          {timeOffset !== 0 && (
            <div className="stat-item">
              <span className="stat-label">Décalage:</span>
              <strong className="stat-value">{timeOffset > 0 ? '+' : ''}{timeOffset}ms</strong>
            </div>
          )}
          {!smoothPhrases && (
            <div className="stat-item">
              <span className="stat-label">Mode:</span>
              <strong className="stat-value">Simple</strong>
            </div>
          )}
          {previewFrames.length > 0 && (
            <div className="stat-item">
              <span className="stat-label">Rendues:</span>
              <strong className="stat-value">{loadedCount}/{previewFrames.length}</strong>
            </div>
          )}
        </div>
      </div>
      
      {previewFrames.length > 0 && (
        <div className="render-progress">
          <div className="render-progress-bar">
            <div 
              className="render-progress-fill" 
              style={{ width: `${(loadedCount / previewFrames.length) * 100}%` }}
            />
          </div>
          <div className="render-status">
            {queuedCount > 0 && <span className="render-queued">⏳ {queuedCount} en attente</span>}
            {loadingCount > 0 && <span className="render-loading">⚙️ {loadingCount} en cours</span>}
            {loadedCount === previewFrames.length && <span className="render-complete">✅ Rendu terminé</span>}
          </div>
        </div>
      )}
      
      <div className="layout-preview-pages">
        {Array.from({ length: pagesToShow }).map((_, pageIndex) => {
          const startFrame = pageIndex * framesPerPage;
          const endFrame = Math.min(startFrame + framesPerPage, previewFrames.length || totalFrames);
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
                {Array.from({ length: framesInPage }).map((_, frameIndex) => {
                  const globalIndex = startFrame + frameIndex;
                  const frame = previewFrames[globalIndex];
                  
                  return (
                    <div key={frameIndex} className="preview-frame">
                      <div className="preview-image">
                        {frame ? (
                          <>
                            {frame.status === 'queued' && (
                              <div className="preview-loader queued">
                                <div className="loader-icon">⏳</div>
                              </div>
                            )}
                            {frame.status === 'loading' && (
                              <div className="preview-loader loading">
                                <div className="loader-spinner"></div>
                              </div>
                            )}
                            {frame.status === 'loaded' && frame.imageUrl && (
                              <img 
                                src={frame.imageUrl} 
                                alt="Preview" 
                                className="preview-image-rendered"
                              />
                            )}
                            {frame.status === 'error' && (
                              <div className="preview-loader error">
                                <div className="loader-icon">❌</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="preview-image-placeholder">
                            🎬
                          </div>
                        )}
                      </div>
                      <div className="preview-text">
                        {printOptions.showTimecodes && frame && (
                          <div className="preview-timecode">
                            {Math.floor(frame.timestamp / 60)}:{String(Math.floor(frame.timestamp % 60)).padStart(2, '0')}
                          </div>
                        )}
                        <div 
                          className="preview-subtitle"
                          style={{ fontSize: `${printOptions.subtitleFontSize * 0.5}pt` }}
                        >
                          {frame ? frame.subtitle : 'Texte du sous-titre...'}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
