import type { ExerciseVisual } from '../utils/exerciseMedia';

const line = {
  fill: 'none',
  stroke: 'var(--ink)',
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const softLine = {
  ...line,
  stroke: 'var(--teal)',
  strokeWidth: 3.5,
  opacity: 0.65,
};

function Head({ x, y }: { x: number; y: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r="9"
      fill="var(--surface)"
      stroke="var(--ink)"
      strokeWidth="4"
    />
  );
}

function Ground() {
  return (
    <path
      d="M38 104 H122"
      fill="none"
      stroke="var(--ink)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="5 6"
      opacity="0.25"
    />
  );
}

function Dumbbell({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-10" y="-2" width="20" height="4" rx="2" fill="var(--ink)" />
      <rect
        x="-15"
        y="-7"
        width="6"
        height="14"
        rx="2"
        fill="var(--coral)"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
      <rect
        x="9"
        y="-7"
        width="6"
        height="14"
        rx="2"
        fill="var(--coral)"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
    </g>
  );
}

function Spark() {
  return (
    <path
      d="M126 24 L129 32 L137 35 L129 38 L126 46 L123 38 L115 35 L123 32 Z"
      fill="var(--yellow)"
      opacity="0.9"
    />
  );
}

function Body({ category }: { category: ExerciseVisual }) {
  if (category === 'squat') {
    return (
      <>
        <Head x={70} y={30} />
        <path d="M73 41 L82 70" {...line} />
        <path d="M82 70 L64 84 L56 102" {...line} />
        <path d="M82 70 L96 82 L92 102" {...softLine} />
        <path d="M76 47 L90 56 L96 60" {...line} />
        <path d="M79 48 L88 58" {...line} />
        <Dumbbell x={103} y={60} />
        <Ground />
      </>
    );
  }

  if (category === 'hinge') {
    return (
      <>
        <Head x={108} y={34} />
        <path d="M101 43 L66 68" {...line} />
        <path d="M66 68 L60 88 L54 104" {...line} />
        <path d="M66 68 L78 90 L74 104" {...softLine} />
        <path d="M96 48 L82 78" {...line} />
        <Dumbbell x={76} y={84} />
        <Ground />
      </>
    );
  }

  if (category === 'push') {
    return (
      <>
        <Head x={46} y={58} />
        <path d="M55 64 L106 84" {...line} />
        <path d="M106 84 L126 96" {...line} />
        <path d="M106 84 L122 102" {...softLine} />
        <path d="M60 68 L58 88 L74 102" {...line} />
        <path d="M66 70 L66 90 L82 102" {...softLine} />
        <Ground />
      </>
    );
  }

  if (category === 'pull') {
    return (
      <>
        <path d="M48 22 H112" {...line} />
        <path d="M54 22 V34" {...line} strokeWidth="3" />
        <path d="M106 22 V34" {...line} strokeWidth="3" />
        <Head x={80} y={50} />
        <path d="M80 60 L80 86" {...line} />
        <path d="M80 86 L70 102" {...line} />
        <path d="M80 86 L94 98" {...softLine} />
        <path d="M74 60 L58 24" {...line} />
        <path d="M86 60 L102 24" {...line} />
        <path d="M118 58 L122 50 L126 58" fill="none" stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="80" cy="112" rx="26" ry="5" fill="var(--pet-shadow)" />
      </>
    );
  }

  if (category === 'lunge') {
    return (
      <>
        <Head x={78} y={28} />
        <path d="M80 39 L84 68" {...line} />
        <path d="M84 68 L64 82 L56 104" {...line} />
        <path d="M84 68 L104 86 L116 104" {...softLine} />
        <path d="M80 46 L66 62" {...line} />
        <path d="M84 46 L98 62" {...line} />
        <Dumbbell x={60} y={64} />
        <Dumbbell x={104} y={64} />
        <Ground />
      </>
    );
  }

  if (category === 'core') {
    return (
      <>
        <Head x={42} y={62} />
        <path d="M52 68 L104 86" {...line} />
        <path d="M104 86 L128 96" {...line} />
        <path d="M104 86 L122 102" {...softLine} />
        <path d="M58 72 L58 90 L78 102" {...line} />
        <path d="M66 74 L66 92 L86 102" {...softLine} />
        <path d="M56 64 H108" fill="none" stroke="var(--coral)" strokeWidth="2" strokeDasharray="4 5" opacity="0.5" />
        <Ground />
      </>
    );
  }

  if (category === 'cardio') {
    return (
      <>
        <Head x={80} y={26} />
        <path d="M80 37 L80 64" {...line} />
        <path d="M80 46 L52 26" {...line} />
        <path d="M80 46 L108 26" {...line} />
        <path d="M80 64 L58 102" {...line} />
        <path d="M80 64 L102 102" {...softLine} />
        <path d="M42 54 L32 48" fill="none" stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" />
        <path d="M118 54 L128 48" fill="none" stroke="var(--coral)" strokeWidth="3" strokeLinecap="round" />
        <Ground />
      </>
    );
  }

  return (
    <>
      <path d="M62 98 L118 98" fill="none" stroke="var(--teal)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <Head x={58} y={48} />
      <path d="M62 58 L74 84" {...line} />
      <path d="M74 84 L104 94 L126 88" {...line} />
      <path d="M66 64 L118 88" {...line} />
      <path d="M74 84 L96 72 L108 90" {...softLine} />
      <path d="M78 58 Q98 48 112 64" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeDasharray="4 5" opacity="0.6" />
      <Ground />
    </>
  );
}

interface ExerciseIllustrationProps {
  category: ExerciseVisual;
  className?: string;
}

export function ExerciseIllustration({ category, className = '' }: ExerciseIllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={`exercise-illustration ${className}`}
      role="img"
      aria-label={`${category} 动作示意图`}
    >
      <circle cx="80" cy="60" r="46" fill="var(--surface)" opacity="0.28" />
      <Spark />
      <Body category={category} />
    </svg>
  );
}
