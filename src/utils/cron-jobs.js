// Түнгі тазалау және 23:59 статистика
import cron from 'node-cron';
import { logger } from './logger.js';
import { cleanupOldMessages } from '../memory/retention.js';
import { generateDailyStats } from '../dashboard-api/stats-api.js';
import { notifyTelegram } from '../../telegram-bot/notifications.js';
import { createBackup } from './backup.js';

export function startCronJobs(баптаулар, дерекқор) {
  try {
    // Түнгі тазалау: Алматы уақытымен 02:00 (UTC 20:00 алдыңғы күн)
    cron.schedule('0 20 * * *', async () => {
      try {
        logger.info('Түнгі тазалау басталды');
        const өшірілді = await cleanupOldMessages(дерекқор, баптаулар.MEMORY_RETENTION_DAYS || 90);
        logger.info(`Тазалау аяқталды: ${өшірілді} жазба өшірілді`);
        notifyTelegram(`🧹 Тазалау аяқталды: ${өшірілді} ескі жазба өшірілді`);
      } catch (қате) {
        logger.error(`Тазалау қатесі: ${қате.message}`);
        notifyTelegram('⚠️ Тазалау қатесі');
      }
    });

    // Күндік есеп: 18:59 UTC = 23:59 Алматы
    cron.schedule('59 18 * * *', async () => {
      try {
        if (!баптаулар.TELEGRAM_DAILY_REPORT) return;
        const стат = generateDailyStats(дерекқор);
        const есеп =
          `📊 QazaQsha ${new Date().toISOString().split('T')[0]} есебі:\n` +
          `• ${стат.userCount} адам жазды\n` +
          `• Қазақша: ${стат.kk}%, Орысша: ${стат.ru}%, Ағылшынша: ${стат.en}%\n` +
          `• Орт. жауап: ${стат.avgResponseTime}с\n` +
          `• Ең белсенді: ${стат.mostActive}\n` +
          `• Барлық хабарламалар: ${стат.totalMessages}\n` +
          `• Бот күйі: ${баптаулар.AI_ONLINE ? '✅ Online' : '❌ Offline'}`;
        notifyTelegram(есеп);
      } catch (қате) {
        logger.error(`Күндік есеп қатесі: ${қате.message}`);
      }
    });

    // Автоматты көшірме
    if (баптаулар.BACKUP_ENABLED) {
      const сағат = баптаулар.BACKUP_INTERVAL_HOURS || 48;
      cron.schedule(`0 */${сағат} * * *`, async () => {
        try {
          await createBackup(баптаулар);
          notifyTelegram('💾 Автоматты көшірме жасалды');
        } catch (қате) {
          logger.error(`Автоматты көшірме қатесі: ${қате.message}`);
          notifyTelegram('⚠️ Көшірме қатесі');
        }
      });
    }

    // Жадты тазалау: 1 сағат сайын (rate limit Map-тарын шектеу)
    cron.schedule('0 * * * *', () => {
      // Ескі rate limit жазбаларын тазалау
      // (processIncomingMessage ішіндегі Map автоматты тазаланады)
    });

    logger.info('Cron жұмыстары іске қосылды');
  } catch (қате) {
    logger.error(`Cron қатесі: ${қате.message}`);
  }
}
