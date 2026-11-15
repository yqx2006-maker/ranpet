import type { Exercise } from '../types';
import { exerciseVisual } from '../utils/exerciseMedia';
import { ExerciseIllustration } from './ExerciseIllustration';

export function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  if (exercise.imageUrl) {
    return (
      <div className="exercise-photo">
        <img
          src={exercise.imageUrl}
          alt={`${exercise.name} 动作示范`}
          loading="lazy"
        />
        {exercise.imageUrl2 ? (
          <img
            className="exercise-photo-alt"
            src={exercise.imageUrl2}
            alt=""
            loading="lazy"
          />
        ) : null}
      </div>
    );
  }
  return <ExerciseIllustration category={exerciseVisual(exercise)} />;
}
