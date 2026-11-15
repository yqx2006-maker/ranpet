import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Dumbbell,
  Flame,
  Home,
  PawPrint,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getPetStage } from '../utils/pet';
import { getStreak, getWeekWorkouts } from '../utils/stats';
import { Toast } from './Toast';

const NAV_ITEMS = [
  { to: '/', label: '今日', icon: Home },
  { to: '/training', label: '训练', icon: Dumbbell },
  { to: '/progress', label: '进度', icon: TrendingUp },
  { to: '/community', label: '社区', icon: Users },
  { to: '/pet', label: '伙伴', icon: PawPrint },
];

export function AppLayout() {
  const location = useLocation();
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (!user || !personal) return null;

  const streak = getStreak(personal.workouts);
  const weekDone = getWeekWorkouts(personal.workouts).length;
  const stage = getPetStage(personal.pet.xp);
  const weeklyPercent = Math.min(100, Math.round((weekDone / Math.max(1, user.daysPerWeek)) * 100));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Flame size={22} />
          </span>
          <span className="brand-copy">
            <strong>燃宠</strong>
            <small>BURN &amp; GROW</small>
          </span>
        </Link>

        <nav className="side-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-goal">
          <div className="sidebar-goal-head">
            <span>本周目标</span>
            <strong>
              {weekDone}/{user.daysPerWeek}
            </strong>
          </div>
          <div className="mini-track">
            <i style={{ width: `${weeklyPercent}%` }} />
          </div>
          <p>再练 {Math.max(0, user.daysPerWeek - weekDone)} 次就达标</p>
        </div>

        <Link to="/profile" className="profile-chip">
          <span className="avatar">{user.name.slice(0, 1)}</span>
          <span className="profile-chip-copy">
            <strong>{user.name}</strong>
            <small>{stage.name}</small>
          </span>
          <Settings size={17} />
        </Link>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <Link to="/" className="topbar-brand">
            <span className="brand-mark small">
              <Flame size={18} />
            </span>
            <strong>燃宠</strong>
          </Link>
          <div className="topbar-actions">
            <span className="chip chip-streak" title="连续训练天数">
              <Flame size={15} />
              {streak} 天
            </span>
            <span className="chip chip-pet" title="伙伴成长值">
              <PawPrint size={15} />
              {stage.name}
            </span>
            <Link to="/profile" className="avatar small" aria-label="个人资料">
              {user.name.slice(0, 1)}
            </Link>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="移动端导航">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `bottom-item${isActive ? ' active' : ''}`}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
}
