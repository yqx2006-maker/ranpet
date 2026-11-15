import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Dumbbell,
  Flame,
  LogOut,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  Trophy,
  Watch,
} from 'lucide-react';
import { DataImportModal } from '../components/DataImportModal';
import { Modal } from '../components/Modal';
import { useAppStore } from '../store/useAppStore';
import {
  EQUIP_LABEL,
  GOAL_LABEL,
  LEVEL_LABEL,
  type Equipment,
  type Goal,
  type Level,
} from '../types';
import { formatMonthDay } from '../utils/date';
import { getStreak, getTotalMinutes } from '../utils/stats';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const updateProfile = useAppStore((state) => state.updateProfile);
  const logout = useAppStore((state) => state.logout);
  const [resetOpen, setResetOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [goal, setGoal] = useState<Goal>(user?.goal ?? 'build');
  const [level, setLevel] = useState<Level>(user?.level ?? 'beginner');
  const [equipment, setEquipment] = useState<Equipment>(user?.equipment ?? 'none');
  const [days, setDays] = useState(user?.daysPerWeek ?? 3);
  const [minutes, setMinutes] = useState(user?.sessionMinutes ?? 30);

  if (!user || !personal) return null;

  const streak = getStreak(personal.workouts);
  const totalMinutes = getTotalMinutes(personal.workouts);
  const unlockedCount = personal.achievements.filter((item) => item.unlockedAt).length;

  const save = () => {
    updateProfile({
      name: name.trim() || user.name,
      goal,
      level,
      equipment,
      daysPerWeek: days,
      sessionMinutes: minutes,
    });
  };

  const resetData = () => {
    window.localStorage.removeItem('ranpet-store-v1');
    window.location.reload();
  };

  return (
    <div className="profile-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">个人资料</p>
          <h1>你的训练档案</h1>
          <p className="page-sub">目标和节奏会变，随时可以在这里调整。</p>
        </div>
        <div className="page-head-badge">
          <Flame size={18} />
          <span>连续 {streak} 天</span>
        </div>
      </header>

      <div className="profile-grid">
        <article className="panel profile-card">
          <div className="profile-hero">
            <span className="avatar huge">{user.name.slice(0, 1)}</span>
            <div>
              <h2>{user.name}</h2>
              <p>
                <Mail size={15} />
                {user.email}
              </p>
              <p>
                <CalendarDays size={15} />
                加入于 {formatMonthDay(user.createdAt.slice(0, 10))}
              </p>
            </div>
          </div>
          <div className="profile-stats">
            <div>
              <strong>{personal.workouts.length}</strong>
              <span>累计训练</span>
            </div>
            <div>
              <strong>{totalMinutes}</strong>
              <span>累计分钟</span>
            </div>
            <div>
              <strong>{unlockedCount}</strong>
              <span>已解锁成就</span>
            </div>
          </div>
          <div className="profile-goal-tags">
            <span className="tag">{GOAL_LABEL[user.goal]}</span>
            <span className="tag">{LEVEL_LABEL[user.level]}</span>
            <span className="tag">{EQUIP_LABEL[user.equipment]}</span>
            <span className="tag">
              每周 {user.daysPerWeek} 练 · {user.sessionMinutes} 分钟
            </span>
          </div>
        </article>

        <article className="panel profile-settings">
          <div className="panel-head">
            <div>
              <h2>训练设置</h2>
              <p>保存后会重新生成本周计划</p>
            </div>
            <Dumbbell size={20} className="panel-head-icon" />
          </div>

          <label className="field">
            <span>昵称</span>
            <input
              className="plain-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div className="settings-block">
            <strong>目标</strong>
            <div className="segmented">
              {(['lose', 'build', 'keep'] as Goal[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={goal === item ? 'active' : ''}
                  onClick={() => setGoal(item)}
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
                  className={level === item ? 'active' : ''}
                  onClick={() => setLevel(item)}
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
                  className={equipment === item ? 'active' : ''}
                  onClick={() => setEquipment(item)}
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
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={days === item ? 'active' : ''}
                    onClick={() => setDays(item)}
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
                    className={minutes === item ? 'active' : ''}
                    onClick={() => setMinutes(item)}
                  >
                    {item} 分
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="button primary" type="button" onClick={save}>
            <Save size={17} />
            保存设置
          </button>
        </article>
      </div>

      <div className="profile-lower">
        <article className="panel account-card">
          <div className="panel-head">
            <div>
              <h2>账号与数据</h2>
              <p>演示版数据仅保存在当前浏览器</p>
            </div>
            <ShieldCheck size={20} className="panel-head-icon" />
          </div>
          <p className="account-copy">
            这是本地原型：账号、训练记录、社区动态和宠物状态都存在 localStorage。换浏览器或清除站点数据后会重新开始。
          </p>
          <div className="account-actions">
            <button className="button ghost" type="button" onClick={() => setImportOpen(true)}>
              <Watch size={17} />
              导入运动数据
            </button>
            <button className="button ghost" type="button" onClick={() => setResetOpen(true)}>
              <RotateCcw size={17} />
              重置演示数据
            </button>
            <button
              className="button danger"
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={17} />
              退出登录
            </button>
          </div>
        </article>

        <article className="panel profile-achievement-summary">
          <div className="panel-head">
            <div>
              <h2>成就进度</h2>
              <p>慢慢来，比较快</p>
            </div>
            <Trophy size={20} className="panel-head-icon" />
          </div>
          <div className="profile-achievement-bar">
            <div className="mini-track">
              <i
                style={{
                  width: `${Math.round(
                    (unlockedCount / Math.max(1, personal.achievements.length)) * 100,
                  )}%`,
                }}
              />
            </div>
            <span>
              {unlockedCount} / {personal.achievements.length}
            </span>
          </div>
          <p className="account-copy">
            每次训练、连续打卡和社区分享，都会推动新的成就解锁。
          </p>
        </article>
      </div>

      <DataImportModal open={importOpen} onClose={() => setImportOpen(false)} />

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="重置演示数据？"
        size="sm"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setResetOpen(false)}>
              取消
            </button>
            <button className="button danger" type="button" onClick={resetData}>
              确认重置
            </button>
          </div>
        }
      >
        <p className="confirm-copy">
          所有账号、训练记录、动态和宠物状态都会被清除，并恢复到初始演示数据。这个操作无法撤销。
        </p>
      </Modal>
    </div>
  );
}
