import { useState, useCallback } from 'react';
import type { SubtitleEntry, CapturedFrame } from '../types';
import { captureVideoFrame, loadVideo } from '../utils/videoCapture';

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

  const captureFrames = useCallback(async (videoFile: File, subtitles: SubtitleEntry[]) => {
    setIsProcessing(true);
    setProgress(0);
    
    // Initialiser la grille avec des placeholders
    const initialFrames: CapturedFrame[] = subtitles.map(subtitle => ({
      timestamp: subtitle.startTime,
      imageUrl: null,
      subtitle: subtitle.text,
      isLoading: true
    }));
    
    setFrames(initialFrames);
    
    try {
      // Charger la vidéo
      const video = await loadVideo(videoFile);
      
      // Capturer les frames séquentiellement pour garantir la bonne position
      for (let index = 0; index < subtitles.length; index++) {
        const subtitle = subtitles[index];
        
        try {
          const imageUrl = await captureVideoFrame(video, subtitle.startTime);
          
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
          console.error(`Error capturing frame at ${subtitle.startTime}:`, error);
          
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
      alert('Erreur lors du traitement de la vidéo');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
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
