import { useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Filters } from '@/lib/filters';
import type { CatalogOptions } from '@/lib/catalog-props';
import { ACCESS_TYPE_LABEL, RELIEF_LABEL } from '@/lib/listing';
import { formatCentsShort } from '@/lib/money';
import { formatArea } from '@/lib/area';
import { AREA_OPTIONS, PRICE_OPTIONS } from '@/data/home';
import { cn } from '@/lib/utils';

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  options: CatalogOptions;
  referenceCity: string;
  lockTipo: boolean;
  moreOpen: boolean;
  onToggleMore: () => void;
}

const selectCls =
  'h-11 w-full appearance-none rounded-[10px] border border-input bg-cal pl-3 pr-8 text-[0.95rem] text-grafite focus:border-mata';
const DIST_OPTIONS = [100, 150, 200, 250];

function Segmented<T extends string>({
  legend,
  value,
  onChange,
  items,
}: {
  legend: string;
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string }>;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[0.8rem] text-nevoa">{legend}</legend>
      <div className="flex rounded-[10px] bg-areia-100 p-1" role="radiogroup" aria-label={legend}>
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            role="radio"
            aria-checked={value === it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-[0.9rem] transition-colors',
              value === it.value ? 'bg-cal font-[600] text-mata shadow-sm' : 'text-grafite/75 hover:text-mata',
            )}
          >
            {it.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.88rem] transition-colors',
        pressed ? 'border-mata bg-mata text-cal' : 'border-input text-grafite/85 hover:border-mata hover:text-mata',
      )}
    >
      {pressed && <span aria-hidden="true">✓</span>}
      {children}
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-[0.8rem] text-nevoa">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-nevoa" aria-hidden="true">
          ▾
        </span>
      </div>
    </div>
  );
}

const numOrNull = (v: string) => (v === '' ? null : Number(v));
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function Filtros({ filters: f, onChange, options, referenceCity, lockTipo, moreOpen, onToggleMore }: Props) {
  const searchId = useId();
  const moreCount =
    f.relevo.length + f.acesso.length + f.infra.length + (f.distMaxKm !== null ? 1 : 0);
  const hasMore = options.relevos.length + options.acessos.length + options.infra.length > 0 || options.hasDistances;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_auto_auto]">
        <div className="min-w-0">
          <label htmlFor={searchId} className="mb-1 block text-[0.8rem] text-nevoa">
            Buscar por nome, cidade ou característica
          </label>
          <input
            id={searchId}
            type="search"
            value={f.q}
            placeholder="Ex.: nascente, Gonçalves, lago"
            onChange={(e) => onChange({ q: e.target.value })}
            className="h-11 w-full rounded-[10px] border border-input bg-cal px-3 text-[0.95rem] placeholder:text-nevoa/70 focus:border-mata"
          />
        </div>
        <Segmented
          legend="Onde"
          value={f.zona}
          onChange={(zona) => onChange({ zona })}
          items={[
            { value: 'todos', label: 'Todos' },
            { value: 'rural', label: 'No campo' },
            { value: 'urbano', label: 'Na cidade' },
          ]}
        />
        {!lockTipo && (
          <Segmented
            legend="Tipo de anúncio"
            value={f.tipo}
            onChange={(tipo) => onChange({ tipo })}
            items={[
              { value: 'todos', label: 'Todos' },
              { value: 'terreno', label: 'Terrenos' },
              { value: 'empreendimento', label: 'Empreendimentos' },
            ]}
          />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <SelectField label="Cidade ou região" value={f.local ?? ''} onChange={(v) => onChange({ local: v || null })}>
            <option value="">Todas</option>
            {options.locais.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </SelectField>
        </div>
        <SelectField
          label="Preço total de"
          value={f.precoMinCents === null ? '' : String(f.precoMinCents / 100)}
          onChange={(v) => onChange({ precoMinCents: v === '' ? null : Number(v) * 100 })}
        >
          <option value="">Sem mínimo</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {formatCentsShort(p * 100)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="até"
          value={f.precoMaxCents === null ? '' : String(f.precoMaxCents / 100)}
          onChange={(v) => onChange({ precoMaxCents: v === '' ? null : Number(v) * 100 })}
        >
          <option value="">Sem máximo</option>
          {PRICE_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {formatCentsShort(p * 100)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Área de"
          value={f.areaMinM2 === null ? '' : String(f.areaMinM2)}
          onChange={(v) => onChange({ areaMinM2: numOrNull(v) })}
        >
          <option value="">Sem mínimo</option>
          {AREA_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {formatArea(a)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="até"
          value={f.areaMaxM2 === null ? '' : String(f.areaMaxM2)}
          onChange={(v) => onChange({ areaMaxM2: numOrNull(v) })}
        >
          <option value="">Sem máximo</option>
          {[...AREA_OPTIONS, 100000, 200000].map((a) => (
            <option key={a} value={a}>
              {formatArea(a)}
            </option>
          ))}
        </SelectField>
      </div>

      {hasMore && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onToggleMore}
            aria-expanded={moreOpen}
            aria-controls="mais-filtros"
            className="inline-flex items-center gap-2 text-[0.92rem] font-[560] text-mata"
          >
            <span
              aria-hidden="true"
              className={cn('inline-block transition-transform duration-200', moreOpen && 'rotate-90')}
            >
              ›
            </span>
            Mais filtros
            {moreCount > 0 && (
              <span className="type-data rounded-full bg-mata px-2 text-[0.78rem] text-cal">{moreCount}</span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {moreOpen && (
              <motion.div
                id="mais-filtros"
                key="mais"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 0.8, 0.24, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 pt-4 md:grid-cols-2">
                  {options.infra.length > 0 && (
                    <fieldset>
                      <legend className="text-[0.85rem] text-grafite">Infraestrutura existente</legend>
                      <p className="text-[0.78rem] text-nevoa">Itens apenas previstos não contam.</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {options.infra.map((o) => (
                          <Chip key={o.key} pressed={f.infra.includes(o.key)} onClick={() => onChange({ infra: toggle(f.infra, o.key) })}>
                            {o.label}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {options.relevos.length > 0 && (
                    <fieldset>
                      <legend className="text-[0.85rem] text-grafite">Relevo</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {options.relevos.map((r) => (
                          <Chip key={r} pressed={f.relevo.includes(r)} onClick={() => onChange({ relevo: toggle(f.relevo, r) })}>
                            {RELIEF_LABEL[r]}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {options.acessos.length > 0 && (
                    <fieldset>
                      <legend className="text-[0.85rem] text-grafite">Tipo de acesso</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {options.acessos.map((a) => (
                          <Chip key={a} pressed={f.acesso.includes(a)} onClick={() => onChange({ acesso: toggle(f.acesso, a) })}>
                            {ACCESS_TYPE_LABEL[a]}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {options.hasDistances && (
                    <div className="max-w-xs">
                      <SelectField
                        label={`Distância até ${referenceCity}`}
                        value={f.distMaxKm === null ? '' : String(f.distMaxKm)}
                        onChange={(v) => onChange({ distMaxKm: numOrNull(v) })}
                      >
                        <option value="">Qualquer distância</option>
                        {DIST_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            Até {d} km (estimativa)
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
