import "server-only";

import type { FinalGenerationInput } from "@/types";

export function buildProductPrompt(
  input: FinalGenerationInput,
  formatMethodology: string,
): string {
  return `Crie a estrategia final do produto digital com base nas informacoes e escolhas abaixo.

PERFIL DO USUARIO

${input.profile}

PUBLICO ORIGINALMENTE DESCRITO

${input.targetAudienceDescription}

PUBLICO ESCOLHIDO

${input.selectedAudience}

DOR ESCOLHIDA

${input.selectedPain}

TRANSFORMACAO ESCOLHIDA

${input.selectedTransformation}

NIVEL DE EXPERIENCIA

${input.experienceLevel}

FORMATO ESCOLHIDO

${input.selectedFormat}

METODOLOGIA OBRIGATORIA DO FORMATO

${formatMethodology}

BENEFICIOS OU ESCOLHAS ADICIONAIS

Nao informado pelo usuario.

OBJETIVO

Criar um produto simples, especifico, vendavel e viavel para ser produzido rapidamente.

Nao escreva como relatorio empresarial.

Nao resuma apenas o que o usuario disse.

Tome decisoes.

Escolha o melhor posicionamento dentro das informacoes fornecidas.

A estrutura deve respeitar integralmente a metodologia do formato escolhido.

O resultado deve ser curto, claro, humano e imediatamente utilizavel.

O plano de execucao deve ser adaptado ao formato escolhido.

O CTA final deve apresentar somente a Consultoria Plano de Acao de 30 dias.

Nao mencione o programa de acompanhamento de seis meses.

Retorne somente JSON valido neste formato exato:
{
  "oportunidade": "maximo 5 linhas, simples, explicando por que essa ideia faz sentido",
  "nicho": "descricao especifica do nicho em uma frase",
  "ideia": "descricao do produto em uma frase clara e objetiva",
  "nomes": ["nome 1", "nome 2", "nome 3"],
  "promessa": "headline de ate 2 linhas com vontade imediata de comprar",
  "mecanismo": {
    "nome": "nome curto e especifico do mecanismo",
    "explicacao": "poucas linhas explicando como o produto entrega a transformacao"
  },
  "beneficios": [
    "beneficio concreto 1",
    "beneficio concreto 2",
    "beneficio concreto 3",
    "beneficio concreto 4",
    "beneficio concreto 5",
    "beneficio concreto 6",
    "beneficio concreto 7",
    "beneficio concreto 8",
    "beneficio concreto 9",
    "beneficio concreto 10"
  ],
  "perfis_clientes": [
    { "titulo": "perfil ideal 1", "descricao": "descricao especifica" },
    { "titulo": "perfil ideal 2", "descricao": "descricao especifica" },
    { "titulo": "perfil ideal 3", "descricao": "descricao especifica" }
  ],
  "frases_cliente": [
    "frase real 1",
    "frase real 2",
    "frase real 3",
    "frase real 4",
    "frase real 5"
  ],
  "estrutura": ["etapa personalizada seguindo exatamente a metodologia do formato escolhido"],
  "objecoes": [
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" }
  ],
  "como_vender": {
    "angulo_principal": "Comece dizendo...",
    "problema_de_entrada": "Mostre...",
    "transformacao_destacada": "Explique...",
    "prova_recomendada": "Use como prova...",
    "cta_recomendado": "Convide..."
  },
  "preco": "faixa de preco sugerida com justificativa em uma linha",
  "proximo_passo": "Semana 1: ... Semana 2: ... Semana 3: ... Semana 4: ...",
  "plano_execucao": [
    { "etapa": "Preparacao", "itens": ["item 1", "item 2"] },
    { "etapa": "Criacao", "itens": ["item 1", "item 2"] },
    { "etapa": "Venda", "itens": ["item 1", "item 2"] }
  ],
  "status_projeto": [
    { "etapa": "Ideia", "status": "concluido" },
    { "etapa": "Produto", "status": "concluido" },
    { "etapa": "Estrutura", "status": "concluido" },
    { "etapa": "Conteudo", "status": "em_andamento" },
    { "etapa": "Pagina de vendas", "status": "pendente" },
    { "etapa": "Primeiras vendas", "status": "pendente" },
    { "etapa": "Escala", "status": "pendente" }
  ],
  "cta_consultoria": {
    "titulo": "Seu produto ja esta estruturado.",
    "contexto": "Agora comeca a etapa mais importante: transformar essa estrategia em vendas reais.",
    "descricao": "Na Consultoria Plano de Acao de 30 dias, eu monto com voce um plano personalizado para construir, lancar e vender esse produto da forma mais rapida e organizada possivel.",
    "botao": "Quero montar meu Plano de Acao de 30 dias"
  }
}

Regras:
- Seja especifico, nunca generico.
- Use linguagem simples e direta.
- Antes de finalizar, reescreva qualquer resposta que pareca texto de IA.
- O produto deve ser viavel para criar em poucos dias.
- A estrutura do produto deve obrigatoriamente seguir a metodologia do formato escolhido.
- Use a quantidade ideal, o tipo de estrutura e os nomes das etapas definidos pelo sistema.
- A IA deve apenas personalizar os titulos das etapas conforme nicho, dor e transformacao.
- Nao transforme Ebook em Curso.
- Nao transforme Mentoria em Ebook.
- Nao transforme Workshop em Curso.
- Nao crie modulos quando o formato utiliza encontros.
- Nao crie capitulos quando o formato utiliza funcionalidades.
- Nao crie uma estrutura completamente nova.
- Respeite completamente o formato.
- A oportunidade deve ter no maximo 5 linhas e nao pode soar academica.
- O mecanismo deve ser curto, especifico e explicar como o produto entrega a transformacao.
- O mecanismo deve ser coerente com nicho, dor, transformacao, formato e estrutura.
- Nao invente nome sofisticado sem sentido para o mecanismo.
- A promessa deve ter resultado concreto e preferir numero, prazo ou situacao especifica.
- A promessa deve parecer headline de pagina de vendas e ter no maximo 2 linhas.
- A promessa nao deve usar ponto de exclamacao.
- A promessa nao deve usar travessao.
- Nao use frases como "jornada de transformacao", "desbloquear potencial" ou "mudar sua vida".
- Nao use nomes genericos como "Metodo Lucro da Construcao". Os nomes devem parecer produtos reais, curtos e vendaveis.
- Nao use "Metodo" em todos os nomes.
- Gere 10 beneficios concretos conectados a dor, transformacao e formato.
- Cada beneficio deve ser especifico e nao repetir a mesma ideia com outras palavras.
- Gere 3 perfis ideais de cliente, cada um com recorte diferente do publico.
- Nao crie perfis iguais com nomes diferentes.
- Gere 5 frases que o cliente real diria em Instagram, WhatsApp, YouTube ou conversa com cliente.
- As frases devem soar reais e nascer das respostas do usuario, nao de frases genericas prontas.
- Gere exatamente 5 objecoes especificas para o produto criado.
- Cada objecao deve considerar preco, tempo, aplicacao, tentativas anteriores, confianca no formato, experiencia do usuario ou dificuldade especifica do nicho quando fizer sentido.
- Cada resposta de objecao deve ser curta, pratica e util para vendas.
- Em como_vender, transforme em roteiro. Cada campo deve comecar com a acao indicada no schema.
- Proximos passos deve ser um plano semanal com Semana 1, Semana 2, Semana 3 e Semana 4, com tarefas claras.
- Plano de Execucao deve ser checklist adaptado ao formato escolhido. Curso usa roteiro, gravacao, edicao, publicacao e checkout. Ebook usa sumario, escrita, diagramacao e checkout. Mentoria usa encontros, material, grupo e primeira turma. Mini SaaS usa MVP, wireframe, desenvolvimento, teste e lancamento.
- Status do projeto deve usar apenas: concluido, em_andamento ou pendente.
- O CTA da consultoria deve usar exatamente os textos do schema.
- Nunca mencione acompanhamento de 6 meses.
- Nao use "Fale comigo" como CTA principal.
- Use portugues do Brasil, linguagem concreta, sem respostas genericas.
- Responda apenas com JSON. Sem texto adicional.`;
}
