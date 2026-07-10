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

  return `Analise as informacoes abaixo como um consultor estrategico.

Nao comece pelo produto.

Pense primeiro na competencia que a pessoa possui.

Depois descubra a transformacao mais valiosa que essa competencia pode gerar.

Somente depois crie opcoes de publico, dor, transformacao e formato.

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

A logica deve ser:

Profissao -> competencia -> transformacao -> oportunidade -> mecanismo -> produto -> oferta -> execucao.

Nao transforme profissao em produto.

Descubra o ativo principal da pessoa:

- habilidade que diferencia;
- experiencia que gera autoridade;
- resultado que ela ja consegue produzir;
- problema que resolve naturalmente;
- situacao concreta em que ela consegue ajudar melhor.

Antes de recomendar formato, responda internamente:

- O que essa pessoa faz melhor que outras?
- O que ela consegue ensinar facilmente?
- Qual transformacao ela gera?
- O que as pessoas pagariam para aprender?

Gere:

- 3 publicos;
- 3 dores;
- 3 transformacoes;
- 3 formatos recomendados.

A primeira opcao de cada grupo deve ser a principal recomendacao.

As outras opcoes precisam representar caminhos realmente diferentes.

Cada publico deve parecer uma pessoa ou grupo reconhecivel, com rotina, momento, problema e desejo.

Cada dor deve nascer de uma situacao real, nao de uma categoria ampla.

Cada transformacao deve mostrar um destino concreto, nao um tema.

Cada formato deve nascer da transformacao e da capacidade de execucao do usuario.

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

Antes de gerar, pense na cadeia:

Profissao -> competencia -> transformacao -> oportunidade -> mecanismo -> produto -> oferta -> execucao.

Nao gere uma variacao cosmetica.

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
- Busque uma nova transformacao, um novo mecanismo ou um novo recorte real.
- Evite qualquer opcao que pareca generica ou que poderia servir para varios nichos.
- Para formatos, use apenas estas opcoes do motor: ${PRODUCT_FORMATS}.
- Retorne somente o JSON solicitado.`;
}
