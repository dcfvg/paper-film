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
  orientation: 'portrait' | 'landscape';
  columns: number;
  showTimecodes: boolean;
  showPagination: boolean;
  subtitleFontSize: number; // en pt
  pageFormat: 'A3' | 'A4' | 'A5' | 'letter' | 'legal' | 'tabloid';
  captureCount?: number; // nombre de captures souhaité
  timeOffset?: number; // décalage en millisecondes
  smoothPhrases?: boolean; // fluidifier les phrases
}
