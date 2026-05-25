// Хабарламаларды сақтау және алу — lowdb (JSON) нұсқасы
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Бұрын: db.write() await-сіз шақырылды → деректер сақталмауы мүмкін
// Шешім: .write().catch() арқылы қате жұтылмайды, async background сақтау
// ─────────────────────────────────────────────────────────────────────────────
import { getDb } from './database.js';
import { logger } from '../utils/logger.js';

function safeWrite(db) {
  db.write().catch((е) => logger.error(`DB write қатесі: ${е.message}`));
}

export function saveMessage(телефон, рөл, мазмұн, тип, сентимент) {
  try {
    const db = getDb();
    if (!Array.isArray(db.data.messages)) db.data.messages = [];

    db.data.messages.push({
      phone: телефон,
      role: рөл,
      content: мазмұн,
      timestamp: Date.now(),
      type: тип || 'text',
      sentiment: сентимент || 'neutral',
    });

    // 90 күннен ескілерді тазалау (жады жинау)
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    if (db.data.messages.length > 5000) {
      db.data.messages = db.data.messages.filter((m) => m.timestamp > cutoff);
    }

    safeWrite(db);
  } catch (қате) {
    logger.error(`Хабарлама сақтау қатесі: ${қате.message}`);
    if (!global.уақытшаХабарламалар) global.уақытшаХабарламалар = [];
    global.уақытшаХабарламалар.push({ телефон, рөл, мазмұн, уақыт: Date.now() });
  }
}

export function getChatHistory(телефон, шектеу) {
  try {
    const db = getDb();
    return (db.data.messages || [])
      .filter((m) => m.phone === телефон)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, шектеу || 50);
  } catch (қате) {
    logger.error(`Тарих оқу қатесі: ${қате.message}`);
    return [];
  }
}

export function getContextWindow(телефон, шектеу) {
  try {
    const db = getDb();
    return (db.data.messages || [])
      .filter((m) => m.phone === телефон)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, шектеу || 20)
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));
  } catch (қате) {
    logger.error(`Контекст оқу қатесі: ${қате.message}`);
    return [];
  }
}
