// Телефон нөмірін нормализациялау — E.164 форматы
// ─── ТҮЗЕТІЛДІ ────────────────────────────────────────────────────────────────
// Бұрын: 77760711033 (11 цифр, 7-ден басталса) → null қайтарды
// Шешім: +7 преfiks автоматты қосылды
// ─────────────────────────────────────────────────────────────────────────────

export function normalizePhone(нөмір) {
  try {
    if (!нөмір || typeof нөмір !== 'string') return null;

    // WhatsApp JID бөліктерін тазалау
    let таза = нөмір
      .replace('@s.whatsapp.net', '')
      .replace('@g.us', '')
      .replace('@lid', '')
      .split(':')[0]        // "77760711033:8" → "77760711033"
      .replace(/[^0-9+]/g, '');

    if (!таза) return null;

    // 8 → +7 (ресейше/қазақстандық)
    if (таза.startsWith('8') && таза.length === 11) {
      таза = '+7' + таза.slice(1);
    }

    // Жетекші + жоқ болса
    if (!таза.startsWith('+')) {
      if (таза.length === 10) {
        // 7771234567 → +77771234567
        таза = '+7' + таза;
      } else if (таза.length === 11 && таза.startsWith('7')) {
        // ✅ ТҮЗЕТІЛДІ: 77760711033 → +77760711033
        таза = '+' + таза;
      } else if (таза.length >= 7) {
        // Басқа халықаралық нөмірлер
        таза = '+' + таза;
      } else {
        return null;
      }
    }

    return таза;
  } catch (қате) {
    return нөмір || null;
  }
}

// Нөмірді жасыру (+77071234567 → +7707...4567)
export function maskPhone(нөмір) {
  try {
    if (!нөмір || нөмір.length < 8) return '***';
    return нөмір.slice(0, 5) + '...' + нөмір.slice(-4);
  } catch {
    return '***';
  }
}

// Екі нөмірді салыстыру (форматтан тәуелсіз)
export function phonesMatch(а, б) {
  try {
    const нА = normalizePhone(String(а || ''));
    const нБ = normalizePhone(String(б || ''));
    if (!нА || !нБ) return false;
    // +77760711033 === +77760711033
    return нА === нБ;
  } catch {
    return false;
  }
}
