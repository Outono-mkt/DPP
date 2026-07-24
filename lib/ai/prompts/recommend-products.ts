import "server-only";

import type { ProductRecommendationInput } from "@/types";

const PRODUCT_FORMATS =
  "mentoria em grupo, mentoria individual, curso gravado, curso ao vivo, ebook, template ou kit pronto, consultoria, comunidade paga, workshop, servico feito para o cliente, agente GPT, mini-SaaS ou ferramenta web, planilha pronta, checklist e desafio";

export function buildProductRecommendationsPrompt(input: ProductRecommendationInput): string {
  return `Crie DUAS recomendacoes completas de produto digital.

Esta chamada NAO deve gerar o resultado final do Produto Pronto.
Ela deve apenas recomendar dois produtos possiveis para o usuario escolher.

PERFIL DO USUARIO

${input.profile}

PUBLICO ORIGINALMENTE DESCRITO

${input.targetAudienceDescription}

ESTRATEGIA ESCOLHIDA

Nome: ${input.selectedStrategy.nome}
Publico: ${input.selectedStrategy.publico}
Dor principal: ${input.selectedStrategy.dor_principal}
Transformacao: ${input.selectedStrategy.transformacao}
Justificativa: ${input.selectedStrategy.justificativa}
Trade-offs: ${input.selectedStrategy.tradeoffs}

NIVEL DE EXPERIENCIA

${input.experienceLevel}

${buildRegenerationBlock(input)}

OBJETIVO

Recomendar dois produtos viaveis, especificos e vendaveis que nascam da estrategia escolhida.

Formatos disponiveis no motor:

${PRODUCT_FORMATS}.

Regras:

- Retorne exatamente 2 produtos.
- Cada produto deve usar um formato existente no motor.
- Os dois produtos devem ser caminhos diferentes.
- Adapte complexidade e escopo ao nivel de experiencia.
- Nao gere o resultado final.
- Nao escreva como relatorio longo.
- Os cards da interface usarao apenas resumo, ticket, tempo e dificuldade; os detalhes ficarao no modal.
- Use portugues do Brasil.
- Responda apenas com JSON valido. Sem markdown. Sem texto adicional.

Retorne somente JSON neste formato exato:

{
  "produtos": [
    {
      "nome": "",
      "big_idea": "",
      "promessa": "",
      "publico": "",
      "dor": "",
      "transformacao": "",
      "formato": "",
      "estrutura": "",
      "modulos": ["", "", ""],
      "oferta": "",
      "ticket": "",
      "tempo_para_criar": "",
      "dificuldade": "",
      "resumo": "",
      "justificativa": "",
      "primeiros_passos": ["", "", ""]
    },
    {
      "nome": "",
      "big_idea": "",
      "promessa": "",
      "publico": "",
      "dor": "",
      "transformacao": "",
      "formato": "",
      "estrutura": "",
      "modulos": ["", "", ""],
      "oferta": "",
      "ticket": "",
      "tempo_para_criar": "",
      "dificuldade": "",
      "resumo": "",
      "justificativa": "",
      "primeiros_passos": ["", "", ""]
    }
  ]
}`;
}

function buildRegenerationBlock(input: ProductRecommendationInput) {
  const previousSuggestions = input.regeneration?.previousSuggestions ?? [];

  if (previousSuggestions.length === 0) {
    return "RODADA DE GERACAO\n\nPrimeira rodada. Nenhum produto anterior informado.";
  }

  return `RODADA DE GERACAO

Gere duas novas recomendacoes substancialmente diferentes das anteriores.

PRODUTOS ANTERIORES QUE NAO DEVEM SER REPETIDOS

${previousSuggestions.join("\n")}`;
}
