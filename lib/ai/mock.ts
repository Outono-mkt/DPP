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
};
