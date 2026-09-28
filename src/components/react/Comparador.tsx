/**
 * Comparação lado a lado (até 3). Para empreendimentos, o visitante escolhe
 * comparar o conjunto ou um lote específico; o cabeçalho mostra qual.
 */
import { useId } from 'react';
import type { Listing } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import type { Lot } from '@/types/lot';
import type { CardModel } from '@/lib/card';
import { setCompareScope, removeFromCompare, COMPARE_LIMIT, type CompareItem } from '@/lib/compare';
import { ACCESS_TYPE_LABEL, RELIEF_LABEL, priceInfo } from '@/lib/listing';
import { formatArea, formatAreaRange } from '@/lib/area';
import { formatCents, formatPrice } from '@/lib/money';
import { LOT_STATUS_LABEL, lotLabel, availableAreaRange } from '@/lib/lots';
import { distanceToReference } from '@/lib/filters';
import { messages } from '@/lib/whatsapp';
import { termsOf } from '@/lib/card';
import { useCompare } from './hooks/useStored';
import { WaAction } from './WaAction';

interface Props {
  listings: Listing[];
  cards: Record<string, CardModel>;
  referenceCity: string;
  compareUrl: string;
}

const NA = <span className="italic text-nevoa">Não informado</span>;

function infraStatus(l: Listing, key: string): string | null {
  const it = l.infrastructure.items.find((i) => i.key === key);
  if (!it) return null;
  return it.status === 'existente' ? 'Existente' : it.status === 'prevista' ? 'Prevista (ainda não existe)' : null;
}

function ScopeSelect({ listing, lotId, onChange }: { listing: Listing; lotId: string | null; onChange: (v: string | null) => void }) {
  const id = useId();
  if (!isEmpreendimento(listing)) return null;
  return (
    <div className="mt-2">
      <label htmlFor={id} className="block text-[0.78rem] text-nevoa">
        Comparar
      </label>
      <select
        id={id}
        value={lotId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-0.5 h-9 w-full rounded-lg border border-input bg-cal px-2 text-[0.85rem]"
      >
        <option value="">O empreendimento (conjunto)</option>
        {listing.lots.map((lot) => (
          <option key={lot.id} value={lot.id}>
            {lotLabel(lot)} ({LOT_STATUS_LABEL[lot.status].toLowerCase()})
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Comparador({ listings, cards, referenceCity, compareUrl }: Props) {
  const { items, setItems, loaded } = useCompare();
  if (!loaded) return <p className="text-nevoa">Carregando comparação…</p>;

  type Col = { item: CompareItem; listing: Listing; lot: Lot | null };
  const cols: Col[] = [];
  for (const i of items) {
    const listing = listings.find((l) => l.id === i.listingId);
    if (!listing) continue;
    const lot = isEmpreendimento(listing) && i.lotId ? listing.lots.find((x) => x.id === i.lotId) ?? null : null;
    cols.push({ item: i, listing, lot });
  }

  if (cols.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-input p-8 text-center">
        <p className="type-display text-2xl">Nada para comparar ainda</p>
        <p className="mx-auto mt-2 max-w-[50ch] text-grafite/80">
          Marque "Comparar" em até {COMPARE_LIMIT} anúncios do catálogo para ver preço, área, acesso e infraestrutura lado a lado.
        </p>
        <a href="/terrenos/" className="mt-5 inline-flex min-h-11 items-center rounded-[10px] bg-mata px-5 font-[600] text-cal hover:bg-mata-900">
          Escolher no catálogo
        </a>
      </div>
    );
  }

  const scopeText = (c: Col) =>
    isEmpreendimento(c.listing) ? (c.lot ? lotLabel(c.lot) : 'conjunto do empreendimento') : 'terreno avulso';

  const rows: Array<{ label: string; render: (c: Col) => React.ReactNode }> = [
    {
      label: 'Preço total',
      render: (c) => {
        if (c.lot) return <span className="type-data font-[600] text-mata">{formatPrice(c.lot.priceCents)}</span>;
        const p = priceInfo(c.listing);
        return (
          <span className="type-data font-[600] text-mata">
            {p.cents === null ? 'Preço sob consulta' : `${p.mode === 'a_partir_de' ? 'A partir de ' : ''}${formatCents(p.cents)}`}
          </span>
        );
      },
    },
    {
      label: 'Área',
      render: (c) => {
        if (c.lot) return <span className="type-data">{formatArea(c.lot.areaM2)}</span>;
        if (isEmpreendimento(c.listing)) {
          const r = availableAreaRange(c.listing.lots);
          return r ? <span className="type-data">{formatAreaRange(r)} (lotes disponíveis)</span> : 'Sem lotes disponíveis';
        }
        return <span className="type-data">{formatArea(c.listing.areaM2)}</span>;
      },
    },
    {
      label: 'Situação',
      render: (c) =>
        c.lot
          ? LOT_STATUS_LABEL[c.lot.status]
          : isEmpreendimento(c.listing)
            ? `${c.listing.lots.filter((l) => l.status === 'disponivel').length} de ${c.listing.lots.length} lotes disponíveis`
            : c.listing.availability ?? NA,
    },
    { label: 'Localização', render: (c) => `${c.listing.municipio}, ${c.listing.uf}${c.listing.location.precision === 'aproximada' ? ' (aproximada)' : ''}` },
    {
      label: `Distância até ${referenceCity}`,
      render: (c) => {
        const km = distanceToReference(c.listing, referenceCity);
        return km === null ? NA : <span className="type-data">{km.toLocaleString('pt-BR')} km (estimativa)</span>;
      },
    },
    {
      label: 'Acesso',
      render: (c) => {
        const a = c.listing.access;
        if (!a.highway && a.dirtRoadKm === null) return NA;
        return (
          <>
            {a.highway ?? 'Rodovia não informada'}
            <span className="block text-[0.85rem] text-nevoa">
              {a.dirtRoadKm === null ? 'Trecho de terra não informado' : a.dirtRoadKm === 0 ? 'Todo asfaltado' : `${a.dirtRoadKm.toLocaleString('pt-BR')} km de terra`}
            </span>
          </>
        );
      },
    },
    { label: 'Relevo', render: (c) => (c.listing.features.relief ? RELIEF_LABEL[c.listing.features.relief] : NA) },
    { label: 'Tipo de acesso', render: (c) => (c.listing.features.accessType ? ACCESS_TYPE_LABEL[c.listing.features.accessType] : NA) },
    {
      label: 'Água',
      render: (c) => (
        <>
          {infraStatus(c.listing, 'agua') ?? (c.listing.features.water ? 'Informada' : NA)}
          {c.listing.features.water && <span className="block text-[0.85rem] text-nevoa">{c.listing.features.water}</span>}
        </>
      ),
    },
    {
      label: 'Energia',
      render: (c) => (
        <>
          {infraStatus(c.listing, 'energia') ?? (c.listing.features.energy ? 'Informada' : NA)}
          {c.listing.features.energy && <span className="block text-[0.85rem] text-nevoa">{c.listing.features.energy}</span>}
        </>
      ),
    },
    {
      label: 'Condições',
      render: (c) => {
        const t = termsOf(c.listing);
        if (!c.listing.commercial) return NA;
        if (!t) return 'Preço informado; sem entrada ou parcelas cadastradas';
        return [t.downPayment, t.installments].filter(Boolean).join('; ');
      },
    },
  ];

  const message = messages.comparacao({
    items: cols.map((c) => ({ title: c.listing.title, code: c.listing.code, scope: scopeText(c) })),
    url: compareUrl,
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-border" data-lenis-prevent>
        <table className="w-full min-w-[44rem] table-fixed border-collapse text-left text-[0.92rem]">
          <caption className="sr-only">Comparação entre as opções escolhidas</caption>
          <thead>
            <tr className="align-top">
              <th scope="col" className="w-40 bg-areia-100 p-4 text-[0.82rem] font-[560] text-nevoa">
                {cols.length} de {COMPARE_LIMIT} opções
              </th>
              {cols.map((c) => (
                <th key={c.item.listingId} scope="col" className="bg-areia-100 p-4 font-normal">
                  {(() => {
                    const img = cards[c.listing.id]?.image;
                    return img ? <img src={img.src} alt="" className="mb-3 aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" /> : null;
                  })()}
                  <a href={cards[c.listing.id]?.href} className="block font-[620] text-mata underline decoration-areia decoration-2 underline-offset-4">
                    {c.listing.title}
                  </a>
                  <span className="mt-0.5 block text-[0.82rem] text-folha">Comparando: {scopeText(c)}</span>
                  <ScopeSelect listing={c.listing} lotId={c.item.lotId} onChange={(v) => setItems(setCompareScope(items, c.listing.id, v))} />
                  <button
                    type="button"
                    onClick={() => setItems(removeFromCompare(items, c.listing.id))}
                    className="mt-2 text-[0.82rem] text-nevoa underline underline-offset-4 hover:text-mata"
                  >
                    Remover
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.label} className="align-top">
                <th scope="row" className="p-4 text-[0.85rem] font-[560] text-nevoa">
                  {r.label}
                </th>
                {cols.map((c) => (
                  <td key={c.item.listingId} className="p-4">
                    {r.render(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <WaAction message={message}>Conversar sobre esta comparação</WaAction>
        <button
          type="button"
          onClick={() => setItems([])}
          className="min-h-11 px-3 text-[0.9rem] font-[560] text-mata underline decoration-areia decoration-2 underline-offset-4"
        >
          Limpar comparação
        </button>
      </div>
    </div>
  );
}
