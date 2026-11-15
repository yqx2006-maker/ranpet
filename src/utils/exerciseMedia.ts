import type { Exercise } from '../types';

export type ExerciseVisual =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'lunge'
  | 'core'
  | 'cardio'
  | 'mobility';

export function exerciseVisual(exercise: Exercise): ExerciseVisual {
  if (exercise.focus === 'push') return 'push';
  if (exercise.focus === 'pull') return 'pull';
  if (exercise.focus === 'core') return 'core';
  if (exercise.focus === 'cardio') return 'cardio';
  if (exercise.focus === 'mobility') return 'mobility';
  if (exercise.id.includes('lunge') || exercise.id.includes('bulgarian')) return 'lunge';
  if (
    exercise.id.includes('rdl') ||
    exercise.id.includes('glute-bridge') ||
    exercise.id.includes('hip-thrust')
  ) {
    return 'hinge';
  }
  return 'squat';
}

export function bilibiliSearch(query: string): string {
  return `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`;
}

export function exerciseVideoUrl(exercise: Exercise): string {
  return exercise.videoUrl ?? bilibiliSearch(`${exercise.name} 教学 动作要领`);
}
