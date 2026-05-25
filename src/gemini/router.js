// 5 кілт ақылды ротациясы
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Бұрын: 'gemini-2.5-flash-lite'.includes('flash') → key3,key4 де flash-lite үшін таңдалды
// Шешім: нақты модель мен кілт сәйкестігі
// ─────────────────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from '@google/generative-ai';
import { settings } from '../../config/settings.js';
import { logger } from '../utils/logger.js';
import { initKeyStats, trackKeyUsage, isKeyAvailable, markKeyUnhealthy } from './rate-tracker.js';

// Кілт → модель топтары
const кілтТізім = [
  { id: 'key1', кілт: settings.GEMINI_KEY_1, топтар: ['flash-lite', 'flash', 'pro'] },
  { id: 'key2', кілт: settings.GEMINI_KEY_2, топтар: ['flash-lite', 'flash', 'pro'] },
  { id: 'key3', кілт: settings.GEMINI_KEY_3, топтар: ['flash-lite', 'flash', 'pro'] },
  { id: 'key4', кілт: settings.GEMINI_KEY_4, топтар: ['flash-lite', 'flash', 'pro'] },
  { id: 'key5', кілт: settings.GEMINI_KEY_5, топтар: ['flash-lite', 'flash', 'pro'] },
];

const клиенттер = new Map();

export function initGeminiClients() {
  // ✅ ТҮЗЕТІЛДІ: initKeyStats шақыру
  initKeyStats();

  let қосылды = 0;
  for (const { id, кілт } of кілтТізім) {
    if (кілт && кілт.length > 10) {
      клиенттер.set(id, new GoogleGenerativeAI(кілт));
      қосылды++;
    }
  }
  logger.info(`Gemini клиенттері іске қосылды: ${қосылды}/5`);
}

export async function callGemini(модельАты, промпт, мазмұн) {
  // Модель деңгейлері (жоғарыдан төмен)
  const модельДеңгей = [
    settings.AI_MODEL_COMPLEX,   // gemini-2.5-pro
    settings.AI_MODEL_MEDIA,     // gemini-2.5-flash
    settings.AI_MODEL_SIMPLE,    // gemini-2.5-flash-lite
  ];

  const бастаИндекс = модельДеңгей.indexOf(модельАты);
  const іздеуЖол = бастаИндекс >= 0 ? модельДеңгей.slice(бастаИндекс) : [модельАты, ...модельДеңгей];

  for (const модель of іздеуЖол) {
    for (const { id } of кілтТізім) {
      if (!клиенттер.has(id)) continue;
      if (!isKeyAvailable(id, модель)) continue;

      try {
        const клиент = клиенттер.get(id);
        const моделіОбъект = клиент.getGenerativeModel({
          model: модель,
          generationConfig: {
            temperature: settings.AI_TEMPERATURE,
            topP: settings.AI_TOP_P,
            topK: settings.AI_TOP_K,
            maxOutputTokens: settings.AI_MAX_TOKENS,
          },
        });

        const нәтиже = await моделіОбъект.generateContent(промпт);
        const мәтін = нәтиже.response.text();

        trackKeyUsage(id, модель, (мазмұн?.length || 0) + (мәтін?.length || 0));

        if (модель !== модельАты) {
          logger.info(`Модель fallback: ${модельАты} → ${модель} (${id})`);
        }

        return мәтін;
      } catch (қате) {
        // Rate limit немесе quota → кілтті белгіле, жалғас
        if (қате.message?.includes('429') || қате.message?.includes('quota') || қате.message?.includes('RESOURCE_EXHAUSTED')) {
          markKeyUnhealthy(id);
          logger.warn(`Кілт ${id} лимитте: ${қате.message?.slice(0, 60)}`);
        } else {
          logger.warn(`Кілт ${id} / ${модель} қате: ${қате.message?.slice(0, 60)}`);
        }
        continue;
      }
    }
  }

  logger.error('Барлық кілттер лимитте немесе қолжетімсіз');
  return null;
}

export function hasAnyAvailableKey() {
  for (const { id } of кілтТізім) {
    if (клиенттер.has(id) && isKeyAvailable(id, settings.AI_MODEL_SIMPLE)) return true;
  }
  return false;
}
