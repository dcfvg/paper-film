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
 * Vérifie si un texte contient une citation ouverte non fermée
 */
function hasOpenQuote(text: string): boolean {
  const openQuotes = (text.match(/[«"']/g) || []).length;
  const closeQuotes = (text.match(/[»"']/g) || []).length;
  return openQuotes > closeQuotes;
}

/**
 * Vérifie si un texte est une question
 */
function isQuestion(text: string): boolean {
  return text.trim().endsWith('?');
}

/**
 * Vérifie si un texte est court (moins de 30 caractères)
 */
function isShortPhrase(text: string): boolean {
  return text.trim().length < 30;
}

/**
 * Vérifie si on peut couper à cet endroit
 */
function canCutHere(text: string, nextText: string | undefined): boolean {
  // Ne pas couper si on a une citation ouverte
  if (hasOpenQuote(text)) {
    return false;
  }
  
  // Ne pas couper si c'est une question courte
  if (isQuestion(text) && isShortPhrase(text)) {
    return false;
  }
  
  // Ne pas couper si la phrase suivante est très courte (continuation probable)
  if (nextText && isShortPhrase(nextText)) {
    return false;
  }
  
  // Sinon, on peut couper si c'est une fin de phrase
  return endsWithFinalPunctuation(text);
}

/**
 * Sélectionne un nombre donné de sous-titres espacés uniformément
 * Si le nombre demandé est inférieur au nombre total, fusionne les textes intelligemment
 */
export function selectSubtitles(
  entries: SubtitleEntry[], 
  count: number, 
  smoothPhrases: boolean = true,
  timeOffset: number = 0
): SubtitleEntry[] {
  if (entries.length === 0) return [];
  
  // Appliquer le décalage temporel
  const adjustedEntries = timeOffset !== 0 
    ? entries.map(entry => ({
        ...entry,
        startTime: entry.startTime + timeOffset / 1000,
        endTime: entry.endTime + timeOffset / 1000
      }))
    : entries;
  
  // Si on demande autant ou plus de captures que de sous-titres
  if (count >= adjustedEntries.length) {
    // Si smoothPhrases activé, utiliser la logique intelligente pour répartir harmonieusement
    if (smoothPhrases && count === adjustedEntries.length) {
      // On continue vers la logique smoothPhrases ci-dessous
    } else {
      // Retourner tous les sous-titres tels quels
      return adjustedEntries;
    }
  }
  
  // Mode simple (sans smoothPhrases) : sélection uniforme MAIS fusion des sous-titres
  if (!smoothPhrases) {
    const selected: SubtitleEntry[] = [];
    const subtitlesPerCapture = Math.ceil(adjustedEntries.length / count);
    
    for (let i = 0; i < count; i++) {
      const startIdx = i * subtitlesPerCapture;
      const endIdx = Math.min(startIdx + subtitlesPerCapture, adjustedEntries.length);
      const group = adjustedEntries.slice(startIdx, endIdx);
      
      if (group.length === 0) continue;
      
      // Fusionner tous les textes du groupe
      const mergedText = group.map(s => s.text.trim()).join(' ');
      
      selected.push({
        index: i + 1,
        startTime: group[0].startTime,
        endTime: group[group.length - 1].endTime,
        text: mergedText
      });
    }
    
    return selected;
  }
  
  const selected: SubtitleEntry[] = [];
  const subtitlesPerCapture = Math.ceil(adjustedEntries.length / count);
  let previousWasCut = false;
  
  for (let i = 0; i < count; i++) {
    const startIdx = i * subtitlesPerCapture;
    const endIdx = Math.min(startIdx + subtitlesPerCapture, adjustedEntries.length);
    const group = adjustedEntries.slice(startIdx, endIdx);
    
    if (group.length === 0) continue;
    
    // Fusionner les textes du groupe avec logique intelligente
    const textParts: string[] = [];
    let currentText = '';
    
    for (let j = 0; j < group.length; j++) {
      const sub = group[j];
      const nextSub = group[j + 1];
      const isLast = j === group.length - 1;
      let trimmedText = sub.text.trim();
      
      // Ajouter … au début si la phrase précédente était coupée
      if (j === 0 && previousWasCut) {
        trimmedText = '…' + trimmedText;
      }
      
      if (currentText) {
        currentText += ' ' + trimmedText;
      } else {
        currentText = trimmedText;
      }
      
      // Vérifier si on peut couper ici
      const nextText = nextSub?.text.trim();
      if (canCutHere(currentText, nextText)) {
        textParts.push(currentText);
        currentText = '';
        previousWasCut = false;
      } else if (isLast) {
        // Dernier sous-titre du groupe
        if (i < count - 1) {
          // Pas le dernier groupe -> ajouter ... si pas de ponctuation finale
          if (!endsWithFinalPunctuation(currentText)) {
            textParts.push(currentText + '…');
            previousWasCut = true;
          } else {
            textParts.push(currentText);
            previousWasCut = false;
          }
        } else {
          textParts.push(currentText);
          previousWasCut = false;
        }
        currentText = '';
      }
    }
    
    // S'il reste du texte non ajouté
    if (currentText) {
      if (i < count - 1) {
        if (!endsWithFinalPunctuation(currentText)) {
          textParts.push(currentText + '…');
          previousWasCut = true;
        } else {
          textParts.push(currentText);
          previousWasCut = false;
        }
      } else {
        textParts.push(currentText);
        previousWasCut = false;
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
