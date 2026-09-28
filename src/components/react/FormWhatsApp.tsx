/**
 * Formulário que PREPARA a mensagem de WhatsApp (não envia nem armazena nada).
 * Assuntos rápidos + pergunta livre; a prévia mostra exatamente o texto.
 */
import { useId, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QUICK_SUBJECTS, messages, type QuickSubject } from '@/lib/whatsapp';
import { NO_PHONE_NOTICE, waLinkFor } from '@/lib/wa-site';
import { INTERESSE_LABEL } from '@/lib/listing';
import { formatCentsShort } from '@/lib/money';
import { formatArea } from '@/lib/area';
import { AREA_OPTIONS, PRICE_OPTIONS } from '@/data/home';
import { cn } from '@/lib/utils';
import { copyMessage } from './WaAction';

type ListingRef = { kind: 'terreno' | 'empreendimento'; title: string; code: string; url: string };

type Props =
  | { mode: 'anuncio'; listing: ListingRef }
  | { mode: 'naoEncontrou'; regioes: string[] };

const subjectKeys = QUICK_SUBJECTS.map((s) => s.key) as [QuickSubject, ...QuickSubject[]];

const schema = z.object({
  subjects: z.array(z.enum(subjectKeys)),
  question: z.string().max(600, 'Use até 600 caracteres.'),
  objetivo: z.string(),
  regiao: z.string(),
  orcamento: z.string(),
  area: z.string(),
});
type Values = z.infer<typeof schema>;

const fieldCls =
  'h-11 w-full appearance-none rounded-[10px] border border-input bg-cal px-3 text-[0.95rem] text-grafite focus:border-mata';

export default function FormWhatsApp(props: Props) {
  const ids = { q: useId(), obj: useId(), reg: useId(), orc: useId(), area: useId() };
  const {
    register,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { subjects: [], question: '', objetivo: '', regiao: '', orcamento: '', area: '' },
  });
  const v = useWatch({ control }) as Values;

  const message = useMemo(() => {
    if (props.mode === 'anuncio') {
      return messages.anuncio({ ...props.listing, subjects: v.subjects ?? [], question: v.question });
    }
    return messages.naoEncontrou({
      objetivo: v.objetivo ? INTERESSE_LABEL[v.objetivo as keyof typeof INTERESSE_LABEL] ?? v.objetivo : null,
      regiao: v.regiao || null,
      orcamento: v.orcamento ? `até ${formatCentsShort(Number(v.orcamento) * 100)}` : null,
      area: v.area ? `a partir de ${formatArea(Number(v.area))}` : null,
      texto: v.question,
    });
  }, [props, v]);

  const link = waLinkFor(message);
  const toggle = (key: QuickSubject) => {
    const cur = getValues('subjects') ?? [];
    setValue('subjects', cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key], { shouldDirty: true });
  };

  const onOpen = handleSubmit(() => {
    if (link) window.open(link, '_blank', 'noopener');
  });
  const onCopy = handleSubmit(() => void copyMessage(message));

  return (
    <form onSubmit={onOpen} noValidate className="space-y-5">
      {props.mode === 'anuncio' ? (
        <fieldset>
          <legend className="text-[0.92rem] text-grafite">Sobre o que você quer saber?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_SUBJECTS.map((s) => {
              const on = (v.subjects ?? []).includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.9rem] transition-colors',
                    on ? 'border-mata bg-mata text-cal' : 'border-input text-grafite/85 hover:border-mata hover:text-mata',
                  )}
                >
                  {on && <span aria-hidden="true">✓</span>}
                  {s.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor={ids.obj} className="mb-1 block text-[0.82rem] text-nevoa">
              Objetivo
            </label>
            <select id={ids.obj} {...register('objetivo')} className={fieldCls}>
              <option value="">Ainda não sei</option>
              {Object.entries(INTERESSE_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.reg} className="mb-1 block text-[0.82rem] text-nevoa">
              Região
            </label>
            <select id={ids.reg} {...register('regiao')} className={fieldCls}>
              <option value="">Qualquer região</option>
              {props.regioes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.orc} className="mb-1 block text-[0.82rem] text-nevoa">
              Orçamento
            </label>
            <select id={ids.orc} {...register('orcamento')} className={fieldCls}>
              <option value="">Não definido</option>
              {PRICE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  Até {formatCentsShort(p * 100)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.area} className="mb-1 block text-[0.82rem] text-nevoa">
              Área
            </label>
            <select id={ids.area} {...register('area')} className={fieldCls}>
              <option value="">Qualquer área</option>
              {AREA_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  A partir de {formatArea(a)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label htmlFor={ids.q} className="mb-1 block text-[0.92rem] text-grafite">
          {props.mode === 'anuncio' ? 'Sua pergunta (opcional)' : 'Conte o que você procura (opcional)'}
        </label>
        <textarea
          id={ids.q}
          rows={3}
          {...register('question')}
          aria-invalid={errors.question ? true : undefined}
          aria-describedby={errors.question ? `${ids.q}-erro` : undefined}
          placeholder={props.mode === 'anuncio' ? 'Ex.: dá para chegar de carro comum em época de chuva?' : 'Ex.: chácara com água, até 1 hora de estrada de terra'}
          className="w-full rounded-[10px] border border-input bg-cal px-3 py-2.5 text-[0.95rem] placeholder:text-nevoa/70 focus:border-mata"
        />
        {errors.question && (
          <p id={`${ids.q}-erro`} className="mt-1 text-[0.85rem] text-destructive">
            {errors.question.message}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-areia-100 p-4">
        <p className="text-[0.8rem] text-nevoa">Mensagem que será enviada por você</p>
        <p className="mt-1 whitespace-pre-wrap text-[0.92rem] text-grafite">{message}</p>
      </div>

      {!link && (
        <p className="rounded-xl border border-st-reservado/30 bg-st-reservado-bg px-4 py-3 text-[0.9rem] text-st-reservado" role="note">
          {NO_PHONE_NOTICE} Copie a mensagem e envie ao corretor quando o número estiver disponível.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {link && (
          <button type="submit" className="min-h-12 rounded-[10px] bg-mata px-5 font-[600] text-cal hover:bg-mata-900">
            Abrir WhatsApp
          </button>
        )}
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            'min-h-12 rounded-[10px] px-5 font-[600]',
            link ? 'border border-input text-mata hover:bg-areia-100' : 'bg-mata text-cal hover:bg-mata-900',
          )}
        >
          Copiar mensagem
        </button>
      </div>
      <p className="text-[0.8rem] text-nevoa">O site só prepara o texto. Nada é enviado ou guardado sem você.</p>
    </form>
  );
}
