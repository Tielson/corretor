export type MediaType = 'foto' | 'aerea' | 'planta';

export interface Media {
  type: MediaType;
  /** Nome do arquivo em src/assets/demo/ (resolvido por src/lib/images.ts) ou caminho em /public. */
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Imagem ilustrativa: não mostra o imóvel anunciado. */
  illustrative: boolean;
  credit: string | null;
}

export type VideoPurpose = 'aerea' | 'acesso' | 'apresentacao' | 'infraestrutura' | 'planta';

export interface Video {
  purpose: VideoPurpose;
  provider: 'youtube' | 'vimeo';
  videoId: string;
  title: string;
  description: string;
  /** Capa local (mesma convenção de Media.url). */
  thumbnail: string;
  /** Legendas ou resumo textual, quando fornecidos. */
  captions: string | null;
  /** Vídeo demonstrativo: não é filmagem do anúncio. */
  demonstrativo: boolean;
}
