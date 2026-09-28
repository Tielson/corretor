/**
 * Busca por palavras-chave nas dúvidas cadastradas. Sem resultado, oferece
 * "Perguntar isso no WhatsApp" com o texto digitado preservado.
 * Não simula respostas de inteligência artificial.
 */
import { useId, useMemo, useState } from 'react';
import type { Faq } from '@/types/faq';
import { searchFaq } from '@/lib/faq-search';
import { messages } from '@/lib/whatsapp';
import { WaAction } from './WaAction';

interface Props {
  items: Faq[];
  /** Caminho base das âncoras (página do anúncio). */
  anchorBase?: string;
  listing?: { kind: 'terreno' | 'empreendimento'; title: string; code: string; url: string } | null;
}

export default function BuscaFaq({ items, anchorBase = '', listing = null }: Props) {
  const id = useId();
  const [q, setQ] = useState('');
  const results = useMemo(() => searchFaq(items, q), [items, q]);
  const searched = q.trim().length >= 3;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <label htmlFor={id} className="block text-[0.95rem] font-[560] text-grafite">
        Procure uma dúvida
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ex.: estrada com chuva, energia, parcelar"
        className="mt-2 h-11 w-full rounded-[10px] border border-input bg-cal px-3 text-[0.95rem] placeholder:text-nevoa/70 focus:border-mata"
        autoComplete="off"
      />
      <div aria-live="polite">
        {searched && results.length > 0 && (
          <ul className="mt-4 space-y-3">
            {results.map((f) => (
              <li key={f.id} className="rounded-xl bg-areia-100 p-4">
                <p className="font-[560] text-grafite">{f.question}</p>
                <p className="mt-1 text-[0.92rem] text-grafite/85">{f.answer}</p>
                {f.anchor && (
                  <a
                    href={`${anchorBase}#${f.anchor}`}
                    className="mt-2 inline-block text-[0.88rem] text-mata underline decoration-areia decoration-2 underline-offset-4 hover:decoration-mata"
                  >
                    Ver a seção relacionada
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {searched && results.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-input p-4">
            <p className="text-[0.92rem] text-grafite/85">Nenhuma resposta cadastrada para essa pergunta.</p>
            <WaAction message={messages.duvida({ subject: 'pergunta feita no site', listing, question: q.trim() })} className="mt-3">
              Perguntar isso no WhatsApp
            </WaAction>
          </div>
        )}
      </div>
    </div>
  );
}
