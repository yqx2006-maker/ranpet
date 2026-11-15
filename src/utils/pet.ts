import type { Achievement, Pet, PetMood } from '../types';

export interface PetStageDef {
  stage: number;
  name: string;
  minXp: number;
  tagline: string;
}

export const PET_STAGES: PetStageDef[] = [
  { stage: 0, name: '火种蛋', minXp: 0, tagline: '还在酝酿，等你点燃' },
  { stage: 1, name: '小火苗', minXp: 200, tagline: '刚学会蹦跶，见谁都摇尾巴' },
  { stage: 2, name: '焰尾兽', minXp: 600, tagline: '会跟着你的节奏数组数' },
  { stage: 3, name: '烈焰狮', minXp: 1200, tagline: '气场两米八，专治不想练' },
  { stage: 4, name: '星火神兽', minXp: 2000, tagline: '你负责坚持，它负责发光' },
];

export function getPetStage(xp: number): PetStageDef {
  let current = PET_STAGES[0];
  for (const stage of PET_STAGES) {
    if (xp >= stage.minXp) current = stage;
  }
  return current;
}

export function getNextStage(xp: number): PetStageDef | null {
  return PET_STAGES.find((stage) => stage.minXp > xp) ?? null;
}

export function getStageProgress(xp: number): { percent: number; current: number; toNext: number } {
  const current = getPetStage(xp);
  const next = getNextStage(xp);
  if (!next) return { percent: 100, current: xp - current.minXp, toNext: 0 };
  const span = next.minXp - current.minXp;
  const gained = xp - current.minXp;
  return {
    percent: Math.min(100, Math.round((gained / span) * 100)),
    current: gained,
    toNext: next.minXp - xp,
  };
}

export function petXpForWorkout(durationMin: number, volume: number, streak: number): number {
  return Math.round(
    35 + durationMin * 1.5 + Math.min(volume / 150, 60) + Math.min(streak, 7) * 6,
  );
}

export function getPetMood(pet: Pet, trainedToday: boolean): PetMood {
  if (pet.energy <= 25) return 'hungry';
  if (trainedToday) return 'energized';
  const hour = new Date().getHours();
  if (hour >= 22 || pet.energy < 45) return 'sleepy';
  return 'happy';
}

export interface AccessoryDef {
  id: string;
  name: string;
  hint: string;
}

export const ACCESSORIES: AccessoryDef[] = [
  { id: 'bandana', name: '燃力头巾', hint: '初始装扮' },
  { id: 'medal', name: '坚持奖牌', hint: '连续训练 3 天解锁' },
  { id: 'dumbbell-charm', name: '迷你哑铃', hint: '累计训练 10 次解锁' },
  { id: 'cape', name: '烈焰披风', hint: '伙伴进化到成年期解锁' },
  { id: 'crown', name: '星火皇冠', hint: '伙伴进化到星火期解锁' },
];

export function getUnlockedAccessories(
  stage: number,
  achievements: Achievement[],
): AccessoryDef[] {
  const unlocked = new Set(
    achievements.filter((item) => item.unlockedAt).map((item) => item.id),
  );
  return ACCESSORIES.filter((accessory) => {
    if (accessory.id === 'bandana') return true;
    if (accessory.id === 'medal') return unlocked.has('streak-3');
    if (accessory.id === 'dumbbell-charm') return unlocked.has('workouts-10');
    if (accessory.id === 'cape') return stage >= 3;
    if (accessory.id === 'crown') return stage >= 4;
    return false;
  });
}
