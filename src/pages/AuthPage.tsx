import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Lock, Mail, User } from 'lucide-react';
import { PetMascot } from '../components/PetMascot';
import { useAppStore } from '../store/useAppStore';

type Mode = 'login' | 'register';

export function AuthPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const loginDemo = useAppStore((state) => state.loginDemo);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (mode === 'login') {
      const result = login(email, password);
      if (!result.ok) {
        setError(result.error ?? '登录失败');
        return;
      }
    } else {
      const result = register(name, email, password);
      if (!result.ok) {
        setError(result.error ?? '注册失败');
        return;
      }
    }
    navigate('/');
  };

  const handleDemo = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-brand">
          <span className="brand-mark">
            <Flame size={22} />
          </span>
          <span className="brand-copy">
            <strong>燃宠</strong>
            <small>BURN &amp; GROW</small>
          </span>
        </div>

        <div className="auth-headline">
          <p className="eyebrow">训练打卡 × 宠物养成</p>
          <h1>
            练出好身体，
            <br />
            养大你的<span className="marker">小火苗</span>。
          </h1>
          <p className="auth-sub">
            训练会变成它的成长值。你坚持的每一次，它都看得见。
          </p>
        </div>

        <div className="auth-pet-stage">
          <div className="auth-sticker sticker-a">连续 6 天</div>
          <div className="auth-sticker sticker-b">+180 XP</div>
          <div className="auth-sticker sticker-c">6 练 / 周</div>
          <div className="pet-bubble">
            <span>今天练完，</span>
            <strong>尾巴给你摇断。</strong>
          </div>
          <PetMascot
            xp={860}
            mood="energized"
            accessories={['bandana', 'medal']}
            size={300}
            className="auth-pet"
          />
        </div>

        <div className="auth-features">
          <span>分级训练计划</span>
          <span>训练数据追踪</span>
          <span>宠物进化与成就</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              登录
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              注册
            </button>
          </div>

          <div className="auth-card-head">
            <h2>{mode === 'login' ? '欢迎回来' : '创建你的训练档案'}</h2>
            <p>
              {mode === 'login'
                ? '继续今天的训练，别让伙伴等太久。'
                : '先设置目标和节奏，计划会自动生成。'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <label className="field">
                <span>昵称</span>
                <div className="field-input">
                  <User size={18} />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="怎么称呼你？"
                    autoComplete="nickname"
                  />
                </div>
              </label>
            ) : null}

            <label className="field">
              <span>邮箱</span>
              <div className="field-input">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>密码</span>
              <div className="field-input">
                <Lock size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === 'register' ? '至少 6 位' : '输入密码'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </div>
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="button primary auth-submit" type="submit">
              {mode === 'login' ? '进入燃宠' : '创建账号'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>或</span>
          </div>

          <button className="button ghost auth-demo" type="button" onClick={handleDemo}>
            <Flame size={18} />
            先用演示账号逛一圈
          </button>

          <p className="auth-note">
            演示版账号与数据保存在本地浏览器，不会上传。演示账号：demo@ranpet.app / demo1234
          </p>
        </div>
      </div>
    </div>
  );
}
