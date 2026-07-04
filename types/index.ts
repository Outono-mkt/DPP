export type AiProvider = "gemini" | "openai";

export type DiscoveryInput = {
  profile: string;
  targetAudienceDescription: string;
};

export type DiscoveryResult = {
  publicos: Array<{
    titulo: string;
    descricao: string;
    porque_escolher: string;
  }>;
  dores: Array<{
    titulo: string;
    descricao: string;
    nivel_consciencia: string;
    urgencia: string;
    frases_reais: [string, string, string];
  }>;
  transformacoes: Array<{
    titulo: string;
    descricao: string;
    resultado_final: string;
  }>;
  formatos: Array<{
    nome: string;
    motivo: string;
    porque_esse_formato: string;
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
  preco: string;
  proximo_passo: string;
  cta_consultoria: string;
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
