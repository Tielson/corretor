/**
 * Ação de WhatsApp dentro das ilhas. Com telefone configurado é um link real
 * para wa.me; sem telefone, copia a mensagem e explica o que falta.
 */
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { copyText } from '@/lib/clipboard';
import { NO_PHONE_NOTICE, waLinkFor } from '@/lib/wa-site';
import { cn } from '@/lib/utils';

export async function copyMessage(message: string, successTitle = 'Mensagem copiada') {
  const ok = await copyText(message);
  if (ok) toast.success(successTitle, { description: 'Cole a mensagem no WhatsApp do corretor.' });
  else toast.error('Não foi possível copiar', { description: 'Selecione o texto da mensagem e copie manualmente.' });
  return ok;
}

export async function notifyNoPhone(message: string) {
  const ok = await copyText(message);
  toast(NO_PHONE_NOTICE, {
    description: ok
      ? 'A mensagem foi copiada. Cole no WhatsApp do corretor quando o número estiver disponível.'
      : 'Não foi possível copiar automaticamente. Selecione e copie o texto da mensagem.',
  });
}

const VARIANTS = {
  primary: 'bg-mata text-cal hover:bg-mata-900',
  secondary: 'border border-input text-mata hover:border-mata hover:bg-areia-100',
  quiet: 'text-mata underline decoration-areia decoration-2 underline-offset-4 hover:decoration-mata',
} as const;

interface Props {
  message: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export function WaAction({ message, children, variant = 'primary', className }: Props) {
  const href = waLinkFor(message);
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-[10px] text-center font-[560] leading-snug transition-colors',
    variant !== 'quiet' && 'min-h-11 px-4 py-2',
    VARIANTS[variant],
    className,
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={() => void notifyNoPhone(message)}>
      {children}
    </button>
  );
}
