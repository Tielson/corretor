import { describe, expect, it } from 'vitest';
import { buildWaLink, joinPt, messages, normalizePhone } from '@/lib/whatsapp';

describe('buildWaLink', () => {
  it('usa só dígitos e encodeURIComponent', () => {
    const text = 'Olá! Lote 3 & quadra A? 100%';
    const link = buildWaLink('+55 (35) 99999-0000', text);
    expect(link).toBe('https://wa.me/5535999990000?text=' + encodeURIComponent(text));
    expect(normalizePhone('+55 (35) 9 9999-0000')).toBe('5535999990000');
  });
  it('telefone vazio ou curto retorna null (nunca inventa número)', () => {
    expect(buildWaLink('', 'oi')).toBeNull();
    expect(buildWaLink('123', 'oi')).toBeNull();
  });
});

describe('mensagens por origem', () => {
  const ref = {
    kind: 'empreendimento' as const,
    title: 'Recanto das Araucárias',
    code: 'EMP-GON-01',
    url: 'https://example.com/x/',
  };

  it('anúncio', () => {
    const m = messages.anuncio({ ...ref, subjects: ['acesso', 'agua'], question: 'Tem ônibus perto' });
    expect(m).toBe(
      'Olá! Vi o empreendimento Recanto das Araucárias (código EMP-GON-01) e tenho interesse. Gostaria de saber sobre o acesso e a água. Tem ônibus perto. Link: https://example.com/x/',
    );
  });
  it('lote inclui empreendimento, quadra e lote', () => {
    const m = messages.lote({
      empreendimento: 'Recanto',
      code: 'EMP',
      lotNumber: '03',
      block: 'A',
      area: '2.000 m²',
      url: 'u',
      subjects: ['pagamento'],
    });
    expect(m).toContain('tenho interesse no lote 03 da quadra A, de 2.000 m²');
    expect(m).toContain('as condições de pagamento');
    expect(m).toContain('Link: u');
  });
  it('dúvida', () => {
    expect(messages.duvida({ subject: 'Água', listing: ref })).toContain(
      'Tenho uma dúvida sobre o empreendimento Recanto das Araucárias (código EMP-GON-01): Água.',
    );
  });
  it('comparação', () => {
    const m = messages.comparacao({
      items: [
        { title: 'A', code: '1', scope: 'conjunto' },
        { title: 'B', code: '2', scope: 'lote 3' },
      ],
    });
    expect(m).toContain('1) A (1, conjunto); 2) B (2, lote 3)');
  });
  it('busca vazia lista os filtros', () => {
    expect(messages.buscaVazia({ filters: ['Rural', 'Até R$ 100 mil'] })).toContain('Critérios: Rural; Até R$ 100 mil.');
  });
  it('visita é uma solicitação, nunca "agendada"', () => {
    const m = messages.visita({ ...ref, day: 'Sábado', period: 'Manhã' });
    expect(m).toContain('solicitar uma visita ao empreendimento');
    expect(m).toContain('Minha preferência: Sábado, Manhã.');
    expect(m.toLowerCase()).not.toContain('agendada');
  });
  it('não encontrou', () => {
    expect(messages.naoEncontrou({ objetivo: 'Lazer', orcamento: 'até R$ 300 mil' })).toBe(
      'Olá! Não encontrei no site o que procuro. Minhas preferências: objetivo: Lazer; orçamento: até R$ 300 mil.',
    );
  });
  it('pendências lista itens não disponibilizados', () => {
    expect(messages.pendencias({ ...ref, missing: ['Água', 'Internet'] })).toContain(
      'não estão no anúncio: água e internet.',
    );
  });
  it('joinPt', () => {
    expect(joinPt(['a'])).toBe('a');
    expect(joinPt(['a', 'b', 'c'])).toBe('a, b e c');
  });
});
