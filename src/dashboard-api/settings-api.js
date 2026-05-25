// settings.js оқу/жазу API (комментарийлерді сақтау)
import fs from 'fs';
import { settings } from '../../config/settings.js';
import { logger } from '../utils/logger.js';

export function loadSettingsFile(жол) {
  try {
    if (!fs.existsSync(жол)) return settings;
    const мазмұн = fs.readFileSync(жол, 'utf8');
    // Кастомды парсер: // жолдарын сақтау керек
    // Бұл JSON.stringify емес, regex-based парсинг
    const жаңаПараметрлер = {};
    const regex = /^(\s*)([A-Z_]+):\s*(.+),?\s*\/\/(.+)$/gm;
    let қатар;
    while ((қатар = regex.exec(мазмұн)) !== null) {
      const аты = қатар[2];
      let мәні = қатар[3].trim();
      if (мәні.startsWith("'") && мәні.endsWith("'")) мәні = мәні.slice(1, -1);
      else if (мәні === 'true') мәні = true;
      else if (мәні === 'false') мәні = false;
      else if (!isNaN(parseFloat(мәні))) мәні = parseFloat(мәні);
      жаңаПараметрлер[аты] = мәні;
    }
    return { ...settings, ...жаңаПараметрлер };
  } catch (қате) {
    logger.error(`Параметрлер оқу қатесі: ${қате.message}`);
    return settings;
  }
}

export function saveSettingsFile(жаңаПараметрлер, жол) {
  try {
    if (!fs.existsSync(жол)) return false;
    let мазмұн = fs.readFileSync(жол, 'utf8');

    for (const [аты, мәні] of Object.entries(жаңаПараметрлер)) {
      const regex = new RegExp(`^([\s]*)${аты}:[\s]*.+,$`, 'm');
      let форматталған;
      if (typeof мәні === 'string') форматталған = `'${мәні}'`;
      else if (typeof мәні === 'boolean') форматталған = мәні;
      else форматталған = мәні;

      мазмұн = мазмұн.replace(regex, `$1${аты}: ${форматталған},`);
    }

    fs.writeFileSync(жол, мазмұн, 'utf8');
    logger.info('Параметрлер сақталды');
    return true;
  } catch (қате) {
    logger.error(`Параметрлер сақтау қатесі: ${қате.message}`);
    return false;
  }
}
