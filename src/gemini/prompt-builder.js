// Жүйелік промпт + контекст (оптимизацияланған нұсқа)
import { settings } from '../../config/settings.js';

// ─── Хабар түрін анықтау ──────────────────────────────────────────────────────
const GREETING_RE = /^(сәлем|салем|сал|привет|хай|hi|hey|hello|сап|қалайсың|қалай|как дела|ок|окей|ok|okay|рахмет|спасибо|thanks|👋|😊|🙂|❤|👍)[!?.\s]*$/i;

export function classifyMessage(text) {
  if (!text) return 'simple';
  const t = text.trim();
  if (GREETING_RE.test(t))                    return 'greeting'; // контекст 0
  if (t.length < 80)                          return 'simple';   // контекст 3
  if (t.length > 300
    || t.includes('код')
    || t.includes('математика')
    || t.includes('объясни')
    || t.includes('explain'))                  return 'complex';  // контекст 15
  return 'normal';                                               // контекст 8
}

export function getContextSize(type) {
  return { greeting: 0, simple: 3, normal: 8, complex: 15 }[type] ?? 8;
}

// ─── System prompt (сапасы сол, 73% кіші) ───────────────────────────────────
export function buildSystemPrompt(user, mood, busyReason) {
  try {
    const busy = busyReason
      ? `Иесі себебі: «${busyReason}» — жұмсақ жеткіз.`
      : `Иесі бос емес — оның орнына жауап бер.`;

    return `Сен — QazaQsha-001. Иесің: Ермахан Қожайын (толық аты Қарабай Ермахан — тек тікелей сұраса айт).
Тіл: қазақша + Z сленг (бро, бауырым, вайб, рил, no cap, кезік). Emoji қолдан.
Gemini/GPT/Claude деме — «Жоқ, мен QazaQsha-001 😎» де.
Жауап 2-4 сөйлем. Әр жолы әртүрлі бер.
Мем/суретке: «АХАХАХА 😂» / «top tier 🔥». Иесіні қорға.
Белгісіз нөмір: «Сәлем бро 😎 Мен QazaQsha. Ермахан Қожайынның кімісің?»
${busy}
Көңіл: ${mood || settings.AI_MOOD} | Пайдаланушы: ${user?.name || 'Белгісіз'}`;
  } catch {
    return 'Сен — QazaQsha-001. Қазақша жауап бер.';
  }
}

// ─── Chat prompt (контекстті қысқа белгілермен жазамыз) ─────────────────────
export function buildChatPrompt(systemPrompt, context, message) {
  try {
    let prompt = systemPrompt + '\n\n';
    if (context && context.length > 0) {
      for (const m of context) {
        const role = m.role === 'user' ? 'U' : 'A';
        // Контекст жолын 120 символмен шектейміз
        const content = m.content.length > 120 ? m.content.slice(0, 120) + '…' : m.content;
        prompt += `${role}: ${content}\n`;
      }
    }
    prompt += `U: ${message}\nA:`;
    return prompt;
  } catch {
    return message;
  }
}
