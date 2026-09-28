/** Busca local por palavras-chave nas perguntas cadastradas (sem IA). */
import type { Faq } from '@/types/faq';
import { normalizeText } from './listing';

const STOP = new Set(['a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'um', 'uma', 'para', 'pra', 'com', 'que', 'se', 'eu', 'tem', 'como', 'qual', 'quais', 'e']);

export function tokenize(q: string): string[] {
  return normalizeText(q)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Pontua por termos em palavras-chave (peso 3), pergunta (2) e resposta (1). */
export function searchFaq(items: readonly Faq[], query: string, limit = 6): Faq[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  const scored = items.map((f) => {
    const kw = normalizeText(f.keywords.join(' '));
    const q = normalizeText(f.question);
    const a = normalizeText(f.answer);
    let score = 0;
    for (const t of terms) {
      if (kw.includes(t)) score += 3;
      if (q.includes(t)) score += 2;
      if (a.includes(t)) score += 1;
    }
    return { f, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((s) => s.f);
}
