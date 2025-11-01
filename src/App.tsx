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

// Charger les réglages depuis localStorage
const loadSettings = (): Partial<PrintOptions> => {
  try {
    const saved = localStorage.getItem('cineRomanSettings');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Sauvegarder les réglages dans localStorage
const saveSettings = (settings: PrintOptions) => {
  try {
    localStorage.setItem('cineRomanSettings', JSON.stringify(settings));
  } catch {
    // Ignore errors
  }
};

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isParsingSubtitles, setIsParsingSubtitles] = useState(false);
  const [captureCount, setCaptureCount] = useState(30);
  const [timeOffset, setTimeOffset] = useState(0);
  const [smoothPhrases, setSmoothPhrases] = useState(true);

  // Charger les réglages sauvegardés ou utiliser les valeurs par défaut
  const savedSettings = loadSettings();
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    orientation: 'portrait',
    columns: savedSettings.columns ?? 3,
    showTimecodes: savedSettings.showTimecodes ?? false,
    showPagination: savedSettings.showPagination ?? false,
    subtitleFontSize: savedSettings.subtitleFontSize ?? 8,
    pageFormat: savedSettings.pageFormat ?? 'A4'
  });

  // Sauvegarder les réglages quand ils changent
  useEffect(() => {
    saveSettings(printOptions);
  }, [printOptions]);

  const { frames, isProcessing, captureFrames, reset } = useFrameCapture();

  // Debounce timer for auto-generation
  useEffect(() => {
    if (state !== 'result' || !videoFile || subtitles.length === 0) return;

    const timer = setTimeout(() => {
      const selected = selectSubtitles(subtitles, captureCount, false, 0); // smoothPhrases n'affecte que l'affichage, pas la capture
      captureFrames(videoFile, selected);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [captureCount, videoFile, subtitles, state, captureFrames]); // smoothPhrases et timeOffset retirés

  // Effet pour vérifier si on peut passer à la configuration
  useEffect(() => {
    if (
      videoFile &&
      subtitleFile &&
      subtitles.length > 0 &&
      !isParsingSubtitles &&
      state === 'upload'
    ) {
      // Initialiser captureCount au maximum (nombre de sous-titres)
      setCaptureCount(subtitles.length);
      // Remettre le décalage à zéro
      setTimeOffset(0);
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
              isProcessing={isProcessing}
              timeOffset={timeOffset}
              allSubtitles={subtitles}
              smoothPhrases={smoothPhrases}
              captureCount={captureCount}
              videoFileName={videoFile.name}
            />
          }
        />
      )}
    </div>
  );
}

export default App;
