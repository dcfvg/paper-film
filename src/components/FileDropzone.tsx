import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileDropzone.css';

interface FileDropzoneProps {
  onVideoSelect: (file: File) => void;
  onSubtitleSelect: (file: File) => void;
  videoFile: File | null;
  subtitleFile: File | null;
}

export default function FileDropzone({
  onVideoSelect,
  onSubtitleSelect,
  videoFile,
  subtitleFile
}: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      // Vérifier si c'est une vidéo
      if (file.type.startsWith('video/') || 
          ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(extension || '')) {
        onVideoSelect(file);
      }
      // Vérifier si c'est un sous-titre
      else if (['srt', 'vtt'].includes(extension || '')) {
        onSubtitleSelect(file);
      }
    });
  }, [onVideoSelect, onSubtitleSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  return (
    <div className="dropzone-container">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="dropzone-content">
          <svg 
            className="dropzone-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <h1 className="dropzone-title">Ciné-Roman</h1>
          
          {isDragActive ? (
            <p className="dropzone-text">Déposez les fichiers ici...</p>
          ) : (
            <>
              <p className="dropzone-text">
                Glissez-déposez votre <strong>vidéo</strong> et votre fichier de <strong>sous-titres</strong>
              </p>
              <p className="dropzone-subtext">
                ou cliquez pour sélectionner les fichiers
              </p>
            </>
          )}
          
          <div className="file-status">
            {videoFile && (
              <div className="file-badge file-badge-success">
                ✓ Vidéo: {videoFile.name}
              </div>
            )}
            {subtitleFile && (
              <div className="file-badge file-badge-success">
                ✓ Sous-titres: {subtitleFile.name}
              </div>
            )}
          </div>
          
          <div className="dropzone-info">
            <div className="info-section">
              <h3>Formats vidéo acceptés</h3>
              <p>MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V</p>
            </div>
            <div className="info-section">
              <h3>Formats de sous-titres</h3>
              <p>SRT, VTT (WebVTT)</p>
            </div>
            <div className="info-section">
              <h3>Fonctionnement</h3>
              <p>
                Les captures d'écran sont prises aux moments indiqués par les sous-titres.
                La planche générée est optimisée pour l'impression.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
