export type AiProvider = "gemini" | "openai";

export type DiscoveryInput = {
  profile: string;
  targetAudienceDescription: string;
  regeneration?: {
    stage: "audience" | "pain" | "transformation" | "format";
    selectedAudience?: string;
    selectedPain?: string;
    selectedTransformation?: string;
    previousSuggestions: string[];
  };
};

export type StrategicRecommendation = {
  titulo: string;
  descricao: string;
  porque: string;
  tradeoff: string;
};

export type DiscoveryResult = {
  publicos: StrategicRecommendation[];
  dores: Array<StrategicRecommendation & {
    frases_reais: [string, string, string];
  }>;
  transformacoes: StrategicRecommendation[];
  formatos: Array<StrategicRecommendation & {
    nome: string;
    tempo_medio: string;
    dificuldade: string;
    ticket_recomendado: string;
    perfil_ideal: string;
    potencial_escala: string;
    avaliacao: number;
  }>;
};

export type FinalGenerationInput = {
  profile: string;
  targetAudienceDescription: string;
  selectedAudience: string;
  selectedPain: string;
  selectedTransformation: string;
  experienceLevel: string;
  selectedFormat: string;
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
