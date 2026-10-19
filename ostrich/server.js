/**
 * Страус.TV — видеоплатформа (Node.js + Express + SQLite)
 * Платформа стартует с пустой базой: никаких демо-пользователей и демо-видео.
 */
'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const Database = require('better-sqlite3');

// ───────────────────────────── Конфигурация ─────────────────────────────
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || '500', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_DAYS = 30;
const ALLOW_FRAMING = process.env.ALLOW_FRAMING === '1'; // только для предпросмотра в iframe; в продакшене не включать
const FOREVER = 32503680000000; // 01.01.3000 — «навсегда»

let ADMIN_KEY = (process.env.ADMIN_KEY || '').trim();
if (!ADMIN_KEY) {
  ADMIN_KEY = crypto.randomBytes(12).toString('base64url');
  console.log('──────────────────────────────────────────────────────────');
  console.log(' ADMIN_KEY не задан. Временный ключ администратора:');
  console.log(' ' + ADMIN_KEY);
  console.log(' Задайте переменную окружения ADMIN_KEY, чтобы ключ был постоянным.');
  console.log('──────────────────────────────────────────────────────────');
}

for (const d of ['videos', 'thumbs', 'avatars']) {
  fs.mkdirSync(path.join(UPLOAD_DIR, d), { recursive: true });
}

// ───────────────────────────── База данных ─────────────────────────────
const db = new Database(path.join(DATA_DIR, 'ostrich.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'preset:0',
  bio TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  is_banned INTEGER NOT NULL DEFAULT 0,
  ban_reason TEXT NOT NULL DEFAULT '',
  banned_until INTEGER,
  muted_until INTEGER,
  can_upload INTEGER NOT NULL DEFAULT 1,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_seen INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  impersonator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  filename TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT 'video/mp4',
  thumbnail TEXT,
  duration REAL NOT NULL DEFAULT 0,
  size INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS reactions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  value INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, video_id)
);
CREATE TABLE IF NOT EXISTS subscriptions (
  subscriber_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (subscriber_id, channel_id)
);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  seen INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER,
  admin_name TEXT,
  action TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

const DEFAULT_SETTINGS = {
  announcement: '',
  registration_open: '1',
  uploads_open: '1',
  banned_words: '',
};
const insSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) insSetting.run(k, v);

function getSettings() {
  const out = { ...DEFAULT_SETTINGS };
  for (const r of db.prepare('SELECT key, value FROM settings').all()) out[r.key] = r.value;
  return out;
}

function expireTimedBans() {
  const now = Date.now();
  db.prepare('UPDATE users SET is_banned=0, banned_until=NULL, ban_reason=\'\' WHERE is_banned=1 AND banned_until IS NOT NULL AND banned_until < ?').run(now);
  db.prepare('UPDATE users SET muted_until=NULL WHERE muted_until IS NOT NULL AND muted_until < ?').run(now);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
}
expireTimedBans();
setInterval(expireTimedBans, 60 * 1000).unref();

// ───────────────────────────── Утилиты ─────────────────────────────
const now = () => Date.now();
const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function setSessionCookie(res, token) {
  const parts = [`sid=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${SESSION_DAYS * 86400}`];
  if (IS_PROD) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${IS_PROD ? '; Secure' : ''}`);
}

function createSession(userId, impersonatorId = null) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id, impersonator_id, created_at, expires_at) VALUES (?,?,?,?,?)')
    .run(token, userId, impersonatorId, now(), now() + SESSION_DAYS * 86400000);
  return token;
}

const isBanned = (u) => !!u.is_banned && (!u.banned_until || u.banned_until > now());
const isMuted = (u) => !!u.muted_until && u.muted_until > now();
const isMod = (u) => u && (u.role === 'admin' || u.role === 'moderator');
const isAdmin = (u) => u && u.role === 'admin';

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    avatar: u.avatar,
    bio: u.bio,
    verified: !!u.verified,
    role: u.role,
    createdAt: u.created_at,
  };
}

function fullUser(u) {
  return {
    ...publicUser(u),
    isBanned: isBanned(u),
    banReason: u.ban_reason,
    bannedUntil: u.banned_until,
    mutedUntil: isMuted(u) ? u.muted_until : null,
    canUpload: !!u.can_upload,
    lastSeen: u.last_seen,
  };
}

function videoRow(v) {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    url: `/media/videos/${v.filename}`,
    mime: v.mime,
    thumbnail: v.thumbnail ? `/media/thumbs/${v.thumbnail}` : null,
    duration: v.duration,
    views: v.views,
    isHidden: !!v.is_hidden,
    createdAt: v.created_at,
    size: v.size,
    channel: {
      id: v.user_id,
      username: v.username,
      displayName: v.display_name,
      avatar: v.avatar,
      verified: !!v.verified,
    },
  };
}

function removeFile(sub, name) {
  if (!name) return;
  const p = path.join(UPLOAD_DIR, sub, path.basename(name));
  fs.unlink(p, () => {});
}

function removeAvatarFile(avatar) {
  if (avatar && avatar.startsWith('/media/avatars/')) removeFile('avatars', avatar.split('/').pop());
}

function deleteVideoCompletely(id) {
  const v = db.prepare('SELECT * FROM videos WHERE id=?').get(id);
  if (!v) return null;
  db.prepare("DELETE FROM reports WHERE target_type='comment' AND target_id IN (SELECT id FROM comments WHERE video_id=?)").run(id);
  db.prepare('DELETE FROM videos WHERE id=?').run(id);
  db.prepare("DELETE FROM reports WHERE target_type='video' AND target_id=?").run(id);
  removeFile('videos', v.filename);
  removeFile('thumbs', v.thumbnail);
  return v;
}

function deleteUserCompletely(id) {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  if (!u) return null;
  const vids = db.prepare('SELECT id FROM videos WHERE user_id=?').all(id);
  for (const v of vids) deleteVideoCompletely(v.id);
  removeAvatarFile(u.avatar);
  db.prepare("DELETE FROM reports WHERE target_type='comment' AND target_id IN (SELECT id FROM comments WHERE user_id=?)").run(id);
  db.prepare("DELETE FROM reports WHERE target_type='user' AND target_id=?").run(id);
  db.prepare('DELETE FROM users WHERE id=?').run(id);
  return u;
}

function logAction(actor, action, details = '') {
  db.prepare('INSERT INTO audit_log (admin_id, admin_name, action, details, created_at) VALUES (?,?,?,?,?)')
    .run(actor.id, actor.username, action, details, now());
}

function filterBannedWords(text) {
  const words = getSettings().banned_words.split(',').map((w) => w.trim()).filter(Boolean);
  let out = text;
  for (const w of words) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, (m) => '*'.repeat(m.length));
  }
  return out;
}

// Простой лимитер запросов в памяти
function rateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  setInterval(() => {
    const t = now();
    for (const [k, v] of hits) if (v.reset < t) hits.delete(k);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip + ':' + (req.user ? req.user.id : '');
    const t = now();
    let h = hits.get(key);
    if (!h || h.reset < t) { h = { count: 0, reset: t + windowMs }; hits.set(key, h); }
    h.count++;
    if (h.count > max) return res.status(429).json({ error: message || 'Слишком много запросов. Попробуйте позже.' });
    next();
  };
}

const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Слишком много попыток входа. Подождите 15 минут.' });
const commentLimiter = rateLimiter({ windowMs: 60 * 1000, max: 10, message: 'Вы пишете слишком часто. Подождите минуту.' });
const uploadLimiter = rateLimiter({ windowMs: 60 * 60 * 1000, max: 30, message: 'Слишком много загрузок за час.' });

// ───────────────────────────── Приложение ─────────────────────────────
const app = express();
app.set('trust proxy', 1); // Render работает за прокси
app.disable('x-powered-by');

// Защитные заголовки (помогают сайту выглядеть надёжным для браузеров и антифишинговых фильтров)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!ALLOW_FRAMING) res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; form-action 'self'; " +
    (ALLOW_FRAMING ? '' : "frame-ancestors 'self'; ") + "base-uri 'self'; object-src 'none'");
  if (IS_PROD) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});

app.use(express.json({ limit: '1mb' }));

// Аутентификация по cookie-сессии
app.use((req, res, next) => {
  req.user = null;
  req.impersonator = null;
  const token = parseCookies(req.headers.cookie).sid;
  if (!token) return next();
  const s = db.prepare('SELECT * FROM sessions WHERE token=? AND expires_at > ?').get(token, now());
  if (!s) return next();
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(s.user_id);
  if (!u) return next();
  if (isBanned(u) && !s.impersonator_id) {
    db.prepare('DELETE FROM sessions WHERE token=?').run(token);
    return next();
  }
  req.user = u;
  req.sessionToken = token;
  if (s.impersonator_id) req.impersonator = db.prepare('SELECT * FROM users WHERE id=?').get(s.impersonator_id) || null;
  if (!u.last_seen || now() - u.last_seen > 60000) {
    if (!req.impersonator) db.prepare('UPDATE users SET last_seen=? WHERE id=?').run(now(), u.id);
  }
  next();
});

const requireAuth = (req, res, next) => (req.user ? next() : res.status(401).json({ error: 'Нужно войти в аккаунт' }));
const requireMod = (req, res, next) => (isMod(req.user) ? next() : res.status(403).json({ error: 'Нет прав модератора' }));
const requireAdmin = (req, res, next) => (isAdmin(req.user) ? next() : res.status(403).json({ error: 'Только для администратора' }));

// Загрузка файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = file.fieldname === 'video' ? 'videos' : file.fieldname === 'avatar' ? 'avatars' : 'thumbs';
    cb(null, path.join(UPLOAD_DIR, sub));
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname || '').toLowerCase().match(/^\.[a-z0-9]{1,5}$/) || [''])[0];
    cb(null, crypto.randomBytes(16).toString('hex') + ext);
  },
});
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (/^video\//.test(file.mimetype)) return cb(null, true);
      return cb(new Error('Файл видео должен быть в видеоформате (MP4, WebM, MOV…)'));
    }
    if (file.fieldname === 'thumbnail' || file.fieldname === 'avatar') {
      if (IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
      return cb(new Error('Изображение должно быть JPG, PNG, WEBP или GIF'));
    }
    cb(new Error('Неизвестное поле файла'));
  },
});
function handleUpload(mw) {
  return (req, res, next) => mw(req, res, (err) => {
    if (!err) return next();
    const msg = err.code === 'LIMIT_FILE_SIZE' ? `Файл слишком большой (максимум ${MAX_UPLOAD_MB} МБ)` : err.message;
    // удалить уже сохранённые файлы
    const files = req.files ? Object.values(req.files).flat() : req.file ? [req.file] : [];
    files.forEach((f) => fs.unlink(f.path, () => {}));
    res.status(400).json({ error: msg });
  });
}
const cleanupFiles = (req) => {
  const files = req.files ? Object.values(req.files).flat() : req.file ? [req.file] : [];
  files.forEach((f) => fs.unlink(f.path, () => {}));
};

// ───────────────────────────── Auth API ─────────────────────────────
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,24}$/;

app.post('/api/auth/register', authLimiter, (req, res) => {
  if (getSettings().registration_open !== '1') return res.status(403).json({ error: 'Регистрация временно закрыта администратором' });
  const username = clean(req.body.username, 24);
  const password = String(req.body.password || '');
  const displayName = clean(req.body.displayName, 50) || username;
  const avatar = /^preset:\d{1,2}$/.test(req.body.avatar || '') ? req.body.avatar : `preset:${crypto.randomInt(0, 12)}`;
  if (!USERNAME_RE.test(username)) return res.status(400).json({ error: 'Логин: 3–24 символа, латинские буквы, цифры, «_», «.», «-»' });
  if (password.length < 6 || password.length > 200) return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  if (db.prepare('SELECT 1 FROM users WHERE username=?').get(username)) return res.status(409).json({ error: 'Этот логин уже занят' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash, display_name, avatar, created_at, last_seen) VALUES (?,?,?,?,?,?)')
    .run(username, hash, displayName, avatar, now(), now());
  const token = createSession(info.lastInsertRowid);
  setSessionCookie(res, token);
  res.json({ ok: true });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const username = clean(req.body.username, 24);
  const password = String(req.body.password || '');
  expireTimedBans();
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) return res.status(401).json({ error: 'Неверный логин или пароль' });
  if (isBanned(u)) {
    const until = u.banned_until ? ` до ${new Date(u.banned_until).toLocaleString('ru-RU')}` : ' навсегда';
    return res.status(403).json({ error: `Аккаунт заблокирован${until}.${u.ban_reason ? ' Причина: ' + u.ban_reason : ''}` });
  }
  const token = createSession(u.id);
  setSessionCookie(res, token);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  if (req.sessionToken) db.prepare('DELETE FROM sessions WHERE token=?').run(req.sessionToken);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const s = getSettings();
  const settings = { announcement: s.announcement, registrationOpen: s.registration_open === '1', uploadsOpen: s.uploads_open === '1', maxUploadMb: MAX_UPLOAD_MB };
  if (!req.user) return res.json({ user: null, settings });
  const warnings = db.prepare('SELECT id, text, created_at AS createdAt FROM warnings WHERE user_id=? AND seen=0 ORDER BY id').all(req.user.id);
  res.json({
    user: fullUser(req.user),
    impersonator: req.impersonator ? publicUser(req.impersonator) : null,
    warnings: req.impersonator ? [] : warnings,
    settings,
  });
});

app.post('/api/auth/stop-impersonate', requireAuth, (req, res) => {
  if (!req.impersonator) return res.status(400).json({ error: 'Вы не в режиме входа под чужим аккаунтом' });
  const admin = req.impersonator;
  if (!isAdmin(admin)) return res.status(403).json({ error: 'Нет прав' });
  db.prepare('DELETE FROM sessions WHERE token=?').run(req.sessionToken);
  const token = createSession(admin.id);
  setSessionCookie(res, token);
  logAction(admin, 'Вышел из аккаунта', `@${req.user.username}`);
  res.json({ ok: true });
});

app.post('/api/warnings/:id/seen', requireAuth, (req, res) => {
  if (!req.impersonator) db.prepare('UPDATE warnings SET seen=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ───────────────────────────── Профиль ─────────────────────────────
app.put('/api/me', requireAuth, handleUpload(upload.single('avatar')), (req, res) => {
  const u = req.user;
  const displayName = req.body.displayName !== undefined ? clean(req.body.displayName, 50) : u.display_name;
  const bio = req.body.bio !== undefined ? clean(req.body.bio, 1000) : u.bio;
  if (!displayName) { cleanupFiles(req); return res.status(400).json({ error: 'Имя канала не может быть пустым' }); }
  let avatar = u.avatar;
  if (req.file) {
    avatar = `/media/avatars/${req.file.filename}`;
  } else if (/^preset:\d{1,2}$/.test(req.body.avatarPreset || '')) {
    avatar = req.body.avatarPreset;
  }
  if (avatar !== u.avatar) removeAvatarFile(u.avatar);
  db.prepare('UPDATE users SET display_name=?, bio=?, avatar=? WHERE id=?').run(displayName, bio, avatar, u.id);
  res.json({ user: fullUser(db.prepare('SELECT * FROM users WHERE id=?').get(u.id)) });
});

app.post('/api/me/password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!bcrypt.compareSync(String(oldPassword || ''), req.user.password_hash)) return res.status(400).json({ error: 'Текущий пароль неверен' });
  if (String(newPassword || '').length < 6) return res.status(400).json({ error: 'Новый пароль должен быть не короче 6 символов' });
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(String(newPassword), 10), req.user.id);
  db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').run(req.user.id, req.sessionToken);
  res.json({ ok: true });
});

app.delete('/api/me', requireAuth, (req, res) => {
  if (req.impersonator) return res.status(403).json({ error: 'Нельзя удалить аккаунт в режиме входа под чужим аккаунтом. Используйте панель администратора.' });
  if (!bcrypt.compareSync(String(req.body.password || ''), req.user.password_hash)) return res.status(400).json({ error: 'Неверный пароль' });
  deleteUserCompletely(req.user.id);
  clearSessionCookie(res);
  res.json({ ok: true });
});

// ───────────────────────────── Видео ─────────────────────────────
const VIDEO_SELECT = `SELECT v.*, u.username, u.display_name, u.avatar, u.verified
  FROM videos v JOIN users u ON u.id = v.user_id`;
const PUBLIC_FILTER = 'v.is_hidden = 0 AND u.is_banned = 0';

app.get('/api/videos', (req, res) => {
  const q = clean(req.query.q, 100);
  const sort = req.query.sort === 'popular' ? 'v.views DESC, v.created_at DESC' : 'v.created_at DESC';
  const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200);
  const exclude = parseInt(req.query.exclude, 10) || 0;
  let rows;
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, (m) => '\\' + m)}%`;
    rows = db.prepare(`${VIDEO_SELECT} WHERE ${PUBLIC_FILTER} AND v.id<>? AND (v.title LIKE ? ESCAPE '\\' OR v.description LIKE ? ESCAPE '\\' OR u.display_name LIKE ? ESCAPE '\\' OR u.username LIKE ? ESCAPE '\\') ORDER BY ${sort} LIMIT ?`)
      .all(exclude, like, like, like, like, limit);
  } else {
    rows = db.prepare(`${VIDEO_SELECT} WHERE ${PUBLIC_FILTER} AND v.id<>? ORDER BY ${sort} LIMIT ?`).all(exclude, limit);
  }
  res.json({ videos: rows.map(videoRow) });
});

app.get('/api/videos/:id', (req, res) => {
  const v = db.prepare(`${VIDEO_SELECT} WHERE v.id=?`).get(req.params.id);
  const owner = v && req.user && req.user.id === v.user_id;
  if (!v) return res.status(404).json({ error: 'Видео не найдено' });
  const ownerUser = db.prepare('SELECT * FROM users WHERE id=?').get(v.user_id);
  if ((v.is_hidden || isBanned(ownerUser)) && !owner && !isMod(req.user)) return res.status(404).json({ error: 'Видео недоступно' });
  const likes = db.prepare('SELECT COUNT(*) c FROM reactions WHERE video_id=? AND value=1').get(v.id).c;
  const dislikes = db.prepare('SELECT COUNT(*) c FROM reactions WHERE video_id=? AND value=-1').get(v.id).c;
  const my = req.user ? db.prepare('SELECT value FROM reactions WHERE video_id=? AND user_id=?').get(v.id, req.user.id) : null;
  const subs = db.prepare('SELECT COUNT(*) c FROM subscriptions WHERE channel_id=?').get(v.user_id).c;
  const subscribed = req.user ? !!db.prepare('SELECT 1 FROM subscriptions WHERE channel_id=? AND subscriber_id=?').get(v.user_id, req.user.id) : false;
  res.json({ video: { ...videoRow(v), likes, dislikes, myReaction: my ? my.value : 0, subscribers: subs, subscribed, isOwner: !!owner } });
});

app.post('/api/videos', requireAuth, uploadLimiter,
  handleUpload(upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }])),
  (req, res) => {
    const u = req.user;
    const videoFile = req.files && req.files.video && req.files.video[0];
    const thumbFile = req.files && req.files.thumbnail && req.files.thumbnail[0];
    const fail = (code, msg) => { cleanupFiles(req); res.status(code).json({ error: msg }); };
    if (getSettings().uploads_open !== '1' && !isMod(u)) return fail(403, 'Загрузка видео временно отключена администратором');
    if (!u.can_upload) return fail(403, 'Администратор запретил вам загружать видео');
    if (!videoFile) return fail(400, 'Выберите видеофайл');
    const title = clean(req.body.title, 100);
    const description = clean(req.body.description, 5000);
    if (!title) return fail(400, 'Укажите название видео');
    const duration = Math.max(0, Math.min(parseFloat(req.body.duration) || 0, 86400 * 2));
    const info = db.prepare('INSERT INTO videos (user_id, title, description, filename, mime, thumbnail, duration, size, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(u.id, title, description, videoFile.filename, videoFile.mimetype, thumbFile ? thumbFile.filename : null, duration, videoFile.size, now());
    res.json({ id: info.lastInsertRowid });
  });

app.put('/api/videos/:id', requireAuth, handleUpload(upload.single('thumbnail')), (req, res) => {
  const v = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!v) { cleanupFiles(req); return res.status(404).json({ error: 'Видео не найдено' }); }
  if (v.user_id !== req.user.id && !isMod(req.user)) { cleanupFiles(req); return res.status(403).json({ error: 'Нет прав' }); }
  const title = req.body.title !== undefined ? clean(req.body.title, 100) : v.title;
  const description = req.body.description !== undefined ? clean(req.body.description, 5000) : v.description;
  if (!title) { cleanupFiles(req); return res.status(400).json({ error: 'Название не может быть пустым' }); }
  let thumb = v.thumbnail;
  if (req.file) { removeFile('thumbs', v.thumbnail); thumb = req.file.filename; }
  db.prepare('UPDATE videos SET title=?, description=?, thumbnail=? WHERE id=?').run(title, description, thumb, v.id);
  if (v.user_id !== req.user.id) logAction(req.user, 'Изменил видео', `#${v.id} «${v.title}»`);
  res.json({ ok: true });
});

app.delete('/api/videos/:id', requireAuth, (req, res) => {
  const v = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'Видео не найдено' });
  if (v.user_id !== req.user.id && !isMod(req.user)) return res.status(403).json({ error: 'Нет прав' });
  deleteVideoCompletely(v.id);
  if (v.user_id !== req.user.id) logAction(req.user, 'Удалил видео', `#${v.id} «${v.title}»`);
  res.json({ ok: true });
});

const viewSeen = new Map();
setInterval(() => { const t = now(); for (const [k, ts] of viewSeen) if (t - ts > 6 * 3600000) viewSeen.delete(k); }, 3600000).unref();
app.post('/api/videos/:id/view', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const key = `${id}:${req.user ? 'u' + req.user.id : req.ip}`;
  const last = viewSeen.get(key);
  if (!last || now() - last > 6 * 3600000) {
    viewSeen.set(key, now());
    db.prepare('UPDATE videos SET views = views + 1 WHERE id=?').run(id);
  }
  const v = db.prepare('SELECT views FROM videos WHERE id=?').get(id);
  res.json({ views: v ? v.views : 0 });
});

app.post('/api/videos/:id/react', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!db.prepare('SELECT 1 FROM videos WHERE id=?').get(id)) return res.status(404).json({ error: 'Видео не найдено' });
  const value = [1, -1, 0].includes(req.body.value) ? req.body.value : 0;
  if (value === 0) db.prepare('DELETE FROM reactions WHERE user_id=? AND video_id=?').run(req.user.id, id);
  else db.prepare('INSERT INTO reactions (user_id, video_id, value, created_at) VALUES (?,?,?,?) ON CONFLICT(user_id, video_id) DO UPDATE SET value=excluded.value, created_at=excluded.created_at')
    .run(req.user.id, id, value, now());
  const likes = db.prepare('SELECT COUNT(*) c FROM reactions WHERE video_id=? AND value=1').get(id).c;
  const dislikes = db.prepare('SELECT COUNT(*) c FROM reactions WHERE video_id=? AND value=-1').get(id).c;
  res.json({ likes, dislikes, myReaction: value });
});

// ───────────────────────────── Комментарии ─────────────────────────────
app.get('/api/videos/:id/comments', (req, res) => {
  const v = db.prepare('SELECT user_id FROM videos WHERE id=?').get(req.params.id);
  const rows = db.prepare(`SELECT c.*, u.username, u.display_name, u.avatar, u.verified, u.role FROM comments c
    JOIN users u ON u.id=c.user_id WHERE c.video_id=? AND u.is_banned=0 ORDER BY c.created_at DESC LIMIT 500`).all(req.params.id);
  res.json({
    comments: rows.map((c) => ({
      id: c.id, text: c.text, createdAt: c.created_at,
      author: { id: c.user_id, username: c.username, displayName: c.display_name, avatar: c.avatar, verified: !!c.verified, role: c.role },
      isVideoOwner: v ? v.user_id === c.user_id : false,
      canDelete: !!req.user && (req.user.id === c.user_id || (v && v.user_id === req.user.id) || isMod(req.user)),
    })),
  });
});

app.post('/api/videos/:id/comments', requireAuth, commentLimiter, (req, res) => {
  if (isMuted(req.user)) {
    const until = req.user.muted_until >= FOREVER ? 'навсегда' : 'до ' + new Date(req.user.muted_until).toLocaleString('ru-RU');
    return res.status(403).json({ error: `Администратор запретил вам писать комментарии (${until})` });
  }
  const v = db.prepare('SELECT id FROM videos WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'Видео не найдено' });
  const text = filterBannedWords(clean(req.body.text, 2000));
  if (!text) return res.status(400).json({ error: 'Комментарий пустой' });
  const info = db.prepare('INSERT INTO comments (video_id, user_id, text, created_at) VALUES (?,?,?,?)').run(v.id, req.user.id, text, now());
  res.json({ id: info.lastInsertRowid });
});

app.delete('/api/comments/:id', requireAuth, (req, res) => {
  const c = db.prepare('SELECT c.*, v.user_id AS video_owner FROM comments c JOIN videos v ON v.id=c.video_id WHERE c.id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Комментарий не найден' });
  if (c.user_id !== req.user.id && c.video_owner !== req.user.id && !isMod(req.user)) return res.status(403).json({ error: 'Нет прав' });
  db.prepare('DELETE FROM comments WHERE id=?').run(c.id);
  db.prepare("DELETE FROM reports WHERE target_type='comment' AND target_id=?").run(c.id);
  if (isMod(req.user) && c.user_id !== req.user.id && c.video_owner !== req.user.id) logAction(req.user, 'Удалил комментарий', `#${c.id}: «${c.text.slice(0, 80)}»`);
  res.json({ ok: true });
});

// ───────────────────────────── Каналы и подписки ─────────────────────────────
app.get('/api/channels/:id', (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'Канал не найден' });
  const self = req.user && req.user.id === u.id;
  if (isBanned(u) && !self && !isMod(req.user)) return res.status(404).json({ error: 'Канал заблокирован' });
  const hiddenOk = self || isMod(req.user);
  const vids = db.prepare(`${VIDEO_SELECT} WHERE v.user_id=? ${hiddenOk ? '' : 'AND v.is_hidden=0'} ORDER BY v.created_at DESC`).all(u.id);
  const subs = db.prepare('SELECT COUNT(*) c FROM subscriptions WHERE channel_id=?').get(u.id).c;
  const subscribed = req.user ? !!db.prepare('SELECT 1 FROM subscriptions WHERE channel_id=? AND subscriber_id=?').get(u.id, req.user.id) : false;
  const totalViews = vids.reduce((s, v) => s + v.views, 0);
  res.json({ channel: { ...publicUser(u), subscribers: subs, subscribed, isSelf: !!self, totalViews, isBanned: isBanned(u) }, videos: vids.map(videoRow) });
});

app.post('/api/channels/:id/subscribe', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.user.id) return res.status(400).json({ error: 'Нельзя подписаться на свой канал' });
  if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(id)) return res.status(404).json({ error: 'Канал не найден' });
  const exists = db.prepare('SELECT 1 FROM subscriptions WHERE subscriber_id=? AND channel_id=?').get(req.user.id, id);
  if (exists) db.prepare('DELETE FROM subscriptions WHERE subscriber_id=? AND channel_id=?').run(req.user.id, id);
  else db.prepare('INSERT INTO subscriptions (subscriber_id, channel_id, created_at) VALUES (?,?,?)').run(req.user.id, id, now());
  const subs = db.prepare('SELECT COUNT(*) c FROM subscriptions WHERE channel_id=?').get(id).c;
  res.json({ subscribed: !exists, subscribers: subs });
});

app.get('/api/me/subscriptions', requireAuth, (req, res) => {
  const channels = db.prepare(`SELECT u.* FROM subscriptions s JOIN users u ON u.id=s.channel_id
    WHERE s.subscriber_id=? AND u.is_banned=0 ORDER BY u.display_name`).all(req.user.id).map(publicUser);
  const videos = db.prepare(`${VIDEO_SELECT} JOIN subscriptions s ON s.channel_id=v.user_id
    WHERE s.subscriber_id=? AND ${PUBLIC_FILTER} ORDER BY v.created_at DESC LIMIT 100`).all(req.user.id).map(videoRow);
  res.json({ channels, videos });
});

app.get('/api/me/liked', requireAuth, (req, res) => {
  const videos = db.prepare(`${VIDEO_SELECT} JOIN reactions r ON r.video_id=v.id
    WHERE r.user_id=? AND r.value=1 AND ${PUBLIC_FILTER} ORDER BY r.created_at DESC LIMIT 200`).all(req.user.id).map(videoRow);
  res.json({ videos });
});

// ───────────────────────────── Жалобы ─────────────────────────────
app.post('/api/reports', requireAuth, rateLimiter({ windowMs: 3600000, max: 20 }), (req, res) => {
  const type = ['video', 'comment', 'user'].includes(req.body.type) ? req.body.type : null;
  const targetId = parseInt(req.body.id, 10);
  const reason = clean(req.body.reason, 500);
  if (!type || !targetId) return res.status(400).json({ error: 'Неверная жалоба' });
  if (!reason) return res.status(400).json({ error: 'Укажите причину' });
  db.prepare('INSERT INTO reports (reporter_id, target_type, target_id, reason, created_at) VALUES (?,?,?,?,?)').run(req.user.id, type, targetId, reason, now());
  res.json({ ok: true });
});

// ───────────────────────────── Админ-панель ─────────────────────────────
// Получение прав администратора по секретному ключу (ADMIN_KEY)
app.post('/api/admin/claim', requireAuth, rateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Слишком много попыток. Подождите 15 минут.' }), (req, res) => {
  if (req.impersonator) return res.status(403).json({ error: 'Недоступно в режиме входа под чужим аккаунтом' });
  const key = String(req.body.key || '');
  const a = Buffer.from(key);
  const b = Buffer.from(ADMIN_KEY);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(403).json({ error: 'Неверный ключ администратора' });
  db.prepare("UPDATE users SET role='admin' WHERE id=?").run(req.user.id);
  logAction(req.user, 'Получил права администратора по ключу', '');
  res.json({ ok: true });
});

const admin = express.Router();
admin.use(requireAuth, requireMod);

admin.get('/stats', (req, res) => {
  const c = (sql, ...a) => db.prepare(sql).get(...a).c;
  res.json({
    users: c('SELECT COUNT(*) c FROM users'),
    banned: c('SELECT COUNT(*) c FROM users WHERE is_banned=1'),
    videos: c('SELECT COUNT(*) c FROM videos'),
    hidden: c('SELECT COUNT(*) c FROM videos WHERE is_hidden=1'),
    comments: c('SELECT COUNT(*) c FROM comments'),
    views: db.prepare('SELECT COALESCE(SUM(views),0) c FROM videos').get().c,
    storage: db.prepare('SELECT COALESCE(SUM(size),0) c FROM videos').get().c,
    openReports: c("SELECT COUNT(*) c FROM reports WHERE status='open'"),
    online: c('SELECT COUNT(*) c FROM users WHERE last_seen > ?', now() - 5 * 60000),
    newUsers24h: c('SELECT COUNT(*) c FROM users WHERE created_at > ?', now() - 86400000),
  });
});

admin.get('/videos', (req, res) => {
  const q = clean(req.query.q, 100);
  const like = `%${q}%`;
  const rows = db.prepare(`${VIDEO_SELECT} WHERE (? = '' OR v.title LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?) ORDER BY v.created_at DESC LIMIT 500`).all(q, like, like, like);
  res.json({ videos: rows.map(videoRow) });
});

admin.post('/videos/:id/hide', (req, res) => {
  const v = db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id);
  if (!v) return res.status(404).json({ error: 'Видео не найдено' });
  db.prepare('UPDATE videos SET is_hidden=? WHERE id=?').run(v.is_hidden ? 0 : 1, v.id);
  logAction(req.user, v.is_hidden ? 'Вернул видео в доступ' : 'Скрыл видео', `#${v.id} «${v.title}»`);
  res.json({ isHidden: !v.is_hidden });
});

admin.delete('/videos/:id', (req, res) => {
  const v = deleteVideoCompletely(req.params.id);
  if (!v) return res.status(404).json({ error: 'Видео не найдено' });
  logAction(req.user, 'Удалил видео', `#${v.id} «${v.title}»`);
  res.json({ ok: true });
});

admin.get('/users', (req, res) => {
  const q = clean(req.query.q, 100);
  const like = `%${q}%`;
  const rows = db.prepare(`SELECT u.*,
      (SELECT COUNT(*) FROM videos WHERE user_id=u.id) AS video_count,
      (SELECT COUNT(*) FROM comments WHERE user_id=u.id) AS comment_count,
      (SELECT COUNT(*) FROM warnings WHERE user_id=u.id) AS warning_count
    FROM users u WHERE (? = '' OR u.username LIKE ? OR u.display_name LIKE ?) ORDER BY u.created_at DESC LIMIT 500`).all(q, like, like);
  res.json({ users: rows.map((u) => ({ ...fullUser(u), videoCount: u.video_count, commentCount: u.comment_count, warningCount: u.warning_count })) });
});

// Загружает цель и проверяет, что модератор не трогает старших по роли
function targetUser(req, res, { adminOnly = false } = {}) {
  if (adminOnly && !isAdmin(req.user)) { res.status(403).json({ error: 'Это действие доступно только администратору' }); return null; }
  const t = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!t) { res.status(404).json({ error: 'Пользователь не найден' }); return null; }
  if (t.id === req.user.id) { res.status(400).json({ error: 'Нельзя применить это действие к себе' }); return null; }
  if (!isAdmin(req.user) && isMod(t)) { res.status(403).json({ error: 'Модератор не может применять действия к модераторам и администраторам' }); return null; }
  return t;
}

const durationToUntil = (days) => {
  const d = parseFloat(days);
  return d > 0 ? now() + d * 86400000 : null;
};
const untilText = (until) => (until ? 'до ' + new Date(until).toLocaleString('ru-RU') : 'навсегда');

admin.post('/users/:id/ban', (req, res) => {
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  const until = durationToUntil(req.body.days);
  const reason = clean(req.body.reason, 300);
  db.prepare('UPDATE users SET is_banned=1, banned_until=?, ban_reason=? WHERE id=?').run(until, reason, t.id);
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(t.id);
  logAction(req.user, 'Заблокировал пользователя', `@${t.username} ${untilText(until)}${reason ? '. Причина: ' + reason : ''}`);
  res.json({ ok: true });
});

admin.post('/users/:id/unban', (req, res) => {
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  db.prepare("UPDATE users SET is_banned=0, banned_until=NULL, ban_reason='' WHERE id=?").run(t.id);
  logAction(req.user, 'Разблокировал пользователя', `@${t.username}`);
  res.json({ ok: true });
});

admin.delete('/users/:id', (req, res) => {
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  deleteUserCompletely(t.id);
  logAction(req.user, 'Удалил пользователя', `@${t.username} (со всеми видео и комментариями)`);
  res.json({ ok: true });
});

admin.post('/users/:id/impersonate', (req, res) => {
  if (req.impersonator) return res.status(400).json({ error: 'Сначала вернитесь в свой аккаунт' });
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  db.prepare('DELETE FROM sessions WHERE token=?').run(req.sessionToken);
  const token = createSession(t.id, req.user.id);
  setSessionCookie(res, token);
  logAction(req.user, 'Вошёл под аккаунтом', `@${t.username}`);
  res.json({ ok: true });
});

admin.post('/users/:id/role', (req, res) => {
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  const role = ['user', 'moderator', 'admin'].includes(req.body.role) ? req.body.role : 'user';
  db.prepare('UPDATE users SET role=? WHERE id=?').run(role, t.id);
  const names = { user: 'пользователь', moderator: 'модератор', admin: 'администратор' };
  logAction(req.user, 'Изменил роль', `@${t.username} → ${names[role]}`);
  res.json({ ok: true });
});

admin.post('/users/:id/mute', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  const until = durationToUntil(req.body.days) || FOREVER;
  db.prepare('UPDATE users SET muted_until=? WHERE id=?').run(until, t.id);
  logAction(req.user, 'Запретил комментарии', `@${t.username} ${until >= FOREVER ? 'навсегда' : untilText(until)}`);
  res.json({ ok: true });
});

admin.post('/users/:id/unmute', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  db.prepare('UPDATE users SET muted_until=NULL WHERE id=?').run(t.id);
  logAction(req.user, 'Разрешил комментарии', `@${t.username}`);
  res.json({ ok: true });
});

admin.post('/users/:id/upload-toggle', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  db.prepare('UPDATE users SET can_upload=? WHERE id=?').run(t.can_upload ? 0 : 1, t.id);
  logAction(req.user, t.can_upload ? 'Запретил загрузку видео' : 'Разрешил загрузку видео', `@${t.username}`);
  res.json({ canUpload: !t.can_upload });
});

admin.post('/users/:id/verify', (req, res) => {
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  db.prepare('UPDATE users SET verified=? WHERE id=?').run(t.verified ? 0 : 1, t.id);
  logAction(req.user, t.verified ? 'Снял галочку подтверждения' : 'Выдал галочку подтверждения', `@${t.username}`);
  res.json({ verified: !t.verified });
});

admin.post('/users/:id/warn', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  const text = clean(req.body.text, 500);
  if (!text) return res.status(400).json({ error: 'Введите текст предупреждения' });
  db.prepare('INSERT INTO warnings (user_id, admin_id, text, created_at) VALUES (?,?,?,?)').run(t.id, req.user.id, text, now());
  logAction(req.user, 'Вынес предупреждение', `@${t.username}: ${text}`);
  res.json({ ok: true });
});

admin.post('/users/:id/reset-password', (req, res) => {
  const t = targetUser(req, res, { adminOnly: true }); if (!t) return;
  const pwd = String(req.body.password || '');
  if (pwd.length < 6) return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов' });
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(pwd, 10), t.id);
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(t.id);
  logAction(req.user, 'Сменил пароль пользователю', `@${t.username}`);
  res.json({ ok: true });
});

admin.post('/users/:id/reset-profile', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  removeAvatarFile(t.avatar);
  db.prepare("UPDATE users SET display_name=username, bio='', avatar='preset:0' WHERE id=?").run(t.id);
  logAction(req.user, 'Сбросил профиль (имя, аватар, описание)', `@${t.username}`);
  res.json({ ok: true });
});

admin.post('/users/:id/logout-all', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(t.id);
  logAction(req.user, 'Завершил все сеансы', `@${t.username}`);
  res.json({ ok: true });
});

admin.delete('/users/:id/comments', (req, res) => {
  const t = targetUser(req, res); if (!t) return;
  db.prepare("DELETE FROM reports WHERE target_type='comment' AND target_id IN (SELECT id FROM comments WHERE user_id=?)").run(t.id);
  const n = db.prepare('DELETE FROM comments WHERE user_id=?').run(t.id).changes;
  logAction(req.user, 'Удалил все комментарии пользователя', `@${t.username} (${n} шт.)`);
  res.json({ deleted: n });
});

admin.get('/users/:id/warnings', (req, res) => {
  const rows = db.prepare(`SELECT w.*, a.username AS admin_name FROM warnings w LEFT JOIN users a ON a.id=w.admin_id WHERE w.user_id=? ORDER BY w.id DESC`).all(req.params.id);
  res.json({ warnings: rows.map((w) => ({ id: w.id, text: w.text, seen: !!w.seen, createdAt: w.created_at, admin: w.admin_name })) });
});

admin.get('/comments', (req, res) => {
  const q = clean(req.query.q, 100);
  const like = `%${q}%`;
  const rows = db.prepare(`SELECT c.*, u.username, u.display_name, u.avatar, v.title AS video_title FROM comments c
    JOIN users u ON u.id=c.user_id JOIN videos v ON v.id=c.video_id
    WHERE (? = '' OR c.text LIKE ? OR u.username LIKE ?) ORDER BY c.created_at DESC LIMIT 500`).all(q, like, like);
  res.json({ comments: rows.map((c) => ({ id: c.id, text: c.text, createdAt: c.created_at, videoId: c.video_id, videoTitle: c.video_title, author: { id: c.user_id, username: c.username, displayName: c.display_name, avatar: c.avatar } })) });
});

admin.delete('/comments/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM comments WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Комментарий не найден' });
  db.prepare('DELETE FROM comments WHERE id=?').run(c.id);
  db.prepare("DELETE FROM reports WHERE target_type='comment' AND target_id=?").run(c.id);
  logAction(req.user, 'Удалил комментарий', `#${c.id}: «${c.text.slice(0, 80)}»`);
  res.json({ ok: true });
});

admin.get('/reports', (req, res) => {
  const status = req.query.status === 'resolved' ? 'resolved' : 'open';
  const rows = db.prepare(`SELECT r.*, u.username AS reporter FROM reports r LEFT JOIN users u ON u.id=r.reporter_id WHERE r.status=? ORDER BY r.id DESC LIMIT 300`).all(status);
  const out = rows.map((r) => {
    let target = null;
    if (r.target_type === 'video') {
      const v = db.prepare('SELECT v.id, v.title, u.username, u.id AS uid FROM videos v JOIN users u ON u.id=v.user_id WHERE v.id=?').get(r.target_id);
      if (v) target = { label: `Видео «${v.title}» от @${v.username}`, videoId: v.id, userId: v.uid };
    } else if (r.target_type === 'comment') {
      const c = db.prepare('SELECT c.id, c.text, c.video_id, u.username, u.id AS uid FROM comments c JOIN users u ON u.id=c.user_id WHERE c.id=?').get(r.target_id);
      if (c) target = { label: `Комментарий @${c.username}: «${c.text.slice(0, 140)}»`, videoId: c.video_id, commentId: c.id, userId: c.uid };
    } else if (r.target_type === 'user') {
      const u = db.prepare('SELECT id, username, display_name FROM users WHERE id=?').get(r.target_id);
      if (u) target = { label: `Канал ${u.display_name} (@${u.username})`, userId: u.id };
    }
    return { id: r.id, type: r.target_type, targetId: r.target_id, reason: r.reason, status: r.status, createdAt: r.created_at, reporter: r.reporter, target };
  });
  res.json({ reports: out });
});

admin.post('/reports/:id/resolve', (req, res) => {
  const r = db.prepare('SELECT * FROM reports WHERE id=?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Жалоба не найдена' });
  db.prepare("UPDATE reports SET status='resolved' WHERE id=?").run(r.id);
  logAction(req.user, 'Закрыл жалобу', `#${r.id} (${r.target_type} #${r.target_id})`);
  res.json({ ok: true });
});

admin.get('/logs', (req, res) => {
  const rows = db.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 300').all();
  res.json({ logs: rows.map((l) => ({ id: l.id, admin: l.admin_name, action: l.action, details: l.details, createdAt: l.created_at })) });
});

admin.get('/settings', (req, res) => res.json({ settings: getSettings() }));

admin.put('/settings', requireAdmin, (req, res) => {
  const s = req.body || {};
  const up = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  if (s.announcement !== undefined) up.run('announcement', clean(s.announcement, 500));
  if (s.registration_open !== undefined) up.run('registration_open', s.registration_open ? '1' : '0');
  if (s.uploads_open !== undefined) up.run('uploads_open', s.uploads_open ? '1' : '0');
  if (s.banned_words !== undefined) up.run('banned_words', clean(s.banned_words, 3000));
  logAction(req.user, 'Изменил настройки сайта', '');
  res.json({ settings: getSettings() });
});

app.use('/api/admin', admin);

app.use('/api', (req, res) => res.status(404).json({ error: 'Не найдено' }));

// ───────────────────────────── Статика ─────────────────────────────
app.use('/media', express.static(UPLOAD_DIR, {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('Content-Security-Policy', "default-src 'none'; media-src 'self'; img-src 'self'"),
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: IS_PROD ? '1h' : 0 }));
app.get('/healthz', (req, res) => res.send('ok'));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Страус.TV запущен: http://localhost:${PORT}`);
  console.log(`Данные хранятся в: ${DATA_DIR}`);
});
