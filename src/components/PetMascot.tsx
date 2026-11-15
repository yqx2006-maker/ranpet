import type { PetBuilderConfig, PetMood } from '../types';
import { getPetStage } from '../utils/pet';
import { DEFAULT_PET_BUILDER } from '../utils/petBuilder';
import { CustomPet } from './CustomPet';

interface PetMascotProps {
  xp: number;
  mood: PetMood;
  accessories?: string[];
  size?: number;
  className?: string;
}

export function PetMascot({
  xp,
  mood,
  accessories = [],
  size = 240,
  className = '',
}: PetMascotProps) {
  const stage = getPetStage(xp).stage;

  if (stage >= 1) {
    const config: PetBuilderConfig = {
      ...DEFAULT_PET_BUILDER,
      eyes: mood === 'sleepy' ? 'sleepy' : mood === 'energized' ? 'sparkle' : 'dot',
      mouth: mood === 'hungry' ? 'open' : 'smile',
    };
    return (
      <CustomPet
        xp={xp}
        mood={mood}
        builder={config}
        accessories={accessories}
        size={size}
        className={className}
      />
    );
  }

  const has = (id: string) => accessories.includes(id);

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`pet-svg ${className}`}
      role="img"
      aria-label="伙伴 蛋"
    >
      <title>伙伴 蛋</title>
      <ellipse cx="120" cy="212" rx="62" ry="12" fill="var(--pet-shadow)" />
      <g className="pet-bob">
        <path
          d="M120 34 C158 34 184 76 184 124 C184 172 156 202 120 202 C84 202 56 172 56 124 C56 76 82 34 120 34 Z"
          fill="var(--pet-belly)"
          stroke="var(--pet-ink)"
          strokeWidth="4"
        />
        <circle cx="92" cy="88" r="9" fill="var(--pet-body)" opacity="0.85" />
        <circle cx="150" cy="130" r="12" fill="var(--pet-body)" opacity="0.72" />
        <circle cx="108" cy="166" r="6" fill="var(--pet-body)" opacity="0.72" />
        <path
          d="M84 66 L94 78 L86 86 L98 98"
          fill="none"
          stroke="var(--pet-ink)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.22"
        />
        <ellipse cx="103" cy="118" rx="6.4" ry="8" fill="var(--pet-ink)" />
        <ellipse cx="137" cy="118" rx="6.4" ry="8" fill="var(--pet-ink)" />
        <circle cx="100.8" cy="115" r="2.4" fill="var(--pet-belly)" />
        <circle cx="134.8" cy="115" r="2.4" fill="var(--pet-belly)" />
        <path
          d="M112 134 Q120 141 128 134"
          fill="none"
          stroke="var(--pet-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="88" cy="134" r="6" fill="var(--pet-cheek)" opacity="0.7" />
        <circle cx="152" cy="134" r="6" fill="var(--pet-cheek)" opacity="0.7" />
        {has('bandana') ? (
          <g>
            <path
              d="M84 100 Q120 87 156 100 L153 113 Q120 102 87 113 Z"
              fill="var(--pet-teal)"
              stroke="var(--pet-ink)"
              strokeWidth="3"
            />
            <circle
              cx="156"
              cy="103"
              r="4.5"
              fill="var(--pet-teal)"
              stroke="var(--pet-ink)"
              strokeWidth="2"
            />
          </g>
        ) : null}
      </g>
    </svg>
  );
}
