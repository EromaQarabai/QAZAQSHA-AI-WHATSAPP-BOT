// Статистика API — lowdb (JSON) нұсқасы
import { getDb } from '../memory/database.js';
import { logger } from '../utils/logger.js';

export function generateDailyStats(дерекқор) {
  try {
    const db = typeof дерекқор === 'object' && дерекқор.data ? дерекқор : getDb();
    const today = new Date().toISOString().split('T')[0];
    const messages = db.data.messages || [];
    const users = db.data.users || {};

    const бүгінStart = new Date(today).getTime();
    const бүгінMessages = messages.filter((m) => m.timestamp >= бүгінStart);
    const бүгінPhones = new Set(бүгінMessages.map((m) => m.phone));

    const languages = db.data.stats?.languages || { kk: 0, ru: 0, en: 0 };
    const total = languages.kk + languages.ru + languages.en || 1;

    const responseTimes = db.data.stats?.responseTimes || [];
    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000).toFixed(2)
      : '0.00';

    // Ең белсенді пайдаланушы
    const counts = {};
    messages.forEach((m) => { counts[m.phone] = (counts[m.phone] || 0) + 1; });
    const mostActivePhone = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const mostActive = mostActivePhone
      ? `${mostActivePhone[0].slice(-4)} (${mostActivePhone[1]} хабар)`
      : '-';

    return {
      userCount: бүгінPhones.size,
      kk: Math.round((languages.kk / total) * 100),
      ru: Math.round((languages.ru / total) * 100),
      en: Math.round((languages.en / total) * 100),
      avgResponseTime,
      mostActive,
      apiRemaining: '#1-#5: Қолжетімді',
      totalMessages: messages.length,
      totalUsers: Object.keys(users).length,
    };
  } catch (қате) {
    logger.error(`Статистика қатесі: ${қате.message}`);
    return { userCount: 0, kk: 0, ru: 0, en: 0, avgResponseTime: 0, mostActive: '-', apiRemaining: '-' };
  }
}

export function statsApiRoutes(app, дерекқор) {
  app.get('/api/stats', (req, res) => {
    try {
      const стат = generateDailyStats(дерекқор);
      res.status(200).json(стат);
    } catch (қате) {
      res.status(500).json({ error: 'Статистика қатесі' });
    }
  });
}
