# Produto Pronto

Arquitetura inicial do projeto Produto Pronto.

Esta etapa prepara a base tecnica da aplicacao, sem implementar login, onboarding, IA real, Supabase real, Hotmart ou geracao de PDF.

## Stack escolhida

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Providers de IA preparados para Gemini agora e OpenAI futuramente.
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
  ai/
    gemini.ts
    index.ts
    openai.ts
  hotmart/
    index.ts
  supabase/
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

## Proximos passos

1. Instalar dependencias do projeto.
2. Validar build e lint.
3. Criar a primeira versao visual do fluxo inicial.
4. Implementar onboarding local sem integracoes externas.
5. Integrar Gemini somente quando a chave real estiver configurada em ambiente seguro.
6. Conectar Supabase depois de definir o modelo de dados.
7. Criar futuramente o endpoint `/api/hotmart/webhook`.
