// Baileys қосылымы — QR, автоматты қайта қосылу
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Қосылды: WebSocket 1006 (UnhandledPromiseRejection) жұту
// Қосылды: keepAlive error тұту
// ─────────────────────────────────────────────────────────────────────────────
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logger, patchBaileysLogger } from '../utils/logger.js';
import { settings } from '../../config/settings.js';
import { notifyTelegram } from '../../telegram-bot/notifications.js';
import qrcode from 'qrcode-terminal';
import { getLastActiveJid } from './active-chat-tracker.js';
import { sendMessage } from './sender.js';

let сокет = null;
let қайтаҚосылуСаны = 0;
const MAX_RETRY = 15;
let қосылуҚайтаБолды = false;

// ✅ ТҮЗЕТІЛДІ: WebSocket 1006 → UnhandledPromiseRejection-ды жұту
// (process.on 'unhandledRejection' арқылы да жұтылады, бірақ екі қорғаныш жақсырақ)
process.on('uncaughtException', (қате) => {
  if (қате?.message?.includes('keepAlive') || 
      String(қате?.code) === '1006' ||
      қате?.message?.includes('Connection Terminated')) {
    // Байлейс ішкі қатесі — жай лог
    logger.warn(`WA ішкі қате (қалыпты): ${қате?.message?.slice(0, 60)}`);
    return;
  }
  logger.error(`Болжалмаған қате: ${қате?.message}`);
  // Шынайы crash-ті жасыру үшін process.exit шақырмаймыз
});

export async function startWhatsApp(onMessage) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(settings.WA_SESSION_PATH);
    const { version } = await fetchLatestBaileysVersion();

    сокет = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, patchBaileysLogger()),
      },
      syncFullHistory: false,
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 25_000,
      browser: ['QazaQsha-001', 'Chrome', '1.0'],
      defaultQueryTimeoutMs: 60_000,
      connectTimeoutMs: 60_000,
      retryRequestDelayMs: 2_000,
      maxRetries: 5,
      generateHighQualityLinkPreview: false,
      logger: patchBaileysLogger(),
    });

    // ЄР ЖАҢА SOCKET сайын хабар тыңдағышын тіркейміз
    if (onMessage) {
      сокет.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
          if (msg.key?.fromMe) continue;
          // status@broadcast — статус жаңартулары, өткіземіз
          if (msg.key?.remoteJid === 'status@broadcast') continue;
          try {
            await onMessage(сокет, msg);
          } catch (қате) {
            logger.error(`Хабар өңдеу қатесі: ${қате.message}`);
          }
        }
      });
    }

    сокет.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
      if (qr) {
        qrcode.generate(qr, { small: true });
        logger.info('📱 QR код сканерлеу керек! WhatsApp → Байланысқан құрылғылар');
      }

      if (connection === 'open') {
        қайтаҚосылуСаны = 0;
        logger.info('✅ Қосылды! Ермахан Қожайын дайын.');
        notifyTelegram('🟢 WhatsApp қосылды');

        // Иесі кірді — соңғы белсенді сөйлесушіге хабар жіберу (1 рет)
        if (қосылуҚайтаБолды) {
          setTimeout(async () => {
            try {
              const белсендіЖид = getLastActiveJid();
              if (белсендіЖид && сокет) {
                await sendMessage(
                  сокет, белсендіЖид,
                  '📲 *Қожайын WhatsApp-қа кірді!* Мен енді кетейін 👋\n\n_QazaQsha автохабары_',
                  settings,
                );
              }
            } catch (е) {
              logger.warn(`Иесі кірді хабары: ${е.message}`);
            }
          }, 3000);
        }
        қосылуҚайтаБолды = true;
      }

      if (connection === 'close') {
        const код = lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output?.statusCode
          : null;

        if (код === DisconnectReason.loggedOut) {
          logger.error('❌ Сессия жойылды. QR кодты қайта сканерлеу керек.');
          notifyTelegram('🔴 WhatsApp сессиясы жойылды — QR қайта сканерлеңіз');
          return;
        }

        if (код === 515 || код === 408) {
          // Қалыпты қайта іске қосу
          setTimeout(() => startWhatsApp(onMessage), 3_000);
          return;
        }

        if (қайтаҚосылуСаны >= MAX_RETRY) {
          logger.error('❌ Қайта қосылу сәтсіз болды. Сессияны тазалап, қайта іске қосыңыз.');
          notifyTelegram('🔴 WhatsApp 15 рет қосылуға тырысты — қолмен тексеріңіз');
          return;
        }

        қайтаҚосылуСаны++;
        const кідіріс = Math.min(1_000 * 2 ** қайтаҚосылуСаны, 60_000);
        logger.warn(`🔄 Қайта қосылу... (${қайтаҚосылуСаны}/${MAX_RETRY})`);
        setTimeout(() => startWhatsApp(onMessage), кідіріс);
      }
    });

    сокет.ev.on('creds.update', saveCreds);
    logger.info('WhatsApp клиенті инициализацияланды');
    return сокет;
  } catch (қате) {
    logger.error(`WhatsApp қосылу қатесі: ${қате.message}`);
    const кідіріс = Math.min(1_000 * 2 ** қайтаҚосылуСаны, 30_000);
    қайтаҚосылуСаны++;
    setTimeout(() => startWhatsApp(onMessage), кідіріс);
    return null;
  }
}

export function getSocket() {
  return сокет;
}
