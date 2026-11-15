import type { WorkoutLog } from '../types';
import { addDays, formatDateCN, startOfWeek } from '../utils/date';
import { getDayMinutes } from '../utils/stats';

export interface ChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartPoint[];
  unit?: string;
  height?: number;
}

export function LineChart({ data, unit = '', height = 220 }: LineChartProps) {
  if (data.length === 0) return null;
  const width = 600;
  const pad = { left: 46, right: 18, top: 18, bottom: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(1, max * 0.1);
  const yMin = min - range * 0.2;
  const yMax = max + range * 0.2;
  const x = (index: number) =>
    pad.left + (index / Math.max(1, data.length - 1)) * innerW;
  const y = (value: number) =>
    pad.top + (1 - (value - yMin) / (yMax - yMin)) * innerH;
  const linePath = data
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(item.value)}`)
    .join(' ');
  const areaPath = `${linePath} L ${x(data.length - 1)} ${pad.top + innerH} L ${pad.left} ${
    pad.top + innerH
  } Z`;
  const ticks = [0, 0.5, 1].map((ratio) => yMin + (yMax - yMin) * ratio);
  const last = data[data.length - 1];

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`趋势图，最新 ${last.value}${unit}`}
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={y(tick)}
            y2={y(tick)}
            className="chart-grid"
          />
          <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="chart-tick">
            {Math.round(tick)}
          </text>
        </g>
      ))}
      {data.length > 1 ? <path d={areaPath} fill="var(--coral)" opacity="0.08" /> : null}
      {data.length > 1 ? <path d={linePath} className="chart-line" /> : null}
      {data.map((item, index) => (
        <g key={`${item.label}-${index}`}>
          <circle cx={x(index)} cy={y(item.value)} r={4.5} className="chart-dot">
            <title>{`${item.label}：${item.value}${unit}`}</title>
          </circle>
          {(data.length <= 7 || index === 0 || index === data.length - 1 || index % 2 === 0) && (
            <text
              x={x(index)}
              y={height - 10}
              textAnchor="middle"
              className="chart-tick"
            >
              {item.label}
            </text>
          )}
        </g>
      ))}
      <g>
        <rect
          x={x(data.length - 1) - 34}
          y={y(last.value) - 30}
          width="68"
          height="22"
          rx="11"
          fill="var(--ink)"
        />
        <text
          x={x(data.length - 1)}
          y={y(last.value) - 15}
          textAnchor="middle"
          className="chart-last-label"
        >
          {last.value}
          {unit}
        </text>
      </g>
    </svg>
  );
}

interface BarChartProps {
  data: ChartPoint[];
  unit?: string;
  height?: number;
}

export function BarChart({ data, unit = '', height = 220 }: BarChartProps) {
  if (data.length === 0) return null;
  const width = 600;
  const pad = { left: 42, right: 18, top: 26, bottom: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((item) => item.value), 1);
  const slot = innerW / data.length;
  const barWidth = Math.min(46, slot * 0.5);
  const ticks = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="柱状对比图"
    >
      {ticks.map((ratio) => (
        <line
          key={ratio}
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + innerH * (1 - ratio)}
          y2={pad.top + innerH * (1 - ratio)}
          className="chart-grid"
        />
      ))}
      {data.map((item, index) => {
        const barHeight = Math.max(3, (item.value / max) * innerH);
        const cx = pad.left + slot * index + slot / 2;
        return (
          <g key={`${item.label}-${index}`}>
            <rect
              x={cx - barWidth / 2}
              y={pad.top + innerH - barHeight}
              width={barWidth}
              height={barHeight}
              rx="8"
              fill={index === data.length - 1 ? 'var(--coral)' : 'var(--mint)'}
              stroke="var(--ink)"
              strokeWidth="2"
            >
              <title>{`${item.label}：${item.value}${unit}`}</title>
            </rect>
            <text x={cx} y={pad.top + innerH - barHeight - 8} textAnchor="middle" className="chart-value">
              {item.value}
            </text>
            <text x={cx} y={height - 10} textAnchor="middle" className="chart-tick">
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface HeatmapProps {
  workouts: WorkoutLog[];
  weeks?: number;
}

export function Heatmap({ workouts, weeks = 8 }: HeatmapProps) {
  const start = addDays(startOfWeek(), -(weeks - 1) * 7);
  const columns = Array.from({ length: weeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => addDays(start, weekIndex * 7 + dayIndex)),
  );

  const levelOf = (minutes: number) => {
    if (minutes <= 0) return 0;
    if (minutes < 20) return 1;
    if (minutes < 40) return 2;
    if (minutes < 60) return 3;
    return 4;
  };

  return (
    <div className="heatmap">
      <div className="heatmap-body">
        <div className="heatmap-weekdays" aria-hidden="true">
          <span>一</span>
          <span>三</span>
          <span>五</span>
        </div>
        <div className="heatmap-grid">
          {columns.map((week, weekIndex) => (
            <div className="heatmap-col" key={weekIndex}>
              {week.map((date) => {
                const minutes = getDayMinutes(workouts, date);
                return (
                  <div
                    key={date}
                    className={`heat-cell heat-${levelOf(minutes)}`}
                    title={`${formatDateCN(date)} · ${minutes} 分钟`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend" aria-hidden="true">
        <span>少</span>
        <i className="heat-cell heat-1" />
        <i className="heat-cell heat-2" />
        <i className="heat-cell heat-3" />
        <i className="heat-cell heat-4" />
        <span>多</span>
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel: string;
}

export function ProgressRing({
  value,
  size = 124,
  stroke = 11,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--coral)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-copy">
        <strong>{label}</strong>
        <span>{sublabel}</span>
      </div>
    </div>
  );
}
