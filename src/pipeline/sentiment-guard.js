// 10 негативті хабарлама → Supportive
import { settings } from '../../config/settings.js';
import { trackSentiment } from '../memory/sentiment-tracker.js';
import { logger } from '../utils/logger.js';

export function checkSentiment(телефон, мәтін) {
  try {
    if (!settings.SENTIMENT_GUARD_ENABLED) return { override: false };
    return trackSentiment(телефон, мәтін, settings);
  } catch (қате) {
    logger.error(`Sentiment guard қатесі: ${қате.message}`);
    return { override: false };
  }
}
