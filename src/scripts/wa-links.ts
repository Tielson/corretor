/**
 * Comportamento dos botões estáticos "Perguntar ao corretor" / "Conversar".
 * Com telefone configurado, o link abre o WhatsApp normalmente.
 * Sem telefone, o clique copia a mensagem e explica o que falta.
 */
import { toast } from 'sonner';
import { copyText } from '@/lib/clipboard';
import { NO_PHONE_NOTICE, waConfigured } from '@/lib/wa-site';

document.addEventListener('click', async (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-wa-message]') : null;
  if (!target || waConfigured()) return;
  event.preventDefault();
  const message = target.dataset.waMessage ?? '';
  const ok = await copyText(message);
  toast(NO_PHONE_NOTICE, {
    description: ok
      ? 'A mensagem foi copiada. Cole no WhatsApp do corretor quando o número estiver disponível.'
      : 'Não foi possível copiar automaticamente. Selecione e copie o texto da mensagem.',
  });
});
