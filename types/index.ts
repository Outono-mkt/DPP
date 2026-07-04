export type AiProvider = "gemini" | "openai";

export type DiscoveryInput = {
  profile: string;
  targetAudienceDescription: string;
};

export type DiscoveryResult = {
  especialidades: Array<{
    titulo: string;
    descricao: string;
  }>;
  publicos: Array<{
    titulo: string;
    motivo: string;
  }>;
  dores: Array<{
    titulo: string;
    explicacao: string;
  }>;
  transformacoes: Array<{
    titulo: string;
    resultado: string;
  }>;
  formatos: Array<{
    nome: string;
    motivo: string;
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
  estrutura: [string, string, string, string, string];
  preco: string;
  proximo_passo: string;
  cta_consultoria: string;
};
