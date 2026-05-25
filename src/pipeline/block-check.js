// block.json тексеру
import fs from 'fs';
import { logger } from '../utils/logger.js';
import { normalizePhone } from '../utils/phone-normalizer.js';

let блокТізім = new Set();

export function loadBlocklist(жол) {
  try {
    if (fs.existsSync(жол)) {
      const дерек = JSON.parse(fs.readFileSync(жол, 'utf8'));
      if (Array.isArray(дерек)) {
        блокТізім = new Set(дерек.map((н) => normalizePhone(н)).filter(Boolean));
      }
    }
    logger.info(`Блоктізім жүктелді: ${блокТізім.size} нөмір`);
  } catch (қате) {
    logger.error(`Блоктізім қатесі: ${қате.message}`);
    // Қорғаныс жолы: бос тізім
    блокТізім = new Set();
  }
}

export function isBlocked(телефон) {
  try {
    const нормал = normalizePhone(телефон);
    if (!нормал) return false;
    return блокТізім.has(нормал);
  } catch (қате) {
    logger.error(`Блок тексеру қатесі: ${қате.message}`);
    return false;
  }
}

export function addToBlocklist(телефон, жол) {
  try {
    const нормал = normalizePhone(телефон);
    if (!нормал) return false;
    блокТізім.add(нормал);
    fs.writeFileSync(жол, JSON.stringify([...блокТізім], null, 2));
    logger.info(`Блокталды: ${нормал}`);
    return true;
  } catch (қате) {
    logger.error(`Блоктау қатесі: ${қате.message}`);
    return false;
  }
}

export function removeFromBlocklist(телефон, жол) {
  try {
    const нормал = normalizePhone(телефон);
    if (!нормал) return false;
    блокТізім.delete(нормал);
    fs.writeFileSync(жол, JSON.stringify([...блокТізім], null, 2));
    logger.info(`Блоктан шығарылды: ${нормал}`);
    return true;
  } catch (қате) {
    logger.error(`Блоктан шығару қатесі: ${қате.message}`);
    return false;
  }
}
