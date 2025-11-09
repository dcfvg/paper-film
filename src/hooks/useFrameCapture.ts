import { useState, useCallback, useRef } from 'react';
import type { SubtitleEntry, CapturedFrame } from '../types';
import { captureVideoFrame, loadVideo } from '../utils/videoCapture';

const getCaptureTimestamp = (subtitle: SubtitleEntry): number => {
  const duration = subtitle.endTime - subtitle.startTime;
  const baseTime = subtitle.startTime;

  if (!Number.isFinite(duration) || duration <= 0) {
    return Math.max(0, baseTime);
  }

  const midpoint = baseTime + duration / 2;
  return midpoint < 0 ? 0 : midpoint;
};

interface UseFrameCaptureResult {
  frames: CapturedFrame[];
  isProcessing: boolean;
  progress: number;
  captureFrames: (videoFile: File, subtitles: SubtitleEntry[]) => Promise<void>;
  reset: () => void;
}

export function useFrameCapture(): UseFrameCaptureResult {
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const captureFrames = useCallback(async (videoFile: File, subtitles: SubtitleEntry[]) => {
    // Annuler le processus précédent s'il existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsProcessing(true);
    setProgress(0);
    
    // Initialiser la grille avec des placeholders
    const initialFrames: CapturedFrame[] = subtitles.map(subtitle => ({
      timestamp: getCaptureTimestamp(subtitle),
      imageUrl: null,
      subtitle: subtitle.text.trim(),
      isLoading: true
    }));
    
    setFrames(initialFrames);
    
    try {
      // Charger la vidéo
      const video = await loadVideo(videoFile);
      
      // Capturer les frames séquentiellement pour garantir la bonne position
      for (let index = 0; index < subtitles.length; index++) {
        // Vérifier si le processus a été annulé
        if (abortController.signal.aborted) {
          console.log('[Capture] Process aborted');
          return;
        }

        const subtitle = subtitles[index];
        const captureTimestamp = getCaptureTimestamp(subtitle);
        
        try {
          const imageUrl = await captureVideoFrame(video, captureTimestamp);
          
          // Mettre à jour la frame individuellement
          setFrames(prevFrames => {
            const newFrames = [...prevFrames];
            newFrames[index] = {
              ...newFrames[index],
              imageUrl,
              isLoading: false
            };
            return newFrames;
          });
          
          // Mettre à jour la progression
          setProgress(((index + 1) / subtitles.length) * 100);
        } catch (error) {
          console.error(`Error capturing frame at ${captureTimestamp}:`, error);
          
          setFrames(prevFrames => {
            const newFrames = [...prevFrames];
            newFrames[index] = {
              ...newFrames[index],
              isLoading: false,
              error: 'Erreur de capture'
            };
            return newFrames;
          });
          
          // Continuer malgré l'erreur
          setProgress(((index + 1) / subtitles.length) * 100);
        }
      }
      
      // Note: On ne révoque pas l'URL de la vidéo immédiatement
      // car les images capturées sont des data URLs indépendantes
      // Le navigateur nettoiera automatiquement les blobs non utilisés
      
    } catch (error) {
      console.error('Error processing video:', error);
      if (!abortController.signal.aborted) {
        alert('Erreur lors du traitement de la vidéo');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsProcessing(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  const reset = useCallback(() => {
    // Annuler le processus en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setFrames([]);
    setIsProcessing(false);
    setProgress(0);
  }, []);

  return {
    frames,
    isProcessing,
    progress,
    captureFrames,
    reset
  };
}
