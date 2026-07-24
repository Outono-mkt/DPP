import "server-only";

import type { DiscoveryInput } from "@/types";

export function buildDiscoveryPrompt(input: DiscoveryInput): string {
  return `Analise as informacoes abaixo como um consultor estrategico.

PERFIL DO USUARIO

${input.profile}

PUBLICO DESCRITO PELO USUARIO

${input.targetAudienceDescription}

${buildRegenerationBlock(input)}

OBJETIVO

Gerar exatamente 3 estrategias completas para transformar o conhecimento do usuario em uma oportunidade de produto digital.

Cada estrategia deve conter:

- nome da estrategia;
- resumo curto;
- publico;
- dor principal;
- transformacao;
- justificativa;
- trade-offs;
- recomendada.

Regras:

- A primeira estrategia deve ser a recomendada principal.
- Apenas uma estrategia deve ter "recomendada": true.
- As outras duas devem ser caminhos diferentes, nao variacoes cosmeticas.
- Nao comece pelo formato do produto.
- Comece pela competencia real do usuario e pela transformacao mais vendavel.
- O publico precisa parecer uma pessoa ou grupo reconhecivel, com contexto real.
- A dor precisa ser especifica e urgente.
- A transformacao precisa ser concreta, plausivel e vendavel.
- A justificativa deve explicar por que esse caminho faz sentido.
- Os trade-offs devem explicar o que complica ou limita essa escolha.
- Use portugues do Brasil.
- Use linguagem simples, especifica e comercial.
- Nao use texto generico.
- Responda apenas com JSON valido. Sem markdown. Sem texto adicional.

Retorne somente JSON neste formato exato:

{
  "estrategias": [
    {
      "nome": "",
      "resumo": "",
      "publico": "",
      "dor_principal": "",
      "transformacao": "",
      "justificativa": "",
      "tradeoffs": "",
      "recomendada": true
    },
    {
      "nome": "",
      "resumo": "",
      "publico": "",
      "dor_principal": "",
      "transformacao": "",
      "justificativa": "",
      "tradeoffs": "",
      "recomendada": false
    },
    {
      "nome": "",
      "resumo": "",
      "publico": "",
      "dor_principal": "",
      "transformacao": "",
      "justificativa": "",
      "tradeoffs": "",
      "recomendada": false
    }
  ]
}`;
}

function buildRegenerationBlock(input: DiscoveryInput) {
  const previousSuggestions = input.regeneration?.previousSuggestions ?? [];

  if (previousSuggestions.length === 0) {
    return "RODADA DE GERACAO\n\nPrimeira rodada. Nenhuma estrategia anterior informada.";
  }

  return `RODADA DE GERACAO

Gere 3 novas estrategias substancialmente diferentes das anteriores.

ESTRATEGIAS ANTERIORES QUE NAO DEVEM SER REPETIDAS

${previousSuggestions.join("\n")}`;
}
