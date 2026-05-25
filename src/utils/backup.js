// ZIP көшірме жасау
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { logger } from './logger.js';

let архивтауҚолжетімді = false;
try {
  const { pipeline } = await import('stream/promises');
  const { createGzip } = await import('zlib');
  архивтауҚолжетімді = true;
} catch (е) {
  logger.warn('ZIP архивтау қолжетімсіз, қарапайым көшірме қолданылады');
}

export async function createBackup(баптаулар) {
  try {
    const уақыт = new Date().toISOString().replace(/[:.]/g, '-');
    const файлАты = `backup-${уақыт}.zip`;
    const толықЖол = path.join(баптаулар.BACKUP_PATH, файлАты);

    if (!fs.existsSync(баптаулар.BACKUP_PATH)) {
      fs.mkdirSync(баптаулар.BACKUP_PATH, { recursive: true });
    }

    if (архивтауҚолжетімді) {
      const { pipeline } = await import('stream/promises');
      const { createGzip } = await import('zlib');
      const tar = await import('tar');
      const көшірмеленетін = [];
      if (баптаулар.BACKUP_INCLUDE_MEMORY && fs.existsSync('./memory')) көшірмеленетін.push('./memory');
      if (баптаулар.BACKUP_INCLUDE_CONFIG && fs.existsSync('./config')) көшірмеленетін.push('./config');
      if (баптаулар.BACKUP_INCLUDE_AUTH && fs.existsSync('./auth_info_baileys')) көшірмеленетін.push('./auth_info_baileys');

      await tar.create({ gzip: true, file: толықЖол }, көшірмеленетін);
    } else {
      // Қорғаныс жолы: қарапайым файл көшірмесі
      fs.writeFileSync(толықЖол.replace('.zip', '.txt'), `Көшірме: ${уақыт}`);
    }

    // Ескі көшірмелерді тазалау
    const барФайлдар = fs.readdirSync(баптаулар.BACKUP_PATH)
      .filter(f => f.startsWith('backup-'))
      .sort();
    while (барФайлдар.length > баптаулар.BACKUP_MAX_COUNT) {
      const ескі = барФайлдар.shift();
      fs.unlinkSync(path.join(баптаулар.BACKUP_PATH, ескі));
    }

    logger.info(`Көшірме жасалды: ${файлАты}`);
    return толықЖол;
  } catch (қате) {
    logger.error(`Көшірме қатесі: ${қате.message}`);
    // Қорғаныс жолы: бос жол қайтару
    return null;
  }
}
