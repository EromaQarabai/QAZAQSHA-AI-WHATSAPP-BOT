// Қайталанған жауаптарды болдырмау
import { logger } from '../utils/logger.js';

const кэш = [];

export function isDuplicate(жаңаЖауап, шектеу) {
  try {
    if (!жаңаЖауап) return false;
    const табылған = кэш.find((э) => calculateSimilarity(э, жаңаЖауап) > шектеу);
    return !!табылған;
  } catch (қате) {
    logger.error(`Қайталау тексеру қатесі: ${қате.message}`);
    return false;
  }
}

export function addToCache(жауап, өлшем) {
  try {
    кэш.unshift(жауап);
    while (кэш.length > өлшем) кэш.pop();
  } catch (қате) {
    logger.error(`Кэш қатесі: ${қате.message}`);
  }
}

function calculateSimilarity(а, б) {
  try {
    if (!а || !б) return 0;
    const ұзын = Math.max(а.length, б.length);
    if (ұзын === 0) return 1;
    const қашықтық = levenshteinDistance(а, б);
    return 1 - қашықтық / ұзын;
  } catch (қате) {
    return 0;
  }
}

function levenshteinDistance(а, б) {
  try {
    const матрица = Array(б.length + 1).fill(null).map(() => Array(а.length + 1).fill(null));
    for (let i = 0; i <= а.length; i++) матрица[0][i] = i;
    for (let j = 0; j <= б.length; j++) матрица[j][0] = j;
    for (let j = 1; j <= б.length; j++) {
      for (let i = 1; i <= а.length; i++) {
        const индикатор = а[i - 1] === б[j - 1] ? 0 : 1;
        матрица[j][i] = Math.min(
          матрица[j][i - 1] + 1,
          матрица[j - 1][i] + 1,
          матрица[j - 1][i - 1] + индикатор
        );
      }
    }
    return матрица[б.length][а.length];
  } catch (қате) {
    return Math.max(а?.length || 0, б?.length || 0);
  }
}
