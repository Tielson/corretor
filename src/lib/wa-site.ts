/** Liga as mensagens ao telefone configurado em site.ts. */
import { site } from '@/config/site';
import { buildWaLink } from './whatsapp';

export const waConfigured = (): boolean => buildWaLink(site.whatsapp, 'x') !== null;

/** Link do WhatsApp ou null quando o telefone não está configurado. */
export const waLinkFor = (message: string): string | null => buildWaLink(site.whatsapp, message);

export const NO_PHONE_NOTICE = 'Telefone não configurado neste ambiente demonstrativo.';
