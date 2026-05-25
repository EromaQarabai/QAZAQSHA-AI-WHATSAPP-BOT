// Telegram боты — іске қосу, командаларды тіркеу
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Қосылды: polling_error handler → UnhandledPromiseRejection болдырмайды
// ─────────────────────────────────────────────────────────────────────────────
import TelegramBot from 'node-telegram-bot-api';
import { settings } from '../config/settings.js';
import { logger } from '../src/utils/logger.js';
import { handleCommands } from './commands.js';
import { getMainMenu } from './inline-keyboard.js';

let бот = null;
let қайтаБастауСаны = 0;

export function startTelegramBot() {
  try {
    if (!settings.TELEGRAM_ENABLED || !settings.TELEGRAM_BOT_TOKEN) {
      logger.warn('Telegram бот өшірілген немесе токен жоқ');
      return null;
    }

    бот = new TelegramBot(settings.TELEGRAM_BOT_TOKEN, {
      polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 },
      },
    });

    // ✅ ТҮЗЕТІЛДІ: polling_error → UnhandledPromiseRejection болдырмайды
    бот.on('polling_error', (қате) => {
      const хабар = қате.message || String(қате);

      // Желі үзілісі — қалыпты жағдай
      if (хабар.includes('ECONNRESET') || хабар.includes('ETIMEDOUT') ||
          хабар.includes('ENOTFOUND') || хабар.includes('EFATAL')) {
        // Тек файлға жазу — консольде шу шығармаймыз
        return;
      }

      // Token жарамсыз
      if (хабар.includes('401') || хабар.includes('Unauthorized')) {
        logger.error('Telegram token жарамсыз — TELEGRAM_BOT_TOKEN-ды тексеріңіз');
        бот.stopPolling();
        return;
      }

      logger.warn(`Telegram polling: ${хабар.slice(0, 80)}`);
    });

    бот.on('error', (қате) => {
      logger.warn(`Telegram қатесі: ${қате.message?.slice(0, 80)}`);
    });

    // Иесі тексеру
    бот.on('message', (хабар) => {
      try {
        if (String(хабар.from?.id) !== String(settings.TELEGRAM_OWNER_ID)) {
          бот.sendMessage(хабар.chat.id, 'Бұл бот тек Ермахан Қожайынға арналған 🔒').catch(() => {});
          return;
        }
        handleCommands(бот, хабар, settings);
      } catch (қате) {
        logger.error(`Telegram хабар қатесі: ${қате.message}`);
      }
    });

    // Инлайн пернелер
    бот.on('callback_query', (сұраныс) => {
      try {
        if (String(сұраныс.from?.id) !== String(settings.TELEGRAM_OWNER_ID)) {
          бот.answerCallbackQuery(сұраныс.id, { text: 'Рұқсат жоқ 🔒' }).catch(() => {});
          return;
        }
        const дерек = сұраныс.data;
        handleCommands(
          бот,
          { ...сұраныс, text: дерек.startsWith('/') ? дерек : `/${дерек}`, chat: сұраныс.message?.chat },
          settings,
        );
        бот.answerCallbackQuery(сұраныс.id).catch(() => {});
      } catch (қате) {
        logger.error(`Callback query қатесі: ${қате.message}`);
      }
    });

    logger.info('Telegram бот іске қосылды');
    қайтаБастауСаны = 0;
    return бот;
  } catch (қате) {
    logger.error(`Telegram бот қатесі: ${қате.message}`);
    // Автоматты қайта іске қосу (максималды 5 рет)
    if (қайтаБастауСаны < 5) {
      қайтаБастауСаны++;
      setTimeout(() => startTelegramBot(), 30_000);
    }
    return null;
  }
}

export function getBot() {
  return бот;
}
