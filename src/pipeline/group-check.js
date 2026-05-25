// Группа + /erom тексеру
import { settings } from '../../config/settings.js';
import { logger } from '../utils/logger.js';

export function shouldRespondInGroup(мәтін) {
  try {
    if (!settings.GROUP_DEFAULT_SILENT) return true;

    const триггер = settings.GROUP_TRIGGER_WORD;
    const төмен = мәтін?.toLowerCase()?.trim() || '';

    if (settings.GROUP_TRIGGER_CASE_SENSITIVE) {
      return мәтін?.trim()?.startsWith(триггер);
    }

    return төмен.startsWith(триггер.toLowerCase());
  } catch (қате) {
    logger.error(`Группа тексеру қатесі: ${қате.message}`);
    // Қорғаныс жолы: үнсіздік
    return false;
  }
}

export function stripTrigger(мәтін) {
  try {
    const триггер = settings.GROUP_TRIGGER_WORD;
    let нәтиже = мәтін;
    if (мәтін.toLowerCase().startsWith(триггер.toLowerCase())) {
      нәтиже = мәтін.slice(триггер.length).trim();
    }
    return нәтиже;
  } catch (қате) {
    return мәтін;
  }
}
