// WebSocket сервер (барлық клиенттерге жаңарту)
import { WebSocketServer } from 'ws';
import { logger } from '../utils/logger.js';

let wss = null;

export function startWebSocketServer(сервер) {
  try {
    wss = new WebSocketServer({ server: сервер });

    wss.on('connection', (клиент) => {
      logger.info('Dashboard клиент қосылды');

      клиент.on('message', (хабар) => {
        try {
          const дерек = JSON.parse(хабар);
          if (дерек.type === 'settings_update') {
            broadcastUpdate(дерек.key, дерек.value);
          }
        } catch (қате) {
          logger.error(`WebSocket хабарлама қатесі: ${қате.message}`);
        }
      });

      клиент.on('close', () => {
        logger.info('Dashboard клиент ажыратылды');
      });
    });

    logger.info('WebSocket сервері іске қосылды');
    return wss;
  } catch (қате) {
    logger.error(`WebSocket қатесі: ${қате.message}`);
    return null;
  }
}

export function broadcastUpdate(кілт, мән) {
  try {
    if (!wss) return;
    const хабар = JSON.stringify({ type: 'settings_update', key: кілт, value: мән });
    wss.clients.forEach((клиент) => {
      if (клиент.readyState === 1) {
        клиент.send(хабар);
      }
    });
  } catch (қате) {
    logger.error(`Broadcast қатесі: ${қате.message}`);
  }
}
