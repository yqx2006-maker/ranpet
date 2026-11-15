import type { WorkoutLog } from '../types';
import { addDays, startOfWeek, todayISO } from './date';

export function getStreak(workouts: WorkoutLog[], today = todayISO()): number {
  const dates = new Set(workouts.map((item) => item.date));
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function getWeekWorkouts(workouts: WorkoutLog[], weekStart = startOfWeek()): WorkoutLog[] {
  const end = addDays(weekStart, 6);
  return workouts.filter((item) => item.date >= weekStart && item.date <= end);
}

export function getWeeklyMinutes(workouts: WorkoutLog[], weekStart = startOfWeek()): number {
  return getWeekWorkouts(workouts, weekStart).reduce((sum, item) => sum + item.durationMin, 0);
}

export function getWeeklyVolume(workouts: WorkoutLog[], weekStart = startOfWeek()): number {
  return getWeekWorkouts(workouts, weekStart).reduce((sum, item) => sum + item.volume, 0);
}

export function getWeeklyXP(workouts: WorkoutLog[], weekStart = startOfWeek()): number {
  return getWeekWorkouts(workouts, weekStart).reduce((sum, item) => sum + item.xp, 0);
}

export function getTotalVolume(workouts: WorkoutLog[]): number {
  return workouts.reduce((sum, item) => sum + item.volume, 0);
}

export function getTotalMinutes(workouts: WorkoutLog[]): number {
  return workouts.reduce((sum, item) => sum + item.durationMin, 0);
}

export function getDayMinutes(workouts: WorkoutLog[], date: string): number {
  return workouts
    .filter((item) => item.date === date)
    .reduce((sum, item) => sum + item.durationMin, 0);
}

export function getWeeklyVolumeSeries(
  workouts: WorkoutLog[],
  weeks = 6,
  endWeekStart = startOfWeek(),
): { label: string; value: number }[] {
  const series: { label: string; value: number }[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekStart = addDays(endWeekStart, -i * 7);
    const month = Number(weekStart.slice(5, 7));
    const day = Number(weekStart.slice(8, 10));
    series.push({
      label: `${month}/${day}`,
      value: Math.round(getWeeklyVolume(workouts, weekStart)),
    });
  }
  return series;
}

export function getPersonalRecords(
  workouts: WorkoutLog[],
  limit = 4,
): { exerciseId: string; weight: number; reps: number; date: string }[] {
  const best = new Map<string, { exerciseId: string; weight: number; reps: number; date: string }>();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      for (const set of exercise.sets) {
        if (set.weight <= 0) continue;
        const current = best.get(exercise.exerciseId);
        if (!current || set.weight > current.weight) {
          best.set(exercise.exerciseId, {
            exerciseId: exercise.exerciseId,
            weight: set.weight,
            reps: set.reps,
            date: workout.date,
          });
        }
      }
    }
  }
  return [...best.values()].sort((a, b) => b.weight - a.weight).slice(0, limit);
}

export function getWeekCompletion(workouts: WorkoutLog[], daysPerWeek: number): number {
  const done = getWeekWorkouts(workouts).length;
  return Math.min(100, Math.round((done / Math.max(1, daysPerWeek)) * 100));
}
