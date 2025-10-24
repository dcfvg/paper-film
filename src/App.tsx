import { useState, useEffect } from 'react';
import FileDropzone from './components/FileDropzone';
import ProcessingControls from './components/ProcessingControls';
import ContactSheet from './components/ContactSheet';
import { parseSubtitleFile } from './utils/subtitleParser';
import { useFrameCapture } from './hooks/useFrameCapture';
import type { SubtitleEntry } from './types';
import './App.css';

type AppState = 'upload' | 'configure' | 'processing' | 'result';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isParsingSubtitles, setIsParsingSubtitles] = useState(false);
  
  const { frames, isProcessing, progress, captureFrames, reset } = useFrameCapture();

  // Effet pour vérifier si on peut passer à la configuration
  useEffect(() => {
    if (videoFile && subtitleFile && subtitles.length > 0 && !isParsingSubtitles && state === 'upload') {
      setState('configure');
    }
  }, [videoFile, subtitleFile, subtitles, isParsingSubtitles, state]);

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
  };

  const handleSubtitleSelect = async (file: File) => {
    setSubtitleFile(file);
    setIsParsingSubtitles(true);
    
    try {
      const parsedSubtitles = await parseSubtitleFile(file);
      setSubtitles(parsedSubtitles);
    } catch (error) {
      console.error('Error parsing subtitles:', error);
      alert('Erreur lors de la lecture du fichier de sous-titres');
      setSubtitleFile(null);
    } finally {
      setIsParsingSubtitles(false);
    }
  };

  const handleStartProcessing = async (selectedSubtitles: SubtitleEntry[]) => {
    if (!videoFile) return;
    
    setState('processing');
    await captureFrames(videoFile, selectedSubtitles);
    setState('result');
  };

  const handleCancel = () => {
    setState('upload');
    setVideoFile(null);
    setSubtitleFile(null);
    setSubtitles([]);
    reset();
  };

  const handleBack = () => {
    setState('configure');
  };

  return (
    <div className="app">
      {state === 'upload' && (
        <FileDropzone
          onVideoSelect={handleVideoSelect}
          onSubtitleSelect={handleSubtitleSelect}
          videoFile={videoFile}
          subtitleFile={subtitleFile}
        />
      )}

      {(state === 'configure' || state === 'processing') && (
        <ProcessingControls
          subtitles={subtitles}
          onStart={handleStartProcessing}
          onCancel={handleCancel}
          isProcessing={isProcessing}
          progress={progress}
        />
      )}

      {state === 'result' && (
        <ContactSheet
          frames={frames}
          onBack={handleBack}
          videoFileName={videoFile?.name}
        />
      )}
    </div>
  );
}

export default App;
