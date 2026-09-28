/**
 * Solicitação de visita: o visitante informa preferência de dia/período e
 * confirma a data com o corretor no WhatsApp. Nunca exibe "visita agendada".
 */
import { useId, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { messages } from '@/lib/whatsapp';
import { NO_PHONE_NOTICE, waLinkFor } from '@/lib/wa-site';
import { cn } from '@/lib/utils';
import { copyMessage } from './WaAction';

interface Props {
  listing: { kind: 'terreno' | 'empreendimento'; title: string; code: string; url: string };
}

const DAYS = ['Dia de semana', 'Sábado', 'Domingo', 'Qualquer dia'] as const;
const PERIODS = ['Manhã', 'Tarde', 'Qualquer período'] as const;

const schema = z.object({
  day: z.enum(DAYS, { message: 'Escolha uma preferência de dia.' }),
  period: z.enum(PERIODS),
  date: z.string().max(40),
  notes: z.string().max(400, 'Use até 400 caracteres.'),
});
type Values = z.infer<typeof schema>;

export default function SolicitarVisita({ listing }: Props) {
  const ids = { day: useId(), period: useId(), date: useId(), notes: useId() };
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { day: 'Qualquer dia', period: 'Qualquer período', date: '', notes: '' },
  });
  const v = useWatch({ control }) as Values;
  const message = useMemo(
    () =>
      messages.visita({
        ...listing,
        day: [v.day, v.date?.trim() ? `de preferência ${v.date.trim()}` : ''].filter(Boolean).join(', '),
        period: v.period,
        notes: v.notes,
      }),
    [listing, v],
  );
  const link = waLinkFor(message);

  const onOpen = handleSubmit(() => {
    if (link) window.open(link, '_blank', 'noopener');
  });
  const onCopy = handleSubmit(() => void copyMessage(message, 'Solicitação copiada'));
  const field = 'h-11 w-full appearance-none rounded-[10px] border border-input bg-cal px-3 text-[0.95rem] focus:border-mata';

  return (
    <form onSubmit={onOpen} noValidate className="space-y-4">
      <p className="text-grafite/85">
        Esta é uma <strong className="font-[620] text-mata">solicitação</strong>: você confirma a data com o corretor no
        WhatsApp.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={ids.day} className="mb-1 block text-[0.82rem] text-nevoa">
            Dia de preferência
          </label>
          <select id={ids.day} {...register('day')} className={field} aria-invalid={errors.day ? true : undefined}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.period} className="mb-1 block text-[0.82rem] text-nevoa">
            Período
          </label>
          <select id={ids.period} {...register('period')} className={field}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.date} className="mb-1 block text-[0.82rem] text-nevoa">
            Data que você prefere (opcional)
          </label>
          <input id={ids.date} {...register('date')} placeholder="Ex.: 12 de outubro" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor={ids.notes} className="mb-1 block text-[0.82rem] text-nevoa">
          Observação (opcional)
        </label>
        <textarea
          id={ids.notes}
          rows={2}
          {...register('notes')}
          aria-invalid={errors.notes ? true : undefined}
          placeholder="Ex.: vou com a família, prefiro encontrar na entrada"
          className="w-full rounded-[10px] border border-input bg-cal px-3 py-2.5 text-[0.95rem] placeholder:text-nevoa/70 focus:border-mata"
        />
        {errors.notes && <p className="mt-1 text-[0.85rem] text-destructive">{errors.notes.message}</p>}
      </div>
      <div className="rounded-xl bg-areia-100 p-4">
        <p className="text-[0.8rem] text-nevoa">Mensagem de solicitação</p>
        <p className="mt-1 text-[0.92rem] text-grafite">{message}</p>
      </div>
      {!link && (
        <p className="rounded-xl border border-st-reservado/30 bg-st-reservado-bg px-4 py-3 text-[0.9rem] text-st-reservado" role="note">
          {NO_PHONE_NOTICE} Copie a solicitação e envie ao corretor quando o número estiver disponível.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {link && (
          <button type="submit" className="min-h-12 rounded-[10px] bg-mata px-5 font-[600] text-cal hover:bg-mata-900">
            Enviar solicitação pelo WhatsApp
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
          Copiar solicitação
        </button>
      </div>
    </form>
  );
}
