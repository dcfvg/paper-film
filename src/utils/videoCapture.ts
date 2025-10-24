/**
 * Capture une frame d'une vidéo à un timestamp donné
 * Retourne une image en haute résolution (adaptée pour l'impression)
 */
export async function captureVideoFrame(
  videoElement: HTMLVideoElement,
  timestamp: number,
  quality: number = 0.95
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Unable to get canvas context'));
      return;
    }
    
    // Fonction pour capturer la frame
    const capture = () => {
      // Utiliser la résolution native de la vidéo
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Dessiner la frame actuelle sur le canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convertir en image haute qualité
      const imageUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(imageUrl);
      
      // Nettoyer
      videoElement.removeEventListener('seeked', capture);
    };
    
    // Gérer les erreurs
    const handleError = (error: Event) => {
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('seeked', capture);
      reject(error);
    };
    
    videoElement.addEventListener('seeked', capture, { once: true });
    videoElement.addEventListener('error', handleError, { once: true });
    
    // Se déplacer au timestamp
    videoElement.currentTime = timestamp;
  });
}

/**
 * Charge une vidéo depuis un fichier
 */
export function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve(video);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Formate un timestamp en secondes en format HH:MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
