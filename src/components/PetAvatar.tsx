import type { Pet, PetMood } from '../types';
import { CustomPet } from './CustomPet';
import { PetMascot } from './PetMascot';

interface PetAvatarProps {
  pet: Pet;
  mood: PetMood;
  size?: number;
  className?: string;
}

export function PetAvatar({ pet, mood, size = 240, className = '' }: PetAvatarProps) {
  if (pet.customImageMode === 'builder' && pet.customBuilder) {
    return (
      <CustomPet
        xp={pet.xp}
        mood={mood}
        builder={pet.customBuilder}
        accessories={pet.equipped}
        size={size}
        className={className}
      />
    );
  }
  return (
    <PetMascot
      xp={pet.xp}
      mood={mood}
      accessories={pet.equipped}
      size={size}
      className={className}
    />
  );
}
