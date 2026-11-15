import { EXERCISES } from '../data/exercises';
import type {
  Block,
  Equipment,
  Focus,
  Goal,
  Level,
  PlanDay,
  PlanExercise,
  WeeklyPlan,
} from '../types';
import { FOCUS_LABEL } from '../types';
import { addDays, startOfWeek } from './date';

export interface PlanProfile {
  goal: Goal;
  level: Level;
  equipment: Equipment;
  daysPerWeek: number;
  sessionMinutes: number;
}

const DAY_LAYOUT: Record<number, number[]> = {
  1: [2],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

const FOCUS_LAYOUT: Record<number, Focus[]> = {
  1: ['full'],
  2: ['full', 'full'],
  3: ['full', 'full', 'full'],
  4: ['upper', 'lower', 'upper', 'lower'],
  5: ['push', 'pull', 'legs', 'upper', 'lower'],
  6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
};

const GROUP: Record<Focus, Focus[]> = {
  full: ['push', 'pull', 'legs', 'core', 'cardio'],
  upper: ['push', 'pull', 'core'],
  lower: ['legs', 'core', 'cardio'],
  push: ['push', 'core'],
  pull: ['pull', 'core'],
  legs: ['legs', 'core'],
  core: ['core', 'cardio'],
  cardio: ['cardio', 'core'],
  mobility: ['mobility'],
};

function availableEquipment(equipment: Equipment): Equipment[] {
  if (equipment === 'gym') return ['none', 'dumbbell', 'gym'];
  if (equipment === 'dumbbell') return ['none', 'dumbbell'];
  return ['none'];
}

function rotate<T>(items: T[], seed: number): T[] {
  if (items.length === 0) return items;
  const index = ((seed % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function mainCount(minutes: number): number {
  if (minutes <= 20) return 3;
  if (minutes <= 30) return 4;
  if (minutes <= 45) return 5;
  return 6;
}

function focusSequence(focus: Focus, count: number): Focus[] {
  if (focus === 'upper') {
    const push = Math.ceil(count / 2);
    return [...Array<Focus>(push).fill('push'), ...Array<Focus>(count - push).fill('pull')];
  }
  if (focus === 'lower') {
    const legs = Math.ceil(count / 2);
    const rest = count - legs;
    return [
      ...Array<Focus>(legs).fill('legs'),
      ...Array.from({ length: rest }, (_, index) => (index === 0 ? 'cardio' : 'core') as Focus),
    ];
  }
  if (focus === 'full') {
    const base: Focus[] = ['push', 'pull', 'legs', 'core', 'cardio'];
    while (base.length < count) base.push('core');
    return base.slice(0, count);
  }
  if (focus === 'core') {
    const sequence: Focus[] = [
      ...Array<Focus>(Math.max(1, count - 1)).fill('core'),
      'cardio',
    ];
    return sequence.slice(0, count);
  }
  if (focus === 'cardio') {
    const sequence: Focus[] = [
      'cardio',
      'cardio',
      ...Array<Focus>(Math.max(0, count - 2)).fill('core'),
    ];
    return sequence.slice(0, count);
  }
  if (focus === 'mobility') {
    return Array<Focus>(count).fill('mobility');
  }
  const sequence: Focus[] = [
    ...Array<Focus>(Math.max(1, count - 1)).fill(focus),
    'core',
  ];
  return sequence.slice(0, count);
}

function pickExercises(
  focus: Focus,
  profile: PlanProfile,
  seed: number,
  count: number,
  used: Set<string>,
): string[] {
  const equipment = availableEquipment(profile.equipment);
  const sequence = focusSequence(focus, count);
  const picked: string[] = [];

  for (let index = 0; index < sequence.length; index += 1) {
    const target = sequence[index];
    const candidates = EXERCISES.filter(
      (exercise) =>
        GROUP[focus].includes(exercise.focus) &&
        exercise.focus === target &&
        exercise.levels.includes(profile.level) &&
        exercise.equipment.some((item) => equipment.includes(item)) &&
        !used.has(exercise.id),
    );
    const compound = rotate(
      candidates.filter((exercise) => exercise.compound),
      seed + index * 3,
    );
    const isolation = rotate(
      candidates.filter((exercise) => !exercise.compound),
      seed + index * 3 + 1,
    );
    const choice = [...compound, ...isolation][0];
    if (choice) {
      used.add(choice.id);
      picked.push(choice.id);
    }
  }

  if (picked.length < count) {
    const fallback = rotate(
      EXERCISES.filter(
        (exercise) =>
          GROUP[focus].includes(exercise.focus) &&
          exercise.levels.includes(profile.level) &&
          exercise.equipment.some((item) => equipment.includes(item)) &&
          !used.has(exercise.id),
      ),
      seed,
    );
    for (const exercise of fallback) {
      if (picked.length >= count) break;
      used.add(exercise.id);
      picked.push(exercise.id);
    }
  }

  return picked;
}

function prescription(
  goal: Goal,
  level: Level,
  base: { sets: number; reps: number; restSec: number; unit: 'reps' | 'time' },
): { sets: number; reps: number; restSec: number } {
  let sets = base.sets;
  let reps = base.reps;
  let restSec = base.restSec;

  if (goal === 'lose') {
    reps = base.unit === 'time' ? Math.max(30, base.reps) : Math.max(12, base.reps);
    restSec = Math.min(60, restSec);
  }
  if (goal === 'build') {
    sets = Math.min(5, base.sets + 1);
    reps = base.unit === 'time' ? base.reps : Math.max(6, Math.min(12, base.reps));
    restSec = Math.max(60, restSec);
  }
  if (goal === 'keep') {
    restSec = 60;
  }
  if (level === 'beginner') {
    sets = Math.max(2, sets - 1);
  }
  if (level === 'advanced') {
    sets = Math.min(5, sets + 1);
  }
  return { sets, reps, restSec };
}

function makePlanExercise(
  exerciseId: string,
  block: Block,
  profile: PlanProfile,
): PlanExercise {
  const exercise = EXERCISES.find((item) => item.id === exerciseId);
  if (!exercise) {
    return {
      exerciseId,
      block,
      sets: 3,
      reps: 10,
      unit: 'reps',
      restSec: 60,
    };
  }
  if (block === 'warmup') {
    return {
      exerciseId,
      block,
      sets: 1,
      reps: exercise.unit === 'time' ? Math.max(30, exercise.reps) : exercise.reps,
      unit: exercise.unit,
      restSec: 15,
    };
  }
  if (block === 'cooldown') {
    return {
      exerciseId,
      block,
      sets: 1,
      reps: exercise.unit === 'time' ? 30 : exercise.reps,
      unit: exercise.unit,
      restSec: 0,
    };
  }
  const dose = prescription(profile.goal, profile.level, exercise);
  return {
    exerciseId,
    block,
    sets: dose.sets,
    reps: dose.reps,
    unit: exercise.unit,
    restSec: dose.restSec,
  };
}

function dayTitle(focus: Focus, variantIndex: number): string {
  const variants = ['A', 'B', 'C'];
  if (focus === 'full') return `全身循环 ${variants[variantIndex % 3]}`;
  if (focus === 'upper') return `上肢力量 ${variants[variantIndex % 2]}`;
  if (focus === 'lower') return `下肢力量 ${variants[variantIndex % 2]}`;
  if (focus === 'push') return '推日 · 胸肩';
  if (focus === 'pull') return '拉日 · 背臂';
  if (focus === 'legs') return '腿臀日';
  if (focus === 'core') return '核心稳定';
  if (focus === 'cardio') return '心肺燃脂';
  return FOCUS_LABEL[focus];
}

export function generatePlan(profile: PlanProfile, weekStart = startOfWeek()): WeeklyPlan {
  const trainingDays = Math.min(6, Math.max(1, profile.daysPerWeek));
  const layout = DAY_LAYOUT[trainingDays];
  const focuses = FOCUS_LAYOUT[trainingDays];
  const weekSeed = Math.floor(new Date(weekStart).getTime() / 86400000 / 7);

  const days: PlanDay[] = [];
  const variantCounts = new Map<Focus, number>();

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(weekStart, index);
    const trainingIndex = layout.indexOf(index);
    if (trainingIndex === -1) {
      days.push({
        date,
        title: '恢复日',
        focus: 'mobility',
        durationMin: 0,
        exercises: [],
        isRest: true,
      });
      continue;
    }

    const focus = focuses[trainingIndex];
    const variant = variantCounts.get(focus) ?? 0;
    variantCounts.set(focus, variant + 1);
    const count = mainCount(profile.sessionMinutes);
    const used = new Set<string>();
    const mainIds = pickExercises(focus, profile, weekSeed + trainingIndex * 11, count, used);

    const mobilityPool = rotate(
      EXERCISES.filter((exercise) => exercise.focus === 'mobility'),
      weekSeed + trainingIndex,
    );
    const warmupIds = mobilityPool.slice(0, profile.sessionMinutes >= 40 ? 2 : 1);
    const cooldown = mobilityPool.find((exercise) => !warmupIds.includes(exercise));

    const planExercises: PlanExercise[] = [
      ...warmupIds.map((exercise) => makePlanExercise(exercise.id, 'warmup', profile)),
      ...mainIds.map((id) => makePlanExercise(id, 'main', profile)),
    ];
    if (cooldown) {
      planExercises.push(makePlanExercise(cooldown.id, 'cooldown', profile));
    }

    days.push({
      date,
      title: dayTitle(focus, variant),
      focus,
      durationMin: profile.sessionMinutes,
      exercises: planExercises,
      isRest: false,
    });
  }

  return {
    weekStart,
    days,
    generatedAt: new Date().toISOString(),
  };
}

export function planDayForDate(plan: WeeklyPlan | null, date: string): PlanDay | null {
  return plan?.days.find((day) => day.date === date) ?? null;
}
