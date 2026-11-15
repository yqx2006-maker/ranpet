import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const PROVIDER = (process.env.AI_PROVIDER || 'mock').toLowerCase();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const STYLES = {
  sticker: {
    label: '贴纸',
    prompt:
      'Transform the subject into a cute die-cut sticker-style pet mascot. Keep the subject recognizable, simplify details, use bold flat colors, a thick dark outline and a warm cream background. Centered full body, no text.',
  },
  comic: {
    label: '漫画',
    prompt:
      'Turn the subject into a friendly comic-book pet character with bold ink outlines, flat cel shading and a warm cream background. Keep the identity, centered full body, no text.',
  },
  plush: {
    label: '毛绒',
    prompt:
      'Turn the subject into a soft plush toy pet with visible fabric texture, rounded shapes, warm studio lighting and a cream background. Keep the identity, centered full body, no text.',
  },
  pixel: {
    label: '像素',
    prompt:
      'Turn the subject into a cute 16-bit pixel-art pet sprite with a limited palette, crisp pixels, centered composition and a cream background, no text.',
  },
};

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  }),
);
app.use(express.json({ limit: '12mb' }));

const rateHits = new Map();
function rateLimit(req, res, next) {
  const key = req.ip || 'local';
  const now = Date.now();
  const entry = rateHits.get(key) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }
  entry.count += 1;
  rateHits.set(key, entry);
  if (entry.count > 10) {
    return res.status(429).json({ error: '请求太频繁，请稍后再试' });
  }
  next();
}

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') {
    throw new HttpError(400, '缺少图片数据');
  }
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-zA-Z0-9+/=\s]+)$/i.exec(dataUrl);
  if (!match) {
    throw new HttpError(400, '图片格式不支持，请使用 PNG/JPEG/WEBP');
  }
  const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (buffer.length === 0) {
    throw new HttpError(400, '图片数据为空');
  }
  if (buffer.length > 8 * 1024 * 1024) {
    throw new HttpError(413, '图片不能超过 8MB');
  }
  return { mime, buffer };
}

function toDataUrl(buffer, mime = 'image/png') {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

async function fetchAsDataUrl(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) {
    throw new HttpError(502, `下载生成图片失败 (${response.status})`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const arrayBuffer = await response.arrayBuffer();
  return toDataUrl(Buffer.from(arrayBuffer), contentType.split(';')[0]);
}

async function normalizeInput(buffer) {
  return sharp(buffer)
    .rotate()
    .resize(1024, 1024, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#fffdf7' })
    .jpeg({ quality: 90 })
    .toBuffer();
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function parseHealthText(raw) {
  const text = String(raw || '')
    .replace(/：/g, ':')
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/／/g, '/');
  const draft = {};
  const numberAfter = (pattern) => {
    const matched = text.match(pattern);
    if (!matched) return undefined;
    const value = Number(matched[1].replace(/[^\d.]/g, ''));
    return Number.isFinite(value) ? value : undefined;
  };

  const dateMatch = text.match(/(20\d{2})[年\-/.](\d{1,2})[月\-/.](\d{1,2})/);
  if (dateMatch) {
    draft.date = `${dateMatch[1]}-${pad2(dateMatch[2])}-${pad2(dateMatch[3])}`;
  }
  draft.heightCm = numberAfter(/身高\s*:?\s*(\d{2,3}(?:\.\d+)?)/i);
  draft.weightKg = numberAfter(/体重\s*:?\s*(\d{2,3}(?:\.\d+)?)/i);
  draft.bodyFatPercent = numberAfter(/体脂(?:率|百分比)?\s*:?\s*(\d{1,2}(?:\.\d+)?)/i);
  draft.waistCm = numberAfter(/腰围\s*:?\s*(\d{2,3}(?:\.\d+)?)/i);
  draft.restingHeartRate = numberAfter(/(?:静息心率|心率|脉搏)\s*:?\s*(\d{2,3})/i);
  const bmiValue = numberAfter(/bmi\s*:?\s*(\d{2}(?:\.\d+)?)/i);
  if (bmiValue !== undefined) draft.bmi = bmiValue;

  const bloodPressure = text.match(/(?:血压|bp)\s*:?\s*(\d{2,3})\s*\/\s*(\d{2,3})/i);
  if (bloodPressure) {
    draft.systolic = Number(bloodPressure[1]);
    draft.diastolic = Number(bloodPressure[2]);
  }

  const note = text.match(/(?:备注|结论|医生建议)\s*:?\s*([^\n\r]{2,120})/);
  if (note) draft.notes = note[1].trim();

  if (draft.heightCm !== undefined && draft.heightCm > 0 && draft.heightCm < 3) {
    draft.heightCm *= 100;
  }
  if (
    draft.bodyFatPercent !== undefined &&
    draft.bodyFatPercent > 0 &&
    draft.bodyFatPercent <= 1
  ) {
    draft.bodyFatPercent *= 100;
  }
  if (!draft.bmi && draft.heightCm && draft.weightKg) {
    draft.bmi =
      Math.round((draft.weightKg / Math.pow(draft.heightCm / 100, 2)) * 10) / 10;
  }

  return Object.fromEntries(
    Object.entries(draft).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    date: { type: ['string', 'null'] },
    heightCm: { type: ['number', 'null'] },
    weightKg: { type: ['number', 'null'] },
    bodyFatPercent: { type: ['number', 'null'] },
    waistCm: { type: ['number', 'null'] },
    systolic: { type: ['integer', 'null'] },
    diastolic: { type: ['integer', 'null'] },
    restingHeartRate: { type: ['integer', 'null'] },
    bmi: { type: ['number', 'null'] },
    notes: { type: ['string', 'null'] },
  },
  required: [
    'date',
    'heightCm',
    'weightKg',
    'bodyFatPercent',
    'waistCm',
    'systolic',
    'diastolic',
    'restingHeartRate',
    'bmi',
    'notes',
  ],
  additionalProperties: false,
};

function extractOutputText(json) {
  if (typeof json?.output_text === 'string' && json.output_text.trim()) {
    return json.output_text;
  }
  for (const item of json?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  return '';
}

async function parseHealthWithOpenAI({ text, fileData, fileName, mime }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpError(501, 'PDF/图片自动解析需要配置 OPENAI_API_KEY');
  }
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const content = [
    {
      type: 'input_text',
      text: [
        'Extract the health checkup metrics from this report.',
        'Use null for missing values. Date must be YYYY-MM-DD.',
        'Units: height cm, weight kg, body fat %, waist cm, blood pressure mmHg, resting heart rate bpm.',
        'Do not invent values. Notes should be a short summary of 备注/结论/医生建议.',
        text ? `Report text:\n${text}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    },
  ];

  if (fileData) {
    if (mime === 'application/pdf') {
      content.push({
        type: 'input_file',
        filename: fileName || 'health-report.pdf',
        file_data: fileData,
      });
    } else {
      content.push({ type: 'input_image', image_url: fileData });
    }
  }

  const response = await fetch(`${baseUrl}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_REPORT_MODEL || 'gpt-4.1-mini',
      input: [{ role: 'user', content }],
      text: {
        format: {
          type: 'json_schema',
          name: 'health_report',
          strict: true,
          schema: REPORT_SCHEMA,
        },
      },
    }),
    signal: AbortSignal.timeout(180_000),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(502, json?.error?.message || `OpenAI 报告解析失败 (${response.status})`);
  }
  const output = extractOutputText(json);
  if (!output) {
    throw new HttpError(502, 'OpenAI 没有返回解析结果');
  }
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    throw new HttpError(502, 'OpenAI 返回的结果不是有效 JSON');
  }
  return Object.fromEntries(
    Object.entries(parsed).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}

function parseReportDataUrl(dataUrl) {
  const match = /^data:((?:image\/(?:png|jpeg|jpg|webp))|application\/pdf);base64,([a-zA-Z0-9+/=\s]+)$/i.exec(
    dataUrl,
  );
  if (!match) {
    throw new HttpError(400, '报告仅支持 PDF / PNG / JPEG / WEBP');
  }
  const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (buffer.length > 10 * 1024 * 1024) {
    throw new HttpError(413, '报告文件不能超过 10MB');
  }
  return { mime, dataUrl };
}

async function mockFrame(buffer) {
  const border = Buffer.from(
    `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="30" width="964" height="964" rx="56" fill="none" stroke="#1b1a17" stroke-width="8"/>
    </svg>`,
  );
  const output = await sharp(buffer)
    .extend({ top: 62, bottom: 62, left: 62, right: 62, background: '#fffcf4' })
    .composite([{ input: border, top: 0, left: 0 }])
    .png()
    .toBuffer();
  return toDataUrl(output, 'image/png');
}

async function stylizeMock(buffer, style) {
  const base = sharp(buffer)
    .rotate()
    .resize(900, 900, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#fffdf7' });

  if (style === 'pixel') {
    const pixel = await base.resize(72, 72, { fit: 'cover' }).png().toBuffer();
    const upscaled = await sharp(pixel).resize(900, 900, { kernel: 'nearest' }).png().toBuffer();
    return mockFrame(upscaled);
  }

  let pipeline = base.modulate({ saturation: 1.35, brightness: 1.04 });
  if (style === 'comic') {
    pipeline = pipeline.linear(1.16, -16).sharpen({ sigma: 1.4 });
  } else if (style === 'plush') {
    pipeline = pipeline.blur(0.45).modulate({ saturation: 1.12, brightness: 1.06 });
  } else {
    pipeline = pipeline.sharpen({ sigma: 1.2 });
  }
  const stylized = await pipeline.png().toBuffer();
  return mockFrame(stylized);
}

async function stylizeOpenAI(buffer, style) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new HttpError(503, '后端未配置 OPENAI_API_KEY');
  }
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const input = await normalizeInput(buffer);
  const form = new FormData();
  form.append('model', process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1');
  form.append('image', new Blob([input], { type: 'image/jpeg' }), 'pet.jpg');
  form.append('prompt', STYLES[style].prompt);
  form.append('size', '1024x1024');
  form.append('n', '1');

  const response = await fetch(`${baseUrl}/images/edits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(502, json?.error?.message || `OpenAI 请求失败 (${response.status})`);
  }
  const item = json?.data?.[0];
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item?.url) return fetchAsDataUrl(item.url);
  throw new HttpError(502, 'OpenAI 没有返回图片');
}

async function stylizeFal(buffer, style) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new HttpError(503, '后端未配置 FAL_KEY');
  }
  const input = await normalizeInput(buffer);
  const model = process.env.FAL_IMAGE_MODEL || 'fal-ai/flux/dev/image-to-image';
  const response = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: toDataUrl(input, 'image/jpeg'),
      prompt: STYLES[style].prompt,
      strength: 0.55,
      num_images: 1,
    }),
    signal: AbortSignal.timeout(180_000),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new HttpError(502, json?.detail || `fal.ai 请求失败 (${response.status})`);
  }
  const url = json?.images?.[0]?.url;
  if (!url) throw new HttpError(502, 'fal.ai 没有返回图片');
  return fetchAsDataUrl(url);
}

app.get('/api/health', (_req, res) => {
  const available =
    PROVIDER === 'mock' ||
    (PROVIDER === 'openai' && Boolean(process.env.OPENAI_API_KEY)) ||
    (PROVIDER === 'fal' && Boolean(process.env.FAL_KEY));
  res.json({
    status: 'ok',
    provider: PROVIDER,
    available,
    styles: Object.entries(STYLES).map(([value, item]) => ({ value, label: item.label })),
  });
});

app.post('/api/pet/stylize', rateLimit, async (req, res, next) => {
  try {
    const { image, style = 'sticker' } = req.body || {};
    if (!STYLES[style]) {
      throw new HttpError(400, '未知的风格');
    }
    const { buffer } = parseDataUrl(image);
    console.log(`[stylize] provider=${PROVIDER} style=${style} bytes=${buffer.length}`);

    let result;
    if (PROVIDER === 'mock') {
      result = await stylizeMock(buffer, style);
    } else if (PROVIDER === 'openai') {
      result = await stylizeOpenAI(buffer, style);
    } else if (PROVIDER === 'fal') {
      result = await stylizeFal(buffer, style);
    } else {
      throw new HttpError(400, `未知的 AI_PROVIDER：${PROVIDER}`);
    }

    res.json({ image: result, provider: PROVIDER, style });
  } catch (error) {
    next(error);
  }
});

app.post('/api/health/parse-report', rateLimit, async (req, res, next) => {
  try {
    const { text, file, fileName } = req.body || {};
    if (typeof text === 'string' && text.trim()) {
      const draft = parseHealthText(text);
      const hasMetric = [
        'heightCm',
        'weightKg',
        'bodyFatPercent',
        'waistCm',
        'systolic',
        'diastolic',
        'restingHeartRate',
        'bmi',
      ].some((key) => draft[key] !== undefined);
      if (hasMetric) {
        return res.json({ draft, provider: 'rules' });
      }
      if (process.env.OPENAI_API_KEY) {
        const aiDraft = await parseHealthWithOpenAI({ text });
        return res.json({ draft: aiDraft, provider: 'openai' });
      }
      return res.json({
        draft,
        provider: 'rules',
        warning: '没有识别到身高、体重等指标，可以手动补充，或配置 OPENAI_API_KEY 用 AI 解析。',
      });
    }

    if (typeof file === 'string' && file) {
      const { mime, dataUrl } = parseReportDataUrl(file);
      if (!process.env.OPENAI_API_KEY) {
        throw new HttpError(
          501,
          'PDF/图片自动解析需要配置 OPENAI_API_KEY；可以先粘贴报告文本或使用 CSV',
        );
      }
      const draft = await parseHealthWithOpenAI({
        fileData: dataUrl,
        fileName: fileName || 'health-report',
        mime,
      });
      return res.json({ draft, provider: 'openai' });
    }

    throw new HttpError(400, '请提供报告文本或文件');
  } catch (error) {
    next(error);
  }
});

if (process.env.SERVE_STATIC === 'true') {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(dist, 'index.html'));
    }
    next();
  });
}

app.use('/api', (_req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) {
    console.error('[server]', error);
  }
  res.status(status).json({
    error: error.message || '服务器错误',
  });
});

app.listen(PORT, HOST, () => {
  console.log(`[ranpet-ai] http://${HOST}:${PORT} · provider=${PROVIDER}`);
});
