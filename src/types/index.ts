export interface SubtitleEntry {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface CapturedFrame {
  timestamp: number;
  imageUrl: string | null;
  subtitle: string;
  isLoading: boolean;
  error?: string;
}

export interface VideoFile {
  file: File;
  url: string;
}

export interface SubtitleFile {
  file: File;
  entries: SubtitleEntry[];
}

export interface PrintOptions {
  columns: number;
  showTimecodes: boolean;
  subtitleFontSize: number; // en pt
  subtitleFontFamily: string; // police de caractère
  subtitleAlignment: 'left' | 'center' | 'right';
  captureCount?: number; // nombre de captures souhaité
  timeOffset?: number; // décalage en millisecondes
  smoothPhrases?: boolean; // fluidifier les phrases
}
