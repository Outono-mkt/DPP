export type AiProvider = "gemini" | "openai";

export type DiscoveryInput = {
  profile: string;
  targetAudienceDescription: string;
  regeneration?: {
    previousSuggestions: string[];
  };
};

export type ProductStrategy = {
  nome: string;
  resumo: string;
  publico: string;
  dor_principal: string;
  transformacao: string;
  justificativa: string;
  tradeoffs: string;
  recomendada: boolean;
};

export type DiscoveryResult = {
  estrategias: [ProductStrategy, ProductStrategy, ProductStrategy];
};

export type ProductRecommendationInput = {
  profile: string;
  targetAudienceDescription: string;
  selectedStrategy: ProductStrategy;
  experienceLevel: string;
  regeneration?: {
    previousSuggestions: string[];
  };
};

export type ProductRecommendation = {
  nome: string;
  big_idea: string;
  promessa: string;
  publico: string;
  dor: string;
  transformacao: string;
  formato: string;
  estrutura: string;
  modulos: string[];
  oferta: string;
  ticket: string;
  tempo_para_criar: string;
  dificuldade: string;
  resumo: string;
  justificativa: string;
  primeiros_passos: string[];
};

export type ProductRecommendationResult = {
  produtos: [ProductRecommendation, ProductRecommendation];
};

export type FinalGenerationInput = {
  profile: string;
  targetAudienceDescription: string;
  selectedAudience: string;
  selectedPain: string;
  selectedTransformation: string;
  experienceLevel: string;
  selectedFormat: string;
  selectedStrategy?: ProductStrategy;
  selectedProduct?: ProductRecommendation;
};

export type ProductResult = {
  oportunidade: string;
  nicho: string;
  ideia: string;
  nomes: [string, string, string];
  promessa: string;
  mecanismo: {
    nome: string;
    explicacao: string;
  };
  beneficios: [string, string, string, string, string, string, string, string, string, string];
  perfis_clientes: [
    {
      titulo: string;
      descricao: string;
    },
    {
      titulo: string;
      descricao: string;
    },
    {
      titulo: string;
      descricao: string;
    },
  ];
  frases_cliente: [string, string, string, string, string];
  estrutura: string[];
  objecoes: [
    {
      objecao: string;
      porque_aparece: string;
      como_responder: string;
    },
    {
      objecao: string;
      porque_aparece: string;
      como_responder: string;
    },
    {
      objecao: string;
      porque_aparece: string;
      como_responder: string;
    },
    {
      objecao: string;
      porque_aparece: string;
      como_responder: string;
    },
    {
      objecao: string;
      porque_aparece: string;
      como_responder: string;
    },
  ];
  como_vender: {
    angulo_principal: string;
    problema_de_entrada: string;
    transformacao_destacada: string;
    prova_recomendada: string;
    cta_recomendado: string;
  };
  preco: string;
  proximo_passo: string;
  plano_execucao: Array<{
    etapa: string;
    itens: string[];
  }>;
  status_projeto: Array<{
    etapa: string;
    status: "concluido" | "em_andamento" | "pendente";
  }>;
  cta_consultoria: {
    titulo: string;
    contexto: string;
    descricao: string;
    botao: string;
  };
};

export type SavedProductResult = {
  id: string;
  user_id: string;
  profile: string;
  target_audience_description: string;
  selected_audience: string;
  selected_pain: string;
  selected_transformation: string;
  experience_level: string;
  selected_format: string;
  generated_result: ProductResult;
  created_at: string;
};

export type SavedProductSummary = Pick<
  SavedProductResult,
  "id" | "selected_format" | "generated_result" | "created_at"
>;
