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
