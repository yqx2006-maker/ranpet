import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Dumbbell,
  Flame,
  Home,
  Sparkles,
  Sprout,
  Trophy,
  Zap,
} from 'lucide-react';
import { PetMascot } from '../components/PetMascot';
import { useAppStore } from '../store/useAppStore';
import {
  EQUIP_LABEL,
  GOAL_HINT,
  GOAL_LABEL,
  LEVEL_LABEL,
  type Equipment,
  type Goal,
  type Level,
} from '../types';

const STEPS = ['目标', '经验', '条件', '节奏', '确认'];

const GOALS: { value: Goal; icon: typeof Flame; title: string; hint: string }[] = [
  { value: 'lose', icon: Flame, title: GOAL_LABEL.lose, hint: GOAL_HINT.lose },
  { value: 'build', icon: Dumbbell, title: GOAL_LABEL.build, hint: GOAL_HINT.build },
  { value: 'keep', icon: Zap, title: GOAL_LABEL.keep, hint: GOAL_HINT.keep },
];

const LEVELS: { value: Level; icon: typeof Sprout; title: string; hint: string }[] = [
  { value: 'beginner', icon: Sprout, title: LEVEL_LABEL.beginner, hint: '优先建立动作习惯和基础力量' },
  { value: 'intermediate', icon: Zap, title: LEVEL_LABEL.intermediate, hint: '可以完成完整训练，想更进一步' },
  { value: 'advanced', icon: Trophy, title: LEVEL_LABEL.advanced, hint: '规律训练半年以上，追求训练质量' },
];

const EQUIPMENT: { value: Equipment; icon: typeof Home; title: string; hint: string }[] = [
  { value: 'none', icon: Home, title: EQUIP_LABEL.none, hint: '瑜伽垫、椅子、自身体重就够了' },
  { value: 'dumbbell', icon: Dumbbell, title: EQUIP_LABEL.dumbbell, hint: '一对哑铃或弹力带，居家进阶' },
  { value: 'gym', icon: Building2, title: EQUIP_LABEL.gym, hint: '杠铃、器械和绳索都能用' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal>('build');
  const [level, setLevel] = useState<Level>('beginner');
  const [equipment, setEquipment] = useState<Equipment>('none');
  const [days, setDays] = useState(3);
  const [minutes, setMinutes] = useState(30);
  const [name, setName] = useState(user?.name ?? '');

  if (!user) return null;

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    if (!name.trim()) return;
    completeOnboarding({
      name: name.trim(),
      goal,
      level,
      equipment,
      daysPerWeek: days,
      sessionMinutes: minutes,
    });
    navigate('/');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-intro">
        <div className="auth-brand">
          <span className="brand-mark">
            <Flame size={22} />
          </span>
          <span className="brand-copy">
            <strong>燃宠</strong>
            <small>BURN &amp; GROW</small>
          </span>
        </div>
        <h1>
          先认识你，
          <br />
          再<span className="marker">一起变强</span>。
        </h1>
        <p>
          回答四个小问题，我们会生成一份适合你的周计划。
          你的伙伴「噗噗」也会从一颗火种蛋开始，跟着你一起长大。
        </p>
        <div className="onboarding-pet">
          <PetMascot xp={0} mood="happy" accessories={['bandana']} size={210} />
          <div className="pet-bubble small">
            <span>我还没孵化，</span>
            <strong>先等你点亮我。</strong>
          </div>
        </div>
      </div>

      <div className="onboarding-card">
        <div className="step-head">
          <div>
            <span className="eyebrow">
              第 {step + 1} / {STEPS.length} 步
            </span>
            <h2>{STEPS[step]}</h2>
          </div>
          <div className="step-dots" aria-hidden="true">
            {STEPS.map((item, index) => (
              <i key={item} className={index <= step ? 'active' : ''} />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <div className="option-list">
            {GOALS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`option-card${goal === item.value ? ' active' : ''}`}
                  onClick={() => setGoal(item.value)}
                >
                  <span className="option-icon">
                    <Icon size={22} />
                  </span>
                  <span className="option-copy">
                    <strong>{item.title}</strong>
                    <small>{item.hint}</small>
                  </span>
                  <span className="option-dot" />
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="option-list">
            {LEVELS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`option-card${level === item.value ? ' active' : ''}`}
                  onClick={() => setLevel(item.value)}
                >
                  <span className="option-icon">
                    <Icon size={22} />
                  </span>
                  <span className="option-copy">
                    <strong>{item.title}</strong>
                    <small>{item.hint}</small>
                  </span>
                  <span className="option-dot" />
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="option-list">
            {EQUIPMENT.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`option-card${equipment === item.value ? ' active' : ''}`}
                  onClick={() => setEquipment(item.value)}
                >
                  <span className="option-icon">
                    <Icon size={22} />
                  </span>
                  <span className="option-copy">
                    <strong>{item.title}</strong>
                    <small>{item.hint}</small>
                  </span>
                  <span className="option-dot" />
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="schedule-step">
            <div className="schedule-block">
              <div className="schedule-head">
                <strong>每周训练几天</strong>
                <span>{days} 天</span>
              </div>
              <div className="segmented">
                {[2, 3, 4, 5, 6].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={days === value ? 'active' : ''}
                    onClick={() => setDays(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="hint-text">规律比强度更重要，先选一个能坚持的频率。</p>
            </div>
            <div className="schedule-block">
              <div className="schedule-head">
                <strong>每次训练多久</strong>
                <span>{minutes} 分钟</span>
              </div>
              <div className="segmented">
                {[20, 30, 45, 60].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={minutes === value ? 'active' : ''}
                    onClick={() => setMinutes(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="hint-text">计划会按你的时长裁剪动作数量。</p>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="confirm-step">
            <label className="field">
              <span>怎么称呼你？</span>
              <div className="field-input">
                <Sparkles size={18} />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="输入昵称"
                />
              </div>
            </label>
            <div className="summary-card">
              <div className="summary-row">
                <span>目标</span>
                <strong>{GOAL_LABEL[goal]}</strong>
              </div>
              <div className="summary-row">
                <span>经验</span>
                <strong>{LEVEL_LABEL[level]}</strong>
              </div>
              <div className="summary-row">
                <span>条件</span>
                <strong>{EQUIP_LABEL[equipment]}</strong>
              </div>
              <div className="summary-row">
                <span>节奏</span>
                <strong>
                  每周 {days} 练 · 每次 {minutes} 分钟
                </strong>
              </div>
            </div>
            <div className="confirm-pet">
              <PetMascot xp={0} mood="happy" accessories={['bandana']} size={110} />
              <p>
                计划会从本周开始。完成训练、保持连续打卡，噗噗就会从蛋里孵出来。
              </p>
            </div>
          </div>
        ) : null}

        <div className="step-actions">
          <button
            type="button"
            className="button ghost"
            onClick={() => (step === 0 ? logout() : setStep(step - 1))}
          >
            <ArrowLeft size={17} />
            {step === 0 ? '退出登录' : '上一步'}
          </button>
          <button
            type="button"
            className="button primary"
            onClick={next}
            disabled={step === 4 && !name.trim()}
          >
            {step === STEPS.length - 1 ? '生成我的计划' : '继续'}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
