// Инлайн пернелер менюі
export function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 Статистика', callback_data: 'stats' }, { text: '🤖 Күй', callback_data: 'status' }],
        [{ text: '▶️ Қосу', callback_data: 'online' }, { text: '⏸️ Өшіру', callback_data: 'offline' }],
        [{ text: '😊 Көңіл-күй', callback_data: 'mood' }, { text: '💾 Backup', callback_data: 'backup' }],
        [{ text: '🔄 Restart', callback_data: 'restart' }, { text: '❓ Көмек', callback_data: 'help' }],
      ],
    },
  };
}

export function getMoodMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '😊 Positive', callback_data: 'positive' }, { text: '😎 Chill', callback_data: 'chill' }],
        [{ text: '😏 Sarcastic', callback_data: 'sarcastic' }, { text: '⚡ Energetic', callback_data: 'energetic' }],
        [{ text: '🤗 Supportive', callback_data: 'supportive' }],
        [{ text: '🔙 Артқа', callback_data: 'start' }],
      ],
    },
  };
}

export function getStatusMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '▶️ Қосу', callback_data: 'online' }, { text: '⏸️ Өшіру', callback_data: 'offline' }],
        [{ text: '🔙 Артқа', callback_data: 'start' }],
      ],
    },
  };
}
