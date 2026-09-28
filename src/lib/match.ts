/**
 * Busca guiada: regras transparentes, sem pontuação oculta.
 * Cada critério informado é avaliado como "atende", "não atende" ou "sem dado".
 * Só é resultado completo quem atende TODOS os critérios informados.
 */
import type { Interesse, Listing } from '@/types/listing';
import { isEmpreendimento } from '@/types/listing';
import type { Lot } from '@/types/lot';
import { areaMatches, eligibleLots, priceMatches } from './filters';
import { INTERESSE_LABEL, normalizeText } from './listing';
import { availableLots } from './lots';
import { joinPt } from './whatsapp';

export interface GuidedInput {
  objetivo: Interesse | null;
  regiao: string | null;
  orcamentoMaxCents: number | null;
  areaMinM2: number | null;
  areaMaxM2: number | null;
}

export type CriterionKey = 'objetivo' | 'regiao' | 'orcamento' | 'area';
export type CriterionStatus = 'atende' | 'nao_atende' | 'sem_dado';

export interface CriterionResult {
  key: CriterionKey;
  status: CriterionStatus;
  /** Frase curta para a explicação. */
  text: string;
}

export interface MatchResult {
  listing: Listing;
  criteria: CriterionResult[];
  /** true somente quando todos os critérios informados foram atendidos. */
  complete: boolean;
  explanation: string;
  /** Lotes que atendem orçamento e área ao mesmo tempo (empreendimentos). */
  lots: Lot[];
}

export interface GuidedOutcome {
  /** Critérios que o visitante informou. */
  asked: CriterionKey[];
  complete: MatchResult[];
  /** Atendem parte dos critérios: exibidos separadamente, nunca como completos. */
  partial: MatchResult[];
}

const MET_TEXT: Record<CriterionKey, string> = {
  objetivo: 'indicado para o objetivo escolhido',
  regiao: 'na região escolhida',
  orcamento: 'dentro do orçamento informado',
  area: 'na faixa de área desejada',
};

export function askedCriteria(input: GuidedInput): CriterionKey[] {
  const out: CriterionKey[] = [];
  if (input.objetivo) out.push('objetivo');
  if (input.regiao) out.push('regiao');
  if (input.orcamentoMaxCents !== null) out.push('orcamento');
  if (input.areaMinM2 !== null || input.areaMaxM2 !== null) out.push('area');
  return out;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function explain(criteria: readonly CriterionResult[]): string {
  const met = criteria.filter((c) => c.status === 'atende').map((c) => c.text);
  const notMet = criteria.filter((c) => c.status !== 'atende').map((c) => c.text);
  const parts: string[] = [];
  if (met.length) parts.push(`${capitalize(joinPt(met))}.`);
  if (notMet.length) parts.push(`Não atende: ${joinPt(notMet)}.`);
  return parts.join(' ');
}

export function evaluate(listing: Listing, input: GuidedInput): MatchResult {
  const criteria: CriterionResult[] = [];
  let lots: Lot[] = [];

  if (input.objetivo) {
    const ok = listing.interesses.includes(input.objetivo);
    criteria.push({
      key: 'objetivo',
      status: ok ? 'atende' : 'nao_atende',
      text: ok ? MET_TEXT.objetivo : `objetivo ${INTERESSE_LABEL[input.objetivo].toLowerCase()}`,
    });
  }

  if (input.regiao) {
    const r = normalizeText(input.regiao);
    const ok = normalizeText(listing.municipio) === r || (listing.regiao !== null && normalizeText(listing.regiao) === r);
    criteria.push({ key: 'regiao', status: ok ? 'atende' : 'nao_atende', text: ok ? MET_TEXT.regiao : 'região escolhida' });
  }

  const wantsBudget = input.orcamentoMaxCents !== null;
  const wantsArea = input.areaMinM2 !== null || input.areaMaxM2 !== null;
  const priceF = { precoMinCents: null, precoMaxCents: input.orcamentoMaxCents };
  const areaF = { areaMinM2: input.areaMinM2, areaMaxM2: input.areaMaxM2 };

  if (isEmpreendimento(listing) && (wantsBudget || wantsArea)) {
    // Regra do mesmo lote: orçamento e área precisam ser atendidos pelo mesmo lote.
    const available = availableLots(listing.lots);
    lots = eligibleLots(listing.lots, { ...priceF, ...areaF });
    const sameLotOk = lots.length > 0;
    const allUnknownPrice = available.length > 0 && available.every((l) => l.priceCents === null);
    if (wantsBudget) {
      const byBudget = available.filter((l) => priceMatches(l.priceCents, priceF));
      const status: CriterionStatus = sameLotOk
        ? 'atende'
        : allUnknownPrice
          ? 'sem_dado'
          : 'nao_atende';
      criteria.push({
        key: 'orcamento',
        status,
        text:
          status === 'atende'
            ? MET_TEXT.orcamento
            : status === 'sem_dado'
              ? 'orçamento (preço sob consulta)'
              : byBudget.length && wantsArea
                ? 'orçamento e área no mesmo lote'
                : 'orçamento informado',
      });
    }
    if (wantsArea) {
      criteria.push({
        key: 'area',
        status: sameLotOk ? 'atende' : 'nao_atende',
        text: sameLotOk ? MET_TEXT.area : 'área desejada',
      });
    }
  } else if (!isEmpreendimento(listing)) {
    if (wantsBudget) {
      const status: CriterionStatus =
        listing.priceCents === null ? 'sem_dado' : priceMatches(listing.priceCents, priceF) ? 'atende' : 'nao_atende';
      criteria.push({
        key: 'orcamento',
        status,
        text:
          status === 'atende'
            ? MET_TEXT.orcamento
            : status === 'sem_dado'
              ? 'orçamento (preço sob consulta)'
              : 'orçamento informado',
      });
    }
    if (wantsArea) {
      const ok = areaMatches(listing.areaM2, areaF);
      criteria.push({ key: 'area', status: ok ? 'atende' : 'nao_atende', text: ok ? MET_TEXT.area : 'área desejada' });
    }
  }

  const complete = criteria.length > 0 && criteria.every((c) => c.status === 'atende');
  return { listing, criteria, complete, explanation: explain(criteria), lots };
}

export function guidedSearch(listings: readonly Listing[], input: GuidedInput): GuidedOutcome {
  const asked = askedCriteria(input);
  if (asked.length === 0) return { asked, complete: [], partial: [] };
  const results = listings.map((l) => evaluate(l, input));
  const complete = results.filter((r) => r.complete);
  const partial = results
    .filter((r) => !r.complete && r.criteria.some((c) => c.status === 'atende'))
    .sort(
      (a, b) =>
        b.criteria.filter((c) => c.status === 'atende').length - a.criteria.filter((c) => c.status === 'atende').length,
    );
  return { asked, complete, partial };
}
