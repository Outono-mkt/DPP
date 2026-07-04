export type AiProvider = "gemini" | "openai";

export type ProductGenerationInput = {
  skill: string;
  audience: string;
  audiencePain: string;
  transformation: string;
  preferredFormat: string;
  experienceLevel: string;
};

export type ProductGenerationResult = {
  nicho: string;
  ideia: string;
  nomes: [string, string, string];
  promessa: string;
  estrutura: [string, string, string, string, string];
  preco: string;
  proximo_passo: string;
};
