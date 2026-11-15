import { useState, type FormEvent } from 'react';
import {
  Dumbbell,
  Flame,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { useAppStore } from '../store/useAppStore';
import type { Post } from '../types';
import { relativeTime } from '../utils/date';
import {
  getStreak,
  getWeekWorkouts,
  getWeeklyMinutes,
  getWeeklyXP,
} from '../utils/stats';

const CHALLENGE_ICONS = [Flame, Timer, Dumbbell];

export function CommunityPage() {
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const personal = useAppStore((state) =>
    state.currentUserId ? state.personal[state.currentUserId] : null,
  );
  const posts = useAppStore((state) => state.posts);
  const addPost = useAppStore((state) => state.addPost);
  const [composeOpen, setComposeOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');

  if (!user || !personal) return null;

  const streak = getStreak(personal.workouts);
  const weekWorkouts = getWeekWorkouts(personal.workouts);
  const weekMinutes = getWeeklyMinutes(personal.workouts);
  const challenges = [
    { title: '7 天连续点火', hint: '连续训练 7 天', value: streak, target: 7, unit: '天' },
    { title: '本周 150 分钟', hint: '把训练时间攒起来', value: weekMinutes, target: 150, unit: '分钟' },
    { title: '本周 4 练', hint: '完成 4 次训练', value: weekWorkouts.length, target: 4, unit: '次' },
  ];
  const leaderboard = [
    { name: '小满', xp: 640 },
    { name: '老赵', xp: 720 },
    { name: 'Momo', xp: 510 },
    { name: 'Kiki', xp: 480 },
    { name: '阿哲', xp: 430 },
    { name: user.name, xp: getWeeklyXP(personal.workouts), isMe: true },
  ].sort((a, b) => b.xp - a.xp);

  const openCompose = () => {
    setContent('');
    setSelectedWorkoutId('');
    setComposeOpen(true);
  };

  const publish = () => {
    if (!content.trim()) return;
    const workout = personal.workouts.find((item) => item.id === selectedWorkoutId);
    addPost(
      content,
      workout
        ? {
            title: workout.title,
            durationMin: workout.durationMin,
            volume: workout.volume,
          }
        : undefined,
    );
    setComposeOpen(false);
  };

  return (
    <div className="community-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">社区</p>
          <h1>一起练的人，走得更远</h1>
          <p className="page-sub">
            打卡、提问、互相打气。你的每一次出现，都可能刚好鼓励到别人。
          </p>
        </div>
        <button className="button primary" type="button" onClick={openCompose}>
          <Plus size={17} />
          发布动态
        </button>
      </header>

      <div className="community-layout">
        <main className="community-feed">
          <div className="challenge-strip">
            {challenges.map((challenge, index) => {
              const Icon = CHALLENGE_ICONS[index];
              const percent = Math.min(100, Math.round((challenge.value / challenge.target) * 100));
              const completed = challenge.value >= challenge.target;
              return (
                <article key={challenge.title} className={`challenge-card${completed ? ' completed' : ''}`}>
                  <div className="challenge-head">
                    <span className="challenge-icon">
                      <Icon size={18} />
                    </span>
                    <span className="challenge-state">{completed ? '已完成' : '进行中'}</span>
                  </div>
                  <strong>{challenge.title}</strong>
                  <p>{challenge.hint}</p>
                  <div className="challenge-progress">
                    <div className="mini-track">
                      <i style={{ width: `${percent}%` }} />
                    </div>
                    <span>
                      {Math.min(challenge.value, challenge.target)}/{challenge.target} {challenge.unit}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="feed-head">
            <div>
              <h2>最新动态</h2>
              <p>{posts.length} 条分享</p>
            </div>
            <span className="chip chip-soft">
              <Sparkles size={14} />
              友好交流，不judge
            </span>
          </div>

          <div className="post-list">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </main>

        <aside className="community-side">
          <article className="panel leaderboard-card">
            <div className="panel-head">
              <div>
                <h2>本周能量榜</h2>
                <p>按本周获得 XP 排名</p>
              </div>
              <Trophy size={20} className="panel-head-icon" />
            </div>
            <ol className="leaderboard-list">
              {leaderboard.map((item, index) => (
                <li key={`${item.name}-${index}`} className={item.isMe ? 'me' : ''}>
                  <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                  <span className={`avatar tiny tone-${toneOf(item.name)}`}>
                    {item.name.slice(0, 1)}
                  </span>
                  <span className="leaderboard-name">
                    {item.name}
                    {item.isMe ? <small>你</small> : null}
                  </span>
                  <strong>{item.xp} XP</strong>
                </li>
              ))}
            </ol>
          </article>

          <article className="panel community-note">
            <div className="panel-head">
              <div>
                <h2>社区小提示</h2>
                <p>让这里更好待一点</p>
              </div>
              <Users size={20} className="panel-head-icon" />
            </div>
            <ul>
              <li>分享真实感受，不用假装自律。</li>
              <li>给别人的坚持点个赞，比给建议更有用。</li>
              <li>身体不舒服时，休息也是训练的一部分。</li>
            </ul>
          </article>
        </aside>
      </div>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="发布动态"
        size="md"
        footer={
          <div className="modal-actions">
            <button className="button ghost" type="button" onClick={() => setComposeOpen(false)}>
              取消
            </button>
            <button className="button primary" type="button" onClick={publish} disabled={!content.trim()}>
              <Send size={16} />
              发布
            </button>
          </div>
        }
      >
        <div className="compose-form">
          <label className="field">
            <span>今天想说什么？</span>
            <textarea
              className="note-input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="训练感受、一个问题，或者只是来打个卡。"
            />
          </label>
          <label className="field">
            <span>关联最近训练（可选）</span>
            <select
              className="plain-select"
              value={selectedWorkoutId}
              onChange={(event) => setSelectedWorkoutId(event.target.value)}
            >
              <option value="">不关联训练</option>
              {personal.workouts.slice(0, 5).map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.date} · {workout.title}
                </option>
              ))}
            </select>
          </label>
          <p className="hint-text">发布后会出现在社区动态流里，数据保存在本地浏览器。</p>
        </div>
      </Modal>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const toggleLike = useAppStore((state) => state.toggleLike);
  const addComment = useAppStore((state) => state.addComment);
  const [comment, setComment] = useState('');

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    addComment(post.id, comment);
    setComment('');
  };

  return (
    <article className="post-card">
      <header className="post-head">
        <span className={`avatar tone-${toneOf(post.authorName)}`}>
          {post.authorName.slice(0, 1)}
        </span>
        <div className="post-author">
          <strong>{post.authorName}</strong>
          <span>
            {post.authorTag} · {relativeTime(post.createdAt)}
          </span>
        </div>
      </header>

      <p className="post-content">{post.content}</p>

      {post.workout ? (
        <div className="post-workout">
          <span>
            <Flame size={15} />
            {post.workout.title}
          </span>
          <span>{post.workout.durationMin} 分钟</span>
          {post.workout.volume > 0 ? (
            <span>{Math.round(post.workout.volume).toLocaleString()} kg</span>
          ) : null}
        </div>
      ) : null}

      <div className="post-actions">
        <button
          type="button"
          className={`post-action${post.likedByMe ? ' active' : ''}`}
          onClick={() => toggleLike(post.id)}
        >
          <Heart size={17} fill={post.likedByMe ? 'currentColor' : 'none'} />
          {post.likes}
        </button>
        <span className="post-action static">
          <MessageCircle size={17} />
          {post.comments.length}
        </span>
      </div>

      {post.comments.length > 0 ? (
        <div className="comment-list">
          {post.comments.map((item) => (
            <div key={item.id} className="comment">
              <strong>{item.author}</strong>
              <p>{item.content}</p>
              <span>{relativeTime(item.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <form className="comment-form" onSubmit={submitComment}>
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="留句话，给点反馈"
          aria-label="发表评论"
        />
        <button type="submit" aria-label="发送评论" disabled={!comment.trim()}>
          <Send size={16} />
        </button>
      </form>
    </article>
  );
}

function toneOf(name: string): number {
  return [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
}
