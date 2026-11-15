import { useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Download,
  FileText,
  HeartPulse,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { HealthReportDraft } from '../types';
import { todayISO } from '../utils/date';
import {
  healthReportCsvTemplate,
  parseHealthReportFile,
  sampleHealthReportText,
} from '../utils/healthReport';
import { Modal } from './Modal';

interface HealthReportModalProps {
  open: boolean;
  onClose: () => void;
}

const PROVIDER_LABEL: Record<string, string> = {
  rules: '本地规则',
  openai: 'OpenAI',
  csv: 'CSV / JSON',
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

async function parseWithServer(payload: {
  text?: string;
  file?: string;
  fileName?: string;
}): Promise<{ draft: HealthReportDraft; provider?: string; warning?: string }> {
  let response: Response;
  try {
    response = await fetch('/api/health/parse-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('解析服务未启动，请确认 npm run dev 正在运行');
  }
  const data = (await response.json().catch(() => ({}))) as {
    draft?: HealthReportDraft;
    provider?: string;
    warning?: string;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || `解析失败 (${response.status})`);
  }
  return { draft: data.draft || {}, provider: data.provider, warning: data.warning };
}

export function HealthReportModal({ open, onClose }: HealthReportModalProps) {
  const addMetric = useAppStore((state) => state.addMetric);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [parsing, setParsing] = useState(false);
  const [provider, setProvider] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  const [dateInput, setDateInput] = useState(todayISO());
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [systolicInput, setSystolicInput] = useState('');
  const [diastolicInput, setDiastolicInput] = useState('');
  const [heartRateInput, setHeartRateInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const applyDraft = (draft: HealthReportDraft, nextProvider = '') => {
    setDateInput(draft.date || todayISO());
    setHeightInput(draft.heightCm ? String(draft.heightCm) : '');
    setWeightInput(draft.weightKg ? String(draft.weightKg) : '');
    setBodyFatInput(draft.bodyFatPercent ? String(draft.bodyFatPercent) : '');
    setWaistInput(draft.waistCm ? String(draft.waistCm) : '');
    setSystolicInput(draft.systolic ? String(draft.systolic) : '');
    setDiastolicInput(draft.diastolic ? String(draft.diastolic) : '');
    setHeartRateInput(draft.restingHeartRate ? String(draft.restingHeartRate) : '');
    setNoteInput(draft.notes || '');
    setProvider(nextProvider);
    setPreviewReady(true);
    setError('');
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('文件不能超过 10MB');
      return;
    }
    setParsing(true);
    setError('');
    setWarning('');
    setPreviewReady(false);
    try {
      const lower = file.name.toLowerCase();
      const isTextFile =
        lower.endsWith('.csv') || lower.endsWith('.json') || file.type.includes('json');
      if (isTextFile) {
        const content = await file.text();
        const parsed = parseHealthReportFile(file.name, content);
        setFileName(file.name);
        applyDraft(parsed.draft, 'csv');
        setWarning(parsed.warning || '');
        if (!parsed.draft.weightKg) {
          setWarning((current) => current || '没有识别到体重，请手动补充');
        }
        return;
      }

      const dataUrl = await fileToDataUrl(file);
      const parsed = await parseWithServer({
        file: dataUrl,
        fileName: file.name,
      });
      setFileName(file.name);
      applyDraft(parsed.draft, parsed.provider || '');
      setWarning(parsed.warning || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '报告解析失败');
    } finally {
      setParsing(false);
    }
  };

  const parseText = async () => {
    if (!text.trim()) return;
    setParsing(true);
    setError('');
    setWarning('');
    setPreviewReady(false);
    try {
      const parsed = await parseWithServer({ text });
      applyDraft(parsed.draft, parsed.provider || 'rules');
      setWarning(parsed.warning || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '报告解析失败');
    } finally {
      setParsing(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([`\uFEFF${healthReportCsvTemplate()}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ranpet-health-report-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setTab('text');
    setText(sampleHealthReportText());
    setError('');
    setWarning('');
  };

  const save = () => {
    const weight = Number(weightInput);
    if (!weight || weight <= 0) {
      setError('请先填写体重');
      return;
    }
    addMetric({
      date: dateInput || todayISO(),
      weight,
      height: heightInput ? Number(heightInput) : undefined,
      bodyFat: bodyFatInput ? Number(bodyFatInput) : undefined,
      waist: waistInput ? Number(waistInput) : undefined,
      systolic: systolicInput ? Number(systolicInput) : undefined,
      diastolic: diastolicInput ? Number(diastolicInput) : undefined,
      restingHeartRate: heartRateInput ? Number(heartRateInput) : undefined,
      note: noteInput || undefined,
      source: 'report',
    });
    onClose();
  };

  const bmi =
    heightInput && weightInput
      ? (Number(weightInput) / Math.pow(Number(heightInput) / 100, 2)).toFixed(1)
      : '--';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="导入体检报告"
      size="lg"
      footer={
        <div className="modal-actions">
          <button className="button ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button
            className="button primary"
            type="button"
            onClick={save}
            disabled={!previewReady || !weightInput}
          >
            保存到身体档案
          </button>
        </div>
      }
    >
      <div className="health-report-form">
        <div className="import-intro">
          <span className="import-icon">
            <FileText size={22} />
          </span>
          <div>
            <strong>把体检报告里的身体数据接进来</strong>
            <p>
              支持 CSV / JSON / TXT；PDF 和图片需要配置 OpenAI 视觉解析，也可以直接粘贴报告文本。
              解析后可以先修改再保存。
            </p>
          </div>
        </div>

        <div className="segmented-tabs health-report-tabs">
          <button
            type="button"
            className={tab === 'file' ? 'active' : ''}
            onClick={() => setTab('file')}
          >
            上传文件
          </button>
          <button
            type="button"
            className={tab === 'text' ? 'active' : ''}
            onClick={() => setTab('text')}
          >
            粘贴文本
          </button>
        </div>

        {tab === 'file' ? (
          <>
            <div
              className="upload-zone"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') fileRef.current?.click();
              }}
            >
              <Upload size={20} />
              <div>
                <strong>{fileName || '点击上传体检报告'}</strong>
                <small>CSV / JSON / TXT / PDF / 图片，最大 10MB</small>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,.txt,.pdf,image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                  event.target.value = '';
                }}
              />
            </div>
            <div className="import-toolbar">
              <button className="text-link" type="button" onClick={downloadTemplate}>
                <Download size={15} />
                下载 CSV 模板
              </button>
              <button className="text-link" type="button" onClick={loadSample}>
                <Sparkles size={15} />
                填入示例报告
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="field">
              <span>粘贴体检报告文本</span>
              <textarea
                className="note-input"
                rows={8}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={'例如：\n体检日期：2026-11-13\n身高：175 cm\n体重：70.5 kg\n血压：118/76 mmHg'}
              />
            </label>
            <div className="import-toolbar">
              <button className="text-link" type="button" onClick={loadSample}>
                <Sparkles size={15} />
                填入示例报告
              </button>
              <button
                className="text-link"
                type="button"
                onClick={parseText}
                disabled={!text.trim() || parsing}
              >
                <Activity size={15} />
                {parsing ? '正在解析…' : '解析文本'}
              </button>
            </div>
          </>
        )}

        {parsing ? <p className="hint-text">正在解析报告，请稍候…</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {warning ? (
          <div className="import-warnings">
            <AlertTriangle size={16} />
            <div>
              <p>{warning}</p>
            </div>
          </div>
        ) : null}

        {previewReady ? (
          <div className="health-report-preview">
            <div className="health-report-head">
              <div>
                <strong>解析结果</strong>
                <p>可以直接修改后保存</p>
              </div>
              {provider ? (
                <span className="ai-provider ready">
                  {PROVIDER_LABEL[provider] ?? provider}
                </span>
              ) : null}
            </div>
            <div className="health-report-grid">
              <label className="field">
                <span>体检日期</span>
                <input
                  className="plain-input"
                  type="date"
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span>身高（cm）</span>
                <input
                  className="plain-input"
                  type="number"
                  inputMode="decimal"
                  value={heightInput}
                  onChange={(event) => setHeightInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span>体重（kg）</span>
                <input
                  className="plain-input"
                  type="number"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(event) => setWeightInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span>体脂率（%）</span>
                <input
                  className="plain-input"
                  type="number"
                  inputMode="decimal"
                  value={bodyFatInput}
                  onChange={(event) => setBodyFatInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span>腰围（cm）</span>
                <input
                  className="plain-input"
                  type="number"
                  inputMode="decimal"
                  value={waistInput}
                  onChange={(event) => setWaistInput(event.target.value)}
                />
              </label>
              <label className="field">
                <span>收缩压 / 舒张压</span>
                <div className="blood-pressure-row">
                  <input
                    className="plain-input"
                    type="number"
                    inputMode="numeric"
                    value={systolicInput}
                    onChange={(event) => setSystolicInput(event.target.value)}
                    placeholder="118"
                  />
                  <span>/</span>
                  <input
                    className="plain-input"
                    type="number"
                    inputMode="numeric"
                    value={diastolicInput}
                    onChange={(event) => setDiastolicInput(event.target.value)}
                    placeholder="76"
                  />
                </div>
              </label>
              <label className="field">
                <span>静息心率（bpm）</span>
                <input
                  className="plain-input"
                  type="number"
                  inputMode="numeric"
                  value={heartRateInput}
                  onChange={(event) => setHeartRateInput(event.target.value)}
                />
              </label>
              <div className="field">
                <span>BMI</span>
                <div className="bmi-readout">
                  <HeartPulse size={16} />
                  {bmi}
                </div>
              </div>
              <label className="field health-report-note">
                <span>备注</span>
                <textarea
                  className="note-input"
                  rows={2}
                  value={noteInput}
                  onChange={(event) => setNoteInput(event.target.value)}
                  placeholder="报告结论或医生建议"
                />
              </label>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
