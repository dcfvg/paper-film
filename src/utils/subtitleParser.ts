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
  return /[.!?;:]$/.test(trimmed);
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
  const adjustedEntries =
    timeOffset !== 0
      ? entries.map((entry) => ({
          ...entry,
          startTime: entry.startTime + timeOffset / 1000,
          endTime: entry.endTime + timeOffset / 1000
        }))
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
  const itemsPerGroup = adjustedEntries.length / count;
  let currentIndex = 0;

  for (let groupNum = 0; groupNum < count; groupNum++) {
    const targetEndIndex = Math.floor((groupNum + 1) * itemsPerGroup);
    const isLastGroup = groupNum === count - 1;

    // Pour le dernier groupe, prendre tout ce qui reste
    const maxEndIndex = isLastGroup ? adjustedEntries.length : targetEndIndex;

    if (currentIndex >= adjustedEntries.length) break;

    // Collecter les sous-titres pour ce groupe
    let groupText = '';
    const startTime = adjustedEntries[currentIndex].startTime;
    let endTime = adjustedEntries[currentIndex].endTime;
    let endIndex = currentIndex;
    let textWasCut = false;

    // TOUJOURS prendre au moins un sous-titre pour éviter les groupes vides
    const minEndIndex = currentIndex + 1;

    // Ajouter les sous-titres jusqu'à la cible
    while (endIndex < maxEndIndex && endIndex < adjustedEntries.length) {
      const sub = adjustedEntries[endIndex];
      groupText += (groupText ? ' ' : '') + sub.text.trim();
      endTime = sub.endTime;
      endIndex++;

      // Si on a atteint la cible (et pris au moins un sous-titre), vérifier si on peut couper
      if (endIndex >= targetEndIndex && endIndex >= minEndIndex && !isLastGroup) {
        const hasOpenCitation = hasOpenQuote(groupText);
        const endsWithPunctuation = endsWithFinalPunctuation(groupText);
        const remainingEntries = adjustedEntries.slice(endIndex);
        const remainingText = remainingEntries.map((s) => s.text).join(' ');
        const isRemainingShort = remainingText.trim().length < 50;

        // Vérifier si le prochain sous-titre est une continuation
        const nextIsContinuation =
          endIndex < adjustedEntries.length && isContinuation(adjustedEntries[endIndex].text);

        // Continuer si : citation ouverte, pas de ponctuation, reste trop court, OU le prochain continue
        if (hasOpenCitation || !endsWithPunctuation || isRemainingShort || nextIsContinuation) {
          // Regarder jusqu'à 3 sous-titres de plus
          const lookAheadLimit = Math.min(endIndex + 3, adjustedEntries.length);
          let shouldContinue = true;

          while (endIndex < lookAheadLimit && shouldContinue) {
            const nextSub = adjustedEntries[endIndex];
            groupText += ' ' + nextSub.text.trim();
            endTime = nextSub.endTime;
            endIndex++;

            // Vérifier si on peut couper maintenant
            const hasOpenCitationNow = hasOpenQuote(groupText);
            const endsWithPunctuationNow = endsWithFinalPunctuation(groupText);
            const nextIsContinuationNow =
              endIndex < adjustedEntries.length && isContinuation(adjustedEntries[endIndex].text);

            // Couper seulement si: pas de citation ouverte, ponctuation finale, ET le prochain ne continue pas
            if (!hasOpenCitationNow && endsWithPunctuationNow && !nextIsContinuationNow) {
              shouldContinue = false;
            }
          }
        }

        // Si on a coupé et qu'il reste du texte, marquer comme coupé
        if (endIndex < adjustedEntries.length) {
          textWasCut = true;
        }
        break;
      }
    }

    // Ajouter des ellipses si le texte a été coupé et qu'il reste du contenu
    if (textWasCut && endIndex < adjustedEntries.length) {
      const remainingText = adjustedEntries
        .slice(endIndex)
        .map((s) => s.text.trim())
        .join(' ');
      // Ajouter des ellipses si :
      // 1. Le texte ne se termine pas par une ponctuation finale, OU
      // 2. Le texte se termine par une ponctuation mais le prochain sous-titre continue la narration
      if (!endsWithFinalPunctuation(groupText)) {
        groupText += '…';
      } else if (
        remainingText.trim().length > 0 &&
        isContinuation(adjustedEntries[endIndex].text)
      ) {
        // Si la phrase suivante continue, ajouter des ellipses même après un point
        groupText += ' …';
      }
    }

    selected.push({
      index: groupNum + 1,
      startTime: startTime,
      endTime: endTime,
      text: groupText
    });

    currentIndex = endIndex;
  }

  // Si il reste des sous-titres non distribués, les ajouter au dernier groupe
  if (currentIndex < adjustedEntries.length && selected.length > 0) {
    const lastGroup = selected[selected.length - 1];
    const remainingSubs = adjustedEntries.slice(currentIndex);
    const remainingText = remainingSubs.map((s) => s.text.trim()).join(' ');

    // Enlever l'ellipse existante si présente
    if (lastGroup.text.endsWith('…')) {
      lastGroup.text = lastGroup.text.slice(0, -1).trim();
    }

    lastGroup.text += ' ' + remainingText;
    lastGroup.endTime = remainingSubs[remainingSubs.length - 1].endTime;
  }

  return selected;
}
