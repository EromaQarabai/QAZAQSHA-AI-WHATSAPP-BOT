// Express сервері — Dashboard
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { settings } from '../config/settings.js';
import { logger } from '../src/utils/logger.js';
import { blockApiRoutes } from '../src/dashboard-api/block-api.js';
import { statsApiRoutes } from '../src/dashboard-api/stats-api.js';
import { getDb } from '../src/memory/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createDashboardServer() {
  try {
    const app = express();
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    // API маршруттары
    blockApiRoutes(app);
    statsApiRoutes(app, getDb());

    app.get('/api/settings', (req, res) => {
      try {
        res.status(200).json({
          AI_ONLINE: settings.AI_ONLINE,
          AI_MOOD: settings.AI_MOOD,
          AI_MODEL_SIMPLE: settings.AI_MODEL_SIMPLE,
          OWNER_PHONE: settings.OWNER_PHONE,
          QUEUE_ENABLED: settings.QUEUE_ENABLED,
        });
      } catch (қате) {
        res.status(500).json({ error: 'Параметрлер қатесі' });
      }
    });

    app.post('/api/settings', (req, res) => {
      try {
        const { key, value } = req.body;
        if (key in settings) settings[key] = value;
        res.status(200).json({ success: true });
      } catch (қате) {
        res.status(500).json({ error: 'Жаңарту қатесі' });
      }
    });

    // /me себебі endpoint
    app.post('/api/busy-reason', (req, res) => {
      try {
        const { reason } = req.body;
        // index.js-тен setBusyReason импорттаймыз
        import('../src/index.js').then(({ setBusyReason }) => {
          setBusyReason(reason || null);
        }).catch(() => {});
        res.status(200).json({ success: true, reason });
      } catch (қате) {
        res.status(500).json({ error: 'Қате' });
      }
    });

    const порт = settings.ADMIN_PORT || 3000;
    app.listen(порт, () => {
      logger.info(`✅ Dashboard іске қосылды: http://localhost:${порт}`);
    });

    return app;
  } catch (қате) {
    logger.error(`Dashboard қатесі: ${қате.message}`);
    return null;
  }
}
