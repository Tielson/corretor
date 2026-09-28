# Site de terrenos rurais e urbanos

Site estático para corretor ou imobiliária de terrenos e empreendimentos rurais, com uma seleção secundária de terrenos urbanos. Feito com **Astro 7 + ilhas React 19**, Tailwind 4, shadcn, React Three Fiber (maquetes 3D), Leaflet (mapas) e Motion (transições).

O catálogo atual é **demonstrativo**. Anúncios, preços, plantas e fotos são exemplos, e todas as páginas saem com `noindex` até a publicação de dados reais.

---

## Requisitos

- Node.js 24.x (usado só em desenvolvimento e build; não há servidor em produção)
- pnpm 11.x

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm install` | Instala as dependências |
| `pnpm dev` | Servidor de desenvolvimento em http://localhost:4321 |
| `pnpm build` | Gera o site estático em `dist/` |
| `pnpm preview` | Serve o `dist/` localmente para conferência |
| `pnpm test` | Testes unitários (Vitest) das regras em `src/lib` |
| `pnpm check` | Checagem de tipos e de componentes (`astro check`) |
| `pnpm demo:planta` | Regenera a planta demonstrativa (PNG e PDF) do empreendimento Terras do Cafezal |

## Publicação

Rode `pnpm build` e envie a pasta `dist/` para qualquer hospedagem estática (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 e similares). Não há banco de dados, API ou login.

Os dados são atualizados nos arquivos do projeto e o site é publicado de novo. Preços e disponibilidade representam a última atualização editorial, não uma sincronização em tempo real.

---

## Onde ficam as coisas

```
src/config/site.ts          marca, região, contato, WhatsApp, dados profissionais, mapa, indexação
src/data/listings/*.ts      um arquivo por anúncio (tipado contra src/types)
src/data/index.ts           catálogo agregado (lista `all`), getListingBySlug, relacionados
src/data/faq-geral.ts       dúvidas gerais
src/content/duvidas/*.md    textos explicativos da página de dúvidas
src/assets/demo/            fotos (otimizadas no build) + credits.json + videos.json
public/demo/                planta em imagem (PNG) e PDF para download
src/lib/                    regras puras e testadas (filtros, ordenação, WhatsApp, mapas...)
src/components/react/       ilhas interativas (catálogo, mapas, planta, 3D, formulários)
src/components/astro/       blocos estáticos (cards, ficha, trajeto, infraestrutura...)
```

## Como atualizar

### Telefone do WhatsApp e dados do corretor
Arquivo `src/config/site.ts`:
- `whatsapp`: número internacional (ex.: `5535999990000`). Pode ter espaços ou símbolos; o site mantém só os dígitos. **Vazio = não configurado**: os botões avisam que o telefone não está configurado e oferecem copiar a mensagem. Nenhum número é inventado.
- `brand`, `regiao`, `logo` (caminho em `/public`), `contato`, `profissional` (`nome`, `creci`, `apresentacao`, `atuacaoLocal`, `foto`) e `depoimentos`. Depoimentos só entram se forem reais e autorizados.
- `demo: false` remove os avisos de catálogo demonstrativo.

### Anúncios
1. Copie um arquivo de `src/data/listings/` (ex.: `sitio-pedra-branca.ts` para terreno avulso, `recanto-das-araucarias.ts` para empreendimento).
2. Ajuste `id`, `slug` (vira a URL), `code`, `kind` (`terreno` ou `empreendimento`) e `zone` (`rural` ou `urbano`).
3. Inclua o novo anúncio na lista `all` de `src/data/index.ts`.
4. Use `status: 'rascunho'` para esconder sem apagar.

Regras de preenchimento:
- **Valores em centavos** (`18500000` = R$ 185.000). `priceCents: null` = "Preço sob consulta", que nunca vira zero.
- **Áreas em m²** (`areaM2`). A exibição em hectares é automática a partir de 10.000 m².
- **Informação desconhecida = `null`**. O site mostra "Informação não disponibilizada" com o botão "Perguntar ao corretor", e a ficha de transparência lista o que falta.
- `infrastructure.items[].status`: `existente`, `prevista` ou `nao_informada`. Só `existente` conta nos filtros.
- `location.precision`: `exata` ou `aproximada`. `location.entrance` é o ponto de chegada usado pelo botão "Traçar rota".
- `location.distances[]`: sempre com `source` (origem) e `nature` (`estimativa` ou `medida`).
- `commercial`: preencha só o que foi fornecido (entrada, parcelas, reajustes, encargos). Use `null` quando não houver condições informadas.
- `documents`: texto fornecido pelo responsável, com `updatedAt`.

### Lotes e plantas (empreendimentos)
- `lots[]`: `number`, `block`, `areaM2`, `dimensions`, `priceCents`, `status` (`disponivel`, `reservado`, `vendido`, `sob_consulta`) e `updatedAt`.
- "A partir de" e a faixa de áreas são calculados só com os lotes **disponíveis**.
- **Planta SVG interativa**: `plan.kind = 'svg'`, `plan.viewBox` (ex.: `'0 0 1000 660'`) e `polygon` em cada lote, com pontos no mesmo sistema do viewBox (exportados do CAD ou desenhados sobre a planta). Os mesmos polígonos geram a maquete 3D dos lotes.
- **Planta em imagem**: `plan.kind = 'imagem'`, com `imageUrl` e/ou `pdfUrl` apontando para `/public`. Nesse caso os lotes ficam com `polygon: null`, porque o site nunca desenha polígonos sobre a imagem.
- `plan.demonstrativa: true` exibe o aviso de planta ilustrativa. Use `false` só para levantamento técnico real.

### Fotos
- Coloque as fotos em `src/assets/demo/` e referencie pelo nome do arquivo em `media[].url`. O build gera AVIF/WebP em vários tamanhos.
- Em `src/data/media.ts`, `demoPhoto()` lê dimensões, crédito e texto alternativo de `src/assets/demo/credits.json`. Para fotos reais, escreva o objeto `Media` direto no anúncio, com `illustrative: false`, `alt` descritivo, `width` e `height` reais e `credit`.
- Imagens ilustrativas (`illustrative: true`) recebem o selo "Imagem ilustrativa".
- **Ajuste em relação ao briefing:** as fotos ficam em `src/assets/` (e não em `public/demo/`) porque só imagens importadas são otimizadas pelo `astro:assets`. `public/demo/` guarda a planta PNG/PDF.
- As fotos atuais são do Unsplash (Licença Unsplash), com crédito em cada imagem.

### Vídeos
Em `videos[]`: `provider` (`youtube` ou `vimeo`), `videoId`, `purpose` (`aerea`, `acesso`, `apresentacao`, `infraestrutura`, `planta`), `title`, `description`, `thumbnail` (foto local em `src/assets/demo/`), `captions` (legenda ou resumo textual) e `demonstrativo`. O player só é carregado após o clique (YouTube sem cookies), e o link externo fica sempre visível. Os vídeos atuais são públicos, da região, e aparecem como demonstrativos porque não mostram os imóveis.

---

## Ativar a indexação (dados reais)

1. Troque `SITE_URL` em `astro.config.mjs` e `siteUrl` em `src/config/site.ts` pelo domínio final.
2. Troque a URL do sitemap em `public/robots.txt`.
3. Em `src/config/site.ts`, defina `indexable: true` (as páginas passam a emitir `index, follow`) e `demo: false`.
4. Substitua todos os anúncios demonstrativos por dados reais antes de publicar.

## Mapa

O provedor de tiles fica em `src/config/site.ts` (`map.tileUrl`, `map.attribution`, `map.maxZoom`). A atribuição é sempre exibida.

O padrão é o OpenStreetMap, que tem **política de uso** e não é para tráfego alto. Para produção, use um provedor com contrato (MapTiler, Stadia Maps, Thunderforest...) e informe a URL e a atribuição exigidas. Não há imagens de satélite.

Os botões "Abrir no Google Maps" e "Traçar rota" usam Maps URLs públicas e não dependem do provedor do mapa incorporado. Se o mapa não carregar, endereço, referências e links continuam no HTML estático.

---

## Camada 3D

- **Maquete da região (home):** relevo procedural em placas (`src/lib/relief.ts`, semente em `RELIEF.seed`) com os pinos posicionados pelas coordenadas de cada anúncio, dentro da caixa `regiaoBounds` de `src/config/site.ts`. O selo "Relevo ilustrativo, fora de escala" é obrigatório enquanto o relevo for procedural.
- **Maquete dos lotes (empreendimento):** extrusão dos polígonos da planta SVG. Aparece na aba "Maquete 3D", compartilha a seleção com a planta 2D e a lista, e só é baixada quando o visitante escolhe a aba.
- **Quando carrega:** no desktop, sozinha ao entrar na tela. No celular, com economia de dados, em conexão lenta ou com `?lite=1` na URL, só após o toque em "Explorar em relevo 3D". Sem WebGL fica desligada. Com `prefers-reduced-motion` não há animação de entrada nem paralaxe.
- **Fallback:** o pôster 2D (curvas de nível do mesmo relevo, em SVG) e a lista de anúncios estão no HTML do build e funcionam sem JavaScript.
- **Desligar:** em `src/pages/index.astro`, troque `<MaqueteRegiao client:visible ...>` pelo componente `MaquetePoster` (sem diretiva `client`). A aba 3D dos lotes some se `plan.kind` não for `svg`.
- **Relevo real:** para usar dados de elevação reais (ex.: tiles Terrarium/SRTM), gere no build uma grade normalizada [0, 1] do tamanho de `resolution × resolution` e use-a no lugar de `generateHeightfield` em `ReliefScene.tsx` e `relief-data.ts`. Aí o selo de "relevo ilustrativo" pode ser revisto.

## Decisões técnicas e avisos

- **TypeScript 5.9:** o briefing indicava TS 7, mas o `@astrojs/check` 0.9 aceita só `typescript ^5 || ^6`. O projeto fixa `typescript@^5.9`, como previsto no próprio briefing.
- **pnpm 11** bloqueia scripts de instalação por padrão. `pnpm-workspace.yaml` libera só `esbuild` e `sharp`.
- **Leaflet** só é importado por `src/components/react/map/MapaLeaflet.tsx`, carregado sob demanda pelas ilhas `client:only` (`MapaCatalogo`, `MapaDetalhe`).
- **Favoritos e comparação** usam `localStorage` via `safeStorage` (`src/lib/storage.ts`), com fallback em memória quando o armazenamento está bloqueado.
- **WhatsApp:** toda geração de link fica em `src/lib/whatsapp.ts` (`buildWaLink` e `messages.*`). O site só prepara a mensagem; nada é enviado ou armazenado.
- **Transições entre páginas:** View Transitions nativas do navegador (CSS), sem JavaScript. O Lenis (scroll suave) só é ativado com mouse/trackpad, sem movimento reduzido e sem economia de dados.
