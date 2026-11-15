import {
  Award,
  CalendarCheck,
  Crown,
  Dumbbell,
  Flame,
  Heart,
  MessageCircle,
  PawPrint,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  calendar: CalendarCheck,
  zap: Zap,
  dumbbell: Dumbbell,
  trophy: Trophy,
  trending: TrendingUp,
  timer: Timer,
  target: Target,
  paw: PawPrint,
  crown: Crown,
  message: MessageCircle,
  heart: Heart,
};

interface AchievementIconProps {
  name: string;
  size?: number;
}

export function AchievementIcon({ name, size = 22 }: AchievementIconProps) {
  const Icon = ICONS[name] ?? Award;
  return <Icon size={size} strokeWidth={2.2} />;
}
