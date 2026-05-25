// Иесінің командалары — WhatsApp арқылы
// ─── ЖАҢА КОМАНДАЛАР ─────────────────────────────────────────────────────────
// /stop, /online, /status, /mood, /block, /unblock, /memory
// /stats     — статистика
// /help      — барлық командалар тізімі
// /clearqueue — кезекті тазалау
// /broadcast <мәтін> — барлық белсенді пайдаланушыларға хабар
// /users     — пайдаланушылар тізімі
// /me <себеп> — иесі бос емес екенін айту
// ─────────────────────────────────────────────────────────────────────────────
import { settings } from '../../config/settings.js';
import { logger } from '../utils/logger.js';
import { addToBlocklist, removeFromBlocklist } from './block-check.js';
import { resetSentiment } from '../memory/sentiment-tracker.js';
import { clearQueue, getQueueSize } from './message-queue.js';
import { getDb } from '../memory/database.js';

export function handleOwnerCommand(мәтін, телефон, сокет, жид) {
  try {
    // Нөмірді тазалап, иесімен салыстырамыз
    const нормал = (телефон || '')
      .replace('@s.whatsapp.net', '')
      .replace('@g.us', '')
      .replace('@lid', '')
      .split(':')[0]
      .replace(/[^0-9]/g, '');
    const иесіНормал = (settings.OWNER_PHONE || '').replace(/[^0-9]/g, '');

    if (!нормал || нормал !== иесіНормал) {
      return { handled: false };
    }

    const команда = мәтін.trim();
    const командаКіші = команда.toLowerCase();

    // ─── /stop ──────────────────────────────────────────────────────────────
    if (командаКіші === '/stop') {
      settings.AI_ONLINE = false;
      return { handled: true, жауап: '⏸️ Бот тоқтатылды\n\n\n**QazaQsha AI | Қателесуі мүмкін.**' };
    }

    // ─── /online ────────────────────────────────────────────────────────────
    if (командаКіші === '/online') {
      settings.AI_ONLINE = true;
      return { handled: true, жауап: '▶️ Бот қосылды\n\n\n**QazaQsha AI | Қателесуі мүмкін.**' };
    }

    // ─── /status ────────────────────────────────────────────────────────────
    if (командаКіші === '/status') {
      const кезекСаны = getQueueSize();
      return {
        handled: true,
        жауап: `🤖 *Бот күйі*\n\n` +
          `▶️ AI: ${settings.AI_ONLINE ? '✅ Онлайн' : '❌ Оффлайн'}\n` +
          `😊 Көңіл-күй: ${settings.AI_MOOD}\n` +
          `⏳ Кезек: ${кезекСаны} хабарлама\n\n\n**QazaQsha AI | Қателесуі мүмкін.**`,
      };
    }

    // ─── /stats ─────────────────────────────────────────────────────────────
    if (командаКіші === '/stats') {
      try {
        const db = getDb();
        const today = new Date().toISOString().split('T')[0];
        const messages = db.data.messages || [];
        const users = db.data.users || {};
        const бүгінStart = new Date(today).getTime();
        const бүгінMsg = messages.filter((m) => m.timestamp >= бүгінStart).length;
        const бүгінUsers = new Set(messages.filter((m) => m.timestamp >= бүгінStart).map((m) => m.phone)).size;

        return {
          handled: true,
          жауап: `📊 *QazaQsha Статистика*\n\n` +
            `📅 Бүгін: ${бүгінMsg} хабар, ${бүгінUsers} адам\n` +
            `📦 Барлық хабарламалар: ${messages.length}\n` +
            `👥 Барлық пайдаланушылар: ${Object.keys(users).length}\n` +
            `⏳ Кезек: ${getQueueSize()}\n\n\n**QazaQsha AI | Қателесуі мүмкін.**`,
        };
      } catch {
        return { handled: true, жауап: '⚠️ Статистика алу қатесі' };
      }
    }

    // ─── /clearqueue ────────────────────────────────────────────────────────
    if (командаКіші === '/clearqueue') {
      const өшірілді = clearQueue();
      return {
        handled: true,
        жауап: `🗑️ Кезек тазаланды: ${өшірілді} хабарлама өшірілді\n\n\n**QazaQsha AI | Қателесуі мүмкін.**`,
      };
    }

    // ─── /users ─────────────────────────────────────────────────────────────
    if (командаКіші === '/users') {
      try {
        const db = getDb();
        const users = Object.entries(db.data.users || {});
        const соңғы10 = users
          .sort((a, b) => (b[1].lastInteraction || 0) - (a[1].lastInteraction || 0))
          .slice(0, 10)
          .map(([phone, u], i) => `${i + 1}. ...${phone.slice(-4)} (${u.interaction_count || 0} хабар)`)
          .join('\n');
        return {
          handled: true,
          жауап: `👥 *Соңғы пайдаланушылар (${users.length} барлығы):*\n\n${соңғы10 || 'Жоқ'}\n\n\n**QazaQsha AI | Қателесуі мүмкін.**`,
        };
      } catch {
        return { handled: true, жауап: '⚠️ Пайдаланушылар тізімі алу қатесі' };
      }
    }

    // ─── /mood <тип> ────────────────────────────────────────────────────────
    if (командаКіші.startsWith('/mood ')) {
      const жаңаКүй = командаКіші.slice(6).trim();
      const мүмкін = ['positive', 'chill', 'sarcastic', 'energetic', 'supportive'];
      if (мүмкін.includes(жаңаКүй)) {
        settings.AI_MOOD = жаңаКүй.charAt(0).toUpperCase() + жаңаКүй.slice(1);
        return { handled: true, жауап: `😊 Көңіл-күй өзгерді: *${settings.AI_MOOD}*\n\n\n**QazaQsha AI | Қателесуі мүмкін.**` };
      }
      return { handled: true, жауап: `❌ Мүмкін күйлер: ${мүмкін.join(', ')}` };
    }

    // ─── /block <нөмір> ─────────────────────────────────────────────────────
    if (командаКіші.startsWith('/block ')) {
      const нөмір = команда.slice(7).trim();
      if (addToBlocklist(нөмір, settings.SECURITY_BLOCKLIST_PATH)) {
        return { handled: true, жауап: `🚫 Блокталды: ${нөмір}\n\n\n**QazaQsha AI | Қателесуі мүмкін.**` };
      }
    }

    // ─── /unblock <нөмір> ───────────────────────────────────────────────────
    if (командаКіші.startsWith('/unblock ')) {
      const нөмір = команда.slice(9).trim();
      if (removeFromBlocklist(нөмір, settings.SECURITY_BLOCKLIST_PATH)) {
        return { handled: true, жауап: `✅ Блоктан шығарылды: ${нөмір}\n\n\n**QazaQsha AI | Қателесуі мүмкін.**` };
      }
    }

    // ─── /memory ────────────────────────────────────────────────────────────
    if (командаКіші === '/memory') {
      resetSentiment(телефон);
      return { handled: true, жауап: '🧹 Жад тазаланды\n\n\n**QazaQsha AI | Қателесуі мүмкін.**' };
    }

    // ─── /help ──────────────────────────────────────────────────────────────
    if (командаКіші === '/help') {
      return {
        handled: true,
        жауап: `❓ *QazaQsha Командалар (WhatsApp)*\n\n` +
          `/stop — Ботты тоқтату\n` +
          `/online — Ботты қосу\n` +
          `/status — Бот күйі\n` +
          `/stats — Статистика\n` +
          `/users — Пайдаланушылар\n` +
          `/mood <тип> — Көңіл-күй\n` +
          `/me <себеп> — Бос емес себебі\n` +
          `/block <нөмір> — Блоктау\n` +
          `/unblock <нөмір> — Блоктан шығару\n` +
          `/clearqueue — Кезекті тазалау\n` +
          `/memory — Жадты тазалау\n` +
          `/help — Осы тізім\n\n\n**QazaQsha AI | Қателесуі мүмкін.**`,
      };
    }

    return { handled: false };
  } catch (қате) {
    logger.error(`Иесінің команда қатесі: ${қате.message}`);
    return { handled: false };
  }
}
