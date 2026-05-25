// Сұрақ күрделілігіне қарай модель таңдау
import { settings } from '../../config/settings.js';

export function selectModel(мәтін, медиаБар, күрделі) {
  try {
    if (медиаБар) {
      return { модель: settings.AI_MODEL_MEDIA, себеп: 'multimodal' };
    }
    if (күрделі || (мәтін && (мәтін.includes('код') || мәтін.includes('математика') || мәтін.length > 500))) {
      return { модель: settings.AI_MODEL_COMPLEX, себеп: 'complex' };
    }
    return { модель: settings.AI_MODEL_SIMPLE, себеп: 'simple' };
  } catch (қате) {
    // Қорғаныс жолы: қарапайым модель
    return { модель: settings.AI_MODEL_SIMPLE, себеп: 'fallback' };
  }
}
