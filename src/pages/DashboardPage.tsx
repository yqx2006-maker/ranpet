import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Minus,
  PawPrint,
  Sparkles,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AchievementIcon } from '../components/AchievementIcon';
import { BarChart, ProgressRing } from '../components/Charts';
import { PetAvatar } from '../components/PetAvatar';
import { EXERCISE_MAP } from '../data/exercises';
import { useAppStore } from '../store/useAppStore';
import { FOCUS_LABEL } from '../types';
import {
  addDays,
  formatDateCN,
  formatShort,
  greeting,
  startOfWeek,
  todayISO,
  weekdayShort,
} from '../utils/date';
import {
  getNextStage,
  getPetMood,
  getPetStage,
  getStageProgress,
} from '../utils/pet';
import {
  getDayMinutes,
  getStreak,
  getWeekWorkouts,
  getWeeklyMinutes,
  getWeeklyVolume,
} from '../utils/stats';
import { planDayForDate } from '../utils/plan';

export function DashboardPage() {
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );

  if (!user || !personal) return null;

  const today = todayISO();
  const todayPlan = planDayForDate(personal.plan, today);
  const todayLog = personal.workouts.find((item) => item.date === today);
  const streak = getStreak(personal.workouts);
  const weekStart = startOfWeek();
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekWorkouts = getWeekWorkouts(personal.workouts);
  const weekMinutes = getWeeklyMinutes(personal.workouts);
  const weekVolume = getWeeklyVolume(personal.workouts);
  const weekGoalPercent = Math.min(
    100,
    Math.round((weekWorkouts.length / Math.max(1, user.daysPerWeek)) * 100),
  );
  const stage = getPetStage(personal.pet.xp);
  const nextStage = getNextStage(personal.pet.xp);
  const stageProgress = getStageProgress(personal.pet.xp);
  const mood = getPetMood(personal.pet, Boolean(todayLog));
  const lastWorkout = personal.workouts[0];
  const mainExercises = todayPlan?.exercises.filter((item) => item.block === 'main') ?? [];
  const recentAchievements = personal.achievements
    .filter((item) => item.unlockedAt)
    .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
    .slice(0, 3);
  const weekChart = weekDates.map((date) => ({
    label: weekdayShort(date),
    value: getDayMinutes(personal.workouts, date),
  }));

  return (
    <div className="dashboard">
      <header className="page-head">
        <div>
          <p className="eyebrow">{formatDateCN(today)}</p>
          <h1>
            {greeting()}，{user.name}
          </h1>
          <p className="page-sub">
            {todayLog
              ? '今天的训练已经完成，给伙伴一点掌声。'
              : streak > 0
                ? `已经连续 ${streak} 天，今天动一动就能延续记录。`
                : '新的一天，先从一个动作开始。'}
          </p>
        </div>
        <div className="page-head-badge">
          <Flame size={18} />
          <span>连续 {streak} 天</span>
        </div>
      </header>

      <section className="dashboard-hero">
        <article className="today-card">
          <div className="today-stamp">TODAY</div>
          {todayPlan && !todayPlan.isRest ? (
            <>
              <div className="today-top">
                <span className="today-date">
                  <CalendarDays size={16} />
                  {formatDateCN(today)}
                </span>
                <span className={`status-pill${todayLog ? ' done' : ''}`}>
                  {todayLog ? <Check size={14} /> : <Clock size={14} />}
                  {todayLog ? '已完成' : '待开始'}
                </span>
              </div>
              <h2>{todayPlan.title}</h2>
              <div className="today-meta">
                <span>{FOCUS_LABEL[todayPlan.focus]}</span>
                <i />
                <span>{todayPlan.durationMin} 分钟</span>
                <i />
                <span>{mainExercises.length} 个主动作</span>
              </div>
              <ul className="exercise-preview">
                {mainExercises.slice(0, 3).map((item, index) => {
                  const exercise = item.exerciseId;
                  return (
                    <li key={exercise}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{EXERCISE_MAP[exercise]?.name ?? exercise}</strong>
                      <small>
                        {item.sets} 组 × {item.reps}
                        {item.unit === 'time' ? ' 秒' : ' 次'}
                      </small>
                    </li>
                  );
                })}
              </ul>
              <div className="today-actions">
                {todayLog ? (
                  <Link to={`/summary/${todayLog.id}`} className="button ink">
                    查看本次总结
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to={`/session/${today}`} className="button ink">
                    开始训练
                    <ArrowRight size={18} />
                  </Link>
                )}
                <span className="today-hint">
                  {todayLog
                    ? `本次 +${todayLog.xp} XP`
                    : lastWorkout
                      ? `上次练了 ${FOCUS_LABEL[lastWorkout.focus]}`
                      : '先做一组热身，找找状态'}
                </span>
              </div>
              <p className="today-coach-note">
                <Flame size={14} />
                {todayLog
                  ? '补水和拉伸别省，明天还有一练。'
                  : '建议先做 2 个热身动作，主训练控制在 40 分钟内。'}
              </p>
            </>
          ) : (
            <>
              <div className="today-top">
                <span className="today-date">
                  <CalendarDays size={16} />
                  {formatDateCN(today)}
                </span>
                <span className="status-pill">恢复日</span>
              </div>
              <h2>今天让身体喘口气</h2>
              <p className="today-rest-copy">
                恢复也是训练的一部分。散步、拉伸，或者早点睡，都是在为下一次变强攒能量。
              </p>
              <div className="today-actions">
                <Link to="/training" className="button ink">
                  看看本周安排
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}
        </article>

        <article className="pet-card">
          <div className="pet-card-copy">
            <span className="eyebrow">你的伙伴</span>
            <h2>{personal.pet.name}</h2>
            <p>{stage.tagline}</p>
          </div>
          <div className="pet-stage-bubble">
            <span>{moodLine(mood)}</span>
          </div>
          <div className="pet-hero">
            <PetAvatar pet={personal.pet} mood={mood} size={230} />
          </div>
          <div className="pet-progress">
            <div className="pet-progress-head">
              <span>
                {stage.name}
                {nextStage ? ` → ${nextStage.name}` : ' · 已满级'}
              </span>
              <strong>{personal.pet.xp} XP</strong>
            </div>
            <div className="mini-track">
              <i style={{ width: `${stageProgress.percent}%` }} />
            </div>
            <div className="pet-meta">
              <span>
                <Zap size={14} /> 活力 {personal.pet.energy}
              </span>
              <span>
                <Heart size={14} /> 亲密 {personal.pet.bond}
              </span>
            </div>
          </div>
          <Link to="/pet" className="pet-link">
            看看它的成长
            <ChevronRight size={17} />
          </Link>
        </article>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-icon coral">
            <Flame size={20} />
          </span>
          <div>
            <strong>{streak}</strong>
            <span>连续天数</span>
          </div>
          <p>{streak > 0 ? '今天别断档' : '从今天点火'}</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon mint">
            <Dumbbell size={20} />
          </span>
          <div>
            <strong>
              {weekWorkouts.length}
              <em>/{user.daysPerWeek}</em>
            </strong>
            <span>本周训练</span>
          </div>
          <p>{weekGoalPercent}% 完成</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon yellow">
            <Timer size={20} />
          </span>
          <div>
            <strong>{weekMinutes}</strong>
            <span>本周分钟</span>
          </div>
          <p>{weekMinutes > 0 ? '动起来就有记录' : '本周还没开始'}</p>
        </article>
        <article className="stat-card">
          <span className="stat-icon lilac">
            <TrendingUp size={20} />
          </span>
          <div>
            <strong>{Math.round(weekVolume).toLocaleString()}</strong>
            <span>本周容量 kg</span>
          </div>
          <p>每一组都算数</p>
        </article>
      </section>

      <section className="panel week-panel">
        <div className="panel-head">
          <div>
            <h2>本周节奏</h2>
            <p>{formatShort(weekStart)} - {formatShort(addDays(weekStart, 6))}</p>
          </div>
          <Link to="/training" className="text-link">
            训练安排
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="week-strip">
          {weekDates.map((date) => {
            const done = personal.workouts.some((item) => item.date === date);
            const planDay = planDayForDate(personal.plan, date);
            const isToday = date === today;
            const isPast = date < today;
            const isRest = planDay?.isRest ?? true;
            return (
              <Link
                to="/training"
                key={date}
                className={`week-day${done ? ' done' : ''}${isToday ? ' today' : ''}${
                  isRest && !done ? ' rest' : ''
                }`}
              >
                <span>{weekdayShort(date)}</span>
                <strong>{formatShort(date).split('.')[1]}</strong>
                <i>
                  {done ? (
                    <Check size={14} />
                  ) : isRest ? (
                    <Minus size={14} />
                  ) : (
                    <Dumbbell size={14} />
                  )}
                </i>
                <small>
                  {done ? '完成' : isToday ? '今天' : isRest ? '休息' : isPast ? '补练' : '待练'}
                </small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="dashboard-lower">
        <article className="panel activity-panel">
          <div className="panel-head">
            <div>
              <h2>本周训练分钟</h2>
              <p>每天动一动，曲线就会说话</p>
            </div>
            <Link to="/progress" className="text-link">
              详细进度
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="activity-chart">
            <BarChart data={weekChart} unit=" 分钟" height={200} />
            <div className="activity-goal">
              <ProgressRing
                value={weekGoalPercent}
                label={`${weekWorkouts.length}/${user.daysPerWeek}`}
                sublabel="周目标"
                size={116}
              />
              <p>
                {weekWorkouts.length >= user.daysPerWeek
                  ? '本周目标已达成，剩下的时间留给恢复。'
                  : `再完成 ${user.daysPerWeek - weekWorkouts.length} 次，本周目标就满了。`}
              </p>
            </div>
          </div>
        </article>

        <div className="side-stack">
          <article className="panel achievements-panel">
            <div className="panel-head">
              <div>
                <h2>最近成就</h2>
                <p>小小的里程碑</p>
              </div>
              <Link to="/pet" className="text-link">
                全部
                <ChevronRight size={16} />
              </Link>
            </div>
            {recentAchievements.length > 0 ? (
              <ul className="achievement-mini-list">
                {recentAchievements.map((achievement) => (
                  <li key={achievement.id}>
                    <span className="achievement-mini-icon">
                      <AchievementIcon name={achievement.icon} size={18} />
                    </span>
                    <div>
                      <strong>{achievement.title}</strong>
                      <small>{achievement.unlockedAt ? formatShort(achievement.unlockedAt.slice(0, 10)) : ''}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-copy">
                <Sparkles size={16} /> 完成第一练，就会点亮第一枚徽章。
              </p>
            )}
          </article>

          <article className="panel recent-panel">
            <div className="panel-head">
              <div>
                <h2>最近训练</h2>
                <p>你留下的脚印</p>
              </div>
              <PawPrint size={20} className="panel-head-icon" />
            </div>
            {personal.workouts.length > 0 ? (
              <ul className="recent-workout-list">
                {personal.workouts.slice(0, 3).map((workout) => (
                  <li key={workout.id}>
                    <Link to={`/summary/${workout.id}`}>
                      <span className="recent-date">{formatShort(workout.date)}</span>
                      <span className="recent-copy">
                        <strong>{workout.title}</strong>
                        <small>
                          {workout.durationMin} 分钟
                          {workout.source === 'import'
                            ? ' · 手环导入'
                            : ` · ${Math.round(workout.volume).toLocaleString()} kg`}
                        </small>
                      </span>
                      <span className="recent-xp">+{workout.xp} XP</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-copy">
                <Dumbbell size={16} /> 还没有训练记录，开始第一练吧。
              </p>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}

function moodLine(mood: string): string {
  if (mood === 'energized') return '练完这一组，我尾巴都在发光。';
  if (mood === 'sleepy') return '今天也可以慢一点，我陪着你。';
  if (mood === 'hungry') return '我有点饿了，练完记得补给。';
  return '做完今天的训练，我就长大一点。';
}
