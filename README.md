# Produto Pronto

Arquitetura inicial do projeto Produto Pronto.

Esta etapa prepara a base tecnica da aplicacao, sem implementar login, onboarding, IA real, Supabase real, Hotmart ou geracao de PDF.

## Stack escolhida

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Providers de IA preparados para Gemini agora e OpenAI futuramente.
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
  ai/
    gemini.ts
    index.ts
    openai.ts
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

## Proximos passos

1. Configurar as variaveis reais do Supabase no ambiente.
2. Criar usuarios de teste no Supabase Auth.
3. Validar login real no navegador.
4. Criar futuramente o endpoint `/api/hotmart/webhook`.
5. Integrar a Hotmart para chamar `createPurchasedUser` apos compra aprovada.
6. Implementar persistencia de resultados quando o modelo de dados estiver definido.
