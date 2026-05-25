// API кілттерінің лимиттерін бақылау
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Бұрын: initKeyStats() ешқашан шақырылмады → Map бос → isKeyAvailable=false
//        → бот Gemini шақырмай барлығын кезекке жіберді (НЕГІЗГІ БАГ!)
// Шешім: алғашқы рет кілт сұралғанда автоматты инициализация
// ─────────────────────────────────────────────────────────────────────────────
import { settings } from '../../config/settings.js';
import { logger } from '../utils/logger.js';

const кілтСтатистикасы = new Map();

const ЛИМИТТЕР = {
  'gemini-2.5-flash-lite': { rpm: settings.GEMINI_FLASH_LITE_RPM, rpd: settings.GEMINI_FLASH_LITE_RPD },
  'gemini-2.5-flash':      { rpm: settings.GEMINI_FLASH_RPM,      rpd: settings.GEMINI_FLASH_RPD      },
  'gemini-2.5-pro':        { rpm: settings.GEMINI_PRO_RPM,         rpd: settings.GEMINI_PRO_RPD         },
};

function ensureKeyStats(кілтId) {
  if (!кілтСтатистикасы.has(кілтId)) {
    кілтСтатистикасы.set(кілтId, {
      rpm: 0,
      rpd: 0,
      tpm: 0,
      lastRpmReset: Date.now(),
      lastRpdReset: new Date().toISOString().split('T')[0],
      errors: 0,
      healthy: true,
    });
  }
}

export function initKeyStats() {
  for (let i = 1; i <= 5; i++) {
    ensureKeyStats(`key${i}`);
  }
  logger.info('API кілт статистикасы инициализацияланды');
}

export function isKeyAvailable(кілтId, модельАты) {
  // ✅ ТҮЗЕТІЛДІ: алғашқы рет auto-init
  ensureKeyStats(кілтId);
  const стат = кілтСтатистикасы.get(кілтId);
  if (!стат?.healthy) return false;

  // Лимит белгісіз модель → flash-lite лимитін пайдалану
  const лимитКілт = Object.keys(ЛИМИТТЕР).find((k) => модельАты?.includes(k.replace('gemini-2.5-', ''))) || 'gemini-2.5-flash-lite';
  const лимит = ЛИМИТТЕР[лимитКілт] || ЛИМИТТЕР['gemini-2.5-flash-lite'];

  // RPM тексеру (60 секундтық терезе)
  if (Date.now() - стат.lastRpmReset > 60_000) {
    стат.rpm = 0;
    стат.lastRpmReset = Date.now();
  }

  // RPD тексеру (тәулік)
  const бүгін = new Date().toISOString().split('T')[0];
  if (стат.lastRpdReset !== бүгін) {
    стат.rpd = 0;
    стат.tpm = 0;
    стат.lastRpdReset = бүгін;
  }

  const буфер = settings.GEMINI_RATE_LIMIT_BUFFER || 0.9;
  return стат.rpm < лимит.rpm * буфер && стат.rpd < лимит.rpd * буфер;
}

export function trackKeyUsage(кілтId, модельАты, токенСаны) {
  ensureKeyStats(кілтId);
  const стат = кілтСтатистикасы.get(кілтId);
  if (!стат) return;

  стат.rpm++;
  стат.rpd++;
  стат.tpm += токенСаны || 0;
}

export function markKeyUnhealthy(кілтId) {
  ensureKeyStats(кілтId);
  const стат = кілтСтатистикасы.get(кілтId);
  if (стат) {
    стат.errors++;
    // 3+ қате болса ауру деп белгілеу, 1 минуттан кейін қалпына келтіру
    if (стат.errors >= 3) {
      стат.healthy = false;
      logger.warn(`Кілт ${кілтId} ауру деп белгіленді (${стат.errors} қате)`);
      setTimeout(() => {
        стат.healthy = true;
        стат.errors = 0;
        logger.info(`Кілт ${кілтId} қалпына келтірілді`);
      }, 60_000);
    }
  }
}

export function getHealthyKey(модельАты) {
  for (let i = 1; i <= 5; i++) {
    const кілтId = `key${i}`;
    if (isKeyAvailable(кілтId, модельАты)) return кілтId;
  }
  return null;
}

export function getAllKeyStats() {
  const нәтиже = {};
  for (const [id, стат] of кілтСтатистикасы) {
    нәтиже[id] = { ...стат };
  }
  return нәтиже;
}
