// 90 күн тазалау — lowdb (JSON) нұсқасы
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Бұрын: SQLite .prepare() синтаксисі → crash (база lowdb!)
// Шешім: lowdb API-ын пайдалану
// ─────────────────────────────────────────────────────────────────────────────
import { logger } from '../utils/logger.js';

export async function cleanupOldMessages(дерекқор, күндер) {
  try {
    const шек = Date.now() - (күндер * 86400000);
    const бастапқыСаны = дерекқор.data.messages?.length || 0;

    // lowdb нұсқасы — filter арқылы тазалау
    дерекқор.data.messages = (дерекқор.data.messages || [])
      .filter((m) => m.timestamp > шек);

    // Өңделген кезекті де тазалау (30 күн)
    const кезекШек = Date.now() - (30 * 86400000);
    дерекқор.data.messageQueue = (дерекқор.data.messageQueue || [])
      .filter((m) => m.processed === 0 || m.created_at > кезекШек);

    // Жіберілген жоспарланған хабарларды тазалау
    const жоспарШек = Date.now() - (7 * 86400000);
    дерекқор.data.scheduledMessages = (дерекқор.data.scheduledMessages || [])
      .filter((m) => m.sent === 0 || m.scheduledAt > жоспарШек);

    await дерекқор.write();

    const өшірілді = бастапқыСаны - дерекқор.data.messages.length;
    logger.info(`Ескі хабарламалар тазаланды: ${өшірілді} жазба`);
    return өшірілді;
  } catch (қате) {
    logger.error(`Тазалау қатесі: ${қате.message}`);
    return 0;
  }
}
