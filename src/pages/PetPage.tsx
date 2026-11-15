import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Crown,
  Dumbbell,
  Flame,
  Hand,
  Heart,
  Images,
  Lock,
  Medal,
  PawPrint,
  Ribbon,
  Sparkles,
  Trophy,
  Utensils,
  WandSparkles,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AchievementIcon } from '../components/AchievementIcon';
import { PetAvatar } from '../components/PetAvatar';
import { PetBuilderModal } from '../components/PetBuilderModal';
import { PetGalleryModal } from '../components/PetGalleryModal';
import { useAppStore } from '../store/useAppStore';
import { formatShort, todayISO } from '../utils/date';
import { DEFAULT_PET_BUILDER } from '../utils/petBuilder';
import {
  ACCESSORIES,
  PET_STAGES,
  getNextStage,
  getPetMood,
  getPetStage,
  getStageProgress,
  getUnlockedAccessories,
} from '../utils/pet';
import { getStreak } from '../utils/stats';

const ACCESSORY_ICONS: Record<string, LucideIcon> = {
  bandana: Ribbon,
  medal: Medal,
  'dumbbell-charm': Dumbbell,
  cape: Wind,
  crown: Crown,
};

export function PetPage() {
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const carePet = useAppStore((state) => state.carePet);
  const feedPet = useAppStore((state) => state.feedPet);
  const toggleAccessory = useAppStore((state) => state.toggleAccessory);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [reaction, setReaction] = useState<'care' | 'feed' | null>(null);
  const reactionTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
    },
    [],
  );

  const react = (type: 'care' | 'feed') => {
    if (reactionTimer.current) window.clearTimeout(reactionTimer.current);
    setReaction(type);
    reactionTimer.current = window.setTimeout(() => setReaction(null), 1000);
  };

  const handleCare = () => {
    carePet();
    react('care');
  };

  const handleFeed = () => {
    feedPet();
    react('feed');
  };

  if (!personal) return null;

  const today = todayISO();
  const trainedToday = personal.workouts.some((item) => item.date === today);
  const stage = getPetStage(personal.pet.xp);
  const nextStage = getNextStage(personal.pet.xp);
  const stageProgress = getStageProgress(personal.pet.xp);
  const mood = getPetMood(personal.pet, trainedToday);
  const streak = getStreak(personal.workouts);
  const unlockedAchievements = personal.achievements.filter((item) => item.unlockedAt);
  const unlockedAccessories = getUnlockedAccessories(stage.stage, personal.achievements);
  const unlockedAccessoryIds = new Set(unlockedAccessories.map((item) => item.id));
  const caredToday = personal.pet.lastCareDate === today;
  const fedToday = personal.pet.lastFedDate === today;
  const energyFull = personal.pet.energy >= 95;
  const recentWorkouts = personal.workouts.slice(0, 4);

  return (
    <div className="pet-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">伙伴</p>
          <h1>你练得越认真，它长得越快</h1>
          <p className="page-sub">
            噗噗不是装饰。成长值来自训练，亲密和活力来自日常照顾。
          </p>
        </div>
        <div className="page-head-badge">
          <PawPrint size={18} />
          <span>{unlockedAchievements.length} 枚徽章</span>
        </div>
      </header>

      <section className="pet-hero-grid">
        <article className="pet-room">
          <div className="pet-room-bg" aria-hidden="true">
            <i className="ring ring-1" />
            <i className="ring ring-2" />
            <i className="ring ring-3" />
            <span className="pet-spark s1">✦</span>
            <span className="pet-spark s2">✦</span>
            <span className="pet-spark s3">✦</span>
          </div>
          <div className="pet-room-stickers">
            <span className="auth-sticker sticker-a">连续 {streak} 天</span>
            <span className="auth-sticker sticker-b">{personal.pet.xp} XP</span>
          </div>
          <div className="pet-bubble">
            <span>{moodLine(mood)}</span>
            <strong>{personal.pet.name} 在这里。</strong>
          </div>
          <div className={`pet-room-mascot${reaction ? ` is-${reaction}` : ''}`}>
            <PetAvatar pet={personal.pet} mood={mood} size={340} />
            {reaction ? (
              <span className="pet-reaction-burst" aria-hidden="true">
                {reaction === 'care' ? <Heart size={28} /> : <Sparkles size={30} />}
                {reaction === 'care' ? <Heart size={18} /> : <Sparkles size={20} />}
              </span>
            ) : null}
          </div>
          <p className="pet-rotation-tip">拖动伙伴旋转 · 双击回正</p>
          <div className="pet-room-name">
            <h2>{personal.pet.name}</h2>
            <span className="stage-pill">{stage.name}</span>
            {personal.pet.customImageMode === 'builder' && personal.pet.customBuilder ? (
              <span className="tag">自建伙伴</span>
            ) : null}
          </div>
          <p className="pet-room-tagline">{stage.tagline}</p>
          <div className="pet-room-actions">
            <button
              className="button primary pet-customize-button"
              type="button"
              onClick={() => setBuilderOpen(true)}
            >
              <WandSparkles size={16} />
              {personal.pet.customImageMode === 'builder' ? '编辑自建伙伴' : '伙伴工坊'}
            </button>
            <button
              className="button ghost pet-customize-button"
              type="button"
              onClick={() => setGalleryOpen(true)}
            >
              <Images size={16} />
              形态图鉴
            </button>
          </div>
        </article>

        <article className="panel pet-status">
          <div className="pet-status-head">
            <div>
              <span className="eyebrow">成长进度</span>
              <h2>
                {stage.name}
                {nextStage ? ` → ${nextStage.name}` : ' · 已满级'}
              </h2>
            </div>
            <span className="pet-level">{personal.pet.xp} XP</span>
          </div>
          <div className="pet-xp-track">
            <i style={{ width: `${stageProgress.percent}%` }} />
          </div>
          <p className="pet-xp-note">
            {nextStage
              ? `距离下一阶段还差 ${stageProgress.toNext} XP，大约 ${Math.max(
                  1,
                  Math.ceil(stageProgress.toNext / 100),
                )} 次训练。`
              : '已经达到最高阶段，继续训练保持状态吧。'}
          </p>

          <div className="pet-meter-list">
            <div className="pet-meter">
              <div className="pet-meter-head">
                <span>
                  <Zap size={16} /> 活力
                </span>
                <strong>{personal.pet.energy}/100</strong>
              </div>
              <div className="mini-track mint">
                <i style={{ width: `${personal.pet.energy}%` }} />
              </div>
            </div>
            <div className="pet-meter">
              <div className="pet-meter-head">
                <span>
                  <Heart size={16} /> 亲密
                </span>
                <strong>{personal.pet.bond}/100</strong>
              </div>
              <div className="mini-track coral">
                <i style={{ width: `${personal.pet.bond}%` }} />
              </div>
            </div>
          </div>

          <div className="pet-care">
            <button
              className="care-button"
              type="button"
              onClick={handleCare}
              disabled={caredToday}
            >
              <span className="care-icon">
                <Hand size={20} />
              </span>
              <span>
                <strong>{caredToday ? '今天摸过了' : '摸摸头'}</strong>
                <small>{caredToday ? '明天再来' : '亲密 +5 · 活力 +3'}</small>
              </span>
              {caredToday ? <Check size={17} /> : null}
            </button>
            <button
              className="care-button"
              type="button"
              onClick={handleFeed}
              disabled={fedToday || energyFull}
            >
              <span className="care-icon">
                <Utensils size={20} />
              </span>
              <span>
                <strong>{fedToday ? '今天补给过了' : energyFull ? '活力很足' : '能量补给'}</strong>
                <small>
                  {fedToday ? '明天再来' : energyFull ? '无需补给' : '活力 +20 · 亲密 +2'}
                </small>
              </span>
              {fedToday || energyFull ? <Check size={17} /> : null}
            </button>
          </div>

          <div className="pet-tip">
            <Flame size={18} />
            <p>
              {trainedToday
                ? '今天已经训练过，伙伴的状态很好。'
                : '完成一次训练，活力会恢复，成长值也会涨得更快。'}
            </p>
          </div>
        </article>
      </section>

      <section className="panel evo-panel">
        <div className="panel-head">
          <div>
            <h2>进化路线</h2>
            <p>
              每一次训练，都会把它往下一阶段推一点
              {personal.pet.evolutions?.length
                ? ` · 已记录 ${personal.pet.evolutions.length} 次进化`
                : ''}
            </p>
          </div>
          <Sparkles size={20} className="panel-head-icon" />
        </div>
        <div className="evo-path">
          {PET_STAGES.map((item, index) => {
            const state =
              item.stage < stage.stage ? 'done' : item.stage === stage.stage ? 'current' : 'locked';
            return (
              <div key={item.stage} className={`evo-step ${state}`}>
                <div className="evo-dot">
                  {state === 'done' ? (
                    <Check size={18} />
                  ) : state === 'current' ? (
                    <PawPrint size={18} />
                  ) : (
                    <Lock size={16} />
                  )}
                </div>
                <div className="evo-copy">
                  <strong>{item.name}</strong>
                  <span>{item.minXp} XP</span>
                  <small>{item.tagline}</small>
                </div>
                {index < PET_STAGES.length - 1 ? <i className="evo-line" /> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="pet-lower">
        <article className="panel accessory-panel">
          <div className="panel-head">
            <div>
              <h2>装扮柜</h2>
              <p>最多同时佩戴 2 件</p>
            </div>
            <Ribbon size={20} className="panel-head-icon" />
          </div>
          <div className="accessory-grid">
            {ACCESSORIES.map((accessory) => {
              const Icon = ACCESSORY_ICONS[accessory.id] ?? Sparkles;
              const unlocked = unlockedAccessoryIds.has(accessory.id);
              const equipped = personal.pet.equipped.includes(accessory.id);
              return (
                <button
                  key={accessory.id}
                  type="button"
                  className={`accessory-card${equipped ? ' equipped' : ''}${unlocked ? '' : ' locked'}`}
                  onClick={() => toggleAccessory(accessory.id)}
                  disabled={!unlocked}
                >
                  <span className="accessory-icon">
                    {unlocked ? <Icon size={22} /> : <Lock size={20} />}
                  </span>
                  <span className="accessory-copy">
                    <strong>{accessory.name}</strong>
                    <small>{unlocked ? accessory.hint : '还没解锁'}</small>
                  </span>
                  {equipped ? (
                    <span className="accessory-state">
                      <Check size={14} />
                      佩戴中
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </article>

        <article className="panel growth-log-panel">
          <div className="panel-head">
            <div>
              <h2>成长记录</h2>
              <p>训练带来的 XP</p>
            </div>
            <Trophy size={20} className="panel-head-icon" />
          </div>
          {recentWorkouts.length > 0 ? (
            <ul className="growth-log">
              {recentWorkouts.map((workout) => (
                <li key={workout.id}>
                  <span className="growth-dot" />
                  <div>
                    <strong>{workout.title}</strong>
                    <small>
                      {formatShort(workout.date)} · {workout.durationMin} 分钟
                    </small>
                  </div>
                  <span className="growth-xp">+{workout.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-copy">完成第一次训练，成长记录就会从这里开始。</p>
          )}
        </article>
      </section>

      <section className="panel achievement-gallery-panel">
        <div className="panel-head">
          <div>
            <h2>成就收藏</h2>
            <p>
              已解锁 {unlockedAchievements.length} / {personal.achievements.length}
            </p>
          </div>
          <Trophy size={20} className="panel-head-icon" />
        </div>
        <div className="achievement-gallery">
          {personal.achievements.map((achievement) => (
            <article
              key={achievement.id}
              className={`achievement-card${achievement.unlockedAt ? ' unlocked' : ''}`}
            >
              <span className="achievement-badge">
                {achievement.unlockedAt ? (
                  <AchievementIcon name={achievement.icon} size={22} />
                ) : (
                  <Lock size={20} />
                )}
              </span>
              <div>
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
                <small>
                  {achievement.unlockedAt
                    ? `解锁于 ${formatShort(achievement.unlockedAt.slice(0, 10))}`
                    : '继续训练解锁'}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>

      {builderOpen ? (
        <PetBuilderModal
          pet={personal.pet}
          open
          onClose={() => setBuilderOpen(false)}
        />
      ) : null}
      {galleryOpen ? (
        <PetGalleryModal
          open
          onClose={() => setGalleryOpen(false)}
          current={personal.pet.customBuilder ?? DEFAULT_PET_BUILDER}
          currentStage={stage.stage}
        />
      ) : null}
    </div>
  );
}

function moodLine(mood: string): string {
  if (mood === 'energized') return '刚刚练完，我现在浑身是劲。';
  if (mood === 'sleepy') return '今天想打个盹，但我会一直陪着你。';
  if (mood === 'hungry') return '肚子有点空，训练完记得补给。';
  return '你来的正好，我今天也在等训练。';
}
