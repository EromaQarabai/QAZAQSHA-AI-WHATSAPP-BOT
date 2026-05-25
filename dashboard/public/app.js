// QazaQsha Dashboard — App Logic

let currentMood = 'Positive';
let busyReason = null;

// ─── Clock ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('kk-KZ', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
setInterval(updateClock, 1000);
updateClock();

// ─── Particles ────────────────────────────────────────────────────────────────
(function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 8}s;
      animation-duration: ${6 + Math.random() * 8}s;
      background: ${Math.random() > .5 ? '#00f5ff' : '#a855f7'};
    `;
    container.appendChild(p);
  }
})();

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ─── Log ──────────────────────────────────────────────────────────────────────
function addLog(msg) {
  const area = document.getElementById('logArea');
  area.querySelector('.log-placeholder')?.remove();
  const entry = document.createElement('span');
  entry.className = 'log-entry';
  const now = new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  entry.textContent = `[${now}] ${msg}`;
  area.appendChild(entry);
  area.appendChild(document.createElement('br'));
  area.scrollTop = area.scrollHeight;
}

// ─── Load Stats ───────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const [statsRes, settingsRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/settings'),
    ]);
    const stats = await statsRes.json();
    const cfg = await settingsRes.json();

    document.getElementById('statToday').textContent = stats.userCount ?? '—';
    document.getElementById('statUsers').textContent = stats.totalUsers ?? '—';
    document.getElementById('statResponse').textContent = stats.avgResponseTime ? `${stats.avgResponseTime}с` : '—';
    document.getElementById('statTotal').textContent = stats.totalMessages ?? '—';

    // Status badge
    const badge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const pulse = badge.querySelector('.pulse');
    if (cfg.AI_ONLINE) {
      statusText.textContent = 'ОНЛАЙН';
      pulse.style.background = '#22c55e';
    } else {
      statusText.textContent = 'ОФФЛАЙН';
      pulse.style.background = '#ef4444';
    }

    // AI Toggle
    document.getElementById('aiToggle').checked = cfg.AI_ONLINE;

    // Mood
    currentMood = cfg.AI_MOOD || 'Positive';
    updateMoodUI();

    // Lang bars
    animateBar('barKk', 'pctKk', stats.kk || 0);
    animateBar('barRu', 'pctRu', stats.ru || 0);
    animateBar('barEn', 'pctEn', stats.en || 0);

    document.getElementById('mostActive').textContent = `🏆 ${stats.mostActive || '—'}`;
  } catch (e) {
    addLog('❌ Статистика жүктеу қатесі');
  }
}

function animateBar(barId, pctId, value) {
  setTimeout(() => {
    document.getElementById(barId).style.width = `${value}%`;
    document.getElementById(pctId).textContent = `${value}%`;
  }, 200);
}

function updateMoodUI() {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mood === currentMood);
  });
}

// ─── Toggle AI ────────────────────────────────────────────────────────────────
async function toggleAI(val) {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'AI_ONLINE', value: val }),
    });
    addLog(val ? '✅ AI Онлайн' : '⏸️ AI Оффлайн');
    showToast(val ? '✅ Бот қосылды' : '⏸️ Бот тоқтатылды', val ? 'success' : 'info');
    loadStats();
  } catch (e) {
    showToast('❌ Қате!', 'error');
  }
}

// ─── Set Mood ─────────────────────────────────────────────────────────────────
async function setMood(mood) {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'AI_MOOD', value: mood }),
    });
    currentMood = mood;
    updateMoodUI();
    addLog(`😊 Көңіл-күй: ${mood}`);
    showToast(`✅ Көңіл-күй: ${mood}`, 'success');
  } catch (e) {
    showToast('❌ Қате!', 'error');
  }
}

// ─── Busy Reason ──────────────────────────────────────────────────────────────
async function setBusyReason() {
  const reason = document.getElementById('busyReasonInput').value.trim();
  if (!reason) { showToast('⚠️ Себепті жазыңыз', 'info'); return; }
  try {
    await fetch('/api/busy-reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    busyReason = reason;
    document.getElementById('busyReasonDisplay').textContent = reason;
    document.getElementById('busyCurrent').style.display = 'flex';
    addLog(`📝 Себеп: ${reason}`);
    showToast('✅ Себеп орнатылды!', 'success');
  } catch (e) {
    showToast('❌ Қате!', 'error');
  }
}

async function clearBusyReason() {
  try {
    await fetch('/api/busy-reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: null }),
    });
    busyReason = null;
    document.getElementById('busyReasonInput').value = '';
    document.getElementById('busyCurrent').style.display = 'none';
    addLog('🗑️ Себеп тазаланды');
    showToast('✅ Себеп тазаланды', 'success');
  } catch (e) {
    showToast('❌ Қате!', 'error');
  }
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function refreshStats() {
  addLog('🔄 Жаңартылуда...');
  loadStats().then(() => showToast('✅ Жаңартылды', 'success'));
}

async function createBackup() {
  addLog('💾 Backup жасалуда...');
  showToast('💾 Backup жасалуда...', 'info');
  try {
    const r = await fetch('/api/backup', { method: 'POST' });
    const data = await r.json();
    addLog(data.path ? `✅ Backup: ${data.path}` : '⚠️ Backup қатесі');
    showToast(data.path ? '✅ Backup дайын' : '⚠️ Backup қатесі', data.path ? 'success' : 'error');
  } catch (e) {
    showToast('❌ Қате!', 'error');
  }
}

async function restartBot() {
  if (!confirm('Ботты қайта іске қосасыз ба?')) return;
  addLog('🔁 Restart...');
  showToast('🔁 Перезапуск...', 'info');
  try {
    await fetch('/api/restart', { method: 'POST' });
  } catch (e) { /* expected */ }
}

function openDocs() {
  window.open('https://github.com/whiskeysockets/baileys', '_blank');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
loadStats();
setInterval(loadStats, 30000);
addLog('🚀 QazaQsha Dashboard іске қосылды');
