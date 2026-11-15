import type { PetExpression } from '../types';
import { getDecorationFrame } from '../utils/petBuilder';

const ink = 'var(--pet-ink)';
const sticker = { stroke: ink, strokeWidth: 2.2, strokeLinejoin: 'round' as const };

function HeadPiece({ id }: { id: string }) {
  switch (id) {
    case 'crown':
      return (
        <path
          d="M104 48 L102 28 L112 35 L120 24 L128 35 L138 28 L136 48 Z"
          fill="var(--pet-yellow)"
          {...sticker}
        />
      );
    case 'bow':
      return (
        <g fill="#e88aa0" {...sticker}>
          <path d="M150 46 C141 35 130 38 134 48 C137 55 145 52 150 46 Z" />
          <path d="M150 46 C159 35 170 38 166 48 C163 55 155 52 150 46 Z" />
          <circle cx="150" cy="46" r="4" />
        </g>
      );
    case 'star-pin':
      return (
        <path
          d="M152 46 L155 53 L163 54 L157 59 L159 67 L152 63 L145 67 L147 59 L141 54 L149 53 Z"
          fill="var(--pet-yellow)"
          {...sticker}
        />
      );
    case 'headband':
      return (
        <path
          d="M82 72 Q120 52 158 72 L154 82 Q120 65 86 82 Z"
          fill="var(--pet-teal)"
          {...sticker}
        />
      );
    case 'flower':
      return (
        <g fill="#ffe4ea" {...sticker}>
          <circle cx="146" cy="48" r="7" />
          <circle cx="155" cy="54" r="7" />
          <circle cx="150" cy="64" r="7" />
          <circle cx="140" cy="60" r="7" />
          <circle cx="139" cy="50" r="7" />
          <circle cx="146" cy="55" r="5" fill="var(--pet-yellow)" />
        </g>
      );
    case 'halo':
      return (
        <ellipse
          cx="120"
          cy="36"
          rx="29"
          ry="7.5"
          fill="none"
          stroke="var(--pet-yellow)"
          strokeWidth="4.5"
        />
      );
    default:
      return null;
  }
}

function HeadphonesPiece({ eyeY, headW, dx }: { eyeY: number; headW: number; dx: number }) {
  const s = headW / 130;
  const cupW = Math.max(12, headW * 0.11);
  const cupH = cupW * 1.9;
  const cupCx = headW / 2 - cupW / 2 - 3;
  const cupCy = eyeY - 8;
  const archTop = eyeY - 56;
  const foot = cupCy - cupH / 2 + 4;

  return (
    <g
      transform={`translate(${dx} 0)`}
      fill="var(--pet-lilac)"
      stroke={ink}
      strokeWidth={2.2 * s}
      strokeLinejoin="round"
    >
      <path
        d={`M${120 - cupCx} ${foot} Q120 ${archTop} ${120 + cupCx} ${foot}`}
        fill="none"
        strokeWidth={Math.max(4, 6 * s)}
        strokeLinecap="round"
      />
      <rect
        x={120 - cupCx - cupW / 2}
        y={cupCy - cupH / 2}
        width={cupW}
        height={cupH}
        rx={cupW / 2}
      />
      <rect
        x={120 + cupCx - cupW / 2}
        y={cupCy - cupH / 2}
        width={cupW}
        height={cupH}
        rx={cupW / 2}
      />
    </g>
  );
}

function BeaniePiece({ eyeY, headW, dx }: { eyeY: number; headW: number; dx: number }) {
  const s = headW / 130;
  const half = headW * 0.4;
  const top = eyeY - 64;
  const bottom = eyeY - 18;
  const band = 9 * s;

  return (
    <g
      transform={`translate(${dx} 0)`}
      stroke={ink}
      strokeWidth={2.2 * s}
      strokeLinejoin="round"
    >
      <path
        d={`M${120 - half} ${bottom} Q${120 - half} ${top} 120 ${top} Q${120 + half} ${top} ${120 + half} ${bottom} Z`}
        fill="var(--pet-coral)"
      />
      <path
        d={`M${120 - half - 1} ${bottom - band} Q120 ${bottom - band * 1.9} ${120 + half + 1} ${bottom - band} L${120 + half} ${bottom} Q120 ${bottom - band * 0.7} ${120 - half} ${bottom} Z`}
        fill="var(--surface)"
      />
      <circle cx="120" cy={top - 5 * s} r={7 * s} fill="var(--surface)" />
    </g>
  );
}

function FacePiece({ id }: { id: string }) {
  switch (id) {
    case 'round-glasses':
      return (
        <g fill="none" stroke={ink} strokeWidth="3">
          <circle cx="100" cy="104" r="14" />
          <circle cx="140" cy="104" r="14" />
          <path d="M114 102 Q120 99 126 102 M86 101 L78 98 M154 101 L162 98" />
        </g>
      );
    case 'sunglasses':
      return (
        <g fill={ink} stroke={ink} strokeWidth="2.4">
          <path d="M82 96 Q100 91 114 98 L111 110 Q97 121 86 108 Z" />
          <path d="M126 98 Q140 91 158 96 L154 108 Q143 121 129 110 Z" />
          <path d="M114 99 L126 99" fill="none" />
        </g>
      );
    case 'star-glasses':
      return (
        <g fill="var(--pet-yellow)" {...sticker}>
          <path d="M100 90 L104 98 L113 99 L106 106 L108 115 L100 110 L92 115 L94 106 L87 99 L96 98 Z" />
          <path d="M140 90 L144 98 L153 99 L146 106 L148 115 L140 110 L132 115 L134 106 L127 99 L136 98 Z" />
          <path d="M112 102 L128 102" fill="none" />
        </g>
      );
    case 'sleep-mask':
      return (
        <g {...sticker}>
          <path d="M80 96 Q120 88 160 96 L158 112 Q120 122 82 112 Z" fill="var(--pet-lilac)" />
          <path d="M95 106 Q100 110 105 106 M135 106 Q140 110 145 106" fill="none" stroke={ink} strokeWidth="2.4" />
        </g>
      );
    case 'blush':
      return (
        <g fill="#ffb3c1" opacity="0.75">
          <ellipse cx="90" cy="118" rx="9" ry="5" />
          <ellipse cx="150" cy="118" rx="9" ry="5" />
        </g>
      );
    default:
      return null;
  }
}

function NeckPiece({ id }: { id: string }) {
  switch (id) {
    case 'scarf':
      return (
        <g fill="var(--pet-teal)" {...sticker}>
          <path d="M88 140 Q120 150 152 140 L150 152 Q120 162 90 152 Z" />
          <path d="M143 149 L156 168 L146 171 L136 153 Z" />
        </g>
      );
    case 'medal':
      return (
        <g {...sticker}>
          <path d="M105 140 L114 158 L126 158 L135 140" fill="none" stroke="var(--pet-coral)" strokeWidth="5" />
          <circle cx="120" cy="162" r="10" fill="var(--pet-yellow)" />
          <path d="M120 156 L122 160 L127 161 L123 164 L124 169 L120 166 L116 169 L117 164 L113 161 L118 160 Z" fill={ink} stroke="none" />
        </g>
      );
    case 'bowtie':
      return (
        <g fill="var(--pet-coral)" {...sticker}>
          <path d="M120 146 L103 138 L103 154 Z" />
          <path d="M120 146 L137 138 L137 154 Z" />
          <circle cx="120" cy="146" r="4.5" />
        </g>
      );
    case 'bell':
      return (
        <g {...sticker}>
          <path d="M92 140 Q120 148 148 140 L147 148 Q120 156 93 148 Z" fill="var(--pet-coral)" />
          <circle cx="120" cy="154" r="6" fill="var(--pet-yellow)" />
          <path d="M120 149 L120 159" stroke={ink} strokeWidth="1.6" />
        </g>
      );
    case 'tie':
      return (
        <g {...sticker}>
          <path d="M112 140 L128 140 L126 146 L114 146 Z" fill="var(--pet-teal)" />
          <path d="M116 146 L124 146 L127 162 L120 168 L113 162 Z" fill="var(--pet-teal)" />
        </g>
      );
    default:
      return null;
  }
}

function HandPiece({ id }: { id: string }) {
  switch (id) {
    case 'dumbbell':
      return (
        <g fill="var(--pet-lilac)" {...sticker} transform="rotate(-14 168 160)">
          <rect x="153" y="156" width="30" height="7" rx="3.5" />
          <rect x="151" y="149" width="8" height="21" rx="3" />
          <rect x="177" y="149" width="8" height="21" rx="3" />
        </g>
      );
    case 'bottle':
      return (
        <g {...sticker}>
          <rect x="160" y="150" width="11" height="22" rx="4" fill="#7cb7e8" />
          <rect x="162" y="144" width="7" height="7" rx="2" fill="var(--pet-yellow)" />
          <path d="M163 159 L168 159 M163 164 L168 164" stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case 'heart':
      return (
        <path
          d="M168 168 C162 158 150 164 155 173 L168 185 L181 173 C186 164 174 158 168 168 Z"
          fill="#e88aa0"
          {...sticker}
        />
      );
    default:
      return null;
  }
}

function EffectPiece({ id }: { id: string }) {
  switch (id) {
    case 'hearts':
      return (
        <g fill="#e88aa0" {...sticker}>
          <path d="M62 78 C57 70 47 74 51 81 L62 92 L73 81 C77 74 67 70 62 78 Z" />
          <path d="M176 96 C172 90 164 93 167 99 L176 108 L185 99 C188 93 180 90 176 96 Z" />
        </g>
      );
    case 'sparkles':
      return (
        <g fill="var(--pet-yellow)" {...sticker}>
          <path d="M58 74 L62 84 L72 88 L62 92 L58 102 L54 92 L44 88 L54 84 Z" />
          <path d="M184 128 L187 135 L194 138 L187 141 L184 148 L181 141 L174 138 L181 135 Z" />
          <path d="M168 60 L170 66 L176 68 L170 70 L168 76 L166 70 L160 68 L166 66 Z" />
        </g>
      );
    case 'fire':
      return (
        <path
          d="M58 146 C46 135 54 126 55 116 C61 123 64 121 65 110 C78 126 76 140 66 148 Z"
          fill="var(--pet-coral)"
          {...sticker}
        />
      );
    case 'sweat':
      return (
        <g fill="#7cb7e8" {...sticker}>
          <path d="M172 88 C166 97 166 104 172 107 C178 104 178 97 172 88 Z" />
          <path d="M183 100 C179 106 179 111 183 113 C187 111 187 106 183 100 Z" />
        </g>
      );
    case 'music':
      return (
        <g fill="var(--pet-lilac)" {...sticker}>
          <path d="M170 66 L170 88 M170 66 L182 63 L182 83" fill="none" strokeWidth="3" />
          <ellipse cx="165" cy="90" rx="6" ry="4.5" />
          <ellipse cx="177" cy="85" rx="6" ry="4.5" />
        </g>
      );
    case 'zzz':
      return (
        <g fill="var(--pet-lilac)" stroke={ink} strokeWidth="1.6">
          <text x="166" y="76" fontSize="16" fontWeight="800">Z</text>
          <text x="180" y="62" fontSize="12" fontWeight="800">z</text>
        </g>
      );
    case 'food':
      return (
        <g {...sticker}>
          <path d="M162 178 L196 178 L192 192 L166 192 Z" fill="var(--pet-yellow)" />
          <path d="M168 178 Q179 170 190 178" fill="var(--pet-coral)" />
        </g>
      );
    default:
      return null;
  }
}

const FACE_DECORATIONS = ['round-glasses', 'sunglasses', 'star-glasses', 'sleep-mask', 'blush'];
const HEAD_DECORATIONS = [
  'crown',
  'bow',
  'star-pin',
  'headband',
  'headphones',
  'flower',
  'beanie',
  'halo',
];
const NECK_DECORATIONS = ['scarf', 'medal', 'bowtie', 'bell', 'tie'];
const HAND_DECORATIONS = ['dumbbell', 'bottle', 'heart'];

export function PetDecorations({
  ids,
  angleIndex,
  characterId,
  stage,
}: {
  ids: string[];
  angleIndex: number;
  characterId: string;
  stage: number;
}) {
  const front = angleIndex === 0 || angleIndex === 1 || angleIndex === 7;
  const side = angleIndex === 2 || angleIndex === 6;
  const dx = angleIndex === 1 || angleIndex === 2 ? 6 : angleIndex === 6 || angleIndex === 7 ? -6 : 0;
  const frame = getDecorationFrame(characterId, stage);
  const headW = 130 * frame.scale;
  const showHeadwear = front || side;

  return (
    <>
      <g
        pointerEvents="none"
        transform={`translate(0 ${(frame.eyeY - 104).toFixed(1)}) translate(120 104) scale(${frame.scale}) translate(-120 -104)`}
      >
        {ids.map((id) => {
          if (id === 'headphones' || id === 'beanie') return null;
          if (FACE_DECORATIONS.includes(id)) {
            return front ? <FacePiece key={id} id={id} /> : null;
          }
          if (HEAD_DECORATIONS.includes(id)) {
            return front || side ? (
              <g key={id} transform={`translate(${dx} 0)`}>
                <HeadPiece id={id} />
              </g>
            ) : null;
          }
          if (NECK_DECORATIONS.includes(id)) {
            return front || side ? (
              <g key={id} transform={`translate(${dx * 0.6} 0)`}>
                <NeckPiece id={id} />
              </g>
            ) : null;
          }
          if (HAND_DECORATIONS.includes(id)) {
            return front || side ? (
              <g key={id} transform={`translate(${dx * 0.5} 0)`}>
                <HandPiece id={id} />
              </g>
            ) : null;
          }
          return <EffectPiece key={id} id={id} />;
        })}
      </g>
      {showHeadwear && ids.includes('beanie') ? (
        <BeaniePiece eyeY={frame.eyeY} headW={headW} dx={dx} />
      ) : null}
      {showHeadwear && ids.includes('headphones') ? (
        <HeadphonesPiece eyeY={frame.eyeY} headW={headW} dx={dx} />
      ) : null}
    </>
  );
}

const EMOTE_ICONS: Record<Exclude<PetExpression, 'neutral'>, string> = {
  happy: 'M-7 2 Q0 9 7 2',
  energized: 'M-8 0 L-3 -6 L0 0 L4 -6 L8 0',
  sleepy: 'M-8 -3 Q-4 2 0 -3 M2 -3 Q6 2 10 -3',
  hungry: 'M-7 -3 Q0 8 7 -3',
  excited: 'M-8 -5 L-5 1 L1 1 L-3 5 L-2 11 L-8 7 L-14 11 L-13 5 L-17 1 L-11 1 Z',
  proud: 'M-8 1 Q0 -5 8 1',
};

export function PetExpressionLayer({
  expression,
  angleIndex,
}: {
  expression: PetExpression;
  angleIndex: number;
}) {
  if (angleIndex === 3 || angleIndex === 4 || angleIndex === 5) return null;
  if (expression === 'neutral') return null;

  const heart = expression === 'happy';
  const fill = expression === 'excited' ? 'var(--pet-yellow)' : 'var(--surface)';

  return (
    <g className={`pet-emote emote-${expression}`} pointerEvents="none">
      <path d="M45 72 L54 66 L51 78 Z" fill={fill} stroke={ink} strokeWidth="1.8" />
      <circle cx="45" cy="58" r="12" fill={fill} stroke={ink} strokeWidth="2.2" />
      <g
        transform="translate(45 58) scale(0.8)"
        fill={expression === 'excited' ? ink : 'none'}
        stroke={ink}
        strokeWidth="2.8"
        strokeLinecap="round"
      >
        {heart ? (
          <path d="M0 7 C-9 -3 -14 3 -8 9 L0 15 L8 9 C14 3 9 -3 0 7 Z" fill="#e88aa0" />
        ) : (
          <path d={EMOTE_ICONS[expression]} />
        )}
      </g>
      {expression === 'excited' ? (
        <path
          d="M26 30 L27.5 34 L31 35.5 L27.5 37 L26 41 L24.5 37 L21 35.5 L24.5 34 Z"
          fill="var(--pet-yellow)"
          stroke={ink}
          strokeWidth="1.2"
        />
      ) : null}
    </g>
  );
}
