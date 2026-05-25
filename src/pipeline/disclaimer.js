// Дисклеймер қосу (3 бос жол + қалың)
import { settings } from '../../config/settings.js';

export function injectDisclaimer(мәтін) {
  try {
    if (!settings.DISCLAIMER_ENABLED) return мәтін;

    const дисклеймер = '\n\n\n**Бұл жауаптарды QazaQsha AI жазуда. QazaQsha — бұл Жасанды Интеллект. Қателесуі мүмкін.**';

    // Барлық барлық дисклеймерлерді тазалау
    const таза = мәтін.replace(/\n*\*?\*?Бұл жауаптарды.*?\*?\*?/g, '');
    return таза + дисклеймер;
  } catch (қате) {
    // Қорғаныс жолы: дисклеймерсіз қайтару
    return мәтін || '';
  }
}
