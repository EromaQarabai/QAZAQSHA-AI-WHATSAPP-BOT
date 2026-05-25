// 23:00-08:00 автожауап (ЖИ-ге жібермей)
// ─── ЖАҚСАРТЫЛДЫ ──────────────────────────────────────────────────────────────
// Қосылды: иесіге автожауап жіберілмейді
// Қосылды: бір адамға 30 минут ішінде бір рет ғана жіберіледі (спам болдырмау)
// ─────────────────────────────────────────────────────────────────────────────
import { settings } from '../../config/settings.js';
import { logger } from '../utils/logger.js';

const соңғыЖауапУақыты = new Map(); // phone → timestamp

export function isAutoReplyHours() {
  try {
    if (!settings.AUTO_REPLY_ENABLED) return false;

    const енді = new Date().toLocaleTimeString('en-GB', {
      timeZone: settings.AUTO_REPLY_TIMEZONE || 'Asia/Almaty',
    });
    const сағат = parseInt(енді.split(':')[0], 10);
    const минут = parseInt(енді.split(':')[1], 10);
    const минуттар = сағат * 60 + минут;

    // Старт/End парсинг
    const [стартСағ, стартМин] = (settings.AUTO_REPLY_START || '23:00').split(':').map(Number);
    const [аяқСағ, аяқМин] = (settings.AUTO_REPLY_END || '08:00').split(':').map(Number);
    const стартМинуттар = стартСағ * 60 + стартМин;
    const аяқМинуттар = аяқСағ * 60 + аяқМин;

    // Түн ортасын кесіп өтетін интервал (23:00 → 08:00)
    if (стартМинуттар > аяқМинуттар) {
      return минуттар >= стартМинуттар || минуттар < аяқМинуттар;
    }
    return минуттар >= стартМинуттар && минуттар < аяқМинуттар;
  } catch (қате) {
    logger.error(`Уақыт тексеру қатесі: ${қате.message}`);
    return false;
  }
}

/**
 * Бұл телефонға автожауап жіберу керек пе?
 * - Иесіне жіберілмейді
 * - 30 минут ішінде қайталанбайды
 */
export function shouldSendAutoReply(телефон) {
  try {
    // Иесіне автожауап жіберілмейді
    const иесіНөмір = (settings.OWNER_PHONE || '').replace(/[^0-9]/g, '');
    const берілгенНөмір = (телефон || '').replace(/[^0-9]/g, '');
    if (иесіНөмір && берілгенНөмір === иесіНөмір) return false;

    // 30 минут throttle
    const THROTTLE_MS = 30 * 60 * 1000;
    const соңғы = соңғыЖауапУақыты.get(телефон) || 0;
    if (Date.now() - соңғы < THROTTLE_MS) return false;

    соңғыЖауапУақыты.set(телефон, Date.now());
    return true;
  } catch {
    return false;
  }
}

export function getAutoReplyMessage() {
  try {
    return settings.AUTO_REPLY_MESSAGE + '\n\n\n**Бұл жауаптарды QazaQsha AI жазуда. QazaQsha — бұл Жасанды Интеллект. Қателесуі мүмкін.**';
  } catch {
    return 'Бро, Қожайын қазір ұйықтап жатыр 😴. Таңертең қайта жаз!\n\n\n**Бұл жауаптарды QazaQsha AI жазуда. Қателесуі мүмкін.**';
  }
}
