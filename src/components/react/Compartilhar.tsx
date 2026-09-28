import { toast } from 'sonner';
import { copyText } from '@/lib/clipboard';

interface Props {
  title: string;
  url: string;
  text?: string;
}

/** Web Share API no celular; fallback copia o link. */
export default function Compartilhar({ title, url, text }: Props) {
  const onClick = async () => {
    // Em ambiente local, compartilha o endereço aberto (a canonical aponta para o domínio configurado).
    const shareUrl = window.location.origin + window.location.pathname;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title, text, url: shareUrl || url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
      }
    }
    const ok = await copyText(shareUrl || url);
    if (ok) toast.success('Link copiado', { description: 'Cole onde quiser compartilhar.' });
    else toast.error('Não foi possível copiar o link');
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-[0.9rem] font-[560] text-grafite/80 hover:bg-areia-100 hover:text-mata"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      </svg>
      Compartilhar
    </button>
  );
}
