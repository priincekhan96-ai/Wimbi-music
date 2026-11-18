# WIMBI — toleo la kuunganisha Mureka API

## Kile kilichowekwa tayari
- Frontend ya Kiswahili ya kutengeneza wimbo, kufuatilia kazi, kusikiliza/kupakua matokeo na kuomba stems.
- Backend ya Node.js/Express inayoficha Mureka API Key upande wa server.
- Endpoint ya kutengeneza wimbo kwa prompt, lyrics, au instrumental.
- Endpoint ya kuulizia hali ya kazi hadi wimbo ukamilike.
- Endpoint ya kuomba stems: `audio-separation-2` inaweza kutoa hadi stems 12; `audio-separation-1` hadi 5.
- API health check: `/api/health`.
- Ulinzi wa msingi: Helmet, JSON size limit na rate limit.

## Muhimu kabla ya matumizi
1. Mureka API key inahitajika kama environment variable `MUREKA_API_KEY` kwenye hosting. Usiiweke ndani ya `public/index.html`, GitHub, au kuituma kwenye chat.
2. Generation/stems hazitafanya kazi mpaka akaunti iwe na API credits. Download ya wimbo uliokwisha tengenezwa haitozwi na Mureka; stems zina malipo tofauti.
3. Kiswahili hakijaorodheshwa wazi kwenye orodha rasmi ya lugha zinazoungwa mkono na Mureka. Unaweza kujaribu lyrics za Kiswahili, lakini matokeo hayajahakikishwa.
4. Mureka inaweza kubadilisha schema/gharama; thibitisha response na pricing ndani ya dashboard kabla ya matumizi ya umma.

## Kuweka kwenye Render
1. Fungua Render na uchague **New + → Web Service**.
2. Unganisha akaunti ya GitHub na chagua repo `Wimbi-music`.
3. Render itasoma `render.yaml`; hakikisha build command ni `npm install` na start command ni `npm start`.
4. Kwenye **Environment**, ongeza `MUREKA_API_KEY` (API key-ээ зөвхөн Render-ийн нууц тохиргоонд хийнэ; GitHub-д бүү commit хий).
5. Deploy. Kisha tembelea `https://JINA-LA-APP.onrender.com/api/health`; inapaswa kuonyesha `ok: true` na `keyConfigured: true`.

Node version: 20 au zaidi. Hii inahitaji Node Web Service; GitHub Pages pekee haiwezi kuendesha `server.js`.

## API routes
- `POST /api/generate` JSON: `{ "prompt":"...", "lyrics":"...", "instrumental":false, "gender":"Female", "title":"..." }`
- `GET /api/tasks/TASK_ID?kind=song` (au `kind=instrumental`)
- `POST /api/stems` JSON: `{ "url":"https://...mp3", "model":"audio-separation-2" }`
