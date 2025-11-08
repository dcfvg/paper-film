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
  const blocks = normalizedContent.split('\n\n').filter((block) => block.trim());

  for (const block of blocks) {
    const lines = block.split('\n');

    if (lines.length < 3) continue;

    const index = parseInt(lines[0].trim(), 10);
    if (isNaN(index)) continue;

    const timeMatch = lines[1].match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );
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
  const normalizedContent = content
    .replace(/^WEBVTT.*?\n\n/s, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Séparer les blocs de sous-titres
  const blocks = normalizedContent.split('\n\n').filter((block) => block.trim());

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

    const timeMatch = lines[timeLineIndex].match(
      /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
    );
    if (!timeMatch) continue;

    const startTime = parseTimestamp(timeMatch[1]);
    const endTime = parseTimestamp(timeMatch[2]);
    const text = lines
      .slice(timeLineIndex + 1)
      .join('\n')
      .trim();

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
  return /[.!?;:…]$/.test(trimmed);
}

/**
 * Vérifie si un texte contient une citation ouverte non fermée
 */
function hasOpenQuote(text: string): boolean {
  // Compter tous les types de guillemets d'ouverture et de fermeture
  const openingQuotes = (text.match(/[«""']/g) || []).length;
  const closingQuotes = (text.match(/[»""']/g) || []).length;

  // Vérifier aussi les guillemets simples/doubles standard
  const standardQuotes = (text.match(/["']/g) || []).length;

  // Si nombre impair de guillemets standard, citation ouverte
  if (standardQuotes % 2 !== 0) {
    return true;
  }

  // Si plus de guillemets ouvrants que fermants
  return openingQuotes > closingQuotes;
}

/**
 * Vérifie si le prochain sous-titre semble continuer la narration
 * (commence par minuscule, par "et", "ou", "mais", etc.)
 */
function isContinuation(nextSubtitleText: string): boolean {
  if (!nextSubtitleText) return false;

  const trimmed = nextSubtitleText.trim();
  if (!trimmed) return false;

  // Commence par une minuscule
  if (trimmed[0] === trimmed[0].toLowerCase() && trimmed[0] !== trimmed[0].toUpperCase()) {
    return true;
  }

  // Commence par des conjonctions de coordination
  const continuationWords = [
    'et ',
    'ou ',
    'mais ',
    'donc ',
    'or ',
    'ni ',
    'car ',
    'puis ',
    'ensuite ',
    'alors ',
    'ainsi ',
    'pourtant ',
    'cependant ',
    'néanmoins ',
    'toutefois '
  ];

  const lowerTrimmed = trimmed.toLowerCase();
  return continuationWords.some((word) => lowerTrimmed.startsWith(word));
}

function startsNewSentence(text: string): boolean {
  if (!text) return false;

  const trimmed = text.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('…')) {
    return false;
  }

  if (trimmed.startsWith('-')) {
    const afterDash = trimmed.slice(1).trim();
    if (!afterDash) return false;
    const firstCharAfterDash = afterDash[0];
    const isLetter = firstCharAfterDash.toLowerCase() !== firstCharAfterDash.toUpperCase();
    return isLetter ? firstCharAfterDash === firstCharAfterDash.toUpperCase() : true;
  }

  const firstChar = trimmed[0];
  if (/^[«“"(\[]/.test(firstChar)) {
    return true;
  }

  const isLetter = firstChar.toLowerCase() !== firstChar.toUpperCase();
  if (isLetter) {
    return firstChar === firstChar.toUpperCase();
  }

  return true;
}

function isSentenceBoundary(previousText: string, nextSubtitleText?: string): boolean {
  if (!nextSubtitleText) return true;

  const trimmedPrev = previousText.trim();
  const trimmedNext = nextSubtitleText.trim();

  if (!trimmedPrev || !trimmedNext) {
    return true;
  }

  if (trimmedPrev.endsWith('…')) {
    return false;
  }

  if (!endsWithFinalPunctuation(trimmedPrev)) {
    return false;
  }

  if (hasOpenQuote(trimmedPrev)) {
    return false;
  }

  if (isContinuation(trimmedNext)) {
    return false;
  }

  return startsNewSentence(trimmedNext);
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

  // Appliquer le décalage temporel (en secondes)
  const adjustedEntries =
    timeOffset !== 0
      ? entries.map((entry) => {
          const shiftedStart = entry.startTime + timeOffset;
          const shiftedEnd = entry.endTime + timeOffset;
          const startTime = Math.max(0, shiftedStart);
          const endTime = Math.max(startTime, shiftedEnd);
          return {
            ...entry,
            startTime,
            endTime
          };
        })
      : entries;

  // Si on demande autant ou plus de captures que de sous-titres
  if (count >= adjustedEntries.length) {
    return adjustedEntries;
  }

  // Mode sans smoothPhrases : fusion basique des sous-titres
  if (!smoothPhrases) {
    const selected: SubtitleEntry[] = [];
    const itemsPerGroup = Math.ceil(adjustedEntries.length / count);

    for (let i = 0; i < count; i++) {
      const startIdx = i * itemsPerGroup;
      const endIdx = Math.min(startIdx + itemsPerGroup, adjustedEntries.length);
      const group = adjustedEntries.slice(startIdx, endIdx);

      if (group.length === 0) continue;

      // Fusionner tous les sous-titres du groupe simplement
      const mergedText = group.map((s) => s.text.trim()).join(' ');

      selected.push({
        index: i + 1,
        startTime: group[0].startTime,
        endTime: group[group.length - 1].endTime,
        text: mergedText
      });
    }

    return selected;
  }

  // Mode smoothPhrases : distribuer TOUT le texte en évitant de couper phrases/citations
  const selected: SubtitleEntry[] = [];
  let currentIndex = 0;
  let shouldPrependEllipsis = false;

  const totalChars = adjustedEntries.reduce((sum, entry) => sum + entry.text.trim().length, 0);
  const safeTotalChars = totalChars > 0 ? totalChars : adjustedEntries.length;
  let consumedChars = 0;

  for (let groupNum = 0; groupNum < count; groupNum++) {
    if (currentIndex >= adjustedEntries.length) {
      break;
    }

    const isLastGroup = groupNum === count - 1;
    const groupsLeft = count - groupNum;
    const remainingChars = Math.max(safeTotalChars - consumedChars, 0);
    const targetCharsForGroup = isLastGroup
      ? remainingChars
      : Math.max(1, remainingChars / groupsLeft);

    const groupParts: string[] = [];
    const startTime = adjustedEntries[currentIndex].startTime;
    let endTime = adjustedEntries[currentIndex].endTime;
    let endIndex = currentIndex;
    let groupChars = 0;

    while (endIndex < adjustedEntries.length) {
      const sub = adjustedEntries[endIndex];
      const cleanText = sub.text.trim();
      groupParts.push(cleanText);
      groupChars += Math.max(cleanText.length, 1);
      endTime = sub.endTime;
      endIndex++;

      if (isLastGroup) {
        if (endIndex >= adjustedEntries.length) {
          break;
        }
        continue;
      }

      const entriesRemaining = adjustedEntries.length - endIndex;
      const groupsRemaining = count - groupNum - 1;

      if (entriesRemaining <= groupsRemaining) {
        break;
      }

      const currentGroupText = groupParts.join(' ').trim();
      const nextEntry = adjustedEntries[endIndex];
      const boundaryAfterThis = nextEntry
        ? isSentenceBoundary(currentGroupText, nextEntry.text)
        : true;

      const hasReachedTarget = groupChars >= targetCharsForGroup;
      const significantlyOverTarget = groupChars >= targetCharsForGroup * 1.2;

      if (boundaryAfterThis && hasReachedTarget) {
        break;
      }

      if (!boundaryAfterThis && significantlyOverTarget) {
        break;
      }
    }

    consumedChars += groupChars;

    const rawGroupText = groupParts.join(' ').trim();
    const nextEntry = adjustedEntries[endIndex];
    const textWasCut =
      !isLastGroup && Boolean(nextEntry) && !isSentenceBoundary(rawGroupText, nextEntry?.text);

    let groupText = rawGroupText;

    if (shouldPrependEllipsis && groupText) {
      groupText = `… ${groupText}`;
    }

    if (textWasCut && groupText) {
      groupText = `${groupText.trimEnd()}…`;
    }

    selected.push({
      index: groupNum + 1,
      startTime,
      endTime,
      text: groupText
    });

    currentIndex = endIndex;
    shouldPrependEllipsis = textWasCut;
  }

  // Si il reste des sous-titres non distribués, les ajouter au dernier groupe
  if (currentIndex < adjustedEntries.length && selected.length > 0) {
    const lastGroup = selected[selected.length - 1];
    const remainingSubs = adjustedEntries.slice(currentIndex);
    const remainingText = remainingSubs.map((s) => s.text.trim()).join(' ');

    if (lastGroup.text.endsWith('…')) {
      lastGroup.text = lastGroup.text.slice(0, -1).trim();
    }

    lastGroup.text = `${lastGroup.text} ${remainingText}`.trim();
    lastGroup.endTime = remainingSubs[remainingSubs.length - 1].endTime;
    shouldPrependEllipsis = false;
  }

  return selected;
}
