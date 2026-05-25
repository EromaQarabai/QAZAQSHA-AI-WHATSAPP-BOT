// settings.js синхрондау
import { settings } from '../config/settings.js';
import { logger } from '../src/utils/logger.js';
import { broadcastUpdate } from '../src/dashboard-api/websocket-server.js';

export function syncSetting(кілт, мән) {
  try {
    if (кілт in settings) {
      settings[кілт] = мән;
      broadcastUpdate(кілт, мән);
      logger.info(`Параметр синхрондалды: ${кілт} = ${мән}`);
      return true;
    }
    return false;
  } catch (қате) {
    logger.error(`Синхрондау қатесі: ${қате.message}`);
    return false;
  }
}
