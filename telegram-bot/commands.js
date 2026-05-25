// Барлық командалар логикасы
import { settings } from '../config/settings.js';
import { logger } from '../src/utils/logger.js';
import { getMainMenu, getMoodMenu, getStatusMenu } from './inline-keyboard.js';
import { generateDailyStats } from '../src/dashboard-api/stats-api.js';
import { createBackup } from '../src/utils/backup.js';
import { getDb } from '../src/memory/database.js';

export function handleCommands(бот, хабар, баптаулар) {
  try {
    const мәтін = (хабар.text || хабар.data || '').trim();
    const чатИд = хабар.chat?.id || хабар.message?.chat?.id;

    if (!чатИд) return;

    const командаКіші = мәтін.toLowerCase().replace(/^\//, '');

    // ─── /start ────────────────────────────────────────────────────────────
    if (мәтін === '/start' || командаКіші === 'start') {
      бот.sendMessage(чатИд,
        '🤖 *QazaQsha Admin Panel*\n\nҚош келдіңіз, Ермахан Қожайын! Таңдаңыз:',
        { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      return;
    }

    // ─── /status ────────────────────────────────────────────────────────────
    if (мәтін === '/status' || командаКіші === 'status') {
      const күй =
        `🤖 *Бот күйі*\n\n` +
        `▶️ AI: ${баптаулар.AI_ONLINE ? '✅ Онлайн' : '❌ Оффлайн'}\n` +
        `🧠 Модель: \`${баптаулар.AI_MODEL_SIMPLE || 'flash'}\`\n` +
        `😊 Көңіл-күй: \`${баптаулар.AI_MOOD}\`\n` +
        `📱 Иесі: \`${баптаулар.OWNER_PHONE}\``;
      бот.sendMessage(чатИд, күй, { parse_mode: 'Markdown', ...getStatusMenu() }).catch(() => {});
      return;
    }

    // ─── /info | stats ──────────────────────────────────────────────────────
    if (мәтін === '/info' || командаКіші === 'stats' || командаКіші === 'info') {
      try {
        const db = getDb();
        const стат = generateDailyStats(db);
        const есеп =
          `📊 *QazaQsha Статистика*\n\n` +
          `👥 Бүгінгі пайдаланушылар: *${стат.userCount}*\n` +
          `💬 Барлық хабарламалар: *${стат.totalMessages}*\n` +
          `👤 Барлық пайдаланушылар: *${стат.totalUsers}*\n\n` +
          `🇰🇿 Қазақша: ${стат.kk}%\n` +
          `🇷🇺 Орысша: ${стат.ru}%\n` +
          `🇬🇧 Ағылшынша: ${стат.en}%\n\n` +
          `⚡ Орт. жауап: ${стат.avgResponseTime}с\n` +
          `🏆 Ең белсенді: ${стат.mostActive}`;
        бот.sendMessage(чатИд, есеп, { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      } catch (қате) {
        бот.sendMessage(чатИд, '⚠️ Статистика алу қатесі').catch(() => {});
      }
      return;
    }

    // ─── Mood меню ──────────────────────────────────────────────────────────
    if (командаКіші === 'mood') {
      бот.sendMessage(чатИд, '😊 *Көңіл-күй таңдаңыз:*',
        { parse_mode: 'Markdown', ...getMoodMenu() }).catch(() => {});
      return;
    }

    // ─── Mood командалары ───────────────────────────────────────────────────
    const мүмкінКүйлер = ['positive', 'chill', 'sarcastic', 'energetic', 'supportive'];
    const мудКоманда = мәтін.startsWith('/mood ')
      ? мәтін.slice(6).trim().toLowerCase()
      : мүмкінКүйлер.includes(командаКіші) ? командаКіші : null;

    if (мудКоманда) {
      if (мүмкінКүйлер.includes(мудКоманда)) {
        баптаулар.AI_MOOD = мудКоманда.charAt(0).toUpperCase() + мудКоманда.slice(1);
        бот.sendMessage(чатИд,
          `✅ Көңіл-күй өзгерді: *${баптаулар.AI_MOOD}* 😊`,
          { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      } else {
        бот.sendMessage(чатИд,
          '❌ Қате! Мүмкін күйлер: positive, chill, sarcastic, energetic, supportive',
          getMoodMenu()).catch(() => {});
      }
      return;
    }

    // ─── Online / Offline ───────────────────────────────────────────────────
    if (мәтін === '/online' || командаКіші === 'online') {
      баптаулар.AI_ONLINE = true;
      бот.sendMessage(чатИд, '✅ *Бот қосылды* ▶️', { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      return;
    }

    if (мәтін === '/offline' || командаКіші === 'offline') {
      баптаулар.AI_ONLINE = false;
      бот.sendMessage(чатИд, '⏸️ *Бот тоқтатылды*', { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      return;
    }

    // ─── /me ────────────────────────────────────────────────────────────────
    if (мәтін.startsWith('/me ') || мәтін.startsWith('me ')) {
      const себеп = мәтін.replace(/^\/me |^me /, '').trim();
      import('../src/index.js').then(({ setBusyReason }) => {
        setBusyReason(себеп || null);
        const жауапМәтін = себеп
          ? `✅ *Бос емес себебі орнатылды:*\n«${себеп}»`
          : '✅ Себеп тазаланды. AI қалыпты режимде.';
        бот.sendMessage(чатИд, жауапМәтін, { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      }).catch(() => {
        бот.sendMessage(чатИд, '⚠️ setBusyReason қатесі').catch(() => {});
      });
      return;
    }

    // ─── Backup ─────────────────────────────────────────────────────────────
    if (мәтін === '/backup' || командаКіші === 'backup') {
      бот.sendMessage(чатИд, '💾 Көшірме жасалуда...').catch(() => {});
      createBackup(баптаулар).then((жол) => {
        бот.sendMessage(чатИд,
          жол ? `✅ Көшірме жасалды:\n\`${жол}\`` : '❌ Көшірме қатесі ⚠️',
          { parse_mode: 'Markdown' }).catch(() => {});
      });
      return;
    }

    // ─── Restart ─────────────────────────────────────────────────────────────
    if (мәтін === '/restart' || командаКіші === 'restart') {
      бот.sendMessage(чатИд, '🔄 *Бот қайта қосылуда...*', { parse_mode: 'Markdown' }).then(() => {
        setTimeout(() => process.exit(0), 2000);
      }).catch(() => {
        setTimeout(() => process.exit(0), 2000);
      });
      return;
    }

    // ─── Help ─────────────────────────────────────────────────────────────
    if (мәтін === '/help' || командаКіші === 'help') {
      const анықтама =
        `❓ *QazaQsha Командалар*\n\n` +
        `/start — Негізгі мәзір\n` +
        `/status — Бот күйі\n` +
        `/info — Статистика\n` +
        `/online — Ботты қосу\n` +
        `/offline — Ботты өшіру\n` +
        `/mood <тип> — Көңіл-күй өзгерту\n` +
        `/me <себеп> — Неге бос емес\n` +
        `/backup — Деректер көшірмесі\n` +
        `/restart — Қайта іске қосу\n` +
        `/help — Осы тізім`;
      бот.sendMessage(чатИд, анықтама, { parse_mode: 'Markdown', ...getMainMenu() }).catch(() => {});
      return;
    }

    // ─── Белгісіз команда ──────────────────────────────────────────────────
    бот.sendMessage(чатИд,
      '❓ Белгісіз команда. /help немесе мәзірді қолданыңыз.',
      getMainMenu()).catch(() => {});
  } catch (қате) {
    logger.error(`Команда қатесі: ${қате.message}`);
  }
}
