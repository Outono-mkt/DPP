import "server-only";

import type { DiscoveryResult, ProductResult } from "@/types";

export const mockDiscoveryResult: DiscoveryResult = {
  especialidades: [
    {
      titulo: "Organizacao financeira para autonomos",
      descricao:
        "Transformar renda variavel em um plano simples de controle, reserva e previsibilidade.",
    },
    {
      titulo: "Rotina pratica de dinheiro",
      descricao:
        "Ensinar pessoas ocupadas a cuidar do dinheiro em poucos minutos por semana.",
    },
    {
      titulo: "Primeiros passos para sair das dividas",
      descricao:
        "Criar um caminho direto para quem se sente perdido e precisa recuperar controle.",
    },
  ],
  publicos: [
    {
      titulo: "Profissionais autonomos com renda irregular",
      motivo:
        "Eles sentem a dor da instabilidade todo mes e precisam de um metodo simples, nao de teoria financeira.",
    },
    {
      titulo: "Prestadores de servico que misturam contas pessoais e profissionais",
      motivo:
        "Esse publico costuma trabalhar muito, mas perde clareza sobre lucro, custos e retirada.",
    },
    {
      titulo: "Pessoas endividadas que querem recomecar sem planilhas complexas",
      motivo:
        "A urgencia e alta e a promessa pode ser bem concreta: organizar, priorizar e agir.",
    },
  ],
  dores: [
    {
      titulo: "Nao saber quanto pode gastar",
      explicacao:
        "A pessoa vive apagando incendio porque nao tem uma regra clara para decidir o que entra, sai e fica guardado.",
    },
    {
      titulo: "Medo dos meses fracos",
      explicacao:
        "Quando a renda cai, tudo vira ansiedade porque nao existe reserva nem previsao minima.",
    },
    {
      titulo: "Misturar dinheiro do trabalho com dinheiro pessoal",
      explicacao:
        "Sem separar as contas, ela acha que vendeu bem, mas termina o mes sem saber para onde foi o dinheiro.",
    },
    {
      titulo: "Comecar e abandonar o controle financeiro",
      explicacao:
        "Metodos complicados geram empolgacao por poucos dias e depois viram mais uma frustracao.",
    },
  ],
  transformacoes: [
    {
      titulo: "Clareza financeira em 7 dias",
      resultado:
        "A pessoa entende exatamente para onde o dinheiro vai e qual e o primeiro ajuste a fazer.",
    },
    {
      titulo: "Plano simples para renda variavel",
      resultado:
        "Ela passa a organizar ganhos irregulares com uma regra facil de repetir todo mes.",
    },
    {
      titulo: "Primeira reserva sem sofrimento",
      resultado:
        "Ela cria um plano realista para guardar dinheiro mesmo quando a renda oscila.",
    },
  ],
  formatos: [
    {
      nome: "Aulas curtas gravadas com checklist",
      motivo:
        "E rapido de produzir, facil de consumir e combina com uma transformacao pratica de poucos dias.",
    },
    {
      nome: "Guia PDF com templates",
      motivo:
        "Funciona bem quando o usuario precisa de exemplos prontos e aplicacao imediata.",
    },
    {
      nome: "Desafio de 5 dias",
      motivo:
        "Cria senso de progresso e ajuda o aluno a executar uma etapa por dia sem travar.",
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
    "Modulo 1: Como enxergar sua renda real sem se assustar",
    "Modulo 2: Separando dinheiro pessoal e profissional em uma rotina simples",
    "Modulo 3: A regra dos percentuais para renda variavel",
    "Modulo 4: Como atravessar meses fracos com mais previsibilidade",
    "Modulo 5: Seu plano financeiro dos proximos 30 dias",
  ],
  preco:
    "Entre R$37 e R$67 no lancamento inicial, uma faixa baixa para validar a promessa e gerar as primeiras vendas.",
  proximo_passo:
    "Escolha o nome mais forte e transforme cada modulo em uma aula curta. Seu produto ja tem uma promessa clara para sair do papel.",
  cta_consultoria:
    "Agora que a estrategia do desafio financeiro esta desenhada, Gabriel pode te ajudar a transformar isso em um produto pronto para vender, com posicionamento, oferta, pagina e plano de lancamento.",
};
