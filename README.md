# Produto Pronto

Arquitetura inicial do projeto Produto Pronto.

Esta etapa prepara a base tecnica da aplicacao, sem implementar login, onboarding, IA real, Supabase real, Hotmart ou geracao de PDF.

## Stack escolhida

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Providers de IA preparados para Gemini agora e OpenAI futuramente.\n- Arquitetura de IA em duas etapas: descoberta estrategica e geracao do produto final.
- Supabase Auth para controle de acesso com e-mail e senha.
- Supabase reservado para persistencia futura.
- Hotmart reservado para validacao futura de compras via webhook.

## Estrutura de pastas

```txt
app/
  globals.css
  layout.tsx
  page.tsx
components/
lib/
  ai/\n    gemini.ts\n    index.ts\n    mock.ts\n    openai.ts
  hotmart/
    index.ts
  supabase/
    admin.ts
    client.ts
    index.ts
  pdf.ts
types/
  index.ts
```

## Variaveis de ambiente

Use `.env.example` como referencia. Nao crie nem versione `.env` real.

Variaveis previstas:

- `GEMINI_API_KEY`
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HOTMART_WEBHOOK_SECRET`
- `HOTMART_PRODUCT_ID`
- `NEXT_PUBLIC_SITE_URL`


## Arquitetura de IA

A criacao do produto usa duas chamadas de backend:

1. `POST /api/discovery`: recebe `profile` e `targetAudienceDescription` e retorna sugestoes de publicos, dores, transformacoes e formatos.
2. `POST /api/generate`: recebe as escolhas finais do usuario e retorna os 7 blocos do produto pronto.

O frontend nunca acessa chaves de IA diretamente. Gemini e usado quando `AI_PROVIDER=gemini` e `GEMINI_API_KEY` existe. Se a chave nao estiver configurada, o sistema usa mock local. OpenAI continua como placeholder para uma etapa futura.
## Supabase Auth

Configure no Supabase:

1. Crie ou selecione o projeto Supabase.
2. Em Authentication, mantenha habilitado o provedor Email.
3. Crie usuarios manualmente para testes com e-mail e senha.
4. Copie a Project URL para `NEXT_PUBLIC_SUPABASE_URL`.
5. Copie a anon/public key para `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Copie a service role key para `SUPABASE_SERVICE_ROLE_KEY`.

Seguranca:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser usados no frontend.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no frontend.
- A criacao futura de usuarios vindos da Hotmart deve usar a funcao server-only `createPurchasedUser`.

## Configuracao de Deploy e Variaveis de Ambiente

### GitHub

Repositorio usado pelo projeto:

```txt
https://github.com/Outono-mkt/DPP.git
```

Branch principal:

```txt
main
```

### Configuracao local

Configure as variaveis em `.env.local`, na raiz do projeto.

Importante: `.env.local` nunca deve ser enviado para o GitHub. Ele ja esta listado no `.gitignore`.

Variaveis obrigatorias agora:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DPP_REGISTRATION_ACCESS_CODE=
GEMINI_API_KEY=
AI_PROVIDER=gemini
```

Variaveis reservadas para etapas futuras:

```txt
HOTMART_WEBHOOK_SECRET=
HOTMART_PRODUCT_ID=8106727
NEXT_PUBLIC_SITE_URL=https://dpp-ivory.vercel.app
OPENAI_API_KEY=
```

## Cadastro do Produto Pronto

O MVP usa Supabase Auth diretamente. Na tela principal, o usuario abre o modal de primeiro acesso, informa o Codigo do Desafio, faz login automaticamente e recebe o limite padrao de 2 produtos.

Os fluxos de cadastro, recuperacao e nova senha usam modais sobre a mesma identidade visual do login. As rotas `/auth/register` e `/auth/set-password` permanecem como entradas tecnicas de compatibilidade e renderizam a mesma experiencia.

Configure em Supabase -> Authentication -> URL Configuration:

```txt
Site URL: https://dpp-ivory.vercel.app
Redirect URLs:
http://localhost:3000/**
https://dpp-ivory.vercel.app/**
https://*-<seu-time>.vercel.app/**
```

Se os previews da Vercel nao seguirem esse padrao, adicione as URLs de preview utilizadas explicitamente.

Configure um valor privado e dificil de adivinhar:

```txt
DPP_REGISTRATION_ACCESS_CODE=DPP2026
```

Essa variavel existe apenas no servidor. Nao use o prefixo `NEXT_PUBLIC_`.

A integracao Hotmart abaixo permanece no projeto, mas nao participa da autenticacao deste MVP.

## Hotmart -> Supabase

Endpoint preparado nesta etapa:

```txt
POST /api/webhooks/hotmart
URL de producao: https://dpp-ivory.vercel.app/api/webhooks/hotmart
```

Antes de ativar o webhook na Hotmart:

1. Execute no Supabase o SQL em `supabase/hotmart_integration.sql`.
2. Configure `HOTMART_WEBHOOK_SECRET` no ambiente local e na Vercel.
3. Configure `HOTMART_PRODUCT_ID=8106727`.
4. Configure `NEXT_PUBLIC_SITE_URL=https://dpp-ivory.vercel.app`.

A rota valida o header `X-HOTMART-HOTTOK`, aceita apenas o produto `8106727` e processa `PURCHASE_APPROVED`.

Eventos `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK` e `PURCHASE_CANCELED` ainda retornam como ignorados e ficam para a proxima etapa.

O link de primeiro acesso ja e gerado no backend com Supabase Admin, apontando para:

```txt
https://dpp-ivory.vercel.app/auth/set-password
```

O envio real de e-mail ainda nao foi integrado.

### Configuracao na Vercel

Quando o projeto for conectado na Vercel, cadastre as mesmas variaveis em:

```txt
Project Settings -> Environment Variables
```

Variaveis que precisam existir na Vercel:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DPP_REGISTRATION_ACCESS_CODE
GEMINI_API_KEY
AI_PROVIDER
HOTMART_WEBHOOK_SECRET
OPENAI_API_KEY
```

Obrigatorias para o funcionamento atual:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DPP_REGISTRATION_ACCESS_CODE
GEMINI_API_KEY
AI_PROVIDER
```

Para depois:

```txt
HOTMART_WEBHOOK_SECRET
OPENAI_API_KEY
```

### Conexao Vercel

Passos recomendados:

1. Importar o repositorio `https://github.com/Outono-mkt/DPP.git` na Vercel.
2. Selecionar o projeto `DPP`.
3. Confirmar framework `Next.js`.
4. Confirmar branch de producao `main`.
5. Cadastrar as variaveis de ambiente.
6. Fazer o primeiro deploy somente depois de revisar as variaveis.

### Supabase e GitHub

O Supabase nao precisa necessariamente ficar conectado ao GitHub para o app funcionar.

O essencial e:

- variaveis corretas no ambiente local;
- variaveis corretas na Vercel;
- Auth configurado no painel do Supabase;
- usuarios criados no Supabase Auth;
- URL de producao autorizada no Supabase depois que o deploy existir.

Depois do deploy, configure no Supabase a URL publica da Vercel em Authentication -> URL Configuration, incluindo Site URL e Redirect URLs quando necessario.

## Proximos passos

1. Configurar as variaveis reais do Supabase no ambiente.
2. Criar usuarios de teste no Supabase Auth.
3. Validar login real no navegador.
4. Criar futuramente o endpoint `/api/hotmart/webhook`.
5. Integrar a Hotmart para chamar `createPurchasedUser` apos compra aprovada.
6. Implementar persistencia de resultados quando o modelo de dados estiver definido.

