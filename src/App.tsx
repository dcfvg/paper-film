import { useState, useEffect } from 'react';
import FileDropzone from './components/FileDropzone';
import { SplitView } from './components/SplitView';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { parseSubtitleFile, selectSubtitles } from './utils/subtitleParser';
import { useFrameCapture } from './hooks/useFrameCapture';
import type { SubtitleEntry, PrintOptions } from './types';
import './App.css';

type AppState = 'upload' | 'result';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isParsingSubtitles, setIsParsingSubtitles] = useState(false);
  const [captureCount, setCaptureCount] = useState(30);
  const [timeOffset, setTimeOffset] = useState(0);
  const [smoothPhrases, setSmoothPhrases] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.5); // 50% par défaut
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    orientation: 'portrait',
    columns: 3,
    showTimecodes: true,
    subtitleFontSize: 8,
    pageFormat: 'A4',
  });
  
  const { frames, isProcessing, captureFrames, reset } = useFrameCapture();

  // Debounce timer for auto-generation
  useEffect(() => {
    if (state !== 'result' || !videoFile || subtitles.length === 0) return;

    const timer = setTimeout(() => {
      const selected = selectSubtitles(subtitles, captureCount, false, 0); // smoothPhrases n'affecte que l'affichage, pas la capture
      captureFrames(videoFile, selected);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [captureCount, videoFile, subtitles, state]); // smoothPhrases et timeOffset retirés

  // Effet pour vérifier si on peut passer à la configuration
  useEffect(() => {
    if (videoFile && subtitleFile && subtitles.length > 0 && !isParsingSubtitles && state === 'upload') {
      // Initialiser captureCount basé sur le nombre de sous-titres
      setCaptureCount(Math.min(30, subtitles.length));
      setState('result');
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

  const handleCancel = () => {
    setState('upload');
    setVideoFile(null);
    setSubtitleFile(null);
    setSubtitles([]);
    reset();
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

      {state === 'result' && videoFile && (
        <SplitView
          defaultSplit={30}
          minSize={20}
          left={
            <ConfigPanel
              videoFile={videoFile}
              subtitles={subtitles}
              captureCount={captureCount}
              onCaptureCountChange={setCaptureCount}
              timeOffset={timeOffset}
              onTimeOffsetChange={setTimeOffset}
              smoothPhrases={smoothPhrases}
              onSmoothPhrasesChange={setSmoothPhrases}
              printOptions={printOptions}
              onPrintOptionsChange={setPrintOptions}
              onBack={handleCancel}
            />
          }
          right={
            <PreviewPanel
              frames={frames}
              printOptions={printOptions}
              scale={previewScale}
              onScaleChange={setPreviewScale}
              isProcessing={isProcessing}
              timeOffset={timeOffset}
              allSubtitles={subtitles}
              smoothPhrases={smoothPhrases}
              captureCount={captureCount}
            />
          }
        />
      )}
    </div>
  );
}

export default App;
