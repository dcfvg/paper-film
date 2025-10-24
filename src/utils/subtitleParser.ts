import type { SubtitleEntry } from '../types';

/**
 * Convertit un timestamp SRT (HH:MM:SS,mmm) en secondes
 */
function parseTimestamp(timestamp: string): number {
  const regex = /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;
  const match = timestamp.match(regex);
  
  if (!match) {
    throw new Error(`Invalid timestamp format: ${timestamp}`);
  }
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4], 10);
  
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Parse un fichier de sous-titres SRT
 */
export function parseSRT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  
  // Normaliser les retours à la ligne
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Séparer les blocs de sous-titres
  const blocks = normalizedContent.split('\n\n').filter(block => block.trim());
  
  for (const block of blocks) {
    const lines = block.split('\n');
    
    if (lines.length < 3) continue;
    
    const index = parseInt(lines[0].trim(), 10);
    if (isNaN(index)) continue;
    
    const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
    if (!timeMatch) continue;
    
    const startTime = parseTimestamp(timeMatch[1]);
    const endTime = parseTimestamp(timeMatch[2]);
    const text = lines.slice(2).join('\n').trim();
    
    entries.push({
      index,
      startTime,
      endTime,
      text
    });
  }
  
  return entries;
}

/**
 * Parse un fichier de sous-titres VTT (WebVTT)
 */
export function parseVTT(content: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  
  // Enlever l'en-tête WEBVTT
  const normalizedContent = content.replace(/^WEBVTT.*?\n\n/s, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Séparer les blocs de sous-titres
  const blocks = normalizedContent.split('\n\n').filter(block => block.trim());
  
  let index = 1;
  for (const block of blocks) {
    const lines = block.split('\n');
    
    // Trouver la ligne avec les timestamps
    let timeLineIndex = 0;
    if (lines[0].includes('-->')) {
      timeLineIndex = 0;
    } else if (lines.length > 1 && lines[1].includes('-->')) {
      timeLineIndex = 1;
    } else {
      continue;
    }
    
    const timeMatch = lines[timeLineIndex].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
    if (!timeMatch) continue;
    
    const startTime = parseTimestamp(timeMatch[1]);
    const endTime = parseTimestamp(timeMatch[2]);
    const text = lines.slice(timeLineIndex + 1).join('\n').trim();
    
    entries.push({
      index: index++,
      startTime,
      endTime,
      text
    });
  }
  
  return entries;
}

/**
 * Parse un fichier de sous-titres (détecte automatiquement le format)
 */
export async function parseSubtitleFile(file: File): Promise<SubtitleEntry[]> {
  const content = await file.text();
  
  // Détecter le format
  if (content.trim().startsWith('WEBVTT') || file.name.toLowerCase().endsWith('.vtt')) {
    return parseVTT(content);
  } else {
    return parseSRT(content);
  }
}

/**
 * Vérifie si un texte se termine par une ponctuation finale
 */
function endsWithFinalPunctuation(text: string): boolean {
  const trimmed = text.trim();
  return /[.!?;:]$/.test(trimmed);
}

/**
 * Sélectionne un nombre donné de sous-titres espacés uniformément
 * Si le nombre demandé est inférieur au nombre total, fusionne les textes intelligemment
 */
export function selectSubtitles(entries: SubtitleEntry[], count: number): SubtitleEntry[] {
  if (entries.length === 0) return [];
  if (count >= entries.length) return entries;
  
  const selected: SubtitleEntry[] = [];
  const subtitlesPerCapture = Math.ceil(entries.length / count);
  
  for (let i = 0; i < count; i++) {
    const startIdx = i * subtitlesPerCapture;
    const endIdx = Math.min(startIdx + subtitlesPerCapture, entries.length);
    const group = entries.slice(startIdx, endIdx);
    
    if (group.length === 0) continue;
    
    // Fusionner les textes du groupe avec logique intelligente
    const textParts: string[] = [];
    let currentText = '';
    
    for (let j = 0; j < group.length; j++) {
      const sub = group[j];
      const isLast = j === group.length - 1;
      const trimmedText = sub.text.trim();
      
      if (currentText) {
        currentText += ' ' + trimmedText;
      } else {
        currentText = trimmedText;
      }
      
      // Si le texte se termine par une ponctuation finale, on peut couper ici
      if (endsWithFinalPunctuation(currentText)) {
        textParts.push(currentText);
        currentText = '';
      } else if (isLast) {
        // Dernier sous-titre du groupe
        if (i < count - 1) {
          // Pas le dernier groupe -> ajouter ...
          textParts.push(currentText + '…');
        } else {
          textParts.push(currentText);
        }
        currentText = '';
      }
    }
    
    // S'il reste du texte non ajouté
    if (currentText) {
      if (i < count - 1) {
        textParts.push(currentText + '…');
      } else {
        textParts.push(currentText);
      }
    }
    
    const mergedText = textParts.join(' ');
    
    // Utiliser le timestamp du premier sous-titre du groupe
    selected.push({
      index: i + 1,
      startTime: group[0].startTime,
      endTime: group[group.length - 1].endTime,
      text: mergedText
    });
  }
  
  return selected;
}
