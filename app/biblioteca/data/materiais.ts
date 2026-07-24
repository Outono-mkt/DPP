export type LibraryDay = "todos" | "dia-1" | "dia-2" | "dia-3" | "dia-4" | "dia-5";

export type MaterialType = "skill" | "prompt" | "link" | "checklist";

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
  tags: string[];
  disponivel: boolean;
};

export const productProntoAccessUrl = "/";

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
    objective: "Consulte a biblioteca completa do desafio em uma unica visao.",
  },
  {
    id: "dia-1",
    label: "Dia 1",
    title: "Descubra seu Produto",
    objective: "Acessar a ferramenta e transformar seu conhecimento em uma oportunidade clara.",
  },
  {
    id: "dia-2",
    label: "Dia 2",
    title: "Crie o Conteudo",
    objective: "Estruturar o conteudo do produto de forma simples e executavel.",
  },
  {
    id: "dia-3",
    label: "Dia 3",
    title: "Monte sua Oferta",
    objective: "Organizar promessa, beneficios, preco e argumentos de venda.",
  },
  {
    id: "dia-4",
    label: "Dia 4",
    title: "Publique e Prepare suas Vendas",
    objective: "Preparar a descricao, os e-mails e a pagina de vendas do produto.",
  },
  {
    id: "dia-5",
    label: "Dia 5",
    title: "Faca suas Primeiras Vendas",
    objective: "Definir o plano de execucao para colocar o produto em movimento.",
  },
];

export const typeLabels: Record<MaterialType, string> = {
  link: "Acesso",
  prompt: "Prompt",
  skill: "Skill",
};

export const priorityLabels: Record<MaterialPriority, string> = {
  essencial: "Essencial",
  extra: "Extra",
};

export const libraryMaterials: LibraryMaterial[] = [
  {
    id: "dia-1-acesso-produto-pronto",
    titulo: "Acesse o Produto Pronto",
    tipo: "link",
    dia: "dia-1",
    ordem: 1,
    descricao: "Entre na ferramenta principal para gerar e salvar a estrategia do seu produto digital.",
    prioridade: "essencial",
    tempoEstimado: "2 min",
    ferramenta: "Produto Pronto",
    paraQueServe: "Abrir o gerador principal do Produto Pronto antes de executar as skills do primeiro dia.",
    resultadoEsperado: "Acesso a ferramenta que orienta a criacao do produto.",
    proximoPasso: "Use as skills do Dia 1 para refinar suas respostas.",
    arquivoUrl: productProntoAccessUrl,
    tags: ["acesso", "ferramenta", "produto pronto"],
    disponivel: true,
  },
  {
    id: "dia-1-skill-quem-e-voce",
    titulo: "Skill - Quem e Voce?",
    tipo: "skill",
    dia: "dia-1",
    ordem: 2,
    descricao: "Ajuda a mapear conhecimentos, experiencias e repertorios que podem virar produto.",
    prioridade: "essencial",
    tempoEstimado: "12 min",
    ferramenta: "Codex",
    paraQueServe: "Encontrar ativos pessoais e profissionais que podem sustentar uma oferta simples.",
    resultadoEsperado: "Uma lista organizada do que voce sabe, viveu e pode ensinar.",
    proximoPasso: "Avancar para a definicao do publico que voce quer ajudar.",
    arquivoUrl: "/biblioteca/skills/skill-quem-e-voce.md",
    tags: ["skill", "autodiagnostico", "conhecimento"],
    disponivel: true,
  },
  {
    id: "dia-1-skill-para-quem-ajudar",
    titulo: "Skill - Para Quem Voce Quer Ajudar?",
    tipo: "skill",
    dia: "dia-1",
    ordem: 3,
    descricao: "Transforma uma ideia ampla em um publico mais especifico, com dor e urgencia.",
    prioridade: "essencial",
    tempoEstimado: "14 min",
    ferramenta: "Codex",
    paraQueServe: "Definir para quem o produto sera criado e qual problema ele resolve primeiro.",
    resultadoEsperado: "Um recorte de publico com dor, desejo e contexto de compra.",
    proximoPasso: "Usar essa clareza para estruturar o conteudo do produto.",
    arquivoUrl: "/biblioteca/skills/skill-para-quem-voce-quer-ajudar.md",
    tags: ["skill", "publico", "dor"],
    disponivel: true,
  },
  {
    id: "dia-2-skill-estrutura-conteudo",
    titulo: "Skill - Estrutura do Conteudo",
    tipo: "skill",
    dia: "dia-2",
    ordem: 1,
    descricao: "Organiza o produto em uma sequencia clara de aulas, capitulos ou etapas.",
    prioridade: "essencial",
    tempoEstimado: "15 min",
    ferramenta: "Codex",
    paraQueServe: "Sair de ideias soltas para uma entrega enxuta e facil de produzir.",
    resultadoEsperado: "Uma estrutura de conteudo pronta para execucao.",
    proximoPasso: "Montar a oferta com base na entrega definida.",
    arquivoUrl: "/biblioteca/skills/skill-estrutura-do-conteudo.md",
    tags: ["skill", "conteudo", "estrutura"],
    disponivel: true,
  },
  {
    id: "dia-3-skill-construcao-oferta",
    titulo: "Skill - Construcao da Oferta",
    tipo: "skill",
    dia: "dia-3",
    ordem: 1,
    descricao: "Define promessa, beneficios, preco, bonus e argumentos principais da oferta.",
    prioridade: "essencial",
    tempoEstimado: "18 min",
    ferramenta: "Codex",
    paraQueServe: "Transformar o produto em uma proposta de compra simples e convincente.",
    resultadoEsperado: "Uma oferta organizada para apresentar ao publico certo.",
    proximoPasso: "Preparar os textos de publicacao e comunicacao da venda.",
    arquivoUrl: "/biblioteca/skills/skill-construcao-da-oferta.md",
    tags: ["skill", "oferta", "vendas"],
    disponivel: true,
  },
  {
    id: "dia-4-prompt-descricao-produto",
    titulo: "Prompt - Descricao do Produto",
    tipo: "prompt",
    dia: "dia-4",
    ordem: 1,
    descricao: "Gera uma descricao clara para cadastrar e apresentar o produto.",
    prioridade: "essencial",
    tempoEstimado: "8 min",
    ferramenta: "IA de texto",
    paraQueServe: "Criar a primeira versao da descricao usando a estrategia ja definida.",
    resultadoEsperado: "Texto base para a pagina ou cadastro do produto.",
    arquivoUrl: "/biblioteca/prompts/prompt-descricao-do-produto.md",
    tags: ["prompt", "descricao", "produto"],
    disponivel: true,
  },
  {
    id: "dia-4-prompt-emails-compra",
    titulo: "Prompt - E-mails da Compra",
    tipo: "prompt",
    dia: "dia-4",
    ordem: 2,
    descricao: "Cria mensagens de comunicacao para orientar o comprador depois da compra.",
    prioridade: "essencial",
    tempoEstimado: "10 min",
    ferramenta: "IA de texto",
    paraQueServe: "Preparar e-mails simples de boas-vindas, acesso e proximos passos.",
    resultadoEsperado: "Sequencia inicial de e-mails para o comprador.",
    arquivoUrl: "/biblioteca/prompts/prompt-emails-da-compra.md",
    tags: ["prompt", "email", "compra"],
    disponivel: true,
  },
  {
    id: "dia-4-skill-pagina-vendas",
    titulo: "Skill - Pagina de Vendas",
    tipo: "skill",
    dia: "dia-4",
    ordem: 3,
    descricao: "Organiza os blocos essenciais de uma pagina de vendas simples e direta.",
    prioridade: "essencial",
    tempoEstimado: "20 min",
    ferramenta: "Codex",
    paraQueServe: "Transformar a oferta em uma pagina com promessa, prova, beneficios e chamada para compra.",
    resultadoEsperado: "Estrutura de pagina pronta para escrever ou montar.",
    proximoPasso: "Executar o plano das primeiras vendas.",
    arquivoUrl: "/biblioteca/skills/skill-pagina-de-vendas.md",
    tags: ["skill", "pagina", "vendas"],
    disponivel: true,
  },
  {
    id: "dia-5-skill-plano-execucao-primeiras-vendas",
    titulo: "Skill - Plano de Execucao e Primeiras Vendas",
    tipo: "skill",
    dia: "dia-5",
    ordem: 1,
    descricao: "Transforma o produto pronto em um plano pratico para buscar as primeiras vendas.",
    prioridade: "essencial",
    tempoEstimado: "22 min",
    ferramenta: "Codex",
    paraQueServe: "Definir a rotina, os canais e as acoes iniciais de venda sem complicar o lancamento.",
    resultadoEsperado: "Plano de execucao para os primeiros dias de venda.",
    arquivoUrl: "/biblioteca/skills/skill-plano-de-execucao-e-primeiras-vendas.md",
    tags: ["skill", "execucao", "primeiras vendas"],
    disponivel: true,
  },
];
