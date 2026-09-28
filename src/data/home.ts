import type { Video } from '@/types/media';
import videos from '@/assets/demo/videos.json';

const v = videos[0];

/** Vídeo da seção de apresentação da região na home (demonstrativo). */
export const homeVideo: Video | null = v
  ? {
      purpose: 'apresentacao',
      provider: 'youtube',
      videoId: v.videoId,
      title: 'Vídeo demonstrativo: a Serra da Mantiqueira vista do alto',
      description: `Sobrevoo de Itamonte (MG), publicado por ${v.author}. Mostra a paisagem da região, não um imóvel do catálogo.`,
      thumbnail: 'por-do-sol-serra.jpg',
      captions: 'Resumo: imagens aéreas de montanhas, vales e da cidade de Itamonte, no Sul de Minas. Sem narração.',
      demonstrativo: true,
    }
  : null;

/** Faixas da busca rápida (valores em reais e m²). */
export const PRICE_OPTIONS = [150000, 200000, 300000, 400000, 500000, 700000];
export const AREA_OPTIONS = [300, 1000, 2000, 5000, 10000, 20000, 50000];
