/**
 * Geração centralizada de links e mensagens de WhatsApp.
 * O site apenas prepara a mensagem; quem envia é o visitante.
 */

/** Mantém só os dígitos do telefone. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * https://wa.me/NUMERO?text=MENSAGEM
 * Retorna null quando o telefone não está configurado (nunca inventa um número).
 */
export function buildWaLink(phone: string, message: string): string | null {
  const digits = normalizePhone(phone);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export type WaOrigin =
  | 'anuncio'
  | 'lote'
  | 'duvida'
  | 'comparacao'
  | 'buscaVazia'
  | 'visita'
  | 'naoEncontrou'
  | 'pendencias';

export type QuickSubject = 'acesso' | 'agua' | 'energia' | 'documentacao' | 'pagamento' | 'visita';

export const QUICK_SUBJECTS: ReadonlyArray<{ key: QuickSubject; label: string; phrase: string }> = [
  { key: 'acesso', label: 'Acesso', phrase: 'o acesso' },
  { key: 'agua', label: 'Água', phrase: 'a água' },
  { key: 'energia', label: 'Energia', phrase: 'a energia' },
  { key: 'documentacao', label: 'Documentação', phrase: 'a documentação' },
  { key: 'pagamento', label: 'Pagamento', phrase: 'as condições de pagamento' },
  { key: 'visita', label: 'Visita', phrase: 'como fazer uma visita' },
];

/** "a, b e c" */
export function joinPt(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

function subjectsSentence(subjects: readonly QuickSubject[] = [], question?: string | null): string {
  const phrases = QUICK_SUBJECTS.filter((s) => subjects.includes(s.key)).map((s) => s.phrase);
  const parts: string[] = [];
  if (phrases.length) parts.push(`Gostaria de saber sobre ${joinPt(phrases)}.`);
  const q = question?.trim();
  if (q) parts.push(q.endsWith('?') || q.endsWith('.') ? q : `${q}.`);
  return parts.join(' ');
}

const linkLine = (url?: string | null) => (url ? `Link: ${url}` : '');

const compose = (...parts: Array<string | null | undefined | false>) =>
  parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

interface ListingRef {
  kind: 'terreno' | 'empreendimento';
  title: string;
  code: string;
  url?: string | null;
}

const kindWord = (kind: ListingRef['kind']) => (kind === 'empreendimento' ? 'o empreendimento' : 'o terreno');

export const messages = {
  anuncio(p: ListingRef & { subjects?: QuickSubject[]; question?: string | null }): string {
    return compose(
      `Olá! Vi ${kindWord(p.kind)} ${p.title} (código ${p.code}) e tenho interesse.`,
      subjectsSentence(p.subjects, p.question),
      linkLine(p.url),
    );
  },

  lote(p: {
    empreendimento: string;
    code: string;
    lotNumber: string;
    block: string | null;
    area: string;
    url?: string | null;
    subjects?: QuickSubject[];
    question?: string | null;
  }): string {
    const lot = p.block ? `no lote ${p.lotNumber} da quadra ${p.block}` : `no lote ${p.lotNumber}`;
    return compose(
      `Olá! Vi o empreendimento ${p.empreendimento} (código ${p.code}) e tenho interesse ${lot}, de ${p.area}.`,
      subjectsSentence(p.subjects, p.question),
      linkLine(p.url),
    );
  },

  duvida(p: { subject: string; listing?: ListingRef | null; question?: string | null; url?: string | null }): string {
    const about = p.listing ? ` sobre ${kindWord(p.listing.kind)} ${p.listing.title} (código ${p.listing.code})` : '';
    const q = p.question?.trim();
    return compose(
      `Olá! Tenho uma dúvida${about}: ${p.subject}.`,
      q ? `Minha pergunta: ${q}` : null,
      linkLine(p.url ?? p.listing?.url),
    );
  },

  comparacao(p: { items: Array<{ title: string; code: string; scope: string }>; url?: string | null }): string {
    const list = p.items.map((i, idx) => `${idx + 1}) ${i.title} (${i.code}, ${i.scope})`).join('; ');
    return compose(
      `Olá! Estou comparando estas opções: ${list}.`,
      'Pode me ajudar a entender as diferenças?',
      linkLine(p.url),
    );
  },

  buscaVazia(p: { filters: string[]; url?: string | null }): string {
    const criteria = p.filters.length ? p.filters.join('; ') : 'sem filtros específicos';
    return compose(
      'Olá! Fiz uma busca no site e não encontrei resultados.',
      `Critérios: ${criteria}.`,
      'Você tem alguma opção parecida?',
      linkLine(p.url),
    );
  },

  visita(p: ListingRef & { day?: string | null; period?: string | null; notes?: string | null }): string {
    const pref = [p.day?.trim(), p.period?.trim()].filter(Boolean).join(', ');
    return compose(
      `Olá! Gostaria de solicitar uma visita ${p.kind === 'terreno' ? 'ao terreno' : 'ao empreendimento'} ${p.title} (código ${p.code}).`,
      pref ? `Minha preferência: ${pref}.` : 'Ainda não tenho data definida.',
      p.notes?.trim() ? `Observação: ${p.notes.trim()}` : null,
      'Podemos confirmar a data por aqui?',
      linkLine(p.url),
    );
  },

  naoEncontrou(p: {
    objetivo?: string | null;
    regiao?: string | null;
    orcamento?: string | null;
    area?: string | null;
    texto?: string | null;
  }): string {
    const prefs = [
      p.objetivo && `objetivo: ${p.objetivo}`,
      p.regiao && `região: ${p.regiao}`,
      p.orcamento && `orçamento: ${p.orcamento}`,
      p.area && `área: ${p.area}`,
    ].filter((x): x is string => Boolean(x));
    return compose(
      'Olá! Não encontrei no site o que procuro.',
      prefs.length ? `Minhas preferências: ${prefs.join('; ')}.` : null,
      p.texto?.trim() ? p.texto.trim() : null,
    );
  },

  pendencias(p: ListingRef & { missing: string[] }): string {
    return compose(
      `Olá! Vi ${kindWord(p.kind)} ${p.title} (código ${p.code}).`,
      p.missing.length
        ? `Algumas informações não estão no anúncio: ${joinPt(p.missing.map((m) => m.toLowerCase()))}. Pode me passar esses dados?`
        : 'Gostaria de confirmar as informações do anúncio.',
      linkLine(p.url),
    );
  },
} as const;
