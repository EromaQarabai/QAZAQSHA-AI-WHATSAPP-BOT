// Автоматты хабарламалар (тек қателер/ескертулер)
import { settings } from '../config/settings.js';
import { logger } from '../src/utils/logger.js';

let бот = null;

export function setBot(telegramBot) {
  бот = telegramBot;
}

export function notifyTelegram(хабар, деңгей = 'info') {
  try {
    if (!бот || !settings.TELEGRAM_ENABLED || !settings.TELEGRAM_OWNER_ID) return;

    if (деңгей === 'info' && !settings.TELEGRAM_NOTIFY_INFO) return;
    if (деңгей === 'warn' && !settings.TELEGRAM_NOTIFY_WARNINGS) return;
    if (деңгей === 'error' && !settings.TELEGRAM_NOTIFY_ERRORS) return;

    // ✅ .catch() қосылды → UnhandledPromiseRejection болдырмайды
    бот.sendMessage(settings.TELEGRAM_OWNER_ID, хабар, { parse_mode: 'Markdown' })
      .catch((е) => {
        // Желі үзілісі — тек файлға жазамыз
        logger.warn(`Telegram жіберу сәтсіз: ${е.message?.slice(0, 60)}`);
      });
  } catch (қате) {
    logger.error(`Telegram хабарлама қатесі: ${қате.message}`);
  }
}
