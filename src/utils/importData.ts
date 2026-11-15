import type { Focus, ImportedWorkout } from '../types';
import { addDays, todayISO } from './date';

export interface ImportPreview {
  records: ImportedWorkout[];
  errors: string[];
}

type Row = Record<string, string>;

const FIELDS = {
  date: ['date', '日期', '开始时间', 'starttime', 'startdate', 'day', '时间'],
  type: ['type', '类型', '运动类型', 'activity', 'sport', '运动'],
  title: ['title', '名称', '训练名称', 'name', '标题'],
  duration: ['duration', 'durationmin', '时长', '分钟', 'minutes', 'min', '训练时长'],
  calories: ['calories', 'calorie', '卡路里', 'kcal', '能量', '千卡'],
  distance: ['distance', 'distancekm', '距离', '公里', 'km'],
  steps: ['steps', '步数', '步'],
  heartRate: ['heartrate', 'avghr', '平均心率', '心率', 'hr'],
  externalId: ['id', 'externalid', '记录id', '记录编号', 'uid'],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]/g, '');
}

function normalizeRow(row: Row): Row {
  const normalized: Row = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeKey(key)] = String(value ?? '').trim();
  }
  return normalized;
}

function pick(row: Row, keys: string[]): string {
  for (const key of keys) {
    const value = row[normalizeKey(key)];
    if (value) return value;
  }
  return '';
}

function parseNumber(value: string): number | undefined {
  const matched = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!matched) return undefined;
  const number = Number(matched[0]);
  if (!Number.isFinite(number)) return undefined;
  return number;
}

function parseDuration(value: string): number | undefined {
  const text = value.trim().toLowerCase();
  if (!text) return undefined;
  if (text.includes(':')) {
    const parts = text.split(':').map((part) => Number(part) || 0);
    if (parts.length === 3) return Math.round(parts[0] * 60 + parts[1] + parts[2] / 60);
    if (parts.length === 2) return Math.round(parts[0] + parts[1] / 60);
  }
  const number = parseNumber(text);
  if (!number || number <= 0) return undefined;
  if (text.includes('秒') || text.endsWith('s')) return Math.max(1, Math.round(number / 60));
  if (number > 300) return Math.max(1, Math.round(number / 60));
  return Math.max(1, Math.round(number));
}

function normalizeDate(value: string): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/\//g, '-');
  const matched = cleaned.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const TYPE_RULES: { pattern: RegExp; focus: Focus; title: string }[] = [
  { pattern: /run|跑步|慢跑|越野跑/i, focus: 'cardio', title: '跑步' },
  { pattern: /walk|步行|走路|健走/i, focus: 'cardio', title: '步行' },
  { pattern: /cycl|bike|骑行|单车/i, focus: 'cardio', title: '骑行' },
  { pattern: /swim|游泳/i, focus: 'cardio', title: '游泳' },
  { pattern: /row|划船/i, focus: 'cardio', title: '划船' },
  { pattern: /jump|跳绳/i, focus: 'cardio', title: '跳绳' },
  { pattern: /hiit|间歇/i, focus: 'cardio', title: 'HIIT' },
  { pattern: /yoga|瑜伽/i, focus: 'mobility', title: '瑜伽' },
  { pattern: /stretch|拉伸|mobility|灵活性/i, focus: 'mobility', title: '拉伸' },
  { pattern: /pilates|普拉提/i, focus: 'mobility', title: '普拉提' },
  { pattern: /strength|力量|举铁|weight|器械/i, focus: 'full', title: '力量训练' },
  { pattern: /健身|训练|workout|training/i, focus: 'full', title: '训练' },
];

function describeType(type: string): { focus: Focus; title: string } {
  for (const rule of TYPE_RULES) {
    if (rule.pattern.test(type)) return { focus: rule.focus, title: rule.title };
  }
  return { focus: 'cardio', title: type || '导入训练' };
}

function typeKey(type: string): string {
  return type.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '') || 'workout';
}

function normalizeRecord(row: Row): ImportedWorkout | string {
  const rawDate = pick(row, FIELDS.date);
  const date = normalizeDate(rawDate);
  if (!date) return '缺少有效日期（建议格式：2026-11-14）';

  const durationValue = pick(row, FIELDS.duration);
  const durationMin = parseDuration(durationValue);
  if (!durationMin) return '缺少有效训练时长（分钟）';
  if (durationMin > 360) return '单次训练时长超过 360 分钟，已跳过';

  const rawType = pick(row, FIELDS.type);
  const typeInfo = describeType(rawType);
  const title = pick(row, FIELDS.title) || typeInfo.title;
  const externalId =
    pick(row, FIELDS.externalId) ||
    `import-${date}-${typeKey(rawType || title)}-${durationMin}`;

  return {
    externalId,
    date,
    title,
    focus: typeInfo.focus,
    durationMin,
    calories: parseNumber(pick(row, FIELDS.calories)),
    distanceKm: parseNumber(pick(row, FIELDS.distance)),
    steps: parseNumber(pick(row, FIELDS.steps)),
    avgHeartRate: parseNumber(pick(row, FIELDS.heartRate)),
    externalType: rawType || title,
  };
}

export function parseCsv(text: string): Row[] {
  const source = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(current);
      current = '';
    } else if (char === '\n') {
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
    } else if (char !== '\r') {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  const nonEmpty = rows.filter((item) => item.some((cell) => cell.trim() !== ''));
  if (nonEmpty.length < 2) return [];
  const headers = nonEmpty[0].map((cell) => cell.trim());
  return nonEmpty.slice(1).map((cells) => {
    const record: Row = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });
    return record;
  });
}

function rowsFromJson(text: string): Row[] | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as Row[];
    if (parsed && typeof parsed === 'object') {
      const object = parsed as Record<string, unknown>;
      if (Array.isArray(object.data)) return object.data as Row[];
      if (Array.isArray(object.workouts)) return object.workouts as Row[];
      if (Array.isArray(object.records)) return object.records as Row[];
    }
    return null;
  } catch {
    return null;
  }
}

export function parseImportText(fileName: string, text: string): ImportPreview {
  const trimmed = text.trim();
  if (!trimmed) return { records: [], errors: ['文件是空的'] };

  const isJson =
    fileName.toLowerCase().endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[');
  const rows = isJson ? rowsFromJson(trimmed) : parseCsv(text);
  if (!rows) {
    return { records: [], errors: ['无法解析文件，请使用 CSV 或 JSON 格式'] };
  }
  if (rows.length === 0) {
    return { records: [], errors: ['没有找到可导入的数据行'] };
  }

  const records: ImportedWorkout[] = [];
  const errors: string[] = [];
  rows.forEach((raw, index) => {
    const normalized = normalizeRow(raw);
    const result = normalizeRecord(normalized);
    if (typeof result === 'string') {
      if (errors.length < 4) errors.push(`第 ${index + 2} 行：${result}`);
      return;
    }
    records.push(result);
  });

  if (records.length === 0 && errors.length === 0) {
    errors.push('没有找到有效记录');
  }
  return { records, errors };
}

export function makeSampleImport(): ImportedWorkout[] {
  const yesterday = addDays(todayISO(), -1);
  const twoDaysAgo = addDays(todayISO(), -2);
  const threeDaysAgo = addDays(todayISO(), -3);
  return [
    {
      externalId: `sample-run-${yesterday}`,
      date: yesterday,
      title: '晨跑',
      focus: 'cardio',
      durationMin: 32,
      calories: 286,
      distanceKm: 5.2,
      steps: 6200,
      avgHeartRate: 142,
      externalType: 'running',
    },
    {
      externalId: `sample-bike-${twoDaysAgo}`,
      date: twoDaysAgo,
      title: '骑行',
      focus: 'cardio',
      durationMin: 45,
      calories: 380,
      distanceKm: 14.8,
      avgHeartRate: 128,
      externalType: 'cycling',
    },
    {
      externalId: `sample-yoga-${threeDaysAgo}`,
      date: threeDaysAgo,
      title: '瑜伽',
      focus: 'mobility',
      durationMin: 35,
      calories: 120,
      avgHeartRate: 96,
      externalType: 'yoga',
    },
  ];
}

export function csvTemplate(): string {
  const today = todayISO();
  return [
    'date,type,title,duration,calories,distanceKm,steps,avgHeartRate',
    `${today},running,晨跑,32,286,5.2,6200,142`,
    `${addDays(today, -1)},cycling,骑行,45,380,14.8,,128`,
    `${addDays(today, -2)},yoga,瑜伽,35,120,,,96`,
  ].join('\n');
}
