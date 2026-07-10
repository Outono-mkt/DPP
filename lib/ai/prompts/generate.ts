import "server-only";

import type { FinalGenerationInput } from "@/types";

export function buildProductPrompt(
  input: FinalGenerationInput,
  formatMethodology: string,
): string {
  return `Crie a estrategia final do produto digital com base nas informacoes e escolhas abaixo.

Voce nao deve agir como gerador de conteudo.

Voce deve agir como um consultor estrategico que acabou de passar uma hora entendendo o posicionamento, a oferta e o caminho de execucao.

Antes de escrever qualquer campo, pense nesta ordem:

1. Qual competencia real o usuario possui.
2. Que transformacao essa competencia consegue gerar.
3. Qual oportunidade comercial existe nessa transformacao.
4. Qual mecanismo torna essa transformacao crivel.
5. Qual produto nasce desse mecanismo.
6. Como transformar isso em oferta vendavel.
7. Qual execucao simples tira a ideia do papel.

Antes de escolher o produto, responda internamente:

- O que essa pessoa faz melhor que outras?
- O que ela consegue ensinar facilmente?
- Qual transformacao ela gera?
- O que as pessoas pagariam para aprender?

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

O produto deve nascer da transformacao escolhida, nao da profissao do usuario.

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
  "oportunidade": "maximo 5 linhas, explicando a competencia, a transformacao vendavel, a oportunidade e por que este produto foi escolhido",
  "nicho": "descricao especifica do nicho em uma frase",
  "ideia": "descricao do produto em uma frase clara e objetiva",
  "nomes": ["nome curto com branding 1", "nome curto com branding 2", "nome curto com branding 3"],
  "promessa": "headline especifica com resultado, tempo quando plausivel e principal objecao",
  "mecanismo": {
    "nome": "nome proprio do mecanismo, curto, especifico e vendavel",
    "explicacao": "poucas linhas explicando por que o mecanismo e diferente, qual logica exclusiva existe e como entrega a transformacao"
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
    { "titulo": "nome ficticio, idade e recorte", "descricao": "rotina, maior dificuldade e objetivo" },
    { "titulo": "nome ficticio, idade e recorte", "descricao": "rotina, maior dificuldade e objetivo" },
    { "titulo": "nome ficticio, idade e recorte", "descricao": "rotina, maior dificuldade e objetivo" }
  ],
  "frases_cliente": [
    "frase real 1",
    "frase real 2",
    "frase real 3",
    "frase real 4",
    "frase real 5"
  ],
  "estrutura": ["PASSO ou ENCONTRO com nome especifico seguindo exatamente a metodologia do formato escolhido"],
  "objecoes": [
    { "objecao": "OBJECAO: ...", "porque_aparece": "POR QUE ELA EXISTE: ...", "como_responder": "COMO RESPONDER: ... COMO PROVAR: ..." },
    { "objecao": "OBJECAO: ...", "porque_aparece": "POR QUE ELA EXISTE: ...", "como_responder": "COMO RESPONDER: ... COMO PROVAR: ..." },
    { "objecao": "OBJECAO: ...", "porque_aparece": "POR QUE ELA EXISTE: ...", "como_responder": "COMO RESPONDER: ... COMO PROVAR: ..." },
    { "objecao": "OBJECAO: ...", "porque_aparece": "POR QUE ELA EXISTE: ...", "como_responder": "COMO RESPONDER: ... COMO PROVAR: ..." },
    { "objecao": "OBJECAO: ...", "porque_aparece": "POR QUE ELA EXISTE: ...", "como_responder": "COMO RESPONDER: ... COMO PROVAR: ..." }
  ],
  "como_vender": {
    "angulo_principal": "Headline curta do roteiro de vendas",
    "problema_de_entrada": "Gancho e problema em linguagem de video",
    "transformacao_destacada": "Agitacao, nova oportunidade e apresentacao do mecanismo",
    "prova_recomendada": "Oferta e prova simples adequada ao usuario",
    "cta_recomendado": "CTA curto e direto"
  },
  "preco": "faixa de preco sugerida com justificativa em uma linha",
  "proximo_passo": "Roadmap em 3 fases: Fase 1 Validacao. Fase 2 Producao. Fase 3 Venda.",
  "plano_execucao": [
    { "etapa": "FASE 1: VALIDACAO", "itens": ["verbo + tarefa objetiva", "verbo + tarefa objetiva", "verbo + tarefa objetiva"] },
    { "etapa": "FASE 2: PRODUCAO", "itens": ["verbo + tarefa objetiva", "verbo + tarefa objetiva", "verbo + tarefa objetiva"] },
    { "etapa": "FASE 3: VENDA", "itens": ["verbo + tarefa objetiva", "verbo + tarefa objetiva", "verbo + tarefa objetiva"] }
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
- Antes de criar produto, identifique internamente competencia, transformacao, oportunidade e mecanismo.
- Nunca transforme profissao em produto.
- O produto deve ser consequencia da transformacao vendavel.
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
- O mecanismo deve ter nome proprio e nao pode ser apenas nome bonito.
- O mecanismo deve explicar por que e diferente, qual logica exclusiva existe e o que faz que outros caminhos nao fazem.
- O mecanismo nao pode ser Metodo Simples, Sistema Inteligente, Metodo Completo ou Planejamento Inteligente.
- A promessa deve ter resultado concreto e preferir numero, prazo ou situacao especifica quando for responsavel e plausivel.
- A promessa deve seguir a logica: resultado + prazo ou simplicidade + sem a principal objecao.
- A promessa deve parecer headline de pagina de vendas e ter no maximo 2 linhas.
- A promessa nunca deve comecar com "aprenda", "descubra" ou "conheca".
- A promessa nao deve usar ponto de exclamacao.
- A promessa nao deve usar travessao.
- Nao use frases como "jornada de transformacao", "desbloquear potencial", "mudar sua vida", "alcance seus sonhos", "mude sua realidade" ou "tenha sucesso".
- Nao use nomes genericos como "Kit Nutricional", "Curso Financeiro", "Mentoria de Marketing" ou "Guia de Engenharia".
- Evite usar nos nomes: Guia, Metodo, Sistema, Express, Completo, Ultimate, Pro e Master.
- Os nomes devem parecer criados por uma agencia: memoraveis, especificos e faceis de repetir.
- Nao use "Metodo" em todos os nomes.
- Gere 10 beneficios concretos conectados a dor, transformacao e formato.
- Misture resultado financeiro, emocional, pratico, de status e de tempo.
- Cada beneficio deve ser especifico e nao repetir a mesma ideia com outras palavras.
- Gere 3 perfis ideais de cliente, cada um com recorte diferente do publico.
- Cada perfil deve ter nome ficticio, idade, rotina, maior dificuldade e objetivo.
- Nao crie perfis iguais com nomes diferentes.
- Gere 5 frases que o cliente real diria em Instagram, WhatsApp, YouTube ou conversa com cliente.
- As frases devem soar como WhatsApp ou direct, nascer das respostas do usuario e nao de frases genericas prontas.
- Gere exatamente 5 objecoes especificas para o produto criado.
- Cada objecao deve considerar preco, tempo, aplicacao, tentativas anteriores, confianca no formato, experiencia do usuario ou dificuldade especifica do nicho quando fizer sentido.
- Cada resposta de objecao deve ser curta, pratica e util para vendas.
- Cada objecao deve seguir o formato: OBJECAO, POR QUE ELA EXISTE, COMO RESPONDER e COMO PROVAR.
- Inclua COMO PROVAR dentro do campo "como_responder", sem criar campo novo.
- Cada objecao completa deve ter no maximo 80 palavras.
- Em como_vender, crie um mini roteiro com headline, gancho, problema, agitacao, nova oportunidade, apresentacao do mecanismo, oferta e CTA.
- Cada bloco de como_vender deve ser curto e pronto para virar video.
- Proximos passos deve ser um roadmap em 3 fases: VALIDACAO, PRODUCAO e VENDA.
- Plano de Execucao deve ser visual e objetivo, com etapas FASE 1: VALIDACAO, FASE 2: PRODUCAO e FASE 3: VENDA.
- Cada item do plano de execucao deve comecar com verbo de acao.
- Plano de Execucao deve ser checklist adaptado ao formato escolhido. Curso usa roteiro, gravacao, edicao, publicacao e checkout. Ebook usa sumario, escrita, diagramacao e checkout. Mentoria usa encontros, material, grupo e primeira turma. Mini SaaS usa MVP, wireframe, desenvolvimento, teste e lancamento.
- O plano de execucao tambem deve funcionar como Checklist Executivo adaptado ao formato escolhido.
- Na estrutura, nao use Capitulo 1, Capitulo 2, Modulo 1 ou Modulo 2.
- Use nomes de estrutura com identidade propria, como PASSO 1: Organize sua semana ou Encontro 1: Diagnostico.
- Status do projeto deve usar apenas: concluido, em_andamento ou pendente.
- O CTA da consultoria deve usar exatamente os textos do schema.
- Nunca mencione acompanhamento de 6 meses.
- Nao use "Fale comigo" como CTA principal.
- Use portugues do Brasil, linguagem concreta, sem respostas genericas.
- Responda apenas com JSON. Sem texto adicional.`;
}
