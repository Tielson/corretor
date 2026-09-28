/**
 * Planta SVG sem interação (renderizada no build). É o fallback da planta
 * interativa e usa os mesmos polígonos cadastrados.
 */
import type { Lot } from '@/types/lot';
import { LOT_STATUS_LABEL, parseViewBox, polygonCentroid, polygonToPath } from '@/lib/lots';

export const LOT_FILL: Record<Lot['status'], string> = {
  disponivel: '#cfe3c9',
  reservado: '#f3dfa3',
  vendido: '#ddd6ce',
  sob_consulta: '#c9d8e5',
};
export const LOT_STROKE: Record<Lot['status'], string> = {
  disponivel: '#2f6b3a',
  reservado: '#8a5a00',
  vendido: '#8a8179',
  sob_consulta: '#37546b',
};

interface Props {
  lots: Lot[];
  viewBox: string;
  title: string;
}

export function PlantaStatic({ lots, viewBox, title }: Props) {
  const vb = parseViewBox(viewBox);
  return (
    <svg viewBox={viewBox} role="img" aria-label={`Planta demonstrativa de ${title}`} className="h-auto w-full">
      <defs>
        <pattern id="hatch-vendido" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#8a8179" strokeWidth="2" opacity="0.35" />
        </pattern>
      </defs>
      <rect x={vb.x} y={vb.y} width={vb.width} height={vb.height} fill="#f3ecdb" />
      <path
        d={`M${vb.x} ${vb.y + vb.height * 0.48} C ${vb.width * 0.35} ${vb.height * 0.47}, ${vb.width * 0.65} ${vb.height * 0.5}, ${vb.x + vb.width} ${vb.y + vb.height * 0.48}`}
        stroke="#e6d8b8"
        strokeWidth={48}
        fill="none"
      />
      {lots.map((lot) => {
        if (!lot.polygon) return null;
        const [cx, cy] = polygonCentroid(lot.polygon);
        const d = polygonToPath(lot.polygon);
        return (
          <g key={lot.id}>
            <path d={d} fill={LOT_FILL[lot.status]} stroke={LOT_STROKE[lot.status]} strokeWidth={2} />
            {lot.status === 'vendido' && <path d={d} fill="url(#hatch-vendido)" />}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize={26} fontWeight={700} fill="#1e3a2b">
              {lot.block ? `${lot.block}-${lot.number}` : lot.number}
            </text>
            <text x={cx} y={cy + 22} textAnchor="middle" fontSize={16} fill="#1b1f1c">
              {LOT_STATUS_LABEL[lot.status]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
