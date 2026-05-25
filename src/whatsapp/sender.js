// Жауап жіберу + "жазуда..." индикаторы
import { logger } from '../utils/logger.js';

export async function sendMessage(сокет, жид, мәтін, баптаулар) {
  try {
    if (!сокет || !жид || !мәтін) {
      logger.error('Жіберу: сокет/жид/мәтін жоқ');
      return false;
    }

    // Мәтін ұзындығын тексеру
    const максМәтін = баптаулар?.SECURITY_MAX_MESSAGE_LENGTH || 4000;
    const жіберілетін = мәтін.length > максМәтін
      ? мәтін.slice(0, максМәтін) + '...'
      : мәтін;

    // "жазуда..." индикаторы
    if (баптаулар?.WA_TYPING_INDICATOR) {
      try {
        await сокет.sendPresenceUpdate('composing', жид);
        const кідіріс = Math.floor(
          Math.random() * ((баптаулар.WA_TYPING_DELAY_MAX || 3000) - (баптаулар.WA_TYPING_DELAY_MIN || 1000)) +
          (баптаулар.WA_TYPING_DELAY_MIN || 1000),
        );
        await new Promise((р) => setTimeout(р, кідіріс));
        await сокет.sendPresenceUpdate('paused', жид);
      } catch {
        // Presence қатесі — жалғастырамыз
      }
    }

    await сокет.sendMessage(жид, { text: жіберілетін });
    logger.info(`Хабарлама жіберілді: ${жид.slice(-10)}`);
    return true;
  } catch (қате) {
    logger.error(`Жіберу қатесі: ${қате.message}`);
    // Бір рет қайта әрекет
    try {
      await new Promise((р) => setTimeout(р, 2000));
      await сокет.sendMessage(жид, { text: мәтін });
      return true;
    } catch (қайтаҚате) {
      logger.error(`Қайта жіберу сәтсіз: ${қайтаҚате.message}`);
      return false;
    }
  }
}

// Медиа жіберу (сурет)
export async function sendImageMessage(сокет, жид, буфер, жазба) {
  try {
    if (!сокет || !жид || !буфер) return false;
    await сокет.sendMessage(жид, { image: буфер, caption: жазба || '' });
    return true;
  } catch (қате) {
    logger.error(`Сурет жіберу қатесі: ${қате.message}`);
    return false;
  }
}
