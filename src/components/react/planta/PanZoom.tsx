/**
 * Zoom e deslocamento por transformação CSS: botões, Ctrl + roda (ou pinça
 * no trackpad), pinça com dois dedos e arraste. Com zoom 1 o toque rola a
 * página normalmente; o arraste só assume depois de ampliar.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
  label: string;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function PanZoom({ children, className, minScale = 1, maxScale = 4, label }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; dist: number } | null>(null);
  const moved = useRef(false);

  const limit = useCallback((s: number, x: number, y: number) => {
    const el = box.current;
    if (!el) return { s, x, y };
    const w = el.clientWidth;
    const h = el.clientHeight;
    const maxX = ((s - 1) * w) / 2;
    const maxY = ((s - 1) * h) / 2;
    return { s, x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  }, []);

  const zoomAt = useCallback(
    (factor: number, cx?: number, cy?: number) => {
      setT((prev) => {
        const s = clamp(prev.s * factor, minScale, maxScale);
        const el = box.current;
        if (!el || cx === undefined || cy === undefined) return limit(s, prev.x * (s / prev.s), prev.y * (s / prev.s));
        const rect = el.getBoundingClientRect();
        const px = cx - rect.left - rect.width / 2;
        const py = cy - rect.top - rect.height / 2;
        const k = s / prev.s;
        return limit(s, px - (px - prev.x) * k, py - (py - prev.y) * k);
      });
    },
    [limit, maxScale, minScale],
  );

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // rolagem comum continua rolando a página
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    last.current = null;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      if (last.current) zoomAt(dist / (last.current.dist || dist), cx, cy);
      last.current = { x: cx, y: cy, dist };
      moved.current = true;
      return;
    }
    if (pts.length === 1 && t.s > 1) {
      const p = pts[0];
      if (last.current) {
        const dx = p.x - last.current.x;
        const dy = p.y - last.current.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
        setT((prev) => limit(prev.s, prev.x + dx, prev.y + dy));
      }
      last.current = { x: p.x, y: p.y, dist: 0 };
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    last.current = null;
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={box}
        className="relative overflow-hidden"
        style={{ touchAction: t.s > 1 ? 'none' : 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={(e) => {
          // Um arraste não deve selecionar um lote por engano.
          if (moved.current) {
            e.stopPropagation();
            moved.current = false;
          }
        }}
        data-lenis-prevent
      >
        <div
          className="origin-center transition-transform duration-150 ease-out will-change-transform"
          style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, cursor: t.s > 1 ? 'grab' : 'default' }}
        >
          {children}
        </div>
      </div>
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-[10px] border border-border bg-cal/95 shadow-sm" role="group" aria-label={`Zoom: ${label}`}>
        <button type="button" onClick={() => zoomAt(1.35)} className="grid size-10 place-items-center text-lg text-mata hover:bg-areia-100" aria-label="Ampliar">
          +
        </button>
        <button type="button" onClick={() => zoomAt(1 / 1.35)} className="grid size-10 place-items-center border-t border-border text-lg text-mata hover:bg-areia-100" aria-label="Reduzir">
          −
        </button>
        <button type="button" onClick={() => setT({ s: 1, x: 0, y: 0 })} className="grid size-10 place-items-center border-t border-border text-[0.7rem] font-[600] text-mata hover:bg-areia-100" aria-label="Voltar ao tamanho original">
          1:1
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-3 rounded-md bg-cal/85 px-2 py-0.5 text-[0.72rem] text-nevoa">
        {t.s > 1 ? 'Arraste para mover' : 'Use + e − ou Ctrl + roda para ampliar'}
      </p>
    </div>
  );
}
