import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_BASE = 'https://api.mureka.ai';
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '12mb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use(express.static('public'));

function key() {
  if (!process.env.MUREKA_API_KEY) {
    const e = new Error('MUREKA_API_KEY haijawekwa kwenye server.'); e.status = 503; throw e;
  }
  return process.env.MUREKA_API_KEY;
}
async function mureka(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const e = new Error(data?.error?.message || data?.message || `Mureka API error (${response.status})`);
    e.status = response.status; e.details = data; throw e;
  }
  return data;
}
app.get('/api/health', (_req, res) => res.json({ ok: true, provider: 'Mureka', keyConfigured: Boolean(process.env.MUREKA_API_KEY) }));

app.post('/api/generate', async (req, res, next) => {
  try {
    const { prompt = '', lyrics = '', instrumental = false, gender = 'Any', title = '' } = req.body || {};
    if (!String(prompt).trim() && !String(lyrics).trim()) return res.status(400).json({ error: 'Andika maelezo ya wimbo au lyrics kwanza.' });
    let path, body;
    if (instrumental) {
      path = '/v1/instrumental/generate';
      body = { prompt: String(prompt || 'Instrumental music'), model: 'auto', n: 1 };
    } else if (String(lyrics).trim()) {
      path = '/v1/song/generate';
      body = { lyrics: String(lyrics).slice(0, 5000), prompt: String(prompt).slice(0, 1024), model: 'auto', n: 1 };
      if (gender === 'Female' || gender === 'Male') body.gender = gender.toLowerCase();
    } else {
      path = '/v1/song/easy-generate';
      body = { prompt: String(prompt).slice(0, 1024), model: 'auto', n: 1 };
    }
    const data = await mureka(path, { method: 'POST', body: JSON.stringify(body) });
    res.json({ ...data, requestedTitle: String(title).slice(0, 80), taskType: instrumental ? 'instrumental' : 'song' });
  } catch (e) { next(e); }
});

app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const kind = req.query.kind === 'instrumental' ? 'instrumental' : 'song';
    const data = await mureka(`/v1/${kind}/query/${encodeURIComponent(req.params.id)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    res.json(data);
  } catch (e) { next(e); }
});

app.post('/api/stems', async (req, res, next) => {
  try {
    const { url, model = 'audio-separation-2' } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Wimbo hauna audio URL ya kutenganisha.' });
    if (!['audio-separation-1', 'audio-separation-2', 'audio-separation-3'].includes(model)) return res.status(400).json({ error: 'Stem model si sahihi.' });
    const data = await mureka('/v1/song/stem', { method: 'POST', body: JSON.stringify({ url, model }) });
    res.json(data);
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  console.error('[Wimbi API]', err.message, err.details || '');
  res.status(err.status || 500).json({ error: err.message || 'Hitilafu ya server.' });
});
app.listen(PORT, () => console.log(`Wimbi server running on port ${PORT}`));
