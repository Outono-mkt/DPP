import "server-only";

import type { DiscoveryResult, ProductResult } from "@/types";

export const mockDiscoveryResult: DiscoveryResult = {
  publicos: [
    {
      titulo: "Profissionais autonomos com renda irregular",
      descricao:
        "Pessoas que prestam servicos, vendem por demanda ou recebem em datas diferentes todos os meses.",
      porque_escolher:
        "Eles sentem a dor da instabilidade todo mes e precisam de um metodo simples, nao de teoria financeira.",
    },
    {
      titulo: "Prestadores de servico que misturam contas pessoais e profissionais",
      descricao:
        "Profissionais que recebem no CPF ou em uma unica conta e nao sabem separar custo, lucro e retirada.",
      porque_escolher:
        "Esse publico costuma trabalhar muito, mas perde clareza sobre lucro, custos e retirada.",
    },
    {
      titulo: "Pessoas endividadas que querem recomecar sem planilhas complexas",
      descricao:
        "Pessoas que ja tentaram se organizar, mas travam quando precisam lidar com numeros e prioridades.",
      porque_escolher:
        "A urgencia e alta e a promessa pode ser bem concreta: organizar, priorizar e agir.",
    },
  ],
  dores: [
    {
      titulo: "Nao saber quanto pode gastar",
      descricao:
        "A pessoa vive apagando incendio porque nao tem uma regra clara para decidir o que entra, sai e fica guardado.",
      nivel_consciencia: "Sabe que esta sem controle, mas ainda acha que o problema e ganhar pouco.",
      urgencia: "Alta, porque afeta decisoes de compra, contas do mes e ansiedade diaria.",
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
      nivel_consciencia: "Entende que a renda varia, mas nao sabe criar uma regra para se proteger.",
      urgencia: "Alta, principalmente para quem depende do proprio trabalho para pagar custos fixos.",
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
      nivel_consciencia: "Percebe a confusao, mas ainda nao tem um jeito simples de separar as entradas.",
      urgencia: "Media alta, porque impede crescimento e faz o profissional precificar mal.",
      frases_reais: [
        "Eu nao sei se o dinheiro que entrou e meu ou do negocio.",
        "As vezes acho que lucrei, mas depois aparece um custo que esqueci.",
        "Uso a mesma conta para tudo e me perco completamente.",
      ],
    },
    {
      titulo: "Comecar e abandonar o controle financeiro",
      descricao:
        "Metodos complicados geram empolgacao por poucos dias e depois viram mais uma frustracao.",
      nivel_consciencia: "Ja tentou resolver, mas acredita que organizacao financeira e complicada demais.",
      urgencia: "Media, mas cresce quando a pessoa se cansa de repetir o mesmo ciclo.",
      frases_reais: [
        "Eu baixo planilha, uso dois dias e abandono.",
        "Nao tenho paciencia para ficar categorizando tudo.",
        "Queria algo que eu conseguisse manter na vida real.",
      ],
    },
  ],
  transformacoes: [
    {
      titulo: "Clareza financeira em 7 dias",
      descricao: "Organizar entradas, saidas e prioridades em uma rotina simples.",
      resultado_final:
        "A pessoa entende exatamente para onde o dinheiro vai e qual e o primeiro ajuste a fazer.",
    },
    {
      titulo: "Plano simples para renda variavel",
      descricao: "Criar uma regra de distribuicao do dinheiro que funcione mesmo com meses diferentes.",
      resultado_final:
        "Ela passa a organizar ganhos irregulares com uma regra facil de repetir todo mes.",
    },
    {
      titulo: "Primeira reserva sem sofrimento",
      descricao: "Montar um plano realista para comecar uma reserva sem cortar tudo.",
      resultado_final:
        "Ela cria um plano realista para guardar dinheiro mesmo quando a renda oscila.",
    },
  ],
  formatos: [
    {
      nome: "Curso gravado",
      motivo:
        "E rapido de produzir, facil de consumir e combina com uma transformacao pratica de poucos dias.",
      porque_esse_formato:
        "Permite ensinar o metodo passo a passo e vender de forma escalavel sem depender de agenda individual.",
    },
    {
      nome: "Ebook",
      motivo:
        "Funciona bem quando o usuario precisa de exemplos prontos e aplicacao imediata.",
      porque_esse_formato:
        "Organiza o raciocinio em capitulos simples e pode ser criado rapidamente como primeira oferta.",
    },
    {
      nome: "Desafio",
      motivo:
        "Cria senso de progresso e ajuda o aluno a executar uma etapa por dia sem travar.",
      porque_esse_formato:
        "Combina com uma promessa de execucao rapida, com pequenas tarefas diarias e resultado visivel.",
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
    "Escolha o nome mais forte e transforme cada modulo em uma aula curta. Seu produto ja tem uma promessa clara para sair do papel.",
  cta_consultoria: {
    titulo: "Vamos transformar essa estrategia em um plano de acao?",
    contexto:
      "Voce ja tem uma boa direcao para um desafio financeiro de 5 dias, pensado para autonomos que vivem a instabilidade da renda variavel.",
    descricao:
      "Na consultoria personalizada, eu te ajudo a transformar essa estrategia em um plano de acao de 30 dias, definindo o que fazer, em que ordem executar e quais decisoes priorizar para tirar o produto do papel.",
    botao: "Quero montar meu plano de acao",
  },
};
