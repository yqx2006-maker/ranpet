import type { Achievement } from '../types';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  workoutCount: number;
  streak: number;
  totalVolume: number;
  totalMinutes: number;
  petStage: number;
  postCount: number;
  likesReceived: number;
  weeklyWorkouts: number;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first-workout',
    title: '第一把火',
    description: '完成第一次训练',
    icon: 'flame',
    check: (ctx) => ctx.workoutCount >= 1,
  },
  {
    id: 'streak-3',
    title: '三日不断',
    description: '连续训练 3 天',
    icon: 'calendar',
    check: (ctx) => ctx.streak >= 3,
  },
  {
    id: 'streak-7',
    title: '一周燃烧',
    description: '连续训练 7 天',
    icon: 'zap',
    check: (ctx) => ctx.streak >= 7,
  },
  {
    id: 'workouts-10',
    title: '十次打卡',
    description: '累计完成 10 次训练',
    icon: 'dumbbell',
    check: (ctx) => ctx.workoutCount >= 10,
  },
  {
    id: 'workouts-30',
    title: '习惯成型',
    description: '累计完成 30 次训练',
    icon: 'trophy',
    check: (ctx) => ctx.workoutCount >= 30,
  },
  {
    id: 'volume-5000',
    title: '五吨俱乐部',
    description: '累计训练容量达到 5,000 kg',
    icon: 'trending',
    check: (ctx) => ctx.totalVolume >= 5000,
  },
  {
    id: 'minutes-300',
    title: '五小时投入',
    description: '累计训练时长达到 300 分钟',
    icon: 'timer',
    check: (ctx) => ctx.totalMinutes >= 300,
  },
  {
    id: 'weekly-4',
    title: '本周满格',
    description: '一周内完成 4 次训练',
    icon: 'target',
    check: (ctx) => ctx.weeklyWorkouts >= 4,
  },
  {
    id: 'pet-stage-2',
    title: '一起长大',
    description: '伙伴进化到少年期',
    icon: 'paw',
    check: (ctx) => ctx.petStage >= 2,
  },
  {
    id: 'pet-stage-3',
    title: '最佳拍档',
    description: '伙伴进化到成年期',
    icon: 'crown',
    check: (ctx) => ctx.petStage >= 3,
  },
  {
    id: 'first-post',
    title: '第一次发声',
    description: '在社区发布第一条动态',
    icon: 'message',
    check: (ctx) => ctx.postCount >= 1,
  },
  {
    id: 'social-10',
    title: '被看见',
    description: '社区动态累计获得 10 个赞',
    icon: 'heart',
    check: (ctx) => ctx.likesReceived >= 10,
  },
];

export function createAchievements(unlocked: Record<string, string> = {}): Achievement[] {
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlockedAt: unlocked[def.id],
  }));
}

export function findNewAchievements(
  ctx: AchievementContext,
  achievements: Achievement[],
): AchievementDef[] {
  const unlocked = new Set(achievements.filter((item) => item.unlockedAt).map((item) => item.id));
  return ACHIEVEMENT_DEFS.filter((def) => !unlocked.has(def.id) && def.check(ctx));
}
