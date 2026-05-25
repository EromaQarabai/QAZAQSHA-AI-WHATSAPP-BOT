// Сурет/аудио жүктеу және өңдеу
import { logger } from '../utils/logger.js';
import { settings } from '../../config/settings.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export async function downloadMedia(сокет, хабарлама) {
  try {
    const медиаМесседж =
      хабарлама.message?.imageMessage ||
      хабарлама.message?.audioMessage ||
      хабарлама.message?.stickerMessage ||
      хабарлама.message?.videoMessage ||
      хабарлама.message?.documentMessage ||
      хабарлама.message?.viewOnceMessage?.message?.imageMessage ||
      хабарлама.message?.viewOnceMessage?.message?.videoMessage;

    if (!медиаМесседж) return null;

    // Baileys-тың downloadMediaMessage утилитасын пайдалану
    const буфер = await downloadMediaMessage(
      хабарлама,
      'buffer',
      {},
      { logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, trace: () => {} } },
    );
    if (!буфер) return null;

    const мб = буфер.length / (1024 * 1024);
    if (мб > (settings.MEDIA_MAX_SIZE_MB || 10)) {
      logger.warn(`Медиа тым үлкен: ${мб.toFixed(2)} МБ`);
      return null;
    }

    return буфер;
  } catch (қате) {
    logger.error(`Медиа жүктеу қатесі: ${қате.message}`);
    return null;
  }
}

export async function processImage(буфер) {
  try {
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch {
      logger.warn('Sharp қолжетімсіз, медиа өңделмейді');
      return буфер;
    }
    const maxW = settings.MEDIA_IMAGE_MAX_WIDTH || 1024;
    return await sharp(буфер)
      .resize(maxW, maxW, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (қате) {
    logger.error(`Сурет өңдеу қатесі: ${қате.message}`);
    return буфер;
  }
}

export async function processAudio(буфер) {
  // FFmpeg жоқ болса буферді өзгертпей қайтарамыз
  try {
    const ffmpeg = await import('fluent-ffmpeg').then((m) => m.default).catch(() => null);
    const ffmpegPath = await import('ffmpeg-static').then((m) => m.default).catch(() => null);
    if (!ffmpeg || !ffmpegPath) {
      return буфер;
    }
    ffmpeg.setFfmpegPath(ffmpegPath);
    return буфер; // Аудио өңдеу — қосымша логика қажет болса қосылады
  } catch {
    return буфер;
  }
}
