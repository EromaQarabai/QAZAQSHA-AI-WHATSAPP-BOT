// 10 негативті хабарлама тексеруі
import { getDb } from './database.js';
import { logger } from '../utils/logger.js';

const жад = new Map(); // телефон → { санауыш, соңғыУақыт }

export function trackSentiment(телефон, мазмұн, баптаулар) {
  try {
    const негативті = [...баптаулар.SENTIMENT_GUARD_KEYWORDS_KK, ...баптаулар.SENTIMENT_GUARD_KEYWORDS_RU, ...баптаулар.SENTIMENT_GUARD_KEYWORDS_EN];
    const төмен = мазмұн.toLowerCase();
    const табылды = негативті.some((сөз) => төмен.includes(сөз.toLowerCase()));

    if (!жад.has(телефон)) {
      жад.set(телефон, { санауыш: 0, соңғыУақыт: Date.now() });
    }
    const жазба = жад.get(телефон);

    if (табылды) {
      жазба.санауыш += 1;
      logger.warn(`Негатив анықталды: ${телефон} (${жазба.санауыш}/${баптаулар.SENTIMENT_GUARD_THRESHOLD})`);
    } else {
      // 24 сағаттан кейін санауышты азайту
      if (Date.now() - жазба.соңғыУақыт > 86400000) {
        жазба.санауыш = Math.max(0, жазба.санауыш - 1);
      }
    }

    жазба.соңғыУақыт = Date.now();

    if (жазба.санауыш >= баптаулар.SENTIMENT_GUARD_THRESHOLD) {
      logger.info(`Supportive режиміне ауыстыру: ${телефон}`);
      return { override: true, mood: баптаулар.SENTIMENT_GUARD_OVERRIDE_MOOD };
    }

    return { override: false };
  } catch (қате) {
    logger.error(`Сентимент қатесі: ${қате.message}`);
    // Қорғаныс жолы: ешқандай өзгеріссіз
    return { override: false };
  }
}

export function resetSentiment(телефон) {
  жад.delete(телефон);
}
