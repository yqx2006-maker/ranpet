import { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Dumbbell,
  FileText,
  HeartPulse,
  Minus,
  Pencil,
  Plus,
  Ruler,
  Scale,
  Timer,
  TrendingUp,
  Trophy,
  Watch,
} from 'lucide-react';
import { BarChart, Heatmap, LineChart } from '../components/Charts';
import { DataImportModal } from '../components/DataImportModal';
import { HealthReportModal } from '../components/HealthReportModal';
import { Modal } from '../components/Modal';
import { EXERCISE_MAP } from '../data/exercises';
import { useAppStore } from '../store/useAppStore';
import type { BodyMetric } from '../types';
import { formatMonthDay, formatShort, todayISO } from '../utils/date';
import {
  getPersonalRecords,
  getStreak,
  getTotalMinutes,
  getTotalVolume,
  getWeeklyVolumeSeries,
} from '../utils/stats';

export function ProgressPage() {
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const addMetric = useAppStore((state) => state.addMetric);
  const updateMetric = useAppStore((state) => state.updateMetric);
  const [metricOpen, setMetricOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [dateInput, setDateInput] = useState(todayISO());
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [systolicInput, setSystolicInput] = useState('');
  const [diastolicInput, setDiastolicInput] = useState('');
  const [heartRateInput, setHeartRateInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  if (!personal) return null;

  const metrics = personal.metrics;
  const latest = metrics.at(-1);
  const first = metrics[0];
  const latestBmi =
    latest?.height && latest?.weight
      ? Math.round((latest.weight / Math.pow(latest.height / 100, 2)) * 10) / 10
      : undefined;
  const weightData = metrics.map((item) => ({
    label: formatShort(item.date),
    value: item.weight,
  }));
  const volumeData = getWeeklyVolumeSeries(personal.workouts, 6);
  const records = getPersonalRecords(personal.workouts, 4);
  const streak = getStreak(personal.workouts);
  const totalMinutes = getTotalMinutes(personal.workouts);
  const totalVolume = getTotalVolume(personal.workouts);
  const weightDelta =
    latest && first ? Math.round((latest.weight - first.weight) * 10) / 10 : 0;

  const openMetric = (metric?: BodyMetric) => {
    const source = metric ?? latest;
    setEditingId(metric?.id ?? '');
    setDateInput(metric?.date ?? todayISO());
    setWeightInput(source ? String(source.weight) : '70');
    setHeightInput(source?.height ? String(source.height) : '');
    setBodyFatInput(source?.bodyFat ? String(source.bodyFat) : '');
    setWaistInput(source?.waist ? String(source.waist) : '');
    setSystolicInput(source?.systolic ? String(source.systolic) : '');
    setDiastolicInput(source?.diastolic ? String(source.diastolic) : '');
    setHeartRateInput(source?.restingHeartRate ? String(source.restingHeartRate) : '');
    setNoteInput(source?.note ?? '');
    setMetricOpen(true);
  };

  const saveMetric = () => {
    const weight = Number(weightInput);
    if (!weight || weight <= 0) return;
    const input = {
      date: dateInput || todayISO(),
      weight,
      height: heightInput ? Number(heightInput) : undefined,
      bodyFat: bodyFatInput ? Number(bodyFatInput) : undefined,
      waist: waistInput ? Number(waistInput) : undefined,
      systolic: systolicInput ? Number(systolicInput) : undefined,
      diastolic: diastolicInput ? Number(diastolicInput) : undefined,
      restingHeartRate: heartRateInput ? Number(heartRateInput) : undefined,
      note: noteInput || undefined,
    };
    if (editingId) {
      updateMetric(editingId, input);
    } else {
      addMetric(input);
    }
    setMetricOpen(false);
  };

  const bmiPreview =
    heightInput && weightInput
      ? (Number(weightInput) / Math.pow(Number(heightInput) / 100, 2)).toFixed(1)
      : '--';

  return (
    <div className="progress-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">进度</p>
          <h1>数据不会撒谎，但别只盯着秤</h1>
          <p className="page-sub">
            体重、围度、训练量一起看，才知道身体到底发生了什么。
          </p>
        </div>
        <div className="page-head-actions">
          <button className="button ghost" type="button" onClick={() => setReportOpen(true)}>
            <FileText size={17} />
            导入体检报告
          </button>
          <button className="button ghost" type="button" onClick={() => setImportOpen(true)}>
            <Watch size={17} />
            导入手环数据
          </button>
          <button className="button primary" type="button" onClick={() => openMetric()}>
            <Plus size={17} />
            记录身体数据
          </button>
        </div>
      </header>

      <section className="stat-grid progress-stats">
        <article className="stat-card">
          <span className="stat-icon coral">
            <Scale size={20} />
          </span>
          <div>
            <strong>{latest ? latest.weight : '--'}</strong>
            <span>当前体重 kg</span>
          </div>
          <p>
            {latest && first ? (
              <span className={weightDelta <= 0 ? 'delta down' : 'delta up'}>
                {weightDelta <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                {Math.abs(weightDelta)} kg
              </span>
            ) : (
              '还没有对比数据'
            )}
          </p>
        </article>
        <article className="stat-card">
          <span className="stat-icon mint">
            <Dumbbell size={20} />
          </span>
          <div>
            <strong>{personal.workouts.length}</strong>
            <span>累计训练</span>
          </div>
          <p>连续 {streak} 天</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon yellow">
            <Timer size={20} />
          </span>
          <div>
            <strong>{totalMinutes}</strong>
            <span>累计分钟</span>
          </div>
          <p>约 {Math.round(totalMinutes / 60)} 小时</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon lilac">
            <TrendingUp size={20} />
          </span>
          <div>
            <strong>{Math.round(totalVolume).toLocaleString()}</strong>
            <span>累计容量 kg</span>
          </div>
          <p>力量在慢慢累积</p>
        </article>
      </section>

      <section className="progress-grid">
        <article className="panel weight-panel">
          <div className="panel-head">
            <div>
              <h2>体重趋势</h2>
              <p>{metrics.length} 次记录</p>
            </div>
            <button className="text-link" type="button" onClick={() => openMetric()}>
              <Plus size={15} />
              记录
            </button>
          </div>
          {weightData.length > 0 ? (
            <LineChart data={weightData} unit=" kg" height={240} />
          ) : (
            <div className="chart-empty">
              <Scale size={28} />
              <p>记录第一次体重，趋势才会开始。</p>
              <button className="button ghost" type="button" onClick={() => openMetric()}>
                现在记录
              </button>
            </div>
          )}
          <div className="weight-summary">
            <div>
              <span>起始</span>
              <strong>{first ? `${first.weight} kg` : '--'}</strong>
            </div>
            <div>
              <span>当前</span>
              <strong>{latest ? `${latest.weight} kg` : '--'}</strong>
            </div>
            <div>
              <span>变化</span>
              <strong className={weightDelta <= 0 ? 'down' : 'up'}>
                {latest && first
                  ? `${weightDelta > 0 ? '+' : ''}${weightDelta} kg`
                  : '--'}
              </strong>
            </div>
          </div>
        </article>

        <article className="panel body-panel">
          <div className="panel-head">
            <div>
              <h2>身体成分</h2>
              <p>最近一次记录</p>
            </div>
            <div className="panel-head-inline">
              {latest ? (
                <button className="text-link" type="button" onClick={() => openMetric(latest)}>
                  <Pencil size={14} />
                  编辑
                </button>
              ) : null}
              <Activity size={20} className="panel-head-icon" />
            </div>
          </div>
          <ul className="body-metric-list">
            <li>
              <span className="body-metric-icon">
                <Scale size={18} />
              </span>
              <div>
                <span>体重</span>
                <strong>{latest ? `${latest.weight} kg` : '未记录'}</strong>
              </div>
              {latest && first ? (
                <small className={latest.weight <= first.weight ? 'down' : 'up'}>
                  {latest.weight <= first.weight ? '-' : '+'}
                  {Math.abs(Math.round((latest.weight - first.weight) * 10) / 10)} kg
                </small>
              ) : null}
            </li>
            <li>
              <span className="body-metric-icon">
                <Ruler size={18} />
              </span>
              <div>
                <span>身高</span>
                <strong>{latest?.height ? `${latest.height} cm` : '未记录'}</strong>
              </div>
            </li>
            <li>
              <span className="body-metric-icon">
                <Activity size={18} />
              </span>
              <div>
                <span>BMI</span>
                <strong>{latestBmi ? latestBmi.toFixed(1) : '未记录'}</strong>
              </div>
            </li>
            <li>
              <span className="body-metric-icon">
                <Activity size={18} />
              </span>
              <div>
                <span>体脂率</span>
                <strong>{latest?.bodyFat ? `${latest.bodyFat}%` : '未记录'}</strong>
              </div>
              {latest?.bodyFat && first?.bodyFat ? (
                <small className={latest.bodyFat <= first.bodyFat ? 'down' : 'up'}>
                  {latest.bodyFat <= first.bodyFat ? '-' : '+'}
                  {Math.abs(Math.round((latest.bodyFat - first.bodyFat) * 10) / 10)}%
                </small>
              ) : null}
            </li>
            <li>
              <span className="body-metric-icon">
                <Minus size={18} />
              </span>
              <div>
                <span>腰围</span>
                <strong>{latest?.waist ? `${latest.waist} cm` : '未记录'}</strong>
              </div>
              {latest?.waist && first?.waist ? (
                <small className={latest.waist <= first.waist ? 'down' : 'up'}>
                  {latest.waist <= first.waist ? '-' : '+'}
                  {Math.abs(Math.round((latest.waist - first.waist) * 10) / 10)} cm
                </small>
              ) : null}
            </li>
            <li>
              <span className="body-metric-icon">
                <HeartPulse size={18} />
              </span>
              <div>
                <span>血压</span>
                <strong>
                  {latest?.systolic && latest?.diastolic
                    ? `${latest.systolic}/${latest.diastolic} mmHg`
                    : '未记录'}
                </strong>
              </div>
            </li>
            <li>
              <span className="body-metric-icon">
                <HeartPulse size={18} />
              </span>
              <div>
                <span>静息心率</span>
                <strong>
                  {latest?.restingHeartRate ? `${latest.restingHeartRate} bpm` : '未记录'}
                </strong>
              </div>
            </li>
          </ul>
          <div className="body-note">
            <p>
              {latest?.note
                ? `报告备注：${latest.note}`
                : '体重只是其中一个指标。围度下降、训练表现变好，同样是进步。'}
            </p>
          </div>
        </article>
      </section>

      <section className="progress-grid">
        <article className="panel volume-panel">
          <div className="panel-head">
            <div>
              <h2>每周训练容量</h2>
              <p>最近 6 周 · kg</p>
            </div>
            <TrendingUp size={20} className="panel-head-icon" />
          </div>
          <BarChart data={volumeData} unit=" kg" height={230} />
        </article>

        <article className="panel heatmap-panel">
          <div className="panel-head">
            <div>
              <h2>打卡热力图</h2>
              <p>最近 8 周</p>
            </div>
            <span className="chip chip-streak">
              <Activity size={14} />
              {streak} 天连续
            </span>
          </div>
          <Heatmap workouts={personal.workouts} weeks={8} />
          <p className="heatmap-note">
            颜色越深，代表当天训练时间越长。空白不是失败，是下一次开始的位置。
          </p>
        </article>
      </section>

      <section className="progress-grid">
        <article className="panel records-panel">
          <div className="panel-head">
            <div>
              <h2>个人纪录</h2>
              <p>按单次重量排序</p>
            </div>
            <Trophy size={20} className="panel-head-icon" />
          </div>
          {records.length > 0 ? (
            <ul className="record-list">
              {records.map((record) => (
                <li key={record.exerciseId}>
                  <span className="record-icon">
                    <Trophy size={17} />
                  </span>
                  <div>
                    <strong>{EXERCISE_MAP[record.exerciseId]?.name ?? record.exerciseId}</strong>
                    <small>
                      {record.weight} kg × {record.reps} 次 · {formatShort(record.date)}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-copy">完成带负重的训练后，这里会出现你的纪录。</p>
          )}
        </article>

        <article className="panel history-panel">
          <div className="panel-head">
            <div>
              <h2>身体数据历史</h2>
              <p>最近 5 次</p>
            </div>
            <Scale size={20} className="panel-head-icon" />
          </div>
          {metrics.length > 0 ? (
            <ul className="metric-history">
              {[...metrics]
                .reverse()
                .slice(0, 5)
                .map((metric) => {
                  const metricBmi = metric.height
                    ? (metric.weight / Math.pow(metric.height / 100, 2)).toFixed(1)
                    : null;
                  return (
                    <li key={metric.id}>
                      <div className="metric-history-main">
                        <span>{formatMonthDay(metric.date)}</span>
                        <strong>{metric.weight} kg</strong>
                        {metric.source === 'report' ? (
                          <span className="metric-source-badge">报告</span>
                        ) : (
                          <span />
                        )}
                        <button
                          className="text-button metric-edit"
                          type="button"
                          onClick={() => openMetric(metric)}
                          aria-label="编辑身体数据"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                      <div className="metric-history-tags">
                        {metric.height ? <span>身高 {metric.height}</span> : null}
                        {metricBmi ? <span>BMI {metricBmi}</span> : null}
                        {metric.bodyFat ? <span>体脂 {metric.bodyFat}%</span> : null}
                        {metric.waist ? <span>腰围 {metric.waist}</span> : null}
                        {metric.systolic && metric.diastolic ? (
                          <span>
                            血压 {metric.systolic}/{metric.diastolic}
                          </span>
                        ) : null}
                        {metric.restingHeartRate ? (
                          <span>心率 {metric.restingHeartRate}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p className="empty-copy">还没有身体数据记录。</p>
          )}
        </article>
      </section>

      <DataImportModal open={importOpen} onClose={() => setImportOpen(false)} />

      {reportOpen ? (
        <HealthReportModal open onClose={() => setReportOpen(false)} />
      ) : null}

      <Modal
        open={metricOpen}
        onClose={() => setMetricOpen(false)}
        title={editingId ? '编辑身体数据' : '记录身体数据'}
        size="md"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setMetricOpen(false)}>
              取消
            </button>
            <button className="button primary" type="button" onClick={saveMetric}>
              {editingId ? '保存修改' : '保存记录'}
            </button>
          </div>
        }
      >
        <div className="metric-form-grid">
          <label className="field">
            <span>日期</span>
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
              step="0.1"
              value={heightInput}
              onChange={(event) => setHeightInput(event.target.value)}
              placeholder="例如 175"
            />
          </label>
          <label className="field">
            <span>体重（kg）</span>
            <input
              className="plain-input"
              type="number"
              inputMode="decimal"
              step="0.1"
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
              step="0.1"
              value={bodyFatInput}
              onChange={(event) => setBodyFatInput(event.target.value)}
              placeholder="例如 21.0"
            />
          </label>
          <label className="field">
            <span>腰围（cm）</span>
            <input
              className="plain-input"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={waistInput}
              onChange={(event) => setWaistInput(event.target.value)}
              placeholder="例如 83.5"
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
              placeholder="例如 66"
            />
          </label>
          <div className="field">
            <span>BMI</span>
            <div className="bmi-readout">
              <HeartPulse size={16} />
              {bmiPreview}
            </div>
          </div>
          <label className="field metric-note">
            <span>备注</span>
            <textarea
              className="note-input"
              rows={2}
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              placeholder="体检结论、医生建议或当天状态"
            />
          </label>
        </div>
        <p className="hint-text metric-hint">
          {editingId
            ? '修改历史记录后，体重趋势、BMI 和身体档案会同步更新。'
            : '同一天重复记录会覆盖当天数据；身高会用于计算 BMI。'}
        </p>
      </Modal>
    </div>
  );
}
