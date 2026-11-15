import type { HealthReportDraft } from '../types';
import { todayISO } from './date';
import { parseCsv } from './importData';

const FIELDS = {
  date: ['date', '日期', '体检日期', '检查日期', '报告日期', 'examdate'],
  height: ['height', '身高', 'heightcm', '身高cm'],
  weight: ['weight', '体重', 'weightkg', '体重kg'],
  bodyFat: ['bodyfat', 'bodyfatpercent', '体脂', '体脂率', '体脂百分比'],
  waist: ['waist', 'waistcm', '腰围', '腰围cm'],
  systolic: ['systolic', '收缩压', '高压'],
  diastolic: ['diastolic', '舒张压', '低压'],
  bloodPressure: ['bloodpressure', 'bp', '血压'],
  heartRate: ['heartrate', 'restingheartrate', '心率', '静息心率', '脉搏'],
  bmi: ['bmi', '体质指数', '身体质量指数'],
  note: ['note', 'notes', '备注', '结论', '医生建议'],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_\-()（）]/g, '');
}

function normalizeRow(row: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeKey(key)] = String(value ?? '').trim();
  }
  return normalized;
}

function pick(row: Record<string, string>, keys: string[]): string {
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
  return Number.isFinite(number) ? number : undefined;
}

function normalizeDate(value: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/\//g, '-');
  const matched = cleaned.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!matched) return undefined;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function normalizeDraft(row: Record<string, string>): HealthReportDraft {
  const normalized = normalizeRow(row);
  let height = parseNumber(pick(normalized, FIELDS.height));
  if (height !== undefined && height > 0 && height < 3) height *= 100;
  let bodyFat = parseNumber(pick(normalized, FIELDS.bodyFat));
  if (bodyFat !== undefined && bodyFat > 0 && bodyFat <= 1) bodyFat *= 100;
  const weight = parseNumber(pick(normalized, FIELDS.weight));
  const waist = parseNumber(pick(normalized, FIELDS.waist));
  const heartRate = parseNumber(pick(normalized, FIELDS.heartRate));
  const bmiValue = parseNumber(pick(normalized, FIELDS.bmi));

  let systolic = parseNumber(pick(normalized, FIELDS.systolic));
  let diastolic = parseNumber(pick(normalized, FIELDS.diastolic));
  const bloodPressure = pick(normalized, FIELDS.bloodPressure);
  if (bloodPressure && bloodPressure.includes('/')) {
    const [high, low] = bloodPressure.split('/');
    systolic = parseNumber(high) ?? systolic;
    diastolic = parseNumber(low) ?? diastolic;
  }

  let bmi = bmiValue;
  if (!bmi && height && weight) {
    bmi = roundOne(weight / Math.pow(height / 100, 2));
  }

  return {
    date: normalizeDate(pick(normalized, FIELDS.date)),
    heightCm: height ? roundOne(height) : undefined,
    weightKg: weight,
    bodyFatPercent: bodyFat !== undefined ? roundOne(bodyFat) : undefined,
    waistCm: waist,
    systolic,
    diastolic,
    restingHeartRate: heartRate,
    bmi: bmi !== undefined ? roundOne(bmi) : undefined,
    notes: pick(normalized, FIELDS.note) || undefined,
  };
}

export function parseHealthReportFile(
  fileName: string,
  text: string,
): { draft: HealthReportDraft; warning?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { draft: {}, warning: '文件是空的' };
  }

  try {
    const isJson =
      fileName.toLowerCase().endsWith('.json') ||
      trimmed.startsWith('{') ||
      trimmed.startsWith('[');
    let row: Record<string, string>;

    if (isJson) {
      const parsed: unknown = JSON.parse(trimmed);
      const object = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!object || typeof object !== 'object') {
        return { draft: {}, warning: 'JSON 格式不正确' };
      }
      const raw = object as Record<string, unknown>;
      if (Array.isArray(raw.data)) {
        const first = raw.data[0];
        if (!first || typeof first !== 'object') {
          return { draft: {}, warning: 'JSON 中没有数据' };
        }
        row = Object.fromEntries(
          Object.entries(first as Record<string, unknown>).map(([key, value]) => [
            key,
            String(value ?? ''),
          ]),
        );
      } else {
        row = Object.fromEntries(
          Object.entries(raw).map(([key, value]) => [key, String(value ?? '')]),
        );
      }
    } else {
      const rows = parseCsv(text);
      if (rows.length === 0) {
        return { draft: {}, warning: '没有找到可导入的数据行' };
      }
      row = rows[0];
    }

    const draft = normalizeDraft(row);
    const found = Object.entries(draft).some(
      ([key, value]) => key !== 'date' && value !== undefined,
    );
    return {
      draft,
      warning: found ? undefined : '没有识别到身体数据，请检查表头或改用粘贴文本',
    };
  } catch {
    return { draft: {}, warning: '文件解析失败，请检查格式' };
  }
}

export function healthReportCsvTemplate(): string {
  return [
    'date,height,weight,bodyFat,waist,systolic,diastolic,heartRate,note',
    `${todayISO()},175,70.5,20.8,82,118,76,66,年度体检`,
  ].join('\n');
}

export function sampleHealthReportText(): string {
  return [
    '年度健康体检报告',
    `体检日期：${todayISO()}`,
    '身高：175 cm',
    '体重：70.5 kg',
    'BMI：23.0',
    '体脂率：20.8%',
    '腰围：82 cm',
    '血压：118/76 mmHg',
    '静息心率：66 次/分',
    '备注：未见明显异常。',
  ].join('\n');
}
