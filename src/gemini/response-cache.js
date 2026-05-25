// Жауап кэші — бірдей хабарларға API шақырмаймыз
// TTL: 5 минут. Телефон + мәтін кілті.

const кэш = new Map(); // key → { response, expiresAt }
const TTL_MS = 5 * 60 * 1000; // 5 минут

// Кілт: телефон + хабарлама (кіші әрпке түсіріп, бос орындарды тазалаймыз)
function buildKey(телефон, мәтін) {
  return `${телефон}::${мәтін.toLowerCase().trim().slice(0, 100)}`;
}

export function getCached(телефон, мәтін) {
  const кілт = buildKey(телефон, мәтін);
  const жазба = кэш.get(кілт);
  if (!жазба) return null;
  if (Date.now() > жазба.expiresAt) {
    кэш.delete(кілт);
    return null;
  }
  return жазба.response;
}

export function setCached(телефон, мәтін, жауап) {
  // Ұзын немесе бірегей хабарларды кэштемейміз (>200 символ)
  if (мәтін.length > 200) return;
  const кілт = buildKey(телефон, мәтін);
  кэш.set(кілт, { response: жауап, expiresAt: Date.now() + TTL_MS });
}

// Ескі жазбаларды тазалау (5 минут сайын)
setInterval(() => {
  const қазір = Date.now();
  for (const [кілт, жазба] of кэш) {
    if (қазір > жазба.expiresAt) кэш.delete(кілт);
  }
}, TTL_MS);
