import { describe, expect, it } from 'vitest';
import { searchFaq, tokenize } from '@/lib/faq-search';
import { faqGeral } from '@/data/faq-geral';

describe('busca de dúvidas', () => {
  it('ignora acentos, caixa e palavras vazias', () => {
    expect(tokenize('Como é a DOCUMENTAÇÃO do terreno?')).toEqual(['documentacao', 'terreno']);
  });
  it('encontra por palavra-chave', () => {
    const r = searchFaq(faqGeral, 'posso financiar?');
    expect(r[0]?.id).toBe('g-parcelas');
  });
  it('estrada com chuva leva à dúvida de acesso', () => {
    expect(searchFaq(faqGeral, 'estrada com chuva').map((f) => f.id)).toContain('g-estrada');
  });
  it('sem correspondência retorna vazio (a UI oferece perguntar no WhatsApp)', () => {
    expect(searchFaq(faqGeral, 'xyzabc qwerty')).toEqual([]);
    expect(searchFaq(faqGeral, '  ')).toEqual([]);
  });
});
