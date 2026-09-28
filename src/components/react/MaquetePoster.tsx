/**
 * Pôster 2D da região: curvas de nível do mesmo relevo ilustrativo da maquete
 * 3D, com os pinos dos anúncios. Funciona sem WebGL e sem JavaScript.
 */
import type { ReliefPin } from '@/lib/relief-data';
import { POSTER_H, POSTER_W, shortTitle } from '@/lib/relief-data';
import { cn } from '@/lib/utils';

interface Props {
  contours: Array<{ level: number; d: string }>;
  pins: ReliefPin[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  className?: string;
}

export function MaquetePoster({ contours, pins, activeId = null, onHover, className }: Props) {
  const max = contours.length;
  return (
    <svg
      viewBox={`0 0 ${POSTER_W} ${POSTER_H}`}
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label="Mapa ilustrativo de relevo da região com a posição aproximada dos anúncios"
    >
      <rect width={POSTER_W} height={POSTER_H} fill="#f3ecdb" />
      {contours.map((c) => (
        <path
          key={c.level}
          d={c.d}
          fill="none"
          stroke={c.level % 3 === 0 ? '#3f6b45' : '#7a8f6a'}
          strokeOpacity={0.25 + (0.55 * c.level) / max}
          strokeWidth={c.level % 3 === 0 ? 2.2 : 1.2}
          strokeLinecap="round"
        />
      ))}
      {pins.map((p) => {
        const active = p.id === activeId;
        return (
          <a
            key={p.id}
            href={p.href}
            onMouseEnter={() => onHover?.(p.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(p.id)}
            onBlur={() => onHover?.(null)}
            aria-label={`${p.title}, ${p.place}. ${p.price}`}
          >
            <g transform={`translate(${p.px} ${p.py})`}>
              {p.approximate && <circle r={34} fill="#7b3a24" opacity={0.12} />}
              <circle r={active ? 15 : 11} fill={p.zone === 'rural' ? '#7b3a24' : '#1e3a2b'} stroke="#fcfbf6" strokeWidth={4} />
              <text
                x={p.label.dx}
                y={p.label.dy}
                textAnchor={p.label.anchor}
                fontSize={active ? 26 : 22}
                fontWeight={600}
                fill="#1b1f1c"
                stroke="#f3ecdb"
                strokeWidth={6}
                paintOrder="stroke"
                style={{ fontStretch: '90%' }}
              >
                {shortTitle(p.title)}
              </text>
            </g>
          </a>
        );
      })}
    </svg>
  );
}
