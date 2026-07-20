export type LibraryDay = "todos" | "dia-1" | "dia-2" | "dia-3" | "dia-4" | "dia-5" | "extras";

export type MaterialType =
  | "skill"
  | "prompt"
  | "checklist"
  | "template"
  | "pdf"
  | "extra"
  | "aula"
  | "link";

export type MaterialPriority = "essencial" | "extra";

export type LibraryMaterial = {
  id: string;
  titulo: string;
  tipo: MaterialType;
  dia: Exclude<LibraryDay, "todos">;
  ordem: number;
  descricao: string;
  prioridade: MaterialPriority;
  tempoEstimado?: string;
  ferramenta?: string;
  paraQueServe?: string;
  preRequisitos?: string[];
  comoUsar?: string[];
  resultadoEsperado?: string;
  proximoPasso?: string;
  versao?: string;
  atualizadoEm?: string;
  arquivoUrl?: string;
  linkExterno?: string;
  conteudoPrompt?: string;
  tags: string[];
  disponivel: boolean;
};

export const dayGroups: Array<{
  id: LibraryDay;
  label: string;
  title: string;
  objective: string;
}> = [
  {
    id: "todos",
    label: "Todos",
    title: "Todos os Materiais",
    objective: "Consulte a biblioteca completa do desafio em uma única visão.",
  },
  {
    id: "dia-1",
    label: "Dia 1",
    title: "Descubra seu Produto",
    objective: "Definir nicho, público, dor, transformação e formato.",
  },
  {
    id: "dia-2",
    label: "Dia 2",
    title: "Crie o Conteúdo",
    objective: "Estruturar o conteúdo de acordo com o formato escolhido.",
  },
  {
    id: "dia-3",
    label: "Dia 3",
    title: "Monte sua Oferta",
    objective: "Definir preço, bônus, garantia, benefícios e mensagem.",
  },
  {
    id: "dia-4",
    label: "Dia 4",
    title: "Publique na Hotmart",
    objective: "Cadastrar produto, oferta e entrega.",
  },
  {
    id: "dia-5",
    label: "Dia 5",
    title: "Checklist e Lançamento",
    objective: "Validar tudo e colocar o produto no ar.",
  },
  {
    id: "extras",
    label: "Extras",
    title: "Extras",
    objective: "Bônus, ferramentas, referências e materiais complementares.",
  },
];

export const typeLabels: Record<MaterialType, string> = {
  aula: "Aula",
  checklist: "Checklist",
  extra: "Extra",
  link: "Link",
  pdf: "PDF",
  prompt: "Prompt",
  skill: "Skill",
  template: "Template",
};

export const priorityLabels: Record<MaterialPriority, string> = {
  essencial: "Essencial",
  extra: "Extra",
};

export const libraryMaterials: LibraryMaterial[] = [
  {
    id: "dia-1-skill-descoberta",
    titulo: "Skill - Descoberta de Produto",
    tipo: "skill",
    dia: "dia-1",
    ordem: 1,
    descricao: "Orienta a primeira leitura do seu conhecimento e das oportunidades possíveis.",
    prioridade: "essencial",
    tempoEstimado: "12 min",
    ferramenta: "Codex",
    paraQueServe: "Ajudar a organizar nicho, público, dor e transformação antes de escolher o formato.",
    preRequisitos: ["Ter respondido às perguntas iniciais do Dia 1."],
    comoUsar: ["Abra a skill quando ela estiver disponível.", "Siga as perguntas na ordem indicada."],
    resultadoEsperado: "Um mapa inicial com público, dor principal e oportunidade do produto.",
    proximoPasso: "Escolher o formato mais simples para executar primeiro.",
    versao: "Inicial",
    atualizadoEm: "2026-07-19",
    tags: ["descoberta", "nicho", "público", "dor"],
    disponivel: false,
  },
  {
    id: "dia-1-prompt-publico-dor",
    titulo: "Prompt - Definição de Público e Dor",
    tipo: "prompt",
    dia: "dia-1",
    ordem: 2,
    descricao: "Ajuda a transformar uma ideia ampla em um recorte de público mais claro.",
    prioridade: "essencial",
    tempoEstimado: "8 min",
    ferramenta: "ChatGPT ou IA de texto",
    paraQueServe: "Gerar hipóteses iniciais de público, dor e transformação sem fechar a estratégia cedo demais.",
    comoUsar: ["Copie o prompt inicial.", "Preencha os campos entre colchetes com suas respostas."],
    resultadoEsperado: "Uma lista curta de públicos e dores para comparação.",
    proximoPasso: "Selecionar o recorte com maior urgência e clareza.",
    conteudoPrompt:
      "Prompt inicial: ajude-me a comparar públicos possíveis para [conhecimento] considerando dor, urgência e facilidade de execução.",
    versao: "Inicial",
    atualizadoEm: "2026-07-19",
    tags: ["prompt", "público", "dor"],
    disponivel: true,
  },
  {
    id: "dia-2-skill-estrutura",
    titulo: "Skill - Estrutura do Conteúdo",
    tipo: "skill",
    dia: "dia-2",
    ordem: 1,
    descricao: "Organiza o conteúdo do produto em uma sequência simples de entrega.",
    prioridade: "essencial",
    tempoEstimado: "15 min",
    ferramenta: "Codex",
    paraQueServe: "Sair de uma lista de ideias soltas para um roteiro de módulos, capítulos ou etapas.",
    resultadoEsperado: "Uma estrutura enxuta pronta para produção.",
    proximoPasso: "Criar o primeiro bloco de conteúdo.",
    tags: ["conteúdo", "estrutura", "módulos"],
    disponivel: false,
  },
  {
    id: "dia-2-prompt-conteudo",
    titulo: "Prompt - Criação do Conteúdo",
    tipo: "prompt",
    dia: "dia-2",
    ordem: 2,
    descricao: "Transforma a estrutura escolhida em um roteiro inicial de produção.",
    prioridade: "essencial",
    tempoEstimado: "10 min",
    ferramenta: "IA de texto",
    paraQueServe: "Criar a primeira versão de aulas, capítulos ou materiais de apoio.",
    conteudoPrompt:
      "Prompt inicial: transforme esta estrutura em um roteiro prático de produção com começo, meio, entrega e revisão: [estrutura].",
    resultadoEsperado: "Um roteiro base para produzir o conteúdo sem travar.",
    tags: ["prompt", "conteúdo", "roteiro"],
    disponivel: true,
  },
  {
    id: "dia-3-prompt-oferta",
    titulo: "Prompt - Construção da Oferta",
    tipo: "prompt",
    dia: "dia-3",
    ordem: 1,
    descricao: "Ajuda a organizar promessa, preço, bônus e argumentos principais.",
    prioridade: "essencial",
    tempoEstimado: "12 min",
    ferramenta: "IA de texto",
    paraQueServe: "Montar uma oferta clara sem transformar tudo em uma página longa demais.",
    conteudoPrompt:
      "Prompt inicial: organize uma oferta simples para [produto], destacando promessa, preço inicial, bônus e objeções principais.",
    resultadoEsperado: "Uma oferta enxuta para validar com os primeiros compradores.",
    tags: ["oferta", "preço", "bônus"],
    disponivel: true,
  },
  {
    id: "dia-3-checklist-oferta",
    titulo: "Checklist - Oferta Completa",
    tipo: "checklist",
    dia: "dia-3",
    ordem: 2,
    descricao: "Confere se os elementos essenciais da oferta foram definidos.",
    prioridade: "essencial",
    tempoEstimado: "7 min",
    paraQueServe: "Evitar publicar uma oferta sem promessa, preço ou próximo passo claro.",
    resultadoEsperado: "Uma oferta pronta para revisão final.",
    tags: ["checklist", "oferta"],
    disponivel: false,
  },
  {
    id: "dia-4-checklist-hotmart",
    titulo: "Checklist - Publicação na Hotmart",
    tipo: "checklist",
    dia: "dia-4",
    ordem: 1,
    descricao: "Lista os pontos técnicos antes de publicar produto, oferta e entrega.",
    prioridade: "essencial",
    tempoEstimado: "20 min",
    paraQueServe: "Reduzir erros na configuração da área de venda e entrega.",
    resultadoEsperado: "Produto cadastrado e pronto para revisão.",
    tags: ["hotmart", "publicação", "checklist"],
    disponivel: false,
  },
  {
    id: "dia-4-template-descricao",
    titulo: "Template - Descrição do Produto",
    tipo: "template",
    dia: "dia-4",
    ordem: 2,
    descricao: "Modelo inicial para preencher a descrição do produto na plataforma.",
    prioridade: "extra",
    tempoEstimado: "10 min",
    paraQueServe: "Acelerar a escrita da descrição sem inventar uma promessa nova.",
    resultadoEsperado: "Uma descrição clara para cadastro do produto.",
    tags: ["template", "descrição", "hotmart"],
    disponivel: false,
  },
  {
    id: "dia-5-checklist-revisao",
    titulo: "Checklist - Revisão Final",
    tipo: "checklist",
    dia: "dia-5",
    ordem: 1,
    descricao: "Confere produto, oferta, entrega e comunicação antes do lançamento.",
    prioridade: "essencial",
    tempoEstimado: "15 min",
    paraQueServe: "Garantir que o produto está pronto para receber os primeiros compradores.",
    resultadoEsperado: "Lista final de ajustes antes de publicar.",
    tags: ["revisão", "lançamento", "checklist"],
    disponivel: false,
  },
  {
    id: "dia-5-prompt-lancamento",
    titulo: "Prompt - Mensagem de Lançamento",
    tipo: "prompt",
    dia: "dia-5",
    ordem: 2,
    descricao: "Cria a primeira mensagem para apresentar o produto ao público certo.",
    prioridade: "essencial",
    tempoEstimado: "8 min",
    ferramenta: "IA de texto",
    conteudoPrompt:
      "Prompt inicial: escreva uma mensagem curta de lançamento para [produto], com dor, transformação e convite simples.",
    resultadoEsperado: "Uma mensagem inicial para validar interesse.",
    tags: ["lançamento", "comunicação", "prompt"],
    disponivel: true,
  },
  {
    id: "extra-guia-skills",
    titulo: "Guia - Como usar Skills",
    tipo: "extra",
    dia: "extras",
    ordem: 1,
    descricao: "Explica quando usar uma skill e quando usar apenas um prompt.",
    prioridade: "extra",
    tempoEstimado: "6 min",
    paraQueServe: "Escolher a ferramenta certa para cada etapa do desafio.",
    resultadoEsperado: "Mais clareza para executar sem alternar ferramentas sem necessidade.",
    tags: ["guia", "skills", "execução"],
    disponivel: false,
  },
  {
    id: "extra-ferramentas",
    titulo: "Lista - Ferramentas Recomendadas",
    tipo: "extra",
    dia: "extras",
    ordem: 2,
    descricao: "Agrupa ferramentas úteis para criar, revisar e publicar o produto.",
    prioridade: "extra",
    tempoEstimado: "5 min",
    paraQueServe: "Ter um ponto de partida sem transformar a escolha de ferramentas em distração.",
    resultadoEsperado: "Uma lista curta de ferramentas para cada etapa.",
    tags: ["ferramentas", "extras"],
    disponivel: false,
  },
];
