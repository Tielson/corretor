/**
 * Busca guiada em quatro perguntas (objetivo, região, orçamento, área).
 * Regras transparentes de src/lib/match.ts: cada resultado explica quais
 * critérios atende; parciais aparecem separados e rotulados.
 */
import { useId, useMemo, useState } from 'react';
import type { Interesse, Listing } from '@/types/listing';
import type { CardModel } from '@/lib/card';
import { guidedSearch, type GuidedInput, type MatchResult } from '@/lib/match';
import { INTERESSE_LABEL } from '@/lib/listing';
import { formatCentsShort } from '@/lib/money';
import { lotLabel } from '@/lib/lots';
import { messages } from '@/lib/whatsapp';
import { PRICE_OPTIONS } from '@/data/home';
import { cn } from '@/lib/utils';
import { WaAction } from './WaAction';

interface Props {
  listings: Listing[];
  cards: Record<string, CardModel>;
  regioes: string[];
}

const AREAS: Array<{ v: string; label: string; min: number | null; max: number | null }> = [
  { v: '', label: 'Tanto faz', min: null, max: null },
  { v: 'ate1000', label: 'Até 1.000 m²', min: null, max: 1000 },
  { v: '1000-5000', label: 'De 1.000 a 5.000 m²', min: 1000, max: 5000 },
  { v: '5000-20000', label: 'De 5.000 m² a 2 ha', min: 5000, max: 20000 },
  { v: '20000+', label: 'Mais de 2 ha', min: 20000, max: null },
];

const field = 'h-11 w-full appearance-none rounded-[10px] border border-input bg-cal px-3 text-[0.95rem] focus:border-mata';

function ResultItem({ r, card }: { r: MatchResult; card: CardModel | undefined }) {
  return (
    <li className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[6rem_1fr]">
      {card?.image ? (
        <img src={card.image.src} alt="" width={96} height={72} loading="lazy" className="hidden h-18 w-24 rounded-lg object-cover sm:block" />
      ) : (
        <span className="hidden sm:block" />
      )}
      <div className="min-w-0">
        <a href={card?.href ?? '#'} className="font-[600] text-mata underline decoration-areia decoration-2 underline-offset-4 hover:decoration-mata">
          {r.listing.title}
        </a>
        <p className="text-[0.85rem] text-nevoa">{card ? `${card.category} em ${card.place}` : r.listing.municipio}</p>
        <p className="mt-1.5 text-[0.92rem] text-grafite">{r.explanation}</p>
        {r.lots.length > 0 && (
          <p className="mt-1 text-[0.85rem] text-nevoa">
            Lotes que atendem a orçamento e área ao mesmo tempo: {r.lots.map((l) => lotLabel(l).replace('Quadra ', 'Q. ')).join(', ')}.
          </p>
        )}
      </div>
    </li>
  );
}

export default function BuscaGuiada({ listings, cards, regioes }: Props) {
  const ids = { obj: useId(), reg: useId(), orc: useId(), area: useId() };
  const [objetivo, setObjetivo] = useState<Interesse | ''>('');
  const [regiao, setRegiao] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [area, setArea] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const a = AREAS.find((x) => x.v === area) ?? AREAS[0];
  const input: GuidedInput = {
    objetivo: objetivo || null,
    regiao: regiao || null,
    orcamentoMaxCents: orcamento ? Number(orcamento) * 100 : null,
    areaMinM2: a.min,
    areaMaxM2: a.max,
  };
  const outcome = useMemo(() => guidedSearch(listings, input), [listings, objetivo, regiao, orcamento, area]); // eslint-disable-line react-hooks/exhaustive-deps
  const prefsMessage = messages.naoEncontrou({
    objetivo: objetivo ? INTERESSE_LABEL[objetivo] : null,
    regiao: regiao || null,
    orcamento: orcamento ? `até ${formatCentsShort(Number(orcamento) * 100)}` : null,
    area: a.v ? a.label.toLowerCase() : null,
    texto: 'Usei a busca guiada do site.',
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
      >
        <div>
          <label htmlFor={ids.obj} className="mb-1 block text-[0.82rem] text-nevoa">
            1. Para que você quer o terreno?
          </label>
          <select id={ids.obj} value={objetivo} onChange={(e) => setObjetivo(e.target.value as Interesse | '')} className={field}>
            <option value="">Ainda não sei</option>
            {(Object.keys(INTERESSE_LABEL) as Interesse[]).map((k) => (
              <option key={k} value={k}>
                {INTERESSE_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.reg} className="mb-1 block text-[0.82rem] text-nevoa">
            2. Em que região?
          </label>
          <select id={ids.reg} value={regiao} onChange={(e) => setRegiao(e.target.value)} className={field}>
            <option value="">Qualquer região</option>
            {regioes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.orc} className="mb-1 block text-[0.82rem] text-nevoa">
            3. Até quanto pretende investir?
          </label>
          <select id={ids.orc} value={orcamento} onChange={(e) => setOrcamento(e.target.value)} className={field}>
            <option value="">Sem limite definido</option>
            {PRICE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                Até {formatCentsShort(p * 100)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.area} className="mb-1 block text-[0.82rem] text-nevoa">
            4. Qual tamanho?
          </label>
          <select id={ids.area} value={area} onChange={(e) => setArea(e.target.value)} className={field}>
            {AREAS.map((x) => (
              <option key={x.v} value={x.v}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="h-11 self-end rounded-[10px] bg-mata px-5 font-[600] text-cal hover:bg-mata-900">
          Ver sugestões
        </button>
      </form>

      <div aria-live="polite" className={cn(!submitted && 'sr-only')}>
        {submitted && outcome.asked.length === 0 && (
          <p className="mt-5 text-grafite/80">Responda pelo menos uma pergunta para ver sugestões.</p>
        )}
        {submitted && outcome.asked.length > 0 && (
          <div className="mt-6 space-y-6">
            {outcome.complete.length > 0 ? (
              <div>
                <h3 className="text-lg">
                  {outcome.complete.length === 1 ? '1 opção atende' : `${outcome.complete.length} opções atendem`} a todos os
                  critérios
                </h3>
                <ul className="mt-3 space-y-3">
                  {outcome.complete.map((r) => (
                    <ResultItem key={r.listing.id} r={r} card={cards[r.listing.id]} />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-input p-5">
                <p className="font-[560] text-grafite">Nenhuma opção do catálogo atende a todos os critérios.</p>
                <p className="mt-1 text-[0.92rem] text-grafite/80">
                  O corretor pode ter opções ainda não publicadas. Envie suas preferências e ele responde pelo WhatsApp.
                </p>
                <WaAction message={prefsMessage} className="mt-4">
                  Enviar minhas preferências ao corretor
                </WaAction>
              </div>
            )}
            {outcome.partial.length > 0 && (
              <div>
                <h3 className="text-lg">Atendem só parte dos critérios</h3>
                <p className="mt-1 text-[0.88rem] text-nevoa">Estas opções não cumprem tudo o que você pediu; veja o que falta em cada uma.</p>
                <ul className="mt-3 space-y-3 opacity-90">
                  {outcome.partial.slice(0, 4).map((r) => (
                    <ResultItem key={r.listing.id} r={r} card={cards[r.listing.id]} />
                  ))}
                </ul>
              </div>
            )}
            {outcome.complete.length > 0 && (
              <p className="text-[0.9rem] text-grafite/80">
                Quer outras opções?{' '}
                <WaAction message={prefsMessage} variant="quiet">
                  Enviar minhas preferências ao corretor
                </WaAction>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
