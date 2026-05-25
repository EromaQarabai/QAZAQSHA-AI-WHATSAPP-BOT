/**
 * QazaQsha-001 Конфигурация Файлы
 * Барлық параметрлер қазақша түсіндірілген
 * Telegram бот және Admin Dashboard арқылы өзгертуге болады
 */

import dotenv from 'dotenv';
dotenv.config();

export const settings = {
  // ========== ЖИ НЕГІЗІ (AI Core) ==========
  AI_ONLINE: true, // boolean: Боттың негізгі қосқышы. true=жұмыс істейді, false=тек иесі жауап береді
  AI_MODEL_SIMPLE: 'gemini-2.5-flash-lite', // string: Қарапайым сөйлесуге (15 RPM, 1000 RPD)
  AI_MODEL_MEDIA: 'gemini-2.5-flash', // string: Сурет/аудио талдауға (10 RPM, 250 RPD, мультимодал)
  AI_MODEL_COMPLEX: 'gemini-2.5-pro', // string: Күрделі тапсырмаларға (5 RPM, 100 RPD)
  AI_TEMPERATURE: 0.85, // number: 0.0-1.0. Жоғары = шығармашылық көп. Gen Z үшін 0.85+
  AI_TOP_P: 0.95, // number: Nucleus sampling. 0.95 = әртүрлі бірақ мағыналы
  AI_TOP_K: 40, // number: Top-k шектеуі
  AI_MAX_TOKENS: 2048, // number: Жауаптың максималды ұзындығы (токен)
  AI_MOOD: 'Positive', // string: Негізгі көңіл-күй. Мұмкін: Positive|Chill|Sarcastic|Energetic|Supportive

  // ========== ИЕСІ (Owner Identity) ==========
  OWNER_PHONE: process.env.OWNER_PHONE || '+77773332211', // string: Иесінің WhatsApp нөмірі (E.164)
  OWNER_FULL_NAME: 'Qarabai Ermahan', // string: Заңды толық аты
  OWNER_SHORT_NAME: 'Ermahan', // string: Күнделікті атау
  OWNER_TITLE: 'Қожайын', // string: AI иесін қалай атайды
  OWNER_NICKNAME: 'Ермахан Қожайын', // string: Баламалы атау
  OWNER_PERSONALITY: 'Kind, busy, tech enthusiast, helpful', // string: AI иесінің мінезін білу үшін
  OWNER_PROTECT_MODE: true, // boolean: true=иесін қорғау, false=бейтарап

  // ========== WHATSAPP (WhatsApp Config) ==========
  WA_SESSION_PATH: './auth_info_baileys', // string: Сессия сақталатын папка
  WA_PRINT_QR: true, // boolean: Терминалда QR кодты көрсету
  WA_QR_TIMEOUT: 60000, // number: QR сканерлеу уақыты (миллисекунд)
  WA_RECONNECT_INTERVAL: 5000, // number: Қайта қосылу кідірісі (мс)
  WA_READ_RECEIPTS: false, // boolean: Хабарламаларды автоматты оқылды деп белгілеу
  WA_TYPING_INDICATOR: true, // boolean: "жазуда..." индикаторын көрсету
  WA_TYPING_DELAY_MIN: 1000, // number: Ең аз жазу кідірісі (мс)
  WA_TYPING_DELAY_MAX: 3000, // number: Ең көп жазу кідірісі (мс)

  // ========== GEMINI 5 КІЛТ (Gemini 5-Key Rotation) ==========
  GEMINI_KEY_1: process.env.GEMINI_KEY_1, // string: 1-ші Google аккаунт API кілті
  GEMINI_KEY_2: process.env.GEMINI_KEY_2, // string: 2-ші Google аккаунт API кілті
  GEMINI_KEY_3: process.env.GEMINI_KEY_3, // string: 3-ші Google аккаунт API кілті
  GEMINI_KEY_4: process.env.GEMINI_KEY_4, // string: 4-ші Google аккаунт API кілті
  GEMINI_KEY_5: process.env.GEMINI_KEY_5, // string: 5-ші Google аккаунт API кілті
  GEMINI_FLASH_LITE_RPM: 15, // number: 1 кілттің минуттық лимиті (flash-lite)
  GEMINI_FLASH_LITE_RPD: 1000, // number: 1 кілттің тәуліктік лимиті (flash-lite)
  GEMINI_FLASH_RPM: 10, // number: 1 кілттің минуттық лимиті (flash)
  GEMINI_FLASH_RPD: 250, // number: 1 кілттің тәуліктік лимиті (flash)
  GEMINI_PRO_RPM: 5, // number: 1 кілттің минуттық лимиті (pro)
  GEMINI_PRO_RPD: 100, // number: 1 кілттің тәуліктік лимиті (pro)
  GEMINI_TPM_LIMIT: 250000, // number: Барлық кілттер үшін ортақ TPM лимиті
  GEMINI_RATE_LIMIT_BUFFER: 0.9, // number: Лимиттің тек 90%-ын қолдану (қауіпсіздік)
  GEMINI_RETRY_MAX: 3, // number: Бір кілтке максималды қайта әрекет саны
  GEMINI_RETRY_DELAY: 1000, // number: Қайта әрекет кідірісі (мс)

  // ========== ЖАД (Memory) ==========
  MEMORY_ENABLED: true, // boolean: Жад жүйесінің негізгі қосқышы
  MEMORY_DB_PATH: './memory/qazaqsha.db', // string: SQLite деректер қоры жолы
  MEMORY_MAX_HISTORY: 50, // number: Бір пайдаланушыға сақталатын хабарлама саны
  MEMORY_CONTEXT_WINDOW: 20, // number: Gemini-ге жіберілетін соңғы хабарлама саны
  MEMORY_SUMMARY_THRESHOLD: 30, // number: Осыдан көп болса ескі хабарламаларды қорытындылау
  MEMORY_RETENTION_DAYS: 90, // number: Хабарламаларды сақтау мерзімі (күн)
  MEMORY_PROFILE_AUTOUPDATE: true, // boolean: Профильді автоматты жаңарту
  MEMORY_SAVE_INTERVAL: 300000, // number: Автоматты сақтау аралығы (мс, 5 минут)

  // ========== ТІЛ (Language) ==========
  LANG_PRIMARY: 'kk', // string: Негізгі тіл коды (kk = қазақша)
  LANG_SECONDARY: ['ru', 'en'], // string[]: Қолданылатын қосымша тілдер
  LANG_SLANG_ENABLED: true, // boolean: Gen Z сленгін рұқсат ету
  LANG_EMOJI_DENSITY: 'medium', // string: Emoji тығыздығы. Мұмкін: none|low|medium|high
  LANG_CODE_SWITCHING: true, // boolean: Бір сөйлемде тіл араластыру
  LANG_FORMALITY: 'casual', // string: Қатысу стилі. Мұмкін: formal|neutral|casual|street

  // ========== ҚАУІПСІЗДІК (Security) ==========
  SECURITY_BLOCKLIST_ENABLED: true, // boolean: block.json тексеруін қосу
  SECURITY_BLOCKLIST_PATH: './config/block.json', // string: Блоктізім файлы
  SECURITY_LOG_LEVEL: 'info', // string: Лог деңгейі. Мұмкін: debug|info|warn|error|silent
  SECURITY_MASK_PHONE_IN_LOGS: true, // boolean: Логта нөмірлерді жасыру (+7...4567)
  SECURITY_MAX_MESSAGE_LENGTH: 4000, // number: Максималды хабарлама ұзындығы
  SECURITY_RATE_LIMIT_PER_MINUTE: 20, // number: Бір пайдаланушыдан минуттық лимит
  SECURITY_RATE_LIMIT_COOLDOWN: 60000, // number: Лимиттен кейін кідіріс (мс)
  SECURITY_PROMPT_INJECTION_CHECK: true, // boolean: Prompt injection тексеруі
  SECURITY_FORBIDDEN_WORDS: ['ignore previous instructions', 'system prompt', 'you are now DAN', 'jailbreak'], // string[]: Тыйым салынған тіркестер

  // ========== МЕДИА (Media) ==========
  MEDIA_IMAGE_ENABLED: true, // boolean: Суреттерді өңдеу
  MEDIA_AUDIO_ENABLED: true, // boolean: Аудио хабарламаларды өңдеу
  MEDIA_STICKER_ENABLED: true, // boolean: Стикерлерді өңдеу
  MEDIA_VIDEO_ENABLED: false, // boolean: Видеоларды өңдеу (ауыр)
  MEDIA_MAX_SIZE_MB: 10, // number: Максималды файл өлшемі (МБ)
  MEDIA_MEME_REACTION: true, // boolean: Мемге арнайы реакция
  MEDIA_IMAGE_MAX_WIDTH: 1024, // number: Суретті кішірейту ені (Gemini үшін)
  MEDIA_AUDIO_MAX_DURATION: 300, // number: Максималды аудио ұзындығы (секунд)

  // ========== ГРУППА (Group Chat) ==========
  GROUP_DEFAULT_SILENT: true, // boolean: Группаларда үнсіздік режимі
  GROUP_TRIGGER_WORD: '/erom', // string: Триггер сөзі
  GROUP_TRIGGER_CASE_SENSITIVE: false, // boolean: Регистрге сезімталдығы

  // ========== ДИСКЛЕЙМЕР (Disclaimer) ==========
  DISCLAIMER_ENABLED: true, // boolean: Міндетті астыңғы жазу
  DISCLAIMER_TEXT: 'Бұл жауаптарды QazaQsha AI жазуда. QazaQsha — бұл Жасанды Интеллект. Қателесуі мүмкін.', // string
  DISCLAIMER_BOLD: true, // boolean: Қалың шрифт (markdown)
  DISCLAIMER_EMPTY_LINES: 3, // number: Дисклеймерге дейінгі бос жолдар саны

  // ========== СЕНТИМЕНТ ҚОРҒАНЫСЫ (Sentiment Guard) ==========
  SENTIMENT_GUARD_ENABLED: true, // boolean: Автоматты көңіл-күй ауыстыру
  SENTIMENT_GUARD_THRESHOLD: 10, // number: Негативті хабарлама шегі
  SENTIMENT_GUARD_OVERRIDE_MOOD: 'Supportive', // string: Ауыстырылатын көңіл-күй
  SENTIMENT_GUARD_KEYWORDS_KK: ['дұрыс емес', 'нашар', 'өлі', 'қас', 'жек көремін', 'ұнамайды'], // string[]
  SENTIMENT_GUARD_KEYWORDS_RU: ['плохо', 'ненавижу', 'убей', 'дурак', 'идиот'], // string[]
  SENTIMENT_GUARD_KEYWORDS_EN: ['hate', 'kill', 'stupid', 'idiot', 'bad'], // string[]

  // ========== АВТОЖАУАП УАҚЫТЫ (Auto-Reply Hours) ==========
  AUTO_REPLY_ENABLED: true, // boolean: Түнгі автожауапты қосу
  AUTO_REPLY_START: '23:00', // string: Басталу уақыты (HH:MM)
  AUTO_REPLY_END: '08:00', // string: Аяқталу уақыты (HH:MM)
  AUTO_REPLY_MESSAGE: 'Бро, Қожайын қазір ұйықтап жатыр 😴. Таңертең қайта жаз!', // string
  AUTO_REPLY_TIMEZONE: 'Asia/Almaty', // string: Уақыт белдеуі

  // ========== КЕЗЕК ЖҮЙЕСІ (Message Queue) ==========
  QUEUE_ENABLED: true, // boolean: Хабарлама кезегін қосу
  QUEUE_MAX_SIZE: 100, // number: Максималды кезек өлшемі
  QUEUE_RETRY_INTERVAL: 60000, // number: Кезекті тексеру аралығы (мс)
  QUEUE_WAIT_MESSAGE: 'Бро, қазір лимит, 1 минут күте тұр 🔥', // string

  // ========== ҚАЙТАЛАУДЫ БОЛДЫРМАУ (Duplicate Prevention) ==========
  DUPLICATE_PREVENTION_ENABLED: true, // boolean: Қайталанған жауаптарды болдырмау
  DUPLICATE_CACHE_SIZE: 50, // number: Сақталатын соңғы жауаптар саны
  DUPLICATE_SIMILARITY_THRESHOLD: 0.9, // number: Ұқсастық шегі (0-1)

  // ========== ТЕЛЕГРАМ БОТ (Telegram Admin Bot) ==========
  TELEGRAM_ENABLED: true, // boolean: Телеграм ботты қосу
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN, // string: BotFather токені
  TELEGRAM_OWNER_ID: process.env.TELEGRAM_OWNER_ID, // string: Иесінің Telegram ID
  TELEGRAM_NOTIFY_ERRORS: true, // boolean: Қателерді автоматты жіберу
  TELEGRAM_NOTIFY_WARNINGS: true, // boolean: Ескертулерді автоматты жіберу
  TELEGRAM_NOTIFY_INFO: false, // boolean: Ақпаратты автоматты жіберу (тек /info командасымен)
  TELEGRAM_DAILY_REPORT: true, // boolean: Күн сайын 23:59 есеп жіберу
  TELEGRAM_DAILY_REPORT_TIME: '23:59', // string: Есеп уақыты

  // ========== АДМИН ПАНЕЛЬ (Admin Dashboard) ==========
  ADMIN_ENABLED: true, // boolean: Веб-панельді қосу
  ADMIN_PORT: 3000, // number: HTTP порт
  ADMIN_PASSWORD: 'Eroma1410', // string: Панель паролі (өзгерту керек!)
  ADMIN_WS_ENABLED: true, // boolean: WebSocket екі жақты байланыс
  ADMIN_THEME: 'dark', // string: Тема. Мұмкін: dark|light
  ADMIN_REFRESH_RATE: 5000, // number: Жаңарту жиілігі (мс)

  // ========== КӨШІРМЕ (Backup) ==========
  BACKUP_ENABLED: true, // boolean: Автоматты көшірме
  BACKUP_INTERVAL_HOURS: 48, // number: Автоматты көшірме аралығы (сағат)
  BACKUP_PATH: './backups/', // string: Көшірме папкасы
  BACKUP_MAX_COUNT: 30, // number: Сақталатын соңғы көшірмелер саны
  BACKUP_INCLUDE_MEMORY: true, // boolean: SQLite қорын қосу
  BACKUP_INCLUDE_CONFIG: true, // boolean: Конфигурацияны қосу
  BACKUP_INCLUDE_AUTH: true, // boolean: Сессияны қосу

  // ========== ҚАТЕЛІК (Fallback) ==========
  ERROR_FALLBACK_MESSAGE: 'Ой, бро, қазір басым қатып тұр 😅. Қайта жазып көрші!', // string: Барлық API бос емес кезде
  ERROR_MAX_RETRIES: 3, // number: Максималды қайта әрекет
  ERROR_TIMEOUT_MS: 15000, // number: API күту уақыты (мс)
  ERROR_NOTIFY_OWNER: true, // boolean: Иесіне қате туралы хабарлау

  // ========== СТАТИСТИКА (Stats) ==========
  STATS_ENABLED: true, // boolean: Статистика жинау
  STATS_TRACK_LANGUAGES: true, // boolean: Тіл статистикасын жинау
  STATS_TRACK_RESPONSE_TIME: true, // boolean: Жауап уақытын өлшеу
  STATS_TRACK_ACTIVE_HOURS: true, // boolean: Белсенді сағаттарды жинау

  // ========== ЖОСПАРЛАНҒАН ХАБАРЛАМАЛАР (Scheduled Messages) ==========
  SCHEDULE_ENABLED: true, // boolean: Жоспарлау жүйесі
  SCHEDULE_MAX_FUTURE_DAYS: 30, // number: Максималды болашақ уақыт (күн)

  // ========== КӨПТЕГЕН КОМАНДАЛАР (Advanced Commands) ==========
  CMD_BROADCAST_ENABLED: true, // boolean: /broadcast командасы
  CMD_SILENT_ENABLED: true, // boolean: /silent командасы
  CMD_SCHEDULE_ENABLED: true, // boolean: /schedule командасы
  CMD_RESTART_ENABLED: true, // boolean: /restart командасы

  // ========== ҚОСЫМША/ЭКСПЕРИМЕНТАЛДЫ (Advanced/Experimental) ==========
  EXPERIMENTAL_FEATURES: false, // boolean: Эксперименталды функциялар
  DEBUG_MODE: false, // boolean: Жөндеу режимі (көп лог)
  PERFORMANCE_MONITORING: true, // boolean: Өнімділікті бақылау
};
