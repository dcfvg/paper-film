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
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        // Vérifier si c'est une vidéo
        if (
          file.type.startsWith('video/') ||
          ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(extension || '')
        ) {
          onVideoSelect(file);
        }
        // Vérifier si c'est un sous-titre
        else if (['srt', 'vtt'].includes(extension || '')) {
          onSubtitleSelect(file);
        }
      });
    },
    [onVideoSelect, onSubtitleSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const logoSrc = `${import.meta.env.BASE_URL}paper-film-mark.svg`;

  return (
    <div className="dropzone-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
        <input {...getInputProps()} />

        <div className="dropzone-content">
          <div className="dropzone-hero">
            <div className="dropzone-brand">
              <img src={logoSrc} className="app-logo large" alt="Paper Film mark" />
              <h1 className="dropzone-title">Paper Film</h1>
              <p className="dropzone-tagline">
                Create printable contact sheets from video + subtitles.
              </p>
              <p className="dropzone-description"></p>
            </div>

            <div className="dropzone-callout">
              <svg className="dropzone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {isDragActive ? (
                <p className="dropzone-text">Drop your files right here…</p>
              ) : (
                <>
                  <p className="dropzone-text">
                    Drag your <strong>video</strong> + <strong>subtitle</strong> files, or tap
                    anywhere to browse.
                  </p>
                  <p className="dropzone-subtext">
                    Nothing leaves your computer — no uploads, no servers, just your session.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="file-status">
            {videoFile && (
              <div className="file-badge file-badge-success">✓ Video: {videoFile.name}</div>
            )}
            {subtitleFile && (
              <div className="file-badge file-badge-success">✓ Subtitles: {subtitleFile.name}</div>
            )}
          </div>

          <div className="dropzone-info">
            <div className="info-section">
              <h3>Accepted video formats</h3>
              <p>MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V</p>
            </div>
            <div className="info-section">
              <h3>Subtitle formats</h3>
              <p>SRT, VTT (WebVTT)</p>
            </div>
            <div className="info-section">
              <h3>How it works</h3>
              <p>
                Paper Film captures frames exactly where your subtitles land and arranges them into
                a tactile contact sheet for print or export.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
