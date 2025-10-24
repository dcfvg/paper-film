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
  subtitleFontSize: number; // en pt
  pageFormat: 'A4' | 'letter';
  captureCount?: number; // nombre de captures souhaité
}
