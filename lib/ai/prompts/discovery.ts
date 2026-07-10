import "server-only";

import type { DiscoveryInput } from "@/types";

const PRODUCT_FORMATS =
  "mentoria em grupo, mentoria individual, curso gravado, curso ao vivo, ebook, template ou kit pronto, consultoria, comunidade paga, workshop, servico feito para o cliente, agente GPT, mini-SaaS ou ferramenta web, planilha pronta, checklist e desafio";

export function buildDiscoveryPrompt(input: DiscoveryInput): string {
  return `${buildDiscoveryInstruction(input)}

Retorne somente JSON valido neste formato exato:
{
  "publicos": [
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" }
  ],
  "dores": [
    {
      "titulo": "",
      "descricao": "",
      "porque": "",
      "tradeoff": "",
      "frases_reais": ["", "", ""]
    },
    {
      "titulo": "",
      "descricao": "",
      "porque": "",
      "tradeoff": "",
      "frases_reais": ["", "", ""]
    },
    {
      "titulo": "",
      "descricao": "",
      "porque": "",
      "tradeoff": "",
      "frases_reais": ["", "", ""]
    }
  ],
  "transformacoes": [
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" }
  ],
  "formatos": [
    { "nome": "", "titulo": "", "descricao": "", "porque": "", "tradeoff": "", "tempo_medio": "", "dificuldade": "", "ticket_recomendado": "", "perfil_ideal": "", "potencial_escala": "", "avaliacao": 4 },
    { "nome": "", "titulo": "", "descricao": "", "porque": "", "tradeoff": "", "tempo_medio": "", "dificuldade": "", "ticket_recomendado": "", "perfil_ideal": "", "potencial_escala": "", "avaliacao": 3 },
    { "nome": "", "titulo": "", "descricao": "", "porque": "", "tradeoff": "", "tempo_medio": "", "dificuldade": "", "ticket_recomendado": "", "perfil_ideal": "", "potencial_escala": "", "avaliacao": 3 }
  ]
}

Regras do JSON:
- Retornar 3 publicos.
- Retornar 3 dores.
- Retornar 3 transformacoes.
- Retornar 3 formatos.
- Em toda recomendacao, "porque" deve explicar por que voce esta recomendando aquilo.
- Em toda recomendacao, "tradeoff" deve explicar o que a pessoa perde ou complica se escolher outro caminho.
- Cada dor deve ter 3 frases reais que parecam comentarios de Instagram, WhatsApp, YouTube ou conversa com cliente.
- "avaliacao" deve ser um numero inteiro de 1 a 5.
- Responda apenas com JSON valido. Sem texto adicional.`;
}

function buildDiscoveryInstruction(input: DiscoveryInput): string {
  if (input.regeneration) {
    return buildRegenerationPrompt(input);
  }

  return `Analise as informacoes abaixo e crie opcoes estrategicas para o primeiro produto digital do usuario.

PERFIL DO USUARIO

${input.profile}

PUBLICO DESCRITO PELO USUARIO

${input.targetAudienceDescription}

RODADA DE GERACAO

1

OPCOES JA GERADAS, QUE NAO DEVEM SER REPETIDAS

Nenhuma.

OBJETIVO

Encontrar opcoes especificas, simples de entender, comercialmente interessantes e viaveis para um primeiro produto.

Gere:

- 3 publicos;
- 3 dores;
- 3 transformacoes;
- 3 formatos recomendados.

A primeira opcao de cada grupo deve ser a principal recomendacao.

As outras opcoes precisam representar caminhos realmente diferentes.

Nao repita ideias anteriores.

Nao apenas troque palavras.

O publico, a dor, a transformacao e o formato precisam ter coerencia entre si.

Para formatos, use apenas opcoes existentes no motor de produtos fornecido pelo sistema.

Formatos disponiveis no motor:

${PRODUCT_FORMATS}.`;
}

function buildRegenerationPrompt(input: DiscoveryInput): string {
  const regeneration = input.regeneration;

  if (!regeneration) {
    return "";
  }

  return `Gere uma nova rodada apenas para a etapa:

${regeneration.stage}

CONTEXTO ESSENCIAL

Perfil do usuario: ${input.profile}
Publico descrito pelo usuario: ${input.targetAudienceDescription}
Publico ja escolhido: ${regeneration.selectedAudience ?? "ainda nao escolhido"}
Dor ja escolhida: ${regeneration.selectedPain ?? "ainda nao escolhida"}
Transformacao ja escolhida: ${regeneration.selectedTransformation ?? "ainda nao escolhida"}

OPCOES ANTERIORES

${regeneration.previousSuggestions.length > 0 ? regeneration.previousSuggestions.join("\n") : "Nenhuma opcao anterior informada."}

REGRAS

- Gere exatamente 3 novas opcoes.
- As opcoes precisam ser substancialmente diferentes das anteriores.
- Nao apenas troque palavras.
- Nao repita publico, dor, promessa, angulo ou formato ja utilizado.
- Mantenha coerencia com as respostas originais.
- A primeira opcao deve ser a melhor recomendacao.
- Use linguagem simples, especifica e comercial.
- Para formatos, use apenas estas opcoes do motor: ${PRODUCT_FORMATS}.
- Retorne somente o JSON solicitado.`;
}
