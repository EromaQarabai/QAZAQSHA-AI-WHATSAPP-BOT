// Хабарламадан деректерді шығару
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Қосылды: viewOnceMessage, ephemeralMessage, buttonsResponseMessage,
//          listResponseMessage, templateMessage, image/video captions,
//          documentWithCaptionMessage
// ─────────────────────────────────────────────────────────────────────────────
import { logger } from '../utils/logger.js';

/**
 * Хабарлама мазмұнын барлық wrapper типтерінен шығару
 */
function unwrapMessage(хабарлама) {
  if (!хабарлама?.message) return {};

  const msg = хабарлама.message;

  // Ephemeral (жойылатын хабарлама) — ішкі хабарды аламыз
  if (msg.ephemeralMessage?.message) {
    return unwrapMessage({ message: msg.ephemeralMessage.message });
  }

  // ViewOnce (бір рет қаралатын)
  if (msg.viewOnceMessage?.message) {
    return unwrapMessage({ message: msg.viewOnceMessage.message });
  }

  // ViewOnceMessageV2
  if (msg.viewOnceMessageV2?.message) {
    return unwrapMessage({ message: msg.viewOnceMessageV2.message });
  }

  // DocumentWithCaption
  if (msg.documentWithCaptionMessage?.message) {
    return unwrapMessage({ message: msg.documentWithCaptionMessage.message });
  }

  // EditedMessage
  if (msg.editedMessage?.message) {
    return unwrapMessage({ message: msg.editedMessage.message });
  }

  // Мәтін
  const мәтін =
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    msg.audioMessage?.caption ||
    msg.buttonsResponseMessage?.selectedDisplayText ||
    msg.listResponseMessage?.title ||
    msg.templateButtonReplyMessage?.selectedDisplayText ||
    msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
    '';

  // Медиа типі
  const тип =
    msg.imageMessage            ? 'image'    :
    msg.videoMessage            ? 'video'    :
    msg.audioMessage            ? 'audio'    :
    msg.stickerMessage          ? 'sticker'  :
    msg.documentMessage         ? 'document' :
    msg.locationMessage         ? 'location' :
    msg.contactMessage          ? 'contact'  :
    msg.reactionMessage         ? 'reaction' : 'text';

  // Цитата (replied message) — контекст үшін
  const цитата = msg.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || null;

  return { мәтін, тип, цитата };
}

export function extractMessageData(хабарлама) {
  try {
    const remoteJid = хабарлама.key?.remoteJid || '';

    // ── Телефонды дұрыс шығару ──────────────────────────────────────────────
    let телефон;
    if (remoteJid.endsWith('@g.us')) {
      // Группа: жіберушінің нөмірін аламыз
      const sender =
        хабарлама.key?.participant ||
        хабарлама.key?.senderPn ||
        хабарлама.senderPn ||
        хабарлама.participant ||
        '';
      телефон = sender.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0] ||
                remoteJid.split('@')[0];
    } else if (remoteJid.endsWith('@lid')) {
      const sender =
        хабарлама.key?.senderPn ||
        хабарлама.senderPn ||
        хабарлама.key?.participant ||
        '';
      телефон = sender.replace('@s.whatsapp.net', '').split(':')[0] ||
                remoteJid.split('@')[0].split(':')[0];
    } else {
      // Тікелей чат
      телефон = remoteJid.split('@')[0].split(':')[0];
    }

    const { мәтін, тип, цитата } = unwrapMessage(хабарлама);
    const группа = remoteJid.endsWith('@g.us');

    return {
      телефон,
      remoteJid,
      мәтін,
      тип,
      цитата,
      группа,
      уақыт: хабарлама.messageTimestamp
        ? Number(хабарлама.messageTimestamp) * 1000
        : Date.now(),
      ид: хабарлама.key?.id || null,
    };
  } catch (қате) {
    logger.error(`Хабарлама шығару қатесі: ${қате.message}`);
    return {
      телефон: null, remoteJid: null, мәтін: '',
      тип: 'text', цитата: null, группа: false,
      уақыт: Date.now(), ид: null,
    };
  }
}

export function isOwner(телефон, settings) {
  try {
    if (!телефон) return false;
    const normalA = телефон.replace(/[^0-9]/g, '');
    const normalB = (settings.OWNER_PHONE || '').replace(/[^0-9]/g, '');
    return normalA === normalB && normalA.length > 5;
  } catch {
    return false;
  }
}
