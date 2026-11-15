import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  ExternalLink,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  Timer,
  TriangleAlert,
} from 'lucide-react';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { Modal } from '../components/Modal';
import { bilibiliSearch, exerciseVideoUrl, exerciseVisual } from '../utils/exerciseMedia';
import { EXERCISES, EXERCISE_MAP, formatTarget } from '../data/exercises';
import { useAppStore } from '../store/useAppStore';
import {
  EQUIP_LABEL,
  FOCUS_LABEL,
  GOAL_HINT,
  GOAL_LABEL,
  LEVEL_LABEL,
  type Equipment,
  type Exercise,
  type Focus,
  type Goal,
  type Level,
  type PlanDay,
} from '../types';
import { addDays, formatShort, todayISO, weekdayShort } from '../utils/date';
import { getWeekWorkouts } from '../utils/stats';

const LIBRARY_FILTERS: { value: Focus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'push', label: '推' },
  { value: 'pull', label: '拉' },
  { value: 'legs', label: '腿臀' },
  { value: 'core', label: '核心' },
  { value: 'cardio', label: '有氧' },
  { value: 'mobility', label: '灵活' },
];

interface SettingsDraft {
  goal: Goal;
  level: Level;
  equipment: Equipment;
  daysPerWeek: number;
  sessionMinutes: number;
}

export function TrainingPage() {
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const updateProfile = useAppStore((state) => state.updateProfile);
  const ensurePlan = useAppStore((state) => state.ensurePlan);
  const showToast = useAppStore((state) => state.showToast);

  const [tab, setTab] = useState<'plan' | 'library'>('plan');
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusFilter, setFocusFilter] = useState<Focus | 'all'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | 'all'>('all');
  const [draft, setDraft] = useState<SettingsDraft>({
    goal: user?.goal ?? 'build',
    level: user?.level ?? 'beginner',
    equipment: user?.equipment ?? 'none',
    daysPerWeek: user?.daysPerWeek ?? 3,
    sessionMinutes: user?.sessionMinutes ?? 30,
  });

  if (!user || !personal) return null;

  const plan = personal.plan;
  const weekStart = plan?.weekStart ?? '';
  const today = todayISO();
  const weekDone = getWeekWorkouts(personal.workouts).length;

  const openSettings = () => {
    setDraft({
      goal: user.goal,
      level: user.level,
      equipment: user.equipment,
      daysPerWeek: user.daysPerWeek,
      sessionMinutes: user.sessionMinutes,
    });
    setSettingsOpen(true);
  };

  const filteredExercises = EXERCISES.filter((exercise) => {
    const matchesFocus = focusFilter === 'all' || exercise.focus === focusFilter;
    const matchesEquipment =
      equipmentFilter === 'all' ||
      exercise.equipment.includes(equipmentFilter) ||
      (equipmentFilter === 'none' && exercise.equipment.includes('none'));
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      keyword.length === 0 ||
      exercise.name.toLowerCase().includes(keyword) ||
      exercise.target.toLowerCase().includes(keyword) ||
      exercise.cues.some((cue) => cue.toLowerCase().includes(keyword));
    return matchesFocus && matchesEquipment && matchesSearch;
  });

  const selectedDayWorkout = selectedDay
    ? personal.workouts.find((item) => item.date === selectedDay.date)
    : null;

  return (
    <div className="training-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">训练</p>
          <h1>按计划来，别靠意志力硬撑</h1>
          <p className="page-sub">
            {plan
              ? `本周已完成 ${weekDone} / ${user.daysPerWeek} 次训练。`
              : '还没有生成训练计划，先完成一次设置。'}
          </p>
        </div>
        <button className="button ghost" type="button" onClick={openSettings}>
          <SlidersHorizontal size={17} />
          调整计划
        </button>
      </header>

      <div className="segmented-tabs" role="tablist">
        <button
          type="button"
          className={tab === 'plan' ? 'active' : ''}
          onClick={() => setTab('plan')}
        >
          本周计划
        </button>
        <button
          type="button"
          className={tab === 'library' ? 'active' : ''}
          onClick={() => setTab('library')}
        >
          动作库
        </button>
      </div>

      {tab === 'plan' ? (
        plan ? (
          <section className="plan-section">
            <div className="panel-head plan-head">
              <div>
                <h2>本周安排</h2>
                <p>
                  {formatShort(weekStart)} - {formatShort(addDays(weekStart, 6))}
                </p>
              </div>
              <button className="text-link" type="button" onClick={openSettings}>
                重新设置
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="plan-day-grid">
              {plan.days.map((day) => {
                const done = personal.workouts.some((item) => item.date === day.date);
                const isToday = day.date === today;
                const isPast = day.date < today;
                const mainCount = day.exercises.filter((item) => item.block === 'main').length;
                return (
                  <button
                    key={day.date}
                    type="button"
                    className={`plan-day-card${done ? ' done' : ''}${isToday ? ' today' : ''}${
                      day.isRest ? ' rest' : ''
                    }`}
                    onClick={() => {
                      if (day.isRest) {
                        showToast('今天是恢复日', '散步、拉伸，或者早点睡。');
                        return;
                      }
                      setSelectedDay(day);
                    }}
                  >
                    <div className="plan-day-top">
                      <span>
                        {weekdayShort(day.date)} · {formatShort(day.date)}
                      </span>
                      {done ? (
                        <span className="day-status done">
                          <Check size={13} /> 完成
                        </span>
                      ) : isToday ? (
                        <span className="day-status today">今天</span>
                      ) : day.isRest ? (
                        <span className="day-status rest">休息</span>
                      ) : (
                        <span className="day-status">{isPast ? '可补练' : '待练'}</span>
                      )}
                    </div>
                    <strong>{day.isRest ? '恢复日' : day.title}</strong>
                    <div className="plan-day-meta">
                      {day.isRest ? (
                        <span>散步 · 拉伸 · 睡眠</span>
                      ) : (
                        <>
                          <span>{FOCUS_LABEL[day.focus]}</span>
                          <span>{day.durationMin} 分钟</span>
                          <span>{mainCount} 动作</span>
                        </>
                      )}
                    </div>
                    {!day.isRest ? (
                      <span className="plan-day-cta">
                        {done ? '查看详情' : isToday ? '开始训练' : isPast ? '补练' : '查看内容'}
                        <ArrowRight size={15} />
                      </span>
                    ) : (
                      <span className="plan-day-cta muted">让身体恢复</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="plan-tips">
              <article className="tip-card">
                <span className="tip-icon">
                  <Sparkles size={18} />
                </span>
                <div>
                  <strong>{GOAL_LABEL[user.goal]}</strong>
                  <p>{GOAL_HINT[user.goal]}</p>
                  <a
                    className="tip-video-link"
                    href={bilibiliSearch(`${GOAL_LABEL[user.goal]} 训练计划 新手`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Play size={11} />
                    看视频
                  </a>
                </div>
              </article>
              <article className="tip-card">
                <span className="tip-icon">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <strong>节奏建议</strong>
                  <p>训练日之间至少留一天恢复，连续高强度不会更快。</p>
                  <a
                    className="tip-video-link"
                    href={bilibiliSearch('力量训练 组间休息 节奏')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Play size={11} />
                    看视频
                  </a>
                </div>
              </article>
              <article className="tip-card">
                <span className="tip-icon">
                  <Timer size={18} />
                </span>
                <div>
                  <strong>没时间怎么办</strong>
                  <p>只做主训练的前两个动作，也比完全不动强。</p>
                  <a
                    className="tip-video-link"
                    href={bilibiliSearch('15分钟 居家训练')}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Play size={11} />
                    看视频
                  </a>
                </div>
              </article>
            </div>
          </section>
        ) : (
          <section className="panel empty-panel">
            <Dumbbell size={36} />
            <h2>还没有训练计划</h2>
            <p>根据你的目标、经验和时间，生成一份本周安排。</p>
            <button className="button primary" type="button" onClick={() => ensurePlan()}>
              生成我的周计划
              <ArrowRight size={17} />
            </button>
          </section>
        )
      ) : null}

      {tab === 'library' ? (
        <section className="library-section">
          <div className="library-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索动作或目标肌群"
              />
            </label>
            <div className="filter-row">
              {LIBRARY_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`filter-chip${focusFilter === item.value ? ' active' : ''}`}
                  onClick={() => setFocusFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="filter-row subtle">
              <button
                type="button"
                className={`filter-chip${equipmentFilter === 'all' ? ' active' : ''}`}
                onClick={() => setEquipmentFilter('all')}
              >
                全部器械
              </button>
              {(['none', 'dumbbell', 'gym'] as Equipment[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-chip${equipmentFilter === item ? ' active' : ''}`}
                  onClick={() => setEquipmentFilter(item)}
                >
                  {EQUIP_LABEL[item]}
                </button>
              ))}
            </div>
            <p className="result-count">{filteredExercises.length} 个动作</p>
          </div>

          <div className="exercise-grid">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                className="exercise-card"
                onClick={() => setSelectedExercise(exercise)}
              >
                <div
                  className={`exercise-visual visual-${exerciseVisual(exercise)}${
                    exercise.imageUrl ? ' has-photo' : ''
                  }`}
                >
                  <ExerciseMedia exercise={exercise} />
                </div>
                <div className="exercise-card-top">
                  <span className={`focus-tag focus-${exercise.focus}`}>
                    {FOCUS_LABEL[exercise.focus]}
                  </span>
                  <span className="equipment-tag">
                    {equipmentLabel(exercise)}
                  </span>
                </div>
                <strong>{exercise.name}</strong>
                <p>{exercise.target}</p>
                <div className="exercise-card-meta">
                  <span>
                    {exercise.sets} 组 × {formatTarget(exercise, exercise.reps)}
                  </span>
                  <span>休息 {exercise.restSec}s</span>
                </div>
                <span className="exercise-card-cue">
                  <ChevronRight size={14} />
                  {exercise.cues[0]}
                </span>
              </button>
            ))}
          </div>
          {filteredExercises.length === 0 ? (
            <div className="empty-panel small">
              <Search size={28} />
              <h2>没有找到动作</h2>
              <p>换个关键词，或者放宽筛选条件。</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="调整训练计划"
        size="md"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setSettingsOpen(false)}>
              取消
            </button>
            <button
              className="button primary"
              type="button"
              onClick={() => {
                updateProfile(draft);
                setSettingsOpen(false);
              }}
            >
              保存并重排计划
            </button>
          </div>
        }
      >
        <div className="settings-form">
          <div className="settings-block">
            <strong>目标</strong>
            <div className="segmented">
              {(['lose', 'build', 'keep'] as Goal[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={draft.goal === item ? 'active' : ''}
                  onClick={() => setDraft({ ...draft, goal: item })}
                >
                  {GOAL_LABEL[item]}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-block">
            <strong>经验</strong>
            <div className="segmented">
              {(['beginner', 'intermediate', 'advanced'] as Level[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={draft.level === item ? 'active' : ''}
                  onClick={() => setDraft({ ...draft, level: item })}
                >
                  {LEVEL_LABEL[item]}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-block">
            <strong>器械条件</strong>
            <div className="segmented">
              {(['none', 'dumbbell', 'gym'] as Equipment[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={draft.equipment === item ? 'active' : ''}
                  onClick={() => setDraft({ ...draft, equipment: item })}
                >
                  {EQUIP_LABEL[item]}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-block">
              <strong>每周训练</strong>
              <div className="segmented compact">
                {[2, 3, 4, 5, 6].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={draft.daysPerWeek === item ? 'active' : ''}
                    onClick={() => setDraft({ ...draft, daysPerWeek: item })}
                  >
                    {item} 天
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-block">
              <strong>单次时长</strong>
              <div className="segmented compact">
                {[20, 30, 45, 60].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={draft.sessionMinutes === item ? 'active' : ''}
                    onClick={() => setDraft({ ...draft, sessionMinutes: item })}
                  >
                    {item} 分
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="hint-text">保存后会按新设置重新生成本周计划。</p>
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay?.title ?? '训练详情'}
        size="md"
        footer={
          selectedDay ? (
            <div className="modal-actions">
              <button className="button ghost" type="button" onClick={() => setSelectedDay(null)}>
                关闭
              </button>
              {selectedDayWorkout ? (
                <Link
                  to={`/summary/${selectedDayWorkout.id}`}
                  className="button primary"
                  onClick={() => setSelectedDay(null)}
                >
                  查看本次总结
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <Link
                  to={`/session/${selectedDay.date}`}
                  className="button primary"
                  onClick={() => setSelectedDay(null)}
                >
                  开始训练
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          ) : null
        }
      >
        {selectedDay ? (
          <div className="day-detail">
            <div className="day-detail-meta">
              <span>
                <CalendarDays size={15} /> {weekdayShort(selectedDay.date)} ·{' '}
                {formatShort(selectedDay.date)}
              </span>
              <span>
                <Clock size={15} /> {selectedDay.durationMin} 分钟
              </span>
              <span>
                <Dumbbell size={15} /> {FOCUS_LABEL[selectedDay.focus]}
              </span>
            </div>
            {(['warmup', 'main', 'cooldown'] as const).map((block) => {
              const items = selectedDay.exercises.filter((item) => item.block === block);
              if (items.length === 0) return null;
              const label = block === 'warmup' ? '热身' : block === 'main' ? '主训练' : '放松';
              return (
                <div className="day-block" key={block}>
                  <div className="day-block-head">
                    <strong>{label}</strong>
                    <span>{items.length} 个动作</span>
                  </div>
                  <ul>
                    {items.map((item) => {
                      const exercise = EXERCISE_MAP[item.exerciseId];
                      return (
                        <li key={`${block}-${item.exerciseId}`}>
                          <span className="day-exercise-name">{exercise?.name ?? item.exerciseId}</span>
                          <span className="day-exercise-actions">
                            {exercise ? (
                              <a
                                className="day-video-link"
                                href={exerciseVideoUrl(exercise)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Play size={11} />
                                教学
                              </a>
                            ) : null}
                            <span className="day-exercise-dose">
                              {item.sets} 组 ×{' '}
                              {exercise ? formatTarget(exercise, item.reps) : `${item.reps} 次`}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
        size="md"
        footer={
          <button className="button primary" type="button" onClick={() => setSelectedExercise(null)}>
            知道了
          </button>
        }
      >
        {selectedExercise ? (
          <div className="exercise-detail">
            <div className="exercise-detail-tags">
              <span className={`focus-tag focus-${selectedExercise.focus}`}>
                {FOCUS_LABEL[selectedExercise.focus]}
              </span>
              <span className="equipment-tag">
                {equipmentLabel(selectedExercise)}
              </span>
              <span className="equipment-tag">目标：{selectedExercise.target}</span>
            </div>
            <div
              className={`exercise-detail-visual visual-${exerciseVisual(selectedExercise)}${
                selectedExercise.imageUrl ? ' has-photo' : ''
              }`}
            >
              <ExerciseMedia exercise={selectedExercise} />
            </div>
            <a
              className="button ghost video-button"
              href={exerciseVideoUrl(selectedExercise)}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={16} />
              在 B 站看教学视频
              <ExternalLink size={14} />
            </a>
            <div className="exercise-detail-stats">
              <div>
                <strong>{selectedExercise.sets}</strong>
                <span>建议组数</span>
              </div>
              <div>
                <strong>{formatTarget(selectedExercise, selectedExercise.reps)}</strong>
                <span>每组目标</span>
              </div>
              <div>
                <strong>{selectedExercise.restSec}s</strong>
                <span>组间休息</span>
              </div>
            </div>
            <div className="cues-block">
              <h3>动作要领</h3>
              <ol>
                {selectedExercise.cues.map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ol>
            </div>
            <div className="mistake-callout">
              <TriangleAlert size={18} />
              <div>
                <strong>常见错误</strong>
                <p>{selectedExercise.mistake}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function equipmentLabel(exercise: Exercise): string {
  if (exercise.equipment.includes('gym')) return EQUIP_LABEL.gym;
  if (exercise.equipment.includes('dumbbell')) return EQUIP_LABEL.dumbbell;
  return EQUIP_LABEL.none;
}
