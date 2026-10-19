/* ═══════════════ Страус.TV — клиентское приложение (Vanilla JS) ═══════════════
 * Обратите внимание: из-за строгой политики безопасности (CSP) здесь нет inline-обработчиков,
 * все события навешиваются через addEventListener.
 */
'use strict';

// ─────────── Иконки ───────────
const ICONS = {
  menu: 'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z',
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  subs: 'M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.53L16 16z',
  like: 'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z',
  dislike: 'M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z',
  upload: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  userCircle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z',
  moon: 'M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z',
  sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 000-2H2a1 1 0 000 2zm18 0h2a1 1 0 000-2h-2a1 1 0 000 2zM11 2v2a1 1 0 002 0V2a1 1 0 00-2 0zm0 18v2a1 1 0 002 0v-2a1 1 0 00-2 0zM5.99 4.58a1 1 0 00-1.41 1.41l1.06 1.06a1 1 0 001.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 00-1.41 1.41l1.06 1.06a1 1 0 001.41-1.41l-1.06-1.06zm1.06-10.96a1 1 0 00-1.41-1.41l-1.06 1.06a1 1 0 001.41 1.41l1.06-1.06zM7.05 18.36a1 1 0 00-1.41-1.41l-1.06 1.06a1 1 0 001.41 1.41l1.06-1.06z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  logout: 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z',
  flag: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
  del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  check: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  library: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z',
  fire: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  eyeOff: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
  eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  share: 'M14 9V3l8 9-8 9v-6c-6 0-10 2-12 6 1-6 4-11 12-12z',
  dash: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  comment: 'M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
  people: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  history: 'M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  login: 'M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z',
  cloud: 'M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z',
  image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
};
const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

// ─────────── Страусиные аватарки (стандартные) ───────────
const PRESET_COLORS = ['#ff7a00', '#e5484d', '#8e4ec6', '#3e63dd', '#0091ff', '#12a594', '#30a46c', '#99d52a', '#f5d90a', '#d6409f', '#6f6e77', '#ad7f58'];
function presetSvg(i) {
  const bg = PRESET_COLORS[i % PRESET_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/>` +
    `<path d="M28 66 C28 50 23 40 29 28" fill="none" stroke="#fff8ef" stroke-width="9" stroke-linecap="round"/>` +
    `<ellipse cx="34" cy="22" rx="10" ry="8.5" fill="#fff8ef"/>` +
    `<path d="M42 18.5 L56 23 L42 27 Z" fill="#ffc98a"/>` +
    `<circle cx="36" cy="19.5" r="2.3" fill="#222"/>` +
    `<path d="M30 14 l-2 -6 M34 13 l0 -6 M38 14 l2 -6" stroke="#fff8ef" stroke-width="2" stroke-linecap="round"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const PRESET_COUNT = PRESET_COLORS.length;
function avatarSrc(a) {
  if (!a) return presetSvg(0);
  const m = /^preset:(\d+)$/.exec(a);
  if (m) return presetSvg(parseInt(m[1], 10));
  return a;
}
const avatarImg = (a, size = 36, extra = '') => `<img class="avatar avatar-${size}" src="${esc(avatarSrc(a))}" alt="" loading="lazy" ${extra}>`;

// ─────────── Утилиты ───────────
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer nofollow" style="color:var(--accent)">$1</a>');

function plural(n, one, few, many) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
  return many;
}
function fmtNum(n) {
  if (n < 1000) return String(n);
  if (n < 1e6) return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace('.', ',').replace(',0', '') + ' тыс.';
  if (n < 1e9) return (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' млн';
  return (n / 1e9).toFixed(1).replace('.', ',') + ' млрд';
}
const fmtViews = (n) => `${fmtNum(n)} ${plural(n, 'просмотр', 'просмотра', 'просмотров')}`;
const fmtSubs = (n) => `${fmtNum(n)} ${plural(n, 'подписчик', 'подписчика', 'подписчиков')}`;
function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  const units = [
    [31536000, 'год', 'года', 'лет'], [2592000, 'месяц', 'месяца', 'месяцев'], [604800, 'неделю', 'недели', 'недель'],
    [86400, 'день', 'дня', 'дней'], [3600, 'час', 'часа', 'часов'], [60, 'минуту', 'минуты', 'минут'],
  ];
  for (const [sec, a, b, c] of units) {
    if (s >= sec) { const n = Math.floor(s / sec); return `${n} ${plural(n, a, b, c)} назад`; }
  }
  return 'только что';
}
const fmtDate = (ts) => new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtDay = (ts) => new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
function fmtDuration(sec) {
  sec = Math.round(sec || 0);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
function fmtBytes(b) {
  if (b < 1024) return b + ' Б';
  const u = ['КБ', 'МБ', 'ГБ', 'ТБ']; let i = -1;
  do { b /= 1024; i++; } while (b >= 1024 && i < u.length - 1);
  return b.toFixed(1).replace('.', ',') + ' ' + u[i];
}
const verifiedMark = (v) => (v ? `<span class="verified" title="Подтверждённый канал">${ic('check')}</span>` : '');
const roleBadge = (r) => (r === 'admin' ? '<span class="role-badge">Админ</span>' : r === 'moderator' ? '<span class="role-badge" style="background:#3e63dd">Модератор</span>' : '');

async function api(url, { method = 'GET', body, form } = {}) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (form) opts.body = form;
  else if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let res;
  try { res = await fetch(url, opts); } catch (e) { throw new Error('Нет соединения с сервером'); }
  let data = {};
  try { data = await res.json(); } catch (e) { /* пустой ответ */ }
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
}

function toast(msg, type = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  $('#toast-root').appendChild(t);
  setTimeout(() => t.remove(), 3800);
}
const toastErr = (e) => toast(e.message || String(e), 'error');

// ─────────── Модальные окна ───────────
function openModal({ title, body, foot = '', cls = '', onClose }) {
  const root = $('#modal-root');
  const back = document.createElement('div');
  back.className = 'modal-backdrop';
  back.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">
    <div class="modal-head"><h2>${title}</h2><button class="icon-btn" data-close aria-label="Закрыть">${ic('close')}</button></div>
    <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
  root.appendChild(back);
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = (e) => { if (e.key === 'Escape' && root.lastElementChild === back) close(); };
  document.addEventListener('keydown', onKey);
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  $$('[data-close]', back).forEach((b) => b.addEventListener('click', close));
  return { el: back, close };
}

function confirmDialog(text, { okText = 'Подтвердить', danger = false } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const m = openModal({
      title: 'Подтверждение',
      body: `<p style="margin:0;white-space:pre-wrap">${esc(text)}</p>`,
      foot: `<button class="btn btn-ghost" data-close>Отмена</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cd-ok">${esc(okText)}</button>`,
      onClose: () => { if (!done) resolve(false); },
    });
    $('#cd-ok', m.el).addEventListener('click', () => { done = true; m.close(); resolve(true); });
    $('#cd-ok', m.el).focus();
  });
}

/** fields: [{name, label, type:'text'|'textarea'|'select'|'password'|'number', value, options:[[v,l]], placeholder, hint}] */
function formDialog(title, fields, { okText = 'Сохранить', danger = false } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const html = fields.map((f) => {
      let input;
      if (f.type === 'textarea') input = `<textarea class="textarea" name="${f.name}" placeholder="${esc(f.placeholder || '')}" maxlength="${f.max || 5000}">${esc(f.value || '')}</textarea>`;
      else if (f.type === 'select') input = `<select class="select" name="${f.name}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(f.value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      else input = `<input class="input" name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" placeholder="${esc(f.placeholder || '')}" maxlength="${f.max || 500}" ${f.type === 'password' ? 'autocomplete="new-password"' : 'autocomplete="off"'}>`;
      return `<div class="field"><label>${esc(f.label)}</label>${input}${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}</div>`;
    }).join('');
    const m = openModal({
      title: esc(title),
      body: `<form id="fd-form">${html}<button type="submit" hidden></button></form>`,
      foot: `<button class="btn btn-ghost" data-close>Отмена</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="fd-ok">${esc(okText)}</button>`,
      onClose: () => { if (!done) resolve(null); },
    });
    const form = $('#fd-form', m.el);
    const submit = (e) => {
      e && e.preventDefault();
      const out = {};
      fields.forEach((f) => { out[f.name] = form.elements[f.name].value; });
      done = true; m.close(); resolve(out);
    };
    form.addEventListener('submit', submit);
    $('#fd-ok', m.el).addEventListener('click', submit);
    const first = form.querySelector('input,textarea,select');
    first && first.focus();
  });
}

// ─────────── Состояние ───────────
const state = { me: null, impersonator: null, settings: {}, subs: [] };
const content = () => $('#content');

async function loadMe() {
  const d = await api('/api/auth/me');
  state.me = d.user;
  state.impersonator = d.impersonator || null;
  state.settings = d.settings || {};
  state.subs = [];
  if (state.me) {
    try { state.subs = (await api('/api/me/subscriptions')).channels; } catch (e) { /* ignore */ }
  }
  renderChrome();
  if (d.warnings && d.warnings.length) showWarnings(d.warnings);
}

function showWarnings(list) {
  const w = list[0];
  const m = openModal({
    title: `${ic('warn')} Предупреждение от администрации`,
    body: `<p style="margin:0 0 8px;white-space:pre-wrap;font-size:15px">${esc(w.text)}</p><p class="muted" style="margin:0;font-size:12px">${fmtDate(w.createdAt)}</p>`,
    foot: '<button class="btn btn-primary" id="w-ok">Понятно</button>',
  });
  $('#w-ok', m.el).addEventListener('click', async () => {
    m.close();
    try { await api(`/api/warnings/${w.id}/seen`, { method: 'POST' }); } catch (e) { /* ignore */ }
    if (list.length > 1) showWarnings(list.slice(1));
  });
}

// ─────────── Шапка, боковая панель ───────────
function renderChrome() {
  $('#menu-btn').innerHTML = ic('menu');
  $('#search-btn').innerHTML = ic('search');
  const theme = document.documentElement.getAttribute('data-theme');
  const right = $('#topbar-right');
  const themeBtn = `<button class="icon-btn ${state.me ? 'theme-btn-auth' : ''}" id="theme-btn" title="${theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}" aria-label="Сменить тему">${ic(theme === 'dark' ? 'sun' : 'moon')}</button>`;
  if (state.me) {
    right.innerHTML = `${themeBtn}
      <a class="icon-btn hide-mobile" href="#/upload" title="Загрузить видео" aria-label="Загрузить видео">${ic('upload')}</a>
      <button class="avatar-btn" id="avatar-btn" aria-label="Меню аккаунта">${avatarImg(state.me.avatar, 32)}</button>`;
    $('#avatar-btn').addEventListener('click', openAccountMenu);
  } else {
    right.innerHTML = `${themeBtn}<a class="btn-signin" href="#/login">${ic('userCircle')}<span>Войти</span></a>`;
  }
  $('#theme-btn').addEventListener('click', toggleTheme);

  // Баннер «вошли под чужим аккаунтом»
  const bar = $('#impersonation-bar');
  if (state.impersonator) {
    bar.hidden = false;
    document.body.classList.add('has-imp');
    bar.innerHTML = `${ic('shield')}<span class="imp-long">Вы управляете аккаунтом <b>@${esc(state.me.username)}</b> от имени администратора @${esc(state.impersonator.username)}</span><span class="imp-short">Вы в аккаунте <b>@${esc(state.me.username)}</b></span><button id="imp-stop">Вернуться к себе</button>`;
    $('#imp-stop').addEventListener('click', async () => {
      try { await api('/api/auth/stop-impersonate', { method: 'POST' }); await loadMe(); toast('Вы вернулись в свой аккаунт'); route(); } catch (e) { toastErr(e); }
    });
  } else {
    bar.hidden = true;
    document.body.classList.remove('has-imp');
  }

  const ann = $('#announcement');
  if (state.settings.announcement) { ann.hidden = false; ann.textContent = state.settings.announcement; } else ann.hidden = true;

  renderSidebar();
}

function renderSidebar() {
  const path = parseHash().path;
  const item = (href, icon, label, extraCls = '') =>
    `<a class="nav-item ${extraCls} ${path === href.slice(1) ? 'active' : ''}" href="${href}">${icon}<span>${esc(label)}</span></a>`;
  let html = item('#/', ic('home'), 'Главная') + item('#/trending', ic('fire'), 'В тренде') + item('#/subscriptions', ic('subs'), 'Подписки');
  html += '<hr class="nav-sep full-only">';
  if (state.me) {
    html += `<div class="nav-title full-only">Вы</div>`;
    html += item(`#/channel/${state.me.id}`, ic('user'), 'Мой канал');
    html += item('#/liked', ic('like'), 'Понравилось');
    html += item('#/upload', ic('upload'), 'Загрузить видео', 'full-only');
    html += item('#/settings', ic('settings'), 'Настройки', 'full-only');
    if (state.subs.length) {
      html += '<hr class="nav-sep full-only"><div class="nav-title full-only">Подписки</div><div class="full-only">';
      html += state.subs.map((c) => `<a class="nav-item ${path === '/channel/' + c.id ? 'active' : ''}" href="#/channel/${c.id}">${avatarImg(c.avatar, 24)}<span>${esc(c.displayName)}</span></a>`).join('');
      html += '</div>';
    }
  } else {
    html += item('#/login', ic('user'), 'Вы');
    html += `<div class="nav-signin full-only">Войдите, чтобы ставить лайки, комментировать и подписываться.<br><a class="btn-signin" href="#/login">${ic('userCircle')}<span>Войти</span></a></div>`;
  }
  html += `<hr class="nav-sep full-only"><div class="nav-footer full-only">
    <a href="#/rules">Правила</a><a href="#/privacy">Конфиденциальность</a><br>
    © ${new Date().getFullYear()} Страус.TV<br>Независимый проект. Не связан с другими видеохостингами.</div>`;
  $('#sidebar').innerHTML = html;
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
  renderChrome();
}

function openAccountMenu(e) {
  e.stopPropagation();
  const existing = $('.menu');
  if (existing) { existing.remove(); return; }
  const me = state.me;
  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.innerHTML = `<div class="menu-head">${avatarImg(me.avatar, 40)}<div><div class="mh-name">${esc(me.displayName)} ${roleBadge(me.role)}</div><div class="mh-user">@${esc(me.username)}</div><a href="#/channel/${me.id}">Перейти на канал</a></div></div>
    <a class="menu-item" href="#/channel/${me.id}">${ic('user')}Мой канал</a>
    <a class="menu-item" href="#/upload">${ic('upload')}Загрузить видео</a>
    <a class="menu-item" href="#/settings">${ic('settings')}Настройки</a>
    <button class="menu-item" data-act="theme">${ic('moon')}Тема: ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'тёмная' : 'светлая'}</button>
    <button class="menu-item" data-act="logout">${ic('logout')}Выйти</button>`;
  document.body.appendChild(menu);
  const r = e.currentTarget.getBoundingClientRect();
  menu.style.top = r.bottom + 8 + 'px';
  menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
  const close = () => { menu.remove(); document.removeEventListener('click', outside); };
  const outside = (ev) => { if (!menu.contains(ev.target)) close(); };
  setTimeout(() => document.addEventListener('click', outside));
  $$('a', menu).forEach((a) => a.addEventListener('click', close));
  $('[data-act="theme"]', menu).addEventListener('click', () => { close(); toggleTheme(); });
  $('[data-act="logout"]', menu).addEventListener('click', async () => {
    close();
    try { await api('/api/auth/logout', { method: 'POST' }); } catch (err) { /* ignore */ }
    await loadMe(); location.hash = '#/'; toast('Вы вышли из аккаунта');
  });
}

// ─────────── Роутер ───────────
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [p, qs] = h.split('?');
  return { path: p || '/', query: new URLSearchParams(qs || '') };
}

const routes = [
  [/^\/$/, pageHome],
  [/^\/trending$/, pageTrending],
  [/^\/watch\/(\d+)$/, pageWatch],
  [/^\/channel\/(\d+)$/, pageChannel],
  [/^\/upload$/, pageUpload],
  [/^\/login$/, pageLogin],
  [/^\/register$/, pageRegister],
  [/^\/settings$/, pageSettings],
  [/^\/subscriptions$/, pageSubscriptions],
  [/^\/liked$/, pageLiked],
  [/^\/search$/, pageSearch],
  [/^\/privacy$/, pagePrivacy],
  [/^\/rules$/, pageRules],
  [/^\/admin$/, () => { location.replace('#/'); setTimeout(openAdmin, 50); }],
];

let routeToken = 0;
async function route() {
  const { path, query } = parseHash();
  const token = ++routeToken;
  document.body.classList.remove('drawer-open');
  const menu = $('.menu'); if (menu) menu.remove();
  renderSidebar();
  window.scrollTo(0, 0);
  if (path !== '/search') $('#search-input').value = '';
  for (const [re, fn] of routes) {
    const m = re.exec(path);
    if (m) {
      try { await fn(...m.slice(1), query, token); } catch (e) { if (token === routeToken) content().innerHTML = errorBlock(e.message); }
      return;
    }
  }
  content().innerHTML = errorBlock('Страница не найдена');
}
const stale = (token) => token !== routeToken;

function errorBlock(msg) {
  return `<div class="empty"><img src="/img/favicon.svg" alt=""><h2>Упс! Страус спрятал голову в песок</h2><p>${esc(msg)}</p><a class="btn btn-primary" href="#/">На главную</a></div>`;
}
const loadingGrid = () => `<div class="grid">${Array.from({ length: 8 }, () => '<div><div class="sk sk-thumb"></div><div class="sk sk-line" style="width:90%"></div><div class="sk sk-line" style="width:60%"></div></div>').join('')}</div>`;
function requireLogin(msg = 'Войдите, чтобы продолжить') {
  if (state.me) return true;
  toast(msg);
  location.hash = `#/login?next=${encodeURIComponent(location.hash.slice(1) || '/')}`;
  return false;
}

// ─────────── Карточки видео ───────────
function thumbHtml(v) {
  const img = v.thumbnail
    ? `<img src="${esc(v.thumbnail)}" alt="" loading="lazy">`
    : `<div class="thumb-ph"><img src="/img/favicon.svg" alt=""></div>`;
  return `<a class="thumb" href="#/watch/${v.id}">${img}${v.duration ? `<span class="duration">${fmtDuration(v.duration)}</span>` : ''}${v.isHidden ? `<span class="badge-hidden">Скрыто модератором</span>` : ''}</a>`;
}
function videoCard(v, { showChannel = true } = {}) {
  return `<div class="card">${thumbHtml(v)}<div class="card-meta">
    ${showChannel ? `<a href="#/channel/${v.channel.id}">${avatarImg(v.channel.avatar, 36)}</a>` : ''}
    <div class="card-text"><a href="#/watch/${v.id}"><h3 class="card-title" title="${esc(v.title)}">${esc(v.title)}</h3></a>
    <div class="card-sub">${showChannel ? `<a href="#/channel/${v.channel.id}">${esc(v.channel.displayName)}</a>${verifiedMark(v.channel.verified)}<br>` : ''}${fmtViews(v.views)} • ${timeAgo(v.createdAt)}</div></div></div></div>`;
}
function compactCard(v) {
  return `<div class="compact">${thumbHtml(v)}<div class="card-text"><a href="#/watch/${v.id}"><h3 class="card-title">${esc(v.title)}</h3></a>
    <div class="card-sub"><a href="#/channel/${v.channel.id}">${esc(v.channel.displayName)}</a>${verifiedMark(v.channel.verified)}<br>${fmtViews(v.views)} • ${timeAgo(v.createdAt)}</div></div></div>`;
}
const emptyFirstVideo = () => `<div class="empty"><img src="/img/favicon.svg" alt="">
  <h2>Здесь пока пусто</h2><p>На Страус.TV ещё никто не загрузил видео. Станьте первым — страусы ждут!</p>
  <a class="btn btn-primary" href="${state.me ? '#/upload' : '#/register'}">${state.me ? 'Загрузить первое видео' : 'Создать аккаунт'}</a></div>`;

// ─────────── Страницы ───────────
async function pageHome(query, token, sort = 'new') {
  content().innerHTML = `<div class="chips">
    <button class="chip ${sort === 'new' ? 'active' : ''}" data-sort="new">Все</button>
    <button class="chip ${sort === 'popular' ? 'active' : ''}" data-sort="popular">Популярные</button>
    ${state.me ? '<a class="chip" href="#/subscriptions" style="display:inline-flex;align-items:center">Подписки</a>' : ''}
  </div><div id="feed">${loadingGrid()}</div>`;
  $$('.chip[data-sort]').forEach((c) => c.addEventListener('click', () => pageHome(query, token, c.dataset.sort)));
  const { videos } = await api(`/api/videos?sort=${sort}`);
  if (stale(token)) return;
  $('#feed').innerHTML = videos.length ? `<div class="grid">${videos.map((v) => videoCard(v)).join('')}</div>` : emptyFirstVideo();
}

async function pageTrending(query, token) {
  content().innerHTML = `<h1 class="section-title">${ic('fire')} В тренде</h1><div id="feed">${loadingGrid()}</div>`;
  const { videos } = await api('/api/videos?sort=popular&limit=50');
  if (stale(token)) return;
  $('#feed').innerHTML = videos.length ? `<div class="grid">${videos.map((v) => videoCard(v)).join('')}</div>` : emptyFirstVideo();
}

async function pageSearch(query, token) {
  const q = query.get('q') || '';
  $('#search-input').value = q;
  content().innerHTML = `<h1 class="section-title">Результаты по запросу «${esc(q)}»</h1><div id="feed">${loadingGrid()}</div>`;
  const { videos } = await api(`/api/videos?q=${encodeURIComponent(q)}`);
  if (stale(token)) return;
  $('#feed').innerHTML = videos.length ? `<div class="grid">${videos.map((v) => videoCard(v)).join('')}</div>`
    : `<div class="empty"><img src="/img/favicon.svg" alt=""><h2>Ничего не найдено</h2><p>Попробуйте другие ключевые слова.</p></div>`;
}

async function pageSubscriptions(query, token) {
  if (!state.me) {
    content().innerHTML = `<div class="empty">${ic('subs')}<h2>Не пропускайте новые видео</h2><p>Войдите, чтобы видеть последние ролики каналов, на которые вы подписаны.</p><a class="btn btn-primary" href="#/login">Войти</a></div>`;
    return;
  }
  content().innerHTML = `<h1 class="section-title">${ic('subs')} Подписки</h1><div id="feed">${loadingGrid()}</div>`;
  const { videos, channels } = await api('/api/me/subscriptions');
  if (stale(token)) return;
  if (!channels.length) { $('#feed').innerHTML = `<div class="empty"><img src="/img/favicon.svg" alt=""><h2>Вы ещё ни на кого не подписаны</h2><p>Откройте любой канал и нажмите «Подписаться».</p><a class="btn btn-primary" href="#/">К видео</a></div>`; return; }
  $('#feed').innerHTML = `<div class="row" style="margin-bottom:24px;gap:16px">${channels.map((c) => `<a href="#/channel/${c.id}" class="row" style="gap:8px">${avatarImg(c.avatar, 32)}<span>${esc(c.displayName)}</span></a>`).join('')}</div>` +
    (videos.length ? `<div class="grid">${videos.map((v) => videoCard(v)).join('')}</div>` : '<p class="muted">На ваших подписках пока нет видео.</p>');
}

async function pageLiked(query, token) {
  if (!requireLogin()) return;
  content().innerHTML = `<h1 class="section-title">${ic('like')} Понравившиеся видео</h1><div id="feed">${loadingGrid()}</div>`;
  const { videos } = await api('/api/me/liked');
  if (stale(token)) return;
  $('#feed').innerHTML = videos.length ? `<div class="grid">${videos.map((v) => videoCard(v)).join('')}</div>` : '<div class="empty"><h2>Пока пусто</h2><p>Ставьте лайки видео — они появятся здесь.</p></div>';
}

// ── Просмотр видео ──
async function pageWatch(id, query, token) {
  content().innerHTML = '<div class="spinner"></div>';
  const [{ video: v }, related] = await Promise.all([
    api(`/api/videos/${id}`),
    api(`/api/videos?exclude=${id}&limit=20`).catch(() => ({ videos: [] })),
  ]);
  if (stale(token)) return;
  document.title = `${v.title} — Страус.TV`;
  const me = state.me;
  const canModerate = me && (me.role === 'admin' || me.role === 'moderator');
  content().innerHTML = `<div class="watch">
    <div class="watch-main">
      <div class="player"><video id="player" controls autoplay playsinline preload="metadata" ${v.thumbnail ? `poster="${esc(v.thumbnail)}"` : ''}><source src="${esc(v.url)}" type="${esc(v.mime)}">Ваш браузер не поддерживает воспроизведение видео.</video></div>
      ${v.isHidden ? `<div class="trust-note" style="margin-top:12px">${ic('eyeOff')}<div>Это видео скрыто модератором и не видно другим пользователям.</div></div>` : ''}
      <h1 class="watch-title">${esc(v.title)}</h1>
      <div class="watch-row">
        <div class="owner">
          <a href="#/channel/${v.channel.id}">${avatarImg(v.channel.avatar, 40)}</a>
          <div style="min-width:0"><a class="owner-name" href="#/channel/${v.channel.id}">${esc(v.channel.displayName)}</a>${verifiedMark(v.channel.verified)}
            <div class="owner-subs" id="subs-count">${fmtSubs(v.subscribers)}</div></div>
          ${v.isOwner ? '' : `<button class="btn ${v.subscribed ? 'subscribed' : 'btn-dark'} subscribe-btn" id="sub-btn" style="margin-left:12px">${v.subscribed ? 'Вы подписаны' : 'Подписаться'}</button>`}
        </div>
        <div class="actions">
          <div class="pill"><button id="like-btn" class="${v.myReaction === 1 ? 'on' : ''}" title="Нравится">${ic('like')}<span id="like-n">${fmtNum(v.likes)}</span></button><button id="dislike-btn" class="${v.myReaction === -1 ? 'on' : ''}" title="Не нравится">${ic('dislike')}<span id="dislike-n">${fmtNum(v.dislikes)}</span></button></div>
          <button class="btn" id="share-btn">${ic('share')}Поделиться</button>
          ${v.isOwner || canModerate ? `<button class="btn" id="edit-btn">${ic('edit')}Изменить</button><button class="btn" id="del-btn" title="Удалить">${ic('del')}</button>` : `<button class="btn" id="report-btn" title="Пожаловаться">${ic('flag')}</button>`}
        </div>
      </div>
      <div class="desc-box collapsed" id="desc-box">
        <div class="desc-stats"><span id="views-n">${fmtViews(v.views)}</span> • ${fmtDay(v.createdAt)}</div>
        <div class="desc-text">${v.description ? linkify(v.description) : '<span class="muted">Нет описания</span>'}</div>
        <button class="desc-toggle" id="desc-toggle">Ещё</button>
      </div>
      <section class="comments" id="comments"></section>
    </div>
    <aside class="watch-side">${related.videos.length ? related.videos.map(compactCard).join('') : '<p class="muted">Других видео пока нет.</p>'}</aside>
  </div>`;

  const player = $('#player');
  let counted = false;
  player.addEventListener('play', async () => {
    if (counted) return; counted = true;
    try { const r = await api(`/api/videos/${v.id}/view`, { method: 'POST' }); $('#views-n').textContent = fmtViews(r.views); } catch (e) { /* ignore */ }
  });
  player.addEventListener('error', () => toast('Браузер не может воспроизвести этот формат. Лучше всего загружать MP4 (H.264) или WebM.', 'error'), true);

  const descBox = $('#desc-box');
  $('#desc-toggle').addEventListener('click', () => {
    descBox.classList.toggle('collapsed');
    $('#desc-toggle').textContent = descBox.classList.contains('collapsed') ? 'Ещё' : 'Свернуть';
  });

  const subBtn = $('#sub-btn');
  if (subBtn) subBtn.addEventListener('click', async () => {
    if (!requireLogin('Войдите, чтобы подписаться')) return;
    try {
      const r = await api(`/api/channels/${v.channel.id}/subscribe`, { method: 'POST' });
      subBtn.textContent = r.subscribed ? 'Вы подписаны' : 'Подписаться';
      subBtn.className = `btn ${r.subscribed ? 'subscribed' : 'btn-dark'} subscribe-btn`;
      $('#subs-count').textContent = fmtSubs(r.subscribers);
      state.subs = (await api('/api/me/subscriptions')).channels; renderSidebar();
    } catch (e) { toastErr(e); }
  });

  let myReaction = v.myReaction;
  const react = async (val) => {
    if (!requireLogin('Войдите, чтобы оценивать видео')) return;
    const value = myReaction === val ? 0 : val;
    try {
      const r = await api(`/api/videos/${v.id}/react`, { method: 'POST', body: { value } });
      myReaction = r.myReaction;
      $('#like-n').textContent = fmtNum(r.likes); $('#dislike-n').textContent = fmtNum(r.dislikes);
      $('#like-btn').classList.toggle('on', myReaction === 1); $('#dislike-btn').classList.toggle('on', myReaction === -1);
    } catch (e) { toastErr(e); }
  };
  $('#like-btn').addEventListener('click', () => react(1));
  $('#dislike-btn').addEventListener('click', () => react(-1));

  $('#share-btn').addEventListener('click', async () => {
    const url = `${location.origin}/#/watch/${v.id}`;
    try { await navigator.clipboard.writeText(url); toast('Ссылка скопирована'); } catch (e) { formDialog('Ссылка на видео', [{ name: 'u', label: 'Скопируйте ссылку', value: url }], { okText: 'Готово' }); }
  });
  const reportBtn = $('#report-btn');
  if (reportBtn) reportBtn.addEventListener('click', () => reportDialog('video', v.id));
  const editBtn = $('#edit-btn');
  if (editBtn) editBtn.addEventListener('click', () => editVideoDialog(v, () => route()));
  const delBtn = $('#del-btn');
  if (delBtn) delBtn.addEventListener('click', async () => {
    if (!(await confirmDialog(`Удалить видео «${v.title}» навсегда?`, { okText: 'Удалить', danger: true }))) return;
    try { await api(`/api/videos/${v.id}`, { method: 'DELETE' }); toast('Видео удалено'); location.hash = `#/channel/${v.channel.id}`; } catch (e) { toastErr(e); }
  });

  loadComments(v);
}

async function loadComments(v) {
  const box = $('#comments');
  if (!box) return;
  const { comments } = await api(`/api/videos/${v.id}/comments`);
  const me = state.me;
  box.innerHTML = `<h3>${comments.length} ${plural(comments.length, 'комментарий', 'комментария', 'комментариев')}</h3>
    ${me ? `<form class="comment-form" id="c-form">${avatarImg(me.avatar, 40)}<div class="cf-body">
      <textarea id="c-text" rows="1" maxlength="2000" placeholder="Введите комментарий"></textarea>
      <div class="cf-actions" id="cf-actions" hidden><button type="button" class="btn btn-ghost" id="c-cancel">Отмена</button><button type="submit" class="btn btn-primary" id="c-send" disabled>Оставить комментарий</button></div></div></form>`
    : `<p class="muted" style="margin-bottom:24px"><a href="#/login" style="color:var(--accent)">Войдите</a>, чтобы оставить комментарий.</p>`}
    <div id="c-list">${comments.map((c) => `<div class="comment" data-id="${c.id}">
      <a href="#/channel/${c.author.id}">${avatarImg(c.author.avatar, 40)}</a>
      <div class="comment-body">
        <div class="comment-head"><a class="c-author ${c.isVideoOwner ? 'c-owner' : ''}" href="#/channel/${c.author.id}">@${esc(c.author.username)}</a>${verifiedMark(c.author.verified)}${roleBadge(c.author.role)}<span class="c-time">${timeAgo(c.createdAt)}</span></div>
        <div class="comment-text">${linkify(c.text)}</div>
        <div class="comment-tools">
          ${me && me.id !== c.author.id ? `<button class="btn btn-ghost btn-xs" data-report="${c.id}">${ic('flag')}Пожаловаться</button>` : ''}
          ${c.canDelete ? `<button class="btn btn-ghost btn-xs" data-cdel="${c.id}">${ic('del')}Удалить</button>` : ''}
        </div>
      </div></div>`).join('')}</div>`;

  const form = $('#c-form');
  if (form) {
    const ta = $('#c-text'), send = $('#c-send'), acts = $('#cf-actions');
    ta.addEventListener('focus', () => { acts.hidden = false; });
    ta.addEventListener('input', () => { send.disabled = !ta.value.trim(); ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; });
    $('#c-cancel').addEventListener('click', () => { ta.value = ''; acts.hidden = true; send.disabled = true; ta.style.height = 'auto'; });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      send.disabled = true;
      try { await api(`/api/videos/${v.id}/comments`, { method: 'POST', body: { text: ta.value } }); loadComments(v); } catch (err) { toastErr(err); send.disabled = false; }
    });
  }
  $$('[data-cdel]', box).forEach((b) => b.addEventListener('click', async () => {
    if (!(await confirmDialog('Удалить комментарий?', { okText: 'Удалить', danger: true }))) return;
    try { await api(`/api/comments/${b.dataset.cdel}`, { method: 'DELETE' }); loadComments(v); } catch (e) { toastErr(e); }
  }));
  $$('[data-report]', box).forEach((b) => b.addEventListener('click', () => reportDialog('comment', b.dataset.report)));
}

async function reportDialog(type, id) {
  if (!requireLogin('Войдите, чтобы отправить жалобу')) return;
  const r = await formDialog('Пожаловаться', [
    { name: 'kind', label: 'Причина', type: 'select', value: 'spam', options: [['Спам или обман', 'Спам или обман'], ['Оскорбления или травля', 'Оскорбления или травля'], ['Насилие или опасный контент', 'Насилие или опасный контент'], ['Контент для взрослых', 'Контент для взрослых'], ['Нарушение авторских прав', 'Нарушение авторских прав'], ['Другое', 'Другое']] },
    { name: 'details', label: 'Подробности (необязательно)', type: 'textarea', max: 400 },
  ], { okText: 'Отправить' });
  if (!r) return;
  try { await api('/api/reports', { method: 'POST', body: { type, id, reason: r.kind + (r.details ? ': ' + r.details : '') } }); toast('Спасибо! Жалоба отправлена модераторам.'); } catch (e) { toastErr(e); }
}

function editVideoDialog(v, after) {
  const m = openModal({
    title: 'Изменить видео',
    body: `<form id="ev-form"><div class="field"><label>Название</label><input class="input" name="title" maxlength="100" value="${esc(v.title)}" required></div>
      <div class="field"><label>Описание</label><textarea class="textarea" name="description" maxlength="5000">${esc(v.description)}</textarea></div>
      <div class="field"><label>Новая обложка (необязательно)</label><input type="file" name="thumbnail" accept="image/jpeg,image/png,image/webp,image/gif"></div>
      <div class="err" id="ev-err"></div></form>`,
    foot: '<button class="btn btn-ghost" data-close>Отмена</button><button class="btn btn-primary" id="ev-save">Сохранить</button>',
  });
  $('#ev-save', m.el).addEventListener('click', async () => {
    const f = $('#ev-form', m.el);
    const fd = new FormData();
    fd.append('title', f.title.value); fd.append('description', f.description.value);
    if (f.thumbnail.files[0]) fd.append('thumbnail', f.thumbnail.files[0]);
    try { await api(`/api/videos/${v.id}`, { method: 'PUT', form: fd }); m.close(); toast('Сохранено'); after && after(); } catch (e) { $('#ev-err', m.el).textContent = e.message; }
  });
}

// ── Канал ──
async function pageChannel(id, query, token) {
  content().innerHTML = '<div class="spinner"></div>';
  const { channel: c, videos } = await api(`/api/channels/${id}`);
  if (stale(token)) return;
  document.title = `${c.displayName} — Страус.TV`;
  content().innerHTML = `<div class="channel-banner"></div>
    <div class="channel-head">${avatarImg(c.avatar, 40, 'style="width:160px;height:160px"')}
      <div style="flex:1;min-width:220px"><h1>${esc(c.displayName)}${verifiedMark(c.verified)}</h1>
        <div class="channel-info"><b>@${esc(c.username)}</b> • <span id="ch-subs">${fmtSubs(c.subscribers)}</span> • ${videos.length} ${plural(videos.length, 'видео', 'видео', 'видео')} ${roleBadge(c.role)}</div>
        ${c.bio ? `<div class="channel-bio">${linkify(c.bio.length > 160 ? c.bio.slice(0, 160) + '…' : c.bio)}</div>` : '<div style="height:12px"></div>'}
        ${c.isBanned ? '<div class="tag red" style="margin-bottom:8px">Канал заблокирован</div>' : ''}
        <div class="row">${c.isSelf
          ? `<a class="btn" href="#/settings">${ic('edit')}Настроить вид канала</a><a class="btn" href="#/upload">${ic('upload')}Загрузить видео</a>`
          : `<button class="btn ${c.subscribed ? 'subscribed' : 'btn-dark'} subscribe-btn" id="ch-sub">${c.subscribed ? 'Вы подписаны' : 'Подписаться'}</button><button class="btn btn-ghost" id="ch-report" title="Пожаловаться на канал">${ic('flag')}</button>`}
        </div></div></div>
    <div class="tabs"><button class="tab active" data-tab="videos">Видео</button><button class="tab" data-tab="about">О канале</button></div>
    <div class="channel-body" id="ch-body"></div>`;

  const renderTab = (tab) => {
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'videos') {
      $('#ch-body').innerHTML = videos.length ? `<div class="grid">${videos.map((v) => videoCard(v, { showChannel: false })).join('')}</div>`
        : `<div class="empty"><img src="/img/favicon.svg" alt=""><h2>${c.isSelf ? 'Загрузите своё первое видео' : 'На этом канале пока нет видео'}</h2>${c.isSelf ? '<p>Ваши ролики появятся здесь и сразу станут доступны всем.</p><a class="btn btn-primary" href="#/upload">Загрузить видео</a>' : ''}</div>`;
    } else {
      $('#ch-body').innerHTML = `<div class="card-box" style="max-width:760px"><h2>Описание</h2><div class="desc-text">${c.bio ? linkify(c.bio) : '<span class="muted">Автор пока ничего о себе не рассказал.</span>'}</div>
        <h2 class="mt">Статистика</h2><p class="muted" style="margin:0">Дата регистрации: ${fmtDay(c.createdAt)}<br>${fmtViews(c.totalViews)}<br>${fmtSubs(c.subscribers)}</p></div>`;
    }
  };
  $$('.tab').forEach((t) => t.addEventListener('click', () => renderTab(t.dataset.tab)));
  renderTab('videos');

  const sub = $('#ch-sub');
  if (sub) sub.addEventListener('click', async () => {
    if (!requireLogin('Войдите, чтобы подписаться')) return;
    try {
      const r = await api(`/api/channels/${c.id}/subscribe`, { method: 'POST' });
      sub.textContent = r.subscribed ? 'Вы подписаны' : 'Подписаться';
      sub.className = `btn ${r.subscribed ? 'subscribed' : 'btn-dark'} subscribe-btn`;
      $('#ch-subs').textContent = fmtSubs(r.subscribers);
      state.subs = (await api('/api/me/subscriptions')).channels; renderSidebar();
    } catch (e) { toastErr(e); }
  });
  const rep = $('#ch-report');
  if (rep) rep.addEventListener('click', () => reportDialog('user', c.id));
}

// ── Загрузка видео ──
function captureThumbnail(file) {
  // Делаем обложку из кадра видео прямо в браузере
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata'; vid.muted = true; vid.playsInline = true; vid.src = url;
    let duration = 0;
    const finish = (blob) => { URL.revokeObjectURL(url); resolve({ blob, duration }); };
    const timer = setTimeout(() => finish(null), 15000);
    vid.addEventListener('loadedmetadata', () => {
      duration = isFinite(vid.duration) ? vid.duration : 0;
      vid.currentTime = Math.min(Math.max(duration * 0.2, 0.5), Math.max(duration - 0.1, 0));
    });
    vid.addEventListener('seeked', () => {
      try {
        const c = document.createElement('canvas');
        c.width = 1280; c.height = 720;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
        const r = Math.min(c.width / vid.videoWidth, c.height / vid.videoHeight) || 1;
        const w = vid.videoWidth * r, h = vid.videoHeight * r;
        ctx.drawImage(vid, (c.width - w) / 2, (c.height - h) / 2, w, h);
        c.toBlob((b) => { clearTimeout(timer); finish(b); }, 'image/jpeg', 0.85);
      } catch (e) { clearTimeout(timer); finish(null); }
    });
    vid.addEventListener('error', () => { clearTimeout(timer); finish(null); });
  });
}

function pageUpload() {
  if (!requireLogin('Войдите, чтобы загрузить видео')) return;
  if (!state.me.canUpload) { content().innerHTML = errorBlock('Администратор ограничил загрузку видео для вашего аккаунта.'); return; }
  if (state.settings.uploadsOpen === false && !['admin', 'moderator'].includes(state.me.role)) { content().innerHTML = errorBlock('Загрузка видео временно отключена администратором.'); return; }
  const max = state.settings.maxUploadMb || 500;
  content().innerHTML = `<div class="page-narrow" style="max-width:960px"><h1 class="page-title">Загрузка видео</h1>
    <div id="up-stage">
      <label class="dropzone" id="dz">
        <div class="dz-icon">${ic('cloud')}</div>
        <h2>Перетащите файл сюда или нажмите, чтобы выбрать</h2>
        <p>MP4 (H.264) или WebM воспроизводятся во всех браузерах. Максимум ${max} МБ.</p>
        <span class="btn btn-primary">Выбрать файл</span>
        <input type="file" id="video-file" accept="video/*" hidden>
      </label>
      <p class="hint" style="text-align:center;margin-top:16px">Загружая видео, вы подтверждаете, что у вас есть права на его публикацию и оно соответствует <a href="#/rules" style="color:var(--accent)">правилам</a>.</p>
    </div></div>`;
  const input = $('#video-file'), dz = $('#dz');
  input.addEventListener('change', () => input.files[0] && showUploadForm(input.files[0]));
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag'); const f = e.dataTransfer.files[0]; if (f) showUploadForm(f); });
}

async function showUploadForm(file) {
  const max = state.settings.maxUploadMb || 500;
  if (!file.type.startsWith('video/')) return toast('Это не видеофайл', 'error');
  if (file.size > max * 1024 * 1024) return toast(`Файл больше ${max} МБ`, 'error');
  const previewUrl = URL.createObjectURL(file);
  const stage = $('#up-stage');
  stage.innerHTML = `<div class="upload-grid"><form id="up-form" class="card-box" style="margin:0">
      <div class="field"><label>Название (обязательно)</label><input class="input" name="title" maxlength="100" required value="${esc(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 100))}"></div>
      <div class="field"><label>Описание</label><textarea class="textarea" name="description" maxlength="5000" rows="6" placeholder="Расскажите зрителям о своём видео"></textarea></div>
      <div class="field"><label>Обложка</label><div class="thumb-pick"><div class="thumb-preview" id="thumb-prev">Создаём из кадра…</div>
        <div><label class="btn btn-sm" style="cursor:pointer">${ic('image')}Загрузить свою<input type="file" id="thumb-file" accept="image/jpeg,image/png,image/webp,image/gif" hidden></label>
        <div class="hint">JPG/PNG/WEBP, лучше 1280×720.<br>По умолчанию — кадр из видео.</div></div></div></div>
      <div id="up-progress" hidden><div class="progress"><div id="up-bar"></div></div><div class="hint" id="up-pct">0%</div></div>
      <div class="err" id="up-err"></div>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" id="up-cancel">Отмена</button><button type="submit" class="btn btn-primary" id="up-submit">Опубликовать</button></div>
    </form>
    <div class="upload-preview"><video src="${previewUrl}" controls muted playsinline></video><div class="up-info">${esc(file.name)}<br>${fmtBytes(file.size)}</div></div></div>`;

  let thumbBlob = null, customThumb = null, duration = 0;
  const prev = $('#thumb-prev');
  captureThumbnail(file).then(({ blob, duration: d }) => {
    duration = d;
    if (customThumb) return;
    if (blob) { thumbBlob = blob; prev.innerHTML = `<img src="${URL.createObjectURL(blob)}" alt="">`; }
    else prev.textContent = 'Не удалось создать обложку';
  });
  $('#thumb-file').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    customThumb = f; prev.innerHTML = `<img src="${URL.createObjectURL(f)}" alt="">`;
  });
  $('#up-cancel').addEventListener('click', () => { URL.revokeObjectURL(previewUrl); pageUpload(); });

  $('#up-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.title.value.trim()) { $('#up-err').textContent = 'Укажите название'; return; }
    const fd = new FormData();
    fd.append('title', f.title.value);
    fd.append('description', f.description.value);
    fd.append('duration', String(duration || 0));
    fd.append('video', file);
    if (customThumb) fd.append('thumbnail', customThumb);
    else if (thumbBlob) fd.append('thumbnail', thumbBlob, 'thumb.jpg');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/videos');
    $('#up-progress').hidden = false; $('#up-submit').disabled = true; $('#up-err').textContent = '';
    xhr.upload.addEventListener('progress', (ev) => {
      if (!ev.lengthComputable) return;
      const p = Math.round((ev.loaded / ev.total) * 100);
      $('#up-bar').style.width = p + '%';
      $('#up-pct').textContent = p < 100 ? `Загрузка: ${p}%` : 'Обработка на сервере…';
    });
    xhr.addEventListener('load', () => {
      let data = {}; try { data = JSON.parse(xhr.responseText); } catch (err) { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) { toast('Видео опубликовано!'); location.hash = `#/watch/${data.id}`; }
      else { $('#up-err').textContent = data.error || `Ошибка загрузки (${xhr.status})`; $('#up-submit').disabled = false; }
    });
    xhr.addEventListener('error', () => { $('#up-err').textContent = 'Сетевая ошибка при загрузке'; $('#up-submit').disabled = false; });
    xhr.send(fd);
  });
}

// ── Вход и регистрация ──
const trustNote = () => `<div class="trust-note">${ic('lock')}<div>Страус.TV <b>никогда не запрашивает</b> e-mail, номер телефона или пароли от других сайтов. Для входа нужен только логин и пароль, созданные здесь. Пароль хранится в зашифрованном виде.</div></div>`;
const authLogo = () => `<div class="auth-logo"><img src="/img/logo.svg" alt="" width="40" height="28"><span class="logo-text">Страус<span class="logo-tv">.TV</span></span></div>`;

function pageLogin(query) {
  if (state.me) { location.hash = '#/'; return; }
  const next = query.get('next') || '/';
  content().innerHTML = `<div class="auth-wrap"><form class="auth-card" id="login-form" autocomplete="on">
    ${authLogo()}<h1>Вход</h1><p class="auth-sub">Войдите в аккаунт Страус.TV</p>
    <div class="field"><label for="l-user">Логин</label><input class="input" id="l-user" name="username" autocomplete="username" required maxlength="24" autocapitalize="off" spellcheck="false"></div>
    <div class="field"><label for="l-pass">Пароль</label><input class="input" id="l-pass" name="password" type="password" autocomplete="current-password" required></div>
    <div class="err" id="l-err"></div>
    ${trustNote()}
    <div class="auth-foot"><a class="btn btn-text" href="#/register">Создать аккаунт</a><button class="btn btn-primary" type="submit">Войти</button></div>
  </form></div>`;
  $('#l-user').focus();
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api('/api/auth/login', { method: 'POST', body: { username: f.username.value.trim(), password: f.password.value } });
      await loadMe(); toast(`С возвращением, ${state.me.displayName}!`); location.hash = '#' + next;
    } catch (err) { $('#l-err').textContent = err.message; }
  });
}

function pageRegister() {
  if (state.me) { location.hash = '#/'; return; }
  if (state.settings.registrationOpen === false) { content().innerHTML = errorBlock('Регистрация новых аккаунтов временно закрыта администратором.'); return; }
  let preset = Math.floor(Math.random() * PRESET_COUNT);
  content().innerHTML = `<div class="auth-wrap"><form class="auth-card" id="reg-form" autocomplete="on" style="max-width:500px">
    ${authLogo()}<h1>Создать аккаунт</h1><p class="auth-sub">Только логин и пароль — без почты и телефона</p>
    <div class="field"><label>Аватар страуса (потом можно загрузить своё фото)</label><div class="presets" id="presets"></div></div>
    <div class="field"><label for="r-name">Название канала</label><input class="input" id="r-name" name="displayName" maxlength="50" placeholder="Например: Быстрый Страус" autocomplete="nickname"></div>
    <div class="field"><label for="r-user">Логин</label><input class="input" id="r-user" name="username" required maxlength="24" autocomplete="username" autocapitalize="off" spellcheck="false" pattern="[A-Za-z0-9_.\\-]{3,24}"><div class="hint">3–24 символа: латинские буквы, цифры, «_», «.», «-»</div></div>
    <div class="field"><label for="r-pass">Пароль</label><input class="input" id="r-pass" name="password" type="password" required minlength="6" autocomplete="new-password"><div class="hint">Не менее 6 символов. Придумайте новый пароль, не используйте пароль от почты или банка.</div></div>
    <div class="field"><label for="r-pass2">Повторите пароль</label><input class="input" id="r-pass2" name="password2" type="password" required autocomplete="new-password"></div>
    <label class="check"><input type="checkbox" name="agree" required> <span>Я принимаю <a href="#/rules" target="_blank">правила сообщества</a> и <a href="#/privacy" target="_blank">политику конфиденциальности</a></span></label>
    <div class="err" id="r-err"></div>
    ${trustNote()}
    <div class="auth-foot"><a class="btn btn-text" href="#/login">Уже есть аккаунт? Войти</a><button class="btn btn-primary" type="submit">Зарегистрироваться</button></div>
  </form></div>`;
  const renderPresets = () => {
    $('#presets').innerHTML = Array.from({ length: PRESET_COUNT }, (_, i) => `<button type="button" class="preset ${i === preset ? 'sel' : ''}" data-i="${i}" aria-label="Аватар ${i + 1}"><img src="${presetSvg(i)}" alt=""></button>`).join('');
    $$('#presets .preset').forEach((b) => b.addEventListener('click', () => { preset = +b.dataset.i; renderPresets(); }));
  };
  renderPresets();
  $('#reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.password.value !== f.password2.value) { $('#r-err').textContent = 'Пароли не совпадают'; return; }
    try {
      await api('/api/auth/register', { method: 'POST', body: { username: f.username.value.trim(), password: f.password.value, displayName: f.displayName.value.trim(), avatar: `preset:${preset}` } });
      await loadMe(); toast('Добро пожаловать на Страус.TV!'); location.hash = `#/channel/${state.me.id}`;
    } catch (err) { $('#r-err').textContent = err.message; }
  });
}

// ── Настройки профиля ──
function pageSettings() {
  if (!requireLogin()) return;
  const me = state.me;
  let preset = null, file = null;
  content().innerHTML = `<div class="page-narrow"><h1 class="page-title">Настройки канала</h1>
    <form class="card-box" id="prof-form"><h2>Профиль</h2>
      <div class="avatar-edit"><img class="avatar" id="av-prev" src="${esc(avatarSrc(me.avatar))}" alt="">
        <div><label class="btn" style="cursor:pointer">${ic('image')}Загрузить своё фото<input type="file" id="av-file" accept="image/jpeg,image/png,image/webp,image/gif" hidden></label>
        <div class="hint">JPG, PNG, WEBP или GIF. Квадратное изображение смотрится лучше.</div></div></div>
      <div class="field"><label>…или выберите стандартного страуса</label><div class="presets" id="presets"></div></div>
      <div class="field"><label>Название канала</label><input class="input" name="displayName" maxlength="50" value="${esc(me.displayName)}" required></div>
      <div class="field"><label>Описание канала</label><textarea class="textarea" name="bio" maxlength="1000">${esc(me.bio)}</textarea></div>
      <div class="err" id="p-err"></div><button class="btn btn-primary" type="submit">Сохранить</button>
    </form>
    <form class="card-box" id="pass-form" autocomplete="off"><h2>Смена пароля</h2>
      <input type="text" name="username" value="${esc(me.username)}" autocomplete="username" hidden>
      <div class="field"><label>Текущий пароль</label><input class="input" type="password" name="old" autocomplete="current-password" required></div>
      <div class="field"><label>Новый пароль</label><input class="input" type="password" name="new1" autocomplete="new-password" minlength="6" required></div>
      <div class="field"><label>Повторите новый пароль</label><input class="input" type="password" name="new2" autocomplete="new-password" required></div>
      <div class="err" id="pw-err"></div><button class="btn btn-primary" type="submit">Сменить пароль</button>
    </form>
    <div class="card-box"><h2 style="color:var(--danger)">Удаление аккаунта</h2><p class="muted">Канал, все видео и комментарии будут удалены без возможности восстановления.</p><button class="btn btn-danger" id="del-acc">Удалить аккаунт</button></div>
  </div>`;
  const renderPresets = () => {
    const cur = preset !== null ? preset : (/^preset:(\d+)$/.exec(me.avatar) || [])[1];
    $('#presets').innerHTML = Array.from({ length: PRESET_COUNT }, (_, i) => `<button type="button" class="preset ${!file && String(i) === String(cur) ? 'sel' : ''}" data-i="${i}"><img src="${presetSvg(i)}" alt=""></button>`).join('');
    $$('#presets .preset').forEach((b) => b.addEventListener('click', () => { preset = +b.dataset.i; file = null; $('#av-prev').src = presetSvg(preset); renderPresets(); }));
  };
  renderPresets();
  $('#av-file').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast('Аватар должен быть меньше 5 МБ', 'error'); return; }
    file = f; preset = null; $('#av-prev').src = URL.createObjectURL(f); renderPresets();
  });
  $('#prof-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();
    fd.append('displayName', f.displayName.value); fd.append('bio', f.bio.value);
    if (file) fd.append('avatar', file); else if (preset !== null) fd.append('avatarPreset', `preset:${preset}`);
    try { await api('/api/me', { method: 'PUT', form: fd }); await loadMe(); toast('Профиль сохранён'); $('#p-err').textContent = ''; } catch (err) { $('#p-err').textContent = err.message; }
  });
  $('#pass-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.new1.value !== f.new2.value) { $('#pw-err').textContent = 'Пароли не совпадают'; return; }
    try { await api('/api/me/password', { method: 'POST', body: { oldPassword: f.old.value, newPassword: f.new1.value } }); f.reset(); $('#pw-err').textContent = ''; toast('Пароль изменён'); } catch (err) { $('#pw-err').textContent = err.message; }
  });
  $('#del-acc').addEventListener('click', async () => {
    const r = await formDialog('Удалить аккаунт навсегда?', [{ name: 'password', label: 'Введите пароль для подтверждения', type: 'password' }], { okText: 'Удалить', danger: true });
    if (!r) return;
    try { await api('/api/me', { method: 'DELETE', body: { password: r.password } }); await loadMe(); location.hash = '#/'; toast('Аккаунт удалён'); } catch (err) { toastErr(err); }
  });
}

// ── Текстовые страницы ──
function pagePrivacy() {
  content().innerHTML = `<div class="prose"><h1>Политика конфиденциальности</h1>
    <p>Страус.TV — независимый некоммерческий проект. Мы собираем минимум данных, необходимых для работы сайта.</p>
    <h2>Какие данные мы храним</h2>
    <p>• Логин, название канала, описание и аватар, которые вы указали сами.<br>• Пароль — только в виде криптографического хэша (bcrypt). Мы не можем его прочитать.<br>• Загруженные вами видео, обложки, комментарии, лайки и подписки.<br>• Технический cookie <code>sid</code> для поддержания входа в аккаунт.</p>
    <h2>Чего мы не делаем</h2>
    <p>• Не запрашиваем e-mail, номер телефона, банковские данные или пароли от других сервисов.<br>• Не продаём и не передаём данные третьим лицам.<br>• Не используем рекламные и аналитические трекеры.</p>
    <h2>Удаление данных</h2>
    <p>Вы можете в любой момент удалить свой аккаунт в разделе «Настройки» — вместе с ним удаляются все ваши видео и комментарии.</p>
    <h2>Безопасность</h2>
    <p>Если кто-то от имени Страус.TV просит ваш пароль в сообщениях или по почте — это мошенники. Администрация никогда не спрашивает пароли.</p></div>`;
}
function pageRules() {
  content().innerHTML = `<div class="prose"><h1>Правила сообщества</h1>
    <p>Страус.TV — место для творчества. Чтобы всем было комфортно, соблюдайте простые правила:</p>
    <h2>Запрещено</h2>
    <p>• Загружать чужие видео без разрешения правообладателя.<br>• Публиковать насилие, порнографию, экстремизм и другой незаконный контент.<br>• Оскорблять, травить и угрожать другим пользователям.<br>• Спамить, выдавать себя за других людей или администрацию, выманивать пароли и личные данные.</p>
    <h2>Модерация</h2>
    <p>Администрация может скрыть или удалить контент, ограничить комментирование или загрузку, вынести предупреждение, временно или навсегда заблокировать аккаунт. Пожаловаться на нарушение можно кнопкой с флажком у видео, комментария или канала.</p></div>`;
}

// ═══════════════ Скрытая панель администратора (S + Tab) ═══════════════
let adminModal = null;
async function openAdmin() {
  if (adminModal) return;
  try { await loadMe(); } catch (e) { /* ignore */ }
  const me = state.me;
  const onClose = () => { adminModal = null; };
  if (!me) {
    adminModal = openModal({ title: `${ic('shield')} Панель администратора`, body: '<p style="margin:0">Сначала войдите в свой аккаунт, затем снова нажмите <b>S + Tab</b>.</p>', foot: '<a class="btn btn-primary" href="#/login" data-close>Войти</a>', onClose });
    return;
  }
  if (state.impersonator) {
    adminModal = openModal({ title: `${ic('shield')} Панель администратора`, body: `<p style="margin:0">Сейчас вы работаете под аккаунтом <b>@${esc(me.username)}</b>. Вернитесь в свой аккаунт, чтобы открыть панель.</p>`, foot: '<button class="btn btn-primary" id="adm-back">Вернуться в свой аккаунт</button>', onClose });
    $('#adm-back', adminModal.el).addEventListener('click', async () => {
      try { await api('/api/auth/stop-impersonate', { method: 'POST' }); adminModal.close(); await loadMe(); route(); openAdmin(); } catch (e) { toastErr(e); }
    });
    return;
  }
  if (me.role !== 'admin' && me.role !== 'moderator') {
    adminModal = openModal({
      title: `${ic('shield')} Доступ администратора`,
      body: `<form id="claim-form"><p style="margin:0 0 16px" class="muted">Введите секретный ключ администратора (переменная окружения <code>ADMIN_KEY</code> на сервере). После этого ваш аккаунт получит права администратора.</p>
        <input type="text" name="username" value="${esc(me.username)}" autocomplete="username" hidden>
        <div class="field"><label>Ключ администратора</label><input class="input" type="password" name="key" autocomplete="off" required></div><div class="err" id="claim-err"></div></form>`,
      foot: '<button class="btn btn-ghost" data-close>Отмена</button><button class="btn btn-primary" id="claim-ok">Подтвердить</button>',
      onClose,
    });
    const submit = async (e) => {
      e && e.preventDefault();
      try {
        await api('/api/admin/claim', { method: 'POST', body: { key: $('#claim-form', adminModal.el).key.value } });
        adminModal.close(); await loadMe(); toast('Права администратора получены'); openAdmin();
      } catch (err) { $('#claim-err', adminModal.el).textContent = err.message; }
    };
    $('#claim-form', adminModal.el).addEventListener('submit', submit);
    $('#claim-ok', adminModal.el).addEventListener('click', submit);
    $('input[name=key]', adminModal.el).focus();
    return;
  }
  const isAdmin = me.role === 'admin';
  const tabs = [
    ['dash', 'dash', 'Обзор'], ['videos', 'library', 'Видео'], ['users', 'people', 'Пользователи'],
    ['comments', 'comment', 'Комментарии'], ['reports', 'flag', 'Жалобы'], ['logs', 'history', 'Журнал действий'],
  ];
  if (isAdmin) tabs.push(['settings', 'tune', 'Настройки сайта']);
  adminModal = openModal({
    title: `${ic('shield')} Панель ${isAdmin ? 'администратора' : 'модератора'}`,
    cls: 'admin',
    body: `<div class="admin-shell"><div class="admin-nav">${tabs.map(([k, i, l]) => `<button data-tab="${k}">${ic(i)}<span>${l}</span>${k === 'reports' ? '<span class="count" id="rep-count" hidden></span>' : ''}</button>`).join('')}</div><div class="admin-main" id="adm-main"></div></div>`,
    onClose,
  });
  $('.modal-body', adminModal.el).style.padding = '0';
  $('.modal-body', adminModal.el).style.display = 'flex';
  $('.modal-body', adminModal.el).style.flex = '1';
  $('.modal-body', adminModal.el).style.minHeight = '0';
  const show = (tab, arg) => {
    $$('.admin-nav button', adminModal.el).forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    const main = $('#adm-main', adminModal.el);
    main.innerHTML = '<div class="spinner"></div>';
    const fn = { dash: admDash, videos: admVideos, users: admUsers, comments: admComments, reports: admReports, logs: admLogs, settings: admSettings, user: admUserDetail }[tab];
    fn(main, show, arg).catch((e) => { main.innerHTML = `<div class="err">${esc(e.message)}</div>`; });
  };
  $$('.admin-nav button', adminModal.el).forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
  show('dash');
}

async function refreshReportCount() {
  try {
    const s = await api('/api/admin/stats');
    const el = adminModal && $('#rep-count', adminModal.el);
    if (el) { el.hidden = !s.openReports; el.textContent = s.openReports; }
    return s;
  } catch (e) { return null; }
}

async function admDash(main, show) {
  const s = await refreshReportCount();
  if (!s) throw new Error('Не удалось загрузить статистику');
  const stat = (v, l, accent) => `<div class="stat ${accent ? 'accent' : ''}"><div class="s-val">${v}</div><div class="s-lbl">${l}</div></div>`;
  main.innerHTML = `<h3 class="section-title">Обзор платформы</h3><div class="stats">
    ${stat(s.users, 'Пользователей', true)}${stat(s.online, 'Онлайн (5 мин)')}${stat(s.newUsers24h, 'Новых за 24 ч')}${stat(s.banned, 'Заблокировано')}
    ${stat(s.videos, 'Видео', true)}${stat(s.hidden, 'Скрыто')}${stat(fmtNum(s.views), 'Просмотров')}${stat(fmtBytes(s.storage), 'Занято видео')}
    ${stat(s.comments, 'Комментариев')}${stat(s.openReports, 'Открытых жалоб', s.openReports > 0)}</div>
    <div class="card-box"><h2>Подсказки</h2><p class="muted" style="margin:0;line-height:1.7">• Панель открывается сочетанием <b>S + Tab</b> (или по адресу <code>/#/admin</code> с телефона).<br>
    • В разделе «Пользователи» нажмите на человека — откроется карточка со всеми мерами: предупреждение, запрет комментариев, запрет загрузки, блокировка, вход под аккаунтом и т. д.<br>
    • Все действия администраторов и модераторов записываются в «Журнал действий».</p></div>`;
  if (s.openReports) main.insertAdjacentHTML('afterbegin', `<div class="trust-note" style="margin:0 0 16px">${ic('flag')}<div>Есть ${s.openReports} ${plural(s.openReports, 'новая жалоба', 'новые жалобы', 'новых жалоб')}. <a href="#" id="go-rep" style="color:var(--accent);font-weight:600">Открыть</a></div></div>`);
  const go = $('#go-rep', main); if (go) go.addEventListener('click', (e) => { e.preventDefault(); show('reports'); });
}

function searchToolbar(main, placeholder, value, onSearch) {
  const tb = document.createElement('form');
  tb.className = 'admin-toolbar';
  tb.innerHTML = `<input class="input" placeholder="${esc(placeholder)}" value="${esc(value || '')}"><button class="btn btn-sm" type="submit">${ic('search')}Найти</button>`;
  tb.addEventListener('submit', (e) => { e.preventDefault(); onSearch(tb.querySelector('input').value); });
  main.prepend(tb);
}

async function admVideos(main, show, q = '') {
  const { videos } = await api(`/api/admin/videos?q=${encodeURIComponent(q)}`);
  main.innerHTML = `<h3 class="section-title">Все видео (${videos.length})</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Видео</th><th>Автор</th><th>Просм.</th><th>Размер</th><th>Дата</th><th></th></tr></thead><tbody>
    ${videos.map((v) => `<tr data-id="${v.id}"><td><div class="t-thumb">${v.thumbnail ? `<img src="${esc(v.thumbnail)}" alt="">` : '<div class="thumb-ph"><img src="/img/favicon.svg" alt=""></div>'}</div></td>
      <td><div class="t-title">${esc(v.title)}</div>${v.isHidden ? '<span class="tag orange">Скрыто</span>' : ''}</td>
      <td><div class="t-user">${avatarImg(v.channel.avatar, 24)}@${esc(v.channel.username)}</div></td>
      <td>${fmtNum(v.views)}</td><td>${fmtBytes(v.size)}</td><td>${fmtDate(v.createdAt)}</td>
      <td><div class="t-actions"><a class="btn btn-xs" href="#/watch/${v.id}" data-close-admin>Открыть</a>
      <button class="btn btn-xs" data-act="hide">${ic(v.isHidden ? 'eye' : 'eyeOff')}${v.isHidden ? 'Показать' : 'Скрыть'}</button>
      <button class="btn btn-xs btn-danger" data-act="del">${ic('del')}Удалить</button></div></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Видео нет</td></tr>'}
    </tbody></table></div>`;
  searchToolbar(main, 'Поиск по названию или автору', q, (nq) => admVideos(main, show, nq));
  bindCloseAdmin(main);
  $$('tr[data-id]', main).forEach((tr) => {
    const id = tr.dataset.id;
    $('[data-act=hide]', tr).addEventListener('click', async () => { try { await api(`/api/admin/videos/${id}/hide`, { method: 'POST' }); admVideos(main, show, q); } catch (e) { toastErr(e); } });
    $('[data-act=del]', tr).addEventListener('click', async () => {
      if (!(await confirmDialog('Удалить это видео навсегда? Файл будет стёрт с сервера.', { okText: 'Удалить', danger: true }))) return;
      try { await api(`/api/admin/videos/${id}`, { method: 'DELETE' }); toast('Видео удалено'); admVideos(main, show, q); } catch (e) { toastErr(e); }
    });
  });
}

function bindCloseAdmin(main) {
  $$('[data-close-admin]', main).forEach((a) => a.addEventListener('click', () => adminModal && adminModal.close()));
}

function userTags(u) {
  const t = [];
  if (u.role === 'admin') t.push('<span class="tag orange">Админ</span>');
  if (u.role === 'moderator') t.push('<span class="tag orange">Модератор</span>');
  if (u.isBanned) t.push(`<span class="tag red">Заблокирован ${u.bannedUntil ? 'до ' + fmtDate(u.bannedUntil) : 'навсегда'}</span>`);
  if (u.mutedUntil) t.push(`<span class="tag red">Без комментариев</span>`);
  if (!u.canUpload) t.push('<span class="tag red">Без загрузки</span>');
  if (u.verified) t.push('<span class="tag green">✓ Подтверждён</span>');
  if (u.warningCount) t.push(`<span class="tag">⚠ ${u.warningCount}</span>`);
  return t.join('') || '<span class="tag green">Активен</span>';
}

async function admUsers(main, show, q = '') {
  const { users } = await api(`/api/admin/users?q=${encodeURIComponent(q)}`);
  main.innerHTML = `<h3 class="section-title">Пользователи (${users.length})</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Пользователь</th><th>Статус</th><th>Видео</th><th>Комм.</th><th>Регистрация</th><th>Был(а)</th><th></th></tr></thead><tbody>
    ${users.map((u) => `<tr data-id="${u.id}" style="cursor:pointer"><td><div class="t-user">${avatarImg(u.avatar, 32)}<div><b>${esc(u.displayName)}</b><br><span class="muted">@${esc(u.username)}</span></div></div></td>
      <td>${userTags(u)}</td><td>${u.videoCount}</td><td>${u.commentCount}</td><td>${fmtDate(u.createdAt)}</td><td>${u.lastSeen ? timeAgo(u.lastSeen) : '—'}</td>
      <td><div class="t-actions"><button class="btn btn-xs btn-primary">Управлять</button></div></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Нет пользователей</td></tr>'}
    </tbody></table></div>`;
  searchToolbar(main, 'Поиск по логину или имени', q, (nq) => admUsers(main, show, nq));
  $$('tr[data-id]', main).forEach((tr) => tr.addEventListener('click', () => show('user', users.find((u) => String(u.id) === tr.dataset.id))));
}

async function admUserDetail(main, show, u) {
  // Перезагружаем свежие данные пользователя
  const { users } = await api(`/api/admin/users?q=${encodeURIComponent(u.username)}`);
  u = users.find((x) => x.id === u.id);
  if (!u) { show('users'); return; }
  const { warnings } = await api(`/api/admin/users/${u.id}/warnings`);
  const me = state.me, isAdmin = me.role === 'admin', self = me.id === u.id;
  const A = (act, label, icon, cls = '') => `<button class="btn btn-sm ${cls}" data-act="${act}">${icon ? ic(icon) : ''}${label}</button>`;
  main.innerHTML = `<button class="btn btn-ghost btn-sm" id="back" style="margin-bottom:12px">← Ко всем пользователям</button>
    <div class="user-detail-head">${avatarImg(u.avatar, 40, 'style="width:72px;height:72px"')}<div><h3 style="margin:0;font-size:20px">${esc(u.displayName)}</h3>
      <div class="muted">@${esc(u.username)} • ID ${u.id} • зарегистрирован ${fmtDate(u.createdAt)} • видео: ${u.videoCount} • комментариев: ${u.commentCount}</div><div style="margin-top:6px">${userTags(u)}</div>
      ${u.isBanned && u.banReason ? `<div class="muted" style="margin-top:4px">Причина блокировки: ${esc(u.banReason)}</div>` : ''}</div></div>
    ${self ? '<div class="trust-note">Это ваш аккаунт — действия модерации к себе применить нельзя.</div>' : `
    <div class="action-groups">
      <div class="action-group"><h4>Просмотр и вход</h4><div class="btns">
        <a class="btn btn-sm" href="#/channel/${u.id}" data-close-admin>${ic('user')}Открыть канал</a>
        ${isAdmin ? A('impersonate', 'Войти под аккаунтом', 'login', 'btn-primary') : ''}</div></div>
      <div class="action-group"><h4>Мягкие меры</h4><div class="btns">
        ${A('warn', 'Предупредить', 'warn')}
        ${u.mutedUntil ? A('unmute', 'Разрешить комментарии', 'comment') : A('mute', 'Запретить комментарии', 'comment')}
        ${A('upload', u.canUpload ? 'Запретить загрузку' : 'Разрешить загрузку', 'upload')}
        ${A('reset-profile', 'Сбросить имя/аватар', 'image')}</div></div>
      <div class="action-group"><h4>Контент</h4><div class="btns">
        ${A('del-comments', 'Удалить все комментарии', 'del')}
        ${A('logout-all', 'Завершить все сеансы', 'logout')}</div></div>
      ${isAdmin ? `<div class="action-group"><h4>Права и доступ</h4><div class="btns">
        ${A('role', 'Изменить роль', 'shield')}
        ${A('verify', u.verified ? 'Снять галочку' : 'Выдать галочку ✓', 'check')}
        ${A('password', 'Задать новый пароль', 'lock')}</div></div>
      <div class="action-group"><h4>Жёсткие меры</h4><div class="btns">
        ${u.isBanned ? A('unban', 'Разблокировать', 'lock') : A('ban', 'Заблокировать', 'lock', 'btn-danger')}
        ${A('delete', 'Удалить аккаунт', 'del', 'btn-danger')}</div></div>` : ''}
    </div>`}
    <h3 class="section-title" style="font-size:16px">Предупреждения (${warnings.length})</h3>
    ${warnings.length ? warnings.map((w) => `<div class="log-item"><div>${esc(w.text)}</div><div class="l-time">${fmtDate(w.createdAt)} • от @${esc(w.admin || '—')} • ${w.seen ? 'прочитано' : 'не прочитано'}</div></div>`).join('') : '<p class="muted">Предупреждений нет.</p>'}`;
  $('#back', main).addEventListener('click', () => show('users'));
  bindCloseAdmin(main);
  const reload = () => admUserDetail(main, show, u);
  const run = async (fn, okMsg) => { try { await fn(); if (okMsg) toast(okMsg); reload(); } catch (e) { toastErr(e); } };
  const base = `/api/admin/users/${u.id}`;
  const durOpts = [['1', '1 день'], ['3', '3 дня'], ['7', '7 дней'], ['30', '30 дней'], ['0', 'Навсегда']];
  const on = (act, fn) => { const b = $(`[data-act="${act}"]`, main); if (b) b.addEventListener('click', fn); };

  on('impersonate', async () => {
    if (!(await confirmDialog(`Войти под аккаунтом @${u.username}? Вы сможете действовать от его имени. Чтобы вернуться, нажмите кнопку в оранжевой полосе сверху.`, { okText: 'Войти' }))) return;
    try { await api(`${base}/impersonate`, { method: 'POST' }); adminModal.close(); await loadMe(); location.hash = `#/channel/${u.id}`; route(); toast(`Вы вошли как @${u.username}`); } catch (e) { toastErr(e); }
  });
  on('warn', async () => {
    const r = await formDialog(`Предупреждение для @${u.username}`, [{ name: 'text', label: 'Текст (пользователь увидит его при следующем визите)', type: 'textarea', max: 500 }], { okText: 'Отправить' });
    if (r) run(() => api(`${base}/warn`, { method: 'POST', body: { text: r.text } }), 'Предупреждение отправлено');
  });
  on('mute', async () => {
    const r = await formDialog('Запретить комментарии', [{ name: 'days', label: 'Срок', type: 'select', value: '1', options: durOpts }], { okText: 'Применить' });
    if (r) run(() => api(`${base}/mute`, { method: 'POST', body: { days: r.days } }), 'Комментарии запрещены');
  });
  on('unmute', () => run(() => api(`${base}/unmute`, { method: 'POST' }), 'Комментарии разрешены'));
  on('upload', () => run(() => api(`${base}/upload-toggle`, { method: 'POST' }), 'Готово'));
  on('reset-profile', async () => { if (await confirmDialog('Сбросить название канала, аватар и описание к стандартным?')) run(() => api(`${base}/reset-profile`, { method: 'POST' }), 'Профиль сброшен'); });
  on('del-comments', async () => { if (await confirmDialog(`Удалить все комментарии @${u.username}?`, { okText: 'Удалить', danger: true })) run(() => api(`${base}/comments`, { method: 'DELETE' }), 'Комментарии удалены'); });
  on('logout-all', () => run(() => api(`${base}/logout-all`, { method: 'POST' }), 'Все сеансы завершены'));
  on('role', async () => {
    const r = await formDialog('Роль пользователя', [{ name: 'role', label: 'Роль', type: 'select', value: u.role, options: [['user', 'Пользователь'], ['moderator', 'Модератор (видео, комментарии, жалобы, мягкие меры)'], ['admin', 'Администратор (полный доступ)']] }]);
    if (r) run(() => api(`${base}/role`, { method: 'POST', body: { role: r.role } }), 'Роль изменена');
  });
  on('verify', () => run(() => api(`${base}/verify`, { method: 'POST' }), 'Готово'));
  on('password', async () => {
    const r = await formDialog(`Новый пароль для @${u.username}`, [{ name: 'password', label: 'Новый пароль (мин. 6 символов)', type: 'text', max: 200 }]);
    if (r) run(() => api(`${base}/reset-password`, { method: 'POST', body: { password: r.password } }), 'Пароль изменён, все сеансы пользователя завершены');
  });
  on('ban', async () => {
    const r = await formDialog(`Заблокировать @${u.username}`, [
      { name: 'days', label: 'Срок', type: 'select', value: '7', options: durOpts },
      { name: 'reason', label: 'Причина (пользователь увидит её при входе)', type: 'text', max: 300 },
    ], { okText: 'Заблокировать', danger: true });
    if (r) run(() => api(`${base}/ban`, { method: 'POST', body: r }), 'Пользователь заблокирован');
  });
  on('unban', () => run(() => api(`${base}/unban`, { method: 'POST' }), 'Пользователь разблокирован'));
  on('delete', async () => {
    if (!(await confirmDialog(`Удалить аккаунт @${u.username} навсегда вместе со всеми видео, комментариями и подписками?`, { okText: 'Удалить навсегда', danger: true }))) return;
    try { await api(base, { method: 'DELETE' }); toast('Аккаунт удалён'); show('users'); } catch (e) { toastErr(e); }
  });
}

async function admComments(main, show, q = '') {
  const { comments } = await api(`/api/admin/comments?q=${encodeURIComponent(q)}`);
  main.innerHTML = `<h3 class="section-title">Комментарии (${comments.length})</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Автор</th><th>Комментарий</th><th>Видео</th><th>Дата</th><th></th></tr></thead><tbody>
    ${comments.map((c) => `<tr data-id="${c.id}"><td><div class="t-user">${avatarImg(c.author.avatar, 24)}@${esc(c.author.username)}</div></td>
      <td style="max-width:380px;word-break:break-word">${esc(c.text)}</td><td><a href="#/watch/${c.videoId}" data-close-admin class="t-title" style="color:var(--accent)">${esc(c.videoTitle)}</a></td><td>${fmtDate(c.createdAt)}</td>
      <td><div class="t-actions"><button class="btn btn-xs btn-danger" data-act="del">${ic('del')}Удалить</button></div></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Комментариев нет</td></tr>'}
    </tbody></table></div>`;
  searchToolbar(main, 'Поиск по тексту или автору', q, (nq) => admComments(main, show, nq));
  bindCloseAdmin(main);
  $$('tr[data-id]', main).forEach((tr) => $('[data-act=del]', tr).addEventListener('click', async () => {
    try { await api(`/api/admin/comments/${tr.dataset.id}`, { method: 'DELETE' }); tr.remove(); toast('Комментарий удалён'); } catch (e) { toastErr(e); }
  }));
}

async function admReports(main, show, status = 'open') {
  const { reports } = await api(`/api/admin/reports?status=${status}`);
  refreshReportCount();
  const typeName = { video: 'Видео', comment: 'Комментарий', user: 'Канал' };
  main.innerHTML = `<h3 class="section-title">Жалобы</h3>
    <div class="chips" style="margin-bottom:16px"><button class="chip ${status === 'open' ? 'active' : ''}" data-s="open">Открытые</button><button class="chip ${status === 'resolved' ? 'active' : ''}" data-s="resolved">Закрытые</button></div>
    ${reports.length ? reports.map((r) => `<div class="card-box" style="padding:14px;margin-bottom:10px" data-id="${r.id}">
      <div class="row" style="justify-content:space-between"><div><span class="tag orange">${typeName[r.type]}</span> <span class="muted" style="font-size:12px">${fmtDate(r.createdAt)} • от @${esc(r.reporter || 'удалён')}</span></div></div>
      <div style="margin:8px 0"><b>Причина:</b> ${esc(r.reason)}</div>
      <div class="muted" style="margin-bottom:10px;word-break:break-word">${r.target ? esc(r.target.label) : '<i>Объект уже удалён</i>'}</div>
      <div class="row">
        ${r.target && r.target.videoId ? `<a class="btn btn-xs" href="#/watch/${r.target.videoId}" data-close-admin>Открыть видео</a>` : ''}
        ${r.target && r.type === 'user' ? `<a class="btn btn-xs" href="#/channel/${r.target.userId}" data-close-admin>Открыть канал</a>` : ''}
        ${r.target && r.target.userId ? '<button class="btn btn-xs" data-act="user">Карточка автора</button>' : ''}
        ${r.target && r.type === 'video' ? `<button class="btn btn-xs" data-act="hide-video">${ic('eyeOff')}Скрыть видео</button><button class="btn btn-xs btn-danger" data-act="del-video">Удалить видео</button>` : ''}
        ${r.target && r.type === 'comment' ? '<button class="btn btn-xs btn-danger" data-act="del-comment">Удалить комментарий</button>' : ''}
        ${r.status === 'open' ? '<button class="btn btn-xs btn-primary" data-act="resolve">Закрыть жалобу</button>' : ''}
      </div></div>`).join('') : '<p class="muted">Жалоб нет 🎉</p>'}`;
  bindCloseAdmin(main);
  $$('.chip[data-s]', main).forEach((c) => c.addEventListener('click', () => admReports(main, show, c.dataset.s)));
  $$('[data-id]', main).forEach((box) => {
    const r = reports.find((x) => String(x.id) === box.dataset.id);
    const on = (a, fn) => { const b = $(`[data-act="${a}"]`, box); if (b) b.addEventListener('click', fn); };
    const resolve = () => api(`/api/admin/reports/${r.id}/resolve`, { method: 'POST' }).catch(() => {});
    on('resolve', async () => { await resolve(); admReports(main, show, status); });
    on('user', async () => {
      const { users } = await api('/api/admin/users');
      const u = users.find((x) => x.id === r.target.userId);
      if (u) show('user', u); else toast('Пользователь не найден', 'error');
    });
    on('hide-video', async () => { try { await api(`/api/admin/videos/${r.target.videoId}/hide`, { method: 'POST' }); await resolve(); toast('Готово'); admReports(main, show, status); } catch (e) { toastErr(e); } });
    on('del-video', async () => {
      if (!(await confirmDialog('Удалить видео навсегда?', { okText: 'Удалить', danger: true }))) return;
      try { await api(`/api/admin/videos/${r.target.videoId}`, { method: 'DELETE' }); toast('Видео удалено'); admReports(main, show, status); } catch (e) { toastErr(e); }
    });
    on('del-comment', async () => { try { await api(`/api/admin/comments/${r.target.commentId}`, { method: 'DELETE' }); toast('Комментарий удалён'); admReports(main, show, status); } catch (e) { toastErr(e); } });
  });
}

async function admLogs(main) {
  const { logs } = await api('/api/admin/logs');
  main.innerHTML = `<h3 class="section-title">Журнал действий</h3>${logs.length ? logs.map((l) => `<div class="log-item"><b>@${esc(l.admin)}</b> — ${esc(l.action)} ${l.details ? `<span class="muted">${esc(l.details)}</span>` : ''}<div class="l-time">${fmtDate(l.createdAt)}</div></div>`).join('') : '<p class="muted">Пока пусто.</p>'}`;
}

async function admSettings(main) {
  const { settings: s } = await api('/api/admin/settings');
  main.innerHTML = `<h3 class="section-title">Настройки сайта</h3><form id="set-form" style="max-width:640px">
    <div class="switch-row"><div><b>Регистрация открыта</b><div class="sr-desc">Если выключить, новые пользователи не смогут создать аккаунт.</div></div><label class="switch"><input type="checkbox" name="registration_open" ${s.registration_open === '1' ? 'checked' : ''}><span></span></label></div>
    <div class="switch-row"><div><b>Загрузка видео разрешена</b><div class="sr-desc">Если выключить, загружать смогут только админы и модераторы.</div></div><label class="switch"><input type="checkbox" name="uploads_open" ${s.uploads_open === '1' ? 'checked' : ''}><span></span></label></div>
    <div class="field mt"><label>Объявление для всех (баннер под шапкой; пусто — скрыто)</label><input class="input" name="announcement" maxlength="500" value="${esc(s.announcement)}"></div>
    <div class="field"><label>Запрещённые слова в комментариях (через запятую) — будут заменены на ***</label><textarea class="textarea" name="banned_words" maxlength="3000">${esc(s.banned_words)}</textarea></div>
    <button class="btn btn-primary" type="submit">Сохранить настройки</button></form>`;
  $('#set-form', main).addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api('/api/admin/settings', { method: 'PUT', body: { registration_open: f.registration_open.checked, uploads_open: f.uploads_open.checked, announcement: f.announcement.value, banned_words: f.banned_words.value } });
      toast('Настройки сохранены'); await loadMe();
    } catch (err) { toastErr(err); }
  });
}

// ─────────── Горячие клавиши: S + Tab ───────────
const keysDown = new Set();
document.addEventListener('keydown', (e) => {
  keysDown.add(e.code);
  const combo = (e.code === 'Tab' && keysDown.has('KeyS')) || (e.code === 'KeyS' && keysDown.has('Tab'));
  if (combo) {
    e.preventDefault();
    // убрать случайно напечатанную «s»/«ы» из поля ввода
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && /[sы]$/i.test(el.value) && e.code === 'Tab') el.value = el.value.slice(0, -1);
    keysDown.clear();
    openAdmin();
  }
});
document.addEventListener('keyup', (e) => keysDown.delete(e.code));
window.addEventListener('blur', () => keysDown.clear());

// ─────────── Инициализация ───────────
function initChrome() {
  $('#menu-btn').addEventListener('click', () => {
    if (window.innerWidth > 1100) {
      document.body.classList.toggle('sidebar-mini');
      try { localStorage.setItem('sidebarMini', document.body.classList.contains('sidebar-mini') ? '1' : '0'); } catch (e) { /* ignore */ }
    } else document.body.classList.toggle('drawer-open');
  });
  $('#sidebar-backdrop').addEventListener('click', () => document.body.classList.remove('drawer-open'));
  try { if (localStorage.getItem('sidebarMini') === '1') document.body.classList.add('sidebar-mini'); } catch (e) { /* ignore */ }
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#search-input').value.trim();
    location.hash = q ? `#/search?q=${encodeURIComponent(q)}` : '#/';
  });
  window.addEventListener('hashchange', () => { document.title = 'Страус.TV — смотрите и делитесь видео'; route(); });
}

(async function init() {
  initChrome();
  try { await loadMe(); } catch (e) { renderChrome(); toast(e.message, 'error'); }
  route();
})();
