// JSON деректер қоры — lowdb (Windows-та C++ компиляторсыз жұмыс істейді)
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { logger } from '../utils/logger.js';
import { join } from 'path';

let дерекқор = null;

const MEMORY_PATH = join(process.cwd(), 'memory', 'qazaqsha.json');

const БАСТАПҚЫ_МӘН = {
  users: {},
  messages: [],
  apiStats: {},
  messageQueue: [],
  scheduledMessages: [],
  stats: {
    daily: {},
    languages: { kk: 0, ru: 0, en: 0, tr: 0 },
    responseTimes: [],
    activeHours: {},
  },
};

export async function initDatabase() {
  try {
    const адаптер = new JSONFile(MEMORY_PATH);
    дерекқор = new Low(адаптер, БАСТАПҚЫ_МӘН);

    await дерекқор.read();

    // Жетіспейтін өрістерді толтыру (бар файлдарда болмауы мүмкін)
    дерекқор.data = { ...БАСТАПҚЫ_МӘН, ...дерекқор.data };
    if (!дерекқор.data.stats) дерекқор.data.stats = БАСТАПҚЫ_МӘН.stats;
    if (!дерекқор.data.stats.responseTimes) дерекқор.data.stats.responseTimes = [];
    if (!дерекқор.data.stats.languages) дерекқор.data.stats.languages = { kk: 0, ru: 0, en: 0, tr: 0 };
    if (!Array.isArray(дерекқор.data.messages)) дерекқор.data.messages = [];
    if (!Array.isArray(дерекқор.data.messageQueue)) дерекқор.data.messageQueue = [];
    if (!Array.isArray(дерекқор.data.scheduledMessages)) дерекқор.data.scheduledMessages = [];
    if (typeof дерекқор.data.users !== 'object') дерекқор.data.users = {};

    await дерекқор.write();

    logger.info('JSON деректер қоры іске қосылды (lowdb)');
    return дерекқор;
  } catch (қате) {
    logger.error(`Деректер қоры қатесі: ${қате.message}`);
    return createFallbackDb();
  }
}

function createFallbackDb() {
  logger.warn('Жадтағы уақытша дерекқор қолданылуда');
  const деректер = JSON.parse(JSON.stringify(БАСТАПҚЫ_МӘН));
  дерекқор = {
    data: деректер,
    read: async () => {},
    write: async () => {},
  };
  return дерекқор;
}

export function getDb() {
  if (!дерекқор) throw new Error('Деректер қоры инициализацияланбаған');
  return дерекқор;
}
