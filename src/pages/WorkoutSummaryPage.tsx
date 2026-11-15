import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  Home,
  PawPrint,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
  Watch,
  X,
} from 'lucide-react';
import { AchievementIcon } from '../components/AchievementIcon';
import { Modal } from '../components/Modal';
import { PetAvatar } from '../components/PetAvatar';
import { EXERCISE_MAP } from '../data/exercises';
import { useAppStore } from '../store/useAppStore';
import { formatDateCN, formatShort, todayISO } from '../utils/date';
import { getNextStage, getPetStage, getStageProgress } from '../utils/pet';

const CONFETTI = [
  { left: '8%', delay: '0s', rotate: '12deg', color: 'var(--coral)' },
  { left: '16%', delay: '0.6s', rotate: '-18deg', color: 'var(--yellow)' },
  { left: '26%', delay: '0.2s', rotate: '24deg', color: 'var(--mint)' },
  { left: '38%', delay: '1s', rotate: '-8deg', color: 'var(--coral)' },
  { left: '52%', delay: '0.4s', rotate: '18deg', color: 'var(--yellow)' },
  { left: '64%', delay: '0.8s', rotate: '-24deg', color: 'var(--mint)' },
  { left: '74%', delay: '0.1s', rotate: '8deg', color: 'var(--coral)' },
  { left: '86%', delay: '0.7s', rotate: '-12deg', color: 'var(--yellow)' },
];

export function WorkoutSummaryPage() {
  const { logId } = useParams();
  const navigate = useNavigate();
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const addPost = useAppStore((state) => state.addPost);
  const [shareOpen, setShareOpen] = useState(false);

  const log = personal?.workouts.find((item) => item.id === logId);
  const [shareText, setShareText] = useState('');

  if (!personal || !log) {
    return (
      <div className="session-empty">
        <Dumbbell size={40} />
        <h1>没有找到这次训练</h1>
        <p>它可能已经被新的数据覆盖，回首页看看。</p>
        <Link to="/" className="button primary">
          回到今日
        </Link>
      </div>
    );
  }

  const stage = getPetStage(personal.pet.xp);
  const nextStage = getNextStage(personal.pet.xp);
  const stageProgress = getStageProgress(personal.pet.xp);
  const today = todayISO();
  const justUnlocked = personal.achievements.filter(
    (item) => item.unlockedAt && item.unlockedAt.slice(0, 10) === today,
  );
  const totalSets = log.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const isImported = log.source === 'import';

  const openShare = () => {
    const detail = isImported
      ? `${log.durationMin} 分钟${log.distanceKm ? `，${log.distanceKm} km` : ''}${
          log.calories ? `，${log.calories} 千卡` : ''
        }`
      : `${log.durationMin} 分钟，${Math.round(log.volume).toLocaleString()} kg 容量`;
    setShareText(
      `${log.title}完成。${detail}。${log.note ? ` ${log.note}` : ''} 今天也没有放鸽子。`,
    );
    setShareOpen(true);
  };

  const publish = () => {
    addPost(shareText, {
      title: log.title,
      durationMin: log.durationMin,
      volume: log.volume,
    });
    setShareOpen(false);
    navigate('/community');
  };

  return (
    <div className="summary-page">
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((item, index) => (
          <i
            key={index}
            style={{
              left: item.left,
              animationDelay: item.delay,
              transform: `rotate(${item.rotate})`,
              background: item.color,
            }}
          />
        ))}
      </div>

      <header className="summary-top">
        <Link to="/" className="summary-brand">
          <span className="brand-mark small">
            <Flame size={18} />
          </span>
          <strong>燃宠</strong>
        </Link>
        <span className="summary-label">{isImported ? '导入记录' : '训练总结'}</span>
        <Link to="/" className="icon-button" aria-label="关闭">
          <X size={20} />
        </Link>
      </header>

      <main className="summary-main">
        <section className="summary-hero">
          <div className="summary-copy">
            <p className="eyebrow">
              <Sparkles size={15} /> {formatDateCN(log.date)}
            </p>
            <h1>
              今天这一练，
              <br />
              算数。
            </h1>
            <p className="summary-sub">
              {isImported
                ? `${log.title}已经从手环同步到你的训练记录。伙伴收下了这次成长，记得补水和拉伸。`
                : `${log.title}已经写入你的训练记录。伙伴收下了这次成长，记得补水和拉伸。`}
            </p>
            <div className="summary-actions">
              <button className="button primary" type="button" onClick={openShare}>
                <Share2 size={17} />
                分享到社区
              </button>
              <Link to="/progress" className="button ghost">
                <TrendingUp size={17} />
                查看进度
              </Link>
            </div>
          </div>
          <div className="summary-pet">
            <div className="pet-bubble">
              <span>这一练，</span>
              <strong>我收下了。</strong>
            </div>
            <PetAvatar pet={personal.pet} mood="happy" size={250} />
            <div className="summary-xp">
              <Flame size={16} /> +{log.xp} XP 已入账
            </div>
          </div>
        </section>

        <section className="summary-stat-grid">
          <article>
            <span className="stat-icon coral">
              <Clock size={19} />
            </span>
            <strong>{log.durationMin}</strong>
            <span>训练分钟</span>
          </article>
          {isImported ? (
            <>
              <article>
                <span className="stat-icon yellow">
                  <Flame size={19} />
                </span>
                <strong>{log.calories ?? '--'}</strong>
                <span>消耗卡路里</span>
              </article>
              <article>
                <span className="stat-icon mint">
                  <Footprints size={19} />
                </span>
                <strong>{log.distanceKm ?? log.steps ?? '--'}</strong>
                <span>{log.distanceKm ? '距离 km' : '步数'}</span>
              </article>
            </>
          ) : (
            <>
              <article>
                <span className="stat-icon yellow">
                  <Dumbbell size={19} />
                </span>
                <strong>{Math.round(log.volume).toLocaleString()}</strong>
                <span>训练容量 kg</span>
              </article>
              <article>
                <span className="stat-icon mint">
                  <Check size={19} />
                </span>
                <strong>{totalSets}</strong>
                <span>完成组数</span>
              </article>
            </>
          )}
          <article>
            <span className="stat-icon lilac">
              <Flame size={19} />
            </span>
            <strong>+{log.xp}</strong>
            <span>伙伴经验</span>
          </article>
        </section>

        <section className="summary-grid">
          <article className="panel summary-growth">
            <div className="panel-head">
              <div>
                <h2>伙伴成长</h2>
                <p>
                  {stage.name}
                  {nextStage ? ` → ${nextStage.name}` : ' · 已满级'}
                </p>
              </div>
              <Link to="/pet" className="text-link">
                看看伙伴
                <ArrowRight size={15} />
              </Link>
            </div>
            <div className="growth-pet-row">
              <PetAvatar pet={personal.pet} mood="happy" size={130} />
              <div className="growth-copy">
                <div className="growth-values">
                  <strong>{personal.pet.xp} XP</strong>
                  <span>
                    {nextStage ? `距离 ${nextStage.name} 还差 ${stageProgress.toNext} XP` : '已经满级'}
                  </span>
                </div>
                <div className="mini-track">
                  <i style={{ width: `${stageProgress.percent}%` }} />
                </div>
                <div className="growth-meta">
                  <span>活力 {personal.pet.energy}</span>
                  <span>亲密 {personal.pet.bond}</span>
                </div>
              </div>
            </div>
          </article>

          <article className="panel summary-exercises">
            <div className="panel-head">
              <div>
                <h2>{isImported ? '导入详情' : '本次动作'}</h2>
                <p>{isImported ? '来自手环或外部应用' : `${log.exercises.length} 个动作`}</p>
              </div>
              {isImported ? (
                <Watch size={20} className="panel-head-icon" />
              ) : (
                <PawPrint size={20} className="panel-head-icon" />
              )}
            </div>
            {isImported ? (
              <ul>
                <li>
                  <span className="summary-exercise-name">数据来源</span>
                  <span>手环导入</span>
                </li>
                <li>
                  <span className="summary-exercise-name">运动类型</span>
                  <span>{log.externalType ?? '训练'}</span>
                </li>
                <li>
                  <span className="summary-exercise-name">训练时长</span>
                  <span>{log.durationMin} 分钟</span>
                </li>
                {log.distanceKm ? (
                  <li>
                    <span className="summary-exercise-name">距离</span>
                    <span>{log.distanceKm} km</span>
                  </li>
                ) : null}
                {log.calories ? (
                  <li>
                    <span className="summary-exercise-name">消耗</span>
                    <span>{log.calories} 千卡</span>
                  </li>
                ) : null}
                {log.steps ? (
                  <li>
                    <span className="summary-exercise-name">步数</span>
                    <span>{log.steps.toLocaleString()}</span>
                  </li>
                ) : null}
                {log.avgHeartRate ? (
                  <li>
                    <span className="summary-exercise-name">平均心率</span>
                    <span>{log.avgHeartRate} bpm</span>
                  </li>
                ) : null}
              </ul>
            ) : (
              <ul>
                {log.exercises.map((item) => {
                  const exercise = EXERCISE_MAP[item.exerciseId];
                  const bestSet = item.sets.reduce(
                    (best, set) => (set.weight > best.weight ? set : best),
                    item.sets[0],
                  );
                  return (
                    <li key={item.exerciseId}>
                      <span className="summary-exercise-name">
                        {exercise?.name ?? item.exerciseId}
                      </span>
                      <span>
                        {item.sets.length} 组
                        {bestSet && bestSet.weight > 0 ? ` · 最重 ${bestSet.weight}kg` : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {log.note ? <p className="summary-note">“{log.note}”</p> : null}
          </article>
        </section>

        {justUnlocked.length > 0 ? (
          <section className="panel summary-achievements">
            <div className="panel-head">
              <div>
                <h2>刚刚解锁</h2>
                <p>新的徽章已经放进收藏</p>
              </div>
              <Trophy size={20} className="panel-head-icon" />
            </div>
            <div className="summary-achievement-list">
              {justUnlocked.map((achievement) => (
                <div key={achievement.id} className="summary-achievement">
                  <span className="achievement-mini-icon">
                    <AchievementIcon name={achievement.icon} size={20} />
                  </span>
                  <div>
                    <strong>{achievement.title}</strong>
                    <small>{achievement.description}</small>
                  </div>
                  <span className="achievement-date">
                    {achievement.unlockedAt ? formatShort(achievement.unlockedAt.slice(0, 10)) : ''}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="summary-footer-actions">
          <Link to="/" className="button ghost">
            <Home size={17} />
            回到今日
          </Link>
          <Link to="/training" className="button ink">
            看看下次练什么
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>

      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="分享这次训练"
        size="md"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setShareOpen(false)}>
              取消
            </button>
            <button className="button primary" type="button" onClick={publish} disabled={!shareText.trim()}>
              <Share2 size={16} />
              发布到社区
            </button>
          </div>
        }
      >
        <label className="field">
          <span>说点什么</span>
          <textarea
            className="note-input"
            value={shareText}
            onChange={(event) => setShareText(event.target.value)}
            rows={5}
          />
        </label>
        <div className="share-workout-chip">
          <Flame size={16} />
          <span>{log.title}</span>
          <span>{log.durationMin} 分钟</span>
          {isImported ? (
            log.distanceKm ? (
              <span>{log.distanceKm} km</span>
            ) : log.calories ? (
              <span>{log.calories} 千卡</span>
            ) : null
          ) : (
            <span>{Math.round(log.volume).toLocaleString()} kg</span>
          )}
        </div>
      </Modal>
    </div>
  );
}
