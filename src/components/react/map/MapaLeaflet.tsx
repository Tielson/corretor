/**
 * Mapa Leaflet. Este módulo só é importado dinamicamente por ilhas
 * client:only (MapaCatalogo, MapaDetalhe); nunca roda no build.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { site } from '@/config/site';
import type { MapPoint } from '@/lib/map-points';

export type { MapPoint };


interface Props {
  points: MapPoint[];
  activeId?: string | null;
  onActivate?: (id: string | null) => void;
  /** Raio (m) do círculo de localização aproximada. */
  approximateRadius?: number;
  height?: string;
  onFailure?: () => void;
}

function pinIcon(p: MapPoint, active: boolean) {
  const color = p.kind === 'entrada' ? '#d9a21b' : p.zone === 'urbano' ? '#1e3a2b' : '#7b3a24';
  const size = active ? 26 : 20;
  const label = p.kind === 'entrada' ? '<span class="pin-tag">Entrada</span>' : '';
  return L.divIcon({
    className: 'pin-terra',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span class="pin-dot" style="width:${size}px;height:${size}px;background:${color}"></span>${label}`,
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const key = points.map((p) => p.id).join('|');
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

function TileWatchdog({ onFailure }: { onFailure: () => void }) {
  const map = useMap();
  useEffect(() => {
    let loaded = 0;
    let errors = 0;
    const onLoad = () => {
      loaded += 1;
    };
    const onError = () => {
      errors += 1;
      if (errors >= 4 && loaded === 0) onFailure();
    };
    map.on('tileload', onLoad);
    map.on('tileerror', onError);
    const t = window.setTimeout(() => {
      if (loaded === 0) onFailure();
    }, 10000);
    return () => {
      map.off('tileload', onLoad);
      map.off('tileerror', onError);
      window.clearTimeout(t);
    };
  }, [map, onFailure]);
  return null;
}

function ActiveMarker({ point, active, onActivate }: { point: MapPoint; active: boolean; onActivate?: (id: string | null) => void }) {
  const ref = useRef<L.Marker | null>(null);
  const icon = useMemo(() => pinIcon(point, active), [point, active]);
  useEffect(() => {
    if (active) ref.current?.openPopup();
  }, [active]);
  return (
    <Marker
      ref={ref}
      position={[point.lat, point.lng]}
      icon={icon}
      zIndexOffset={active ? 1000 : 0}
      title={point.title}
      alt={point.title}
      eventHandlers={{
        click: () => onActivate?.(point.id),
        mouseover: () => onActivate?.(point.id),
      }}
    >
      <Popup>
        <div className="min-w-44 font-sans">
          <p className="!m-0 text-[0.95rem] font-[620] text-mata">{point.title}</p>
          {point.subtitle && <p className="!m-0 text-[0.82rem] text-nevoa">{point.subtitle}</p>}
          {point.price && <p className="type-data !mb-0 !mt-1 text-[0.95rem] text-grafite">{point.price}</p>}
          {point.approximate && <p className="!m-0 text-[0.8rem] text-st-reservado">Localização aproximada</p>}
          {point.href && (
            <a href={point.href} className="mt-2 inline-block text-[0.88rem] font-[560] !text-mata underline">
              Ver detalhes
            </a>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapaLeaflet({ points, activeId = null, onActivate, approximateRadius, height = '28rem', onFailure }: Props) {
  const [failed, setFailed] = useState(false);
  const center = points[0] ? ([points[0].lat, points[0].lng] as [number, number]) : ([site.map.defaultCenter.lat, site.map.defaultCenter.lng] as [number, number]);
  const approx = points.find((p) => p.kind === 'terreno' && p.approximate);

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={site.map.defaultZoom}
        maxZoom={site.map.maxZoom}
        scrollWheelZoom={false}
        className="size-full rounded-[inherit]"
        attributionControl
      >
        <TileLayer url={site.map.tileUrl} attribution={site.map.attribution} maxZoom={site.map.maxZoom} />
        <TileWatchdog
          onFailure={() => {
            setFailed(true);
            onFailure?.();
          }}
        />
        <FitBounds points={points} />
        {approx && approximateRadius && (
          <Circle
            center={[approx.lat, approx.lng]}
            radius={approximateRadius}
            pathOptions={{ color: '#7b3a24', weight: 1.5, fillColor: '#7b3a24', fillOpacity: 0.08, dashArray: '4 6' }}
          />
        )}
        {points.map((p) => (
          <ActiveMarker key={p.id} point={p} active={p.id === activeId} onActivate={onActivate} />
        ))}
      </MapContainer>
      {failed && (
        <div className="absolute inset-0 z-[500] grid place-items-center rounded-[inherit] bg-areia-100/95 p-6 text-center">
          <div>
            <p className="font-[560] text-grafite">O mapa não carregou.</p>
            <p className="mt-1 text-[0.9rem] text-nevoa">
              Endereço, referências e os links do Google Maps continuam disponíveis nesta página.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
