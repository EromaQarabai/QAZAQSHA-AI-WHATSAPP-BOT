// Кіру нүктесі — барлық модульдерді іске қосу
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// 1. process.on('unhandledRejection') → crash болдырмайды (1006 қатесі)
// 2. Per-user rate limiting іске асырылды
// 3. Жауап уақытын статистикада сақтау
// 4. Иесіне автожауап жіберілмейді
// 5. Хабарлама ұзындығын тексеру
// ─────────────────────────────────────────────────────────────────────────────
import { settings } from '../config/settings.js';
import { initDatabase } from './memory/database.js';
import { startWhatsApp, getSocket } from './whatsapp/connection.js';
import { startTelegramBot, getBot } from '../telegram-bot/bot.js';
import { setBot, notifyTelegram } from '../telegram-bot/notifications.js';
import { initGeminiClients, callGemini, hasAnyAvailableKey } from './gemini/router.js';
import { selectModel } from './gemini/model-selector.js';
import { buildSystemPrompt, buildChatPrompt, classifyMessage, getContextSize } from './gemini/prompt-builder.js';
import { getCached, setCached } from './gemini/response-cache.js';
import { filterOutput } from './gemini/output-filter.js';
import { injectDisclaimer } from './pipeline/disclaimer.js';
import { isBlocked, loadBlocklist } from './pipeline/block-check.js';
import { shouldRespondInGroup, stripTrigger } from './pipeline/group-check.js';
import { isAutoReplyHours, getAutoReplyMessage, shouldSendAutoReply } from './pipeline/auto-reply-hours.js';
import { checkSentiment } from './pipeline/sentiment-guard.js';
import { handleOwnerCommand } from './pipeline/owner-commands.js';
import { isDuplicate, addToCache } from './pipeline/duplicate-prevent.js';
import { queueMessage, getQueuedMessages, markProcessed } from './pipeline/message-queue.js';
import { getUserProfile, createUserProfile, incrementInteraction, updateUserProfile } from './memory/user-profile.js';
import { saveMessage, getContextWindow } from './memory/chat-history.js';
import { sendMessage } from './whatsapp/sender.js';
import { extractMessageData } from './whatsapp/message-extractor.js';
import { downloadMedia, processImage, processAudio } from './whatsapp/media-handler.js';
import { startCronJobs } from './utils/cron-jobs.js';
import { logger } from './utils/logger.js';
import { normalizePhone, phonesMatch } from './utils/phone-normalizer.js';
import { setLastActiveJid } from './whatsapp/active-chat-tracker.js';
import { getDb } from './memory/database.js';

// ─── Global қате ұстағыш (UnhandledPromiseRejection → crash болдырмау) ────────
process.on('unhandledRejection', (себеп, promise) => {
  const хабар = String(себеп?.message || себеп || '');
  // WebSocket / Telegram / желі үзілісі — қалыпты
  if (
    хабар.includes('1006') ||
    хабар.includes('ECONNRESET') ||
    хабар.includes('ETIMEDOUT') ||
    хабар.includes('ENOTFOUND') ||
    хабар.includes('keepAlive') ||
    хабар.includes('Connection Terminated') ||
    хабар.includes('polling') ||
    хабар.includes('EFATAL')
  ) {
    return; // Жай жібереміз
  }
  logger.error(`UnhandledRejection: ${хабар.slice(0, 200)}`);
});

process.on('uncaughtException', (қате) => {
  const хабар = қате?.message || '';
  if (хабар.includes('keepAlive') || хабар.includes('1006') || хабар.includes('Connection Terminated')) {
    return;
  }
  logger.error(`UncaughtException: ${хабар}`);
});

// ─── Деректер қорын инициализациялау ─────────────────────────────────────────
const дерекқор = await initDatabase();

loadBlocklist(settings.SECURITY_BLOCKLIST_PATH);
initGeminiClients();

const telegramBot = startTelegramBot();
if (telegramBot) setBot(telegramBot);

startCronJobs(settings, дерекқор);

try {
  const { createDashboardServer } = await import('../dashboard/server.js');
  createDashboardServer();
} catch (е) {
  logger.warn(`Dashboard іске қосу: ${е.message}`);
}

logger.info('QazaQsha-001 іске қосылды');

// ─── "Бос емес" себебін сақтау ───────────────────────────────────────────────
let иесіБосЕмесСебебі = null;
export function setBusyReason(себеп) { иесіБосЕмесСебебі = себеп; }
export function getBusyReason() { return иесіБосЕмесСебебі; }

// ─── Per-user rate limiting ───────────────────────────────────────────────────
const пайдаланушыСоңғыХабарлар = new Map(); // phone → [timestamps]

function checkRateLimit(телефон) {
  if (!settings.SECURITY_RATE_LIMIT_PER_MINUTE) return false;
  const қазір = Date.now();
  const терезе = 60_000; // 1 минут
  const макс = settings.SECURITY_RATE_LIMIT_PER_MINUTE || 20;

  if (!пайдаланушыСоңғыХабарлар.has(телефон)) {
    пайдаланушыСоңғыХабарлар.set(телефон, []);
  }
  const уақыттар = пайдаланушыСоңғыХабарлар.get(телефон);
  const тазаланған = уақыттар.filter((t) => қазір - t < терезе);
  тазаланған.push(қазір);
  пайдаланушыСоңғыХабарлар.set(телефон, тазаланған);

  return тазаланған.length > макс;
}

// ─── Prompt injection тексеру ────────────────────────────────────────────────
function hasPromptInjection(мәтін) {
  if (!settings.SECURITY_PROMPT_INJECTION_CHECK) return false;
  const төмен = мәтін.toLowerCase();
  return (settings.SECURITY_FORBIDDEN_WORDS || []).some((сөз) => төмен.includes(сөз.toLowerCase()));
}

// ─── Жауап уақытын сақтау ───────────────────────────────────────────────────
function trackResponseTime(мс) {
  try {
    const db = getDb();
    if (!db.data.stats) db.data.stats = { responseTimes: [], languages: { kk: 0, ru: 0, en: 0, tr: 0 }, daily: {}, activeHours: {} };
    if (!db.data.stats.responseTimes) db.data.stats.responseTimes = [];
    db.data.stats.responseTimes.push(мс);
    if (db.data.stats.responseTimes.length > 1000) {
      db.data.stats.responseTimes = db.data.stats.responseTimes.slice(-1000);
    }
    db.write().catch(() => {});
  } catch {}
}

// ─── Негізгі хабарлама өңдеу ─────────────────────────────────────────────────
async function processIncomingMessage(сокет, хабарлама) {
  let жид = null;
  const бастауУақыты = Date.now();

  try {
    const { телефон, remoteJid, мәтін, тип, цитата, группа, ид } = extractMessageData(хабарлама);
    if (!мәтін && тип === 'text') return;

    жид = remoteJid || хабарлама.key?.remoteJid;
    if (!жид) return;

    // status@broadcast өткіземіз
    if (жид === 'status@broadcast') return;

    if (!жид.includes('@g.us')) {
      setLastActiveJid(жид);
    }

    const нормалТелефон = normalizePhone(телефон) || телефон;
    const иесіМе = phonesMatch(телефон, settings.OWNER_PHONE);

    // ─── Блоктізім тексеру (иесіне қолданылмайды) ───────────────────────────
    if (!иесіМе && isBlocked(нормалТелефон)) {
      logger.info(`Блокталған нөмір: ...${нормалТелефон?.slice(-4)}`);
      return;
    }

    // ─── Хабарлама ұзындығы тексеру ─────────────────────────────────────────
    if (мәтін && мәтін.length > (settings.SECURITY_MAX_MESSAGE_LENGTH || 4000)) {
      await sendMessage(сокет, жид, 'Бро, хабарлама тым ұзын 😅. Қысқарта жаз!', settings);
      return;
    }

    // ─── Группа тексеру ─────────────────────────────────────────────────────
    if (группа && !shouldRespondInGroup(мәтін)) return;
    const тазаМәтін = группа ? stripTrigger(мәтін) : мәтін;

    // ─── Иесінің /me командасы ──────────────────────────────────────────────
    if (иесіМе && тазаМәтін?.toLowerCase().startsWith('/me ')) {
      const себеп = тазаМәтін.slice(4).trim();
      иесіБосЕмесСебебі = себеп || null;
      const жауапМәтін = себеп
        ? `✅ Статус жаңартылды: «${себеп}» — AI хабардар 🤖`
        : '✅ Статус тазаланды. AI қалыпты режимде.';
      await sendMessage(сокет, жид, жауапМәтін, settings);
      return;
    }

    // ─── Иесінің командалары ────────────────────────────────────────────────
    const командаНәтиже = handleOwnerCommand(тазаМәтін, телефон, сокет, жид);
    if (командаНәтиже.handled) {
      await sendMessage(сокет, жид, командаНәтиже.жауап, settings);
      return;
    }

    // ─── AI өшірілген болса ──────────────────────────────────────────────────
    if (!settings.AI_ONLINE) return;

    // ─── Per-user rate limiting (иесіне қолданылмайды) ──────────────────────
    if (!иесіМе && checkRateLimit(нормалТелефон)) {
      await sendMessage(сокет, жид,
        `Бро, тым жиі жазып жатырсың 😅. ${settings.SECURITY_RATE_LIMIT_COOLDOWN / 1000}с күте тұр!`,
        settings);
      return;
    }

    // ─── Prompt injection тексеру ─────────────────────────────────────────────
    if (!иесіМе && hasPromptInjection(тазаМәтін || '')) {
      await sendMessage(сокет, жид, 'Бро, мұны түсінбедім 😅. Басқаша жаз!', settings);
      return;
    }

    // ─── Автожауап уақыты (иесіне жіберілмейді) ──────────────────────────────
    if (!иесіМе && isAutoReplyHours() && shouldSendAutoReply(нормалТелефон)) {
      await sendMessage(сокет, жид, getAutoReplyMessage(), settings);
      return;
    }

    // Тек мәтін хабарларды өңдейміз (немесе медиа)
    if (!тазаМәтін && тип === 'text') return;

    // ─── Пайдаланушы профилі ─────────────────────────────────────────────────
    let профиль = getUserProfile(нормалТелефон);
    if (!профиль) профиль = createUserProfile(нормалТелефон, null);
    incrementInteraction(нормалТелефон);

    if (тазаМәтін) saveMessage(нормалТелефон, 'user', тазаМәтін, тип, 'neutral');

    // ─── Сентимент тексеру ───────────────────────────────────────────────────
    const сентимент = checkSentiment(нормалТелефон, тазаМәтін || '');
    let көңілКүй = settings.AI_MOOD;
    if (сентимент.override) {
      көңілКүй = сентимент.mood;
      updateUserProfile(нормалТелефон, { mood_override: көңілКүй });
      notifyTelegram(`⚠️ Sentiment guard: ...${нормалТелефон?.slice(-4)} → Supportive`);
    }

    // ─── Медиа өңдеу ────────────────────────────────────────────────────────
    let медиаБар = тип !== 'text';
    let медиаДерек = null;
    if (медиаБар) {
      медиаДерек = await downloadMedia(сокет, хабарлама);
      if (тип === 'image' && медиаДерек) медиаДерек = await processImage(медиаДерек);
      if (тип === 'audio' && медиаДерек) медиаДерек = await processAudio(медиаДерек);
    }

    // ─── Модель таңдау ──────────────────────────────────────────────────────
    const хабарТүрі = classifyMessage(тазаМәтін || '');
    const контекстӨлшемі = медиаБар ? 8 : getContextSize(хабарТүрі);
    const { модель } = selectModel(тазаМәтін || '', медиаБар, хабарТүрі === 'complex');

    // ─── Response cache ──────────────────────────────────────────────────────
    const кэшЖауап = getCached(нормалТелефон, тазаМәтін || '');
    if (кэшЖауап) {
      logger.info('Cache hit — API шақырылмады');
      await sendMessage(сокет, жид, кэшЖауап, settings);
      return;
    }

    // ─── Контекст ────────────────────────────────────────────────────────────
    const контекст = контекстӨлшемі > 0 ? getContextWindow(нормалТелефон, контекстӨлшемі) : [];

    // ─── Промпт жасау ────────────────────────────────────────────────────────
    const жүйелікПромпт = buildSystemPrompt(профиль, көңілКүй, иесіБосЕмесСебебі);
    const чатПромпт = buildChatPrompt(жүйелікПромпт, контекст, тазаМәтін || тип);

    // ─── API қолжетімділік ───────────────────────────────────────────────────
    if (!hasAnyAvailableKey()) {
      logger.warn('Барлық кілттер лимитте, кезекке қосу');
      queueMessage(нормалТелефон, жид, тазаМәтін || '', тип, медиаДерек);
      await sendMessage(сокет, жид, settings.QUEUE_WAIT_MESSAGE + '\n\n\n**QazaQsha AI | Қателесуі мүмкін.**', settings);
      return;
    }

    // ─── Gemini шақыру ──────────────────────────────────────────────────────
    let жауап = await callGemini(модель, чатПромпт, тазаМәтін || '');
    if (!жауап) жауап = settings.ERROR_FALLBACK_MESSAGE;

    жауап = filterOutput(жауап);
    жауап = injectDisclaimer(жауап);

    if (isDuplicate(жауап, settings.DUPLICATE_SIMILARITY_THRESHOLD)) {
      жауап = жауап + ' ✨';
    }
    addToCache(жауап, settings.DUPLICATE_CACHE_SIZE);

    if (тазаМәтін) setCached(нормалТелефон, тазаМәтін, жауап);
    saveMessage(нормалТелефон, 'model', жауап, 'text', 'positive');

    await sendMessage(сокет, жид, жауап, settings);

    // ─── Жауап уақытын жазу ─────────────────────────────────────────────────
    trackResponseTime(Date.now() - бастауУақыты);
    logger.info(`Жауап берілді: ...${нормалТелефон?.slice(-4)} (${Date.now() - бастауУақыты}мс)`);
  } catch (қате) {
    logger.error(`Негізгі өңдеу қатесі: ${қате.message}`);
    try {
      if (сокет && жид) {
        await sendMessage(сокет, жид, settings.ERROR_FALLBACK_MESSAGE + '\n\n\n**QazaQsha AI | Қателесуі мүмкін.**', settings);
      }
    } catch {}
  }
}

// ─── Кезекті өңдеу ───────────────────────────────────────────────────────────
async function processQueue() {
  try {
    if (!settings.QUEUE_ENABLED) return;
    const кезек = getQueuedMessages();
    for (const хабар of кезек) {
      if (!hasAnyAvailableKey()) break;

      const профиль = getUserProfile(хабар.phone) || createUserProfile(хабар.phone, null);
      const контекст = getContextWindow(хабар.phone, settings.MEMORY_CONTEXT_WINDOW);
      const жүйелікПромпт = buildSystemPrompt(профиль, settings.AI_MOOD, иесіБосЕмесСебебі);
      const чатПромпт = buildChatPrompt(жүйелікПромпт, контекст, хабар.content);
      const { модель } = selectModel(хабар.content, !!хабар.media_type, false);

      let жауап = await callGemini(модель, чатПромпт, хабар.content);
      if (!жауап) жауап = settings.ERROR_FALLBACK_MESSAGE;
      жауап = filterOutput(жауап);
      жауап = injectDisclaimer(жауап);

      const сокет = getSocket();
      const жіберуЖид = хабар.jid || (хабар.phone + '@s.whatsapp.net');
      if (сокет) {
        await sendMessage(сокет, жіберуЖид, жауап, settings);
        markProcessed(хабар.id);
        saveMessage(хабар.phone, 'model', жауап, 'text', 'positive');
        logger.info(`Кезек жауабы жіберілді: ${хабар.phone?.slice(-4)}`);
      }
    }
  } catch (қате) {
    logger.error(`Кезек өңдеу қатесі: ${қате.message}`);
  }
}

setInterval(processQueue, settings.QUEUE_RETRY_INTERVAL || 60_000);

// WhatsApp қосылу
startWhatsApp(processIncomingMessage);
