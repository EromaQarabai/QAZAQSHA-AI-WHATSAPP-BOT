// Басқа модель аттарын QazaQsha-001 деп ауыстыру
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Бұрын: /\\bAI\\b/ → regex-те \\b = backspace символы (қате!)
// Шешім: /\bAI\b/ — дұрыс сөз шекарасы
// ─────────────────────────────────────────────────────────────────────────────
import { logger } from '../utils/logger.js';

const тыйымСөздер = [
  'gemini', 'google', 'gpt', 'openai', 'claude', 'anthropic',
  'llama', 'meta', 'mistral', 'vertex', 'bard',
];

export function filterOutput(мәтін) {
  try {
    if (!мәтін || typeof мәтін !== 'string') return мәтін || '';

    let нәтиже = мәтін;
    for (const сөз of тыйымСөздер) {
      // new RegExp арқылы \\b дұрыс жұмыс істейді
      const regex = new RegExp(`\\b${сөз}\\b`, 'gi');
      нәтиже = нәтиже.replace(regex, 'QazaQsha-001');
    }

    // ✅ ТҮЗЕТІЛДІ: /\bAI\b/ дұрыс regex literal
    нәтиже = нәтиже.replace(/\bAI\b/g, 'QazaQsha AI');
    нәтиже = нәтиже.replace(/\bartificial intelligence\b/gi, 'QazaQsha AI');
    нәтиже = нәтиже.replace(/\blarge language model\b/gi, 'QazaQsha AI');

    return нәтиже;
  } catch (қате) {
    logger.error(`Фильтр қатесі: ${қате.message}`);
    return мәтін || '';
  }
}
