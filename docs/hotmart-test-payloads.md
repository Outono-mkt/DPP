# Hotmart webhook test payloads

Webhook local:

```txt
POST http://localhost:3000/api/webhooks/hotmart
Header: X-HOTMART-HOTTOK: valor-de-HOTMART_WEBHOOK_SECRET
```

## 1. PURCHASE_APPROVED valido

```json
{
  "event": "PURCHASE_APPROVED",
  "data": {
    "buyer": {
      "name": "Gabriel Silva",
      "email": "gabriel@example.com"
    },
    "product": {
      "id": 8106727,
      "name": "Desafio Produto Pronto"
    },
    "purchase": {
      "transaction": "HP1234567890",
      "approved_date": "2026-07-15T10:00:00Z",
      "offer": {
        "code": "OFERTA-37"
      }
    }
  }
}
```

## 2. Hottok incorreto

Use o payload valido com `X-HOTMART-HOTTOK` ausente ou diferente. Resultado esperado: HTTP 401.

## 3. Produto incorreto

```json
{
  "event": "PURCHASE_APPROVED",
  "data": {
    "buyer": {
      "name": "Cliente Teste",
      "email": "cliente@example.com"
    },
    "product": {
      "id": 9999999
    },
    "purchase": {
      "transaction": "HP-PRODUTO-ERRADO"
    }
  }
}
```

Resultado esperado:

```json
{ "ok": true, "ignored": true, "reason": "product_not_allowed" }
```

## 4. Compra duplicada

Envie duas vezes o payload valido com o mesmo `data.purchase.transaction`.

Resultado esperado na segunda chamada:

```json
{ "ok": true, "alreadyProcessed": true }
```

## 5. Usuario existente

Crie antes um usuario no Supabase Auth com o mesmo e-mail do payload valido. A rota deve reutilizar esse usuario e criar apenas o registro de acesso.

## 6. Usuario novo

Use um e-mail que ainda nao existe no Supabase Auth. A rota deve criar o usuario confirmado, criar `customer_access` e preparar o link de primeiro acesso sem enviar e-mail.
