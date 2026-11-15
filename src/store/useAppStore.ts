import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildInitialState, createBlankPersonal } from '../data/seed';
import { EXERCISE_MAP } from '../data/exercises';
import { findNewAchievements, type AchievementDef, type AchievementContext } from '../data/achievements';
import type {
  Achievement,
  BodyMetric,
  Equipment,
  ExerciseLog,
  Focus,
  Goal,
  ImportedWorkout,
  ImportResult,
  Level,
  PersonalData,
  Pet,
  PetBuilderConfig,
  Post,
  ToastState,
  User,
  WorkoutLog,
} from '../types';
import { daysBetween, isoDateTimeNow, startOfWeek, todayISO } from '../utils/date';
import { generatePlan } from '../utils/plan';
import { getPetStage, getUnlockedAccessories, petXpForWorkout } from '../utils/pet';
import { getStreak, getTotalMinutes, getTotalVolume, getWeekWorkouts } from '../utils/stats';

export interface CompleteWorkoutInput {
  date: string;
  title: string;
  focus: Focus;
  durationMin: number;
  rpe: number;
  exercises: ExerciseLog[];
  note?: string;
}

export interface MetricInput {
  date?: string;
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

interface AppStore {
  users: User[];
  currentUserId: string | null;
  personal: Record<string, PersonalData>;
  posts: Post[];
  toast: ToastState | null;
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginDemo: () => void;
  logout: () => void;
  completeOnboarding: (input: {
    name: string;
    goal: Goal;
    level: Level;
    equipment: Equipment;
    daysPerWeek: number;
    sessionMinutes: number;
  }) => void;
  updateProfile: (input: Partial<Pick<User, 'name' | 'goal' | 'level' | 'equipment' | 'daysPerWeek' | 'sessionMinutes'>>) => void;
  ensurePlan: () => void;
  syncDaily: () => void;
  completeWorkout: (input: CompleteWorkoutInput) => WorkoutLog | null;
  addMetric: (input: MetricInput) => void;
  updateMetric: (id: string, input: MetricInput) => void;
  addPost: (content: string, workout?: Post['workout']) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  carePet: () => void;
  feedPet: () => void;
  toggleAccessory: (accessoryId: string) => void;
  setCustomPet: (input: {
    name: string;
    accent?: string;
    builder?: PetBuilderConfig;
  }) => void;
  clearCustomPet: () => void;
  importWorkouts: (records: ImportedWorkout[]) => ImportResult;
  showToast: (title: string, message?: string) => void;
  dismissToast: () => void;
}

function currentUser(state: Pick<AppStore, 'users' | 'currentUserId'>): User | null {
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
}

function buildContext(
  userId: string,
  personal: PersonalData,
  posts: Post[],
): AchievementContext {
  const ownPosts = posts.filter((post) => post.authorId === userId);
  return {
    workoutCount: personal.workouts.length,
    streak: getStreak(personal.workouts),
    totalVolume: getTotalVolume(personal.workouts),
    totalMinutes: getTotalMinutes(personal.workouts),
    petStage: getPetStage(personal.pet.xp).stage,
    postCount: ownPosts.length,
    likesReceived: ownPosts.reduce((sum, post) => sum + post.likes, 0),
    weeklyWorkouts: getWeekWorkouts(personal.workouts).length,
  };
}

function awardAchievements(
  userId: string,
  personal: PersonalData,
  posts: Post[],
): { achievements: Achievement[]; unlocked: AchievementDef[] } {
  const unlocked = findNewAchievements(
    buildContext(userId, personal, posts),
    personal.achievements,
  );
  if (unlocked.length === 0) {
    return { achievements: personal.achievements, unlocked };
  }
  const stamp = isoDateTimeNow();
  const ids = new Set(unlocked.map((item) => item.id));
  const achievements = personal.achievements.map((item) =>
    ids.has(item.id) ? { ...item, unlockedAt: stamp } : item,
  );
  return { achievements, unlocked };
}

function sortWorkouts(workouts: WorkoutLog[]): WorkoutLog[] {
  return [...workouts].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),
      toast: null,

      register: (name, email, password) => {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        if (cleanName.length < 1) return { ok: false, error: '先给自己起个名字吧' };
        if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
          return { ok: false, error: '邮箱格式看起来不太对' };
        }
        if (password.length < 6) return { ok: false, error: '密码至少需要 6 位' };
        const exists = get().users.some(
          (user) => user.email.toLowerCase() === cleanEmail,
        );
        if (exists) return { ok: false, error: '这个邮箱已经注册过了' };

        const id = `u-${Date.now()}`;
        const user: User = {
          id,
          name: cleanName,
          email: cleanEmail,
          password,
          goal: 'keep',
          level: 'beginner',
          equipment: 'none',
          daysPerWeek: 3,
          sessionMinutes: 30,
          onboarded: false,
          createdAt: isoDateTimeNow(),
        };
        set((state) => ({
          users: [...state.users, user],
          currentUserId: id,
          personal: { ...state.personal, [id]: createBlankPersonal() },
        }));
        return { ok: true };
      },

      login: (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const user = get().users.find(
          (item) => item.email.toLowerCase() === cleanEmail,
        );
        if (!user || user.password !== password) {
          return { ok: false, error: '邮箱或密码不正确' };
        }
        set({ currentUserId: user.id });
        return { ok: true };
      },

      loginDemo: () => {
        const demo = get().users.find((user) => user.id === 'u-demo');
        if (demo) set({ currentUserId: demo.id });
      },

      logout: () => set({ currentUserId: null }),

      completeOnboarding: (input) => {
        const user = currentUser(get());
        if (!user) return;
        const updatedUser: User = { ...user, ...input, onboarded: true };
        const personal = get().personal[user.id];
        if (!personal) return;
        const plan = generatePlan(updatedUser, startOfWeek());
        set((state) => ({
          users: state.users.map((item) => (item.id === user.id ? updatedUser : item)),
          personal: {
            ...state.personal,
            [user.id]: { ...personal, plan },
          },
          toast: {
            id: Date.now(),
            title: '你的训练计划已生成',
            message: `每周 ${updatedUser.daysPerWeek} 练，先从今天开始。`,
          },
        }));
      },

      updateProfile: (input) => {
        const user = currentUser(get());
        if (!user) return;
        const updatedUser: User = { ...user, ...input };
        const personal = get().personal[user.id];
        if (!personal) return;
        const plan = generatePlan(updatedUser, startOfWeek());
        set((state) => ({
          users: state.users.map((item) => (item.id === user.id ? updatedUser : item)),
          personal: {
            ...state.personal,
            [user.id]: { ...personal, plan },
          },
          toast: {
            id: Date.now(),
            title: '计划已按新设置重排',
            message: '从今天开始，按新的节奏来。',
          },
        }));
      },

      ensurePlan: () => {
        const state = get();
        const user = currentUser(state);
        if (!user || !user.onboarded) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const weekStart = startOfWeek();
        if (personal.plan?.weekStart === weekStart) return;
        const plan = generatePlan(user, weekStart);
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, plan },
          },
        }));
      },

      syncDaily: () => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const today = todayISO();
        if (personal.pet.lastSyncDate === today) return;
        const gap = personal.pet.lastSyncDate
          ? Math.max(1, daysBetween(personal.pet.lastSyncDate, today))
          : 0;
        const energy = Math.max(10, personal.pet.energy - gap * 6);
        const pet: Pet = { ...personal.pet, energy, lastSyncDate: today };
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, pet },
          },
        }));
      },

      completeWorkout: (input) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return null;
        const personal = state.personal[user.id];
        if (!personal) return null;

        const bodyWeight = personal.metrics.at(-1)?.weight ?? 70;
        let volume = 0;
        for (const exercise of input.exercises) {
          const definition = EXERCISE_MAP[exercise.exerciseId];
          if (!definition || definition.unit === 'time' || definition.focus === 'mobility') continue;
          for (const item of exercise.sets) {
            if (!item.done) continue;
            volume += item.reps * (item.weight > 0 ? item.weight : bodyWeight * 0.45);
          }
        }
        volume = Math.round(volume);

        const draft: WorkoutLog = {
          id: `w-${Date.now()}`,
          date: input.date,
          title: input.title,
          focus: input.focus,
          durationMin: Math.max(1, Math.round(input.durationMin)),
          volume,
          rpe: input.rpe,
          xp: 0,
          exercises: input.exercises,
          note: input.note,
          createdAt: isoDateTimeNow(),
        };

        const withDraft = sortWorkouts([...personal.workouts, draft]);
        const streak = getStreak(withDraft);
        const xp = petXpForWorkout(draft.durationMin, volume, streak);
        const log: WorkoutLog = { ...draft, xp };
        const workouts = withDraft.map((item) => (item.id === log.id ? log : item));

        const beforeStage = getPetStage(personal.pet.xp).stage;
        const pet: Pet = {
          ...personal.pet,
          xp: personal.pet.xp + xp,
          energy: Math.min(100, personal.pet.energy + 25),
          bond: Math.min(100, personal.pet.bond + 4),
          lastSyncDate: todayISO(),
        };
        const afterStage = getPetStage(pet.xp).stage;

        const basePersonal: PersonalData = { ...personal, workouts, pet };
        const { achievements, unlocked } = awardAchievements(user.id, basePersonal, state.posts);
        const accessories = getUnlockedAccessories(afterStage, achievements).map(
          (item) => item.id,
        );
        const evolutions =
          afterStage > beforeStage
            ? [
                ...(personal.pet.evolutions ?? []),
                { stage: afterStage, at: isoDateTimeNow() },
              ]
            : personal.pet.evolutions;
        const finalPet: Pet = {
          ...pet,
          evolutions,
          accessories,
          equipped: pet.equipped.filter((id) => accessories.includes(id)),
        };

        let toast: ToastState;
        if (afterStage > beforeStage) {
          toast = {
            id: Date.now(),
            title: `${finalPet.name} 进化了`,
            message: `现在是「${getPetStage(finalPet.xp).name}」${
              unlocked[0] ? `，还解锁了「${unlocked[0].title}」` : ''
            }`,
          };
        } else if (unlocked.length > 0) {
          toast = {
            id: Date.now(),
            title: `解锁成就：${unlocked[0].title}`,
            message: unlocked[0].description,
          };
        } else {
          toast = {
            id: Date.now(),
            title: `训练完成，+${xp} XP`,
            message: `${finalPet.name} 已经吃饱了，心情不错。`,
          };
        }

        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: {
              ...basePersonal,
              pet: finalPet,
              achievements,
            },
          },
          toast,
        }));
        return log;
      },

      addMetric: (input) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const date = input.date ?? todayISO();
        const metric: BodyMetric = {
          id: `m-${Date.now()}`,
          date,
          weight: Math.round(input.weight * 10) / 10,
          height: input.height,
          bodyFat: input.bodyFat,
          waist: input.waist,
          systolic: input.systolic,
          diastolic: input.diastolic,
          restingHeartRate: input.restingHeartRate,
          note: input.note?.trim() || undefined,
          source: input.source ?? 'manual',
        };
        const metrics = [...personal.metrics.filter((item) => item.date !== date), metric].sort(
          (a, b) => a.date.localeCompare(b.date),
        );
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, metrics },
          },
          toast: {
            id: Date.now(),
            title: '身体数据已记录',
            message: '趋势比单次数字更重要。',
          },
        }));
      },

      updateMetric: (id, input) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const existing = personal.metrics.find((item) => item.id === id);
        if (!existing) return;
        const date = input.date ?? existing.date;
        const metric: BodyMetric = {
          id,
          date,
          weight: Math.round(input.weight * 10) / 10,
          height: input.height,
          bodyFat: input.bodyFat,
          waist: input.waist,
          systolic: input.systolic,
          diastolic: input.diastolic,
          restingHeartRate: input.restingHeartRate,
          note: input.note?.trim() || undefined,
          source: input.source ?? existing.source ?? 'manual',
        };
        const metrics = personal.metrics
          .filter((item) => item.id === id || item.date !== date)
          .map((item) => (item.id === id ? metric : item))
          .sort((a, b) => a.date.localeCompare(b.date));
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, metrics },
          },
          toast: {
            id: Date.now(),
            title: '身体数据已更新',
            message: '历史记录会同步更新。',
          },
        }));
      },

      addPost: (content, workout) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const text = content.trim();
        if (!text) return;
        const post: Post = {
          id: `p-${Date.now()}`,
          authorId: user.id,
          authorName: user.name,
          authorTag: `连续 ${getStreak(personal.workouts)} 天`,
          content: text,
          createdAt: isoDateTimeNow(),
          likes: 0,
          likedByMe: false,
          comments: [],
          workout,
        };
        const posts = [post, ...state.posts];
        const { achievements, unlocked } = awardAchievements(
          user.id,
          { ...personal, pet: { ...personal.pet, bond: Math.min(100, personal.pet.bond + 2) } },
          posts,
        );
        set((current) => ({
          posts,
          personal: {
            ...current.personal,
            [user.id]: {
              ...personal,
              pet: { ...personal.pet, bond: Math.min(100, personal.pet.bond + 2) },
              achievements,
            },
          },
          toast: unlocked.length
            ? {
                id: Date.now(),
                title: `解锁成就：${unlocked[0].title}`,
                message: unlocked[0].description,
              }
            : {
                id: Date.now(),
                title: '动态已发布',
                message: `${personal.pet.name} 也觉得你很棒。`,
              },
        }));
      },

      toggleLike: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likedByMe: !post.likedByMe,
                  likes: Math.max(0, post.likes + (post.likedByMe ? -1 : 1)),
                }
              : post,
          ),
        }));
      },

      addComment: (postId, content) => {
        const user = currentUser(get());
        if (!user) return;
        const text = content.trim();
        if (!text) return;
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    {
                      id: `c-${Date.now()}`,
                      author: user.name,
                      content: text,
                      createdAt: isoDateTimeNow(),
                    },
                  ],
                }
              : post,
          ),
        }));
      },

      carePet: () => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const today = todayISO();
        if (personal.pet.lastCareDate === today) {
          set({
            toast: {
              id: Date.now(),
              title: '今天已经摸过啦',
              message: '它眯着眼睛，表示很满意。',
            },
          });
          return;
        }
        const pet: Pet = {
          ...personal.pet,
          bond: Math.min(100, personal.pet.bond + 5),
          energy: Math.min(100, personal.pet.energy + 3),
          lastCareDate: today,
        };
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, pet },
          },
          toast: {
            id: Date.now(),
            title: `${pet.name} 蹭了蹭你的手`,
            message: '亲密 +5 · 活力 +3。训练仍是主要成长来源。',
          },
        }));
      },

      feedPet: () => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const today = todayISO();
        if (personal.pet.lastFedDate === today) {
          set({
            toast: {
              id: Date.now(),
              title: '今天已经补给过了',
              message: '少食多餐，明天再来。',
            },
          });
          return;
        }
        if (personal.pet.energy >= 95) {
          set({
            toast: {
              id: Date.now(),
              title: '现在活力还很足',
              message: '等消耗一点再来补给，不会浪费今天的机会。',
            },
          });
          return;
        }
        const pet: Pet = {
          ...personal.pet,
          energy: Math.min(100, personal.pet.energy + 20),
          bond: Math.min(100, personal.pet.bond + 2),
          lastFedDate: today,
        };
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, pet },
          },
          toast: {
            id: Date.now(),
            title: '能量补给完成',
            message: `${pet.name} 的活力 +20，亲密 +2。`,
          },
        }));
      },

      toggleAccessory: (accessoryId) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const stage = getPetStage(personal.pet.xp).stage;
        const unlocked = getUnlockedAccessories(stage, personal.achievements).map(
          (item) => item.id,
        );
        if (!unlocked.includes(accessoryId)) {
          set({
            toast: {
              id: Date.now(),
              title: '这个装扮还没解锁',
              message: '继续训练，慢慢都会有的。',
            },
          });
          return;
        }
        const equipped = personal.pet.equipped.includes(accessoryId)
          ? personal.pet.equipped.filter((id) => id !== accessoryId)
          : [...personal.pet.equipped, accessoryId];
        if (equipped.length > 2) {
          set({
            toast: {
              id: Date.now(),
              title: '最多同时佩戴 2 件',
              message: '先取下一件再试试。',
            },
          });
          return;
        }
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: {
              ...personal,
              pet: { ...personal.pet, equipped },
            },
          },
        }));
      },

      setCustomPet: (input) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const name = input.name.trim() || personal.pet.name;
        const pet: Pet = {
          ...personal.pet,
          name,
          customImage: undefined,
          customImageMode: 'builder',
          customBuilder: input.builder,
          accent: input.accent || 'var(--coral)',
        };
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, pet },
          },
          toast: {
            id: Date.now(),
            title: `${name} 的自建形象已保存`,
            message: '毛绒伙伴、贴纸装饰和表情已保存，随时可以回来调整。',
          },
        }));
      },

      clearCustomPet: () => {
        const state = get();
        const user = currentUser(state);
        if (!user) return;
        const personal = state.personal[user.id];
        if (!personal) return;
        const pet: Pet = {
          ...personal.pet,
          customImage: undefined,
          customImageMode: undefined,
          customBuilder: undefined,
          accent: undefined,
        };
        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: { ...personal, pet },
          },
          toast: {
            id: Date.now(),
            title: '已恢复默认伙伴',
            message: '火焰伙伴回来了。',
          },
        }));
      },

      importWorkouts: (records) => {
        const state = get();
        const user = currentUser(state);
        if (!user) return { imported: 0, skipped: records.length };
        const personal = state.personal[user.id];
        if (!personal) return { imported: 0, skipped: records.length };

        const existingKeys = new Set<string>();
        for (const workout of personal.workouts) {
          if (workout.externalId) {
            existingKeys.add(`ext:${workout.externalId}`);
          } else {
            existingKeys.add(`manual:${workout.date}:${workout.title}:${workout.durationMin}`);
          }
        }

        let workouts = [...personal.workouts];
        const importedLogs: WorkoutLog[] = [];
        let skipped = 0;

        records.forEach((record, index) => {
          const key = `ext:${record.externalId}`;
          if (existingKeys.has(key)) {
            skipped += 1;
            return;
          }
          existingKeys.add(key);
          const streak = getStreak(workouts);
          const xp = petXpForWorkout(record.durationMin, 0, streak);
          const log: WorkoutLog = {
            id: `w-import-${Date.now()}-${index}`,
            date: record.date,
            title: record.title,
            focus: record.focus,
            durationMin: record.durationMin,
            volume: 0,
            rpe: 6,
            xp,
            exercises: [],
            createdAt: isoDateTimeNow(),
            source: 'import',
            externalId: record.externalId,
            externalType: record.externalType,
            calories: record.calories,
            distanceKm: record.distanceKm,
            steps: record.steps,
            avgHeartRate: record.avgHeartRate,
          };
          workouts.push(log);
          importedLogs.push(log);
        });

        if (importedLogs.length === 0) {
          set({
            toast: {
              id: Date.now(),
              title: '没有新的训练数据',
              message: skipped > 0 ? `跳过了 ${skipped} 条重复记录。` : '请检查文件格式。',
            },
          });
          return { imported: 0, skipped };
        }

        workouts = sortWorkouts(workouts);
        const totalXp = importedLogs.reduce((sum, log) => sum + log.xp, 0);
        const beforeStage = getPetStage(personal.pet.xp).stage;
        const pet: Pet = {
          ...personal.pet,
          xp: personal.pet.xp + totalXp,
          energy: Math.min(100, personal.pet.energy + 8 + importedLogs.length * 2),
          bond: Math.min(100, personal.pet.bond + 2 + importedLogs.length),
          lastSyncDate: todayISO(),
        };
        const afterStage = getPetStage(pet.xp).stage;
        const basePersonal: PersonalData = { ...personal, workouts, pet };
        const { achievements, unlocked } = awardAchievements(
          user.id,
          basePersonal,
          state.posts,
        );
        const accessories = getUnlockedAccessories(afterStage, achievements).map(
          (item) => item.id,
        );
        const evolutions =
          afterStage > beforeStage
            ? [
                ...(personal.pet.evolutions ?? []),
                { stage: afterStage, at: isoDateTimeNow() },
              ]
            : personal.pet.evolutions;
        const finalPet: Pet = {
          ...pet,
          evolutions,
          accessories,
          equipped: pet.equipped.filter((id) => accessories.includes(id)),
        };

        let toast: ToastState;
        if (afterStage > beforeStage) {
          toast = {
            id: Date.now(),
            title: `${finalPet.name} 进化了`,
            message: `导入 ${importedLogs.length} 条记录，现在是「${getPetStage(
              finalPet.xp,
            ).name}」。`,
          };
        } else if (unlocked.length > 0) {
          toast = {
            id: Date.now(),
            title: `解锁成就：${unlocked[0].title}`,
            message: `已导入 ${importedLogs.length} 条训练记录。`,
          };
        } else {
          toast = {
            id: Date.now(),
            title: `已导入 ${importedLogs.length} 条训练记录`,
            message:
              skipped > 0
                ? `跳过 ${skipped} 条重复数据，伙伴获得了 ${totalXp} XP。`
                : `伙伴获得了 ${totalXp} XP。`,
          };
        }

        set((current) => ({
          personal: {
            ...current.personal,
            [user.id]: {
              ...basePersonal,
              pet: finalPet,
              achievements,
            },
          },
          toast,
        }));
        return { imported: importedLogs.length, skipped };
      },

      showToast: (title, message) => {
        set({ toast: { id: Date.now(), title, message } });
      },

      dismissToast: () => set({ toast: null }),
    }),
    {
      name: 'ranpet-store-v1',
      version: 1,
      partialize: (state) => ({
        users: state.users,
        currentUserId: state.currentUserId,
        personal: state.personal,
        posts: state.posts,
      }),
    },
  ),
);
