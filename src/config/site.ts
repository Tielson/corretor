/**
 * Configuração central da marca e do ambiente.
 *
 * Tudo que identifica o corretor (nome, região, contato, WhatsApp, dados
 * profissionais) vive aqui. Enquanto os dados reais não forem fornecidos,
 * os campos ficam com placeholders identificáveis entre colchetes ou vazios.
 */

export interface SiteConfig {
  brand: string;
  /** Região de atuação exibida no cabeçalho, rodapé e SEO. */
  regiao: string;
  /** Caminho em /public do logo. `null` usa o monograma textual. */
  logo: string | null;
  /** Número internacional, só dígitos (ex.: 5535999990000). Vazio = não configurado. */
  whatsapp: string;
  contato: {
    email: string;
    telefoneExibicao: string;
    endereco: string | null;
    horario: string | null;
  };
  profissional: {
    nome: string;
    /** Registro profissional (CRECI). Vazio = não informado. */
    creci: string;
    apresentacao: string | null;
    atuacaoLocal: string | null;
    foto: string | null;
  };
  /** Somente depoimentos fornecidos pelo corretor, com autorização. */
  depoimentos: Array<{ autor: string; texto: string; data: string }>;
  /** URL pública do site. Mantenha igual a `site` em astro.config.mjs. */
  siteUrl: string;
  /** false enquanto o catálogo for demonstrativo: todas as páginas saem com noindex. */
  indexable: boolean;
  /** Catálogo de demonstração: exibe avisos em todo o site. */
  demo: boolean;
  map: {
    tileUrl: string;
    attribution: string;
    maxZoom: number;
    /** Centro e zoom padrão do mapa do catálogo. */
    defaultCenter: { lat: number; lng: number };
    defaultZoom: number;
  };
  /** Cidade usada no filtro "distância até" e no trajeto. */
  cidadeReferencia: { nome: string; uf: string };
  /**
   * Caixa geográfica usada para posicionar os pinos na maquete em relevo.
   * Ajuste para a região de atuação real.
   */
  regiaoBounds: { north: number; south: number; east: number; west: number };
}

export const site: SiteConfig = {
  brand: '[NOME DA MARCA]',
  regiao: '[REGIÃO]',
  logo: null,
  whatsapp: '',
  contato: {
    email: '',
    telefoneExibicao: '',
    endereco: null,
    horario: null,
  },
  profissional: {
    nome: '[NOME DO CORRETOR]',
    creci: '',
    apresentacao: null,
    atuacaoLocal: null,
    foto: null,
  },
  depoimentos: [],
  siteUrl: 'https://example.com',
  indexable: false,
  demo: true,
  map: {
    // OpenStreetMap: uso moderado, sujeito à política de uso de tiles da OSMF.
    // Para tráfego real, configure um provedor com contrato (ver README).
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>',
    maxZoom: 18,
    defaultCenter: { lat: -22.72, lng: -46.02 },
    defaultZoom: 10,
  },
  cidadeReferencia: { nome: 'São Paulo', uf: 'SP' },
  regiaoBounds: { north: -22.08, south: -23.02, east: -45.42, west: -46.5 },
};

export const hasWhatsapp = (): boolean => site.whatsapp.replace(/\D/g, '').length >= 10;
