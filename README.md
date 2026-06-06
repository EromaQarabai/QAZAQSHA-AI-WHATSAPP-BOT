<div align="center">

```
  ██████╗  █████╗ ███████╗ █████╗  ██████╗ ███████╗██╗  ██╗ █████╗
 ██╔═══██╗██╔══██╗╚══███╔╝██╔══██╗██╔═══██╗██╔════╝██║  ██║██╔══██╗
 ██║   ██║███████║  ███╔╝ ███████║██║   ██║███████╗███████║███████║
 ██║▄▄ ██║██╔══██║ ███╔╝  ██╔══██║██║▄▄ ██║╚════██║██╔══██║██╔══██║
 ╚██████╔╝██║  ██║███████╗██║  ██║╚██████╔╝███████║██║  ██║██║  ██║
  ╚══▀▀═╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚══▀▀═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

<h1>🤖 QazaQsha-001

**Қазақ тілінде сөйлейтін ЖИ бот — WhatsApp × Telegram × Dashboard**</h1>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/whiskeysockets/baileys)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-Admin-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/BotFather)

<br/>

> _Мен — QazaQsha. Сенің цифрлық дос, AI-помощник._ 🔥

</div>

---

## ✨ Мүмкіндіктер

| 🎯 Мүмкіндік | 📝 Сипаттама |
|---|---|
| 🇰🇿 Қазақ тілі | Z-ұрпақ стилінде, сленгпен |
| 🤖 Google Gemini 2.5 | Flash + Pro + Lite — 5 кілт ротациясы |
| 📱 WhatsApp | Baileys арқылы толық интеграция |
| 🤖 Telegram Admin | Инлайн кнопкалармен толық басқару |
| 🌐 Dashboard | Футуристік веб-интерфейс |
| 💾 JSON Database | SQLite-сыз, C++ жоқ — lowdb |
| 🧠 Контекст жады | 90 күндік чат тарихы |
| 🔄 Auto-reconnect | WhatsApp үзілді → автоматты қайта қосылу |
| ⏰ Кезек жүйесі | API лимитте → хабарлама кезекке |
| 🔒 Блоктізім | Нөмірлерді блоктау/блоктан шығару |
| 📊 Статистика | Тіл, белсенділік, жауап уақыты |
| 📝 `/me` команда | Неге бос емес екеніңді AI-ге айту |
| 📲 Иесі кірді | Қожайын WhatsApp-қа кірсе автохабар |

---

## 🚀 Жылдам Іске Қосу

### 1. Тәуелділіктерді орнату

```bash
npm install
```

### 2. `.env` файлын толтыру

```bash
cp .env.example .env
# .env файлын редактор арқылы ашыңыз
```

### 3. Іске қосу

```bash
npm start
```

### 4. WhatsApp-ты қосу

```
📱 QR код консольде шығады
WhatsApp → Байланысқан құрылғылар → QR код сканерлеу
```

### 5. Dashboard

```
🌐 http://localhost:3000
```

---

## ⚙️ `.env` Конфигурация

```env
# ─── Google Gemini API ─────────────────────────────
GEMINI_KEY_1=AIza...
GEMINI_KEY_2=AIza...
GEMINI_KEY_3=AIza...
GEMINI_KEY_4=AIza...
GEMINI_KEY_5=AIza...

# ─── Telegram ──────────────────────────────────────
TELEGRAM_BOT_TOKEN=1234567890:AAF...
TELEGRAM_OWNER_ID=123456789

# ─── Иесі ──────────────────────────────────────────
OWNER_PHONE=+7XXXXXXXXXX
OWNER_FULL_NAME=Қарабай Ермахан
OWNER_SHORT_NAME=Ермахан

# ─── Dashboard ─────────────────────────────────────
ADMIN_PORT=3000
```

---

## 📱 Командалар

### WhatsApp (Иесіге ғана)

| Команда | Сипаттама |
|---|---|
| `/stop` | AI-ді өшіру |
| `/online` | AI-ді қосу |
| `/status` | Бот күйін тексеру |
| `/mood positive` | Көңіл-күй өзгерту |
| `/me Жиналыста` | Неге бос емес екенін айту |
| `/block +77001234567` | Нөмірді блоктау |
| `/unblock +77001234567` | Блоктан шығару |

### Telegram Admin Bot

| Команда | Сипаттама |
|---|---|
| `/start` | Негізгі мәзір |
| `/status` | Бот күйі |
| `/info` | Статистика |
| `/online` `/offline` | AI басқару |
| `/mood <тип>` | Көңіл-күй |
| `/me <себеп>` | Бос емес себебі |
| `/backup` | Деректер көшірмесі |
| `/restart` | Қайта іске қосу |
| `/help` | Барлық командалар |

---

## 🌐 Dashboard

Веб-интерфейс **http://localhost:3000** арқылы:

- ✅ AI-ді қосу/өшіру
- 😊 Көңіл-күй таңдау
- 📝 "Неге бос емессің?" себебін жазу
- 📊 Нақты уақыт статистикасы
- 🌍 Тіл статистикасы
- 💾 Backup жасау

---

## 🏗️ Жоба Құрылымы

```
QazaQsha/
├── src/
│   ├── index.js              # Кіру нүктесі
│   ├── gemini/               # AI роутер (5 кілт)
│   ├── memory/               # JSON деректер қоры
│   ├── pipeline/             # Хабарлама өңдеу
│   ├── whatsapp/             # Baileys интеграция
│   ├── dashboard-api/        # REST API
│   └── utils/                # Утилиттер
├── telegram-bot/             # Admin бот
├── dashboard/                # Веб-интерфейс
│   └── public/               # HTML + CSS + JS
├── config/
│   └── settings.js           # Конфигурация
├── memory/
│   └── qazaqsha.json         # Деректер қоры
├── .env                      # Жасырын айнымалылар
└── package.json
```

---

## 🔄 `/me` Команда — AI Хабардар

Иесі бос болмаса, AI-ге себебін жеткізіңіз:

```
# WhatsApp-та:
/me Дәрісте, 2 сағаттан кейін жазамын

# Telegram-да:
/me Жиналыста, кешкі 6-да бос боламын

# Dashboard-та:
"Неге бос емессің?" → Мәтін жазыңыз → Орнату
```

Сонда AI пайдаланушыға айтады:
> *"Ермахан Қожайын қазір дәрісте, 2 сағаттан кейін жазамын дейді. Мен оның орнына жауап беріп тұрмын! 😎"*

---

## 📲 Иесі WhatsApp-қа Кірді → Автохабар

Иесі WhatsApp-қа кірген кезде соңғы 30 минут ішінде сөйлесіп жатқан адамға автоматты хабар жіберіледі:

> *"📲 Қожайын WhatsApp-қа кірді! Мен енді кетейін 👋"*

## 📡 Әлеуметтік Желілер

<div align="center">

| Платформа | Сілтеме |
|---|---|
| 📱 TikTok | [@qarabai.ermahan](https://www.tiktok.com/@qarabai.ermahan) |
| ✈️ Telegram | [@QarabaiErmahan](https://t.me/QarabaiErmahan) |
| 📸 Instagram | [@qarabai.ermahan](https://www.instagram.com/qarabai.ermahan) |

</div>

---
<div align="center">

<h3>
  ***Ескерту:
  Baileys-бейресми WhatsApp API.
  WhatsApp аккаунтыңызда бан болу қаупі бар.
  Негізгі нөмеріңізбен пайдаланбаңыз.***
</h3>
---

<div align="center">

**Жасаған:** Қарабай Ермахан  
**Бот:** QazaQsha-001  
**Тіл:** Қазақ Z сленгпен 🇰🇿 + Орыс 🇷🇺 Және Ағылшын 🇬🇧

*QazaQsha — бұл Жасанды Интеллект.*

</div>
