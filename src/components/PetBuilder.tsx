import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { PetBuilderConfig, PetExpression } from '../types';
import { getPetAngleImage, getPetCharacter } from '../utils/petBuilder';
import { PetDecorations, PetExpressionLayer } from './PetDecorations';

const ink = 'var(--pet-ink)';

function Tail({ config }: { config: PetBuilderConfig }) {
  const { tail, primary, secondary } = config;
  if (tail === 'leaf') {
    return (
      <g>
        <path d="M170 158 C194 154 207 136 207 116" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
        <path d="M177 150 C193 155 215 139 211 113 C190 115 177 130 177 150 Z" fill={secondary} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M183 145 Q197 129 207 120" fill="none" stroke={ink} strokeWidth="2" opacity="0.35" />
      </g>
    );
  }
  if (tail === 'curl') {
    return (
      <g fill="none" strokeLinecap="round">
        <path d="M170 158 C196 164 211 148 201 135 C193 124 181 132 185 142 C188 149 197 146 197 141" stroke={ink} strokeWidth="12" />
        <path d="M170 158 C196 164 211 148 201 135 C193 124 181 132 185 142 C188 149 197 146 197 141" stroke={primary} strokeWidth="7" />
      </g>
    );
  }
  if (tail === 'bolt') {
    return <path d="M170 142 L202 116 L194 140 L214 143 L184 176 L193 151 L170 156 Z" fill={primary} stroke={ink} strokeWidth="3" strokeLinejoin="round" />;
  }
  if (tail === 'puff') {
    return (
      <path
        d="M174 158 C168 147 177 138 187 141 C190 130 204 129 209 140 C220 140 223 153 214 161 C216 172 202 179 193 171 C182 177 169 169 174 158 Z"
        fill={secondary}
        stroke={ink}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  }
  return (
    <g>
      <path d="M170 158 C194 165 209 149 203 130" fill="none" stroke={ink} strokeWidth="13" strokeLinecap="round" />
      <path d="M170 158 C194 165 209 149 203 130" fill="none" stroke={primary} strokeWidth="8" strokeLinecap="round" />
      <path d="M203 137 C195 128 198 117 205 108 C205 118 214 120 214 128 C214 136 208 141 203 137 Z" fill={primary} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M205 132 C202 127 204 122 207 118 C207 124 211 125 210 130 C209 133 207 134 205 132 Z" fill={secondary} opacity="0.7" />
    </g>
  );
}

interface PetBuilderProps {
  config: PetBuilderConfig;
  size?: number;
  className?: string;
  showShadow?: boolean;
  interactive?: boolean;
  expression?: PetExpression;
  stage?: number;
  onRotationChange?: (angle: number) => void;
}

export function PetBuilder({
  config,
  size = 240,
  className = '',
  showShadow = true,
  interactive = false,
  expression,
  stage = 1,
  onRotationChange,
}: PetBuilderProps) {
  const character = getPetCharacter(config);
  const [angle, setAngle] = useState(config.rotation ?? 0);
  const angleRef = useRef(angle);
  const frameRef = useRef<number | null>(null);
  const drag = useRef({ active: false, startX: 0, startAngle: 0, lastX: 0, velocity: 0 });
  const angleIndex = ((Math.round(angle) % 8) + 8) % 8;
  const image = getPetAngleImage(character, angleIndex, stage);
  const activeExpression = expression ?? config.expression ?? 'neutral';
  const canRotate = interactive && character.hasViews;

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(() => {
    if (!character.hasViews) return;
    for (let index = 0; index < 8; index += 1) {
      const preload = new Image();
      preload.src = getPetAngleImage(character, index, stage);
    }
  }, [character, stage]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const applyAngle = (next: number) => {
    angleRef.current = next;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setAngle(angleRef.current);
    });
  };

  const commitAngle = (next: number) => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    angleRef.current = next;
    setAngle(next);
    onRotationChange?.(((next % 8) + 8) % 8);
  };

  const spin = (step: number) => {
    commitAngle(Math.round(angleRef.current) + step);
  };

  const finishDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (event.isTrusted && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const momentum = Math.max(-2, Math.min(2, drag.current.velocity * 3));
    commitAngle(Math.round(angleRef.current + momentum));
  };

  return (
    <svg
      className={`pet-builder pet-illustrated${canRotate ? ' pet-rotatable' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${character.label}，${angleIndex * 45} 度`}
      tabIndex={canRotate ? 0 : undefined}
      onDoubleClick={canRotate ? () => commitAngle(0) : undefined}
      onKeyDown={
        canRotate
          ? (event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              spin(event.key === 'ArrowRight' ? 1 : -1);
            }
          : undefined
      }
      onPointerDown={
        canRotate
          ? (event) => {
              if (event.isTrusted) event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                active: true,
                startX: event.clientX,
                startAngle: angleRef.current,
                lastX: event.clientX,
                velocity: 0,
              };
            }
          : undefined
      }
      onPointerMove={
        canRotate
          ? (event) => {
              if (!drag.current.active) return;
              const delta = (event.clientX - drag.current.startX) / 46;
              drag.current.velocity = (event.clientX - drag.current.lastX) / 46;
              drag.current.lastX = event.clientX;
              applyAngle(drag.current.startAngle + delta);
            }
          : undefined
      }
      onPointerUp={canRotate ? finishDrag : undefined}
      onPointerCancel={canRotate ? finishDrag : undefined}
    >
      <title>{canRotate ? '拖动旋转，双击回正，左右方向键切换角度' : character.label}</title>
      {canRotate ? <rect x="0" y="0" width="240" height="240" fill="transparent" pointerEvents="all" /> : null}
      {showShadow ? <ellipse cx="120" cy="218" rx="57" ry="9" fill={ink} opacity="0.12" /> : null}
      <g className="pet-tail">
        <Tail config={config} />
      </g>
      <image
        key={image}
        className="pet-illustration pet-view"
        href={image}
        x="15"
        y="8"
        width="210"
        height="210"
        preserveAspectRatio="xMidYMid meet"
        pointerEvents="none"
      />
      <PetExpressionLayer expression={activeExpression} angleIndex={angleIndex} />
      <PetDecorations
        ids={config.decorations ?? []}
        angleIndex={angleIndex}
        characterId={character.id}
        stage={stage}
      />
    </svg>
  );
}
