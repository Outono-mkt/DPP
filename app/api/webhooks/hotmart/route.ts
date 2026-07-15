import { NextResponse } from "next/server";

import { processHotmartPurchaseApproved } from "@/lib/hotmart/process-event";
import { isAllowedProduct, validateHotmartPayload, validateHottok } from "@/lib/hotmart/validate";

export async function POST(request: Request) {
  const hottokValidation = validateHottok(request);

  if (!hottokValidation.ok) {
    logHotmartWebhook({
      stage: "hottok",
      result: "unauthorized",
      message: hottokValidation.message,
    });

    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: hottokValidation.status });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    logHotmartWebhook({
      stage: "payload",
      result: "invalid_json",
      message: getErrorMessage(error),
    });

    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const payloadValidation = validateHotmartPayload(payload);

  if (!payloadValidation.ok) {
    logHotmartWebhook({
      stage: "payload",
      result: "invalid_payload",
      message: payloadValidation.field,
    });

    return NextResponse.json(
      { ok: false, error: payloadValidation.message, field: payloadValidation.field },
      { status: payloadValidation.status },
    );
  }

  if (!isAllowedProduct(payloadValidation.productId)) {
    logHotmartWebhook({
      stage: "product",
      event: payloadValidation.event,
      productId: payloadValidation.productId,
      result: "ignored_product",
    });

    return NextResponse.json({ ok: true, ignored: true, reason: "product_not_allowed" });
  }

  if (payloadValidation.event !== "PURCHASE_APPROVED" || !payloadValidation.purchase) {
    logHotmartWebhook({
      stage: "event",
      event: payloadValidation.event,
      productId: payloadValidation.productId,
      result: "ignored_event",
    });

    return NextResponse.json({ ok: true, ignored: true, reason: "event_not_implemented" });
  }

  try {
    const result = await processHotmartPurchaseApproved(payloadValidation.purchase);

    logHotmartWebhook({
      stage: "process",
      event: payloadValidation.event,
      productId: payloadValidation.productId,
      transactionId: payloadValidation.purchase.transactionId,
      result: "alreadyProcessed" in result ? "already_processed" : "processed",
    });

    return NextResponse.json(result);
  } catch (error) {
    logHotmartWebhook({
      stage: "process",
      event: payloadValidation.event,
      productId: payloadValidation.productId,
      transactionId: payloadValidation.purchase.transactionId,
      result: "error",
      message: getErrorMessage(error),
    });

    return NextResponse.json({ ok: false, error: "hotmart_processing_failed" }, { status: 500 });
  }
}

function logHotmartWebhook({
  event,
  message,
  productId,
  result,
  stage,
  transactionId,
}: {
  event?: string;
  message?: string;
  productId?: string | null;
  result: string;
  stage: string;
  transactionId?: string;
}) {
  console.info("[hotmart-webhook]", {
    event,
    message,
    productId,
    result,
    stage,
    transactionId: transactionId ? maskTransactionId(transactionId) : undefined,
  });
}

function maskTransactionId(transactionId: string) {
  if (transactionId.length <= 8) {
    return "****";
  }

  return `${transactionId.slice(0, 4)}...${transactionId.slice(-4)}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
