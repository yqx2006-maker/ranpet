import { useRef, useState, type DragEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
  Upload,
  Watch,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { ImportResult } from '../types';
import { csvTemplate, makeSampleImport, parseImportText, type ImportPreview } from '../utils/importData';
import { Modal } from './Modal';

interface DataImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function DataImportModal({ open, onClose }: DataImportModalProps) {
  const importWorkouts = useAppStore((state) => state.importWorkouts);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('文件不能超过 5MB');
      return;
    }
    setError('');
    setResult(null);
    try {
      const text = await file.text();
      const parsed = parseImportText(file.name, text);
      setFileName(file.name);
      setPreview(parsed);
      if (parsed.records.length === 0) {
        setError(parsed.errors[0] ?? '没有找到可导入的记录');
      }
    } catch {
      setError('文件读取失败，请换一个文件试试');
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const loadSample = () => {
    setFileName('手环示例数据');
    setResult(null);
    setError('');
    setPreview({ records: makeSampleImport(), errors: [] });
  };

  const downloadTemplate = () => {
    const blob = new Blob([`\uFEFF${csvTemplate()}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ranpet-import-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const runImport = () => {
    if (!preview || preview.records.length === 0) return;
    const imported = importWorkouts(preview.records);
    setResult(imported);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="导入手环运动数据"
      size="lg"
      footer={
        <div className="modal-actions">
          <button className="button ghost" type="button" onClick={onClose}>
            {result ? '完成' : '取消'}
          </button>
          {!result ? (
            <button
              className="button primary"
              type="button"
              onClick={runImport}
              disabled={!preview || preview.records.length === 0}
            >
              <CheckCircle2 size={16} />
              导入 {preview?.records.length ?? 0} 条记录
            </button>
          ) : null}
        </div>
      }
    >
      <div className="import-form">
        <div className="import-intro">
          <span className="import-icon">
            <Watch size={22} />
          </span>
          <div>
            <strong>把手环里的运动记录带进来</strong>
            <p>
              支持 CSV / JSON 文件，字段可自动识别。导入后会计入训练时长、连续打卡和伙伴成长。
            </p>
          </div>
        </div>

        {!result ? (
          <>
            <div
              className={`upload-zone${dragging ? ' dragging' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
              }}
            >
              <Upload size={20} />
              <div>
                <strong>{fileName || '点击或拖拽上传 CSV / JSON'}</strong>
                <small>示例字段：date、type、duration、calories、steps、avgHeartRate</small>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
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
                使用示例手环数据
              </button>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            {preview && preview.records.length > 0 ? (
              <div className="import-preview">
                <div className="import-preview-head">
                  <div>
                    <strong>导入预览</strong>
                    <p>
                      识别到 {preview.records.length} 条记录
                      {preview.errors.length > 0 ? `，${preview.errors.length} 行需跳过` : ''}
                    </p>
                  </div>
                  <FileText size={20} />
                </div>
                <div className="import-table-wrap">
                  <table className="import-table">
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>类型</th>
                        <th>时长</th>
                        <th>卡路里</th>
                        <th>距离</th>
                        <th>步数</th>
                        <th>心率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.records.slice(0, 6).map((record) => (
                        <tr key={record.externalId}>
                          <td>{record.date}</td>
                          <td>{record.title}</td>
                          <td>{record.durationMin} 分</td>
                          <td>{record.calories ?? '--'}</td>
                          <td>{record.distanceKm ? `${record.distanceKm} km` : '--'}</td>
                          <td>{record.steps ?? '--'}</td>
                          <td>{record.avgHeartRate ?? '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.records.length > 6 ? (
                  <p className="import-more">还有 {preview.records.length - 6} 条记录未展示</p>
                ) : null}
                {preview.errors.length > 0 ? (
                  <div className="import-warnings">
                    <AlertTriangle size={16} />
                    <div>
                      {preview.errors.map((message) => (
                        <p key={message}>{message}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="import-note">
              <Watch size={16} />
              <p>
                当前版本通过导出文件导入。真实产品里可以接入 Apple Health、Google Fit、
                华为运动健康等 OAuth 授权同步，由后端定时拉取数据。
              </p>
            </div>
          </>
        ) : (
          <div className="import-result">
            <span className="import-result-icon">
              <CheckCircle2 size={34} />
            </span>
            <h3>导入完成</h3>
            <p>
              成功导入 <strong>{result.imported}</strong> 条记录
              {result.skipped > 0 ? `，跳过 ${result.skipped} 条重复数据` : ''}。
            </p>
            <p className="import-result-hint">
              这些记录已经计入训练时长、打卡热力图和伙伴成长值。
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
