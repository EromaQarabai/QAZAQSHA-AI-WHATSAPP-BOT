// Логгер: консоль → адамға түсінікті қазақша | файл → толық техникалық ақпарат
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(process.cwd(), 'logs', 'qazaqsha.log');

// Logs папкасын жасау
try { fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true }); } catch {}

// ─── Консольдегі адамға арналған хабарлар ───────────────────────────────────
// null = мүлдем жасыру (тым жиі немесе техникалық)
// string = адамға арналған баламасы
const CONSOLE_MAP = {
  // Іске қосу
  'JSON деректер қоры іске қосылды':    '✅ Деректер қоры дайын',
  'WhatsApp клиенті инициализацияланды': '✅ WhatsApp қосылуда...',
  'Telegram бот іске қосылды':           '✅ Telegram дайын',
  'Cron жұмыстары іске қосылды':         '✅ Автожұмыстар іске қосылды',
  'QazaQsha-001 іске қосылды':           '🚀 QazaQsha-001 дайын!',
  'Gemini клиент іске қосылды':           null,
  'Блоктізім жүктелді':                  null,

  // WhatsApp қосылым
  '📱 QR код сканерлеу керек':           '📱 QR кодты сканерлеңіз (WhatsApp → Байланысқан құрылғылар)',
  '✅ Қосылды':                          '✅ WhatsApp сәтті қосылды!',
  '🔄 Қайта қосылу':                    '🔄 Желі үзілді, қайта қосылуда...',
  '❌ Сессия жойылды':                   '❌ Сессия аяқталды — QR қайта сканерлеңіз',
  '❌ Қайта қосылу сәтсіз':             '❌ Қосылу мүмкін болмады — боты қолмен іске қосыңыз',
  'WhatsApp қосылды':                    null,  // Telegram хабары, консольге керек емес

  // Жұмыс
  'Жауап берілді':                        null,
  'Блокталған нөмір':                    null,
  'Барлық кілттер лимитте':             '⏳ API лимиті — хабар кезекке қосылды',
  'Қайталанған жауап':                   null,
  'AI_OFFLINE':                           null,

  // Қателер
  'Кезек оқу қатесі':       '⚠️  Кезек уақытша қолжетімсіз',
  'Кезек қатесі':           '⚠️  Кезекке қосу сәтсіз',
  'Кезек жаңарту қатесі':   null,
  'Негізгі өңдеу қатесі':   '❌ Хабар өңдеу қатесі',
  'Деректер қоры қатесі':   '❌ Деректер қоры қатесі',
  'Тазалау қатесі':         '⚠️  Түнгі тазалау орындалмады',
  'Күндік есеп қатесі':     '⚠️  Күндік есеп жіберілмеді',
  'Cron қатесі':            '⚠️  Автожұмыс қатесі',
  'WhatsApp қосылу қатесі': '⚠️  WhatsApp қосылу мәселесі, қайта тырысылуда...',
};

function getConsoleMessage(text) {
  for (const [key, val] of Object.entries(CONSOLE_MAP)) {
    if (text.includes(key)) return val;
  }
  return text;
}

function writeToFile(level, text, extra) {
  try {
    const entry = JSON.stringify({
      time: new Date().toISOString(),
      level,
      msg: text,
      ...(extra && typeof extra === 'object' ? { detail: extra } : {})
    });
    fs.appendFileSync(LOG_FILE, entry + '\n');
  } catch {}
}

const CLR = {
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  reset:  '\x1b[0m'
};

function consoleLog(level, text) {
  const human = getConsoleMessage(text);
  if (human === null) return;
  const color = level === 'error' ? CLR.red
               : level === 'warn'  ? CLR.yellow
               : level === 'debug' ? CLR.cyan
               : CLR.green;
  console.log(`${color}${human}${CLR.reset}`);
}

export function log(level, text, extra) {
  consoleLog(level, text);
  writeToFile(level, text, extra);
}

export const logger = {
  info:  (msg, extra) => log('info',  msg, extra),
  warn:  (msg, extra) => log('warn',  msg, extra),
  error: (msg, extra) => log('error', msg, extra),
  debug: (msg, extra) => log('debug', msg, extra),
};

// ─── Baileys кітапхана логтарын тек файлға бұру ─────────────────────────────
// Консольге ешнәрсе шықпайды — тек маңызды жағдайларда ғана.
// «failed to find key», «failed to sync», «Timed Out», «stream errored out» —
// бұлардың БАРЛЫҒЫ қалыпты жаңа сессия мінез-құлқы. Файлда сақталады.
export function patchBaileysLogger() {
  const silent = (obj, msg) => {
    const m = msg ?? (typeof obj === 'object' ? (obj?.msg ?? '') : String(obj ?? ''));
    writeToFile('trace', m, typeof obj === 'object' ? obj : undefined);
  };

  return {
    level: 'silent',
    trace: silent,
    debug: (obj, msg) => {
      const m = msg ?? (typeof obj === 'object' ? (obj?.msg ?? '') : String(obj ?? ''));
      writeToFile('debug', m, typeof obj === 'object' ? obj : undefined);
    },
    info: (obj, msg) => {
      const m = msg ?? (typeof obj === 'object' ? (obj?.msg ?? '') : String(obj ?? ''));
      writeToFile('info', m, typeof obj === 'object' ? obj : undefined);
      // Тек осы 2 хабарды консольге шығару
      if (m?.includes('connected to WA')) console.log(`${CLR.green}✅ WhatsApp серверіне жалғанды${CLR.reset}`);
      if (m?.includes('opened connection')) console.log(`${CLR.green}📶 WhatsApp желісі ашылды${CLR.reset}`);
    },
    warn: (obj, msg) => {
      const m = msg ?? (typeof obj === 'object' ? (obj?.msg ?? '') : String(obj ?? ''));
      writeToFile('warn', m, typeof obj === 'object' ? obj : undefined);
    },
    error: (obj, msg) => {
      const m = msg ?? (typeof obj === 'object' ? (obj?.msg ?? '') : String(obj ?? ''));
      writeToFile('error', m, typeof obj === 'object' ? obj : undefined);
      // Жалған қателерді консольге шығармау
      const SILENT_ERRORS = [
        'failed to sync', 'failed to find key',
        'Timed Out', 'stream errored', 'Connection Terminated',
        "unexpected error in 'init queries'", 'tried remove, but no previous op',
        'no name present',
      ];
      if (SILENT_ERRORS.some(e => m?.includes(e))) return;
      // Шынайы қатені ғана шығару
      console.log(`${CLR.red}❌ WhatsApp қатесі (лог файлда): ${m}${CLR.reset}`);
    },
    child: function() { return this; },
  };
}
