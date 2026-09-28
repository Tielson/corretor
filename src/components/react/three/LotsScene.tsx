/**
 * Maquete 3D dos lotes: extrusão dos polígonos cadastrados (os mesmos da
 * planta SVG). Carregada sob demanda quando o visitante escolhe a aba 3D.
 * Alturas são expressivas, não topográficas.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Lot } from '@/types/lot';
import { parseViewBox, polygonCentroid } from '@/lib/lots';
import { formatArea } from '@/lib/area';
import { LOT_FILL, LOT_STROKE } from '../PlantaStatic';

interface Props {
  lots: Lot[];
  viewBox: string;
  selectedId: string | null;
  hoverId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const SCALE = 0.01; // 1000 unidades do SVG = 10 unidades na cena
const HEIGHT: Record<Lot['status'], number> = { disponivel: 0.34, sob_consulta: 0.26, reservado: 0.2, vendido: 0.08 };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function LotMesh({
  lot,
  vb,
  selected,
  hovered,
  onSelect,
  onHover,
  intro,
}: {
  lot: Lot;
  vb: ReturnType<typeof parseViewBox>;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  intro: React.RefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const cx = vb.x + vb.width / 2;
  const cy = vb.y + vb.height / 2;

  const geometry = useMemo(() => {
    const pts = lot.polygon ?? [];
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2((x - cx) * SCALE, -(y - cy) * SCALE)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 });
    geo.rotateX(-Math.PI / 2); // deita a peça: a extrusão passa a crescer em Y
    return geo;
  }, [lot.polygon, cx, cy]);

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 30), [geometry]);
  const target = HEIGHT[lot.status] + (selected ? 0.28 : hovered ? 0.1 : 0);
  const color = useMemo(() => new THREE.Color(LOT_FILL[lot.status]), [lot.status]);
  const stroke = useMemo(() => new THREE.Color(selected ? '#1e3a2b' : LOT_STROKE[lot.status]), [lot.status, selected]);

  const invalidate = useThree((st) => st.invalidate);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const goal = Math.max(0.001, target * (intro.current ?? 1));
    const next = THREE.MathUtils.damp(g.scale.y, goal, 10, dt);
    g.scale.y = Math.abs(next - goal) < 0.001 ? goal : next;
    // Renderização sob demanda: pede novo quadro só enquanto a peça se move.
    if (g.scale.y !== goal) invalidate();
  });

  const [lx, ly] = polygonCentroid(lot.polygon ?? [[0, 0]]);
  const label = lot.block ? `${lot.block}-${lot.number}` : lot.number;

  return (
    <group>
      <group ref={group} scale={[1, 0.001, 1]}>
        <mesh
          geometry={geometry}
          castShadow
          receiveShadow
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect(lot.id);
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(lot.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            onHover(null);
            document.body.style.cursor = '';
          }}
        >
          <meshStandardMaterial color={color} roughness={0.85} metalness={0} emissive={selected ? '#1e3a2b' : '#000000'} emissiveIntensity={selected ? 0.12 : 0} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={stroke} />
        </lineSegments>
      </group>
      <Html
        position={[(lx - cx) * SCALE, target + 0.12, (ly - cy) * SCALE]}
        center
        zIndexRange={[20, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <span
          className="type-data whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-[640]"
          style={{
            background: selected ? '#1e3a2b' : 'rgba(252,251,246,.88)',
            color: selected ? '#fcfbf6' : '#1e3a2b',
            textDecoration: lot.status === 'vendido' ? 'line-through' : undefined,
          }}
        >
          {label}
          {selected && <span className="ml-1 font-[500] opacity-90">{formatArea(lot.areaM2)}</span>}
        </span>
      </Html>
    </group>
  );
}

function Ground({ vb }: { vb: ReturnType<typeof parseViewBox> }) {
  const w = vb.width * SCALE;
  const d = vb.height * SCALE;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[w + 0.6, d + 0.6]} />
        <meshStandardMaterial color="#efe6cf" roughness={1} />
      </mesh>
      {/* Rua interna (faixa central da planta demonstrativa) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, (vb.height * 0.48 - vb.height / 2) * SCALE]}>
        <planeGeometry args={[w + 0.6, 0.48]} />
        <meshStandardMaterial color="#d8c8a2" roughness={1} />
      </mesh>
      {/* Base da maquete */}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[w + 0.6, 0.3, d + 0.6]} />
        <meshStandardMaterial color="#b89d6e" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Intro({ progress }: { progress: React.RefObject<number> }) {
  const t = useRef(prefersReducedMotion() ? 1 : 0);
  const invalidate = useThree((st) => st.invalidate);
  useFrame((_, dt) => {
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + dt / 0.9);
    progress.current = 1 - Math.pow(1 - t.current, 3);
    invalidate();
  });
  return null;
}

export default function LotsScene({ lots, viewBox, selectedId, hoverId, onSelect, onHover }: Props) {
  const vb = useMemo(() => parseViewBox(viewBox), [viewBox]);
  const intro = useRef(prefersReducedMotion() ? 1 : 0);
  const withGeometry = lots.filter((l) => l.polygon !== null);
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  return (
    <div className="relative aspect-[4/3] w-full sm:aspect-[1000/660]" data-lenis-prevent>
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ position: [0, 7.2, 8.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onHover(null)}
      >
        <Intro progress={intro} />
        <hemisphereLight args={['#fcfbf6', '#3f6b45', 0.75]} />
        <directionalLight
          position={[-6, 9, 4]}
          intensity={1.6}
          color="#fff3dc"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
        />
        <Ground vb={vb} />
        {withGeometry.map((lot) => (
          <LotMesh
            key={lot.id}
            lot={lot}
            vb={vb}
            selected={lot.id === selectedId}
            hovered={lot.id === hoverId}
            onSelect={onSelect}
            onHover={onHover}
            intro={intro}
          />
        ))}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={0.35}
          maxPolarAngle={1.2}
          enableDamping
          dampingFactor={0.08}
          makeDefault
        />
      </Canvas>
      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-ipe px-2 py-0.5 text-[0.75rem] font-[600] text-mata-900">
        Maquete demonstrativa
      </span>
    </div>
  );
}
