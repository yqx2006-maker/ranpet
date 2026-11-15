import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  Clock,
  Dumbbell,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  X,
} from 'lucide-react';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { Modal } from '../components/Modal';
import { EXERCISE_MAP, formatTarget } from '../data/exercises';
import { useAppStore } from '../store/useAppStore';
import type { PlanExercise, SetLog } from '../types';
import { formatShort, todayISO, weekdayShort } from '../utils/date';
import { exerciseVideoUrl, exerciseVisual } from '../utils/exerciseMedia';
import { planDayForDate } from '../utils/plan';

function suggestedWeight(exerciseId: string): number {
  const exercise = EXERCISE_MAP[exerciseId];
  if (!exercise || exercise.unit === 'time') return 0;
  if (exercise.equipment.includes('gym')) return exercise.compound ? 30 : 15;
  if (exercise.equipment.includes('dumbbell')) return exercise.compound ? 16 : 6;
  return 0;
}

function buildLogs(exercises: PlanExercise[]): Record<string, SetLog[]> {
  const logs: Record<string, SetLog[]> = {};
  for (const item of exercises) {
    const weight = suggestedWeight(item.exerciseId);
    logs[item.exerciseId] = Array.from({ length: item.sets }, () => ({
      reps: item.reps,
      weight,
      done: false,
    }));
  }
  return logs;
}

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function WorkoutSessionPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const completeWorkout = useAppStore((state) => state.completeWorkout);
  const showToast = useAppStore((state) => state.showToast);

  const day = personal && date ? planDayForDate(personal.plan, date) : null;
  const exercises = day?.exercises ?? [];
  const startedAt = useRef(0);

  const [logs, setLogs] = useState<Record<string, SetLog[]>>(() => buildLogs(exercises));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeRunning, setTimeRunning] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [pendingAction, setPendingAction] = useState<'exercise' | 'finish' | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [rpe, setRpe] = useState(7);
  const [note, setNote] = useState('');

  const currentExercise = exercises[currentIndex];
  const exerciseDef = currentExercise ? EXERCISE_MAP[currentExercise.exerciseId] : null;
  const currentSets = currentExercise ? logs[currentExercise.exerciseId] ?? [] : [];
  const currentSet = currentSets[setIndex];
  const isTime = exerciseDef?.unit === 'time';
  const isWeighted = Boolean(
    exerciseDef?.equipment.some((item) => item === 'dumbbell' || item === 'gym'),
  );
  const nextExercise = exercises[currentIndex + 1];
  const nextExerciseName = nextExercise
    ? EXERCISE_MAP[nextExercise.exerciseId]?.name
    : undefined;
  const allSets = Object.values(logs).flat();
  const doneSetCount = allSets.filter((item) => item.done).length;
  const totalSetCount = allSets.length;
  const progress = totalSetCount > 0 ? (doneSetCount / totalSetCount) * 100 : 0;
  const blockLabel =
    currentExercise?.block === 'warmup'
      ? '热身'
      : currentExercise?.block === 'main'
        ? '主训练'
        : '放松';

  useEffect(() => {
    startedAt.current = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setLogs(buildLogs(exercises));
    setCurrentIndex(0);
    setSetIndex(0);
  }, [date, exercises.length]);

  useEffect(() => {
    const set = currentSets[setIndex];
    setWeightInput(set ? String(set.weight) : '');
    setRepsInput(set ? String(set.reps) : '');
    setTimeLeft(exerciseDef?.reps ?? 0);
    setTimeRunning(false);
  }, [currentIndex, setIndex]);

  useEffect(() => {
    if (!timeRunning) return;
    if (timeLeft <= 0) {
      setTimeRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeRunning, timeLeft]);

  useEffect(() => {
    if (!restOpen) return;
    if (restLeft <= 0) {
      setRestOpen(false);
      if (pendingAction === 'exercise') {
        setCurrentIndex((index) => Math.min(exercises.length - 1, index + 1));
        setSetIndex(0);
      }
      if (pendingAction === 'finish') {
        setFinishOpen(true);
      }
      setPendingAction(null);
      return;
    }
    const timer = window.setTimeout(() => setRestLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [restOpen, restLeft, pendingAction, exercises.length]);

  if (!user || !personal) return null;

  if (!day || day.isRest || !currentExercise || !exerciseDef) {
    return (
      <div className="session-empty">
        <Dumbbell size={40} />
        <h1>今天没有安排训练</h1>
        <p>去训练页看看本周计划，或者给自己安排一次恢复。</p>
        <Link to="/training" className="button primary">
          返回训练页
        </Link>
      </div>
    );
  }

  const startRest = (seconds: number, action: 'exercise' | 'finish' | null) => {
    setRestTotal(seconds);
    setRestLeft(seconds);
    setPendingAction(action);
    setRestOpen(seconds > 0);
    if (seconds <= 0 && action === 'finish') setFinishOpen(true);
  };

  const completeSet = () => {
    if (!currentSet) return;
    const reps = isTime
      ? currentSet.reps
      : Math.max(1, Number(repsInput) || currentSet.reps);
    const weight = isTime ? 0 : Math.max(0, Number(weightInput) || 0);
    const updated = currentSets.map((item, index) =>
      index === setIndex ? { ...item, reps, weight, done: true } : item,
    );
    setLogs((current) => ({ ...current, [currentExercise.exerciseId]: updated }));

    const hasMoreSets = setIndex < currentSets.length - 1;
    const hasMoreExercises = currentIndex < exercises.length - 1;
    if (hasMoreSets) {
      setSetIndex(setIndex + 1);
      startRest(Math.max(15, currentExercise.restSec), null);
      return;
    }
    if (hasMoreExercises) {
      startRest(Math.max(20, currentExercise.restSec), 'exercise');
      return;
    }
    setFinishOpen(true);
  };

  const skipExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSetIndex(0);
      setRestOpen(false);
      setPendingAction(null);
    } else {
      setFinishOpen(true);
    }
  };

  const bodyWeight = personal.metrics.at(-1)?.weight ?? 70;
  let estimatedVolume = 0;
  for (const [exerciseId, sets] of Object.entries(logs)) {
    const definition = EXERCISE_MAP[exerciseId];
    if (!definition || definition.unit === 'time' || definition.focus === 'mobility') continue;
    for (const set of sets) {
      if (!set.done) continue;
      estimatedVolume += set.reps * (set.weight > 0 ? set.weight : bodyWeight * 0.45);
    }
  }
  estimatedVolume = Math.round(estimatedVolume);

  const saveWorkout = () => {
    if (doneSetCount === 0) {
      showToast('还没有完成任何一组', '先完成一组，再保存这次训练。');
      return;
    }
    const log = completeWorkout({
      date: day.date,
      title: day.title,
      focus: day.focus,
      durationMin: Math.max(1, Math.round(elapsed / 60)),
      rpe,
      exercises: Object.entries(logs)
        .map(([exerciseId, sets]) => ({
          exerciseId,
          sets: sets.filter((item) => item.done),
        }))
        .filter((item) => item.sets.length > 0),
      note: note.trim() || undefined,
    });
    if (log) navigate(`/summary/${log.id}`);
  };

  const doneForCurrent = currentSets.filter((item) => item.done).length;
  const timeProgress = exerciseDef.reps > 0 ? (timeLeft / exerciseDef.reps) * 100 : 0;
  const circumference = 2 * Math.PI * 46;

  return (
    <div className="session-page">
      <header className="session-top">
        <button
          className="icon-button session-close"
          type="button"
          onClick={() => setLeaveOpen(true)}
          aria-label="退出训练"
        >
          <X size={22} />
        </button>
        <div className="session-progress">
          <div className="session-progress-head">
            <span>{blockLabel}</span>
            <span>
              {doneSetCount}/{totalSetCount} 组
            </span>
          </div>
          <div className="session-track">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="session-clock">
          <Clock size={15} />
          {formatClock(elapsed)}
        </span>
      </header>

      <div className="session-body">
        <main className="session-stage">
          <div className="session-intro">
            <div className="session-intro-copy">
              <div className="session-date">
                {weekdayShort(day.date)} · {formatShort(day.date)} · {day.title}
              </div>
              <p className="eyebrow">
                动作 {currentIndex + 1} / {exercises.length}
              </p>
              <h1>{exerciseDef.name}</h1>
              <p className="session-target">{exerciseDef.target}</p>

              <ul className="session-cues">
                {exerciseDef.cues.map((cue) => (
                  <li key={cue}>
                    <Check size={15} />
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className={`session-demo visual-${exerciseVisual(exerciseDef)}${
                exerciseDef.imageUrl ? ' has-photo' : ''
              }`}
            >
              <ExerciseMedia exercise={exerciseDef} />
              <a
                className="session-video-link"
                href={exerciseVideoUrl(exerciseDef)}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={13} />
                看教学视频
              </a>
            </div>
          </div>

          <div className="set-card">
            <div className="set-head">
              <span>
                第 {setIndex + 1} / {currentSets.length} 组
              </span>
              <span>{doneForCurrent} 组已完成</span>
            </div>

            {isTime ? (
              <div className="time-block">
                <div className="time-dial">
                  <svg viewBox="0 0 110 110" aria-hidden="true">
                    <circle
                      cx="55"
                      cy="55"
                      r="46"
                      fill="none"
                      stroke="var(--line-soft)"
                      strokeWidth="9"
                    />
                    <circle
                      cx="55"
                      cy="55"
                      r="46"
                      fill="none"
                      stroke="var(--coral)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - timeProgress / 100)}
                      transform="rotate(-90 55 55)"
                    />
                  </svg>
                  <div>
                    <strong>{timeLeft}</strong>
                    <span>秒</span>
                  </div>
                </div>
                <div className="time-actions">
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => setTimeRunning(!timeRunning)}
                  >
                    {timeRunning ? <Pause size={16} /> : <Play size={16} />}
                    {timeRunning ? '暂停' : timeLeft === 0 ? '时间到' : '开始计时'}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setTimeRunning(false);
                      setTimeLeft(exerciseDef.reps);
                    }}
                  >
                    <RotateCcw size={16} />
                    重置
                  </button>
                </div>
              </div>
            ) : (
              <div className={`set-inputs${isWeighted ? '' : ' single'}`}>
                {isWeighted ? (
                  <label>
                    <span>重量</span>
                    <div className="number-input">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.5"
                        value={weightInput}
                        onChange={(event) => setWeightInput(event.target.value)}
                      />
                      <em>kg</em>
                    </div>
                  </label>
                ) : (
                  <div className="bodyweight-tag">
                    <Dumbbell size={18} />
                    <span>自重动作</span>
                  </div>
                )}
                <label>
                  <span>次数</span>
                  <div className="number-input">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={repsInput}
                      onChange={(event) => setRepsInput(event.target.value)}
                    />
                    <em>次</em>
                  </div>
                </label>
              </div>
            )}

            <button className="button primary session-complete" type="button" onClick={completeSet}>
              <Check size={19} />
              完成本组
            </button>
            <p className="set-hint">
              目标：{formatTarget(exerciseDef, currentSet?.reps ?? exerciseDef.reps)} ·
              组间休息 {currentExercise.restSec} 秒
            </p>
          </div>

          <div className="session-nav">
            <button className="text-button" type="button" onClick={skipExercise}>
              <SkipForward size={16} />
              跳过此动作
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setRestOpen(false);
                setPendingAction(null);
                setFinishOpen(true);
              }}
            >
              <Flame size={16} />
              提前结束并保存
            </button>
          </div>
        </main>

        <aside className="session-side">
          <div className="session-side-head">
            <h2>今日动作</h2>
            <span>{exercises.length} 个</span>
          </div>
          <ol className="session-exercise-list">
            {exercises.map((item, index) => {
              const exercise = EXERCISE_MAP[item.exerciseId];
              const done = logs[item.exerciseId]?.filter((set) => set.done).length ?? 0;
              const isActive = index === currentIndex;
              return (
                <li key={`${item.exerciseId}-${index}`} className={isActive ? 'active' : ''}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setSetIndex(0);
                      setRestOpen(false);
                      setPendingAction(null);
                    }}
                  >
                    <span className="session-index">
                      {done === item.sets ? <Check size={14} /> : index + 1}
                    </span>
                    <span className="session-exercise-copy">
                      <strong>{exercise?.name ?? item.exerciseId}</strong>
                      <small>
                        {done}/{item.sets} 组
                      </small>
                    </span>
                    {isActive ? <ChevronLeft size={15} className="active-arrow" /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="session-side-note">
            完成一组后会自动进入休息计时，可以直接在页面里调整重量和次数。
          </p>
          <div className="session-side-pet">
            <span>{todayISO() === day.date ? '今天练完' : '补练也算数'}</span>
            <strong>噗噗在终点等你。</strong>
          </div>
        </aside>
      </div>

      {restOpen ? (
        <div className="rest-overlay" role="status">
          <div className="rest-card">
            <p className="eyebrow">组间休息</p>
            <div className="rest-count">{restLeft}</div>
            <p className="rest-unit">秒</p>
            <div className="rest-bar">
              <i
                style={{
                  width: `${restTotal > 0 ? ((restTotal - restLeft) / restTotal) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="rest-next">
              {pendingAction === 'exercise' && nextExerciseName
                ? `下一个：${nextExerciseName}`
                : '调整呼吸，准备下一组'}
            </p>
            <div className="rest-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setRestLeft((value) => value + 20);
                  setRestTotal((value) => value + 20);
                }}
              >
                <Plus size={16} />
                +20 秒
              </button>
              <button className="button primary" type="button" onClick={() => setRestLeft(0)}>
                跳过休息
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        title="完成这次训练？"
        size="md"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setFinishOpen(false)}>
              继续练
            </button>
            <button className="button primary" type="button" onClick={saveWorkout}>
              保存训练
            </button>
          </div>
        }
      >
        <div className="finish-summary">
          <div className="finish-stats">
            <div>
              <strong>
                {doneSetCount}/{totalSetCount}
              </strong>
              <span>完成组数</span>
            </div>
            <div>
              <strong>{formatClock(elapsed)}</strong>
              <span>训练时长</span>
            </div>
            <div>
              <strong>{estimatedVolume.toLocaleString()}</strong>
              <span>容量 kg</span>
            </div>
          </div>
          <p className="finish-copy">
            保存后，这次训练会写入进度，并给伙伴增加成长值。
          </p>
          <div className="finish-block">
            <strong>这次有多累？</strong>
            <div className="rpe-row">
              {[4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={rpe === value ? 'active' : ''}
                  onClick={() => setRpe(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="hint-text">4 = 很轻松，7 = 有挑战，10 = 到极限</span>
          </div>
          <label className="field">
            <span>训练备注（可选）</span>
            <textarea
              className="note-input"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="今天哪个动作最有感觉？"
              rows={3}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="离开训练？"
        size="sm"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setLeaveOpen(false)}>
              继续训练
            </button>
            <button className="button primary" type="button" onClick={() => navigate('/training')}>
              离开
            </button>
          </div>
        }
      >
        <p className="confirm-copy">
          当前进度不会保存。已经完成的组数会丢失，确定要离开吗？
        </p>
      </Modal>
    </div>
  );
}
