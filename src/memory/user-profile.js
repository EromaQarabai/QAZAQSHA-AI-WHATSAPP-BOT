// Пайдаланушы профилі CRUD — lowdb (JSON) нұсқасы
import { getDb } from './database.js';
import { logger } from '../utils/logger.js';

function safeWrite(db) {
  db.write().catch((е) => logger.error(`DB write қатесі: ${е.message}`));
}

export function getUserProfile(телефон) {
  try {
    const db = getDb();
    return db.data.users[телефон] || null;
  } catch (қате) {
    logger.error(`Профиль оқу қатесі: ${қате.message}`);
    return { phone: телефон, interaction_count: 0, identified: 0 };
  }
}

export function createUserProfile(телефон, аты) {
  try {
    const db = getDb();
    if (!db.data.users[телефон]) {
      const уақыт = Date.now();
      db.data.users[телефон] = {
        phone: телефон,
        name: аты || null,
        identified: 0,
        relation: null,
        firstContact: уақыт,
        lastInteraction: уақыт,
        interaction_count: 0,
        personalityNotes: '',
        moodOverride: null,
        contextSummary: '',
        busyReason: null,
      };
      safeWrite(db);
    }
    return db.data.users[телефон];
  } catch (қате) {
    logger.error(`Профиль жасау қатесі: ${қате.message}`);
    return { phone: телефон, interaction_count: 0 };
  }
}

export function updateUserProfile(телефон, өрістер) {
  try {
    const db = getDb();
    if (!db.data.users[телефон]) createUserProfile(телефон, null);
    Object.assign(db.data.users[телефон], өрістер, { lastInteraction: Date.now() });
    safeWrite(db);
  } catch (қате) {
    logger.error(`Профиль жаңарту қатесі: ${қате.message}`);
  }
}

export function incrementInteraction(телефон) {
  try {
    const db = getDb();
    if (!db.data.users[телефон]) createUserProfile(телефон, null);
    db.data.users[телефон].interaction_count = (db.data.users[телефон].interaction_count || 0) + 1;
    db.data.users[телефон].lastInteraction = Date.now();
    safeWrite(db);
  } catch (қате) {
    logger.error(`Санауыш қатесі: ${қате.message}`);
  }
}
