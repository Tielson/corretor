import type { Faq } from '@/types/faq';

/** Dúvidas gerais, válidas para qualquer anúncio. Respostas curtas e sem promessas. */
export const faqGeral: Faq[] = [
  {
    id: 'g-visita',
    question: 'Como funciona a visita a um terreno?',
    answer:
      'Você envia uma solicitação pelo site com o dia ou período de preferência. O corretor responde no WhatsApp para confirmar data, horário e ponto de encontro. A visita só está marcada depois dessa confirmação.',
    topic: 'visita',
    anchor: 'visita',
    keywords: ['visita', 'visitar', 'agendar', 'marcar', 'conhecer'],
  },
  {
    id: 'g-localizacao-aproximada',
    question: 'Por que alguns anúncios mostram localização aproximada?',
    answer:
      'Alguns proprietários preferem informar a posição exata só depois do primeiro contato. Nesses casos o mapa indica a região, e o botão de rota leva ao ponto de acesso informado, quando existir.',
    topic: 'localizacao',
    anchor: 'localizacao',
    keywords: ['localização', 'mapa', 'aproximada', 'endereço', 'onde'],
  },
  {
    id: 'g-distancias',
    question: 'As distâncias e tempos de viagem são exatos?',
    answer:
      'Não. São estimativas cadastradas pelo corretor, com a origem indicada ao lado. O tempo real depende do trânsito, do clima e das condições da estrada de terra.',
    topic: 'acesso',
    anchor: 'localizacao',
    keywords: ['distância', 'tempo', 'km', 'quanto tempo', 'longe'],
  },
  {
    id: 'g-estrada',
    question: 'Como sei se meu carro chega até o terreno?',
    answer:
      'Cada anúncio informa a rodovia de referência, os quilômetros de estrada de terra e as condições relatadas. Quando essa informação não está cadastrada, aparece "Informação não disponibilizada" e você pode perguntar ao corretor.',
    topic: 'acesso',
    anchor: 'acesso',
    keywords: ['carro', 'estrada', 'terra', 'acesso', 'chuva', '4x4'],
  },
  {
    id: 'g-hectare',
    question: 'Quanto é um hectare?',
    answer:
      'Um hectare equivale a 10.000 m², um quadrado de 100 × 100 metros. O site mostra as áreas em m² e, a partir de 10.000 m², também em hectares. Não usamos alqueires, porque o tamanho do alqueire muda de região para região.',
    topic: 'medidas',
    anchor: null,
    keywords: ['hectare', 'ha', 'metro quadrado', 'm2', 'alqueire', 'tamanho', 'área'],
  },
  {
    id: 'g-planta',
    question: 'A planta do empreendimento é um levantamento técnico?',
    answer:
      'Não necessariamente. Plantas marcadas como demonstrativas servem para dar noção da divisão dos lotes. Medidas e confrontações oficiais devem ser confirmadas no levantamento topográfico e na matrícula.',
    topic: 'medidas',
    anchor: 'lotes',
    keywords: ['planta', 'mapa dos lotes', 'levantamento', 'topografia', 'medidas'],
  },
  {
    id: 'g-infra-prevista',
    question: 'Qual a diferença entre infraestrutura existente e prevista?',
    answer:
      'Existente é o que já está instalado, segundo o responsável. Prevista é o que foi prometido pelo empreendedor, mas ainda não existe. Os filtros do site só consideram a infraestrutura existente.',
    topic: 'infraestrutura',
    anchor: 'infraestrutura',
    keywords: ['infraestrutura', 'prevista', 'existente', 'energia', 'água', 'luz'],
  },
  {
    id: 'g-sob-consulta',
    question: 'O que significa "Preço sob consulta"?',
    answer:
      'O valor não foi divulgado no site. Ele é informado pelo corretor na conversa. Anúncios sob consulta não entram nos filtros de preço e aparecem no fim quando você ordena por menor preço.',
    topic: 'condicoes',
    anchor: 'condicoes',
    keywords: ['preço', 'valor', 'sob consulta', 'quanto custa'],
  },
  {
    id: 'g-parcelas',
    question: 'É possível parcelar ou financiar?',
    answer:
      'Depende de cada anúncio. Quando o responsável informa entrada, número de parcelas ou reajustes, eles aparecem em "Condições comerciais". O site não confirma financiamento bancário; pergunte ao corretor.',
    topic: 'condicoes',
    anchor: 'condicoes',
    keywords: ['parcelar', 'financiar', 'financiamento', 'entrada', 'parcelas', 'pagamento'],
  },
  {
    id: 'g-documentos',
    question: 'Quais documentos devo pedir antes de comprar?',
    answer:
      'Peça a matrícula atualizada do imóvel, certidões do proprietário e, para imóveis rurais, o CAR e o CCIR. Em loteamentos, pergunte pela aprovação municipal e pelo registro do parcelamento. Consulte um profissional de sua confiança.',
    topic: 'documentacao',
    anchor: 'documentacao',
    keywords: ['documento', 'documentação', 'matrícula', 'escritura', 'car', 'ccir', 'certidão'],
  },
  {
    id: 'g-construir',
    question: 'Posso construir em qualquer terreno do catálogo?',
    answer:
      'O site não confirma permissão para construir. Isso depende da prefeitura, do zoneamento e, em áreas rurais, de regras ambientais. Pergunte ao corretor quais consultas já foram feitas para o terreno que interessa a você.',
    topic: 'documentacao',
    anchor: 'documentacao',
    keywords: ['construir', 'casa', 'obra', 'licença', 'alvará'],
  },
  {
    id: 'g-o-que-perguntar',
    question: 'O que perguntar ao corretor antes de visitar?',
    answer:
      'Confirme o acesso em época de chuva, a origem da água, a distância da rede de energia, a situação da documentação e o que está incluído no preço. A ficha de cada anúncio mostra quais informações ainda não foram disponibilizadas.',
    topic: 'geral',
    anchor: null,
    keywords: ['perguntar', 'antes', 'dicas', 'checklist', 'informações'],
  },
];
