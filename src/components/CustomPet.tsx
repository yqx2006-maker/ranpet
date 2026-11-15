import type { PetBuilderConfig, PetMood } from '../types';
import { getPetStage } from '../utils/pet';
import { PetBuilder } from './PetBuilder';

interface CustomPetProps {
  xp: number;
  mood: PetMood;
  builder: PetBuilderConfig;
  accessories?: string[];
  size?: number;
  className?: string;
}

function MoodBadge({ mood }: { mood: PetMood }) {
  if (mood === 'sleepy') {
    return (
      <g transform="translate(174 158)">
        <circle r="12" fill="var(--surface)" stroke="var(--pet-ink)" strokeWidth="2.5" />
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="var(--pet-ink)"
          fontSize="12"
          fontWeight="800"
          fontFamily="var(--font-body)"
        >
          Z
        </text>
      </g>
    );
  }
  if (mood === 'hungry') {
    return (
      <g transform="translate(174 158)">
        <circle r="12" fill="var(--coral-soft)" stroke="var(--pet-ink)" strokeWidth="2.5" />
        <circle cx="0" cy="1" r="5" fill="var(--coral)" stroke="var(--pet-ink)" strokeWidth="1.5" />
        <path
          d="M2 -4 Q6 -8 8 -3"
          fill="none"
          stroke="var(--pet-teal)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (mood === 'energized') {
    return (
      <g transform="translate(174 158)">
        <circle r="12" fill="var(--yellow)" stroke="var(--pet-ink)" strokeWidth="2.5" />
        <path d="M1 -7 L-4 1 L0 1 L-1 7 L5 -2 L1 -2 Z" fill="var(--pet-ink)" />
      </g>
    );
  }
  return (
    <g transform="translate(174 158)">
      <circle r="12" fill="var(--yellow)" stroke="var(--pet-ink)" strokeWidth="2.5" />
      <path d="M0 5 C-7 -1 -6 -8 0 -5 C6 -8 7 -1 0 5 Z" fill="var(--coral-dark)" stroke="var(--pet-ink)" strokeWidth="1.5" />
    </g>
  );
}

export function CustomPet({
  xp,
  mood,
  builder,
  accessories = [],
  size = 240,
  className = '',
}: CustomPetProps) {
  const { stage, name: stageName } = getPetStage(xp);
  const has = (id: string) => accessories.includes(id);
  const label = `自建伙伴 ${stageName}`;

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`pet-svg ${className}`}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <ellipse cx="120" cy="212" rx="62" ry="12" fill="var(--pet-shadow)" />

      <g className="pet-bob">
        {has('cape') ? (
          <g>
            <path
              d="M82 92 C60 122 52 162 64 198 L102 186 C90 156 94 126 106 102 Z"
              fill="var(--pet-teal)"
              stroke="var(--pet-ink)"
              strokeWidth="3"
            />
            <path
              d="M158 92 C180 122 188 162 176 198 L138 186 C150 156 146 126 134 102 Z"
              fill="var(--pet-teal)"
              stroke="var(--pet-ink)"
              strokeWidth="3"
            />
          </g>
        ) : null}

        <PetBuilder
          config={builder}
          size={240}
          showShadow={false}
          expression={mood}
          stage={stage}
          interactive
        />

        {has('bandana') ? (
          <g>
            <path
              d="M84 150 Q120 160 156 150 L153 163 Q120 173 87 163 Z"
              fill="var(--pet-teal)"
              stroke="var(--pet-ink)"
              strokeWidth="3"
            />
            <circle cx="156" cy="157" r="4.5" fill="var(--pet-teal)" stroke="var(--pet-ink)" strokeWidth="2" />
            <path d="M158 159 L174 153 L169 165 Z" fill="var(--pet-teal)" stroke="var(--pet-ink)" strokeWidth="2" />
          </g>
        ) : null}

        {has('medal') ? (
          <g>
            <path
              d="M112 154 L120 164 L128 154"
              fill="none"
              stroke="var(--pet-teal)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="120" cy="174" r="11" fill="var(--pet-yellow)" stroke="var(--pet-ink)" strokeWidth="3" />
            <path
              d="M120 168 L122.2 172.6 L127.4 173.1 L123.7 176.5 L124.6 181.5 L120 179 L115.4 181.5 L116.3 176.5 L112.6 173.1 L117.8 172.6 Z"
              fill="var(--pet-ink)"
            />
          </g>
        ) : null}

        {has('crown') ? (
          <path
            d="M94 34 L102 12 L112 26 L120 6 L128 26 L138 12 L146 34 Z"
            fill="var(--pet-yellow)"
            stroke="var(--pet-ink)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ) : null}

        <MoodBadge mood={mood} />

        {stage >= 4 ? (
          <g className="pet-sparkles">
            <path
              className="pet-sparkle"
              d="M54 58 L58 68 L68 72 L58 76 L54 86 L50 76 L40 72 L50 68 Z"
              fill="var(--pet-yellow)"
            />
            <path
              className="pet-sparkle"
              style={{ animationDelay: '0.8s' }}
              d="M190 70 L193 77 L200 80 L193 83 L190 90 L187 83 L180 80 L187 77 Z"
              fill="var(--pet-yellow)"
            />
            <path
              className="pet-sparkle"
              style={{ animationDelay: '1.4s' }}
              d="M44 160 L47 167 L54 170 L47 173 L44 180 L41 173 L34 170 L41 167 Z"
              fill="var(--pet-yellow)"
            />
          </g>
        ) : null}
      </g>

      {has('dumbbell-charm') ? (
        <g transform="translate(204 106) rotate(-18)">
          <rect x="-12" y="-3" width="24" height="6" rx="3" fill="var(--pet-ink)" />
          <rect x="-19" y="-11" width="8" height="22" rx="3" fill="var(--pet-yellow)" stroke="var(--pet-ink)" strokeWidth="2" />
          <rect x="11" y="-11" width="8" height="22" rx="3" fill="var(--pet-yellow)" stroke="var(--pet-ink)" strokeWidth="2" />
        </g>
      ) : null}
    </svg>
  );
}
