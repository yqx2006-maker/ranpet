import { EXERCISE_MAP } from './exercises';
import { createAchievements } from './achievements';
import type {
  BodyMetric,
  ExerciseLog,
  PersonalData,
  Post,
  User,
  WorkoutLog,
} from '../types';
import { addDays, isoDateTimeDaysAgo, startOfWeek, todayISO } from '../utils/date';
import { generatePlan } from '../utils/plan';
import { petXpForWorkout } from '../utils/pet';

interface WorkoutSeed {
  date: string;
  focus: 'push' | 'pull' | 'legs' | 'core';
  title: string;
}

const SEED_WORKOUTS: WorkoutSeed[] = [
  { date: addDays(todayISO(), -5), focus: 'push', title: '推日 · 胸肩' },
  { date: addDays(todayISO(), -4), focus: 'pull', title: '拉日 · 背臂' },
  { date: addDays(todayISO(), -3), focus: 'legs', title: '腿臀日' },
  { date: addDays(todayISO(), -2), focus: 'push', title: '推日 · 胸肩' },
  { date: addDays(todayISO(), -1), focus: 'pull', title: '拉日 · 背臂' },
  { date: addDays(todayISO(), -6), focus: 'legs', title: '下肢力量' },
  { date: addDays(todayISO(), -8), focus: 'push', title: '上肢推' },
  { date: addDays(todayISO(), -9), focus: 'pull', title: '上肢拉' },
  { date: addDays(todayISO(), -11), focus: 'legs', title: '腿臀日' },
  { date: addDays(todayISO(), -14), focus: 'push', title: '推日 · 胸肩' },
  { date: addDays(todayISO(), -16), focus: 'pull', title: '拉日 · 背臂' },
  { date: addDays(todayISO(), -19), focus: 'legs', title: '下肢力量' },
  { date: addDays(todayISO(), -22), focus: 'push', title: '上肢推' },
  { date: addDays(todayISO(), -26), focus: 'pull', title: '上肢拉' },
];

const POOLS = {
  push: ['pushup', 'dumbbell-bench', 'shoulder-press', 'lateral-raise', 'tricep-dip'],
  pull: ['inverted-row', 'one-arm-row', 'bicep-curl', 'bent-over-fly'],
  legs: ['squat-goblet', 'rdl-dumbbell', 'glute-bridge', 'lunge', 'calf-raise'],
  core: ['plank', 'dead-bug', 'russian-twist', 'crunch'],
};

function createSeedWorkout(seed: WorkoutSeed, index: number): WorkoutLog {
  const ids = POOLS[seed.focus].slice(0, 4);
  const exercises: ExerciseLog[] = ids.map((id, exerciseIndex) => {
    const exercise = EXERCISE_MAP[id];
    const weighted = exercise.equipment.includes('dumbbell');
    const weight = weighted ? (exercise.compound ? 24 + exerciseIndex * 4 : 8 + exerciseIndex * 2) : 0;
    const reps = exercise.unit === 'time' ? exercise.reps : exercise.reps;
    return {
      exerciseId: id,
      sets: Array.from({ length: exercise.sets }, () => ({
        reps,
        weight,
        done: true,
      })),
    };
  });

  let volume = 0;
  for (const exercise of exercises) {
    if (EXERCISE_MAP[exercise.exerciseId]?.unit === 'time') continue;
    for (const set of exercise.sets) {
      volume += set.reps * (set.weight > 0 ? set.weight : 34);
    }
  }
  volume = Math.round(volume);
  const durationMin = 38 + (index % 3) * 4;
  const xp = petXpForWorkout(durationMin, volume, 4);

  return {
    id: `w-seed-${index}`,
    date: seed.date,
    title: seed.title,
    focus: seed.focus,
    durationMin,
    volume,
    rpe: 7,
    xp,
    exercises,
    createdAt: `${seed.date}T19:20:00.000Z`,
  };
}

const DEMO_USER: User = {
  id: 'u-demo',
  name: '阿燃',
  email: 'demo@ranpet.app',
  password: 'demo1234',
  goal: 'build',
  level: 'intermediate',
  equipment: 'dumbbell',
  daysPerWeek: 6,
  sessionMinutes: 40,
  onboarded: true,
  createdAt: isoDateTimeDaysAgo(40, 9),
};

const DEMO_METRICS: BodyMetric[] = [
  { id: 'm-1', date: addDays(todayISO(), -35), weight: 78.4, bodyFat: 22.4, waist: 86 },
  { id: 'm-2', date: addDays(todayISO(), -28), weight: 78.0, bodyFat: 22.0, waist: 85.4 },
  { id: 'm-3', date: addDays(todayISO(), -21), weight: 77.8, bodyFat: 21.7, waist: 84.9 },
  { id: 'm-4', date: addDays(todayISO(), -14), weight: 77.4, bodyFat: 21.4, waist: 84.3 },
  { id: 'm-5', date: addDays(todayISO(), -7), weight: 77.1, bodyFat: 21.1, waist: 83.8 },
  { id: 'm-6', date: todayISO(), weight: 76.9, bodyFat: 21.0, waist: 83.5 },
];

const UNLOCKED: Record<string, string> = {
  'first-workout': isoDateTimeDaysAgo(26, 19),
  'streak-3': isoDateTimeDaysAgo(3, 19),
  'workouts-10': isoDateTimeDaysAgo(8, 19),
  'volume-5000': isoDateTimeDaysAgo(11, 19),
  'minutes-300': isoDateTimeDaysAgo(6, 19),
  'pet-stage-2': isoDateTimeDaysAgo(9, 19),
  'first-post': isoDateTimeDaysAgo(3, 20),
  'social-10': isoDateTimeDaysAgo(2, 12),
};

const DEMO_POST: Post = {
  id: 'p-demo',
  authorId: 'u-demo',
  authorName: '阿燃',
  authorTag: '连续 6 天',
  content: '今天把高脚杯深蹲加到 32kg，噗噗在旁边激动得尾巴都冒火星了。练完一起瘫在地板上，挺好。',
  createdAt: isoDateTimeDaysAgo(3, 20),
  likes: 12,
  likedByMe: false,
  comments: [
    {
      id: 'c-demo-1',
      author: '小满',
      content: '尾巴冒火星哈哈哈，画面感有了。',
      createdAt: isoDateTimeDaysAgo(3, 21),
    },
    {
      id: 'c-demo-2',
      author: '阿哲',
      content: '32kg 稳的，下次试试保加利亚？',
      createdAt: isoDateTimeDaysAgo(2, 9),
    },
  ],
  workout: {
    title: '腿臀日',
    durationMin: 46,
    volume: 2480,
  },
};

const OTHER_POSTS: Post[] = [
  {
    id: 'p-2',
    authorId: 'u-xiaoman',
    authorName: '小满',
    authorTag: '连续 18 天',
    content: '连续打卡第 18 天。以前下班只想躺，现在先练 20 分钟再吃饭，整个人都轻了。',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    likes: 24,
    likedByMe: false,
    comments: [
      {
        id: 'c-2-1',
        author: 'Momo',
        content: '这个顺序真的有用，先动起来再吃饭不容易摆烂。',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'p-3',
    authorId: 'u-azhe',
    authorName: '阿哲',
    authorTag: '增肌第 8 周',
    content: '求问：卧推的时候肩膀前侧有点疼，是不是手肘打开太大了？',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    likes: 8,
    likedByMe: false,
    comments: [
      {
        id: 'c-3-1',
        author: '老赵',
        content: '大概率是。手肘收一点，肩胛先后缩再推。',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        id: 'c-3-2',
        author: 'Kiki',
        content: '先降重量，录个侧面视频看看。',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'p-4',
    authorId: 'u-momo',
    authorName: 'Momo',
    authorTag: '居家训练',
    content: '只有 15 分钟也想动一动，跟了一节核心，宠物说这也算数。',
    createdAt: isoDateTimeDaysAgo(1, 21),
    likes: 31,
    likedByMe: false,
    comments: [],
    workout: {
      title: '核心稳定',
      durationMin: 15,
      volume: 620,
    },
  },
  {
    id: 'p-5',
    authorId: 'u-laozhao',
    authorName: '老赵',
    authorTag: '第 8 周',
    content: '体重没怎么掉，但腰围少了 4cm。别只看秤，围度和训练表现更诚实。',
    createdAt: isoDateTimeDaysAgo(2, 8),
    likes: 42,
    likedByMe: false,
    comments: [
      {
        id: 'c-5-1',
        author: '小满',
        content: '这句话我要截图存起来。',
        createdAt: isoDateTimeDaysAgo(2, 9),
      },
    ],
  },
  {
    id: 'p-6',
    authorId: 'u-kiki',
    authorName: 'Kiki',
    authorTag: '挑战发起人',
    content: '周末挑战：100 个深蹲分 4 组，组间休息 60 秒。有人一起吗？',
    createdAt: isoDateTimeDaysAgo(3, 10),
    likes: 17,
    likedByMe: false,
    comments: [
      {
        id: 'c-6-1',
        author: '阿燃',
        content: '加我一个，练完来打卡。',
        createdAt: isoDateTimeDaysAgo(3, 11),
      },
      {
        id: 'c-6-2',
        author: 'Momo',
        content: '徒手还是负重？',
        createdAt: isoDateTimeDaysAgo(3, 12),
      },
    ],
  },
];

export interface SeedState {
  users: User[];
  currentUserId: string | null;
  personal: Record<string, PersonalData>;
  posts: Post[];
}

export function buildInitialState(): SeedState {
  const workouts = SEED_WORKOUTS.map((seed, index) => createSeedWorkout(seed, index));
  const demoPersonal: PersonalData = {
    workouts,
    plan: generatePlan(DEMO_USER, startOfWeek()),
    metrics: DEMO_METRICS,
    pet: {
      name: '噗噗',
      xp: 860,
      energy: 72,
      bond: 64,
      lastCareDate: addDays(todayISO(), -1),
      lastFedDate: addDays(todayISO(), -1),
      lastSyncDate: todayISO(),
      accessories: ['bandana', 'medal', 'dumbbell-charm'],
      equipped: ['bandana'],
    },
    achievements: createAchievements(UNLOCKED),
  };

  return {
    users: [DEMO_USER],
    currentUserId: null,
    personal: {
      [DEMO_USER.id]: demoPersonal,
    },
    posts: [DEMO_POST, ...OTHER_POSTS],
  };
}

export function createBlankPersonal(): PersonalData {
  return {
    workouts: [],
    plan: null,
    metrics: [],
    pet: {
      name: '噗噗',
      xp: 0,
      energy: 80,
      bond: 10,
      lastCareDate: '',
      lastFedDate: '',
      lastSyncDate: todayISO(),
      accessories: ['bandana'],
      equipped: ['bandana'],
    },
    achievements: createAchievements(),
  };
}
