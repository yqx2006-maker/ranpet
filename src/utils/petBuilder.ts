import type { PetBuilderConfig, PetBuilderTail, PetExpression } from '../types';

export const DEFAULT_PET_BUILDER: PetBuilderConfig = {
  shape: 'round',
  ears: 'pointed',
  eyes: 'dot',
  mouth: 'smile',
  tail: 'flame',
  pattern: 'none',
  accessory: 'none',
  primary: 'var(--coral)',
  secondary: 'var(--yellow-soft)',
  rotation: 0,
  expression: 'neutral',
  decorations: [],
};

export interface PetCharacter {
  id: string;
  label: string;
  image: string;
  primary: string;
  secondary: string;
  hasViews?: boolean;
}

export const PET_CHARACTERS: PetCharacter[] = [
  {
    id: 'coral-cat',
    label: '珊瑚猫',
    image: '/pets/views/coral-cat/000.webp?v=2',
    primary: 'var(--coral)',
    secondary: 'var(--yellow-soft)',
    hasViews: true,
  },
  {
    id: 'mint-bear',
    label: '薄荷熊',
    image: '/pets/views/mint-bear/000.webp?v=2',
    primary: 'var(--teal)',
    secondary: 'var(--mint-soft)',
    hasViews: true,
  },
  {
    id: 'lemon-chick',
    label: '柠檬鸡',
    image: '/pets/views/lemon-chick/000.webp?v=2',
    primary: 'var(--yellow)',
    secondary: 'var(--coral-soft)',
    hasViews: true,
  },
  {
    id: 'grape-rabbit',
    label: '葡萄兔',
    image: '/pets/views/grape-rabbit/000.webp?v=2',
    primary: 'var(--lilac)',
    secondary: 'var(--lilac-soft)',
    hasViews: true,
  },
  {
    id: 'sky-dog',
    label: '天空犬',
    image: '/pets/views/sky-dog/000.webp?v=2',
    primary: '#7cb7e8',
    secondary: '#e6f2fb',
    hasViews: true,
  },
  {
    id: 'rose-fox',
    label: '玫瑰狐',
    image: '/pets/views/rose-fox/000.webp?v=2',
    primary: '#e88aa0',
    secondary: '#ffe4ea',
    hasViews: true,
  },
];

export const TAIL_OPTIONS: { value: PetBuilderTail; label: string }[] = [
  { value: 'flame', label: '火焰' },
  { value: 'leaf', label: '叶子' },
  { value: 'curl', label: '卷卷' },
  { value: 'bolt', label: '闪电' },
  { value: 'puff', label: '绒球' },
];

export const PET_DECORATION_GROUPS = [
  {
    slot: 'head',
    label: '头部',
    options: [
      { id: 'crown', label: '皇冠' },
      { id: 'bow', label: '蝴蝶结' },
      { id: 'star-pin', label: '星星夹' },
      { id: 'headband', label: '运动带' },
      { id: 'headphones', label: '耳机' },
      { id: 'flower', label: '小花' },
      { id: 'beanie', label: '毛线帽' },
      { id: 'halo', label: '光环' },
    ],
  },
  {
    slot: 'face',
    label: '脸部',
    options: [
      { id: 'round-glasses', label: '圆眼镜' },
      { id: 'sunglasses', label: '墨镜' },
      { id: 'star-glasses', label: '星星镜' },
      { id: 'sleep-mask', label: '睡眠眼罩' },
      { id: 'blush', label: '腮红' },
    ],
  },
  {
    slot: 'neck',
    label: '颈部',
    options: [
      { id: 'scarf', label: '围巾' },
      { id: 'medal', label: '奖牌' },
      { id: 'bowtie', label: '领结' },
      { id: 'bell', label: '铃铛' },
      { id: 'tie', label: '领带' },
    ],
  },
  {
    slot: 'hand',
    label: '手持',
    options: [
      { id: 'dumbbell', label: '哑铃' },
      { id: 'bottle', label: '水壶' },
      { id: 'heart', label: '爱心' },
    ],
  },
  {
    slot: 'effect',
    label: '氛围',
    options: [
      { id: 'hearts', label: '爱心' },
      { id: 'sparkles', label: '星光' },
      { id: 'fire', label: '火焰' },
      { id: 'sweat', label: '汗滴' },
      { id: 'music', label: '音符' },
      { id: 'zzz', label: '困倦' },
      { id: 'food', label: '饭盆' },
    ],
  },
] as const;

export const EXPRESSION_OPTIONS: { value: PetExpression; label: string }[] = [
  { value: 'neutral', label: '自然' },
  { value: 'happy', label: '开心' },
  { value: 'energized', label: '元气' },
  { value: 'sleepy', label: '困倦' },
  { value: 'hungry', label: '饥饿' },
  { value: 'excited', label: '兴奋' },
  { value: 'proud', label: '骄傲' },
];

export const VIEW_ANGLES = ['000', '045', '090', '135', '180', '225', '270', '315'];

export interface PetDecorationFrame {
  eyeY: number;
  scale: number;
}

// 各伙伴、各形态的眼线与头部比例，用于让贴纸配件贴合对应模型
export const PET_DECORATION_FRAMES: Record<string, Record<number, PetDecorationFrame>> = {
  'coral-cat': {
    1: { eyeY: 87, scale: 1 },
    2: { eyeY: 82, scale: 1.1 },
    3: { eyeY: 89, scale: 1.15 },
    4: { eyeY: 109, scale: 1.07 },
  },
  'mint-bear': {
    1: { eyeY: 82, scale: 1.02 },
    2: { eyeY: 82, scale: 1.1 },
    3: { eyeY: 82, scale: 1.1 },
    4: { eyeY: 100, scale: 1.1 },
  },
  'lemon-chick': {
    1: { eyeY: 99, scale: 1.02 },
    2: { eyeY: 96, scale: 1.06 },
    3: { eyeY: 91, scale: 1.04 },
    4: { eyeY: 112, scale: 0.9 },
  },
  'grape-rabbit': {
    1: { eyeY: 111, scale: 0.88 },
    2: { eyeY: 115, scale: 0.86 },
    3: { eyeY: 122, scale: 0.8 },
    4: { eyeY: 128, scale: 1.02 },
  },
  'sky-dog': {
    1: { eyeY: 80, scale: 1.26 },
    2: { eyeY: 80, scale: 1.3 },
    3: { eyeY: 87, scale: 1.09 },
    4: { eyeY: 103, scale: 1 },
  },
  'rose-fox': {
    1: { eyeY: 91, scale: 1 },
    2: { eyeY: 96, scale: 1.02 },
    3: { eyeY: 83, scale: 1.02 },
    4: { eyeY: 105, scale: 1.15 },
  },
};

export function getDecorationFrame(characterId: string, stage: number): PetDecorationFrame {
  const frames = PET_DECORATION_FRAMES[characterId];
  const fallback: PetDecorationFrame = { eyeY: 104, scale: 1 };
  if (!frames) return fallback;
  return frames[Math.min(4, Math.max(1, stage))] ?? frames[1] ?? fallback;
}

export function getPetAngleImage(
  character: PetCharacter,
  angleIndex: number,
  stage = 1,
): string {
  if (!character.hasViews) return character.image;
  const angle = VIEW_ANGLES[((angleIndex % 8) + 8) % 8];
  const folder = stage >= 4 ? 's4' : stage >= 3 ? 's3' : stage >= 2 ? 's2' : '';
  const base = `/pets/views/${character.id}`;
  return folder
    ? `${base}/${folder}/${angle}.webp`
    : `${base}/${angle}.webp?v=3`;
}

export function getDecorationSlot(decorationId: string): string | null {
  return PET_DECORATION_GROUPS.find((group) =>
    group.options.some((option) => option.id === decorationId),
  )?.slot ?? null;
}

export function getPetCharacter(config: PetBuilderConfig): PetCharacter {
  return PET_CHARACTERS.find((character) => character.primary === config.primary) ?? PET_CHARACTERS[0];
}

export function configForCharacter(
  character: PetCharacter,
  current: PetBuilderConfig = DEFAULT_PET_BUILDER,
): PetBuilderConfig {
  return {
    ...current,
    primary: character.primary,
    secondary: character.secondary,
  };
}

export function randomPetBuilder(): PetBuilderConfig {
  const character = PET_CHARACTERS[Math.floor(Math.random() * PET_CHARACTERS.length)];
  const tail = TAIL_OPTIONS[Math.floor(Math.random() * TAIL_OPTIONS.length)].value;
  return { ...DEFAULT_PET_BUILDER, primary: character.primary, secondary: character.secondary, tail };
}
