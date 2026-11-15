export type Goal = 'lose' | 'build' | 'keep';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbell' | 'gym';
export type Focus =
  | 'full'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'mobility';
export type Block = 'warmup' | 'main' | 'cooldown';
export type PetMood = 'happy' | 'energized' | 'sleepy' | 'hungry';
export type Unit = 'reps' | 'time';

export const GOAL_LABEL: Record<Goal, string> = {
  lose: '减脂塑形',
  build: '增肌变强',
  keep: '保持活力',
};

export const GOAL_HINT: Record<Goal, string> = {
  lose: '代谢优先，力量与有氧搭配',
  build: '复合动作打底，稳步加负荷',
  keep: '规律活动，保持身体状态',
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: '刚开始练',
  intermediate: '有训练基础',
  advanced: '训练老手',
};

export const EQUIP_LABEL: Record<Equipment, string> = {
  none: '徒手 / 居家',
  dumbbell: '哑铃 / 弹力带',
  gym: '健身房器械',
};

export const FOCUS_LABEL: Record<Focus, string> = {
  full: '全身',
  upper: '上肢',
  lower: '下肢',
  push: '推 · 胸肩',
  pull: '拉 · 背臂',
  legs: '腿臀',
  core: '核心',
  cardio: '有氧',
  mobility: '灵活',
};

export const MOOD_LABEL: Record<PetMood, string> = {
  happy: '心情不错',
  energized: '元气满满',
  sleepy: '有点困了',
  hungry: '想补充能量',
};

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  goal: Goal;
  level: Level;
  equipment: Equipment;
  daysPerWeek: number;
  sessionMinutes: number;
  onboarded: boolean;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  focus: Focus;
  equipment: Equipment[];
  levels: Level[];
  unit: Unit;
  sets: number;
  reps: number;
  restSec: number;
  compound: boolean;
  cues: string[];
  mistake: string;
  target: string;
  videoUrl?: string;
  imageUrl?: string;
  imageUrl2?: string;
}

export interface PlanExercise {
  exerciseId: string;
  block: Block;
  sets: number;
  reps: number;
  unit: Unit;
  restSec: number;
}

export interface PlanDay {
  date: string;
  title: string;
  focus: Focus;
  durationMin: number;
  exercises: PlanExercise[];
  isRest: boolean;
}

export interface WeeklyPlan {
  weekStart: string;
  days: PlanDay[];
  generatedAt: string;
}

export interface SetLog {
  reps: number;
  weight: number;
  done: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  title: string;
  focus: Focus;
  durationMin: number;
  volume: number;
  rpe: number;
  xp: number;
  exercises: ExerciseLog[];
  note?: string;
  createdAt: string;
  source?: 'manual' | 'import';
  externalId?: string;
  externalType?: string;
  calories?: number;
  distanceKm?: number;
  steps?: number;
  avgHeartRate?: number;
}

export interface ImportedWorkout {
  externalId: string;
  date: string;
  title: string;
  focus: Focus;
  durationMin: number;
  calories?: number;
  distanceKm?: number;
  steps?: number;
  avgHeartRate?: number;
  externalType?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
}

export interface BodyMetric {
  id: string;
  date: string;
  weight: number;
  height?: number;
  bodyFat?: number;
  waist?: number;
  systolic?: number;
  diastolic?: number;
  restingHeartRate?: number;
  note?: string;
  source?: 'manual' | 'report';
}

export interface HealthReportDraft {
  date?: string;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercent?: number;
  waistCm?: number;
  systolic?: number;
  diastolic?: number;
  restingHeartRate?: number;
  bmi?: number;
  notes?: string;
}

export type PetBuilderShape =
  | 'round'
  | 'bean'
  | 'tall'
  | 'dumpling'
  | 'drop'
  | 'loaf';
export type PetBuilderEars = 'pointed' | 'round' | 'drop' | 'horn' | 'none';
export type PetBuilderEyes = 'dot' | 'happy' | 'sparkle' | 'sleepy';
export type PetBuilderMouth = 'smile' | 'cat' | 'open' | 'fang';
export type PetBuilderTail = 'flame' | 'leaf' | 'curl' | 'bolt' | 'puff';
export type PetBuilderPattern =
  | 'none'
  | 'spots'
  | 'stripes'
  | 'patch'
  | 'star'
  | 'cloud'
  | 'dots'
  | 'mask'
  | 'band';
export type PetBuilderAccessory =
  | 'none'
  | 'scarf'
  | 'glasses'
  | 'headband'
  | 'flower'
  | 'crown';

export type PetExpression =
  | 'neutral'
  | 'happy'
  | 'energized'
  | 'sleepy'
  | 'hungry'
  | 'excited'
  | 'proud';

export interface PetBuilderConfig {
  shape: PetBuilderShape;
  ears: PetBuilderEars;
  eyes: PetBuilderEyes;
  mouth: PetBuilderMouth;
  tail: PetBuilderTail;
  pattern: PetBuilderPattern;
  accessory: PetBuilderAccessory;
  primary: string;
  secondary: string;
  rotation?: number;
  expression?: PetExpression;
  decorations?: string[];
}

export interface Pet {
  name: string;
  xp: number;
  energy: number;
  bond: number;
  lastCareDate: string;
  lastFedDate: string;
  lastSyncDate: string;
  accessories: string[];
  equipped: string[];
  customImage?: string;
  customImageMode?: 'photo' | 'cutout' | 'builder';
  customBuilder?: PetBuilderConfig;
  accent?: string;
  evolutions?: { stage: number; at: string }[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorTag: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  workout?: {
    title: string;
    durationMin: number;
    volume: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface PersonalData {
  workouts: WorkoutLog[];
  plan: WeeklyPlan | null;
  metrics: BodyMetric[];
  pet: Pet;
  achievements: Achievement[];
}

export interface ToastState {
  id: number;
  title: string;
  message?: string;
}
