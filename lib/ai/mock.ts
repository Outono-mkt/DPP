import "server-only";

import type { DiscoveryResult, ProductRecommendationResult, ProductResult } from "@/types";

export const mockDiscoveryResult: DiscoveryResult = {
  estrategias: [
    {
      nome: "Renda Clara para Autonomos",
      resumo: "Organizar renda variavel com regras simples de decisao e separacao do dinheiro.",
      publico: "Profissionais autonomos que recebem em datas diferentes e vivem com inseguranca financeira.",
      dor_principal: "Nao saber quanto podem gastar, guardar ou retirar sem comprometer o mes seguinte.",
      transformacao: "Sair da confusao mensal para uma rotina simples de previsibilidade financeira.",
      justificativa: "E um publico com dor frequente, alta urgencia e aplicacao pratica imediata.",
      tradeoffs: "Exige falar de dinheiro com clareza e evitar promessas exageradas de enriquecimento.",
      recomendada: true,
    },
    {
      nome: "Separacao Financeira do Prestador",
      resumo: "Ajudar prestadores a separar dinheiro pessoal, custos e lucro sem planilhas complexas.",
      publico: "Prestadores de servico que misturam contas pessoais e profissionais na mesma conta.",
      dor_principal: "Achar que venderam bem, mas terminar o mes sem entender para onde o dinheiro foi.",
      transformacao: "Criar uma separacao simples entre caixa, retirada, custos e reserva.",
      justificativa: "A dor e concreta e a solucao pode ser entregue com exemplos e modelos simples.",
      tradeoffs: "Funciona melhor para quem ja tem alguma entrada recorrente de servicos.",
      recomendada: false,
    },
    {
      nome: "Primeira Reserva sem Planilha",
      resumo: "Guiar pessoas a montar uma reserva inicial com tarefas simples e realistas.",
      publico: "Pessoas com renda instavel que querem recomecar sem se perder em planilhas.",
      dor_principal: "Sentir que nunca sobra dinheiro suficiente para criar uma reserva.",
      transformacao: "Comecar uma reserva viavel sem cortar tudo nem depender de controle complexo.",
      justificativa: "A promessa e desejavel, mas precisa ser cuidadosa para nao parecer milagre financeiro.",
      tradeoffs: "Pode atrair um publico com menor poder de compra e exigir ticket inicial mais baixo.",
      recomendada: false,
    },
  ],
};

export const mockProductRecommendationResult: ProductRecommendationResult = {
  produtos: [
    {
      nome: "Renda Irregular, Vida Organizada",
      big_idea: "Autonomos nao precisam de salario fixo para ter previsibilidade.",
      promessa: "Organize sua renda variavel em 5 dias sem depender de planilhas complexas.",
      publico: "Profissionais autonomos com entradas irregulares.",
      dor: "Nao saber quanto gastar, guardar ou separar para custos.",
      transformacao: "Criar uma regra simples para decidir o destino do dinheiro.",
      formato: "Desafio",
      estrutura: "Experiencia de 5 dias com uma tarefa objetiva por dia.",
      modulos: ["Diagnostico da renda", "Separacao simples", "Plano dos proximos 30 dias"],
      oferta: "Desafio pratico com aulas curtas, checklist e modelo de decisao financeira.",
      ticket: "R$47 a R$97",
      tempo_para_criar: "2 a 3 dias",
      dificuldade: "Media",
      resumo: "Um desafio curto para entregar clareza financeira rapidamente.",
      justificativa: "Combina urgencia, promessa concreta e execucao simples para primeira venda.",
      primeiros_passos: ["Definir promessa", "Roteirizar 5 tarefas", "Montar checklist de aplicacao"],
    },
    {
      nome: "Mapa do Dinheiro Autonomo",
      big_idea: "Uma regra visual vale mais que uma planilha abandonada.",
      promessa: "Separe custos, retirada e reserva com um mapa financeiro simples.",
      publico: "Prestadores de servico que misturam dinheiro pessoal e profissional.",
      dor: "Nao saber se o negocio esta dando lucro de verdade.",
      transformacao: "Enxergar o dinheiro com clareza e separar cada finalidade.",
      formato: "Ebook",
      estrutura: "Guia pratico com exemplos, modelos e checklist.",
      modulos: ["Mapa inicial", "Regra de separacao", "Rotina semanal"],
      oferta: "Ebook direto com modelos preenchidos e checklist de decisao.",
      ticket: "R$37 a R$67",
      tempo_para_criar: "1 a 2 dias",
      dificuldade: "Baixa",
      resumo: "Um guia rapido para validar o tema com baixo custo de producao.",
      justificativa: "E mais simples de produzir e vender como primeira oferta.",
      primeiros_passos: ["Escrever sumario", "Criar exemplos", "Montar modelo de separacao"],
    },
  ],
};

export const mockProductResult: ProductResult = {
  oportunidade:
    "Autonomos com renda variavel sentem uma dor constante de previsibilidade e tomada de decisao. Essa ideia faz sentido porque entrega um caminho simples, rapido e aplicavel para organizar o dinheiro sem depender de planilhas complexas ou linguagem financeira dificil.",
  nicho:
    "Profissionais autonomos que ganham de forma irregular e querem organizar a vida financeira sem depender de planilhas complexas.",
  ideia:
    "Um desafio pratico de 5 dias para organizar as financas mesmo com renda variavel, usando regras simples e templates prontos.",
  nomes: [
    "Renda Irregular, Vida Organizada",
    "Metodo do Autonomo Financeiro",
    "Financas sem Salario Fixo",
  ],
  promessa:
    "Em 5 dias, organize sua renda variavel, entenda para onde o dinheiro vai e crie um plano simples para guardar dinheiro sem planilhas complicadas.",
  mecanismo: {
    nome: "Regra dos 5 dias de dinheiro claro",
    explicacao:
      "O desafio combina diagnostico da renda, separacao das contas, regra de distribuicao e checklist de decisao para transformar entradas irregulares em um plano pratico de controle.",
  },
  beneficios: [
    "Saber quanto pode gastar sem medo de comprometer o mes seguinte",
    "Separar dinheiro pessoal e profissional com uma regra simples",
    "Reduzir a ansiedade nos meses de menor faturamento",
    "Criar uma primeira reserva mesmo com entradas irregulares",
    "Tomar decisoes de compra com mais confianca",
    "Entender quais clientes e servicos realmente sustentam a renda",
    "Parar de depender de planilhas que abandona depois de poucos dias",
    "Melhorar a imagem profissional ao tratar o proprio dinheiro com clareza",
    "Ganhar tempo com uma rotina financeira semanal curta",
    "Ter um plano pratico para crescer sem misturar caixa, lucro e retirada",
  ],
  perfis_clientes: [
    {
      titulo: "Autonomo que vende bem, mas nunca ve dinheiro sobrar",
      descricao:
        "Tem clientes, trabalha bastante e sente que deveria estar melhor financeiramente, mas perde controle entre entradas e saidas.",
    },
    {
      titulo: "Prestador de servico que mistura tudo na mesma conta",
      descricao:
        "Usa o mesmo dinheiro para custos, casa e retirada, por isso nao sabe se o negocio esta dando lucro de verdade.",
    },
    {
      titulo: "Profissional em fase de recomeco financeiro",
      descricao:
        "Quer sair das dividas ou montar uma reserva, mas precisa de um metodo simples para nao desistir no meio.",
    },
  ],
  frases_cliente: [
    "Eu ate vendo, mas no fim do mes parece que o dinheiro sumiu.",
    "Quando tenho um mes fraco, fico sem saber o que pagar primeiro.",
    "Ja tentei planilha, mas acho complicado e abandono rapido.",
    "Nao sei separar o que e meu e o que e do trabalho.",
    "Queria guardar dinheiro, mas minha renda muda todo mes.",
  ],
  estrutura: [
    "Dia 1: Diagnostico da renda real e dos principais vazamentos",
    "Dia 2: Organizacao das contas pessoais e profissionais",
    "Dia 3: Regra simples para distribuir entradas irregulares",
    "Dia 4: Plano para atravessar meses fracos com mais previsibilidade",
    "Dia 5: Checklist financeiro dos proximos 30 dias",
  ],
  objecoes: [
    {
      objecao: "Nao tenho tempo para organizar minhas financas.",
      porque_aparece: "O autonomo ja trabalha muito e associa organizacao financeira a planilhas longas.",
      como_responder: "O desafio foi pensado para uma tarefa curta por dia, sem controle complexo.",
    },
    {
      objecao: "Minha renda varia demais para qualquer metodo funcionar.",
      porque_aparece: "A pessoa acha que so consegue se organizar quem recebe salario fixo.",
      como_responder: "A proposta e justamente adaptar a organizacao para entradas irregulares.",
    },
    {
      objecao: "Ja tentei planilha e abandonei.",
      porque_aparece: "Tentativas anteriores criaram frustracao e baixa confianca.",
      como_responder: "Aqui o foco e uma regra simples de decisao, com checklist pratico e menos dependencia de planilha.",
    },
    {
      objecao: "Nao sei se vale pagar por algo tao basico.",
      porque_aparece: "A pessoa compara o produto com conteudos gratuitos soltos.",
      como_responder: "O valor esta na ordem certa de execucao e na clareza para tomar decisoes sem se perder.",
    },
    {
      objecao: "Tenho medo de descobrir que minha situacao esta pior do que penso.",
      porque_aparece: "A dor envolve ansiedade e evitacao dos numeros.",
      como_responder: "O primeiro passo e enxergar a situacao sem julgamento para decidir o proximo movimento.",
    },
  ],
  como_vender: {
    angulo_principal: "Organizacao financeira para autonomos que nao recebem salario fixo.",
    problema_de_entrada: "A pessoa vende, trabalha e recebe, mas nao sabe quanto pode gastar nem quanto deveria guardar.",
    transformacao_destacada: "Sair da confusao mensal para uma regra simples de controle em 5 dias.",
    prova_recomendada:
      "Mostrar antes e depois de uma distribuicao simples de renda variavel, com exemplo de mes bom e mes fraco.",
    cta_recomendado: "Comece hoje criando seu plano financeiro dos proximos 30 dias.",
  },
  preco:
    "Entre R$37 e R$67 no lancamento inicial, uma faixa baixa para validar a promessa e gerar as primeiras vendas.",
  proximo_passo:
    "Semana 1: escolha o nome, feche a promessa e escreva o roteiro das 5 aulas. Semana 2: grave as aulas e organize os templates. Semana 3: monte a pagina simples e configure o checkout. Semana 4: publique os primeiros conteudos e convide os primeiros compradores.",
  plano_execucao: [
    {
      etapa: "Preparacao",
      itens: [
        "Escolher o nome final do desafio",
        "Definir a promessa de 5 dias",
        "Separar exemplos de renda variavel para usar nas aulas",
      ],
    },
    {
      etapa: "Criacao",
      itens: [
        "Criar roteiro das 5 aulas curtas",
        "Gravar uma aula por dia",
        "Montar checklist financeiro dos proximos 30 dias",
      ],
    },
    {
      etapa: "Venda",
      itens: [
        "Configurar checkout",
        "Criar uma pagina simples com promessa, para quem e e conteudo",
        "Fazer a primeira oferta para contatos e seguidores",
      ],
    },
  ],
  status_projeto: [
    { etapa: "Ideia", status: "concluido" },
    { etapa: "Produto", status: "concluido" },
    { etapa: "Estrutura", status: "concluido" },
    { etapa: "Conteudo", status: "em_andamento" },
    { etapa: "Pagina de vendas", status: "pendente" },
    { etapa: "Primeiras vendas", status: "pendente" },
    { etapa: "Escala", status: "pendente" },
  ],
  cta_consultoria: {
    titulo: "Seu produto ja esta estruturado.",
    contexto:
      "Agora começa a etapa mais importante: transformar essa estrategia em vendas reais.",
    descricao:
      "Na Consultoria Plano de Acao de 30 dias, eu monto com voce um plano personalizado para construir, lancar e vender esse produto da forma mais rapida e organizada possivel.",
    botao: "Quero montar meu Plano de Acao de 30 dias",
  },
};
