// Кезек жүйесі — lowdb (JSON) деректер қорымен жұмыс
import { getDb } from '../memory/database.js';
import { logger } from '../utils/logger.js';
import { settings } from '../../config/settings.js';

function safeWrite(db) {
  db.write().catch((е) => logger.error(`Queue write қатесі: ${е.message}`));
}

export function queueMessage(телефон, жид, мазмұн, медиаТүрі, медиаДерек) {
  try {
    const db = getDb();
    if (!Array.isArray(db.data.messageQueue)) db.data.messageQueue = [];

    // Кезек өлшемін тексеру
    const кезекСаны = db.data.messageQueue.filter((m) => m.processed === 0).length;
    if (кезекСаны >= (settings.QUEUE_MAX_SIZE || 100)) {
      logger.warn(`Кезек толы (${кезекСаны}), хабарлама қосылмады: ${телефон}`);
      return false;
    }

    db.data.messageQueue.push({
      id: Date.now() + Math.random(), // уникальды id
      phone: телефон,
      jid: жид,
      content: мазмұн,
      media_type: медиаТүрі || null,
      media_data: медиаДерек || null,
      priority: 5,
      created_at: Date.now(),
      processed: 0,
    });
    safeWrite(db);
    logger.info(`Кезекке қосылды: ${телефон}`);
    return true;
  } catch (қате) {
    logger.error(`Кезек қатесі: ${қате.message}`);
    if (!global.кезекЖады) global.кезекЖады = [];
    global.кезекЖады.push({ phone: телефон, jid: жид, content: мазмұн, created_at: Date.now(), processed: 0 });
    return false;
  }
}

export function getQueuedMessages() {
  try {
    const db = getDb();
    return (db.data.messageQueue || [])
      .filter((m) => m.processed === 0)
      .sort((a, b) => a.created_at - b.created_at);
  } catch (қате) {
    logger.error(`Кезек оқу қатесі: ${қате.message}`);
    return global.кезекЖады?.filter((m) => m.processed === 0) || [];
  }
}

export function markProcessed(ид) {
  try {
    const db = getDb();
    const msg = db.data.messageQueue.find((m) => m.id === ид);
    if (msg) {
      msg.processed = 1;
      safeWrite(db);
    }
  } catch (қате) {
    logger.error(`Кезек жаңарту қатесі: ${қате.message}`);
  }
}

export function clearQueue() {
  try {
    const db = getDb();
    const өшірілді = (db.data.messageQueue || []).filter((m) => m.processed === 0).length;
    db.data.messageQueue = (db.data.messageQueue || []).filter((m) => m.processed === 1);
    safeWrite(db);
    logger.info(`Кезек тазаланды: ${өшірілді} хабарлама`);
    return өшірілді;
  } catch (қате) {
    logger.error(`Кезек тазалау қатесі: ${қате.message}`);
    return 0;
  }
}

export function getQueueSize() {
  try {
    const db = getDb();
    return (db.data.messageQueue || []).filter((m) => m.processed === 0).length;
  } catch {
    return 0;
  }
}
