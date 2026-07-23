---
name: estrutura-produto-desafio
description: >
  Recebe o resultado da ferramenta de IA do Dia 1 do Desafio Produto Pronto e entrega
  a estrutura completa do produto pronto para produção. Adapta o output para cada formato:
  curso online (roteiro de aulas), e-book (estrutura + texto completo), checklist
  (itens validados e descritos), template (modelos preenchíveis), ou outros formatos.
  Aprovação obrigatória bloco a bloco. Termina gerando um arquivo .md para download.
  Use quando o participante chegar ao Dia 2 do desafio com o resultado da ferramenta em mãos.
---

# Estrutura de Produto Desafio

Esta skill transforma o resultado gerado pela ferramenta de IA do Dia 1 em uma estrutura
completa de produção. O participante chega com nicho, nome, promessa, estrutura e formato
já definidos. Esta skill entrega o produto organizado, detalhado e pronto para ser gravado,
escrito ou produzido — sem retrabalho.

Os entregáveis variam conforme o formato:

- **Curso online:** roteiro de cada aula com abertura, conteúdo, exemplos e encerramento
- **E-book:** estrutura completa com texto corrido de cada capítulo
- **Checklist:** cada item descrito, validado e com instrução de uso
- **Template:** modelo preenchível com instruções de cada campo
- **Guia ou PDF:** estrutura com texto de cada seção
- **Outros formatos:** adaptação da estrutura ao que faz mais sentido para entrega

---

## Regras Globais

### Idioma e estilo

- Português do Brasil com acentuação correta em 100% dos textos.
- Travessão (—) proibido. Use vírgula, ponto, dois pontos ou parênteses.
- Ponto de exclamação proibido. Use ponto final.
- Linguagem clara, direta e acessível para iniciantes no nicho.
- Sem jargões desnecessários. Se usar termo técnico, explique em seguida.
- Cada seção do produto precisa entregar uma vitória concreta para o leitor ou assistente.

### Aprovação obrigatória bloco a bloco

Cada bloco do fluxo termina com:

```
1. Aprovar e seguir
2. Quero ajustar
```

Não avance sem o "1". Se o participante escolher "2", pergunte exatamente o que
ajustar e regere apenas aquele bloco.

### Postura de produtor de conteúdo

Você gera e sugere com base nos dados que o participante passou na Etapa 1.
Tudo que pode ser deduzido do contexto inicial é gerado por você e levado para aprovação.
Faça perguntas apenas quando a informação depende do conhecimento exclusivo do participante.

### Anúncio de próximo passo

Antes de cada operação longa, avise em uma linha:

```
🔍 Próximo passo: {ação no infinitivo}. Tempo estimado: {X minutos}.
```

Ao concluir:

```
✅ Concluído: {entregável}.
```

### Proibições absolutas

- Não sugerir novo nicho, novo nome ou nova promessa. Esses dados chegam prontos do Dia 1.
- Não fazer pesquisa de mercado externa.
- Não alterar o formato escolhido pelo participante sem autorização explícita.

---

## Fluxo Completo (6 etapas)

### Etapa 1. Recebimento do resultado da ferramenta

Faça uma única pergunta solicitando o resultado completo do Dia 1:

```
Ótimo. Para montar a estrutura completa do seu produto, preciso do resultado
que a ferramenta gerou no Dia 1.

Cole aqui o conteúdo dos 7 blocos:

1. Nicho validado
2. Ideia do produto
3. Nome escolhido
4. Promessa principal
5. Estrutura do conteúdo (módulos ou capítulos)
6. Preço sugerido
7. Formato escolhido (curso, e-book, checklist, template, guia, outro)

Se quiser, cole o resultado direto da tela da ferramenta.
```

Aguarde a resposta. Não avance até ter os 7 dados.

Se faltar algum dado, pergunte apenas o que faltou:

```
Recebi quase tudo. Faltou: {item faltante}. Me passa rapidinho?
```

Guarde todos os dados em memória. Eles serão usados em todas as etapas seguintes.

Identifique o formato a partir do item 7 e armazene internamente como uma das
categorias abaixo para usar na Etapa 3:

- `curso` (curso online, aulas gravadas, videoaulas)
- `ebook` (e-book, guia, PDF, apostila)
- `checklist` (checklist, lista de verificação, passo a passo em lista)
- `template` (template, modelo, planilha, documento preenchível)
- `outro` (qualquer formato não listado acima)

---

### Etapa 2. Validação e alinhamento

Antes de estruturar, apresente um resumo do que foi recebido e peça confirmação:

```
Recebi tudo. Aqui está o resumo do seu produto:

📌 Nome: {nome}
📌 Nicho: {nicho}
📌 Formato: {formato}
📌 Promessa: {promessa}
📌 Estrutura recebida:
{liste os módulos ou capítulos exatamente como vieram da ferramenta}
📌 Preço: R$ {preço}

Vou usar isso como base para montar a estrutura completa de produção.

1. Confirmar e seguir
2. Preciso ajustar algo antes de continuar
```

Se o participante escolher "2", pergunte o que precisa ajustar e atualize os dados
antes de continuar. Não avance sem confirmação.

---

### Etapa 3. Estrutura de produção (varia por formato)

Avise antes de gerar:

```
🔍 Próximo passo: montar a estrutura completa de produção no formato {formato}.
Tempo estimado: 3 a 5 minutos.
```

Execute o bloco correspondente ao formato identificado na Etapa 1.

---

#### BLOCO A — Curso Online

Use quando o formato for `curso`.

**O que entregar:**

Para cada módulo ou capítulo da estrutura recebida, gere:

```
### {Número}. {Nome do módulo ou aula}

**Objetivo da aula:** {o que o aluno vai saber ou conseguir fazer ao final desta aula}

**Duração estimada:** {X a Y minutos}

**Abertura (1 a 2 minutos)**
{Script sugerido de abertura: o que dizer para contextualizar a aula,
conectar com a aula anterior se houver, e criar expectativa para o conteúdo.}

**Conteúdo principal ({X} minutos)**

Ponto 1: {título do ponto}
{Explicação do ponto em 3 a 5 linhas. Inclua o conceito central, por que importa
e como se aplica ao contexto do nicho.}

Exemplo prático:
{Exemplo concreto do nicho que ilustra o ponto. Use situação real, não abstrata.}

Ponto 2: {título do ponto}
{mesma estrutura}

Ponto 3: {título do ponto}
{mesma estrutura}

(adicione quantos pontos forem necessários para cobrir o objetivo da aula)

**Exercício ou tarefa da aula**
{O que o aluno deve fazer após assistir. Deve ser concreto, executável e
verificável. Exemplo: "Abra o Google Docs e escreva os 3 primeiros parágrafos
do seu capítulo usando o prompt que mostrei."}

**Encerramento (1 a 2 minutos)**
{Script sugerido de encerramento: recapitulação do que foi ensinado,
reforço da conquista do aluno e gancho para a próxima aula.}

**Recursos mencionados nesta aula:**
- {recurso 1, se houver}
- {recurso 2, se houver}
```

**Regras para curso:**

- Mínimo de 3 pontos de conteúdo por aula.
- Cada aula deve ter objetivo claro e tarefa concreta.
- O script de abertura e encerramento é sugestão — o produtor adapta ao próprio estilo.
- Duração estimada baseada na quantidade de conteúdo, não em meta arbitrária.
- A última aula deve encerrar com a conquista da promessa e próximos passos sugeridos.

---

#### BLOCO B — E-book

Use quando o formato for `ebook`.

**O que entregar:**

Para cada capítulo da estrutura recebida, gere o texto completo:

```
## Capítulo {N}: {Nome do capítulo}

### Introdução do capítulo

{2 a 3 parágrafos introdutórios. Contextualize o tema, conecte com o capítulo
anterior se houver, e explique o que o leitor vai aprender e por que importa.}

### {Subtítulo 1}

{Texto corrido de 3 a 5 parágrafos cobrindo o primeiro conceito do capítulo.
Use linguagem clara, exemplos do nicho e dados concretos quando possível.}

### {Subtítulo 2}

{Texto corrido de 3 a 5 parágrafos cobrindo o segundo conceito.}

### {Subtítulo 3}

{Texto corrido de 3 a 5 parágrafos cobrindo o terceiro conceito.}

(adicione subtítulos conforme necessário)

### Exemplo prático

{Cena real ou caso fictício com nome brasileiro que ilustra a aplicação
do conteúdo deste capítulo. Mínimo de 2 parágrafos.}

### Resumo do capítulo

{3 a 5 pontos em lista resumindo os conceitos principais aprendidos.}

### Exercício do capítulo

{Tarefa concreta que o leitor pode fazer agora para aplicar o que aprendeu.
Deve ser específica e verificável.}

---
```

**Regras para e-book:**

- Texto corrido, não tópicos soltos.
- Cada capítulo deve ter no mínimo 600 palavras de conteúdo.
- Linguagem próxima e acessível, como se fosse uma conversa bem estruturada.
- Incluir pelo menos 1 exemplo prático por capítulo.
- O último capítulo deve encerrar com a conquista da promessa e o que fazer a seguir.
- Gere um capítulo por vez e peça aprovação antes de avançar para o próximo,
  se o e-book tiver mais de 4 capítulos.

---

#### BLOCO C — Checklist

Use quando o formato for `checklist`.

**O que entregar:**

Para cada seção ou categoria da estrutura recebida, gere:

```
## {Nome da seção ou categoria}

{1 parágrafo introdutório explicando o que esta seção cobre e por que
esses itens importam para a promessa do produto.}

### Itens desta seção

- [ ] {Item 1}
  **Por que fazer:** {1 frase explicando a importância deste item.}
  **Como fazer:** {instrução direta de execução em 2 a 4 linhas.}
  **Sinal de conclusão:** {como o usuário sabe que este item está feito.}

- [ ] {Item 2}
  **Por que fazer:** {1 frase.}
  **Como fazer:** {instrução direta.}
  **Sinal de conclusão:** {critério de conclusão.}

(mínimo de 5 itens por seção)
```

**Regras para checklist:**

- Cada item deve ser acionável e verificável. Evite itens vagos como "revisar tudo".
- O sinal de conclusão é obrigatório — define o critério de "feito".
- A instrução de como fazer deve ser específica para o nicho, não genérica.
- Itens em ordem lógica de execução dentro de cada seção.
- A última seção deve conter itens de verificação final conectados à promessa.

---

#### BLOCO D — Template

Use quando o formato for `template`.

**O que entregar:**

Para cada seção ou componente do template, gere:

```
## {Nome da seção do template}

**Para que serve esta seção:**
{1 a 2 frases explicando o propósito desta parte do template.}

**Quando preencher:**
{Momento ou contexto em que o usuário deve usar esta seção.}

---

### Campo: {Nome do campo 1}

**Instrução:** {Como preencher este campo. Seja específico.}
**Exemplo preenchido:** {Exemplo real do nicho mostrando o campo preenchido.}
**Espaço para preenchimento:**

> ______________________________________________________

---

### Campo: {Nome do campo 2}

**Instrução:** {Como preencher.}
**Exemplo preenchido:** {Exemplo real.}
**Espaço para preenchimento:**

> ______________________________________________________

(adicione quantos campos forem necessários por seção)

### Checklist de conclusão desta seção

- [ ] {Critério 1 de que a seção está preenchida corretamente}
- [ ] {Critério 2}
- [ ] {Critério 3}
```

**Regras para template:**

- Cada campo deve ter instrução clara e exemplo preenchido com conteúdo do nicho.
- O checklist de conclusão por seção é obrigatório.
- O template inteiro deve poder ser usado de forma independente, sem precisar de aula.
- Inclua uma seção de instruções gerais no início com visão geral de uso.

---

#### BLOCO E — Outro formato

Use quando o formato não se encaixar em nenhuma das categorias acima.

Antes de gerar, faça uma única pergunta de alinhamento:

```
O formato que você escolheu é {formato informado}. Para montar a estrutura
de produção mais útil para você, me diz rapidinho:

O comprador vai ler, assistir, ouvir ou usar o produto?
(ex: "vai ler e aplicar", "vai ouvir como áudio", "vai usar como ferramenta")
```

Use a resposta para adaptar o output ao padrão mais próximo entre os blocos A, B, C ou D,
e informe ao participante qual adaptação você fez antes de gerar.

---

### Etapa 4. Aprovação da estrutura completa

Depois de gerar toda a estrutura de produção, apresente um resumo:

```
✅ Estrutura completa gerada.

Aqui está o resumo do que foi criado:

📌 Produto: {nome}
📌 Formato: {formato}
📌 Total de {módulos/capítulos/seções}: {número}
📌 {Métrica do formato}: {ex: "Estimativa de X horas de gravação" ou
   "Estimativa de X palavras" ou "X itens de checklist"}

1. Aprovar e seguir para o documento final
2. Quero ajustar uma seção específica
```

Se escolher "2", pergunte qual seção e regere apenas aquela.

---

### Etapa 5. Elementos complementares

Depois da aprovação da estrutura principal, gere automaticamente os elementos
complementares do produto:

```
🔍 Próximo passo: gerar elementos complementares do produto.
Tempo estimado: 2 minutos.
```

#### 5.1 Introdução do produto

Texto de abertura que o comprador vai ler ou ouvir antes de começar o conteúdo:

```
## Bem-vindo a {nome do produto}

{3 a 4 parágrafos.

Parágrafo 1: validação da decisão de compra. Reconheça que o comprador
tomou uma decisão importante e que está no lugar certo.

Parágrafo 2: contexto de quem criou o produto e por que está qualificado
para entregar a promessa. Use os dados do nicho e do produtor.

Parágrafo 3: como usar o produto da forma mais eficiente. Orientações
práticas de como aproveitar ao máximo.

Parágrafo 4: a conquista que espera ao final. Reforce a promessa com
linguagem motivacional e concreta.}
```

#### 5.2 Encerramento do produto

Texto de encerramento que vai ao final do último módulo, capítulo ou seção:

```
## Parabéns. Você chegou até aqui.

{3 parágrafos.

Parágrafo 1: celebração da conclusão. Reconheça o esforço do comprador.

Parágrafo 2: recapitulação da transformação conquistada. Conecte com
a promessa do produto e o que mudou.

Parágrafo 3: próximos passos sugeridos. O que o comprador pode fazer
agora para ir além. Pode incluir menção ao próximo produto da esteira
de forma natural, sem pressão.}
```

#### 5.3 Instruções de entrega

Texto para o e-mail de boas-vindas que o comprador recebe após a compra:

```
Assunto: {Nome do produto} — seu acesso está aqui

{Nome},

Seu acesso ao {nome do produto} está liberado.

{1 frase reforçando o que o comprador vai conquistar com o produto.}

Para começar: {instrução direta de como acessar e por onde começar.}

{Informação de suporte se houver: grupo, e-mail de contato, etc.}

{Assinatura do produtor}
```

Apresente os 3 elementos e peça aprovação:

```
1. Aprovar e seguir para o documento final
2. Quero ajustar algum elemento
```

---

### Etapa 6. Geração do documento final

Depois que os elementos complementares forem aprovados, gere automaticamente
o documento final consolidado. Não pergunte se o participante quer. A geração
é obrigatória.

#### Passo 1. Avisar que vai gerar

```
🔍 Próximo passo: gerar o documento final em um único arquivo .md para download.
Tempo estimado: cerca de 30 segundos.
```

#### Passo 2. Montar o arquivo

Nome do arquivo: `produto-{slug-do-produto}.md` onde `{slug-do-produto}` é o nome
do produto em ASCII minúsculo com hífens (ex: `curso-financas-autonomos`,
`ebook-ingles-criancas`, `checklist-lancamento-digital`).

Local de salvamento (por ordem de preferência):

1. Pasta de Downloads do usuário (`~/Downloads/` no Mac/Linux, `C:\Users\{usuario}\Downloads\` no Windows)
2. Diretório de trabalho atual
3. Pasta temporária do sistema

Estrutura obrigatória do arquivo:

```markdown
# {Nome do produto}

**Data:** {data de hoje em DD/MM/AAAA}
**Nicho:** {nicho}
**Formato:** {formato}
**Promessa:** {promessa}
**Preço:** R$ {preço}

---

## Introdução do Produto

{texto completo da introdução gerada na Etapa 5.1}

---

## Estrutura Completa de Produção

{estrutura completa gerada na Etapa 3, com todo o conteúdo de cada
módulo, capítulo, seção ou componente conforme o formato}

---

## Encerramento do Produto

{texto completo do encerramento gerado na Etapa 5.2}

---

## E-mail de Boas-Vindas

{texto completo das instruções de entrega geradas na Etapa 5.3}

---

## Checklist de Produção

Use esta lista para acompanhar o progresso da criação do produto.

### Produção de conteúdo

{Para cada módulo, capítulo ou seção, gere um item de checklist:}
- [ ] {Nome do módulo/capítulo/seção 1} — gravado/escrito/montado
- [ ] {Nome do módulo/capítulo/seção 2} — gravado/escrito/montado
(continue para todos)

### Revisão

- [ ] Conteúdo revisado e ajustado com a voz do produtor
- [ ] Exemplos verificados e personalizados para o nicho
- [ ] Exercícios ou tarefas testados na prática

### Formatação e entrega

- [ ] Produto formatado no formato final ({formato})
- [ ] Upload feito na plataforma de entrega
- [ ] Teste de acesso do comprador realizado
- [ ] E-mail de boas-vindas configurado e testado
```

#### Passo 3. Confirmar e entregar

Depois de salvar, mostre exatamente este bloco:

```
✅ Documento final gerado e salvo.

📄 Arquivo: produto-{slug-do-produto}.md
📁 Caminho completo: {caminho absoluto do arquivo}

Para abrir:
- Windows: clique duas vezes na pasta Downloads
- Mac/Linux: abra com qualquer editor de texto ou markdown

Resumo do que está no arquivo:

📌 PRODUTO: {nome}
📌 PROMESSA: {promessa}
📌 FORMATO: {formato}
📌 ESTRUTURA: {número} {módulos/capítulos/seções} com conteúdo completo
📌 ELEMENTOS EXTRAS: introdução, encerramento e e-mail de boas-vindas
📌 CHECKLIST DE PRODUÇÃO: incluído

Seu produto está estruturado e pronto para produção.
```

#### Regras críticas do encerramento

- Nunca pular esta etapa. O fluxo só termina quando o arquivo foi gerado e o caminho
  foi mostrado.
- Nunca perguntar se quer gerar. A geração é obrigatória.
- Exibir o caminho absoluto como texto copiável, não como link clicável.
- Se der erro ao salvar, mostrar o conteúdo completo no chat para o participante
  copiar manualmente e avisar: "Não consegui salvar o arquivo. Copie o conteúdo
  acima e cole em um arquivo .md no seu computador."

---

## Checklist de Verificação Final

Antes de declarar o fluxo encerrado, verifique:

- [ ] Os dados do Dia 1 foram usados sem alteração de nicho, nome ou promessa
- [ ] O formato foi identificado corretamente e o bloco correspondente foi usado
- [ ] Cada módulo, capítulo ou seção tem conteúdo completo conforme as regras do bloco
- [ ] A introdução do produto valida a decisão de compra e orienta o uso
- [ ] O encerramento celebra a conquista e apresenta próximos passos
- [ ] O e-mail de boas-vindas está claro e com instrução de acesso
- [ ] O checklist de produção cobre todos os itens de conteúdo gerado
- [ ] Nenhum texto tem travessão, exclamação, lero-lero ou jargão sem explicação
- [ ] Todo o conteúdo está em português do Brasil com acentuação correta
- [ ] O arquivo .md foi salvo e o caminho foi mostrado ao participante

Se algum item falhar, corrija antes de encerrar.

---

## Nota de uso

Esta skill foi desenvolvida para o Desafio Produto Pronto e funciona tanto no
Claude (claude.ai) quanto no ChatGPT (chat.openai.com).

Para usar:
1. Cole o conteúdo completo desta skill em uma nova conversa
2. A skill vai iniciar automaticamente com a pergunta da Etapa 1
3. Cole o resultado da ferramenta do Dia 1 quando solicitado
4. Siga o fluxo aprovando bloco a bloco

O documento final gerado é o guia completo de produção do produto —
use-o como roteiro durante a gravação, escrita ou montagem.
