# Spec executável: site de terrenos rurais e urbanos (Astro + React)

> Documento de execução para o Claude Code. Reescrito a partir do briefing original em 2026-09-27, com decisões técnicas fixadas, modelo de dados, regras invariantes e fases ordenadas com critérios de aceite. Nenhuma regra do briefing foi removida; elas foram reorganizadas nas seções 4 (regras) e 5 (fases).

---

## 0. Como executar este documento

Atue como especialista em produto digital, UX/UI e desenvolvimento frontend. Crie um site completo para um corretor ou imobiliária especializado em terrenos e empreendimentos rurais, com uma categoria secundária de terrenos urbanos.

O site deve permitir que o visitante pesquise, conheça os locais, entenda as condições divulgadas e esclareça dúvidas com o conteúdo disponível. Quando precisar de atendimento, deve chegar ao WhatsApp do corretor com o contexto do imóvel e da pergunta.

**Modo de execução:**

1. Comece apresentando brevemente a estrutura escolhida (2 a 3 parágrafos) e depois implemente.
2. Execute as fases da seção 5 **na ordem**, uma por vez. Não avance para a próxima fase antes de a atual cumprir seus critérios de aceite.
3. Ao final de cada fase, rode `pnpm build` e `pnpm astro check` (e `pnpm test` a partir da Fase 1). Só avance com todos verdes. Se algo falhar, corrija antes de prosseguir.
4. O projeto é criado **na raiz desta pasta** (`corretor/`), ao lado deste arquivo. Não crie subpasta de projeto.
5. Tome decisões razoáveis de layout e componentes, mantendo as regras da seção 4. Quando o briefing não cobrir um detalhe, escolha a opção mais simples que preserve as regras.
6. Quando uma regra da seção 4 conflitar com uma conveniência de implementação, a regra vence.
7. Ao concluir a Fase 6, percorra o checklist da seção 6 e reporte item a item o que foi verificado, o que falhou e o que ficou pendente.

---

## 1. Decisões técnicas fixadas

### 1.1 Versões (estáveis em 2026-09-27; use estas ou patches compatíveis)

| Pacote | Versão | Observação |
|---|---|---|
| Node.js | 24.x | Já instalado (24.15). Apenas dev e build; nenhum servidor em produção. |
| pnpm | 11.x | Gerenciador de pacotes do projeto. Todos os comandos do README usam pnpm. |
| astro | ^7.3 | `output: 'static'`. Roteamento do Astro; páginas geradas no build. |
| @astrojs/react | ^7.0 | Ilhas React. |
| @astrojs/sitemap | ^3.7 | Sitemap gerado no build. |
| react / react-dom | ^19.3 | |
| typescript | ^7.0 | Modo `strict`. **Risco:** TS 7 é o compilador nativo; se `astro check` falhar por incompatibilidade, fixe `typescript@^5.9` e registre no README. |
| tailwindcss + @tailwindcss/vite | ^4.3 | Tailwind 4 via plugin Vite. **Não** usar `@astrojs/tailwind` (obsoleto). |
| shadcn (CLI) | ^4.21 | `pnpm dlx shadcn@latest init`, com Tailwind 4 e tokens CSS em `src/styles/global.css`. |
| lucide-react | ^1.48 | Ícones. |
| react-hook-form | ^7.89 | Formulários. |
| zod | ^4.6 | Validação. Usar `zod` v4 (import de `zod`). |
| sonner | ^2.0 | Toasts de feedback. |
| leaflet + react-leaflet | 1.9.x / ^5.0 | Apenas em ilhas `client:only="react"`. |
| vitest | última estável | Testes unitários das funções puras em `src/lib`. |

### 1.2 Comandos de scaffold (Fase 0)

```bash
pnpm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
pnpm install
pnpm astro add react sitemap
pnpm add tailwindcss @tailwindcss/vite
pnpm dlx shadcn@latest init
pnpm add lucide-react react-hook-form zod sonner leaflet react-leaflet
pnpm add -D @types/leaflet vitest
```

Scripts esperados no `package.json`: `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run`).

### 1.3 Regras técnicas fixas

- Site estático completo. Node.js só em desenvolvimento e build; nenhum servidor de aplicação em produção. Os dados são atualizados nos arquivos do projeto e o site é publicado novamente. Disponibilidade e preços representam a última atualização editorial, sem sincronização em tempo real.
- O conteúdo principal de cada anúncio deve estar no HTML estático. Carregue JavaScript somente nas partes interativas (ilhas React com `client:visible`, `client:idle` ou `client:only` conforme o caso).
- **Não implemente** login, painel administrativo, banco de dados ou API própria. Os formulários organizam a mensagem e abrem o WhatsApp; não armazenam leads nem confirmam agendamentos. **Não** adicione React Query apenas para acessar dados locais.
- Leaflet e React Leaflet só podem ser importados dentro de componentes carregados com `client:only="react"`. Nenhum import de `leaflet` pode ser alcançado por código que roda no build.
- `localStorage` (favoritos e comparação) fica atrás de um wrapper `safeStorage` em `src/lib/storage.ts` com `try/catch`, verificação de `typeof window`, e fallback em memória quando o armazenamento estiver indisponível. Leia localStorage apenas no navegador (nunca em render inicial de SSR/build).
- Enquanto o catálogo for demonstrativo, toda página emite `<meta name="robots" content="noindex">`, controlado por `site.indexable = false` em `src/config/site.ts`. O README documenta como ativar a indexação após substituir os exemplos por dados reais.
- Provedor de tiles do mapa configurável em `src/config/site.ts` (URL template, atribuição, `maxZoom`), com atribuição sempre exibida. Não presuma uso ilimitado dos servidores públicos do OpenStreetMap nem disponibilidade de imagens de satélite.
- Links de navegação externa usam Maps URLs do Google (`https://www.google.com/maps/search/?api=1&query=lat,lng` e `https://www.google.com/maps/dir/?api=1&destination=lat,lng`). Isso é separado do provedor do mapa incorporado.
- Geração de links de WhatsApp centralizada em `src/lib/whatsapp.ts`: `https://wa.me/NUMERO?text=MENSAGEM`, número internacional apenas com dígitos, mensagem codificada com `encodeURIComponent`.
- Use português brasileiro, valores em reais (R$) e áreas em m² e hectares. Adote 1 ha = 10.000 m². Não use alqueires ou tarefas sem uma conversão regional explicitamente configurada.

---

## 2. Estrutura de pastas alvo

```
corretor/
├── astro.config.mjs               # output static, react, sitemap, tailwind vite plugin, site URL
├── package.json
├── tsconfig.json                  # strict, paths @/*
├── components.json                # shadcn
├── README.md
├── public/
│   ├── robots.txt
│   ├── og-fallback.jpg
│   └── demo/                      # imagens, plantas (PNG/PDF) e capas de vídeo demonstrativas
└── src/
    ├── config/
    │   └── site.ts                # marca, região, logo, contato, WhatsApp, dados profissionais,
    │                              # tiles do mapa, cidade de referência, indexable, siteUrl
    ├── types/
    │   ├── listing.ts             # Listing, Terreno, Empreendimento
    │   ├── lot.ts                 # Lot, LotStatus
    │   ├── media.ts               # Media, Video
    │   ├── infrastructure.ts      # Infrastructure, InfraItem
    │   ├── commercial.ts          # CommercialTerms
    │   ├── location.ts            # Location, Distance, Access
    │   └── faq.ts                 # Faq
    ├── data/
    │   ├── listings/              # um arquivo TS por anúncio (8 no total)
    │   ├── index.ts               # catálogo agregado + helpers de acesso (getBySlug, published)
    │   └── faq-geral.ts
    ├── content/                   # content collections em Markdown (dúvidas gerais, textos explicativos)
    │   └── duvidas/
    ├── lib/
    │   ├── money.ts               # centavos -> "R$ 1.234,56"; "Preço sob consulta"
    │   ├── area.ts                # m² <-> ha, formatação, intervalos
    │   ├── filters.ts             # aplicação de filtros combináveis (regra "mesmo lote")
    │   ├── sort.ts                # destaque, menor preço, maior área, atualização
    │   ├── match.ts               # busca guiada: regras transparentes + explicação
    │   ├── whatsapp.ts            # buildWaLink + templates por origem
    │   ├── maps.ts                # Maps URLs (abrir, rota) a partir de Location
    │   ├── storage.ts             # safeStorage
    │   ├── url-state.ts           # filtros <-> query string
    │   └── seo.ts                 # título, descrição, canonical, OG por página
    ├── styles/
    │   └── global.css             # Tailwind 4 + tokens shadcn + paleta da marca
    ├── layouts/
    │   └── Base.astro             # head/SEO, header, footer, sonner, barra mobile opcional
    ├── components/
    │   ├── ui/                    # shadcn (button, card, badge, dialog, sheet, tabs, input, select, ...)
    │   ├── astro/                 # Header, Footer, Hero, ListingCard, SectionHome*, SeoHead,
    │   │                          # InfoRow ("Informação não disponibilizada" + "Perguntar ao corretor")
    │   └── react/                 # ilhas: Catalogo, MapaLeaflet, PlantaSvg, PlantaImagem,
    │                              # FavoritoButton, Comparador, BuscaGuiada, FormWhatsApp,
    │                              # SolicitarVisita, VideoFacade, BuscaFaq, BarraMobile, BuscaRapida
    └── pages/
        ├── index.astro
        ├── terrenos/index.astro          # catálogo (todos; filtros via URL)
        ├── terrenos/[slug].astro         # detalhe de terreno avulso
        ├── empreendimentos/index.astro   # catálogo filtrado por tipo=empreendimento
        ├── empreendimentos/[slug].astro  # detalhe de empreendimento (lotes, planta)
        ├── sobre.astro
        ├── duvidas.astro
        ├── favoritos.astro
        ├── comparar.astro
        └── 404.astro
```

Separe páginas, componentes, dados, tipos e funções utilitárias. Não misture responsabilidades entre anúncio, empreendimento, lote, mídia, infraestrutura, condições comerciais, localização e FAQ.

---

## 3. Modelo de dados (contratos)

Todos os tipos vivem em `src/types/`. Os dados demo em `src/data/` devem tipar contra eles.

### 3.1 Convenções gerais

- Identificadores estáveis (`id`), `slug` estável e único, `code` (código do anúncio exibido ao visitante).
- `status: 'publicado' | 'rascunho'`; apenas `publicado` aparece no site.
- `updatedAt: string` (ISO 8601) em anúncio, lote, condições comerciais e bloco documental.
- Valores ausentes **explícitos**: `null`, nunca `undefined` implícito ou string vazia com significado.
- Valores monetários em **centavos** (`number`); `null` significa "sob consulta".
- Áreas em **m²** como unidade interna (`areaM2: number`); exibição em ha quando ≥ 10.000 m².
- Materiais públicos contêm somente informações destinadas à divulgação; nenhum documento pessoal ou dado de proprietário.

### 3.2 Tipos

```ts
type Zone = 'rural' | 'urbano';
type ListingKind = 'terreno' | 'empreendimento';
type Interesse = 'lazer' | 'chacara' | 'moradia' | 'uso_rural';

interface ListingBase {
  id: string; slug: string; code: string;
  kind: ListingKind; zone: Zone;              // zona é campo separado do tipo
  title: string; municipio: string; uf: string; regiao: string | null;
  summary: string; description: string; regionInfo: string | null;
  highlights: string[];                       // até 3 exibidos no card
  interesses: Interesse[];                    // preferências de busca, não garantia de adequação
  media: Media[]; videos: Video[];
  location: Location; access: Access;
  features: Features;                         // água, energia, internet, relevo, cercamento...
  infrastructure: Infrastructure;
  commercial: CommercialTerms | null;
  documents: DocumentInfo | null;
  faq: Faq[]; related: string[];              // ids relacionados
  featured: boolean; status: 'publicado' | 'rascunho'; updatedAt: string;
  availability: string | null;                // disponibilidade informada (texto editorial)
}

interface Terreno extends ListingBase { kind: 'terreno'; areaM2: number; priceCents: number | null; }

interface Empreendimento extends ListingBase {
  kind: 'empreendimento';
  lots: Lot[];
  plan: Plan | null;                          // planta
}
type Listing = Terreno | Empreendimento;

type LotStatus = 'disponivel' | 'reservado' | 'vendido' | 'sob_consulta';
interface Lot {
  id: string; number: string; block: string | null;
  areaM2: number; dimensions: string | null;  // medidas disponíveis, texto
  priceCents: number | null; status: LotStatus; updatedAt: string;
  polygon: Array<[number, number]> | null;    // pontos no viewBox do SVG; null = sem geometria
}

interface Plan {
  kind: 'svg' | 'imagem';
  viewBox: string | null;                     // obrigatório quando kind = 'svg'
  imageUrl: string | null; pdfUrl: string | null;
  demonstrativa: boolean;                     // identifica planta ilustrativa
  updatedAt: string;
}

type InfraStatus = 'existente' | 'prevista' | 'nao_informada';
interface InfraItem { key: string; label: string; status: InfraStatus; note: string | null; }
interface Infrastructure { items: InfraItem[]; }   // filtros consultam apenas status = 'existente'

interface CommercialTerms {
  priceCents: number | null; downPaymentCents: number | null;
  installments: number | null; installmentCents: number | null;
  adjustments: string | null; charges: string | null; updatedAt: string;
}

interface Location {
  center: { lat: number; lng: number };
  entrance: { lat: number; lng: number } | null;   // ponto de chegada separado do centro
  precision: 'exata' | 'aproximada';
  addressText: string | null; references: string[];
  distances: Distance[];
}
interface Distance { label: string; km: number; minutes: number | null; source: string; nature: 'estimativa' | 'medida'; }
interface Access { highway: string | null; dirtRoadKm: number | null; conditions: string | null; arrivalPoint: string | null; }

interface Features {
  water: string | null; energy: string | null; internet: string | null;
  relief: 'plano' | 'suave' | 'acidentado' | null; fencing: string | null;
  accessType: 'asfalto' | 'terra' | 'misto' | null; extra: Record<string, string | null>;
}

interface Media { type: 'foto' | 'aerea' | 'planta'; url: string; alt: string; width: number; height: number; illustrative: boolean; credit: string | null; }
interface Video {
  purpose: 'aerea' | 'acesso' | 'apresentacao' | 'infraestrutura' | 'planta';
  provider: 'youtube' | 'vimeo'; videoId: string; title: string; description: string;
  thumbnail: string; captions: string | null; demonstrativo: boolean;
}
interface DocumentInfo { text: string; updatedAt: string; }   // informações documentais fornecidas pelo responsável
interface Faq { id: string; question: string; answer: string; topic: string; anchor: string | null; keywords: string[]; }
```

### 3.3 Regras derivadas obrigatórias

- **Preço/área de referência de empreendimento** derivam dos lotes com status `disponivel`. "A partir de" só quando houver um valor de referência consistente com os lotes disponíveis. Intervalo de áreas = min/max dos lotes disponíveis.
- **Regra do mesmo lote**: nos filtros de preço e área aplicados a empreendimentos, o resultado só é elegível se **pelo menos um mesmo lote** satisfizer simultaneamente preço e área. Não combine o preço de um lote com a área de outro.
- **Sob consulta ≠ zero**: `priceCents: null` nunca entra como 0 em filtros ou ordenação; vai para o final na ordenação por preço e é exibido como "Preço sob consulta".
- **Infraestrutura**: um item `prevista` não satisfaz o filtro de infraestrutura existente. Os três grupos são exibidos separadamente.

---

## 4. Regras invariantes (do briefing)

### 4.1 Posicionamento e linguagem

- Priorize pessoas procurando espaço para lazer, uma chácara, moradia próxima à natureza ou uma área para uso rural. Apresente esses interesses como preferências de busca; a adequação de cada terreno depende das informações confirmadas para aquele anúncio.
- A experiência deve transmitir proximidade, transparência e conhecimento da região. A ação principal é "Conversar sobre este terreno"; a secundária é "Solicitar uma visita".
- Diferencie empreendimento (pode agrupar vários lotes) de terreno avulso (vendido como uma unidade). A localização rural ou urbana é uma informação separada do tipo do anúncio.
- A prioridade rural deve aparecer na mensagem, nas imagens e na ordenação inicial.
- Não deduza permissão para construir, financiamento, regularidade ou disponibilidade de infraestrutura. Quando uma informação não estiver cadastrada, mostre "Informação não disponibilizada" e a ação "Perguntar ao corretor".
- Depoimentos, dados profissionais, números de vendas e afirmações sobre os imóveis só aparecem quando fornecidos. Não prometa valorização ou retorno financeiro.
- Identifique o catálogo como demonstração. Não apresente dados fictícios como ofertas reais. Sinalize fotografias ilustrativas.

### 4.2 Identidade visual

- Estética contemporânea, acolhedora e ligada à natureza: verde profundo, tons de areia, branco quente e detalhes terrosos. Garanta contraste e boa legibilidade.
- Valorize fotografias amplas, paisagens, imagens aéreas e vídeos reais. Tipografia clara, espaços confortáveis, animações discretas. O foco visual permanece no terreno, no acesso e nas informações.
- Planeje primeiro para celular. Evite vídeos automáticos, efeitos 3D pesados e elementos que atrapalhem a navegação em conexões lentas.
- Centralize nome da marca, região de atuação, logo, contato, WhatsApp e dados profissionais em `src/config/site.ts`. Use placeholders identificáveis (ex.: `[NOME DA MARCA]`, `[REGIÃO]`, telefone vazio) enquanto os dados reais não forem fornecidos.
- Use imagens licenciadas.

### 4.3 Página inicial

Inclua, nesta ordem aproximada:

1. Cabeçalho com logo, Terrenos, Empreendimentos, Sobre, Dúvidas e contato.
2. Foto de destaque e uma mensagem como "Seu próximo lugar começa perto da natureza".
3. Busca rápida por cidade ou região, faixa de preço e área (leva ao catálogo com filtros na URL).
4. Atalhos para "No campo", "Na cidade" e interesses como lazer ou moradia, **quando sustentados pelos dados** (não exibir atalho sem anúncio correspondente).
5. Empreendimentos rurais em destaque.
6. Seção secundária de oportunidades urbanas.
7. Vídeo de apresentação do corretor ou da região, quando disponível.
8. Explicação breve de como funciona: explorar, tirar dúvidas e solicitar visita.
9. Apresentação do corretor e de sua atuação local.
10. Perguntas frequentes.
11. Chamada "Não encontrou o que procura?" que prepara uma conversa no WhatsApp com as preferências do visitante.

A busca deve mostrar claramente se está exibindo todos os anúncios ou apenas uma categoria.

### 4.4 Catálogo e busca

- Listagem com busca textual, filtros combináveis, quantidade de resultados, ordenação, limpeza de filtros e estado sem resultados.
- Filtros principais: rural/urbano/todos, município ou região, preço total, área e tipo de anúncio. Em "Mais filtros": relevo, tipo de acesso, água, energia e distância de uma cidade de referência, quando existirem esses dados.
- Separe "infraestrutura existente", "prevista" e "não informada". Um item previsto não pode satisfazer o filtro de infraestrutura existente.
- m² como unidade interna para comparar áreas, permitindo exibição em hectares.
- Em empreendimentos, preço e área devem corresponder a pelo menos um mesmo lote elegível.
- Alternar entre cards e mapa. Os filtros refletem nos dois modos e na URL para que a pesquisa possa ser compartilhada.
- Ordenar por destaque, menor preço, maior área e atualização. Valores "sob consulta" não são tratados como zero.
- Sem resultados: ofereça ajustar os filtros ou enviar a busca ao corretor (WhatsApp com os filtros aplicados).

### 4.5 Cards dos anúncios

- Mostre foto, nome, município/UF, categoria (rural/urbano + tipo), área ou intervalo de áreas, preço total ou "a partir de", e até três características relevantes.
- Inclua favoritar e "Ver detalhes".
- "A partir de" apenas com valor de referência consistente com os lotes disponíveis no catálogo.
- "Preço sob consulta" quando necessário. Separe visualmente preço total, entrada e parcela. Nunca destaque uma parcela como se fosse o preço do terreno.

### 4.6 Página de detalhes

Cada anúncio tem URL própria e compartilhável, com:

- Galeria de fotos, imagens aéreas e vídeos.
- Nome, código do anúncio, localização, área, preço e disponibilidade informada.
- Resumo com os principais atributos.
- Descrição objetiva e informações da região.
- Acesso: rodovia de referência, trecho de estrada de terra, condições informadas e ponto de chegada.
- Água, energia, internet, relevo, cercamento e demais características cadastradas.
- Distância e tempo estimado até pontos de referência, com origem e natureza da estimativa identificadas.
- Infraestrutura existente e prevista em grupos separados.
- Condições comerciais: preço, entrada, quantidade de parcelas, reajustes ou encargos **somente quando fornecidos**.
- Informações documentais fornecidas pelo responsável, com data da atualização e ação para esclarecer dúvidas.
- Mapa, planta, materiais disponíveis e perguntas específicas do anúncio.
- Outros terrenos relacionados.
- Ações para conversar, compartilhar e solicitar visita.

No celular, barra inferior compacta com contato, respeitando a área segura da tela (`env(safe-area-inset-bottom)`) e sem cobrir conteúdo (padding-bottom compensatório no conteúdo).

### 4.7 Vídeos

- Organize por finalidade: visão aérea, acesso ao local, apresentação do corretor, infraestrutura e explicação da planta.
- Exiba capa, título e descrição curta. Carregue o player de YouTube ou Vimeo **somente após interação**, com opção de abrir na plataforma se a incorporação falhar.
- Inclua legendas ou resumo textual quando fornecidos.
- Vídeos demonstrativos devem ser identificados e não podem ser apresentados como filmagens reais de um empreendimento fictício.

### 4.8 Mapas e localização

- Marcadores sincronizados com os anúncios no catálogo e um mapa específico em cada página de detalhe.
- Use coordenadas cadastradas, identificação de localização exata ou aproximada e, quando informado, um ponto de entrada separado do centro do terreno. O botão de rota usa o acesso confirmado (`entrance` quando existir; senão `center` com aviso de "localização aproximada").
- Ofereça "Abrir no Google Maps" e "Traçar rota".
- Provedor de tiles configurável, com atribuição e condições de uso mantidas.
- Se o mapa não carregar, preserve endereço, referências e links externos (renderizados no HTML estático, fora da ilha).
- Distâncias e tempos cadastrados aparecem como estimativas; não invente cálculos de trânsito ou rotas em tempo real.

### 4.9 Plantas e seleção de lotes

- Permita ampliar e baixar plantas existentes em imagem ou PDF.
- Nos empreendimentos com dados geométricos, planta SVG com zoom, deslocamento, legenda e seleção de lote. Mostre número, quadra, área, medidas disponíveis, preço, situação e data da atualização.
- A seleção abre um painel com os dados e o botão "Tenho interesse neste lote". A mensagem do WhatsApp inclui empreendimento, quadra e lote.
- Diferencie disponível, reservado, vendido e sob consulta com **cor e texto**.
- Lista acessível dos lotes com a mesma seleção, inclusive para teclado (a lista e o SVG compartilham o mesmo estado de seleção).
- Caso só exista uma imagem, apresente-a com zoom e uma lista independente de lotes. **Não invente polígonos** sobre a imagem.
- Identifique plantas demonstrativas ou ilustrativas; não as apresente como levantamento técnico.

### 4.10 WhatsApp com contexto

- Geração de links centralizada (`src/lib/whatsapp.ts`), formato `https://wa.me/NUMERO?text=MENSAGEM`.
- Mensagens diferentes conforme a origem: anúncio, lote, dúvida, comparação, busca sem resultados, solicitação de visita e "não encontrou" da home.
- Exemplo: "Olá! Vi o empreendimento [nome] e tenho interesse no lote [número], de [área]. Gostaria de saber sobre [assunto]. Link: [URL]."
- Assuntos rápidos: acesso, água, energia, documentação, pagamento e visita. O visitante também pode escrever uma pergunta.
- A visita é uma **solicitação**: o usuário informa preferência de dia ou período e confirma com o corretor no WhatsApp. Nunca exiba "visita agendada" ao abrir o aplicativo.
- O site apenas prepara a mensagem; o visitante a envia. Ofereça "Copiar mensagem" como alternativa.
- Se o telefone não estiver configurado (`site.whatsapp` vazio), informe isso no ambiente demonstrativo e ofereça copiar a mensagem; não encaminhe para um número inventado.

### 4.11 Conteúdo que resolve dúvidas

- Página de dúvidas gerais e perguntas relacionadas a cada empreendimento. Temas: localização, acesso, visita, medidas, infraestrutura, condições comerciais e quais informações solicitar ao corretor.
- Respostas curtas com base no conteúdo cadastrado e links para as seções correspondentes (âncoras).
- Busca local por palavras-chave. Sem resposta: "Perguntar isso no WhatsApp", preservando o texto digitado. Não simule respostas de inteligência artificial.

### 4.12 Favoritos, comparação e busca guiada

- Favoritos sem cadastro (localStorage via `safeStorage`).
- Comparação de até três opções: preço total, área, localização, acesso, relevo, água, energia e condições disponíveis. Para empreendimentos, identifique se a comparação se refere ao conjunto ou a um lote específico.
- Busca guiada curta: objetivo de uso, região, orçamento e área desejada. Resultados por regras transparentes, com explicação da correspondência (ex.: "Dentro do orçamento informado e na região escolhida").
- Se nenhuma opção atender a todos os critérios, diga isso e ofereça enviar as preferências ao corretor. Não apresente correspondências parciais como se cumprissem todos os requisitos.

### 4.13 Desempenho, acessibilidade e descoberta

- HTML estático por anúncio, título e descrição exclusivos, URL canônica, Open Graph com imagem do imóvel, sitemap e robots.txt. Tudo usado em compartilhamentos existe no HTML do build.
- Imagens responsivas em formatos modernos (`astro:assets` / `<Image>` / `<Picture>`), carregamento tardio abaixo da primeira tela, mapa e player sob demanda. Preserve `width`/`height` para evitar deslocamento de layout.
- Navegação por teclado, foco visível, formulários rotulados, texto alternativo, `prefers-reduced-motion`. Não dependa exclusivamente de cor.
- Estados claros para: mídia indisponível, anúncio removido (404 com link ao catálogo), dados ausentes e ausência de resultados.
- `noindex` enquanto demonstrativo; README documenta a ativação da indexação.

---

## 5. Fases de execução

Cada fase lista **Entregáveis**, **Critérios de aceite** e **Verificação**. Só avance com a verificação verde.

### Fase 0: Scaffold e base

**Entregáveis**
- Projeto Astro na raiz com os comandos da seção 1.2; `output: 'static'`; `site` configurado em `astro.config.mjs` (placeholder `https://example.com` até haver domínio).
- Tailwind 4 via `@tailwindcss/vite`; shadcn inicializado; `src/styles/global.css` com tokens da paleta (verde profundo, areia, branco quente, terroso) mapeados para as variáveis do shadcn.
- `src/config/site.ts` com placeholders identificáveis, `whatsapp: ''`, `indexable: false`, config de tiles com atribuição, cidade de referência.
- `src/layouts/Base.astro`: `<head>` com SEO básico via `src/lib/seo.ts`, `noindex` condicional, `<Toaster>` do sonner, Header e Footer estáticos, slot para barra mobile.
- `public/robots.txt`, integração sitemap, `404.astro` com link ao catálogo, `index.astro` provisório.
- Scripts `dev`, `build`, `preview`, `check`, `test` no `package.json`.

**Critérios de aceite**
- Header contém logo, Terrenos, Empreendimentos, Sobre, Dúvidas e contato.
- Toda página emite `<meta name="robots" content="noindex">` quando `indexable = false`.
- Nenhum import de `leaflet` ainda existe.

**Verificação**
```bash
pnpm build
pnpm astro check
```

### Fase 1: Tipos, dados demo e biblioteca de regras

**Entregáveis**
- Todos os tipos da seção 3 em `src/types/`.
- Oito anúncios em `src/data/listings/` (6 rurais + 2 urbanos), todos `publicado`, cobrindo obrigatoriamente:
  - 1 empreendimento rural com ≥ 8 lotes, polígonos SVG (`plan.kind = 'svg'`, `demonstrativa: true`) e lotes em todos os quatro status;
  - 1 empreendimento com `plan.kind = 'imagem'` e lotes sem polígono;
  - 1 terreno avulso rural com preço definido;
  - 1 anúncio com `priceCents: null` (sob consulta);
  - 1 anúncio com itens de infraestrutura `prevista` e `nao_informada`;
  - 1 anúncio sem vídeo (`videos: []`);
  - 2 urbanos (1 terreno, 1 empreendimento pequeno);
  - pelo menos 1 com `location.entrance` diferente de `center` e `precision: 'aproximada'`.
  - Todos com `media[].illustrative = true`, `alt` preenchido, dimensões reais das imagens em `public/demo/`.
- `src/data/faq-geral.ts` e FAQs específicas por anúncio, com `keywords` e `anchor`.
- `src/lib/*` como funções puras, sem DOM: `money`, `area`, `filters`, `sort`, `match`, `whatsapp`, `maps`, `url-state`, `storage`, `seo`.
- Testes Vitest em `src/lib/__tests__/` cobrindo: regra do mesmo lote; infraestrutura prevista não satisfaz existente; sob consulta não vira zero e ordena por último; conversão m² ↔ ha; formatação de centavos; `buildWaLink` (só dígitos, `encodeURIComponent`, telefone vazio retorna `null`); templates de mensagem por origem; `url-state` idempotente (filtros → query → filtros); `match` explica critérios e não retorna parcial como total.

**Critérios de aceite**
- Catálogo tipa sem `any` e sem `as` inseguros.
- `getListingBySlug` retorna `null` para slug inexistente.
- Dados não contêm documentos pessoais nem dados de proprietários.

**Verificação**
```bash
pnpm test
pnpm astro check
pnpm build
```

### Fase 2: Páginas estáticas e SEO

**Entregáveis**
- `index.astro` com todas as 11 seções da regra 4.3 (as partes interativas podem ser stubs visuais que ganham comportamento nas fases 3 e 5).
- `terrenos/[slug].astro` e `empreendimentos/[slug].astro` via `getStaticPaths` com todo o conteúdo da regra 4.6 em HTML estático, exceto as ilhas (mapa, planta, vídeo, formulários), que recebem placeholders com o conteúdo textual de fallback (endereço, referências, links Maps, lista de lotes em HTML).
- Componente `InfoRow` que renderiza "Informação não disponibilizada" + botão "Perguntar ao corretor" (link WhatsApp da origem "dúvida") para qualquer campo `null`.
- Infraestrutura em três grupos separados; condições comerciais só com campos fornecidos; bloco documental com data.
- Relacionados (por `related[]`, fallback: mesma zona/região).
- `sobre.astro` (apresentação do corretor a partir de `site.ts`, placeholders quando vazio), `duvidas.astro` (FAQ geral estática; busca vira ilha na Fase 5).
- `src/lib/seo.ts` gera título e descrição exclusivos por anúncio, canonical, OG com a primeira foto, `twitter:card`.
- Cards (`ListingCard.astro`) conforme regra 4.5, com preço/entrada/parcela separados e "a partir de" apenas quando aplicável.

**Critérios de aceite**
- `dist/` contém um `index.html` para cada um dos 8 anúncios e as páginas fixas.
- OG image, título e descrição estão no HTML gerado (verificar com `grep` no `dist/`).
- Página de detalhe lida sem JavaScript mantém: nome, preço, área, acesso, endereço/referências, links "Abrir no Google Maps" e "Traçar rota", lista de lotes.

**Verificação**
```bash
pnpm build
pnpm astro check
grep -l 'og:image' dist/terrenos/*/index.html dist/empreendimentos/*/index.html
grep -c 'noindex' dist/index.html
```

### Fase 3: Catálogo interativo

**Entregáveis**
- Ilha `Catalogo` (`client:load` em `terrenos/index.astro` e `empreendimentos/index.astro`) recebendo o catálogo publicado como prop.
- Busca textual; filtros principais (rural/urbano/todos, município/região, preço total, área, tipo); "Mais filtros" (relevo, acesso, água, energia, distância à cidade de referência, infraestrutura existente), exibidos só quando há dados.
- Contagem de resultados; rótulo claro "Mostrando todos os anúncios" vs "Mostrando: Empreendimentos" etc.
- Ordenação (destaque, menor preço, maior área, atualização) via `sort.ts`.
- Limpar filtros; estado sem resultados com "Ajustar filtros" e "Enviar esta busca ao corretor" (WhatsApp origem "busca sem resultados" com os filtros descritos).
- Estado dos filtros sincronizado com a URL (`url-state.ts`, `history.replaceState`), lido na montagem.
- Toggle cards/mapa (o mapa em si chega na Fase 4; aqui o toggle e o layout ficam prontos com placeholder).
- `BuscaRapida` da home gera URL de catálogo com filtros.
- Ilha só usa `filters.ts`/`sort.ts` testados na Fase 1.

**Critérios de aceite**
- Filtro preço + área em empreendimento respeita a regra do mesmo lote (validar com um caso do catálogo demo que falharia se combinasse lotes distintos).
- Filtro "infraestrutura existente: energia" exclui anúncio com energia `prevista`.
- URL copiada em nova aba reproduz filtros, ordenação e modo.
- Ordenação por menor preço coloca "sob consulta" no final.

**Verificação**
```bash
pnpm test
pnpm build
pnpm astro check
pnpm preview   # testar manualmente as URLs com query string
```

### Fase 4: Mapas, vídeos e plantas

**Entregáveis**
- `MapaLeaflet` (`client:only="react"`): tiles e atribuição de `site.ts`; marcadores sincronizados com os resultados filtrados no catálogo; no detalhe, marcador do centro e, quando existir, marcador distinto do ponto de entrada; indicação "localização aproximada" quando aplicável; estado de erro que mantém visível o bloco estático de endereço/links.
- `maps.ts`: "Abrir no Google Maps" (center) e "Traçar rota" (entrance ?? center).
- `VideoFacade`: capa + título + descrição; player carregado só após clique; link "Abrir no YouTube/Vimeo" sempre disponível e destacado em falha (`onError`/timeout); badge "Vídeo demonstrativo" quando `demonstrativo`; legendas/resumo quando fornecidos; agrupamento por finalidade.
- `PlantaSvg` (`client:visible`): render dos polígonos no `viewBox`, zoom e pan (botões + roda/pinch), legenda de status com cor **e** texto, seleção por clique; painel lateral/sheet com número, quadra, área, medidas, preço, situação, `updatedAt` e botão "Tenho interesse neste lote". Lista de lotes acessível (`<ul>` com `<button>`), navegável por teclado, compartilhando o mesmo estado de seleção; `aria-pressed`/`aria-selected` coerentes. Badge "Planta demonstrativa".
- `PlantaImagem`: imagem com zoom + botão baixar (imagem/PDF) + lista independente de lotes com o mesmo painel. Sem polígonos.
- Galeria de fotos com `<Picture>`, lazy abaixo da dobra, alt e selo "Imagem ilustrativa".

**Critérios de aceite**
- Bloquear a URL de tiles no DevTools: página continua com endereço, referências e links externos.
- Sem rede para o YouTube: capa continua, link externo funciona.
- Selecionar lote pelo teclado na lista destaca o polígono e abre o painel; e vice-versa.
- Nenhum import de `leaflet` fora de componentes `client:only`.

**Verificação**
```bash
pnpm build
pnpm astro check
grep -rn "from 'leaflet'" src --include=*.astro --include=*.ts | grep -v components/react && echo "ERRO: leaflet fora de ilha" || echo OK
```

### Fase 5: Conversão e apoio à escolha

**Entregáveis**
- `whatsapp.ts` completo: `buildWaLink(phone, message)` e `messages.{anuncio,lote,duvida,comparacao,buscaVazia,visita,naoEncontrou}(...)`, todos incluindo o link canônico da página quando aplicável.
- `FormWhatsApp` (RHF + Zod): assuntos rápidos (acesso, água, energia, documentação, pagamento, visita) como chips + campo livre; botões "Abrir WhatsApp" e "Copiar mensagem" (toast via sonner); quando `site.whatsapp` vazio, aviso "Telefone não configurado neste ambiente demonstrativo" e só o botão copiar.
- `SolicitarVisita`: preferência de dia/período (select + campo opcional), texto explícito "Você confirma a data com o corretor no WhatsApp"; nunca "visita agendada".
- `BarraMobile` fixa no rodapé em telas pequenas na página de detalhe: "Conversar" e "Solicitar visita", `padding-bottom: env(safe-area-inset-bottom)`, conteúdo com espaçamento compensatório.
- Compartilhar: Web Share API com fallback copiar link.
- `FavoritoButton` + página `favoritos.astro` (ilha lê `safeStorage`, mostra estado vazio e anúncios removidos do catálogo como "não disponível").
- `Comparador` + `comparar.astro`: até 3 itens; tabela com preço total, área, localização, acesso, relevo, água, energia, condições; para empreendimento, seletor "conjunto" ou lote específico, refletido no cabeçalho da coluna; ação "Conversar sobre esta comparação".
- `BuscaGuiada` (home e catálogo): objetivo, região, orçamento, área; usa `match.ts`; cada resultado mostra a explicação dos critérios atendidos; se nenhum atender a **todos**, mensagem explícita + "Enviar minhas preferências ao corretor".
- `BuscaFaq` em `duvidas.astro` e nos detalhes: busca por palavras-chave em `Faq[]`; sem resultado: "Perguntar isso no WhatsApp" com o texto digitado preservado.
- Chamada "Não encontrou o que procura?" na home abre `FormWhatsApp` com preferências.

**Critérios de aceite**
- Cada botão de conversa abre `https://wa.me/<dígitos>?text=<encoded>` com a mensagem da origem correta, ou explica o que falta.
- Copiar mensagem funciona sem telefone configurado.
- Favoritos e comparação sobrevivem a reload e degradam para memória com localStorage bloqueado (testar em janela privada com armazenamento desabilitado).
- Comparação de empreendimento identifica conjunto vs lote.

**Verificação**
```bash
pnpm test
pnpm build
pnpm astro check
```

### Fase 6: Qualidade, README e validação final

**Entregáveis**
- Acessibilidade: ordem de foco, `:focus-visible` visível, labels em todos os campos, `alt` em todas as imagens, `prefers-reduced-motion` desativando animações, contraste AA na paleta, nenhuma informação só por cor.
- Performance: `<Picture>`/`<Image>` com formatos modernos e dimensões; `loading="lazy"` abaixo da dobra; ilhas com `client:visible`/`client:idle` onde possível; sem vídeo automático.
- Estados: mídia indisponível (placeholder com texto), anúncio removido (404), dados ausentes (`InfoRow`), sem resultados.
- `README.md` explicando: requisitos; `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm test`, `pnpm check`; publicar em hospedagem estática (`dist/`); atualizar anúncios, lotes, preços, fotos, vídeos, plantas e telefone (arquivos e campos exatos); ativar indexação (`indexable: true`, `site` em `astro.config.mjs`); trocar provedor de tiles; aviso sobre TypeScript 7 vs 5.9 se aplicável.
- Executar o checklist da seção 6 e reportar.

**Verificação**
```bash
pnpm test
pnpm astro check
pnpm build
pnpm preview
```

---

## 6. Checklist final de verificação

Marcar cada item com evidência (comando rodado, página aberta, o que foi observado).

- [ ] `pnpm build`, `pnpm astro check` e `pnpm test` verdes.
- [ ] Rotas diretas de todos os 8 anúncios abrem a partir de `dist/` (preview) e têm título, descrição, canonical e OG exclusivos.
- [ ] Filtros combinados: rural + município + faixa de preço + área retornam o esperado; limpar filtros restaura tudo.
- [ ] Regra do mesmo lote: caso demo que combinaria preço de um lote com área de outro **não** aparece.
- [ ] Infraestrutura prevista não satisfaz filtro de existente.
- [ ] Ordenação por menor preço: "sob consulta" no final; nunca tratado como zero.
- [ ] URL com filtros compartilhada reproduz o estado (cards e mapa).
- [ ] Comparação com 3 itens funciona; 4º item é recusado com aviso; empreendimento indica conjunto vs lote.
- [ ] Favoritos persistem após reload; com armazenamento bloqueado o site não quebra.
- [ ] Seleção de lote funciona por mouse no SVG e por teclado na lista; painel mostra dados e botão de interesse; status com cor e texto.
- [ ] Planta em imagem: zoom, download, lista de lotes, sem polígonos inventados; badge demonstrativa.
- [ ] WhatsApp: cada origem (anúncio, lote, dúvida, comparação, busca vazia, visita, não encontrou) gera a mensagem certa; número só com dígitos; `encodeURIComponent`; copiar mensagem funciona; sem telefone, o aviso aparece e nenhum número inventado é usado.
- [ ] Solicitação de visita nunca exibe "visita agendada".
- [ ] Navegação em celular (375px) e desktop (1280px): barra inferior mobile não cobre conteúdo e respeita safe-area; header e menus operáveis por teclado.
- [ ] Mapa bloqueado: endereço, referências e links "Abrir no Google Maps"/"Traçar rota" permanecem.
- [ ] Vídeo bloqueado: capa e link externo permanecem; nenhum player carrega sem interação.
- [ ] Campos ausentes mostram "Informação não disponibilizada" + "Perguntar ao corretor".
- [ ] Todos os botões executam ação coerente; ações dependentes de configuração explicam o que falta.
- [ ] `noindex` presente em todas as páginas; README explica como ativar indexação.
- [ ] Catálogo identificado como demonstração; imagens sinalizadas como ilustrativas; nenhum dado pessoal de proprietário.
- [ ] Nenhuma promessa de valorização, financiamento, regularidade ou permissão de construção não fornecida.
