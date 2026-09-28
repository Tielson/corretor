/**
 * Maquete topográfica em placas (R3F). Relevo ilustrativo gerado pelo mesmo
 * campo procedural do pôster 2D; pinos posicionados pelas coordenadas.
 * Carregada sob demanda por MaqueteRegiao.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { generateHeightfield, RELIEF, sampleHeight } from '@/lib/relief';
import type { ReliefPin } from '@/lib/relief-data';

interface Props {
  pins: ReliefPin[];
  activeId: string | null;
  onActivate: (id: string | null) => void;
  reducedMotion: boolean;
  /** false pausa o loop de renderização (fora da tela). */
  running: boolean;
  onReady?: () => void;
}

const HEIGHT = 1.35;
const BASE = 0.35;
// Cores das placas, do vale para o alto: verdes da mata até areia e rocha.
const BANDS = ['#5f7f4c', '#6b8a53', '#7c9659', '#8fa262', '#a6ad6d', '#bdb57b', '#d2c28f', '#e2d3a8', '#efe4c6'].map(
  (c) => new THREE.Color(c),
);

function useTerrain(resolution: number) {
  return useMemo(() => {
    const field = generateHeightfield({ resolution, seed: RELIEF.seed, steps: RELIEF.steps });
    const { width, depth } = RELIEF.size;
    const geo = new THREE.PlaneGeometry(width, depth, resolution - 1, resolution - 1);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const h = field[i];
      pos.setY(i, h * HEIGHT);
      const band = BANDS[Math.min(BANDS.length - 1, Math.round(h * (BANDS.length - 1)))];
      colors.set([band.r, band.g, band.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return { geo, field };
  }, [resolution]);
}

function Terrain({ intro, geo }: { intro: React.RefObject<number>; geo: THREE.BufferGeometry }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.scale.y = Math.max(0.001, intro.current ?? 1);
  });
  const { width, depth } = RELIEF.size;
  return (
    <group>
      <group ref={ref}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial vertexColors flatShading roughness={0.92} metalness={0} />
        </mesh>
      </group>
      {/* Base de madeira da maquete */}
      <mesh position={[0, -BASE / 2 - 0.001, 0]} receiveShadow>
        <boxGeometry args={[width, BASE, depth]} />
        <meshStandardMaterial color="#b89d6e" roughness={0.85} />
      </mesh>
      <mesh position={[0, -BASE - 0.02, 0]}>
        <boxGeometry args={[width + 0.12, 0.04, depth + 0.12]} />
        <meshStandardMaterial color="#8a7148" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Pin({
  pin,
  height,
  active,
  onActivate,
  intro,
}: {
  pin: ReliefPin;
  height: number;
  active: boolean;
  onActivate: (id: string | null) => void;
  intro: React.RefObject<number>;
}) {
  const ref = useRef<THREE.Group>(null);
  const invalidate = useThree((st) => st.invalidate);
  const color = pin.zone === 'rural' ? '#7b3a24' : '#1e3a2b';
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const goal = active ? 1.45 : 1;
    const s = THREE.MathUtils.damp(g.scale.x, goal, 12, dt);
    g.scale.setScalar(Math.abs(s - goal) < 0.002 ? goal : s);
    if (g.scale.x !== goal) invalidate();
    const k = intro.current ?? 1;
    g.position.y = height * HEIGHT * k + 0.02 + (1 - k) * 1.2;
  });
  return (
    <group ref={ref} position={[pin.x, height * HEIGHT, pin.z]}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.56, 6]} />
        <meshStandardMaterial color="#fcfbf6" />
      </mesh>
      <mesh
        position={[0, 0.6, 0]}
        castShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onActivate(active ? null : pin.id);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onActivate(pin.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        <sphereGeometry args={[0.09, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={active ? 0.35 : 0.05} />
      </mesh>
      {pin.approximate && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.18, 0.26, 32]} />
          <meshBasicMaterial color="#7b3a24" transparent opacity={0.45} />
        </mesh>
      )}
      {active && (
        <Html position={[0, 0.95, 0]} center zIndexRange={[40, 0]}>
          <a
            href={pin.href}
            className="block w-56 rounded-xl border border-border bg-cal/95 p-3 text-left shadow-[0_12px_30px_-12px_rgb(20_42_30/.55)] backdrop-blur-sm"
          >
            <span className="block text-[0.95rem] font-[620] leading-tight text-mata">{pin.title}</span>
            <span className="mt-0.5 block text-[0.8rem] text-nevoa">
              {pin.place}
              {pin.approximate ? ', localização aproximada' : ''}
            </span>
            <span className="type-data mt-1.5 block text-[0.92rem] text-grafite">{pin.price}</span>
            {pin.area && <span className="type-data block text-[0.82rem] text-nevoa">{pin.area}</span>}
            <span className="mt-2 block text-[0.82rem] font-[560] text-mata underline decoration-areia decoration-2 underline-offset-4">
              Ver anúncio
            </span>
          </a>
        </Html>
      )}
    </group>
  );
}

/** Paralaxe leve: gira o grupo da maquete conforme o ponteiro (não mexe na câmera). */
function Drift({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { pointer, gl, invalidate } = useThree();
  useEffect(() => {
    if (!enabled) return;
    const el = gl.domElement;
    const onMove = () => invalidate();
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, [enabled, gl, invalidate]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g || !enabled) return;
    const ty = pointer.x * 0.08;
    const tx = -pointer.y * 0.035;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 2.5, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 2.5, dt);
    if (Math.abs(g.rotation.y - ty) > 1e-4 || Math.abs(g.rotation.x - tx) > 1e-4) invalidate();
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ pins, activeId, onActivate, reducedMotion, onReady }: Omit<Props, 'running'>) {
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 768;
  const { geo, field } = useTerrain(isSmall ? 120 : 180);
  const intro = useRef(reducedMotion ? 1 : 0);
  const t = useRef(reducedMotion ? 1 : 0);
  const ready = useRef(false);
  const invalidate = useThree((st) => st.invalidate);

  // Renderização sob demanda: só desenha enquanto algo se move.
  useFrame((_, dt) => {
    if (!ready.current) {
      ready.current = true;
      onReady?.();
    }
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + dt / 1.6);
    // Placas sobem com desaceleração suave (o único movimento automático do site).
    intro.current = 1 - Math.pow(1 - t.current, 3);
    invalidate();
  });

  return (
    <>
      <hemisphereLight args={['#fcfbf6', '#4f6b3a', 0.7]} />
      <directionalLight
        position={[-7, 8, 5]}
        intensity={1.9}
        color="#fff1d6"
        castShadow={!isSmall}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <Drift enabled={!reducedMotion && !isSmall}>
      <Terrain intro={intro} geo={geo} />
      {pins.map((p) => (
        <Pin
          key={p.id}
          pin={p}
          height={sampleHeight(field, isSmall ? 120 : 180, RELIEF.size, p.x, p.z)}
          active={p.id === activeId}
          onActivate={onActivate}
          intro={intro}
        />
      ))}
      </Drift>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.15}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        enableDamping
        dampingFactor={0.07}
        target={[0, 0.3, 0.4]}
        makeDefault
      />
    </>
  );
}

export default function ReliefScene({ running, ...props }: Props) {
  useEffect(() => () => void (document.body.style.cursor = ''), []);
  return (
    <Canvas
      shadows
      frameloop={running ? 'demand' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 7.4, 9.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => props.onActivate(null)}
      aria-hidden="true"
    >
      <Scene {...props} />
    </Canvas>
  );
}
