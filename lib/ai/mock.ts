import "server-only";

import type { DiscoveryResult, ProductResult } from "@/types";

export const mockDiscoveryResult: DiscoveryResult = {
  publicos: [
    {
      titulo: "Profissionais autonomos com renda irregular",
      descricao:
        "Pessoas que prestam servicos, vendem por demanda ou recebem em datas diferentes todos os meses.",
      porque:
        "Eles sentem a dor da instabilidade todo mes e precisam de um metodo simples, nao de teoria financeira.",
      tradeoff:
        "Se escolher um publico amplo demais, a promessa fica fraca e parece mais uma dica financeira generica.",
    },
    {
      titulo: "Prestadores de servico que misturam contas pessoais e profissionais",
      descricao:
        "Profissionais que recebem no CPF ou em uma unica conta e nao sabem separar custo, lucro e retirada.",
      porque:
        "Esse publico costuma trabalhar muito, mas perde clareza sobre lucro, custos e retirada.",
      tradeoff:
        "Exige exemplos de negocio e caixa, entao pode ser menos direto para quem quer falar de vida pessoal.",
    },
    {
      titulo: "Pessoas endividadas que querem recomecar sem planilhas complexas",
      descricao:
        "Pessoas que ja tentaram se organizar, mas travam quando precisam lidar com numeros e prioridades.",
      porque:
        "A urgencia e alta e a promessa pode ser bem concreta: organizar, priorizar e agir.",
      tradeoff:
        "Pode atrair pessoas com menor poder de compra e exigir uma promessa mais cuidadosa.",
    },
  ],
  dores: [
    {
      titulo: "Nao saber quanto pode gastar",
      descricao:
        "A pessoa vive apagando incendio porque nao tem uma regra clara para decidir o que entra, sai e fica guardado.",
      porque: "Essa dor vende bem porque aparece toda vez que a pessoa precisa decidir se pode gastar ou guardar.",
      tradeoff: "Se escolher uma dor mais ampla, a oferta perde urgencia e vira educacao financeira comum.",
      frases_reais: [
        "Eu recebo, pago umas coisas e quando vejo ja acabou.",
        "Tenho medo de gastar e depois faltar para uma conta importante.",
        "Nunca sei se posso comprar alguma coisa ou se estou me enganando.",
      ],
    },
    {
      titulo: "Medo dos meses fracos",
      descricao:
        "Quando a renda cai, tudo vira ansiedade porque nao existe reserva nem previsao minima.",
      porque: "A inseguranca dos meses fracos e facil de reconhecer e cria desejo por previsibilidade.",
      tradeoff: "Pode exigir falar de reserva e planejamento, o que assusta quem quer resultado imediato.",
      frases_reais: [
        "Quando entra menos cliente eu entro em desespero.",
        "Um mes bom nao compensa a inseguranca do mes seguinte.",
        "Eu queria saber quanto guardar quando recebo mais.",
      ],
    },
    {
      titulo: "Misturar dinheiro do trabalho com dinheiro pessoal",
      descricao:
        "Sem separar as contas, ela acha que vendeu bem, mas termina o mes sem saber para onde foi o dinheiro.",
      porque: "Misturar contas mostra um erro concreto e permite vender uma solucao simples de separacao.",
      tradeoff: "Funciona melhor para quem ja recebe como autonomo, nao para quem ainda esta comecando.",
      frases_reais: [
        "Eu nao sei se o dinheiro que entrou e meu ou do negocio.",
        "As vezes acho que lucrei, mas depois aparece um custo que esqueci.",
        "Uso a mesma conta para tudo e me perco completamente.",
      ],
    },
  ],
  transformacoes: [
    {
      titulo: "Clareza financeira em 7 dias",
      descricao: "Organizar entradas, saidas e prioridades em uma rotina simples.",
      porque: "Promete um ganho rapido e facil de visualizar: parar de decidir no escuro.",
      tradeoff: "Se prometer algo maior, como enriquecer, a oferta perde credibilidade.",
    },
    {
      titulo: "Plano simples para renda variavel",
      descricao: "Criar uma regra de distribuicao do dinheiro que funcione mesmo com meses diferentes.",
      porque: "A regra mensal vira um mecanismo claro para vender o produto.",
      tradeoff: "Pode parecer menos emocional do que falar diretamente da ansiedade com dinheiro.",
    },
    {
      titulo: "Primeira reserva sem sofrimento",
      descricao: "Montar um plano realista para comecar uma reserva sem cortar tudo.",
      porque: "Reserva e um desejo concreto para quem vive meses fortes e fracos.",
      tradeoff: "A promessa pode parecer distante para quem ainda esta apagando incendio.",
    },
  ],
  formatos: [
    {
      nome: "Curso gravado",
      titulo: "Curso gravado",
      descricao: "Aulas curtas para ensinar a regra financeira em uma ordem simples.",
      porque: "Combina com passo a passo e pode vender continuamente sem depender da agenda.",
      tradeoff: "Exige gravar e organizar aulas, entao demora mais do que um checklist ou ebook.",
      tempo_medio: "6 horas de gravacao e 1 dia de organizacao.",
      dificuldade: "Media",
      ticket_recomendado: "R$197 a R$497",
      perfil_ideal: "Quem quer vender no automatico depois da primeira versao.",
      potencial_escala: "Alto",
      avaliacao: 4,
    },
    {
      nome: "Ebook",
      titulo: "Ebook",
      descricao: "Um guia pratico com exemplos e checklist para aplicar em poucos dias.",
      porque: "E rapido de produzir e funciona bem como primeira oferta de baixo risco.",
      tradeoff: "Tem menos valor percebido que uma experiencia guiada em video.",
      tempo_medio: "1 a 2 dias de escrita e revisao.",
      dificuldade: "Baixa",
      ticket_recomendado: "R$37 a R$97",
      perfil_ideal: "Quem quer validar rapido antes de gravar aulas.",
      potencial_escala: "Medio",
      avaliacao: 3,
    },
    {
      nome: "Desafio",
      titulo: "Desafio",
      descricao: "Uma experiencia de 5 dias com tarefas simples para organizar a renda variavel.",
      porque: "Cria movimento, urgencia e sensacao de progresso todos os dias.",
      tradeoff: "Precisa de comunicacao mais ativa para manter o aluno executando.",
      tempo_medio: "1 dia para roteiro e 5 aulas curtas.",
      dificuldade: "Media",
      ticket_recomendado: "R$47 a R$197",
      perfil_ideal: "Quem quer entregar resultado rapido e vender com prazo.",
      potencial_escala: "Alto",
      avaliacao: 5,
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
